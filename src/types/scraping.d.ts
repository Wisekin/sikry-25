export interface Scraper {
  id: string
  name: string
  description: string
  url: string
  type: "v1" | "v2" | "ai"
  status: "active" | "inactive" | "error" | "testing"
  config: ScraperConfig
  schedule?: {
    frequency: "hourly" | "daily" | "weekly" | "monthly"
    time?: string
    timezone?: string
  }
  lastRun?: string
  nextRun?: string
  stats: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    averageRunTime: number
    lastSuccessfulRun?: string
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ScraperConfig {
  selectors: FieldSelector[]
  pagination?: PaginationConfig
  authentication?: AuthConfig
  headers?: Record<string, string>
  cookies?: Record<string, string>
  proxy?: ProxyConfig
  rateLimit?: {
    requests: number
    period: number
  }
  retries?: number
  timeout?: number
}

export interface FieldSelector {
  id: string
  name: string
  selector: string
  type: "text" | "link" | "image" | "email" | "phone" | "number" | "date"
  required: boolean
  multiple: boolean
  transform?: string
  validation?: string
  confidence?: number
}

export interface PaginationConfig {
  type: "button" | "scroll" | "url"
  selector?: string
  maxPages?: number
  delay?: number
}

export interface AuthConfig {
  type: "basic" | "bearer" | "cookie" | "form"
  credentials: Record<string, string>
}

export interface ProxyConfig {
  host: string
  port: number
  username?: string
  password?: string
}

export interface ScrapeJob {
  id: string
  scraperId: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  startedAt?: string
  completedAt?: string
  duration?: number
  recordsFound: number
  recordsProcessed: number
  errors: ScrapeError[]
  results?: any[]
  logs: string[]
}

export interface ScrapeError {
  type: "selector" | "network" | "validation" | "timeout"
  message: string
  field?: string
  timestamp: string
}
