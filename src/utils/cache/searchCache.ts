import { createClient } from "@/utils/supabase/server"
import type { SearchResponse } from "@/types/search"

interface SearchCacheKey {
  query: string
  sources: string[]
  filters?: Record<string, any>
  page?: number
  limit?: number
  organization?: string
  timestamp: string
}

interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  avgResponseTime: number
}

const CACHE_TTL = 60 * 60 // 1 hour in seconds
const METRICS_WINDOW = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// In-memory metrics for performance
let metrics: {
  hits: number
  misses: number
  timings: number[]
  lastReset: number
} = {
  hits: 0,
  misses: 0,
  timings: [],
  lastReset: Date.now()
}

export async function getCachedSearchResults(
  query: string, 
  sources: string[],
  options: {
    filters?: Record<string, any>
    page?: number
    limit?: number
    organization?: string
  } = {}
): Promise<{ data: SearchResponse | null; metrics: CacheMetrics }> {
  const startTime = Date.now()
  const supabase = createClient()
  const cacheKey = generateCacheKey(query, sources, options)

  try {
    const { data: cache } = await supabase
      .from("api_cache")
      .select("data, expires_at")
      .eq("key", cacheKey)
      .single()

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Update metrics
    if (cache && new Date(cache.expires_at) > new Date()) {
      metrics.hits++
      metrics.timings.push(responseTime)
      return { 
        data: cache.data as SearchResponse,
        metrics: calculateMetrics() 
      }
    }

    metrics.misses++
    metrics.timings.push(responseTime)
    return { 
      data: null,
      metrics: calculateMetrics() 
    }
    
  } catch (error) {
    console.error('Cache retrieval error:', error)
    return {
      data: null,
      metrics: calculateMetrics()
    }
  }
}

export async function cacheSearchResults(
  query: string, 
  sources: string[], 
  results: SearchResponse,
  options: {
    filters?: Record<string, any>
    page?: number
    limit?: number
    organization?: string
    ttl?: number
  } = {}
): Promise<void> {
  const supabase = createClient()
  const cacheKey = generateCacheKey(query, sources, options)
  const ttl = options.ttl || CACHE_TTL
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString()

  try {
    await supabase
      .from("api_cache")
      .upsert({
        key: cacheKey,
        data: results,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
        metadata: {
          organization: options.organization,
          filters: options.filters,
          sources
        }
      })
  } catch (error) {
    console.error('Cache storage error:', error)
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const supabase = createClient()
  try {
    await supabase
      .from("api_cache")
      .delete()
      .like('key', `%${pattern}%`)
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

function generateCacheKey(
  query: string, 
  sources: string[], 
  options: {
    filters?: Record<string, any>
    page?: number
    limit?: number
    organization?: string
  } = {}
): string {
  const key: SearchCacheKey = {
    query: query.toLowerCase().trim(),
    sources: sources.sort(),
    filters: options.filters,
    page: options.page,
    limit: options.limit,
    organization: options.organization,
    timestamp: new Date().toISOString().split("T")[0] // Cache key changes daily
  }
  return `search:${Buffer.from(JSON.stringify(key)).toString('base64')}`
}

function calculateMetrics(): CacheMetrics {
  // Reset metrics if too old
  if (Date.now() - metrics.lastReset > METRICS_WINDOW) {
    metrics = {
      hits: 0,
      misses: 0,
      timings: [],
      lastReset: Date.now()
    }
  }

  const total = metrics.hits + metrics.misses
  const hitRate = total > 0 ? metrics.hits / total : 0
  const avgResponseTime = metrics.timings.length > 0
    ? metrics.timings.reduce((a, b) => a + b, 0) / metrics.timings.length
    : 0

  return {
    hits: metrics.hits,
    misses: metrics.misses,
    hitRate,
    avgResponseTime
  }
}
