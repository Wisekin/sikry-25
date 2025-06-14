import { createClient } from '@/utils/supabase/server'

interface CacheEntry {
  data: any
  timestamp: number
}

export class APIRateLimiter {
  private static cache = new Map<string, CacheEntry>()
  private static rateLimits = new Map<string, number>()
  private static CACHE_TTL = 3600000 // 1 hour in milliseconds

  static async checkCache(key: string): Promise<any | null> {
    const entry = this.cache.get(key)
    if (entry && (Date.now() - entry.timestamp) < this.CACHE_TTL) {
      return entry.data
    }
    return null
  }

  static async setCache(key: string, data: any): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })

    // Also store in Supabase for persistence
    try {
      const supabase = await createClient()
      await supabase.from('api_cache').upsert({
        key,
        data,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to persist cache:', error)
    }
  }

  static async checkRateLimit(api: string): Promise<boolean> {
    const lastCall = this.rateLimits.get(api) || 0
    const now = Date.now()

    // Rate limits per API (in milliseconds)
    const limits: { [key: string]: number } = {
      openai: 1000, // 1 request per second
      google: 100,  // 10 requests per second
      linkedin: 1000 // 1 request per second
    }

    if (now - lastCall < (limits[api] || 1000)) {
      return false
    }

    this.rateLimits.set(api, now)
    return true
  }

  static async waitForRateLimit(api: string): Promise<void> {
    while (!(await this.checkRateLimit(api))) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}
