import type { Contact, Campaign } from "./contacts_and_campaigns" // Assuming these interfaces are declared in another file

export interface ReviewRequest {
  id: string
  organization_id: string
  contact_id: string
  campaign_id?: string
  platform: "google" | "yelp" | "facebook" | "trustpilot" | "custom"
  review_url: string
  business_name?: string
  request_type: "post_interaction" | "post_appointment" | "post_campaign" | "manual"
  trigger_event?: string
  status: "pending" | "sent" | "clicked" | "completed" | "declined" | "expired"
  message_template_id?: string
  sent_via: "email" | "sms" | "whatsapp" | "in_app"
  requested_at: string
  sent_at?: string
  clicked_at?: string
  completed_at?: string
  expires_at: string
  metadata: Record<string, any>
  notes?: string
  created_at: string
  updated_at: string
  contact?: Contact
  campaign?: Campaign
}

export interface ReviewCampaign {
  id: string
  organization_id: string
  name: string
  description?: string
  platform: "google" | "yelp" | "facebook" | "trustpilot" | "custom"
  review_url: string
  auto_trigger: boolean
  trigger_conditions: Record<string, any>
  delay_hours: number
  email_template_id?: string
  sms_template_id?: string
  status: "active" | "paused" | "completed" | "archived"
  total_requests: number
  total_sent: number
  total_clicked: number
  total_completed: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ReviewAnalytics {
  id: string
  organization_id: string
  date: string
  period_type: "daily" | "weekly" | "monthly"
  platform: string
  requests_sent: number
  requests_clicked: number
  requests_completed: number
  click_rate: number
  completion_rate: number
  estimated_value: number
  currency: string
  created_at: string
}

export interface ReviewStats {
  total_requests: number
  total_sent: number
  total_clicked: number
  total_completed: number
  click_rate: number
  completion_rate: number
  platform_breakdown: Array<{
    platform: string
    requests: number
    completed: number
    rate: number
  }>
  recent_activity: ReviewRequest[]
}
