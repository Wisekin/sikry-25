import type { FieldSelector, ScraperConfig } from "@/types/scraping"

export class V2ScrapingAdapter {
  private config: ScraperConfig

  constructor(config: ScraperConfig) {
    this.config = config
  }

  async scrape(url: string): Promise<any[]> {
    try {
      const response = await fetch("/api/scrapers/v2/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          config: this.config,
        }),
      })

      if (!response.ok) {
        throw new Error(`Scraping failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error("V2 scraping error:", error)
      throw error
    }
  }

  async testSelector(url: string, selector: FieldSelector): Promise<any> {
    try {
      const response = await fetch("/api/scrapers/v2/test-selector", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          selector,
        }),
      })

      if (!response.ok) {
        throw new Error(`Selector test failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Selector test error:", error)
      throw error
    }
  }

  async detectFields(url: string): Promise<FieldSelector[]> {
    try {
      const response = await fetch("/api/scrapers/v2/detect-fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`Field detection failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.fields || []
    } catch (error) {
      console.error("Field detection error:", error)
      return []
    }
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.config.selectors || this.config.selectors.length === 0) {
      errors.push("At least one selector is required")
    }

    this.config.selectors.forEach((selector, index) => {
      if (!selector.name) {
        errors.push(`Selector ${index + 1}: Name is required`)
      }
      if (!selector.selector) {
        errors.push(`Selector ${index + 1}: CSS selector is required`)
      }
      if (!selector.type) {
        errors.push(`Selector ${index + 1}: Type is required`)
      }
    })

    if (this.config.pagination?.maxPages && this.config.pagination.maxPages > 100) {
      errors.push("Maximum pages cannot exceed 100")
    }

    if (this.config.rateLimit?.requests && this.config.rateLimit.requests > 1000) {
      errors.push("Rate limit cannot exceed 1000 requests")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  optimizeSelectors(): FieldSelector[] {
    return this.config.selectors.map((selector) => ({
      ...selector,
      selector: this.optimizeSelector(selector.selector),
    }))
  }

  private optimizeSelector(selector: string): string {
    // Remove unnecessary specificity
    return selector.replace(/\s+/g, " ").replace(/>\s+/g, ">").replace(/\s+>/g, ">").trim()
  }
}

export function createV2Adapter(config: ScraperConfig): V2ScrapingAdapter {
  return new V2ScrapingAdapter(config)
}
