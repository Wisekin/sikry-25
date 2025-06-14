import { createClient } from "@/src/utils/supabase/client"
import type { SupabaseClient } from '@supabase/supabase-js'
const ORGANIZATION_TIERS: Record<string, { cache: { ttl: number; maxEntries: number; priority: number; } }> = {
    starter: {
        cache: { ttl: 3600, maxEntries: 1000, priority: 1 },
    },
    pro: {
        cache: { ttl: 10800, maxEntries: 5000, priority: 2 },
    },
    enterprise: {
        cache: { ttl: 43200, maxEntries: 20000, priority: 3 },
    },
};

export interface CacheStats {
    hits: number;
    misses: number;
    hitRatio: number;
    averageResponseTime: number;
}

export interface CacheEntry {
    cacheKey: string;
    cacheValue: unknown;
    cacheScope: string;
    ttlSeconds: number;
    accessCount: number;
    metadata?: Record<string, unknown>;
}

export class CacheManager {
    private supabase: SupabaseClient;
    private orgId: string;
    private orgPlan: string;

    constructor(orgId: string, orgPlan: string = 'starter') {
        this.supabase = createClient()
        this.orgId = orgId;
        this.orgPlan = orgPlan;
    }

    private getCacheConfig() {
        return ORGANIZATION_TIERS[this.orgPlan].cache;
    }

    async get<T>(key: string, scope: string): Promise<T | null> {
        const startTime = Date.now();

        // Query the cache
        const { data, error } = await this.supabase
            .from('api_cache')
            .select('cache_value, access_count')
            .eq('organization_id', this.orgId)
            .eq('cache_key', key)
            .eq('cache_scope', scope)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (error) {
            console.error('Cache read error:', error);
            return null;
        }

        if (!data) {
            // Record cache miss
            await this.recordMetric('cache_miss', {
                scope,
                responseTime: Date.now() - startTime
            });
            return null;
        }

        // Update access stats
        await this.supabase
            .from('api_cache')
            .update({
                access_count: data.access_count + 1,
                last_accessed_at: new Date().toISOString()
            })
            .eq('organization_id', this.orgId)
            .eq('cache_key', key);

        // Record cache hit
        await this.recordMetric('cache_hit', {
            scope,
            responseTime: Date.now() - startTime
        });

        return data.cache_value as T;
    }

    async set(entry: CacheEntry): Promise<void> {
        const config = this.getCacheConfig();
        const now = new Date();

        // Calculate expiration time
        const expiresAt = new Date(now.getTime() + entry.ttlSeconds * 1000);

        try {
            // First, count existing entries for this org
            const { count, error: countError } = await this.supabase
                .from('api_cache')
                .select('id', { count: 'exact' })
                .eq('organization_id', this.orgId);

            if (countError) throw countError;

            // Check if we've hit the entry limit
            if (count && count >= config.maxEntries) {
                // Delete oldest entries based on priority and last access
                await this.pruneCache();
            }

            // Insert new cache entry
            await this.supabase.from('api_cache').insert({
                organization_id: this.orgId,
                cache_key: entry.cacheKey,
                cache_value: entry.cacheValue,
                cache_scope: entry.cacheScope,
                ttl_seconds: entry.ttlSeconds,
                expires_at: expiresAt.toISOString(),
                metadata: entry.metadata || {}
            });
        } catch (error) {
            console.error('Cache write error:', error);
            throw error;
        }
    }

    async invalidate(scope?: string, pattern?: string): Promise<void> {
        try {
            let query = this.supabase
                .from('api_cache')
                .delete()
                .eq('organization_id', this.orgId);

            if (scope) {
                query = query.eq('cache_scope', scope);
            }

            if (pattern) {
                query = query.ilike('cache_key', `%${pattern}%`);
            }

            await query;
        } catch (error) {
            console.error('Cache invalidation error:', error);
            throw error;
        }
    }

    private async pruneCache(): Promise<void> {
        try {
            // Delete expired entries first
            await this.supabase
                .from('api_cache')
                .delete()
                .eq('organization_id', this.orgId)
                .lt('expires_at', new Date().toISOString());

            // If still over limit, remove oldest and least accessed entries
            const config = this.getCacheConfig();
            const { count } = await this.supabase
                .from('api_cache')
                .select('id', { count: 'exact' })
                .eq('organization_id', this.orgId);

            if (count && count >= config.maxEntries) {
                await this.supabase
                    .from('api_cache')
                    .delete()
                    .eq('organization_id', this.orgId)
                    .order('last_accessed_at', { ascending: true })
                    .limit(Math.ceil(config.maxEntries * 0.1)); // Remove oldest 10%
            }
        } catch (error) {
            console.error('Cache pruning error:', error);
            throw error;
        }
    }

    private async recordMetric(type: 'cache_hit' | 'cache_miss', data: {
        scope: string;
        responseTime: number;
    }): Promise<void> {
        try {
            await this.supabase.from('metrics').insert({
                organization_id: this.orgId,
                metric_name: type,
                metric_value: 1,
                metric_unit: 'count',
                tags: {
                    scope: data.scope,
                    response_time_ms: data.responseTime
                }
            });
        } catch (error) {
            console.error('Metric recording error:', error);
        }
    }

    async getStats(timeframe: '1h' | '24h' | '7d' = '24h'): Promise<CacheStats> {
        const now = new Date();
        const timeframes = {
            '1h': new Date(now.getTime() - 60 * 60 * 1000),
            '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
            '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };

        try {
            const { data, error } = await this.supabase
                .from('metrics')
                .select('*')
                .eq('organization_id', this.orgId)
                .in('metric_name', ['cache_hit', 'cache_miss'])
                .gte('created_at', timeframes[timeframe].toISOString());

            if (error) throw error;

            // Calculate stats
            const hits = data.filter(m => m.metric_name === 'cache_hit').length;
            const misses = data.filter(m => m.metric_name === 'cache_miss').length;
            const total = hits + misses;

            const avgResponseTime = data.reduce((sum, m) => {
                return sum + (m.tags?.response_time_ms || 0);
            }, 0) / (total || 1);

            return {
                hits,
                misses,
                hitRatio: total ? hits / total : 0,
                averageResponseTime: avgResponseTime
            };
        } catch (error) {
            console.error('Stats calculation error:', error);
            throw error;
        }
    }
}
