import redis from '@/lib/redis';

export class CacheManager {
  async get<T>(key: string): Promise<T | null> {
    // redis.get (imported from lib/redis.ts as getCache) already returns the parsed data or null
    return await redis.get(key);
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // redis.set (imported from lib/redis.ts as setCache) handles JSON.stringify internally
    // and expects the value directly, and returns a boolean.
    // This CacheManager class doesn't return the boolean, so we'll just await.
    await redis.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await redis.del(key);
  }
}