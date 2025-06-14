import type { Company, CompanyInsight } from "@/types/company"
import type { MarketIntelligence, MarketInsight } from "@/types/market"

export interface LeadScore {
  total: number
  breakdown: {
    company: number
    engagement: number
    market: number
    timing: number
  }
  factors: ScoringFactor[]
  recommendation: "hot" | "warm" | "cold" | "nurture"
}

export interface ScoringFactor {
  category: string
  factor: string
  score: number
  weight: number
  impact: "positive" | "negative" | "neutral"
  description: string
}

export function calculateLeadScore(
  company: Company,
  insights: CompanyInsight[],
  marketIntel: MarketIntelligence,
): LeadScore {
  const factors: ScoringFactor[] = []

  // Company scoring (40% weight)
  const companyScore = calculateCompanyScore(company, factors)

  // Engagement scoring (25% weight)
  const engagementScore = calculateEngagementScore(company, factors)

  // Market intelligence scoring (25% weight)
  const marketScore = calculateMarketScore(marketIntel, factors)

  // Timing scoring (10% weight)
  const timingScore = calculateTimingScore(insights, factors)

  const total = Math.round(companyScore * 0.4 + engagementScore * 0.25 + marketScore * 0.25 + timingScore * 0.1)

  const recommendation = getRecommendation(total, factors)

  return {
    total,
    breakdown: {
      company: companyScore,
      engagement: engagementScore,
      market: marketScore,
      timing: timingScore,
    },
    factors,
    recommendation,
  }
}

function calculateCompanyScore(company: Company, factors: ScoringFactor[]): number {
  let score = 50 // Base score

  // Company size scoring
  const sizeMultiplier = {
    startup: 0.7,
    small: 0.8,
    medium: 1.0,
    large: 1.2,
    enterprise: 1.5,
  }[company.size]

  score *= sizeMultiplier
  factors.push({
    category: "Company",
    factor: "Company Size",
    score: Math.round(score * 0.2),
    weight: 20,
    impact: company.size === "enterprise" || company.size === "large" ? "positive" : "neutral",
    description: `${company.size} company size affects buying power and decision speed`,
  })

  // Revenue scoring
  if (company.financials.revenue) {
    const revenueScore = Math.min((company.financials.revenue / 10000000) * 20, 30)
    score += revenueScore
    factors.push({
      category: "Company",
      factor: "Revenue",
      score: Math.round(revenueScore),
      weight: 15,
      impact: "positive",
      description: "Higher revenue indicates stronger financial position",
    })
  }

  // Technology stack alignment
  const techAlignment = calculateTechAlignment(company.technology.stack)
  score += techAlignment
  factors.push({
    category: "Company",
    factor: "Technology Alignment",
    score: Math.round(techAlignment),
    weight: 15,
    impact: techAlignment > 10 ? "positive" : "neutral",
    description: "Technology stack compatibility with our solutions",
  })

  // Industry scoring
  const industryScore = getIndustryScore(company.industry)
  score += industryScore
  factors.push({
    category: "Company",
    factor: "Industry Fit",
    score: Math.round(industryScore),
    weight: 10,
    impact: industryScore > 5 ? "positive" : "neutral",
    description: "Industry alignment with our target market",
  })

  return Math.min(Math.max(score, 0), 100)
}

function calculateEngagementScore(company: Company, factors: ScoringFactor[]): number {
  let score = 30 // Base score

  // Contact quality
  const verifiedContacts = company.contacts.filter((c) => c.verified).length
  const contactScore = Math.min(verifiedContacts * 10, 25)
  score += contactScore

  factors.push({
    category: "Engagement",
    factor: "Contact Quality",
    score: Math.round(contactScore),
    weight: 25,
    impact: verifiedContacts > 2 ? "positive" : "neutral",
    description: `${verifiedContacts} verified contacts available`,
  })

  // Previous engagement
  const avgEngagement = company.contacts.reduce((sum, c) => sum + c.engagementScore, 0) / company.contacts.length || 0
  const engagementBonus = avgEngagement * 0.3
  score += engagementBonus

  factors.push({
    category: "Engagement",
    factor: "Previous Engagement",
    score: Math.round(engagementBonus),
    weight: 20,
    impact: avgEngagement > 50 ? "positive" : "neutral",
    description: "Historical engagement levels with contacts",
  })

  // Data completeness
  const completeness = calculateDataCompleteness(company)
  const completenessScore = completeness * 0.2
  score += completenessScore

  factors.push({
    category: "Engagement",
    factor: "Data Completeness",
    score: Math.round(completenessScore),
    weight: 15,
    impact: completeness > 70 ? "positive" : "neutral",
    description: `${completeness}% of company data is complete`,
  })

  return Math.min(Math.max(score, 0), 100)
}

