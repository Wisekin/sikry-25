-- SQL migration for discovery tables

CREATE TABLE IF NOT EXISTS discovery_requests (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  status VARCHAR(50),
  website_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- For performance, consider adding an index on (company_id, created_at) for faster lookups of recent requests for a company.