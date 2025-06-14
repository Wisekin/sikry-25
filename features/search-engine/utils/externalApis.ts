import { Configuration, OpenAIApi } from 'openai'
import { SearchResult } from '../types'
import { externalApiConfig } from '@/lib/config/external-apis'
import { APIRateLimiter } from '@/lib/utils/api-rate-limiter'

export class ExternalAPIs {
  private static openai: OpenAIApi | null = null
  private static googleApiKey: string = process.env.GOOGLE_API_KEY || ''
  private static linkedinApiKey: string = process.env.LINKEDIN_API_KEY || ''

  private static initOpenAI() {
    if (!ExternalAPIs.openai) {
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      })
      ExternalAPIs.openai = new OpenAIApi(configuration)
    }
    return ExternalAPIs.openai
  }

  static async enhanceWithAI(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    if (!externalApiConfig.openai.enabled) {
      console.warn('OpenAI API not configured')
      return results
    }

    const cacheKey = `ai_enhancement:${query}`
    const cached = await APIRateLimiter.checkCache(cacheKey)
    if (cached) return cached

    await APIRateLimiter.waitForRateLimit('openai')

    try {
      const openai = ExternalAPIs.initOpenAI()
      if (!openai) {
        return results
      }

      // Use GPT to analyze and enhance search results
      const prompt = `Analyze these company search results for the query "${query}":
${JSON.stringify(results, null, 2)}
Enhance the results with:
1. Improved relevance scoring
2. Additional context
3. Industry insights`

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are a business intelligence expert helping to enhance company search results."
        }, {
          role: "user",
          content: prompt
        }]
      })

      const analysis = completion.data.choices[0]?.message?.content
      if (!analysis) return results

      // Parse AI insights and enhance results
      try {
        const aiEnhanced = JSON.parse(analysis)
        return results.map((result, index) => ({
          ...result,
          aiInsights: aiEnhanced[index]?.insights || [],
          confidence: aiEnhanced[index]?.confidence || result.confidence
        }))
      } catch (e) {
        console.error('Failed to parse AI analysis:', e)
        return results
      }
    } catch (error) {
      console.error('OpenAI enhancement failed:', error)
      return results
    }
  }

  static async searchGoogle(query: string): Promise<SearchResult[]> {
    if (!externalApiConfig.google.enabled) {
      console.warn('Google API not configured')
      return []
    }

    const cacheKey = `google_search:${query}`
    const cached = await APIRateLimiter.checkCache(cacheKey)
    if (cached) return cached

    await APIRateLimiter.waitForRateLimit('google')

    try {
      const customSearchId = process.env.GOOGLE_SEARCH_CX
      const url = `https://www.googleapis.com/customsearch/v1?key=${ExternalAPIs.googleApiKey}&cx=${customSearchId}&q=${encodeURIComponent(query)}`
      
      const response = await fetch(url)
      const data = await response.json()

      return data.items?.map((item: any) => ({
        id: item.link,
        type: 'company',
        title: item.title,
        description: item.snippet,
        url: item.link,
        confidence: 0.7,
        metadata: {
          source: 'google',
          pagemap: item.pagemap
        },
        highlights: [{
          field: 'description',
          text: item.snippet
        }]
      })) || []
    } catch (error) {
      console.error('Google search failed:', error)
      return []
    }
  }

  static async searchLinkedIn(query: string): Promise<SearchResult[]> {
    if (!externalApiConfig.linkedin.enabled) {
      console.warn('LinkedIn API not configured')
      return []
    }

    const cacheKey = `linkedin_search:${query}`
    const cached = await APIRateLimiter.checkCache(cacheKey)
    if (cached) return cached

    await APIRateLimiter.waitForRateLimit('linkedin')

    try {
      const url = `https://api.linkedin.com/v2/companiesV2/search?q=${encodeURIComponent(query)}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ExternalAPIs.linkedinApiKey}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      const data = await response.json()

      return data.elements?.map((company: any) => ({
        id: company.id,
        type: 'company',
        title: company.name,
        description: company.description || '',
        url: `https://www.linkedin.com/company/${company.vanityName}`,
        confidence: 0.8,
        metadata: {
          source: 'linkedin',
          industryCode: company.industryCode,
          employeeCount: company.employeeCountRange,
          specialties: company.specialties,
          location: company.locations
        },
        highlights: [{
          field: 'name',
          text: company.name
        }]
      })) || []
    } catch (error) {
      console.error('LinkedIn search failed:', error)
      return []
    }
  }

  static async searchAllSources(query: string): Promise<SearchResult[]> {
    try {
      // Run searches in parallel
      const [googleResults, linkedinResults] = await Promise.all([
        this.searchGoogle(query),
        this.searchLinkedIn(query)
      ])

      // Combine and deduplicate results
      const allResults = [...googleResults, ...linkedinResults]
      const uniqueResults = this.deduplicateResults(allResults)

      // Enhance with AI if available
      return await this.enhanceWithAI(query, uniqueResults)
    } catch (error) {
      console.error('Multi-source search failed:', error)
      return []
    }
  }

  private static deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>()
    return results.filter(result => {
      const key = result.title.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
