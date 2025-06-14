export interface Funnel {
  id: string
  organization_id: string
  name: string
  description?: string
  funnel_type: "lead_nurture" | "onboarding" | "reactivation" | "sales" | "retention"
  status: "draft" | "active" | "paused" | "archived"

  // Configuration
  steps: FunnelStepConfig[]
  trigger_conditions: Record<string, any>
  exit_conditions: Record<string, any>

  // Metrics
  conversion_metrics: Record<string, any>
  total_enrolled: number
  total_completed: number
  total_dropped: number

  // Settings
  is_active: boolean
  max_concurrent_contacts: number
  cooldown_period_days: number

  created_by?: string
  created_at: string
  updated_at: string
}

export interface FunnelStep {
  id: string
  funnel_id: string
  step_order: number
  step_name: string
  step_type: "email" | "sms" | "wait" | "condition" | "action" | "webhook" | "task"

  // Configuration
  step_config: FunnelStepConfig
  success_criteria: Record<string, any>
  failure_criteria: Record<string, any>

  // Branching
  success_next_step_id?: string
  failure_next_step_id?: string
  default_next_step_id?: string

  // Performance
  total_entered: number
  total_completed: number
  total_failed: number

  created_at: string
  updated_at: string
}

export interface FunnelStepConfig {
  // Email/SMS step config
  template_id?: string
  subject?: string
  content?: string

  // Wait step config
  delay_hours?: number
  delay_days?: number
  wait_for_event?: string

  // Condition step config
  condition_type?: "engagement" | "response" | "time" | "custom"
  condition_value?: any

  // Action step config
  action_type?: "tag" | "score" | "assign" | "webhook"
  action_data?: Record<string, any>

  // General
  personalization?: Record<string, any>
  tracking_enabled?: boolean
}

export interface FunnelProgress {
  id: string
  funnel_id: string
  contact_id?: string
  company_id?: string

  // Progress
  current_step_id?: string
  status: "active" | "completed" | "dropped" | "paused"
  progress_percentage: number

  // Journey
  steps_completed: string[]
  step_results: Record<string, any>
  engagement_score: number

  // Timing
  started_at: string
  last_activity_at: string
  completed_at?: string
  next_action_at?: string

  // Context
  entry_source?: string
  entry_data: Record<string, any>

  created_at: string
  updated_at: string

  // Relations
  funnel?: Funnel
  contact?: any
  company?: any
}

export interface FunnelAnalytics {
  id: string
  funnel_id: string
  date_recorded: string

  // Daily metrics
  new_enrollments: number
  completions: number
  dropoffs: number
  active_contacts: number

  // Performance
  step_performance: Record<string, any>
  conversion_rates: Record<string, any>

  // Engagement
  avg_engagement_score: number
  avg_completion_time_hours: number

  created_at: string
}

export interface FunnelBuilderStep {
  id: string
  type: FunnelStep["step_type"]
  name: string
  config: FunnelStepConfig
  position: { x: number; y: number }
  connections: {
    success?: string
    failure?: string
    default?: string
  }
}
