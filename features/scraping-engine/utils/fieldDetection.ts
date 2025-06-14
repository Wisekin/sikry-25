import { EMAIL_PATTERNS, PHONE_PATTERNS, SOCIAL_PATTERNS, COMPANY_PATTERNS } from "../legacy/regexPatterns"

export interface DetectedField {
  type: "email" | "phone" | "social" | "company" | "address" | "text"
  confidence: number
  selector: string
  value: string
  metadata?: Record<string, any>
}

export interface FieldDetectionResult {
  fields: DetectedField[]
  suggestions: string[]
  coverage: number
}

export class FieldDetector {
  private static FIELD_TYPES = {
    email: {
      patterns: [EMAIL_PATTERNS.basic],
      selectors: ['[href^="mailto:"]', 'input[type="email"]', ".email", "#email"],
      weight: 0.9,
    },
    phone: {
      patterns: [PHONE_PATTERNS.generic, PHONE_PATTERNS.us],
      selectors: ['[href^="tel:"]', ".phone", "#phone", ".contact-phone"],
      weight: 0.8,
    },
    social: {
      patterns: [SOCIAL_PATTERNS.linkedin, SOCIAL_PATTERNS.twitter],
      selectors: ['[href*="linkedin.com"]', '[href*="twitter.com"]', ".social-links a"],
      weight: 0.7,
    },
    company: {
      patterns: [COMPANY_PATTERNS.revenue, COMPANY_PATTERNS.employees],
      selectors: [".company-info", ".about", ".overview", "h1", "h2"],
      weight: 0.6,
    },
  }

  static async detectFields(html: string, url: string): Promise<FieldDetectionResult> {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const fields: DetectedField[] = []
    const suggestions: string[] = []

    // Analyze text content for patterns
    const textContent = doc.body.textContent || ""

    for (const [fieldType, config] of Object.entries(this.FIELD_TYPES)) {
      for (const pattern of config.patterns) {
        const matches = textContent.match(pattern)
        if (matches) {
          // Find elements containing these matches
          const elements = Array.from(doc.querySelectorAll("*")).filter((el) => {
            const text = el.textContent || ""
            return matches.some((match) => text.includes(match))
          })

          elements.forEach((el) => {
            const selector = this.generateSelector(el)
            if (selector) {
              fields.push({
                type: fieldType as any,
                confidence: config.weight,
                selector,
                value: matches[0],
                metadata: {
                  tagName: el.tagName.toLowerCase(),
                  className: el.className,
                  id: el.id,
                },
              })
            }
          })
        }
      }

      // Check for semantic selectors
      for (const selector of config.selectors) {
        const elements = doc.querySelectorAll(selector)
        elements.forEach((el) => {
          const value = el.textContent || (el as HTMLInputElement).value || ""
          if (value) {
            fields.push({
              type: fieldType as any,
              confidence: config.weight * 0.8, // Slightly lower for semantic matching
              selector,
              value,
              metadata: {
                semantic: true,
                tagName: el.tagName.toLowerCase(),
              },
            })
          }
        })
      }
    }

    // Generate suggestions
    if (fields.length === 0) {
      suggestions.push("Try using more specific selectors")
      suggestions.push("Check if the page requires JavaScript to load content")
    }

    const coverage = Math.min(fields.length / 5, 1) // Assume 5 fields is good coverage

    return {
      fields: this.deduplicateFields(fields),
      suggestions,
      coverage,
    }
  }

  private static generateSelector(element: Element): string | null {
    // Generate a unique CSS selector for the element
    if (element.id) {
      return `#${element.id}`
    }

    if (element.className) {
      const classes = element.className.split(" ").filter((c) => c.length > 0)
      if (classes.length > 0) {
        return `.${classes.join(".")}`
      }
    }

    // Fallback to tag name with nth-child
    const parent = element.parentElement
    if (parent) {
      const siblings = Array.from(parent.children)
      const index = siblings.indexOf(element) + 1
      return `${element.tagName.toLowerCase()}:nth-child(${index})`
    }

    return element.tagName.toLowerCase()
  }

  private static deduplicateFields(fields: DetectedField[]): DetectedField[] {
    const seen = new Set<string>()
    return fields.filter((field) => {
      const key = `${field.type}-${field.selector}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }
}
