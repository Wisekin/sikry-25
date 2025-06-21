interface RedisConfig {
  url: string;
  ttl: {
    searchResults: number;
    searchMetadata: number;
  };
  enabled: boolean;
  prefix: string;
}

const isProduction = process.env.NODE_ENV === 'production';

const redisConfig: RedisConfig = {
  // Use REDIS_URL from environment variables or default to localhost
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Cache TTL in seconds
  ttl: {
    searchResults: 3600, // 1 hour for search results
    searchMetadata: 86400, // 24 hours for search metadata
  },
  
  // Enable/disable Redis (useful for local development)
  enabled: process.env.REDIS_ENABLED !== 'false',
  
  // Prefix for all Redis keys
  prefix: process.env.REDIS_PREFIX || 'sikry:',
};

// Validate Redis URL in production
if (isProduction && redisConfig.enabled && !process.env.REDIS_URL) {
  console.warn(
    'WARNING: REDIS_URL is not set in production. Using default localhost connection.'
  );
}

export default redisConfig;
