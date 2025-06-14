import { createClient } from '@/utils/supabase/client';

export interface CacheEntry {
  key: string;
  data: any;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
}

/**
 * Generates a cache key from a search query and its parameters
 */
function generateCacheKey(query: string, params: Record<string, any> = {}): string {
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
 * Check if there's a valid cache entry for the given query
 */
export async function checkCache(query: string, params: Record<string, any> = {}): Promise<CacheEntry | null> {
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

  return data;
}

/**
 * Store search results in the cache
 */
export async function storeInCache(
  query: string, 
  params: Record<string, any> = {}, 
  data: any, 
  expiryHours: number = 24
): Promise<void> {
  const supabase = createClient();
  const cacheKey = generateCacheKey(query, params);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiryHours);

  const { error } = await supabase
    .from('api_cache')
    .upsert({
      key: cacheKey,
      data,
      expires_at: expiresAt.toISOString()
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
