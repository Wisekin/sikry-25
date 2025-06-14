import type { NextRequest } from "next/server"

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (req: NextRequest) => string
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()

  constructor(private config: RateLimitConfig) {}

  async isAllowed(req: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(req) : this.getDefaultKey(req)
    const now = Date.now()

    // Clean up expired entries
    this.cleanup(now)

    const record = this.requests.get(key)

    if (!record) {
      // First request from this key
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      }
    }

    if (now > record.resetTime) {
      // Window has expired, reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      }
    }

    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      }
    }

    // Increment count
    record.count++
    this.requests.set(key, record)

    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    }
  }

  private getDefaultKey(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : req.ip || "unknown"
    return ip
  }

  private cleanup(now: number) {
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// Rate limiter instances
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
})

export const scraperRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
})
