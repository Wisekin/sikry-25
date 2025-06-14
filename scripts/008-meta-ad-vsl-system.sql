-- VSL Landing Pages and Meta Ad Tracking System
-- Follows foundational principle: No existing table modifications

-- VSL Landing Pages
CREATE TABLE IF NOT EXISTS vsl_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Page Configuration
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL, -- URL slug for the page
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- VSL Content
    video_url TEXT, -- YouTube, Vimeo, or direct video URL
    video_thumbnail_url TEXT,
    video_duration_seconds INTEGER,
    
    -- Page Design
    template_type VARCHAR(50) DEFAULT 'standard', -- standard, minimal, premium
    primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    background_type VARCHAR(20) DEFAULT 'solid', -- solid, gradient, image
    background_value TEXT, -- Color or image URL
    
    -- Content Sections
    headline TEXT NOT NULL,
    subheadline TEXT,
    bullet_points JSONB DEFAULT '[]'::jsonb,
    testimonials JSONB DEFAULT '[]'::jsonb,
    
    -- Call to Action
    cta_text VARCHAR(100) DEFAULT 'Get Started Now',
    cta_url TEXT,
    cta_button_color VARCHAR(7) DEFAULT '#10B981',
    
    -- Meta Pixel & Tracking
    meta_pixel_id VARCHAR(50),
    google_analytics_id VARCHAR(50),
    custom_tracking_code TEXT,
    
    -- SEO & Meta
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    og_image_url TEXT,
    
    -- Settings
    is_published BOOLEAN DEFAULT false,
    requires_opt_in BOOLEAN DEFAULT false,
    collect_phone BOOLEAN DEFAULT false,
    collect_company BOOLEAN DEFAULT false,
    
    -- Performance
    view_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    avg_watch_time_seconds INTEGER DEFAULT 0,
    
    -- Timestamps
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Clicks Tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Click Details
    vsl_page_id UUID REFERENCES vsl_pages(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    
    -- UTM Parameters
    utm_source VARCHAR(100), -- facebook, google, linkedin
    utm_medium VARCHAR(100), -- cpc, social, email
    utm_campaign VARCHAR(200),
    utm_term VARCHAR(200),
    utm_content VARCHAR(200),
    
    -- Meta Ad Specific
    fbclid VARCHAR(200), -- Facebook Click ID
    ad_id VARCHAR(100),
    ad_set_id VARCHAR(100),
    campaign_name VARCHAR(200),
    
    -- Visitor Information
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    landing_url TEXT,
    
    -- Geographic Data
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Device Information
    device_type VARCHAR(20), -- desktop, mobile, tablet
    browser VARCHAR(50),
    operating_system VARCHAR(50),
    
    -- Engagement Tracking
    time_on_page_seconds INTEGER DEFAULT 0,
    video_watch_percentage INTEGER DEFAULT 0,
    scrolled_percentage INTEGER DEFAULT 0,
    clicked_cta BOOLEAN DEFAULT false,
    
    -- Conversion Tracking
    converted BOOLEAN DEFAULT false,
    conversion_value DECIMAL(10,2),
    conversion_type VARCHAR(50), -- lead, sale, signup, download
    
    -- Session Information
    session_id VARCHAR(100),
    is_returning_visitor BOOLEAN DEFAULT false,
    
    -- Timestamps
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VSL Page Views (Detailed Analytics)
CREATE TABLE IF NOT EXISTS vsl_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- View Details
    vsl_page_id UUID NOT NULL REFERENCES vsl_pages(id) ON DELETE CASCADE,
    ad_click_id UUID REFERENCES ad_clicks(id) ON DELETE SET NULL,
    
    -- Visitor Session
    session_id VARCHAR(100) NOT NULL,
    visitor_id VARCHAR(100), -- Anonymous visitor tracking
    
    -- View Metrics
    view_duration_seconds INTEGER DEFAULT 0,
    video_started BOOLEAN DEFAULT false,
    video_completed BOOLEAN DEFAULT false,
    video_watch_time_seconds INTEGER DEFAULT 0,
    max_scroll_percentage INTEGER DEFAULT 0,
    
    -- Interaction Events
    interactions JSONB DEFAULT '[]'::jsonb, -- Array of interaction events
    form_submissions INTEGER DEFAULT 0,
    cta_clicks INTEGER DEFAULT 0,
    
    -- Technical Details
    page_load_time_ms INTEGER,
    bounce BOOLEAN DEFAULT true, -- Updated to false if engagement detected
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VSL Lead Captures
CREATE TABLE IF NOT EXISTS vsl_lead_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Lead Source
    vsl_page_id UUID NOT NULL REFERENCES vsl_pages(id) ON DELETE CASCADE,
    ad_click_id UUID REFERENCES ad_clicks(id) ON DELETE SET NULL,
    page_view_id UUID REFERENCES vsl_page_views(id) ON DELETE SET NULL,
    
    -- Lead Information
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    company_name VARCHAR(200),
    
    -- Capture Context
    capture_method VARCHAR(50) DEFAULT 'form', -- form, popup, exit_intent
    form_position VARCHAR(50), -- top, middle, bottom, popup
    video_timestamp_seconds INTEGER, -- When in video they converted
    
    -- Lead Quality Scoring
    lead_score INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0, -- Based on page interaction
    urgency_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- UTM Attribution
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(200),
    utm_term VARCHAR(200),
    utm_content VARCHAR(200),
    
    -- Processing Status
    processed BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES users(id),
    follow_up_scheduled_at TIMESTAMP WITH TIME ZONE,
    
    -- Integration Status
    added_to_crm BOOLEAN DEFAULT false,
    crm_contact_id VARCHAR(100),
    
    -- Timestamps
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_vsl_pages_org_slug ON vsl_pages(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_vsl_pages_published ON vsl_pages(is_published) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_ad_clicks_org_campaign ON ad_clicks(organization_id, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_vsl_page ON ad_clicks(vsl_page_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);

CREATE INDEX IF NOT EXISTS idx_vsl_page_views_page_session ON vsl_page_views(vsl_page_id, session_id);
CREATE INDEX IF NOT EXISTS idx_vsl_page_views_started_at ON vsl_page_views(started_at);

CREATE INDEX IF NOT EXISTS idx_vsl_lead_captures_org_captured ON vsl_lead_captures(organization_id, captured_at);
CREATE INDEX IF NOT EXISTS idx_vsl_lead_captures_processed ON vsl_lead_captures(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_vsl_lead_captures_email ON vsl_lead_captures(email);

-- Row Level Security
ALTER TABLE vsl_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsl_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE vsl_lead_captures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their organization's VSL pages" ON vsl_pages
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their organization's ad clicks" ON ad_clicks
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their organization's page views" ON vsl_page_views
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their organization's lead captures" ON vsl_lead_captures
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Functions for Analytics
CREATE OR REPLACE FUNCTION get_vsl_page_analytics(page_id UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_views BIGINT,
    unique_visitors BIGINT,
    avg_watch_time NUMERIC,
    conversion_rate NUMERIC,
    top_traffic_sources JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH page_stats AS (
        SELECT 
            COUNT(*) as views,
            COUNT(DISTINCT visitor_id) as visitors,
            AVG(video_watch_time_seconds) as avg_watch,
            COUNT(*) FILTER (WHERE EXISTS (
                SELECT 1 FROM vsl_lead_captures vlc 
                WHERE vlc.page_view_id = vpv.id
            )) as conversions
        FROM vsl_page_views vpv
        WHERE vpv.vsl_page_id = page_id
        AND vpv.started_at >= NOW() - INTERVAL '1 day' * days_back
    ),
    traffic_sources AS (
        SELECT 
            COALESCE(ac.utm_source, 'direct') as source,
            COUNT(*) as clicks
        FROM vsl_page_views vpv
        LEFT JOIN ad_clicks ac ON ac.id = vpv.ad_click_id
        WHERE vpv.vsl_page_id = page_id
        AND vpv.started_at >= NOW() - INTERVAL '1 day' * days_back
        GROUP BY COALESCE(ac.utm_source, 'direct')
        ORDER BY clicks DESC
        LIMIT 5
    )
    SELECT 
        ps.views,
        ps.visitors,
        ps.avg_watch,
        CASE WHEN ps.views > 0 THEN (ps.conversions::NUMERIC / ps.views::NUMERIC) * 100 ELSE 0 END,
        (SELECT jsonb_agg(jsonb_build_object('source', source, 'clicks', clicks)) FROM traffic_sources)
    FROM page_stats ps;
END;
$$ LANGUAGE plpgsql;
