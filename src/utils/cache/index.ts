import { createClient } from '@/src/utils/supabase/client';
import { cacheMonitoring } from './monitoring';
import type { SearchScope } from '@/src/types/api';

export interface CacheEntry {
  key: string;
  data: any;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
  metadata?: {
    scope: keyof SearchScope;
    filters?: Record<string, any>;
    dependencies?: string[];
  };
}

const DEFAULT_EXPIRY_HOURS = 24;

/**
 * Generate a deterministic cache key from a query and parameters
 */
export function generateCacheKey(query: string, params: Record<string, any> = {}): string {
  const normalizedQuery = query.toLowerCase().trim();
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  
  return `search:${normalizedQuery}:${JSON.stringify(sortedParams)}`;
}

/**
 * Check for a valid cache entry and record metrics
 */
export async function checkCache(
  query: string, 
  params: Record<string, any> = {}
): Promise<CacheEntry | null> {
  const startTime = Date.now();
  const supabase = createClient();
  const cacheKey = generateCacheKey(query, params);

  const { data, error } = await supabase
    .from('api_cache')
    .select('*')
    .eq('key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error('Error checking cache:', error);
    return null;
  }

  const responseTime = Date.now() - startTime;
  const scope = params.scope || 'companies';

  if (data) {
    await cacheMonitoring.recordCacheHit(scope, responseTime);
  } else {
    await cacheMonitoring.recordCacheMiss(scope, responseTime);
  }

  return data;
}

/**
 * Store search results in cache with metadata
 */
export async function storeInCache(
  query: string, 
  params: Record<string, any> = {}, 
  data: any, 
  expiryHours: number = DEFAULT_EXPIRY_HOURS
): Promise<void> {
  const supabase = createClient();
  const cacheKey = generateCacheKey(query, params);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  // Store cache entry with metadata
  const { error } = await supabase
    .from('api_cache')
    .upsert({
      key: cacheKey,
      data,
      expires_at: expiresAt.toISOString(),
      metadata: {
        scope: params.scope || 'companies',
        filters: params.filters,
        dependencies: generateDependencies(params)
      }
    });

  if (error) {
    console.error('Error storing in cache:', error);
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc('clean_expired_cache');
  
  if (error) {
    console.error('Error clearing expired cache:', error);
  }
}

/**
 * Invalidate cache entries by scope and/or filters
 */
export async function invalidateCache(params: {
  scope?: keyof SearchScope;
  filters?: Record<string, any>;
  query?: string;
}): Promise<void> {
  const supabase = createClient();
  let query = supabase.from('api_cache');

  if (params.scope) {
    query = query.eq('metadata->scope', params.scope);
  }

  if (params.query) {
    query = query.ilike('key', `%${params.query}%`);
  }

  if (params.filters) {
    // Invalidate entries that match any of the filter criteria
    Object.entries(params.filters).forEach(([key, value]) => {
      query = query.or(`metadata->filters->>${key}.eq.${value}`);
    });
  }

  const { error } = await query.delete();

  if (error) {
    console.error('Error invalidating cache:', error);
  }
}

/**
 * Generate cache dependencies based on query parameters
 */
function generateDependencies(params: Record<string, any>): string[] {
  const deps = new Set<string>();

  if (params.scope) {
    deps.add(`scope:${params.scope}`);
  }

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      deps.add(`filter:${key}:${value}`);
    });
  }

  return Array.from(deps);
}

/**
 * Invalidate cache entries by dependency
 */
export async function invalidateByDependency(dependency: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('api_cache')
    .delete()
    .contains('metadata->dependencies', [dependency]);

  if (error) {
    console.error('Error invalidating cache by dependency:', error);
  }
}
