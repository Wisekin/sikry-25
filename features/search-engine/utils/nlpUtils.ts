export interface IntentKeywords {
  keywords: string[]
  weight: number
}

export const INTENT_PATTERNS = {
  search: {
    keywords: ["find", "show", "get", "list", "search", "look", "seeking"],
    weight: 1
  },
  filter: {
    keywords: ["filter", "where", "with", "having", "only", "exclude"],
    weight: 1.2
  },
  compare: {
    keywords: ["compare", "vs", "versus", "against", "difference", "between"],
    weight: 1.5
  },
  analyze: {
    keywords: ["analyze", "analysis", "insights", "trends", "statistics", "patterns"],
    weight: 1.8
  }
} as const

export const ENTITY_PATTERNS = {
  company: {
    patterns: [
      /(?:company|business|organization|firm|enterprise):\s*([^,]+)/gi,
      /(?:called|named)\s+([^,\s]+(?:\s+(?:Inc|LLC|Ltd|GmbH|SA|AG|Corp|Corporation|Limited))?)/gi,
      /\b([A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)*(?:\s+(?:Inc|LLC|Ltd|GmbH|SA|AG|Corp|Corporation|Limited))?)\b/g
    ],
    preprocess: (match: string) => match.trim()
  },
  location: {
    patterns: [
      /(?:in|from|located|based)\s+(?:in\s+)?([^,\s]+(?:\s+[^,\s]+)*)/gi,
      /(?:locations?|regions?|areas?|countries?):\s*([^,]+)/gi
    ],
    preprocess: (match: string) => match.trim()
  },
  industry: {
    patterns: [
      /(?:industry|sector|field):\s*([^,]+)/gi,
      /(?:in\s+the\s+)([^,\s]+(?:\s+(?:industry|sector))?)/gi
    ],
    preprocess: (match: string) => match.replace(/(industry|sector)$/i, '').trim()
  },
  size: {
    patterns: [
      /(?:size|employees|staff):\s*([^,]+)/gi,
      /(?:with\s+)?(\d+(?:[+-]|\s*to\s*\d+)?\s*(?:employees|people|staff))/gi
    ],
    preprocess: (match: string) => match.replace(/(employees|people|staff)$/i, '').trim()
  },
  technology: {
    patterns: [
      /(?:using|with|tech(?:nology)?|stack):\s*([^,]+)/gi,
      /(?:built|developed|powered)\s+(?:with|using|in|on)\s+([^,\s]+(?:\s+[^,\s]+)*)/gi
    ],
    preprocess: (match: string) => match.trim()
  },
  revenue: {
    patterns: [
      /(?:revenue|sales|turnover):\s*([^,]+)/gi,
      /(?:making|earning|generating)\s+(\$?\d+(?:[kmb]|\s*(?:million|billion))?(?:\s*(?:yearly|annually|per year))?)/gi
    ],
    preprocess: (match: string) => match.replace(/(yearly|annually|per year)$/i, '').trim()
  }
}

export const NUMERIC_RANGES = {
  parseRange(value: string): { min?: number; max?: number } {
    const numericValue = value.replace(/[^0-9\-+]/g, '')
    if (value.includes('-') || value.includes('to')) {
      const [min, max] = value.split(/[-to]+/).map(v => parseInt(v.trim()))
      return { min, max }
    }
    if (value.includes('+')) {
      return { min: parseInt(numericValue) }
    }
    return { min: parseInt(numericValue), max: parseInt(numericValue) }
  },
  
  normalizeValue(value: string): string {
    return value
      .toLowerCase()
      .replace(/million|m/i, '000000')
      .replace(/billion|b/i, '000000000')
      .replace(/thousand|k/i, '000')
  }
}
