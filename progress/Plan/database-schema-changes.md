# Database Schema Changes for Search-Scraper Integration

**Created:** 2025-01-27  
**Last Updated:** 2025-01-27  
**Status:** Planning Phase  
**Priority:** High  

---

## 📋 Summary

This document outlines the required database schema changes to support the search-scraper integration. The existing schema already has excellent foundations with `scrapers`, `scraper_configs`, `scraper_runs`, and `scraped_data` tables. We need to add new tables for discovery tracking and enhance existing tables for better integration.

---

## ✅ Existing Tables We Can Leverage

### **Core Scraping Infrastructure**
1. **`scrapers`** - Already has V2 scraper support with `scraper_type`, `target_url_template`, `scraper_stats`
2. **`scraper_configs`** - Has JSONB config field perfect for V2 configurations
3. **`scraper_runs`** - Tracks execution with status, target_url, error handling
4. **`scraped_data`** - Stores extracted data with `data_type`, `extracted_fields`, `quality_score`

### **Company & Search Infrastructure**
5. **`discovered_companies`** - Main companies table with rich fields including `last_scraped_at`
6. **`search_history`** - Tracks search queries and results
7. **`background_jobs`** - Perfect for queuing scraping jobs
8. **`system_logs`** - For monitoring and debugging

---

## 🔧 Required Schema Changes

### **New Tables to Add**

