-- Migration: Add API Cache and Rate Limiting Tables
-- Description: Adds tables for API caching, rate limiting, and enhanced search history
-- Date: 2025-06-07

-- Create API cache table
CREATE TABLE IF NOT EXISTS api_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour')
);

-- Create index for faster expiration checks
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on rate limit key
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- Update search history table with new columns
ALTER TABLE search_history 
ADD COLUMN IF NOT EXISTS sources TEXT[] DEFAULT ARRAY['internal'],
ADD COLUMN IF NOT EXISTS execution_time INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Enable RLS on new tables
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_cache
-- Drop existing policies for api_cache
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON api_cache;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON api_cache;

-- Drop existing policies for rate_limits
DROP POLICY IF EXISTS "Allow read access to own rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Allow write access to own rate limits" ON rate_limits;

-- Create new policies for api_cache
CREATE POLICY "Allow read access to authenticated users"
  ON api_cache FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow write access to authenticated users"
  ON api_cache FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create new policies for rate_limits
CREATE POLICY "Allow read access to own rate limits"
  ON rate_limits FOR SELECT TO authenticated
  USING (key LIKE auth.uid() || ':%');

CREATE POLICY "Allow write access to own rate limits"
  ON rate_limits FOR ALL TO authenticated
  USING (key LIKE auth.uid() || ':%')
  WITH CHECK (key LIKE auth.uid() || ':%'); 

-- Helper Functions
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < CURRENT_TIMESTAMP;
  DELETE FROM rate_limits WHERE reset_at < CURRENT_TIMESTAMP;
END;
$$;

CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_key TEXT,
  p_window_seconds INTEGER,
  p_limit INTEGER
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get or create rate limit record
  INSERT INTO rate_limits (key, count, reset_at)
  VALUES (
    p_key,
    1,
    CURRENT_TIMESTAMP + (p_window_seconds || ' seconds')::interval
  )
  ON CONFLICT (key) DO UPDATE
  SET 
    count = rate_limits.count + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    rate_limits.reset_at > CURRENT_TIMESTAMP
  RETURNING count, reset_at INTO v_count, v_reset_at;

  -- If we've exceeded the limit, return false
  IF v_count > p_limit THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;
