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

-- Create RLS policies
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users"
  ON api_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow write access to authenticated users
CREATE POLICY "Allow write access to authenticated users"
  ON api_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$;
