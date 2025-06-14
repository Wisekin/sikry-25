-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; 
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; 

-- Function to update searchable_tsvectors for discovered_companies
CREATE OR REPLACE FUNCTION update_discovered_companies_tsvectors()
RETURNS TRIGGER AS $$
DECLARE
  common_text TEXT;
BEGIN
  common_text :=
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.industry, '') || ' ' ||
    coalesce(NEW.location_text, '') || ' ' ||
    array_to_string(NEW.tags_list, ' ') || ' ' ||
    array_to_string(NEW.technologies_list, ' ');

  NEW.searchable_tsvector_en := to_tsvector('english', common_text);
  NEW.searchable_tsvector_fr := to_tsvector('french', common_text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 

-- Drop tables in dependency order (from original File Schema)
DROP TABLE IF EXISTS communication_attachments CASCADE; 
DROP TABLE IF EXISTS communications CASCADE; 
DROP TABLE IF EXISTS campaign_recipients CASCADE; 
DROP TABLE IF EXISTS campaigns CASCADE; 
DROP TABLE IF EXISTS templates CASCADE; 
DROP TABLE IF EXISTS scraper_runs CASCADE;
DROP TABLE IF EXISTS scraped_data CASCADE; 
DROP TABLE IF EXISTS company_relationships CASCADE; 
-- DROP TABLE IF EXISTS discovered_companies CASCADE; -- Will be dropped after new tables that depend on it
-- DROP TABLE IF EXISTS saved_searches CASCADE; -- Will be dropped after new tables that depend on it
-- DROP TABLE IF EXISTS scraper_configs CASCADE; -- Will be dropped after new tables that depend on it
-- DROP TABLE IF EXISTS scrapers CASCADE; -- Will be dropped after new tables that depend on it
-- DROP TABLE IF EXISTS team_members CASCADE; -- Will be dropped after new tables that depend on it
-- DROP TABLE IF EXISTS organizations CASCADE; -- Will be dropped after new tables that depend on it
-- DROP TABLE IF EXISTS users CASCADE; -- Will be dropped after new tables that depend on it

-- Drop new tables (reverse order of creation, approximately)
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS oauth_providers CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS background_jobs CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;
DROP TABLE IF EXISTS competitor_analysis CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
-- Drop remaining original tables
DROP TABLE IF EXISTS statistics_snapshots CASCADE; -- Depends on organizations
DROP TABLE IF EXISTS audit_logs CASCADE; -- Depends on organizations, users
DROP TABLE IF EXISTS scraped_data CASCADE; -- Already dropped, but ensure correct order
DROP TABLE IF EXISTS scraper_runs CASCADE; -- Already dropped
DROP TABLE IF EXISTS company_relationships CASCADE; -- Already dropped
DROP TABLE IF EXISTS campaign_recipients CASCADE; -- Already dropped
DROP TABLE IF EXISTS communications CASCADE; -- Already dropped
DROP TABLE IF EXISTS communication_attachments CASCADE; -- Already dropped
DROP TABLE IF EXISTS templates CASCADE; -- Already dropped
DROP TABLE IF EXISTS campaigns CASCADE; -- Already dropped
DROP TABLE IF EXISTS scraper_configs CASCADE; 
DROP TABLE IF EXISTS saved_searches CASCADE; 
DROP TABLE IF EXISTS discovered_companies CASCADE;
DROP TABLE IF EXISTS scrapers CASCADE; 
DROP TABLE IF EXISTS team_members CASCADE; 
DROP TABLE IF EXISTS users CASCADE; 
DROP TABLE IF EXISTS organizations CASCADE; 


-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  billing_email TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create users table (augmented)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  platform_role VARCHAR(50) DEFAULT 'user', -- Added from New Schema (as platform_role)
  preferences JSONB DEFAULT '{}', -- Added from New Schema
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')), -- This is organization-specific role
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
); 

-- Create scrapers table (augmented)
CREATE TABLE scrapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scraper_type VARCHAR(50), -- Added from New Schema (e.g., 'company_data', 'contacts')
  target_url_template VARCHAR(500), -- Added from New Schema (base URL or pattern)
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'paused', 'failed')),
  scraper_stats JSONB DEFAULT '{}', -- Added from New Schema
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create scraper configs table
CREATE TABLE scraper_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scraper_id UUID REFERENCES scrapers(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  config JSONB NOT NULL DEFAULT '{
    "mainSelector": null,
    "fieldSelectors": {},
    "aiAssist": true,
    "schedule": null
  }',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create saved searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  engine TEXT NOT NULL CHECK (engine IN ('google', 'linkedin', 'crunchbase', 'custom')),
  filters JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create discovered companies table (augmented based on New Schema 'companies')
