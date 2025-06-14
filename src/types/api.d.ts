export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  errors?: ApiError[]
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: any
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: "asc" | "desc"
}

export interface SearchParams extends PaginationParams {
  query?: string
  filters?: Record<string, any>
  scope?: 'companies' | 'contacts' | 'all'
}

export interface ParsedSearchQuery {
  industry?: string
  location?: string
  filters?: {
    max_employees?: number
    min_employees?: number
    [key: string]: any
  }
  keywords?: string[]
}

export interface SearchResult {
  id: string
  name: string
  description?: string
  industry?: string
  location?: string
  employee_count?: number
  website?: string
  searchable?: string
  [key: string]: any
}

export interface SearchResponse<T> {
  results: T[]
  total: number
  facets?: Record<string, FacetResult[]>
  suggestions?: string[]
  queryTime: number
  page: number
  limit: number
}

export interface FacetResult {
  value: string
  count: number
  selected?: boolean
}

export interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  signature: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  services: ServiceHealth[]
  version: string
  uptime: number
}

export interface ServiceHealth {
  name: string
  status: "healthy" | "degraded" | "unhealthy"
  responseTime?: number
  lastCheck: string
  details?: any
}
