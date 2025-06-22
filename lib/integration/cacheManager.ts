import redis from '@/lib/redis';

const STALE_TTL_SECONDS = 60 * 60 * 24; // 1 day
const REVALIDATE_TTL_SECONDS = 60 * 5; // 5 minutes

export class CacheManager {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        const cacheValue = {
      data: value,
      staleAt: Date.now() + ttlSeconds * 1000,
    };
    await redis.set(key, JSON.stringify(cacheValue), 'EX', STALE_TTL_SECONDS);
  }

  async del(key: string): Promise<void> {
    await redis.del(key);
  }
}