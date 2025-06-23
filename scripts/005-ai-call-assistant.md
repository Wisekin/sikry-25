-- AI Assistant for Calls & Appointments
-- No changes to existing tables, new modular system

-- Call interactions tracking
CREATE TABLE call_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Call details
  call_id VARCHAR(255) UNIQUE, -- External provider call ID (Twilio, etc.)
  phone_number VARCHAR(50),
  direction VARCHAR(20) DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  
  -- AI Processing
  transcript TEXT,
  summary TEXT,
  intent VARCHAR(100), -- appointment, inquiry, complaint, etc.
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  
  -- Outcome tracking
  outcome VARCHAR(100), -- scheduled, rescheduled, declined, information_provided, etc.
  action_taken TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMPTZ,
  
  -- Technical details
  duration_seconds INTEGER,
  recording_url TEXT,
  ai_provider VARCHAR(50) DEFAULT 'whisper', -- whisper, deepgram, assembly, etc.
  processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  call_started_at TIMESTAMPTZ,
  call_ended_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  error_details TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI assistant configurations
CREATE TABLE ai_assistant_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL DEFAULT 'Default Assistant',
  description TEXT,
  
  -- AI Settings
  ai_provider VARCHAR(50) DEFAULT 'whisper' CHECK (ai_provider IN ('whisper', 'openai', 'deepgram', 'assembly')),
  model_name VARCHAR(100) DEFAULT 'whisper-1',
  language VARCHAR(10) DEFAULT 'en',
  
  -- Behavior settings
  greeting_message TEXT DEFAULT 'Hello! I''m an AI assistant. How can I help you today?',
  fallback_message TEXT DEFAULT 'I''m sorry, I didn''t understand that. Let me connect you with a human representative.',
  max_conversation_length INTEGER DEFAULT 10, -- Max back-and-forth exchanges
  
  -- Intent recognition
  supported_intents TEXT[] DEFAULT ARRAY['appointment', 'inquiry', 'support', 'sales'],
  intent_confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
  
  -- Integration settings
  calendar_integration BOOLEAN DEFAULT FALSE,
  calendar_provider VARCHAR(50), -- google, outlook, calendly
  calendar_config JSONB DEFAULT '{}',
  
  -- Appointment settings
  available_time_slots JSONB DEFAULT '{}', -- Business hours, available slots
  appointment_duration_minutes INTEGER DEFAULT 30,
  buffer_time_minutes INTEGER DEFAULT 15,
  
  -- Fallback settings
  human_handoff_triggers TEXT[] DEFAULT ARRAY['complex_request', 'low_confidence', 'user_request'],
  fallback_phone_number VARCHAR(50),
  fallback_email VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment scheduling via AI
CREATE TABLE ai_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  call_interaction_id UUID REFERENCES call_interactions(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Appointment details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show')),
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Meeting details
  meeting_type VARCHAR(50) DEFAULT 'phone' CHECK (meeting_type IN ('phone', 'video', 'in_person')),
  meeting_url TEXT, -- For video calls
  meeting_location TEXT, -- For in-person
  
  -- AI confidence
  scheduling_confidence DECIMAL(3,2) CHECK (scheduling_confidence BETWEEN 0 AND 1),
  requires_human_review BOOLEAN DEFAULT FALSE,
  
  -- External calendar integration
  external_calendar_id VARCHAR(255),
  external_event_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call analytics for AI performance
CREATE TABLE call_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Time period
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type VARCHAR(20) DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  
  -- Call metrics
  total_calls INTEGER DEFAULT 0,
  ai_handled_calls INTEGER DEFAULT 0,
  human_handoff_calls INTEGER DEFAULT 0,
  successful_appointments INTEGER DEFAULT 0,
  
  -- AI performance
  avg_confidence_score DECIMAL(3,2) DEFAULT 0,
  avg_processing_time_seconds INTEGER DEFAULT 0,
  intent_accuracy_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Outcomes
  appointment_conversion_rate DECIMAL(5,2) DEFAULT 0,
  customer_satisfaction_score DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, date, period_type)
);

-- Indexes for performance
CREATE INDEX idx_call_interactions_org_id ON call_interactions(organization_id);
CREATE INDEX idx_call_interactions_contact_id ON call_interactions(contact_id);
CREATE INDEX idx_call_interactions_call_id ON call_interactions(call_id);
CREATE INDEX idx_call_interactions_intent ON call_interactions(intent);
CREATE INDEX idx_call_interactions_started_at ON call_interactions(call_started_at);

CREATE INDEX idx_ai_assistant_configs_org_id ON ai_assistant_configs(organization_id);
CREATE INDEX idx_ai_assistant_configs_active ON ai_assistant_configs(is_active);

CREATE INDEX idx_ai_appointments_org_id ON ai_appointments(organization_id);
CREATE INDEX idx_ai_appointments_contact_id ON ai_appointments(contact_id);
CREATE INDEX idx_ai_appointments_scheduled_at ON ai_appointments(scheduled_at);
CREATE INDEX idx_ai_appointments_status ON ai_appointments(status);

CREATE INDEX idx_call_analytics_org_date ON call_analytics(organization_id, date);

-- Enable RLS
ALTER TABLE call_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their org's call interactions" ON call_interactions
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = call_interactions.organization_id AND tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = call_interactions.organization_id AND tm.user_id = auth.uid()));

CREATE POLICY "Users can manage their org's AI configs" ON ai_assistant_configs
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = ai_assistant_configs.organization_id AND tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = ai_assistant_configs.organization_id AND tm.user_id = auth.uid()));

CREATE POLICY "Users can manage their org's AI appointments" ON ai_appointments
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = ai_appointments.organization_id AND tm.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = ai_appointments.organization_id AND tm.user_id = auth.uid()));

CREATE POLICY "Users can view their org's call analytics" ON call_analytics
  USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.organization_id = call_analytics.organization_id AND tm.user_id = auth.uid()));
