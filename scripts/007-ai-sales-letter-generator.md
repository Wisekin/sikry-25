-- AI Sales Letter Generator (Gap Analysis) System
-- Creates comprehensive gap analysis and letter generation

-- Gap analyses table
CREATE TABLE IF NOT EXISTS gap_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
    
    -- Analysis data
    analysis_type VARCHAR(50) DEFAULT 'business_assessment', -- business_assessment, technical_audit, market_analysis
    snapshot_data JSONB NOT NULL DEFAULT '{}', -- Current state data
    form_responses JSONB DEFAULT '{}', -- Self-assessment responses
    scraped_data JSONB DEFAULT '{}', -- Data from company scraping
    
    -- AI Generation
    generated_letter TEXT,
    letter_template_id UUID REFERENCES templates(id),
    ai_provider VARCHAR(50), -- openai, claude, local, template_fallback
    generation_prompt TEXT,
    generation_metadata JSONB DEFAULT '{}',
    
    -- Scoring
    overall_score DECIMAL(5,2) DEFAULT 0.00,
    gap_scores JSONB DEFAULT '{}', -- Individual gap scores
    priority_areas JSONB DEFAULT '[]', -- Array of priority improvement areas
    
    -- Performance tracking
    letter_sent BOOLEAN DEFAULT false,
    letter_opened BOOLEAN DEFAULT false,
    letter_responded BOOLEAN DEFAULT false,
    response_sentiment VARCHAR(50), -- positive, neutral, negative
    
    -- Metadata
    status VARCHAR(50) DEFAULT 'draft', -- draft, generated, sent, responded
    regeneration_count INTEGER DEFAULT 0,
    last_regenerated_at TIMESTAMP WITH TIME ZONE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gap analysis templates for different industries/types
CREATE TABLE IF NOT EXISTS gap_analysis_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template configuration
    analysis_type VARCHAR(50) NOT NULL,
    industry VARCHAR(100),
    target_company_size VARCHAR(50), -- startup, small, medium, enterprise
    
    -- Form structure
    assessment_questions JSONB NOT NULL DEFAULT '[]', -- Array of question objects
    scoring_criteria JSONB NOT NULL DEFAULT '{}', -- How to score responses
    gap_categories JSONB NOT NULL DEFAULT '[]', -- Categories to analyze
    
    -- Letter generation
    letter_template TEXT NOT NULL,
    ai_prompt_template TEXT,
    personalization_fields JSONB DEFAULT '[]',
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual question responses for detailed tracking
CREATE TABLE IF NOT EXISTS gap_analysis_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gap_analysis_id UUID NOT NULL REFERENCES gap_analyses(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    
    -- Response data
    response_value TEXT,
    response_score DECIMAL(5,2),
    response_weight DECIMAL(3,2) DEFAULT 1.00,
    
    -- Analysis
    gap_identified BOOLEAN DEFAULT false,
    gap_severity VARCHAR(50), -- low, medium, high, critical
    improvement_suggestion TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI generation logs for debugging and optimization
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gap_analysis_id UUID NOT NULL REFERENCES gap_analyses(id) ON DELETE CASCADE,
    
    -- Generation details
    provider VARCHAR(50) NOT NULL,
    model_used VARCHAR(100),
    prompt_used TEXT NOT NULL,
    response_received TEXT,
    
    -- Performance metrics
    generation_time_ms INTEGER,
    token_count INTEGER,
    cost_estimate DECIMAL(10,4),
    
    -- Quality metrics
    quality_score DECIMAL(5,2),
    human_rating INTEGER, -- 1-5 rating if reviewed
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed', -- completed, failed, timeout
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gap_analyses_organization ON gap_analyses(organization_id);
CREATE INDEX IF NOT EXISTS idx_gap_analyses_contact ON gap_analyses(contact_id);
CREATE INDEX IF NOT EXISTS idx_gap_analyses_company ON gap_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_gap_analyses_status ON gap_analyses(status);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_templates_type ON gap_analysis_templates(analysis_type, industry);
CREATE INDEX IF NOT EXISTS idx_gap_analysis_responses_analysis ON gap_analysis_responses(gap_analysis_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_analysis ON ai_generation_logs(gap_analysis_id);

-- Update triggers
CREATE TRIGGER trigger_gap_analyses_updated_at
    BEFORE UPDATE ON gap_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_funnel_updated_at();

CREATE TRIGGER trigger_gap_analysis_templates_updated_at
    BEFORE UPDATE ON gap_analysis_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_funnel_updated_at();
