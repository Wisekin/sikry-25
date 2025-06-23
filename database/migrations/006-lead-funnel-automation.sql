-- Lead Funnel Automation System
-- Creates comprehensive funnel management with progress tracking

-- Main funnels table
CREATE TABLE IF NOT EXISTS funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    funnel_type VARCHAR(50) DEFAULT 'lead_nurture', -- lead_nurture, onboarding, reactivation
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, archived
    
    -- Funnel configuration
    steps JSONB NOT NULL DEFAULT '[]', -- Array of step configurations
    trigger_conditions JSONB DEFAULT '{}', -- When to start funnel
    exit_conditions JSONB DEFAULT '{}', -- When to exit funnel
    
    -- Performance metrics
    conversion_metrics JSONB DEFAULT '{}', -- Success rates, conversion data
    total_enrolled INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    total_dropped INTEGER DEFAULT 0,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    max_concurrent_contacts INTEGER DEFAULT 1000,
    cooldown_period_days INTEGER DEFAULT 30,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funnel steps configuration table
CREATE TABLE IF NOT EXISTS funnel_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL, -- email, sms, wait, condition, action
    
    -- Step configuration
    step_config JSONB NOT NULL DEFAULT '{}', -- Template, delay, conditions
    success_criteria JSONB DEFAULT '{}', -- What defines success
    failure_criteria JSONB DEFAULT '{}', -- What defines failure
    
    -- Branching logic
    success_next_step_id UUID REFERENCES funnel_steps(id),
    failure_next_step_id UUID REFERENCES funnel_steps(id),
    default_next_step_id UUID REFERENCES funnel_steps(id),
    
    -- Performance
    total_entered INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual contact progress through funnels
CREATE TABLE IF NOT EXISTS funnel_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_step_id UUID REFERENCES funnel_steps(id),
    status VARCHAR(50) DEFAULT 'active', -- active, completed, dropped, paused
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Journey data
    steps_completed JSONB DEFAULT '[]', -- Array of completed step IDs with timestamps
    step_results JSONB DEFAULT '{}', -- Results from each step
    engagement_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    next_action_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    entry_source VARCHAR(100), -- How they entered the funnel
    entry_data JSONB DEFAULT '{}', -- Additional context data
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funnel performance analytics
CREATE TABLE IF NOT EXISTS funnel_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Daily metrics
    new_enrollments INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    dropoffs INTEGER DEFAULT 0,
    active_contacts INTEGER DEFAULT 0,
    
    -- Step-by-step breakdown
    step_performance JSONB DEFAULT '{}', -- Performance per step
    conversion_rates JSONB DEFAULT '{}', -- Conversion rates between steps
    
    -- Engagement metrics
    avg_engagement_score DECIMAL(5,2) DEFAULT 0.00,
    avg_completion_time_hours INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnels_organization_status ON funnels(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_funnel_steps_funnel_order ON funnel_steps(funnel_id, step_order);
CREATE INDEX IF NOT EXISTS idx_funnel_progress_contact ON funnel_progress(contact_id, status);
CREATE INDEX IF NOT EXISTS idx_funnel_progress_funnel_status ON funnel_progress(funnel_id, status);
CREATE INDEX IF NOT EXISTS idx_funnel_progress_next_action ON funnel_progress(next_action_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_funnel_analytics_funnel_date ON funnel_analytics(funnel_id, date_recorded);

-- Update triggers
CREATE OR REPLACE FUNCTION update_funnel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_funnels_updated_at
    BEFORE UPDATE ON funnels
    FOR EACH ROW
    EXECUTE FUNCTION update_funnel_updated_at();

CREATE TRIGGER trigger_funnel_steps_updated_at
    BEFORE UPDATE ON funnel_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_funnel_updated_at();

CREATE TRIGGER trigger_funnel_progress_updated_at
    BEFORE UPDATE ON funnel_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_funnel_updated_at();