#### **1. Discovery Requests Table**
```sql
-- Track website discovery requests
CREATE TABLE discovery_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'discovering', 'found', 'not_found', 'error')),
  discovered_websites JSONB DEFAULT '[]', -- Array of website suggestions
  selected_website TEXT,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. Website Discovery Cache Table**
```sql
-- Cache discovered websites to avoid repeated API calls
CREATE TABLE website_discovery_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  discovered_websites JSONB NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, company_name, search_query)
);
```

#### **3. Enriched Company Data Table**
```sql
-- Store enriched data from scraping
CREATE TABLE enriched_company_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  company_id UUID REFERENCES discovered_companies(id) ON DELETE CASCADE,
  scraper_run_id UUID REFERENCES scraper_runs(id) ON DELETE SET NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('contact_info', 'company_profile', 'social_media', 'products_services', 'financial_data', 'other')),
  enriched_fields JSONB NOT NULL, -- Structured enriched data
  source_url TEXT NOT NULL,
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  enrichment_method TEXT NOT NULL DEFAULT 'scraping' CHECK (enrichment_method IN ('scraping', 'api', 'manual', 'ai_generated')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **4. Scraping Templates Table**
```sql
-- Store reusable scraping templates
CREATE TABLE scraping_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('company_profile', 'contact_info', 'social_media', 'products', 'custom')),
  config JSONB NOT NULL, -- V2 scraper configuration
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  success_rate NUMERIC(3,2) DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Modifications to Existing Tables**

#### **1. Enhance `discovered_companies` Table**
```sql
-- Add new columns for discovery integration
ALTER TABLE discovered_companies 
ADD COLUMN IF NOT EXISTS discovery_status TEXT DEFAULT 'not_discovered' CHECK (discovery_status IN ('not_discovered', 'discovering', 'discovered', 'failed')),
ADD COLUMN IF NOT EXISTS discovered_website TEXT,
ADD COLUMN IF NOT EXISTS discovery_confidence NUMERIC(3,2) CHECK (discovery_confidence BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS last_discovery_attempt TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS enrichment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_freshness_score NUMERIC(3,2) DEFAULT 0 CHECK (data_freshness_score BETWEEN 0 AND 1);
```

#### **2. Enhance `scraper_runs` Table**
```sql
-- Add discovery-related fields
ALTER TABLE scraper_runs 
ADD COLUMN IF NOT EXISTS discovery_request_id UUID REFERENCES discovery_requests(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS enrichment_target_id UUID REFERENCES discovered_companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE;
```

#### **3. Enhance `scraped_data` Table**
```sql
-- Add enrichment tracking
ALTER TABLE scraped_data 
ADD COLUMN IF NOT EXISTS enrichment_id UUID REFERENCES enriched_company_data(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS discovery_source BOOLEAN DEFAULT FALSE;
```

---

## 📊 Performance Indexes

### **Discovery Performance Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_discovery_requests_company_id ON discovery_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_status ON discovery_requests(status);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_created_at ON discovery_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_discovery_requests_user_id ON discovery_requests(user_id);
```

### **Website Discovery Cache Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_website_discovery_cache_company_name ON website_discovery_cache(company_name);
CREATE INDEX IF NOT EXISTS idx_website_discovery_cache_expires_at ON website_discovery_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_website_discovery_cache_org_query ON website_discovery_cache(organization_id, search_query);
```

### **Enriched Data Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_enriched_company_data_company_id ON enriched_company_data(company_id);
CREATE INDEX IF NOT EXISTS idx_enriched_company_data_type ON enriched_company_data(data_type);
CREATE INDEX IF NOT EXISTS idx_enriched_company_data_confidence ON enriched_company_data(confidence_score);
CREATE INDEX IF NOT EXISTS idx_enriched_company_data_created_at ON enriched_company_data(created_at);
```

### **Scraping Templates Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_scraping_templates_type ON scraping_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_scraping_templates_public ON scraping_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_scraping_templates_usage ON scraping_templates(usage_count DESC);
```

### **Enhanced Existing Table Indexes**
```sql
-- Enhanced discovered_companies indexes
CREATE INDEX IF NOT EXISTS idx_discovered_companies_discovery_status ON discovered_companies(discovery_status);
CREATE INDEX IF NOT EXISTS idx_discovered_companies_enrichment_count ON discovered_companies(enrichment_count);
CREATE INDEX IF NOT EXISTS idx_discovered_companies_data_freshness ON discovered_companies(data_freshness_score);

-- Enhanced scraper_runs indexes
CREATE INDEX IF NOT EXISTS idx_scraper_runs_discovery_request ON scraper_runs(discovery_request_id);
CREATE INDEX IF NOT EXISTS idx_scraper_runs_auto_generated ON scraper_runs(auto_generated);
CREATE INDEX IF NOT EXISTS idx_scraper_runs_enrichment_target ON scraper_runs(enrichment_target_id);
```

---

## 🔐 RLS Policies for New Tables

### **Discovery Requests Policies**
```sql
CREATE POLICY "Users can view their org's discovery requests" ON discovery_requests
  FOR ALL TO authenticated
  USING (organization_id = ANY (public.get_user_organization_ids_array(auth.uid())));
```

### **Website Discovery Cache Policies**
```sql
CREATE POLICY "Users can view their org's discovery cache" ON website_discovery_cache
  FOR ALL TO authenticated
  USING (organization_id = ANY (public.get_user_organization_ids_array(auth.uid())));
```

### **Enriched Company Data Policies**
```sql
CREATE POLICY "Users can view their org's enriched data" ON enriched_company_data
  FOR ALL TO authenticated
  USING (organization_id = ANY (public.get_user_organization_ids_array(auth.uid())));
```

### **Scraping Templates Policies**
```sql
CREATE POLICY "Users can view public templates and their org's templates" ON scraping_templates
  FOR ALL TO authenticated
  USING (is_public = TRUE OR organization_id = ANY (public.get_user_organization_ids_array(auth.uid())));
```

---

## 🔗 Data Integrity Constraints

### **Foreign Key Constraints**
```sql
-- Ensure discovery requests have valid company references
ALTER TABLE discovery_requests 
ADD CONSTRAINT fk_discovery_requests_company 
FOREIGN KEY (company_id) REFERENCES discovered_companies(id) ON DELETE CASCADE;

-- Ensure enriched data has valid company references
ALTER TABLE enriched_company_data 
ADD CONSTRAINT fk_enriched_data_company 
FOREIGN KEY (company_id) REFERENCES discovered_companies(id) ON DELETE CASCADE;

-- Ensure scraping templates have valid creators
ALTER TABLE scraping_templates 
ADD CONSTRAINT fk_scraping_templates_creator 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
```

### **Unique Constraints**
```sql
-- Ensure unique discovery requests per company per user per day
ALTER TABLE discovery_requests 
ADD CONSTRAINT unique_discovery_request 
UNIQUE (company_id, user_id, created_at::date);

-- Ensure unique website discovery cache entries
ALTER TABLE website_discovery_cache 
ADD CONSTRAINT unique_discovery_cache 
UNIQUE (organization_id, company_name, search_query);
```

---

## 🛠️ Database Functions for Integration

### **Company Discovery Status Management**
```sql
-- Function to update company discovery status
CREATE OR REPLACE FUNCTION update_company_discovery_status(
  p_company_id UUID,
  p_status TEXT,
  p_website TEXT DEFAULT NULL,
  p_confidence NUMERIC DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE discovered_companies 
  SET 
    discovery_status = p_status,
    discovered_website = p_website,
    discovery_confidence = p_confidence,
    last_discovery_attempt = NOW(),
    updated_at = NOW()
  WHERE id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Enrichment Count Management**
```sql
-- Function to increment enrichment count
CREATE OR REPLACE FUNCTION increment_company_enrichment_count(p_company_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discovered_companies 
  SET 
    enrichment_count = enrichment_count + 1,
    updated_at = NOW()
  WHERE id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Data Freshness Calculation**
```sql
-- Function to calculate data freshness score
CREATE OR REPLACE FUNCTION calculate_data_freshness_score(p_company_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  last_update TIMESTAMPTZ;
  days_since_update INTEGER;
  freshness_score NUMERIC;
BEGIN
  SELECT MAX(updated_at) INTO last_update
  FROM enriched_company_data
  WHERE company_id = p_company_id;
  
  IF last_update IS NULL THEN
    RETURN 0;
  END IF;
  
  days_since_update := EXTRACT(DAY FROM NOW() - last_update);
  
  -- Calculate freshness score (1.0 = fresh, 0.0 = stale)
  freshness_score := GREATEST(0, 1 - (days_since_update::NUMERIC / 30));
  
  -- Update the company's freshness score
  UPDATE discovered_companies 
  SET data_freshness_score = freshness_score
  WHERE id = p_company_id;
  
  RETURN freshness_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Template Usage Tracking**
```sql
-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE scraping_templates 
  SET 
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📋 Migration Strategy

### **Phase 1: Foundation (Week 1-2)**
```sql
-- Migration 001: Add discovery_requests table
-- Migration 002: Add website_discovery_cache table
-- Migration 003: Enhance discovered_companies table (discovery fields)
-- Migration 004: Add initial indexes
```

### **Phase 2: Enrichment (Week 3-4)**
```sql
-- Migration 005: Add enriched_company_data table
-- Migration 006: Add scraping_templates table
-- Migration 007: Enhance scraper_runs table
-- Migration 008: Add enrichment indexes
```

### **Phase 3: Optimization (Week 5-6)**
```sql
-- Migration 009: Add performance indexes
-- Migration 010: Add data partitioning (if needed)
-- Migration 011: Add data archival strategy
```

---

## 🧪 Testing Queries

### **Discovery Status Check**
```sql
-- Check discovery status for a company
SELECT 
  dc.name,
  dc.discovery_status,
  dc.discovered_website,
  dc.discovery_confidence,
  dc.last_discovery_attempt
FROM discovered_companies dc
WHERE dc.id = 'company-uuid-here';
```

### **Enrichment Data Summary**
```sql
-- Get enrichment summary for a company
SELECT 
  dc.name,
  dc.enrichment_count,
  dc.data_freshness_score,
  COUNT(ecd.id) as total_enrichments,
  AVG(ecd.confidence_score) as avg_confidence
FROM discovered_companies dc
LEFT JOIN enriched_company_data ecd ON dc.id = ecd.company_id
WHERE dc.id = 'company-uuid-here'
GROUP BY dc.id, dc.name, dc.enrichment_count, dc.data_freshness_score;
```

### **Template Usage Analytics**
```sql
-- Get template usage statistics
SELECT 
  template_type,
  COUNT(*) as total_templates,
  AVG(usage_count) as avg_usage,
  AVG(success_rate) as avg_success_rate
FROM scraping_templates
GROUP BY template_type
ORDER BY avg_usage DESC;
```

---

## 📊 Monitoring Queries

### **Discovery Success Rate**
```sql
-- Calculate discovery success rate
SELECT 
  COUNT(CASE WHEN status = 'found' THEN 1 END) * 100.0 / COUNT(*) as success_rate,
  COUNT(*) as total_requests
FROM discovery_requests
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### **Enrichment Performance**
```sql
-- Monitor enrichment performance
SELECT 
  data_type,
  COUNT(*) as total_enrichments,
  AVG(confidence_score) as avg_confidence,
  COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_count
FROM enriched_company_data
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY data_type
ORDER BY total_enrichments DESC;
```

### **Cache Hit Rate**
```sql
-- Monitor cache effectiveness
SELECT 
  COUNT(*) as cache_hits,
  COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_entries
FROM website_discovery_cache
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## 🚨 Important Notes

1. **Backup Strategy**: Always backup the database before running migrations
2. **Rollback Plan**: Each migration should have a corresponding rollback script
3. **Testing**: Test all migrations in staging environment first
4. **Performance**: Monitor query performance after adding new indexes
5. **Security**: Ensure RLS policies are properly tested with different user roles

---

*This document should be updated as the schema evolves during implementation.* 