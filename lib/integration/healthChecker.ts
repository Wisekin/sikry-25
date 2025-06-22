import redis from '@/lib/redis';

export class HealthChecker {
  async check(): Promise<{ status: 'ok' | 'error'; details: Record<string, any> }> {
    const details: Record<string, any> = {};
    let isHealthy = true;

    try {
      await redis.ping();
      details.redis = 'ok';
    } catch (error: any) {
      details.redis = error.message;
      isHealthy = false;
    }

    // Add checks for other services (e.g., database, external APIs)

    return {
      status: isHealthy ? 'ok' : 'error',
      details,
    };
  }
}