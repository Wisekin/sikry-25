export interface FinancialRecord {
  id: string
  organization_id: string
  source_type: "campaign" | "contact" | "scraper" | "subscription" | "manual" | "other"
  source_id?: string
  amount: number
  type: "revenue" | "cost" | "expense" | "refund"
  currency: string
  description?: string
  category?: string
  metadata: Record<string, any>
  recorded_at: string
  created_at: string
  updated_at: string
}

export interface CampaignROI {
  campaign_id: string
  campaign_name: string
  organization_id: string
  total_revenue: number
  total_costs: number
  net_profit: number
  roi_percentage: number
}

export interface FinancialSummary {
  total_revenue: number
  total_costs: number
  net_profit: number
  roi_percentage: number
  records_count: number
  currency: string
}

export interface FinancialFilters {
  source_type?: string
  type?: string
  currency?: string
  category?: string
  date_from?: string
  date_to?: string
  search?: string
}
