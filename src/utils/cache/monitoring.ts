import { createClient } from '@/utils/supabase/client';
import type { SearchScope } from '@/types/api';

export interface CacheMetrics {
  hits: number;
  misses: number;
  total: number;
  hitRate: number;
  avgResponseTime: number;
  byScope: Record<keyof SearchScope, {
    hits: number;
    misses: number;
    hitRate: number;
  }>;
}

class CacheMonitoring {
  private client = createClient();
  private metricsTableName = 'search_metrics';

  async recordCacheHit(scope: keyof SearchScope, responseTime: number): Promise<void> {
    await this.recordMetric('hit', scope, responseTime);
  }

  async recordCacheMiss(scope: keyof SearchScope, responseTime: number): Promise<void> {
    await this.recordMetric('miss', scope, responseTime);
  }

  private async recordMetric(
    type: 'hit' | 'miss',
    scope: keyof SearchScope,
    responseTime: number
  ): Promise<void> {
    try {
      await this.client.from(this.metricsTableName).insert({
        type,
        scope,
        response_time: responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error recording cache metric:', error);
    }
  }

  async getMetrics(timeframe: '1h' | '24h' | '7d' = '24h'): Promise<CacheMetrics> {
    const query = `
      WITH metrics AS (
        SELECT 
          type,
          scope,
          COUNT(*) as count,
          AVG(response_time) as avg_time
        FROM ${this.metricsTableName}
        WHERE timestamp > NOW() - interval '${timeframe}'
        GROUP BY type, scope
      )
      SELECT
        SUM(CASE WHEN type = 'hit' THEN count ELSE 0 END) as hits,
        SUM(CASE WHEN type = 'miss' THEN count ELSE 0 END) as misses,
        AVG(avg_time) as avg_response_time,
        jsonb_object_agg(
          scope,
          jsonb_build_object(
            'hits', SUM(CASE WHEN type = 'hit' THEN count ELSE 0 END),
            'misses', SUM(CASE WHEN type = 'miss' THEN count ELSE 0 END)
          )
        ) as by_scope
      FROM metrics;
    `;

    const { data, error } = await this.client.rpc('get_cache_metrics', { timeframe });

    if (error) {
      console.error('Error getting cache metrics:', error);
      return this.getDefaultMetrics();
    }

    const metrics = data[0];
    const total = metrics.hits + metrics.misses;
    const hitRate = total > 0 ? metrics.hits / total : 0;

    const byScope = Object.entries(metrics.by_scope).reduce((acc, [scope, stats]: [string, any]) => {
      const scopeTotal = stats.hits + stats.misses;
      acc[scope as keyof SearchScope] = {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: scopeTotal > 0 ? stats.hits / scopeTotal : 0
      };
      return acc;
    }, {} as CacheMetrics['byScope']);

    return {
      hits: metrics.hits,
      misses: metrics.misses,
      total,
      hitRate,
      avgResponseTime: metrics.avg_response_time,
      byScope
    };
  }

  private getDefaultMetrics(): CacheMetrics {
    return {
      hits: 0,
      misses: 0,
      total: 0,
      hitRate: 0,
      avgResponseTime: 0,
      byScope: {
        companies: { hits: 0, misses: 0, hitRate: 0 },
        contacts: { hits: 0, misses: 0, hitRate: 0 },
        news: { hits: 0, misses: 0, hitRate: 0 },
        social: { hits: 0, misses: 0, hitRate: 0 },
        patents: { hits: 0, misses: 0, hitRate: 0 },
        jobs: { hits: 0, misses: 0, hitRate: 0 }
      }
    };
  }
}

export const cacheMonitoring = new CacheMonitoring();
