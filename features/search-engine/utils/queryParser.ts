export interface ParsedQuery {
  intent: "search" | "filter" | "compare" | "analyze"
  confidence: number
  originalQuery: string
  normalizedQuery: string
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
  operators: {
    comparison?: { type: "greater" | "less" | "equal" | "between"; confidence: number }
    logic?: { type: "and" | "or" | "not"; confidence: number }
  }
}

import { INTENT_PATTERNS, ENTITY_PATTERNS, NUMERIC_RANGES } from './nlpUtils'

export class QueryParser {
  private static readonly KNOWN_COMPANIES = new Set([
    'google', 'microsoft', 'apple', 'amazon', 'meta', 'tesla', 
    'ibm', 'oracle', 'salesforce', 'adobe'
  ])

  private static calculateConfidence(
    value: string, 
    pattern: RegExp, 
    entityType: 'location' | 'industry' | 'technology' | 'company' | 'revenue' | 'size'
  ): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence based on pattern specificity
    if (pattern.toString().includes(entityType)) {
      confidence += 0.2
    }

    // Add context-specific confidence boosts
    switch (entityType) {
      case 'company':
        // Higher confidence for known company names
        if (this.KNOWN_COMPANIES.has(value.toLowerCase())) {
          confidence += 0.3
        }
        // Boost for company suffixes like Inc., Ltd., etc.
        if (/\b(?:inc|ltd|llc|corp|gmbh)\b/i.test(value)) {
          confidence += 0.2
        }
        break
      case 'location':
        // Boost for full country/city names
        if (/^[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*$/.test(value)) {
          confidence += 0.2
        }
        break
      case 'technology':
        // Boost for common tech terms
        if (/\b(?:ai|ml|api|saas|cloud|react|angular|vue|node|python|java)\b/i.test(value)) {
          confidence += 0.2
        }
        break
      case 'revenue':
      case 'size':
        // Boost for numeric values with units
        if (/\d+\s*(?:k|m|b|million|billion|employees|people)/i.test(value)) {
          confidence += 0.2
        }
        break
    }

    return Math.min(confidence, 1) // Cap at 1.0
  }

  static parse(query: string): ParsedQuery {
    const normalizedQuery = query.toLowerCase().trim()
    const intentInfo = this.extractIntent(normalizedQuery)

    return {
      intent: intentInfo.intent,
      confidence: intentInfo.confidence,
      originalQuery: query,
      normalizedQuery,
      entities: this.extractEntities(normalizedQuery),
      filters: this.extractFilters(normalizedQuery),
      operators: this.extractOperators(normalizedQuery),
    }
  }

  private static extractIntent(query: string): { intent: ParsedQuery["intent"]; confidence: number } {
    let maxScore = 0
    let matchedIntent: ParsedQuery["intent"] = "search"

    for (const [intent, { keywords, weight }] of Object.entries(INTENT_PATTERNS)) {
      const matchCount = keywords.filter(keyword => query.includes(keyword)).length
      const score = matchCount * weight
      if (score > maxScore) {
        maxScore = score
        matchedIntent = intent as ParsedQuery["intent"]
      }
    }

    return {
      intent: matchedIntent,
      confidence: maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.5 // Normalize confidence
    }
  }

  private static extractEntities(query: string): ParsedQuery["entities"] {
    const entities: ParsedQuery["entities"] = {
      companies: [],
      locations: [],
      industries: [],
      technologies: []
    }

    // Extract locations
    ENTITY_PATTERNS.location.patterns.forEach(pattern => {
      const matches = query.match(pattern) || []
      matches.forEach(match => {
        const value = ENTITY_PATTERNS.location.preprocess(match)
        entities.locations.push({
          name: value,
          confidence: pattern.toString().includes('location') ? 0.9 : 0.7
        })
      })
    })

    // Extract industries
    ENTITY_PATTERNS.industry.patterns.forEach(pattern => {
      const matches = query.match(pattern) || []
      matches.forEach(match => {
        const value = ENTITY_PATTERNS.industry.preprocess(match)
        entities.industries.push({
          name: value,
          confidence: pattern.toString().includes('industry') ? 0.9 : 0.7
        })
      })
    })

    // Extract technologies
    ENTITY_PATTERNS.technology.patterns.forEach(pattern => {
      const matches = query.match(pattern) || []
      matches.forEach(match => {
        const value = ENTITY_PATTERNS.technology.preprocess(match)
        entities.technologies.push({
          name: value,
          confidence: this.calculateConfidence(value, pattern, 'technology')
        })
      })
    })

    // Extract company names
    ENTITY_PATTERNS.company.patterns.forEach(pattern => {
      const matches = query.match(pattern) || []
      matches.forEach(match => {
        const value = ENTITY_PATTERNS.company.preprocess(match)
        // Higher confidence for exact matches with known company name patterns
        const confidence = this.calculateConfidence(value, pattern, 'company')
        entities.companies.push({
          name: value,
          confidence
        })
      })
    })

    return entities
  }

