export interface LeadResponseRule {
  id: string
  organization_id: string

  // Rule Configuration
  name: string
  description?: string
  is_active: boolean
  priority: number

  // Trigger Conditions
  trigger_sources: string[] // ['vsl_capture', 'form_submission', 'api_import']
  trigger_conditions: Record<string, any>

  // Response Configuration
  response_delay_seconds: number
  max_response_delay_seconds: number

  // Response Actions
  send_email: boolean
  send_sms: boolean
  make_call: boolean
  create_task: boolean

  // Templates
  email_template_id?: string
  sms_template_id?: string

  // Assignment Rules
  auto_assign: boolean
  assign_to_user_id?: string
  assign_by_territory: boolean
  assign_round_robin: boolean

  // Business Hours
  respect_business_hours: boolean
  business_hours_start: string
  business_hours_end: string
  business_days: number[] // [1,2,3,4,5] for Monday-Friday
  timezone: string

  // Retry Logic
  max_retry_attempts: number
  retry_delay_minutes: number
  escalate_on_failure: boolean
  escalation_user_id?: string

  // Performance Tracking
  total_triggered: number
  successful_responses: number
  failed_responses: number
  avg_response_time_seconds: number

  // Timestamps
  created_by?: string
  created_at: string
  updated_at: string
}

export interface LeadResponseQueueItem {
  id: string
  organization_id: string

  // Queue Details
  rule_id: string
  lead_capture_id?: string
  contact_id?: string

  // Lead Information
  lead_email: string
  lead_name?: string
  lead_phone?: string
  lead_company?: string
  lead_source: string

  // Response Configuration
  response_actions: ResponseActions
  scheduled_at: string

  // Processing Status
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  attempts: number
  max_attempts: number

  // Assignment
  assigned_to?: string
  assigned_at?: string

  // Results
  email_sent: boolean
  email_sent_at?: string
  email_message_id?: string

  sms_sent: boolean
  sms_sent_at?: string
  sms_message_id?: string

  call_attempted: boolean
  call_attempted_at?: string
  call_duration_seconds: number
  call_outcome?: "answered" | "voicemail" | "busy" | "no_answer" | "failed"

  task_created: boolean
  task_id?: string

  // Error Handling
  last_error?: string
  error_count: number

  // Performance Metrics
  response_time_seconds?: number
  engagement_detected: boolean
  engagement_type?: "email_open" | "email_click" | "sms_reply" | "call_answer"

  // Timestamps
  created_at: string
  processed_at?: string
  completed_at?: string
  updated_at: string
}

export interface ResponseActions {
  send_email: boolean
  send_sms: boolean
  make_call: boolean
  create_task: boolean
  email_template_id?: string
  sms_template_id?: string
  assign_to_user_id?: string
}

export interface LeadResponseLog {
  id: string
  organization_id: string

  // Log Details
  queue_id: string
  action_type: "email" | "sms" | "call" | "task" | "assignment"

  // Action Details
  action_data: Record<string, any>
  result: "success" | "failed" | "skipped"
  result_message?: string

  // Performance
  execution_time_ms?: number

  // Timestamps
  executed_at: string
  created_at: string
}

export interface LeadResponseAnalytics {
  id: string
  organization_id: string

  // Analytics Period
  date_period: string
  rule_id?: string

  // Volume Metrics
  total_leads: number
  leads_responded: number
  leads_failed: number

  // Timing Metrics
  avg_response_time_seconds: number
  min_response_time_seconds: number
  max_response_time_seconds: number
  within_sla_count: number

  // Channel Performance
  emails_sent: number
  emails_opened: number
  emails_clicked: number

  sms_sent: number
  sms_replied: number

  calls_attempted: number
  calls_answered: number

  tasks_created: number
  tasks_completed: number

  // Conversion Metrics
  leads_converted: number
  conversion_value: number

  // Timestamps
  created_at: string
  updated_at: string
}

export interface LeadResponseFilters {
  rule_id?: string
  status?: string
  lead_source?: string
  assigned_to?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface LeadResponseStats {
  total_pending: number
  total_processing: number
  total_completed: number
  total_failed: number
  avg_response_time: number
  success_rate: number
}
