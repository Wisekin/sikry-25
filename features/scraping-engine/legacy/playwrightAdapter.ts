import type { Page } from "playwright"

export interface LegacyScrapingConfig {
  url: string
  selectors: Record<string, string>
  waitForSelector?: string
  timeout?: number
}

export interface ScrapingResult {
  success: boolean
  data: Record<string, any>
  errors?: string[]
  metadata: {
    timestamp: Date
    url: string
    duration: number
  }
}

export class PlaywrightAdapter {
  private page: Page | null = null

  constructor(private config: LegacyScrapingConfig) {}

  async scrape(): Promise<ScrapingResult> {
    const startTime = Date.now()

    try {
      if (!this.page) {
        throw new Error("Page not initialized")
      }

      await this.page.goto(this.config.url, {
        waitUntil: "networkidle",
        timeout: this.config.timeout || 30000,
      })

      if (this.config.waitForSelector) {
        await this.page.waitForSelector(this.config.waitForSelector, {
          timeout: 10000,
        })
      }

      const data: Record<string, any> = {}
      const errors: string[] = []

      for (const [field, selector] of Object.entries(this.config.selectors)) {
        try {
          const element = await this.page.$(selector)
          if (element) {
            data[field] = await element.textContent()
          } else {
            errors.push(`Selector not found for field: ${field}`)
          }
        } catch (error) {
          errors.push(`Error extracting ${field}: ${error}`)
        }
      }

      return {
        success: errors.length === 0,
        data,
        errors: errors.length > 0 ? errors : undefined,
        metadata: {
          timestamp: new Date(),
          url: this.config.url,
          duration: Date.now() - startTime,
        },
      }
    } catch (error) {
      return {
        success: false,
        data: {},
        errors: [error instanceof Error ? error.message : "Unknown error"],
        metadata: {
          timestamp: new Date(),
          url: this.config.url,
          duration: Date.now() - startTime,
        },
      }
    }
  }

  setPage(page: Page) {
    this.page = page
  }
}