  private static extractFilters(query: string): ParsedQuery["filters"] {
    const filters: ParsedQuery["filters"] = {}

    // Location filter
    const locationMatches = ENTITY_PATTERNS.location.patterns.flatMap(pattern => 
      [...(query.match(pattern) || [])].map(match => ({
        value: ENTITY_PATTERNS.location.preprocess(match),
        confidence: pattern.toString().includes('location') ? 0.9 : 0.7
      }))
    )
    if (locationMatches.length > 0) {
      filters.location = locationMatches[0] // Use the highest confidence match
    }

    // Industry filter
    const industryMatches = ENTITY_PATTERNS.industry.patterns.flatMap(pattern => 
      [...(query.match(pattern) || [])].map(match => ({
        value: ENTITY_PATTERNS.industry.preprocess(match),
        confidence: pattern.toString().includes('industry') ? 0.9 : 0.7
      }))
    )
    if (industryMatches.length > 0) {
      filters.industry = industryMatches[0]
    }

    // Size filter
    const sizeMatches = ENTITY_PATTERNS.size.patterns.flatMap(pattern => {
      const matches = query.match(pattern) || []
      return matches.map(match => {
        const value = ENTITY_PATTERNS.size.preprocess(match)
        const range = NUMERIC_RANGES.parseRange(value)
        return {
          ...range,
          confidence: pattern.toString().includes('size') ? 0.9 : 0.7
        }
      })
    })
    if (sizeMatches.length > 0) {
      filters.size = sizeMatches[0]
    }

    // Revenue filter
    const revenueMatches = ENTITY_PATTERNS.revenue.patterns.flatMap(pattern => {
      const matches = query.match(pattern) || []
      return matches.map(match => {
        const value = ENTITY_PATTERNS.revenue.preprocess(match)
        const normalizedValue = NUMERIC_RANGES.normalizeValue(value)
        const range = NUMERIC_RANGES.parseRange(normalizedValue)
        return {
          ...range,
          confidence: pattern.toString().includes('revenue') ? 0.9 : 0.7
        }
      })
    })
    if (revenueMatches.length > 0) {
      filters.revenue = revenueMatches[0]
    }

    // Technologies filter
    const techMatches = ENTITY_PATTERNS.technology.patterns.flatMap(pattern => 
      [...(query.match(pattern) || [])].map(match => ({
        value: ENTITY_PATTERNS.technology.preprocess(match),
        confidence: pattern.toString().includes('technology') ? 0.9 : 0.7
      }))
    )
    if (techMatches.length > 0) {
      filters.technologies = techMatches
    }

    return filters
  }

  private static extractOperators(query: string): ParsedQuery["operators"] {
    const operators: ParsedQuery["operators"] = {}

    // Comparison operators
    if (query.includes("greater than") || query.includes(">")) {
      operators.comparison = { type: "greater", confidence: 0.9 }
    } else if (query.includes("less than") || query.includes("<")) {
      operators.comparison = { type: "less", confidence: 0.9 }
    } else if (query.includes("equal to") || query.includes("=")) {
      operators.comparison = { type: "equal", confidence: 0.9 }
    } else if (query.includes("between")) {
      operators.comparison = { type: "between", confidence: 0.9 }
    }

    // Logic operators
    if (query.includes(" and ")) {
      operators.logic = { type: "and", confidence: 0.9 }
    } else if (query.includes(" or ")) {
      operators.logic = { type: "or", confidence: 0.9 }
    } else if (query.includes(" not ")) {
      operators.logic = { type: "not", confidence: 0.9 }
    }

    return operators
  }
}
