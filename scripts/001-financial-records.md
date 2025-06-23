-- Financial Records Table for Bookkeeping & ROI Tracking
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('campaign', 'contact', 'scraper', 'subscription', 'manual', 'other')),
  source_id UUID, -- References campaigns.id, contacts.id, etc.
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'cost', 'expense', 'refund')),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  description TEXT,
  category VARCHAR(100), -- e.g., 'advertising', 'software', 'personnel'
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_records_org_id ON financial_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_source ON financial_records(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(recorded_at);
CREATE INDEX IF NOT EXISTS idx_financial_records_currency ON financial_records(currency);

-- ROI calculation view
CREATE OR REPLACE VIEW campaign_roi AS
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.organization_id,
  COALESCE(SUM(CASE WHEN fr.type = 'revenue' THEN fr.amount ELSE 0 END), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN fr.type IN ('cost', 'expense') THEN fr.amount ELSE 0 END), 0) as total_costs,
  COALESCE(SUM(CASE WHEN fr.type = 'revenue' THEN fr.amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN fr.type IN ('cost', 'expense') THEN fr.amount ELSE 0 END), 0) as net_profit,
  CASE 
    WHEN COALESCE(SUM(CASE WHEN fr.type IN ('cost', 'expense') THEN fr.amount ELSE 0 END), 0) > 0 
    THEN ((COALESCE(SUM(CASE WHEN fr.type = 'revenue' THEN fr.amount ELSE 0 END), 0) - 
           COALESCE(SUM(CASE WHEN fr.type IN ('cost', 'expense') THEN fr.amount ELSE 0 END), 0)) / 
          COALESCE(SUM(CASE WHEN fr.type IN ('cost', 'expense') THEN fr.amount ELSE 0 END), 0)) * 100
    ELSE 0 
  END as roi_percentage
FROM campaigns c
LEFT JOIN financial_records fr ON fr.source_type = 'campaign' AND fr.source_id = c.id
GROUP BY c.id, c.name, c.organization_id;
