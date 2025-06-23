-- -- Create API cache table
-- CREATE TABLE IF NOT EXISTS api_cache (
--   key TEXT PRIMARY KEY,
--   data JSONB NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--   expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour')
-- );

-- -- Create index for faster expiration checks
-- CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);

-- -- Create RLS policies
-- ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- -- Allow read access to authenticated users
-- CREATE POLICY "Allow read access to authenticated users"
--   ON api_cache
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- -- Allow write access to authenticated users
-- CREATE POLICY "Allow write access to authenticated users"
--   ON api_cache
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- -- Function to clean expired cache entries
-- CREATE OR REPLACE FUNCTION clean_expired_cache()
-- RETURNS void
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   DELETE FROM api_cache WHERE expires_at < CURRENT_TIMESTAMP;
-- END;
-- $$;


---THE ABOVE CODE IS THE OLD WORKING VERSION, IT IS KEPT HERE FOR REFERENCE. THE BELOW CODE IS THE NEW UPDATE
-- Create API cache table
CREATE TABLE IF NOT EXISTS api_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires_at ON api_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON api_cache(key);
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

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

-- Create rate limit tracking table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

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
