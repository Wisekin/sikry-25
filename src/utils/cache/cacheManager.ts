import { createClient } from "@/src/utils/supabase/server"
import type { SupabaseClient } from '@supabase/supabase-js'

// This interface is simplified to match the actual cache usage.
export interface CacheEntry {
    cacheKey: string;
    data: unknown;
    ttlSeconds: number;
    metadata?: Record<string, unknown>;
}

export interface CacheStats {
    hits: number;
    misses: number;
    hitRatio: number;
    averageResponseTime: number;
}

export class CacheManager {
    private supabase: SupabaseClient;
    private orgId: string;

    constructor(orgId: string, orgPlan: string = 'starter') {
        this.supabase = createClient()
        this.orgId = orgId;
        // orgPlan is no longer used but kept for compatibility with the call site.
    }

    /**
     * Retrieves an item from the cache.
     * @param key The cache key.
     * @returns The cached item or null if not found or expired.
     */
    async get<T>(key: string): Promise<T | null> {
        const compositeKey = `${this.orgId}:${key}`;
        try {
            const { data, error } = await this.supabase
                .from('api_cache')
                .select('data')
                .eq('key', compositeKey)
                .gt('expires_at', new Date().toISOString())
                .single();

            if (error || !data) {
                // PGRST116 is Supabase code for "single row not found", which is a cache miss.
                // We don't log this as an error.
                if (error && error.code !== 'PGRST116') {
                    console.error('Cache read error:', { code: error.code, message: error.message });
                }
                return null;
            }

            return data.data as T;
        } catch (err) {
            console.error('Unexpected cache read error:', err);
            return null;
        }
    }

    /**
     * Adds or updates an item in the cache.
     * @param entry The cache entry to set.
     */
    async set(entry: CacheEntry): Promise<void> {
        const compositeKey = `${this.orgId}:${entry.cacheKey}`;
        const expiresAt = new Date(new Date().getTime() + entry.ttlSeconds * 1000);

        try {
            const { error } = await this.supabase.from('api_cache').upsert({
                key: compositeKey,
                data: entry.data,
                expires_at: expiresAt.toISOString(),
                metadata: entry.metadata || {}
            });

            if (error) {
                console.error('Cache write error:', { code: error.code, message: error.message });
            }
        } catch (err) {
            console.error('Unexpected cache write error:', err);
        }
    }

    /**
     * Invalidates cache entries matching a pattern.
     * @param pattern The pattern to match against cache keys.
     */
    async invalidate(pattern: string): Promise<void> {
        try {
            // Invalidate keys for the current organization that match the pattern.
            const keyPattern = `${this.orgId}:${pattern}`;
            const { error } = await this.supabase
                .from('api_cache')
                .delete()
                .like('key', `${keyPattern}%`);

            if (error) {
                console.error('Cache invalidation error:', { code: error.code, message: error.message });
            }
        } catch (err) {
            console.error('Unexpected cache invalidation error:', err);
        }
    }

    // The following methods are stubs as the current schema doesn't support them.
    private async pruneCache(): Promise<void> {
        // This logic is removed as it depends on columns not present in the schema.
        return;
    }

    private async recordMetric(): Promise<void> {
        // This logic is removed as it depends on a separate metrics table.
        return;
    }

    async getStats(): Promise<CacheStats> {
        // This logic is removed as it depends on the metrics table.
        return {
            hits: 0,
            misses: 0,
            hitRatio: 0,
            averageResponseTime: 0,
        };
    }
}
