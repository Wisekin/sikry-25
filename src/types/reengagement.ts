export interface ReengagementTask {
  id: string
  organization_id: string
  contact_id?: string
  task_type: "auto_nurture" | "manual_followup" | "segment_campaign"
  trigger_criteria: Record<string, any>
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  priority: number
  scheduled_for?: string
  executed_at?: string
  campaign_id?: string
  results: Record<string, any>
  error_details?: string
  created_at: string
  updated_at: string
}

export interface LeadClassification {
  id: string
  organization_id: string
  contact_id: string
  classification: "hot" | "warm" | "cold" | "dormant" | "unresponsive"
  score: number
  factors: Record<string, any>
  last_activity_date?: string
  classification_date: string
  auto_classified: boolean
  notes?: string
  created_at: string
  updated_at: string
  contact?: any
}

export interface ReengagementTemplate {
  id: string
  organization_id: string
  name: string
  description?: string
  trigger_conditions: Record<string, any>
  template_id?: string
  sequence_order: number
  delay_days: number
  is_active: boolean
  success_metrics: Record<string, any>
  created_by?: string
  created_at: string
  updated_at: string
  template?: any
}

export interface ReengagementCriteria {
  days_since_contact: number
  min_engagement_score: number
  classification: string[]
  exclude_recent_campaigns: boolean
}
