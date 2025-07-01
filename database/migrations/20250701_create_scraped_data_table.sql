-- Create scraped_data table
CREATE TABLE IF NOT EXISTS scraped_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    data JSONB NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for URL lookups
CREATE INDEX IF NOT EXISTS idx_scraped_data_url ON scraped_data(url);

-- Create index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_scraped_data_scraped_at ON scraped_data(scraped_at);

-- Add RLS policies
ALTER TABLE scraped_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read scraped data
CREATE POLICY "Allow anyone to read scraped data"
ON scraped_data
FOR SELECT
USING (true);

-- Only allow authenticated users to insert new data
CREATE POLICY "Allow authenticated users to insert scraped data"
ON scraped_data
FOR INSERT
TO authenticated
WITH CHECK (true);
