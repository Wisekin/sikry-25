// Complete database types matching schema.sql exactly
export interface Organization {
  id: string
  name: string
  slug: string
  billing_email?: string
  plan: "starter" | "pro" | "enterprise"
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  password_hash?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  platform_role: string
  preferences: Record<string, any>
  last_login?: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  user_id: string
  organization_id: string
  role: "owner" | "admin" | "member"
  created_at: string
  updated_at: string
  user?: User
  organization?: Organization
}

export interface Scraper {
  id: string
  organization_id: string
  name: string
  description?: string
  scraper_type?: string
  target_url_template?: string
  status: "idle" | "running" | "paused" | "failed"
  scraper_stats: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ScraperConfig {
  id: string
  scraper_id: string
  version: number
  config: {
    mainSelector?: string
    fieldSelectors: Record<string, string>
    aiAssist: boolean
    schedule?: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

// EXACT schema match for discovered_companies
export interface DiscoveredCompany {
  id: string
  organization_id: string
  search_id?: string
  name: string
  domain?: string
  description?: string
  logo_url?: string
  industry?: string
  location_text?: string // Schema field name
  founded_year?: number
  employee_count?: string
  revenue_range?: string
  technologies_list?: string[]
  source_url: string
  confidence_score?: number
  last_scraped_at?: string
  company_size?: string // Schema field name
  location_structured?: Record<string, any> // Schema field name
  financials_data?: Record<string, any> // Schema field name
  technology_profile?: Record<string, any> // Schema field name
  social_media_profiles?: Record<string, any> // Schema field name
  company_status: string // Schema field name
  tags_list?: string[] // Schema field name
  internal_notes?: string // Schema field name
  searchable_tsvector?: string // Schema field name
  is_verified: boolean // Schema field name
  created_at: string
  updated_at: string
}

// EXACT schema match for contacts
export interface Contact {
  id: string
  organization_id: string
  company_id?: string
  name: string
  email?: string
  phone?: string
  role?: string
  department?: string
  linkedin_url?: string // Schema field name
  confidence_score: number
  is_verified: boolean // Schema field name
  last_contacted_at?: string // Schema field name
  engagement_score: number
  source?: string
  created_at: string
  updated_at: string
  company?: DiscoveredCompany
}

// EXACT schema match for templates
export interface Template {
  id: string
  organization_id: string
  name: string
  template_type: "email" | "sms" | "whatsapp" | "linkedin_message" | "other" // Schema field name
  subject?: string
  content: string
  variables: Record<string, any>
  template_tags?: string[] // Schema field name
  is_public: boolean // Schema field name
  spam_score?: number // Schema field name
  created_by?: string
  created_at: string
  updated_at: string
}

// EXACT schema match for campaigns
export interface Campaign {
  id: string
  organization_id: string
  name: string
  template_id?: string
  campaign_type?: string // Schema field name
  status: "draft" | "scheduled" | "running" | "completed" | "paused" | "failed"
  target_filters?: Record<string, any> // Schema field name
  campaign_stats: Record<string, any> // Schema field name
  scheduled_for?: string // Schema field name (renamed from scheduled_at)
  completed_at?: string
  created_by?: string
  created_at: string
  updated_at: string
  template?: Template
}

// EXACT schema match for campaign_recipients
export interface CampaignRecipient {
  id: string
  campaign_id: string
  contact_id?: string
  company_id?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "replied" | "bounced" | "unsubscribed" | "failed"
  status_details: Record<string, any> // Schema field name
  sent_at?: string
  opened_at?: string
  replied_at?: string
  created_at: string
  updated_at: string
  contact?: Contact
  company?: DiscoveredCompany
}

// EXACT schema match for communications
export interface Communication {
  id: string
  organization_id: string
  campaign_id?: string
  recipient_id?: string
  contact_id?: string
  company_id?: string
  channel: "email" | "sms" | "whatsapp" | "call" | "linkedin" | "other"
  direction: "inbound" | "outbound"
  subject?: string
  content: string
  personalization_data?: Record<string, any> // Schema field name
  status: "pending" | "sent" | "delivered" | "read" | "failed" | "received" | "answered"
  bounce_reason?: string // Schema field name
  metadata: Record<string, any>
  sent_at?: string
  received_at?: string
  opened_at?: string
  replied_at?: string
  created_at: string
  updated_at: string
  contact?: Contact
  company?: DiscoveredCompany
  campaign?: Campaign
}

// Additional schema tables
export interface Insight {
  id: string
  organization_id: string
  company_id: string
  insight_type: string
  title: string
  description?: string
  impact_assessment?: string
  confidence_level?: number
  source_name?: string
  source_url?: string
  relevance_score?: number
  insight_tags?: string[]
  discovered_date?: string
  created_at: string
  updated_at: string
  company?: DiscoveredCompany
}

export interface Notification {
  id: string
  organization_id?: string
  user_id: string
  notification_type: string
  title: string
  message?: string
  data?: Record<string, any>
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface SystemLog {
  id: string
  log_level: "info" | "warn" | "error" | "debug" | "critical"
  message: string
  category: "api" | "scraper" | "user" | "system" | "security" | "database" | "integration"
  metadata: Record<string, any>
  user_id?: string
  session_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}