CREATE TABLE discovered_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  search_id UUID REFERENCES saved_searches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  domain TEXT,
  description TEXT,
  logo_url TEXT,
  industry TEXT,
  location_text TEXT, -- Original location field
  founded_year INTEGER,
  employee_count TEXT, -- Or consider INTEGER range
  revenue_range TEXT, -- Or consider structured JSONB
  technologies_list TEXT[], -- Original technologies field
  source_url TEXT NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  last_scraped_at TIMESTAMPTZ,
  -- Fields added/adapted from New Schema's 'companies' table
  company_size VARCHAR(50),                     -- New: size VARCHAR(50)
  location_structured JSONB,                  -- New: location JSONB
  financials_data JSONB,                      -- New: financials JSONB
  technology_profile JSONB,                   -- New: technology JSONB
  social_media_profiles JSONB,                -- New: social JSONB
  company_status VARCHAR(50) DEFAULT 'active',  -- New: status VARCHAR(50)
  tags_list TEXT[],                           -- New: tags TEXT[]
  internal_notes TEXT,                        -- New: notes TEXT
  searchable_tsvector_en TSVECTOR,             -- New: tsvector for English
  searchable_tsvector_fr TSVECTOR,             -- New: tsvector for French
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create company relationships table
CREATE TABLE company_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  source_company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  target_company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('competitor', 'partner', 'parent', 'subsidiary', 'other')), -- Added 'other'
  strength NUMERIC(3,2) CHECK (strength BETWEEN 0 AND 1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scraped data table
CREATE TABLE scraped_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  scraper_id UUID REFERENCES scrapers(id) ON DELETE SET NULL,
  config_id UUID REFERENCES scraper_configs(id) ON DELETE SET NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('contact', 'product', 'service', 'pricing', 'company_profile', 'other')), -- Added more types
  raw_content TEXT,
  extracted_fields JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  quality_score NUMERIC(3,2) CHECK (quality_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create scraper runs table (augmented based on New Schema 'scrape_jobs')
CREATE TABLE scraper_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  scraper_id UUID REFERENCES scrapers(id) ON DELETE CASCADE,
  config_id UUID REFERENCES scraper_configs(id) ON DELETE SET NULL,
  target_url VARCHAR(500), -- Added from New Schema 'scrape_jobs.url'
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial', 'pending', 'queued')), -- Added 'pending', 'queued'
  items_scraped INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  logs TEXT,
  started_at TIMESTAMPTZ, -- Nullable if pending/queued
  completed_at TIMESTAMPTZ,
  -- data_payload JSONB, -- Consider if results stored here or always in scraped_data. File schema uses scraped_data.
  created_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create templates table (augmented)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('email', 'sms', 'whatsapp', 'linkedin_message', 'other')), -- Adapted from 'category' and New Schema 'type'
  subject VARCHAR(255), -- Added from New Schema
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- File schema used JSONB, New Schema TEXT[]. JSONB is flexible.
  template_tags TEXT[], -- Added from New Schema
  is_public BOOLEAN DEFAULT FALSE, -- Added from New Schema
  spam_score DECIMAL(3,2), -- Added from New Schema
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create campaigns table (augmented)
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  campaign_type VARCHAR(50), -- Added from New Schema (e.g., 'drip', 'blast', 'ab_test')
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused', 'failed')), -- Added 'failed'
  target_filters JSONB, -- Added from New Schema
  campaign_stats JSONB DEFAULT '{}', -- Added from New Schema
  scheduled_for TIMESTAMPTZ, -- Renamed from New Schema 'scheduled_at'
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create contacts table (New table)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Added for RLS and data scoping
  company_id UUID REFERENCES discovered_companies(id) ON DELETE SET NULL, -- Allow contact without company initially
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE, -- Consider making this non-unique if contacts can exist across orgs or be shared. For now, unique within context.
  phone VARCHAR(50),
  role VARCHAR(100),
  department VARCHAR(100),
  linkedin_url VARCHAR(255), -- Renamed from 'linkedin' for clarity
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100), -- Assuming 0-100 scale
  is_verified BOOLEAN DEFAULT FALSE, -- Renamed from 'verified'
  last_contacted_at TIMESTAMPTZ, -- Renamed from 'last_contacted'
  engagement_score INTEGER DEFAULT 0,
  source TEXT, -- Added: How was this contact obtained?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create campaign recipients table (potentially link to new 'contacts' table)
CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Added: Link to central contacts table
  company_id UUID REFERENCES discovered_companies(id) ON DELETE SET NULL, -- Kept for cases where direct company targeting is used
  -- Fields below can be fallback if contact_id is null or for specific campaign context
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'unsubscribed', 'failed')), -- Added more statuses
  status_details JSONB DEFAULT '{}', -- For bounce reasons, detailed errors etc.
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ, -- Promoted from status_details
  replied_at TIMESTAMPTZ, -- Promoted from status_details
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create communications table (augmented, potentially related to New Schema 'messages')
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES campaign_recipients(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Added: Direct link to contact if available
  company_id UUID REFERENCES discovered_companies(id) ON DELETE SET NULL, -- Added: Direct link to company if available
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'call', 'linkedin', 'other')), -- Added 'linkedin', 'other'
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  subject TEXT,
  content TEXT NOT NULL,
  personalization_data JSONB, -- Added from New Schema 'messages.personalization'
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed', 'received', 'answered')), -- Added 'received', 'answered' for inbound
  bounce_reason TEXT, -- Added from New Schema 'messages.bounce_reason'
  metadata JSONB DEFAULT '{}', -- For other specific data like provider IDs, thread IDs
  sent_at TIMESTAMPTZ DEFAULT NOW(), -- For outbound
  received_at TIMESTAMPTZ, -- For inbound
  opened_at TIMESTAMPTZ, -- Can be tracked here too, or primarily in campaign_recipients
  replied_at TIMESTAMPTZ, -- Can be tracked here too
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() -- Added missing updated_at from file line break
); 

-- Create communication attachments table
CREATE TABLE communication_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  communication_id UUID REFERENCES communications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- This would typically point to a storage service
  file_type TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  created_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create statistics snapshots table
CREATE TABLE statistics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_companies INTEGER DEFAULT 0,
  total_contacts INTEGER DEFAULT 0, -- Added
  total_communications INTEGER DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  total_scrapers INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0, -- Added
  created_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Create audit logs table (corresponds to New Schema 'activity_logs')
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'user_login', 'create_company', 'update_settings'
  entity_type TEXT, -- e.g., 'company', 'campaign', 'user'
  entity_id UUID,
  details JSONB, -- Before and after values, or other relevant info
  ip_address TEXT, -- Storing as TEXT as per original schema. Consider INET if appropriate.
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
); 

-- Market Intelligence Tables (New)
CREATE TABLE competitor_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  market_position JSONB, -- e.g. SWOT, market share trends
  benchmarks JSONB, -- Key metrics compared to industry/competitors
  analysis_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  primary_company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  competitor_company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  relationship_notes TEXT, -- Changed from VARCHAR(50)
  similarity_score DECIMAL(5,2) CHECK (similarity_score BETWEEN 0 AND 100), -- Renamed
  market_share_comparison DECIMAL(5,2), -- Renamed
  strengths_observed TEXT[], -- Renamed
  weaknesses_observed TEXT[], -- Renamed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(primary_company_id, competitor_company_id)
);

-- Company Insights Table (New)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- e.g., 'funding_round', 'new_product', 'key_hire', 'market_trend'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact_assessment VARCHAR(50), -- e.g., 'high', 'medium', 'low'
  confidence_level DECIMAL(5,2) CHECK (confidence_level BETWEEN 0 AND 1), -- Renamed
  source_name VARCHAR(255), -- Renamed
  source_url TEXT, -- Renamed
  relevance_score DECIMAL(5,2) CHECK (relevance_score BETWEEN 0 AND 1),
  insight_tags TEXT[], -- Renamed
  discovered_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity & System Tables (New)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL, -- Nullable if system-wide notification
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- e.g., 'new_lead', 'task_due', 'campaign_completed'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB, -- For linking to specific entities or holding extra info
  is_read BOOLEAN DEFAULT FALSE, -- Renamed
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('info', 'warn', 'error', 'debug', 'critical')), -- Added 'critical'
  message TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('api', 'scraper', 'user', 'system', 'security', 'database', 'integration')), -- Added more
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be null for system events
  session_id VARCHAR(255),
  ip_address TEXT, -- Storing as TEXT. Consider INET.
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(100) NOT NULL, -- Renamed
  metric_value DECIMAL(15,4) NOT NULL, -- Renamed
  metric_unit VARCHAR(20) DEFAULT 'count', -- Renamed
  tags JSONB DEFAULT '{}', -- For dimensions like region, type, etc.
  metric_timestamp TIMESTAMPTZ DEFAULT NOW() -- Renamed
);

CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL, -- For org-specific jobs
  job_type VARCHAR(50) NOT NULL, -- Renamed
  config_payload JSONB NOT NULL, -- Renamed
  schedule_cron VARCHAR(100), -- Renamed
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'running', 'completed', 'failed', 'cancelled', 'retry')), -- Added 'retry'
  result_payload JSONB, -- Renamed
  error_details TEXT, -- Renamed
  priority INTEGER DEFAULT 0, -- Added
  max_retries INTEGER DEFAULT 3, -- Added
  current_retry INTEGER DEFAULT 0, -- Added
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_executed_at TIMESTAMPTZ, -- Added
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL, -- Renamed
  search_filters JSONB DEFAULT '{}', -- Renamed
  search_scope VARCHAR(50) DEFAULT 'companies' CHECK (search_scope IN ('companies', 'contacts', 'insights', 'templates', 'all')), -- Added more scopes
  search_type VARCHAR(20) DEFAULT 'standard' CHECK (search_type IN ('standard', 'advanced', 'ai_assisted')), -- Added more types
  results_count INTEGER,
  execution_time_ms INTEGER, -- Added
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Keys can be org-specific
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Associated user (creator/owner)
  name VARCHAR(100) NOT NULL,
  key_prefix VARCHAR(10) NOT NULL UNIQUE, -- Added for quick identification
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- Hash of the actual key
  -- encrypted_key TEXT NOT NULL, -- Storing the actual key encrypted is an option, but often only hash is stored and key shown once.
  permissions JSONB DEFAULT '{}', -- e.g., {"companies": ["read"], "campaigns": ["read", "write"]}
  last_used_at TIMESTAMPTZ, -- Renamed
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Management & Access Control Tables (New)
CREATE TABLE user_roles ( -- For more granular, non-organization specific roles if needed, or detailed permissions
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'platform_admin', 'support_agent', 'beta_tester' (Distinct from team_members.role)
  permissions JSONB DEFAULT '{}', -- More granular permissions list
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_url VARCHAR(500) NOT NULL, -- Renamed
  event_types TEXT[] NOT NULL, -- Renamed, e.g., ['company.created', 'campaign.completed']
  secret_key VARCHAR(255), -- Renamed, for verifying payload
  is_active BOOLEAN DEFAULT TRUE,
  retry_policy JSONB DEFAULT '{"count": 3, "interval_seconds": 60}', -- More flexible retry
  timeout_duration_seconds INTEGER DEFAULT 30, -- Renamed
  custom_headers JSONB DEFAULT '{}', -- Renamed
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL, -- Renamed
  payload_data JSONB NOT NULL, -- Renamed
  response_status_code INTEGER, -- Renamed
  response_body_text TEXT, -- Renamed
  error_log TEXT, -- Renamed
  attempt_count INTEGER DEFAULT 1, -- Renamed
  delivered_at TIMESTAMPTZ, -- Timestamp of successful delivery
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')), -- Added status
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who uploaded
  file_name_original VARCHAR(255) NOT NULL, -- Renamed
  storage_file_name VARCHAR(255) NOT NULL, -- Renamed, actual name in storage (e.g., UUID.ext)
  mime_content_type VARCHAR(100) NOT NULL, -- Renamed
  file_size_bytes BIGINT NOT NULL, -- Renamed
  storage_path_url VARCHAR(500) NOT NULL, -- Renamed
  storage_bucket_name VARCHAR(100) NOT NULL, -- Renamed
  upload_purpose VARCHAR(50) NOT NULL CHECK (upload_purpose IN ('company_logo', 'scraper_screenshot', 'communication_attachment', 'user_avatar', 'document_generic', 'report_export')), -- Added more
  metadata_info JSONB DEFAULT '{}', -- Renamed
  is_public_access BOOLEAN DEFAULT FALSE, -- Renamed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW() -- Added updated_at
);

CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL CHECK (provider_name IN ('google', 'github', 'linkedin', 'microsoft', 'apple')), -- Renamed, added more
  provider_user_id_val VARCHAR(255) NOT NULL, -- Renamed
  email_address VARCHAR(255), -- Renamed
  display_name VARCHAR(255), -- Renamed
  profile_avatar_url TEXT, -- Renamed
  access_token_val TEXT, -- Renamed
  refresh_token_val TEXT, -- Renamed
  token_expires_at TIMESTAMPTZ, -- Renamed
  scopes TEXT[], -- Added: scopes granted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_name, provider_user_id_val)
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token_val VARCHAR(255) UNIQUE NOT NULL, -- Renamed
  refresh_token_val VARCHAR(255) UNIQUE, -- Renamed
  device_details JSONB DEFAULT '{}', -- Renamed
  ip_address_login TEXT, -- Renamed. Consider INET.
  user_agent_login TEXT, -- Renamed
  is_active_session BOOLEAN DEFAULT TRUE, -- Renamed
  session_expires_at TIMESTAMPTZ NOT NULL, -- Renamed
  last_accessed_time TIMESTAMPTZ DEFAULT NOW(), -- Renamed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_value VARCHAR(255) UNIQUE NOT NULL, -- Renamed
  token_expires_at TIMESTAMPTZ NOT NULL, -- Renamed
  used_at_time TIMESTAMPTZ, -- Renamed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format('CREATE TRIGGER update_%s_updated_at
                    BEFORE UPDATE ON %I
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
                  tbl, tbl);
  END LOOP;
END $$; 

-- Create indexes (Original File Schema Indexes + New Indexes)
-- Original Indexes
CREATE INDEX IF NOT EXISTS idx_scrapers_organization ON scrapers(organization_id); 
CREATE INDEX IF NOT EXISTS idx_discovered_companies_org ON discovered_companies(organization_id); 
CREATE INDEX IF NOT EXISTS idx_discovered_companies_name ON discovered_companies(name); 
CREATE INDEX IF NOT EXISTS idx_discovered_companies_domain ON discovered_companies(domain); 
CREATE INDEX IF NOT EXISTS idx_scraped_data_company ON scraped_data(company_id); 
CREATE INDEX IF NOT EXISTS idx_communications_org ON communications(organization_id); 
CREATE INDEX IF NOT EXISTS idx_communications_campaign ON communications(campaign_id); 
CREATE INDEX IF NOT EXISTS idx_company_relationships_org ON company_relationships(organization_id); 

-- Indexes for augmented/new fields in existing tables
CREATE INDEX IF NOT EXISTS idx_dsc_co_industry ON discovered_companies(industry);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_scraper_runs_scraper_id ON scraper_runs(scraper_id);
CREATE INDEX IF NOT EXISTS idx_scraper_runs_status ON scraper_runs(status);
CREATE INDEX IF NOT EXISTS idx_communications_contact_id ON communications(contact_id);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id ON campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);


-- Indexes for new tables (from New Schema, adapted)
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name); -- Added

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_company_id ON competitor_analysis(company_id);
CREATE INDEX IF NOT EXISTS idx_competitors_primary_company_id ON competitors(primary_company_id);
CREATE INDEX IF NOT EXISTS idx_competitors_competitor_company_id ON competitors(competitor_company_id);

CREATE INDEX IF NOT EXISTS idx_insights_company_id ON insights(company_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(insight_type);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read); -- Added

CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(metric_timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_tags ON metrics USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_background_jobs_status ON background_jobs(status);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_background_jobs_created_at ON background_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_background_jobs_last_executed ON background_jobs(last_executed_at); -- Added

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_org_id ON search_history(organization_id); -- Added

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(organization_id); -- Added

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON user_roles(role_name);

CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON webhooks(organization_id); -- Added
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN(event_types);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status); -- Added

CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_purpose ON file_uploads(upload_purpose);
CREATE INDEX IF NOT EXISTS idx_file_uploads_org_id ON file_uploads(organization_id); -- Added

