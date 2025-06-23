-- Lead Re-Engagement Engine Tables
-- Following principle: New tables only, no changes to existing schema

-- Track re-engagement tasks and automation
CREATE TABLE reengagement_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('auto_nurture', 'manual_followup', 'segment_campaign')),
    trigger_criteria JSONB NOT NULL, -- Store the criteria that triggered this task
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    scheduled_for TIMESTAMP,
    executed_at TIMESTAMP,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    results JSONB DEFAULT '{}',
    error_details TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Track lead engagement scoring and classification
CREATE TABLE lead_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    classification VARCHAR(20) NOT NULL CHECK (classification IN ('hot', 'warm', 'cold', 'dormant', 'unresponsive')),
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    factors JSONB NOT NULL, -- Store scoring factors and weights
    last_activity_date TIMESTAMP,
    classification_date TIMESTAMP DEFAULT NOW(),
    auto_classified BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(contact_id, classification_date)
);

-- Re-engagement campaign templates
CREATE TABLE reengagement_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_conditions JSONB NOT NULL, -- When to use this template
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    sequence_order INTEGER DEFAULT 1,
    delay_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    success_metrics JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reengagement_tasks_org_status ON reengagement_tasks(organization_id, status);
CREATE INDEX idx_reengagement_tasks_scheduled ON reengagement_tasks(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_lead_classifications_org_class ON lead_classifications(organization_id, classification);
CREATE INDEX idx_lead_classifications_contact ON lead_classifications(contact_id);
CREATE INDEX idx_reengagement_templates_org_active ON reengagement_templates(organization_id, is_active);

-- Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(contact_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 50; -- Base score
    days_since_contact INTEGER;
    engagement_score INTEGER;
    communication_count INTEGER;
BEGIN
    -- Get contact data
    SELECT 
        COALESCE(EXTRACT(DAY FROM NOW() - last_contacted_at), 999) as days_since,
        COALESCE(engagement_score, 0) as engagement,
        (SELECT COUNT(*) FROM communications WHERE contact_id = contact_uuid AND status = 'delivered') as comm_count
    INTO days_since_contact, engagement_score, communication_count
    FROM contacts WHERE id = contact_uuid;
    
    -- Adjust score based on factors
    score := score + engagement_score;
    score := score - (days_since_contact / 7) * 5; -- Lose 5 points per week
    score := score + (communication_count * 2); -- Gain 2 points per successful communication
    
    -- Ensure score is within bounds
    score := GREATEST(0, LEAST(100, score));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;
