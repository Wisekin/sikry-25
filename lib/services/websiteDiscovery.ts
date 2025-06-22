import { GoogleSearchIntegrationService } from './googleSearchIntegration';
import { RelevanceScorer } from './relevanceScorer';
import { RateLimiterService } from './rateLimiter';
import { createClient } from '@/src/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';

export interface WebsiteDiscoveryParams {
  query: string;
  domain?: string;
  limit?: number;
  userId: string;
  filters?: {
    minRelevanceScore?: number;
    maxResults?: number;
    language?: string;
    country?: string;
  };
}

export interface WebsiteResult {
  url: string;
  title: string;
  snippet: string;
  displayUrl: string;
  relevanceScore: number;
  confidence: number;
  lastCrawled?: string;
  matchFactors: {
    content: number;
    title: number;
    url: number;
    domainAuthority: number;
  };
  metadata: Record<string, any>;
}

export class WebsiteDiscoveryService {
  private searchService: GoogleSearchIntegrationService;
  private relevanceScorer: RelevanceScorer;
  private rateLimiter: RateLimiterService;
  private supabase = createClient();

  constructor() {
    this.searchService = new GoogleSearchIntegrationService();
    this.relevanceScorer = new RelevanceScorer();
    this.rateLimiter = new RateLimiterService();
  }

  /**
   * Discover websites based on a search query
   */
  async discoverWebsites(params: WebsiteDiscoveryParams): Promise<WebsiteResult[]> {
    const { query, domain, limit = 10, userId, filters = {} } = params;
    const { minRelevanceScore = 0.5, language, country } = filters;

    try {
      // Check rate limits
      await this.checkRateLimit(userId);

      // Perform the search
      const searchResults = await this.searchService.search({
        query,
        num: limit,
        siteSearch: domain,
        language,
        country,
      });

      if (!searchResults.items || searchResults.items.length === 0) {
        return [];
      }

      // Score and process results
      const scoredResults = await Promise.all(
        searchResults.items.map(async (item) => {
          const relevanceScore = await this.calculateRelevance(item, query);
          return this.formatResult(item, relevanceScore, query);
        })
      );

      // Filter by minimum relevance score
      const filteredResults = scoredResults.filter(
        (result) => result.relevanceScore >= minRelevanceScore
      );

      // Sort by relevance score (highest first)
      return filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      Logger.logError('Website discovery failed', error as Error, {
        query,
        userId,
        category: 'discovery',
      });
      throw error;
    }
  }

  /**
   * Get website details by URL
   */
  async getWebsiteDetails(url: string, userId: string): Promise<WebsiteResult | null> {
    try {
      // Check rate limits
      await this.checkRateLimit(userId);

      // Try to get from cache first
      const cachedResult = await this.getCachedWebsite(url);
      if (cachedResult) {
        return cachedResult;
      }

      // If not in cache, perform a search
      const domain = new URL(url).hostname;
      const searchResults = await this.searchService.search({
        query: `site:${domain}`,
        num: 1,
      });

      if (!searchResults.items || searchResults.items.length === 0) {
        return null;
      }

      // Score and format the result
      const result = searchResults.items[0];
      const relevanceScore = await this.calculateRelevance(result, domain);
      const websiteResult = this.formatResult(result, relevanceScore, domain);

      // Cache the result
      await this.cacheWebsite(websiteResult);

      return websiteResult;
    } catch (error) {
      Logger.logError('Failed to get website details', error as Error, {
        url,
        userId,
        category: 'discovery',
      });
      throw error;
    }
  }

  /**
   * Check if the user has exceeded rate limits
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const isAllowed = await this.rateLimiter.checkLimit({
      userId,
      action: 'website_discovery',
      cost: 1,
      windowMs: 60 * 1000, // 1 minute window
      maxRequests: 60, // 60 requests per minute
    });

    if (!isAllowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  /**
   * Calculate relevance score for a search result
   */
  private async calculateRelevance(
    result: any,
    query: string
  ): Promise<number> {
    const content = `${result.title} ${result.snippet}`.toLowerCase();
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Calculate basic term frequency
    const termFrequency = queryTerms.reduce((score, term) => {
      const regex = new RegExp(term, 'gi');
      const matches = content.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0);

    // Use the relevance scorer for more sophisticated analysis
    const relevanceScore = await this.relevanceScorer.scoreContent({
      content: content,
      query: query,
      title: result.title,
      url: result.link,
    });

    // Combine scores (50% term frequency, 50% AI relevance score)
    const normalizedTermFreq = Math.min(termFrequency / queryTerms.length, 1);
    const combinedScore = (normalizedTermFreq * 0.5) + (relevanceScore.score * 0.5);

    return Math.min(Math.max(combinedScore, 0), 1);
  }

  /**
   * Format a search result into our standard website result format
   */
  private formatResult(
    item: any,
    relevanceScore: number,
    query: string
  ): WebsiteResult {
    return {
      url: item.link,
      title: item.title,
      snippet: item.snippet,
      displayUrl: this.cleanDisplayUrl(item.link),
      relevanceScore,
      confidence: this.calculateConfidence(item, relevanceScore, query),
      lastCrawled: new Date().toISOString(),
      matchFactors: {
        content: 0.8, // Placeholder - would be calculated based on content analysis
        title: 0.9,  // Placeholder - would be calculated based on title match
        url: 0.7,    // Placeholder - would be calculated based on URL match
        domainAuthority: 0.6, // Placeholder - would be calculated based on domain metrics
      },
      metadata: {
        searchEngine: 'google',
        searchQuery: query,
        ...(item.pagemap?.metatags?.[0] || {}),
      },
    };
  }

  /**
   * Clean and format a URL for display
   */
  private cleanDisplayUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname.replace(/\/$/, '')}`;
    } catch (e) {
      return url;
    }
  }

  /**
   * Calculate confidence score for a result
   */
  private calculateConfidence(
    item: any,
    relevanceScore: number,
    query: string
  ): number {
    // Base confidence on relevance score
    let confidence = relevanceScore;

    // Boost confidence for exact domain matches
    try {
      const url = new URL(item.link);
      if (url.hostname.includes(query)) {
        confidence = Math.min(confidence + 0.2, 1);
      }
    } catch (e) {
      // Invalid URL, use base confidence
    }

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Get a cached website result if available
   */
  private async getCachedWebsite(url: string): Promise<WebsiteResult | null> {
    try {
      const { data, error } = await this.supabase
        .from('cached_websites')
        .select('*')
        .eq('url', url)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return data.result as WebsiteResult;
    } catch (error) {
      Logger.logError('Failed to get cached website', error as Error, {
        url,
        category: 'discovery',
      });
      return null;
    }
  }

  /**
   * Cache a website result
   */
  private async cacheWebsite(result: WebsiteResult): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Cache for 7 days

      await this.supabase.from('cached_websites').upsert({
        url: result.url,
        result,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      Logger.logError('Failed to cache website', error as Error, {
        url: result.url,
        category: 'discovery',
      });
      // Don't throw - caching is not critical
    }
  }
}
