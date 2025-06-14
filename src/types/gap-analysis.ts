export interface GapAnalysis {
  id: string
  organization_id: string
  contact_id?: string
  company_id?: string

  // Analysis data
  analysis_type:
    | "business_assessment"
    | "technical_audit"
    | "market_analysis"
    | "security_review"
    | "process_optimization"
  snapshot_data: Record<string, any>
  form_responses: Record<string, any>
  scraped_data: Record<string, any>

  // AI Generation
  generated_letter?: string
  letter_template_id?: string
  ai_provider?: "openai" | "claude" | "local" | "template_fallback"
  generation_prompt?: string
  generation_metadata: Record<string, any>

  // Scoring
  overall_score: number
  gap_scores: Record<string, number>
  priority_areas: string[]

  // Performance
  letter_sent: boolean
  letter_opened: boolean
  letter_responded: boolean
  response_sentiment?: "positive" | "neutral" | "negative"

  // Status
  status: "draft" | "generated" | "sent" | "responded"
  regeneration_count: number
  last_regenerated_at?: string

  created_by?: string
  created_at: string
  updated_at: string

  // Relations
  contact?: any
  company?: any
  template?: any
}

export interface GapAnalysisTemplate {
  id: string
  organization_id: string
  name: string
  description?: string

  // Configuration
  analysis_type: string
  industry?: string
  target_company_size?: "startup" | "small" | "medium" | "enterprise"

  // Form structure
  assessment_questions: AssessmentQuestion[]
  scoring_criteria: Record<string, any>
  gap_categories: string[]

  // Letter generation
  letter_template: string
  ai_prompt_template?: string
  personalization_fields: string[]

  // Settings
  is_active: boolean
  is_public: boolean

  created_by?: string
  created_at: string
  updated_at: string
}

export interface AssessmentQuestion {
  id: string
  category: string
  question: string
  type: "scale" | "multiple_choice" | "text" | "boolean" | "number"
  options?: string[]
  weight: number
  required: boolean
  help_text?: string
}

export interface GapAnalysisResponse {
  id: string
  gap_analysis_id: string
  question_id: string
  question_text: string

  // Response
  response_value: string
  response_score: number
  response_weight: number

  // Analysis
  gap_identified: boolean
  gap_severity?: "low" | "medium" | "high" | "critical"
  improvement_suggestion?: string

  created_at: string
}

export interface AIGenerationLog {
  id: string
  gap_analysis_id: string

  // Generation
  provider: string
  model_used?: string
  prompt_used: string
  response_received?: string

  // Performance
  generation_time_ms?: number
  token_count?: number
  cost_estimate?: number

  // Quality
  quality_score?: number
  human_rating?: number

  // Status
  status: "completed" | "failed" | "timeout"
  error_message?: string

  created_at: string
}

export interface GapAnalysisFormData {
  analysis_type: string
  template_id?: string
  contact_id?: string
  company_id?: string
  responses: Record<string, any>
  additional_context?: string
}
