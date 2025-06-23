-- Review Booster System
-- No changes to existing tables, new modular system

-- Review requests tracking
CREATE TABLE review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Review platform details
  platform VARCHAR(50) NOT NULL DEFAULT 'google' CHECK (platform IN ('google', 'yelp', 'facebook', 'trustpilot', 'custom')),
  review_url TEXT NOT NULL,
  business_name VARCHAR(255),
  
  -- Request details
  request_type VARCHAR(50) DEFAULT 'post_interaction' CHECK (request_type IN ('post_interaction', 'post_appointment', 'post_campaign', 'manual')),
  trigger_event VARCHAR(100), -- What triggered this request
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'clicked', 'completed', 'declined', 'expired')),
  
  -- Communication details
  message_template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  sent_via VARCHAR(50) DEFAULT 'email' CHECK (sent_via IN ('email', 'sms', 'whatsapp', 'in_app')),
  
  -- Tracking timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review campaigns for bulk requests
CREATE TABLE review_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(50) NOT NULL DEFAULT 'google',
  review_url TEXT NOT NULL,
  
  -- Campaign settings
  auto_trigger BOOLEAN DEFAULT FALSE,
  trigger_conditions JSONB DEFAULT '{}', -- Conditions for auto-triggering
  delay_hours INTEGER DEFAULT 24, -- Hours to wait after trigger event
  
  -- Template settings
  email_template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  sms_template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  
  -- Status and stats
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  total_requests INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review analytics for performance tracking
CREATE TABLE review_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Time period
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type VARCHAR(20) DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  
  -- Platform breakdown
  platform VARCHAR(50) NOT NULL,
  
  -- Metrics
  requests_sent INTEGER DEFAULT 0,
  requests_clicked INTEGER DEFAULT 0,
  requests_completed INTEGER DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Revenue impact (if applicable)
  estimated_value DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, date, period_type, platform)
);

-- Indexes for performance
CREATE INDEX idx_review_requests_org_id ON review_requests(organization_id);
CREATE INDEX idx_review_requests_contact_id ON review_requests(contact_id);
CREATE INDEX idx_review_requests_status ON review_requests(status);
CREATE INDEX idx_review_requests_platform ON review_requests(platform);
CREATE INDEX idx_review_requests_sent_at ON review_requests(sent_at);

CREATE INDEX idx_review_campaigns_org_id ON review_campaigns(organization_id);
CREATE INDEX idx_review_campaigns_status ON review_campaigns(status);

CREATE INDEX idx_review_analytics_org_date ON review_analytics(organization_id, date);
CREATE INDEX idx_review_analytics_platform ON review_analytics(platform);

-- Enable RLS
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their org's review requests" ON review_requests
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = review_requests.organization_id AND tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = review_requests.organization_id AND tm.user_id = auth.uid()));

CREATE POLICY "Users can manage their org's review campaigns" ON review_campaigns
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = review_campaigns.organization_id AND tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = review_campaigns.organization_id AND tm.user_id = auth.uid()));

CREATE POLICY "Users can view their org's review analytics" ON review_analytics
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = review_analytics.organization_id AND tm.user_id = auth.uid()));
