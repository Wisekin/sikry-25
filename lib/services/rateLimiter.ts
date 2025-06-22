import { createClient } from '@/src/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';
import Redis from 'ioredis';

interface RateLimitParams {
  userId: string;
  action: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
}

interface UsageRecord {
  userId: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class RateLimiterService {
  private supabase = createClient();
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnCluster: 100,
      maxRetriesPerRequest: 3
    });
  }

  async checkLimit(params: RateLimitParams): Promise<boolean> {
    try {
      const key = `rate_limit:${params.userId}:${params.action}`;
      const now = Date.now();
      const windowStart = now - params.windowMs;

      // Use Redis sorted set to track requests in time window
      const pipeline = this.redis.pipeline();
      
      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current entries
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(params.windowMs / 1000));
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis pipeline failed');
      }

      const currentCount = results[1][1] as number;
      
      const allowed = currentCount < params.limit;
      
      if (!allowed) {
        // Remove the request we just added since it's not allowed
        await this.redis.zrem(key, `${now}-${Math.random()}`);
      }

      Logger.logInfo('Rate limit check', {
        userId: params.userId,
        action: params.action,
        currentCount,
        limit: params.limit,
        allowed
      });

      return allowed;

    } catch (error) {
      Logger.logError('Rate limit check failed', error as Error, {
        userId: params.userId,
        action: params.action,
        category: 'security'
      });
      
      // Fail open - allow the request if rate limiting fails
      return true;
    }
  }

  async getRateLimitStatus(params: {
    userId: string;
    action: string;
    windowMs: number;
    limit: number;
  }): Promise<RateLimitResult> {
    try {
      const key = `rate_limit:${params.userId}:${params.action}`;
      const now = Date.now();
      const windowStart = now - params.windowMs;

      // Clean old entries and get current count
      await this.redis.zremrangebyscore(key, 0, windowStart);
      const currentCount = await this.redis.zcard(key);
      
      // Get the oldest entry to calculate reset time
      const oldestEntries = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldestEntries.length > 0 
        ? parseInt(oldestEntries[1]) + params.windowMs
        : now + params.windowMs;

      return {
        allowed: currentCount < params.limit,
        remaining: Math.max(0, params.limit - currentCount),
        resetTime,
        totalHits: currentCount
      };

    } catch (error) {
      Logger.logError('Get rate limit status failed', error as Error, {
        userId: params.userId,
        action: params.action,
        category: 'security'
      });
      
      return {
        allowed: true,
        remaining: params.limit,
        resetTime: Date.now() + params.windowMs,
        totalHits: 0
      };
    }
  }

  async recordUsage(params: {
    userId: string;
    action: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const usageRecord: UsageRecord = {
        userId: params.userId,
        action: params.action,
        timestamp: new Date().toISOString(),
        metadata: params.metadata
      };

      // Store in database for analytics
      const { error } = await this.supabase
        .from('rate_limit_usage')
        .insert({
          user_id: usageRecord.userId,
          action: usageRecord.action,
          timestamp: usageRecord.timestamp,
          metadata: usageRecord.metadata
        });

      if (error) {
        Logger.logError('Failed to record usage in database', error, {
          userId: params.userId,
          action: params.action,
          category: 'security'
        });
      }

    } catch (error) {
      Logger.logError('Record usage failed', error as Error, {
        userId: params.userId,
        action: params.action,
        category: 'security'
      });
    }
  }

  async getUserUsageStats(params: {
    userId: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalRequests: number;
    requestsByAction: Record<string, number>;
    requestsByDay: Record<string, number>;
  }> {
    try {
      let query = this.supabase
        .from('rate_limit_usage')
        .select('action, timestamp')
        .eq('user_id', params.userId);

      if (params.action) {
        query = query.eq('action', params.action);
      }

      if (params.startDate) {
        query = query.gte('timestamp', params.startDate);
      }

      if (params.endDate) {
        query = query.lte('timestamp', params.endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        throw new Error(`Failed to get usage stats: ${error.message}`);
      }

      const requestsByAction: Record<string, number> = {};
      const requestsByDay: Record<string, number> = {};

      (data || []).forEach(record => {
        // Count by action
        requestsByAction[record.action] = (requestsByAction[record.action] || 0) + 1;
        
        // Count by day
        const day = record.timestamp.split('T')[0];
        requestsByDay[day] = (requestsByDay[day] || 0) + 1;
      });

      return {
        totalRequests: data?.length || 0,
        requestsByAction,
        requestsByDay
      };

    } catch (error) {
      Logger.logError('Get usage stats failed', error as Error, {
        userId: params.userId,
        category: 'security'
      });
      
      return {
        totalRequests: 0,
        requestsByAction: {},
        requestsByDay: {}
      };
    }
  }

  async resetUserLimits(params: {
    userId: string;
    action?: string;
  }): Promise<void> {
    try {
      if (params.action) {
        const key = `rate_limit:${params.userId}:${params.action}`;
        await this.redis.del(key);
      } else {
        // Reset all limits for user
        const pattern = `rate_limit:${params.userId}:*`;
        const keys = await this.redis.keys(pattern);
        
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      Logger.logInfo('User rate limits reset', {
        userId: params.userId,
        action: params.action || 'all'
      });

    } catch (error) {
      Logger.logError('Reset user limits failed', error as Error, {
        userId: params.userId,
        category: 'security'
      });
      throw error;
    }
  }

  async getGlobalStats(params: {
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalRequests: number;
    uniqueUsers: number;
    topActions: Array<{ action: string; count: number }>;
    requestsOverTime: Record<string, number>;
  }> {
    try {
      let query = this.supabase
        .from('rate_limit_usage')
        .select('user_id, action, timestamp');

      if (params.action) {
        query = query.eq('action', params.action);
      }

      if (params.startDate) {
        query = query.gte('timestamp', params.startDate);
      }

      if (params.endDate) {
        query = query.lte('timestamp', params.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get global stats: ${error.message}`);
      }

      const uniqueUsers = new Set((data || []).map(record => record.user_id)).size;
      const actionCounts: Record<string, number> = {};
      const requestsOverTime: Record<string, number> = {};

      (data || []).forEach(record => {
        actionCounts[record.action] = (actionCounts[record.action] || 0) + 1;
        
        const hour = record.timestamp.substring(0, 13); // YYYY-MM-DDTHH
        requestsOverTime[hour] = (requestsOverTime[hour] || 0) + 1;
      });

      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalRequests: data?.length || 0,
        uniqueUsers,
        topActions,
        requestsOverTime
      };

    } catch (error) {
      Logger.logError('Get global stats failed', error as Error, {
        category: 'security'
      });
      
      return {
        totalRequests: 0,
        uniqueUsers: 0,
        topActions: [],
        requestsOverTime: {}
      };
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      Logger.logError('Redis cleanup failed', error as Error, {
        category: 'security'
      });
    }
  }
}