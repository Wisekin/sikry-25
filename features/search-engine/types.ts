export interface SearchFilters {
  location?: string
  industry?: string[]
  size?: {
    min?: number
    max?: number
  }
  revenue?: {
    min?: number
    max?: number
  }
  founded?: {
    min?: number
    max?: number
  }
  technologies?: string[]
  funding?: string[]
}

export interface SearchScope {
  companies: boolean
  contacts: boolean
  news: boolean
  social: boolean
  patents: boolean
  jobs: boolean
}

export interface SearchResult {
  id: string
  type: "company" | "contact" | "news" | "social"
  title: string
  description: string
  url?: string
  confidence: number
  metadata: Record<string, any>
  highlights: string[]
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  facets: Record<string, Array<{ value: string; count: number }>>
  suggestions: string[]
  queryAnalysis: {
    intent: string
    entities: string[]
    filters: SearchFilters
    scope: SearchScope
  }
  executionTime: number
}

export interface SearchState {
  query: string
  filters: SearchFilters
  scope: SearchScope
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
}