CREATE INDEX IF NOT EXISTS idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_providers_provider_name ON oauth_providers(provider_name);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token_val);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token_val); -- Added

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token_value);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- GIN Indexes for full-text search on discovered_companies
CREATE INDEX IF NOT EXISTS discovered_companies_tsvector_en_idx ON discovered_companies USING GIN (searchable_tsvector_en);
CREATE INDEX IF NOT EXISTS discovered_companies_tsvector_fr_idx ON discovered_companies USING GIN (searchable_tsvector_fr);

-- Trigger to update searchable_tsvectors on insert or update for discovered_companies
DROP TRIGGER IF EXISTS tsvectorupdate_discovered_companies ON discovered_companies;
CREATE TRIGGER tsvectorupdate_discovered_companies
BEFORE INSERT OR UPDATE ON discovered_companies
FOR EACH ROW EXECUTE FUNCTION update_discovered_companies_tsvectors();

-- Enable RLS for all tables (Original + New)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY; 
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY; 
ALTER TABLE scrapers ENABLE ROW LEVEL SECURITY; 
ALTER TABLE scraper_configs ENABLE ROW LEVEL SECURITY; 
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovered_companies ENABLE ROW LEVEL SECURITY; 
ALTER TABLE company_relationships ENABLE ROW LEVEL SECURITY; 
ALTER TABLE scraped_data ENABLE ROW LEVEL SECURITY; 
ALTER TABLE scraper_runs ENABLE ROW LEVEL SECURITY; 
ALTER TABLE templates ENABLE ROW LEVEL SECURITY; 
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY; 
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY; 
ALTER TABLE communications ENABLE ROW LEVEL SECURITY; 
ALTER TABLE communication_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics_snapshots ENABLE ROW LEVEL SECURITY; 
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY; 

-- Enable RLS for new tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (from original File Schema - new tables would need their own specific policies)
CREATE POLICY "Org members can manage their organization" ON organizations
  USING (id IN (
    SELECT organization_id FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
  WITH CHECK (id IN (
    SELECT organization_id FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )); 

CREATE POLICY "Users can only access their own profile" ON users
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid()); 




-- Function to update searchable_tsvectors for discovered_companies
CREATE OR REPLACE FUNCTION update_discovered_companies_tsvectors()
RETURNS TRIGGER AS $$
DECLARE
  common_text TEXT;
BEGIN
  common_text :=
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.industry, '') || ' ' ||
    coalesce(NEW.location_text, '') || ' ' ||
    array_to_string(NEW.tags_list, ' ') || ' ' ||
    array_to_string(NEW.technologies_list, ' ');

  NEW.searchable_tsvector_en := to_tsvector('english', common_text);
  NEW.searchable_tsvector_fr := to_tsvector('french', common_text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 

 --tep 1: Modify the SECURITY DEFINER function to return an array of UUIDs. 

CREATE OR REPLACE FUNCTION public.get_user_organization_ids_array(p_user_id uuid)
RETURNS uuid[] -- Changed to return an array
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(organization_id) -- Aggregate into an array
  FROM team_members
  WHERE user_id = p_user_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_organization_ids_array(uuid) TO authenticated;


-- Drop the old policies if they were created or if you're re-running
DROP POLICY IF EXISTS "Team members can view their organization's members" ON public.team_members;
DROP POLICY IF EXISTS "Users can see their own team_member entries" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage their own membership details" ON public.team_members;
-- Drop the original recursive policy if it still exists
DROP POLICY IF EXISTS "Team members can view their org's data" ON public.team_members;


-- New Policy: Team members can view other members within their own organization(s).
CREATE POLICY "Team members can view their organization's members"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  organization_id = ANY (public.get_user_organization_ids_array(auth.uid())) -- Use = ANY with the array
);

-- New Policy: Users can always view their own specific team_member entry.
CREATE POLICY "Users can see their own team_member entries"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- New Policy: Users can update their own team_member entry.
CREATE POLICY "Users can manage their own membership details"
ON public.team_members
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);

-- (Keep notes about INSERT/DELETE policies as before)


--TABLE ADDED MANUALLY:
-- Create profiles table to link auth.users with application data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  platform_role VARCHAR(50) DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  UNIQUE(email)
);

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to select their own profile
CREATE POLICY "Users can select their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);


--WE FINALLY DECIDED TO USE THE USERS TABLE INSTEAD OF PROFILE
-- Function to insert into public.users when a new auth.users is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict do nothing; -- Prevents duplicate insert if already exists
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();