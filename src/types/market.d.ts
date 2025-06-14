export interface MarketIntelligence {
  id: string
  companyId: string
  type: "competitor" | "partner" | "supplier" | "customer" | "investor"
  relationship: {
    strength: number
    confidence: number
    lastUpdated: string
    source: string[]
  }
  insights: MarketInsight[]
  trends: MarketTrend[]
  opportunities: Opportunity[]
  threats: Threat[]
  createdAt: string
  updatedAt: string
}

export interface MarketInsight {
  id: string
  type: "funding" | "acquisition" | "partnership" | "product-launch" | "hiring" | "expansion"
  title: string
  description: string
  impact: "low" | "medium" | "high" | "critical"
  confidence: number
  source: string
  url?: string
  date: string
  relevanceScore: number
  tags: string[]
}

export interface MarketTrend {
  id: string
  category: string
  trend: string
  direction: "up" | "down" | "stable"
  strength: number
  timeframe: string
  dataPoints: TrendDataPoint[]
  predictions: TrendPrediction[]
}

export interface TrendDataPoint {
  date: string
  value: number
  source: string
}

export interface TrendPrediction {
  date: string
  predictedValue: number
  confidence: number
  factors: string[]
}

export interface Opportunity {
  id: string
  type: "market-gap" | "partnership" | "acquisition" | "expansion" | "technology"
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  potential: {
    revenue?: number
    marketShare?: number
    timeToMarket?: number
  }
  requirements: string[]
  risks: string[]
  timeline: string
  confidence: number
  createdAt: string
}

export interface Threat {
  id: string
  type: "competitor" | "regulation" | "technology" | "market-shift" | "economic"
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  probability: number
  impact: {
    revenue?: number
    marketShare?: number
    timeline?: string
  }
  mitigation: string[]
  monitoring: string[]
  confidence: number
  createdAt: string
}

export interface CompetitorAnalysis {
  companyId: string
  competitors: Competitor[]
  marketPosition: {
    rank: number
    marketShare: number
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  benchmarks: Benchmark[]
  lastUpdated: string
}

export interface Competitor {
  companyId: string
  name: string
  domain: string
  relationship: "direct" | "indirect" | "potential"
  similarity: number
  marketShare: number
  strengths: string[]
  weaknesses: string[]
  recentActivity: MarketInsight[]
}

export interface Benchmark {
  metric: string
  ourValue: number
  competitorAverage: number
  marketLeader: number
  percentile: number
  trend: "improving" | "declining" | "stable"
}
