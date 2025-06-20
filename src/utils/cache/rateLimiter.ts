import { createClient } from "@/src/utils/supabase/server"
import type { NextRequest } from "next/server"
import type { SupabaseClient } from '@supabase/supabase-js'
type RateLimitTier = {
  maxRequests: number;
  windowMs: number;
  burst?: number;
};

interface CacheConfig {
  ttl: number;      // Cache TTL in seconds
  maxEntries: number; // Maximum cache entries per organization
  priority: number;  // Cache priority (higher = kept longer)
}

// Organization tier configuration
export const ORGANIZATION_TIERS: Record<string, {
  rateLimit: RateLimitTier;
  cache: CacheConfig;
}> = {
  starter: {
    rateLimit: {
      maxRequests: 100,  // 100 requests per window
      windowMs: 15 * 60 * 1000, // 15 minutes
      burst: 20,        // Allow burst of 20 requests
    },
    cache: {
      ttl: 60 * 60,    // 1 hour
      maxEntries: 1000,
      priority: 1,
    }
  },
  pro: {
    rateLimit: {
      maxRequests: 500,
      windowMs: 15 * 60 * 1000,
      burst: 50,
    },
    cache: {
      ttl: 3 * 60 * 60, // 3 hours
      maxEntries: 5000,
      priority: 2,
    }
  },
  enterprise: {
    rateLimit: {
      maxRequests: 2000,
      windowMs: 15 * 60 * 1000,
      burst: 200,
    },
    cache: {
      ttl: 12 * 60 * 60, // 12 hours
      maxEntries: 20000,
      priority: 3,
    }
  },
};

export class DbRateLimiter {
  private supabase: SupabaseClient
  private cleanupInterval: number = 15 * 60 * 1000 // 15 minutes

  constructor() {
    this.supabase = createClient()
    this.startCleanupJob()
  }

  private startCleanupJob() {
    setInterval(() => this.cleanup(), this.cleanupInterval)
  }

  private async getUserAndOrganization(req: NextRequest): Promise<{
    userId: string;
    organizationId: string;
    plan: string;
  } | null> {
    // Prioritize headers for test environments or API key usage
    const testUserId = req.headers.get('x-user-id');
    const testOrgId = req.headers.get('x-organization-id');
    const testPlan = req.headers.get('x-user-plan');

    if (testUserId && testOrgId && testPlan) {
      return {
        userId: testUserId,
        organizationId: testOrgId,
        plan: testPlan,
      };
    }

    // Fallback to production logic for UI sessions
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await this.supabase
      .from('team_members')
      .select('organization_id, organizations(plan)')
      .eq('user_id', user.id)
      .single();

    if (!member || !member.organization_id) return null;

    return {
      userId: user.id,
      organizationId: member.organization_id,
      plan: member.organizations?.[0]?.plan || 'starter',
    };
  }

  async isAllowed(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    status: number;
    message?: string;
    cacheConfig?: CacheConfig;
    userId?: string;
    organizationId?: string;
    plan?: string;
  }> {
    try {
      const userOrg = await this.getUserAndOrganization(req)

      if (!userOrg) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now(),
          status: 401,
          message: "Unauthorized"
        }
      }

      const config = ORGANIZATION_TIERS[userOrg.plan]
      const key = `ratelimit:search:${userOrg.organizationId}`
      const now = Date.now()

      // Get current rate limit record
      const { data: rateLimit } = await this.supabase
        .from('rate_limits')
        .select()
        .eq('key', key)
        .single()

      if (!rateLimit) {
        // First request for this organization
        await this.supabase
          .from('rate_limits')
          .insert({
            key,
            count: 1,
            reset_at: new Date(now + config.rateLimit.windowMs).toISOString(),
            organization_id: userOrg.organizationId
          })

        return {
          allowed: true,
          remaining: config.rateLimit.maxRequests - 1,
          resetTime: now + config.rateLimit.windowMs,
          status: 200,
          cacheConfig: config.cache,
          userId: userOrg.userId,
          organizationId: userOrg.organizationId,
          plan: userOrg.plan
        }
      }

      const resetTime = new Date(rateLimit.reset_at).getTime()

      // If the window has expired, reset the counter
      if (now > resetTime) {
        await this.supabase
          .from('rate_limits')
          .update({
            count: 1,
            reset_at: new Date(now + config.rateLimit.windowMs).toISOString()
          })
          .eq('key', key)

        return {
          allowed: true,
          remaining: config.rateLimit.maxRequests - 1,
          resetTime: now + config.rateLimit.windowMs,
          status: 200,
          cacheConfig: config.cache,
          userId: userOrg.userId,
          organizationId: userOrg.organizationId,
          plan: userOrg.plan
        }
      }

      // Check if rate limit exceeded
      if (rateLimit.count >= config.rateLimit.maxRequests) {
        // Allow burst requests with a warning
        if (config.rateLimit.burst && rateLimit.count < config.rateLimit.maxRequests + config.rateLimit.burst) {
          await this.supabase
            .from('rate_limits')
            .update({ count: rateLimit.count + 1 })
            .eq('key', key)

          return {
            allowed: true,
            remaining: config.rateLimit.maxRequests + config.rateLimit.burst - rateLimit.count - 1,
            resetTime,
            status: 200,
            message: `Rate limit exceeded but allowed within burst limit. ${resetTime - now}ms until reset.`,
            cacheConfig: config.cache,
            userId: userOrg.userId,
            organizationId: userOrg.organizationId,
            plan: userOrg.plan
          }
        }

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          status: 429,
          message: `Rate limit exceeded. Please try again in ${Math.ceil((resetTime - now) / 1000)} seconds.`
        }
      }

      // Increment counter
      await this.supabase
        .from('rate_limits')
        .update({ count: rateLimit.count + 1 })
        .eq('key', key)

      return {
        allowed: true,
        remaining: config.rateLimit.maxRequests - rateLimit.count - 1,
        resetTime,
        status: 200,
        cacheConfig: config.cache
      }

    } catch (error) {
      console.error('Rate limit error:', error)
      return {
        allowed: true, // Fail open
        remaining: 1,
        resetTime: Date.now() + 60000,
        status: 200,
        message: 'Rate limit check failed, allowing request'
      }
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.supabase
        .from('rate_limits')
        .delete()
        .lt('reset_at', new Date().toISOString())
    } catch (error) {
      console.error('Rate limit cleanup error:', error)
    }
  }
}

