-- Migration: Add API Cache, Rate Limiting, and Search History enhancements
-- Date: 2024-07-29

-- Create API cache table (incorporates metadata from 014)
CREATE TABLE IF NOT EXISTS api_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Added from 014
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour')
);

-- Create index for faster expiration checks
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON api_cache(key); -- Added for completeness

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

-- Ensure search_history table exists before altering (it's created in schema.sql)
-- Update search_history table with new columns
ALTER TABLE search_history
ADD COLUMN IF NOT EXISTS sources TEXT[] DEFAULT ARRAY['internal'],
ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Enable RLS on new tables
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- search_history RLS is handled by schema.sql.

-- RLS Policies for api_cache
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON api_cache;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON api_cache;

CREATE POLICY "Allow read access to authenticated users"
  ON api_cache FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow write access to authenticated users"
  ON api_cache FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for rate_limits
DROP POLICY IF EXISTS "Allow read access to own rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Allow write access to own rate limits" ON rate_limits;

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
  INSERT INTO rate_limits (key, count, reset_at)
  VALUES (
    p_key,
    1,
    CURRENT_TIMESTAMP + (p_window_seconds || ' seconds')::interval
  )
  ON CONFLICT (key) DO UPDATE
  SET
    count = CASE
              WHEN rate_limits.reset_at <= CURRENT_TIMESTAMP THEN 1
              ELSE rate_limits.count + 1
            END,
    reset_at = CASE
                 WHEN rate_limits.reset_at <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + (p_window_seconds || ' seconds')::interval
                 ELSE rate_limits.reset_at
               END,
    updated_at = CURRENT_TIMESTAMP
  RETURNING count, reset_at INTO v_count, v_reset_at;

  IF v_count IS NULL THEN -- Handle case where the row was old and got updated to new window
    SELECT rl.count, rl.reset_at INTO v_count, v_reset_at FROM rate_limits rl WHERE rl.key = p_key;
  END IF;

  IF v_count > p_limit THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;
