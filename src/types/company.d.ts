export interface Company {
  id: string
  name: string
  domain: string
  industry: string
  size: "startup" | "small" | "medium" | "large" | "enterprise"
  location_text: string
  contacts: Contact[]
  financials: {
    revenue?: number
    funding?: number
    valuation?: number
    employees?: number
  }
  technology: {
    stack: string[]
    tools: string[]
    integrations: string[]
  }
  social: {
    linkedin?: string
    twitter?: string
    facebook?: string
    website?: string
  }
  confidence: number
  lastUpdated: string
  createdAt: string
  tags: string[]
  notes: string
  status: "active" | "inactive" | "prospect" | "customer"
}

export interface Contact {
  id: string
  companyId: string
  name: string
  email: string
  phone?: string
  role: string
  department: string
  linkedin?: string
  confidence: number
  verified: boolean
  lastContacted?: string
  engagementScore: number
}

export interface CompanyInsight {
  id: string
  companyId: string
  type: "news" | "funding" | "hiring" | "technology" | "partnership"
  title: string
  description: string
  source: string
  url?: string
  confidence: number
  createdAt: string
  relevanceScore: number
}

export interface CompanyFilter {
  industry?: string[]
  size?: Company["size"][]
  location?: string[]
  technology?: string[]
  revenue?: { min?: number; max?: number }
  employees?: { min?: number; max?: number }
  confidence?: { min?: number; max?: number }
}
