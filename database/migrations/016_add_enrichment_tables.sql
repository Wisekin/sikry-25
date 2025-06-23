-- SQL migration for enrichment tables

CREATE TABLE IF NOT EXISTS scraped_data (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  data JSONB,
  source_url TEXT,
  confidence_score DECIMAL,
  created_at TIMESTAMP
);