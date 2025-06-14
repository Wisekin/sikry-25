export interface VSLPage {
  id: string
  organization_id: string

  // Page Configuration
  name: string
  slug: string
  title: string
  description?: string

  // VSL Content
  video_url?: string
  video_thumbnail_url?: string
  video_duration_seconds?: number

  // Page Design
  template_type: "standard" | "minimal" | "premium"
  primary_color: string
  secondary_color: string
  background_type: "solid" | "gradient" | "image"
  background_value?: string

  // Content Sections
  headline: string
  subheadline?: string
  bullet_points: string[]
  testimonials: Testimonial[]

  // Call to Action
  cta_text: string
  cta_url?: string
  cta_button_color: string

  // Meta Pixel & Tracking
  meta_pixel_id?: string
  google_analytics_id?: string
  custom_tracking_code?: string

  // SEO & Meta
  meta_title?: string
  meta_description?: string
  og_image_url?: string

  // Settings
  is_published: boolean
  requires_opt_in: boolean
  collect_phone: boolean
  collect_company: boolean

  // Performance
  view_count: number
  conversion_count: number
  avg_watch_time_seconds: number

  // Timestamps
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Testimonial {
  name: string
  company?: string
  content: string
  rating?: number
  image_url?: string
}

export interface AdClick {
  id: string
  organization_id: string

  // Click Details
  vsl_page_id?: string
  campaign_id?: string

  // UTM Parameters
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string

  // Meta Ad Specific
  fbclid?: string
  ad_id?: string
  ad_set_id?: string
  campaign_name?: string

  // Visitor Information
  ip_address?: string
  user_agent?: string
  referrer_url?: string
  landing_url?: string

  // Geographic Data
  country_code?: string
  region?: string
  city?: string

  // Device Information
  device_type?: "desktop" | "mobile" | "tablet"
  browser?: string
  operating_system?: string

  // Engagement Tracking
  time_on_page_seconds: number
  video_watch_percentage: number
  scrolled_percentage: number
  clicked_cta: boolean

  // Conversion Tracking
  converted: boolean
  conversion_value?: number
  conversion_type?: "lead" | "sale" | "signup" | "download"

  // Session Information
  session_id?: string
  is_returning_visitor: boolean

  // Timestamps
  clicked_at: string
  converted_at?: string
  created_at: string
}

export interface VSLPageView {
  id: string
  organization_id: string

  // View Details
  vsl_page_id: string
  ad_click_id?: string

  // Visitor Session
  session_id: string
  visitor_id?: string

  // View Metrics
  view_duration_seconds: number
  video_started: boolean
  video_completed: boolean
  video_watch_time_seconds: number
  max_scroll_percentage: number

  // Interaction Events
  interactions: InteractionEvent[]
  form_submissions: number
  cta_clicks: number

  // Technical Details
  page_load_time_ms?: number
  bounce: boolean

  // Timestamps
  started_at: string
  ended_at?: string
  created_at: string
}

export interface InteractionEvent {
  type: "scroll" | "click" | "video_play" | "video_pause" | "form_focus" | "cta_hover"
  timestamp: number
  data?: Record<string, any>
}

export interface VSLLeadCapture {
  id: string
  organization_id: string

  // Lead Source
  vsl_page_id: string
  ad_click_id?: string
  page_view_id?: string

  // Lead Information
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  company_name?: string

  // Capture Context
  capture_method: "form" | "popup" | "exit_intent"
  form_position?: "top" | "middle" | "bottom" | "popup"
  video_timestamp_seconds?: number

  // Lead Quality Scoring
  lead_score: number
  engagement_score: number
  urgency_level: "low" | "medium" | "high" | "urgent"

  // UTM Attribution
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string

  // Processing Status
  processed: boolean
  assigned_to?: string
  follow_up_scheduled_at?: string

  // Integration Status
  added_to_crm: boolean
  crm_contact_id?: string

  // Timestamps
  captured_at: string
  processed_at?: string
  created_at: string
}

export interface VSLPageAnalytics {
  total_views: number
  unique_visitors: number
  avg_watch_time: number
  conversion_rate: number
  top_traffic_sources: Array<{
    source: string
    clicks: number
  }>
}

export interface VSLPageFilters {
  template_type?: string
  is_published?: boolean
  created_by?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface AdClickFilters {
  vsl_page_id?: string
  utm_source?: string
  utm_campaign?: string
  device_type?: string
  converted?: boolean
  date_from?: string
  date_to?: string
}