function calculateMarketScore(marketIntel: MarketIntelligence, factors: ScoringFactor[]): number {
  let score = 40 // Base score

  // Opportunity scoring
  const highPriorityOpportunities = marketIntel.opportunities.filter(
    (o) => o.priority === "high" || o.priority === "urgent",
  ).length
  const opportunityScore = Math.min(highPriorityOpportunities * 15, 30)
  score += opportunityScore

  factors.push({
    category: "Market",
    factor: "Market Opportunities",
    score: Math.round(opportunityScore),
    weight: 30,
    impact: highPriorityOpportunities > 0 ? "positive" : "neutral",
    description: `${highPriorityOpportunities} high-priority opportunities identified`,
  })

  // Threat assessment
  const criticalThreats = marketIntel.threats.filter((t) => t.severity === "high" || t.severity === "critical").length
  const threatPenalty = criticalThreats * 10
  score -= threatPenalty

  factors.push({
    category: "Market",
    factor: "Market Threats",
    score: -Math.round(threatPenalty),
    weight: 20,
    impact: criticalThreats > 0 ? "negative" : "neutral",
    description: `${criticalThreats} critical threats detected`,
  })

  // Market trends
  const positiveTrends = marketIntel.trends.filter((t) => t.direction === "up").length
  const trendScore = positiveTrends * 5
  score += trendScore

  factors.push({
    category: "Market",
    factor: "Market Trends",
    score: Math.round(trendScore),
    weight: 15,
    impact: positiveTrends > 2 ? "positive" : "neutral",
    description: `${positiveTrends} positive market trends identified`,
  })

  return Math.min(Math.max(score, 0), 100)
}

function calculateTimingScore(insights: CompanyInsight[], factors: ScoringFactor[]): number {
  let score = 50 // Base score

  // Recent funding
  const recentFunding = insights.filter(
    (i) => i.type === "funding" && new Date(i.createdAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  ).length

  if (recentFunding > 0) {
    score += 30
    factors.push({
      category: "Timing",
      factor: "Recent Funding",
      score: 30,
      weight: 40,
      impact: "positive",
      description: "Recent funding indicates growth and investment capacity",
    })
  }

  // Hiring activity
  const recentHiring = insights.filter(
    (i) => i.type === "hiring" && new Date(i.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  ).length

  if (recentHiring > 0) {
    score += 20
    factors.push({
      category: "Timing",
      factor: "Hiring Activity",
      score: 20,
      weight: 30,
      impact: "positive",
      description: "Active hiring suggests growth and expansion",
    })
  }

  // Technology updates
  const techUpdates = insights.filter(
    (i) => i.type === "technology" && new Date(i.createdAt) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  ).length

  if (techUpdates > 0) {
    score += 15
    factors.push({
      category: "Timing",
      factor: "Technology Updates",
      score: 15,
      weight: 20,
      impact: "positive",
      description: "Recent technology changes may create new opportunities",
    })
  }

  return Math.min(Math.max(score, 0), 100)
}

function calculateTechAlignment(techStack: string[]): number {
  const targetTech = ["React", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "TypeScript"]
  const alignment = techStack.filter((tech) =>
    targetTech.some((target) => tech.toLowerCase().includes(target.toLowerCase())),
  ).length

  return Math.min(alignment * 5, 25)
}

function getIndustryScore(industry: string): number {
  const industryScores: Record<string, number> = {
    Technology: 15,
    Software: 15,
    SaaS: 15,
    Finance: 12,
    Healthcare: 10,
    "E-commerce": 10,
    Education: 8,
    Manufacturing: 6,
    Retail: 5,
  }

  return industryScores[industry] || 3
}

function calculateDataCompleteness(company: Company): number {
  const fields = [
    company.name,
    company.domain,
    company.industry,
    company.location.country,
    company.financials.revenue,
    company.financials.employees,
    company.technology.stack.length > 0,
    company.contacts.length > 0,
  ]

  const completedFields = fields.filter(Boolean).length
  return Math.round((completedFields / fields.length) * 100)
}

function getRecommendation(score: number, factors: ScoringFactor[]): "hot" | "warm" | "cold" | "nurture" {
  const positiveFactors = factors.filter((f) => f.impact === "positive").length
  const negativeFactors = factors.filter((f) => f.impact === "negative").length

  if (score >= 80 && positiveFactors >= 5) return "hot"
  if (score >= 60 && negativeFactors <= 2) return "warm"
  if (score >= 40) return "nurture"
  return "cold"
}

export function calculateCompetitorThreat(
  competitor: Company,
  marketShare: number,
  recentActivity: MarketInsight[],
): number {
  let threat = 30 // Base threat level

  // Market share impact
  threat += marketShare * 0.5

  // Company size impact
  const sizeMultiplier = {
    startup: 0.5,
    small: 0.7,
    medium: 1.0,
    large: 1.3,
    enterprise: 1.5,
  }[competitor.size]

  threat *= sizeMultiplier

  // Recent activity impact
  const recentFunding = recentActivity.filter((a) => a.type === "funding").length
  const recentPartnerships = recentActivity.filter((a) => a.type === "partnership").length
  const recentProducts = recentActivity.filter((a) => a.type === "product-launch").length

  threat += recentFunding * 10
  threat += recentPartnerships * 5
  threat += recentProducts * 8

  return Math.min(Math.max(threat, 0), 100)
}

export function calculateMarketOpportunity(
  marketSize: number,
  growthRate: number,
  competition: number,
  barriers: number,
): number {
  // Opportunity = (Market Size * Growth Rate) / (Competition * Barriers)
  const opportunity = (marketSize * growthRate) / (competition * barriers)
  return Math.min(Math.max(opportunity * 10, 0), 100)
}
