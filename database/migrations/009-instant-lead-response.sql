-- Instant Lead Response Automation System
-- Follows foundational principle: No existing table modifications

-- Lead Response Rules
CREATE TABLE IF NOT EXISTS lead_response_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Rule Configuration
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Higher number = higher priority
    
    -- Trigger Conditions
    trigger_sources JSONB DEFAULT '[]'::jsonb, -- ['vsl_capture', 'form_submission', 'api_import']
    trigger_conditions JSONB DEFAULT '{}'::jsonb, -- Conditions to match
    
    -- Response Configuration
    response_delay_seconds INTEGER DEFAULT 300, -- 5 minutes default
    max_response_delay_seconds INTEGER DEFAULT 1800, -- 30 minutes max
    
    -- Response Actions
    send_email BOOLEAN DEFAULT true,
    send_sms BOOLEAN DEFAULT false,
    make_call BOOLEAN DEFAULT false,
    create_task BOOLEAN DEFAULT true,
    
    -- Templates
    email_template_id UUID REFERENCES templates(id),
    sms_template_id UUID REFERENCES templates(id),
    
    -- Assignment Rules
    auto_assign BOOLEAN DEFAULT true,
    assign_to_user_id UUID REFERENCES users(id),
    assign_by_territory BOOLEAN DEFAULT false,
    assign_round_robin BOOLEAN DEFAULT true,
    
    -- Business Hours
    respect_business_hours BOOLEAN DEFAULT true,
    business_hours_start TIME DEFAULT '09:00:00',
    business_hours_end TIME DEFAULT '17:00:00',
    business_days JSONB DEFAULT '[1,2,3,4,5]'::jsonb, -- Monday-Friday
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Retry Logic
    max_retry_attempts INTEGER DEFAULT 3,
    retry_delay_minutes INTEGER DEFAULT 15,
    escalate_on_failure BOOLEAN DEFAULT true,
    escalation_user_id UUID REFERENCES users(id),
    
    -- Performance Tracking
    total_triggered INTEGER DEFAULT 0,
    successful_responses INTEGER DEFAULT 0,
    failed_responses INTEGER DEFAULT 0,
    avg_response_time_seconds INTEGER DEFAULT 0,
    
    -- Timestamps
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Response Queue
CREATE TABLE IF NOT EXISTS lead_response_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Queue Details
    rule_id UUID NOT NULL REFERENCES lead_response_rules(id) ON DELETE CASCADE,
    lead_capture_id UUID REFERENCES vsl_lead_captures(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    
    -- Lead Information
    lead_email VARCHAR(255) NOT NULL,
    lead_name VARCHAR(200),
    lead_phone VARCHAR(20),
    lead_company VARCHAR(200),
    lead_source VARCHAR(100), -- 'vsl_capture', 'form_submission', 'api_import'
    
    -- Response Configuration
    response_actions JSONB NOT NULL, -- Actions to perform
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Processing Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_message_id VARCHAR(200),
    
    sms_sent BOOLEAN DEFAULT false,
    sms_sent_at TIMESTAMP WITH TIME ZONE,
    sms_message_id VARCHAR(200),
    
    call_attempted BOOLEAN DEFAULT false,
    call_attempted_at TIMESTAMP WITH TIME ZONE,
    call_duration_seconds INTEGER DEFAULT 0,
    call_outcome VARCHAR(50), -- 'answered', 'voicemail', 'busy', 'no_answer', 'failed'
    
    task_created BOOLEAN DEFAULT false,
    task_id UUID,
    
    -- Error Handling
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    
    -- Performance Metrics
    response_time_seconds INTEGER, -- Time from lead capture to first response
    engagement_detected BOOLEAN DEFAULT false,
    engagement_type VARCHAR(50), -- 'email_open', 'email_click', 'sms_reply', 'call_answer'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Response Logs
CREATE TABLE IF NOT EXISTS lead_response_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Log Details
    queue_id UUID NOT NULL REFERENCES lead_response_queue(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'call', 'task', 'assignment'
    
    -- Action Details
    action_data JSONB DEFAULT '{}'::jsonb,
    result VARCHAR(50), -- 'success', 'failed', 'skipped'
    result_message TEXT,
    
    -- Performance
    execution_time_ms INTEGER,
    
    -- Timestamps
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Response Analytics
CREATE TABLE IF NOT EXISTS lead_response_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Analytics Period
    date_period DATE NOT NULL,
    rule_id UUID REFERENCES lead_response_rules(id) ON DELETE CASCADE,
    
    -- Volume Metrics
    total_leads INTEGER DEFAULT 0,
    leads_responded INTEGER DEFAULT 0,
    leads_failed INTEGER DEFAULT 0,
    
    -- Timing Metrics
    avg_response_time_seconds INTEGER DEFAULT 0,
    min_response_time_seconds INTEGER DEFAULT 0,
    max_response_time_seconds INTEGER DEFAULT 0,
    within_sla_count INTEGER DEFAULT 0, -- Responses within target time
    
    -- Channel Performance
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    
    sms_sent INTEGER DEFAULT 0,
    sms_replied INTEGER DEFAULT 0,
    
    calls_attempted INTEGER DEFAULT 0,
    calls_answered INTEGER DEFAULT 0,
    
    tasks_created INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    
    -- Conversion Metrics
    leads_converted INTEGER DEFAULT 0,
    conversion_value DECIMAL(10,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_lead_response_rules_org_active ON lead_response_rules(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lead_response_rules_priority ON lead_response_rules(priority DESC);

CREATE INDEX IF NOT EXISTS idx_lead_response_queue_scheduled ON lead_response_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_lead_response_queue_status ON lead_response_queue(status);
CREATE INDEX IF NOT EXISTS idx_lead_response_queue_org_status ON lead_response_queue(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_lead_response_logs_queue_action ON lead_response_logs(queue_id, action_type);
CREATE INDEX IF NOT EXISTS idx_lead_response_logs_executed_at ON lead_response_logs(executed_at);

CREATE INDEX IF NOT EXISTS idx_lead_response_analytics_org_date ON lead_response_analytics(organization_id, date_period);

-- Row Level Security
ALTER TABLE lead_response_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_response_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_response_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_response_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their organization's response rules" ON lead_response_rules
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their organization's response queue" ON lead_response_queue
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their organization's response logs" ON lead_response_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their organization's response analytics" ON lead_response_analytics
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Functions for Lead Response Processing
CREATE OR REPLACE FUNCTION process_lead_response_queue()
RETURNS INTEGER AS $$
DECLARE
    queue_item RECORD;
    processed_count INTEGER := 0;
BEGIN
    -- Process pending items that are due
    FOR queue_item IN 
        SELECT * FROM lead_response_queue 
        WHERE status = 'pending' 
        AND scheduled_at <= NOW()
        ORDER BY scheduled_at ASC
        LIMIT 100
    LOOP
        -- Update status to processing
        UPDATE lead_response_queue 
        SET status = 'processing', updated_at = NOW()
        WHERE id = queue_item.id;
        
        -- Here you would call your actual response processing logic
        -- This is a placeholder for the actual implementation
        
        processed_count := processed_count + 1;
    END LOOP;
    
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create lead response queue item
CREATE OR REPLACE FUNCTION create_lead_response(
    p_organization_id UUID,
    p_rule_id UUID,
    p_lead_email VARCHAR,
    p_lead_name VARCHAR DEFAULT NULL,
    p_lead_phone VARCHAR DEFAULT NULL,
    p_lead_company VARCHAR DEFAULT NULL,
    p_lead_source VARCHAR DEFAULT 'unknown',
    p_lead_capture_id UUID DEFAULT NULL,
    p_contact_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_rule RECORD;
    v_queue_id UUID;
    v_scheduled_at TIMESTAMP WITH TIME ZONE;
    v_response_actions JSONB;
BEGIN
    -- Get the rule configuration
    SELECT * INTO v_rule FROM lead_response_rules 
    WHERE id = p_rule_id AND organization_id = p_organization_id AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active lead response rule not found';
    END IF;
    
    -- Calculate scheduled time
    v_scheduled_at := NOW() + INTERVAL '1 second' * v_rule.response_delay_seconds;
    
    -- Build response actions
    v_response_actions := jsonb_build_object(
        'send_email', v_rule.send_email,
        'send_sms', v_rule.send_sms,
        'make_call', v_rule.make_call,
        'create_task', v_rule.create_task,
        'email_template_id', v_rule.email_template_id,
        'sms_template_id', v_rule.sms_template_id,
        'assign_to_user_id', v_rule.assign_to_user_id
    );
    
    -- Create queue item
    INSERT INTO lead_response_queue (
        organization_id,
        rule_id,
        lead_capture_id,
        contact_id,
        lead_email,
        lead_name,
        lead_phone,
        lead_company,
        lead_source,
        response_actions,
        scheduled_at,
        max_attempts
    ) VALUES (
        p_organization_id,
        p_rule_id,
        p_lead_capture_id,
        p_contact_id,
        p_lead_email,
        p_lead_name,
        p_lead_phone,
        p_lead_company,
        p_lead_source,
        v_response_actions,
        v_scheduled_at,
        v_rule.max_retry_attempts
    ) RETURNING id INTO v_queue_id;
    
    -- Update rule statistics
    UPDATE lead_response_rules 
    SET total_triggered = total_triggered + 1,
        updated_at = NOW()
    WHERE id = p_rule_id;
    
    RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;
