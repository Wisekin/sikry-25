export interface SearchResult {
  id: string
  name: string
  domain?: string
  description?: string
  industry?: string
  location_text?: string
  technologies?: string[]
  highlights?: Array<{
    field: string
    text: string
  }>
  confidence?: number
  source?: string
}

export interface QueryAnalysis {
  intent: "search" | "filter" | "compare" | "analyze"
  entities: {
    companies: Array<{ name: string; confidence: number }>
    locations: Array<{ name: string; confidence: number }>
    industries: Array<{ name: string; confidence: number }>
    technologies: Array<{ name: string; confidence: number }>
  }
  filters: {
    location?: { value: string; confidence: number }
    industry?: { value: string; confidence: number }
    size?: { min?: number; max?: number; confidence: number }
    revenue?: { min?: number; max?: number; confidence: number }
    founded?: { min?: number; max?: number; confidence: number }
    technologies?: Array<{ value: string; confidence: number }>
  }
  confidence: number
  originalQuery: string
  normalizedQuery: string
}

export type ExternalSource = "google" | "linkedin" | "crunchbase" | "wikidata" | "opencorporates"

export interface SearchResponse {
  success: boolean
  results: SearchResult[]
  totalCount: number
  suggestions?: string[]
  queryAnalysis?: QueryAnalysis
  meta?: {
    total: number
    page: number
    limit: number
    hasMore: boolean
    executionTime?: number
    sources?: string[]
  }
  analysis?: {
    topIndustries: Array<{ name: string; count: number }>
    topTechnologies: Array<{ name: string; count: number }>
    locationDistribution: Array<{ location: string; count: number }>
    averageCompanySize: number
  }
  source?: 'cache' | 'database' | 'external'
}
