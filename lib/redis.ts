import { Redis } from 'ioredis';
import redisConfig from '@/lib/config/redis';

// Create a Redis client with connection handling
let client: Redis | null = null;
let isConnected = false;

// Initialize Redis client
function getRedisClient(): Redis | null {
  if (!redisConfig.enabled) {
    console.warn('Redis is disabled in config');
    return null;
  }

  if (!client) {
    try {
      client = new Redis(redisConfig.url, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 5000);
          return delay;
        },
        reconnectOnError: (err) => {
          console.error('Redis connection error:', err);
          return true; // Reconnect on error
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        keyPrefix: redisConfig.prefix,
      });

      client.on('connect', () => {
        console.log('Connected to Redis');
        isConnected = true;
      });

      client.on('error', (err) => {
        console.error('Redis error:', err);
        isConnected = false;
      });

      client.on('close', () => {
        console.log('Redis connection closed');
        isConnected = false;
      });
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      return null;
    }
  }
  
  return client;
}

// Cache interface
export interface CacheResult<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Set a value in Redis with TTL
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = redisConfig.ttl.searchResults
): Promise<boolean> {
  if (!redisConfig.enabled) return false;
  
  const client = getRedisClient();
  if (!client) return false;

  try {
    const cacheData: CacheResult<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };
    
    await client.set(
      key,
      JSON.stringify(cacheData),
      'EX',
      ttl
    );
    return true;
  } catch (error) {
    console.error('Error setting cache:', error);
    return false;
  }
}

// Get a value from Redis
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redisConfig.enabled) return null;
  
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get(key);
    if (!data) return null;
    
    const parsedData = JSON.parse(data) as CacheResult<T>;
    
    // Check if cache is expired
    const now = Date.now();
    if (now > parsedData.timestamp + parsedData.ttl * 1000) {
      await client.del(key);
      return null;
    }
    
    return parsedData.data;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
}

// Delete a key from Redis
export async function delCache(key: string): Promise<boolean> {
  if (!redisConfig.enabled) return false;
  
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting cache:', error);
    return false;
  }
}

// Generate a cache key from a prefix and parameters
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  // Sort keys to ensure consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        acc[key] = params[key];
      }
      return acc;
    }, {} as Record<string, any>);

  // Create a stable string representation
  const paramString = JSON.stringify(sortedParams);

  // Create a hash of the string for a shorter key
  let hash = 0;
  for (let i = 0; i < paramString.length; i++) {
    const char = paramString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `${prefix}:${Math.abs(hash).toString(16)}`;
}

// Close Redis connection (for cleanup)
export async function closeRedis(): Promise<void> {
  if (client) {
    try {
      await client.quit();
      isConnected = false;
      client = null;
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}

// Helper function to clear cache by prefix
export async function clearCacheByPrefix(prefix: string): Promise<boolean> {
  if (!redisConfig.enabled) return false;

  const client = getRedisClient();
  if (!client) return false;

  try {
    // Use SCAN to find and delete all keys matching the prefix
    const stream = client.scanStream({
      match: `${redisConfig.prefix}${prefix}:*`,
      count: 100
    });

    const keys: string[] = [];
    
    return new Promise((resolve) => {
      stream.on('data', (resultKeys: string[]) => {
        keys.push(...resultKeys);
      });
      
      stream.on('end', async () => {
        if (keys.length > 0) {
          // Remove the prefix from keys before deleting
          const prefixedKeys = keys.map(key => key.replace(redisConfig.prefix, ''));
          await client!.del(...prefixedKeys);
          console.log(`Cleared ${keys.length} search cache entries`);
        }
        resolve(true);
      });
      
      stream.on('error', (err: Error) => {
        console.error('Error clearing search cache:', err);
        resolve(false);
      });
    });
  } catch (error) {
    console.error('Error clearing search cache:', error);
    return false;
  }
}

export default {
  set: setCache,
  get: getCache,
  del: delCache,
  generateKey: generateCacheKey,
  clearByPrefix: clearCacheByPrefix, // Added this
  close: closeRedis,
  clearSearchCache, // Kept for specific search cache clearing if needed elsewhere
  isConnected: () => isConnected,
  isEnabled: () => redisConfig.enabled,
};
