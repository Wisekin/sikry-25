import { createClient } from '@/src/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';
import { RateLimiterService } from './rateLimiter';
import { RelevanceScorer } from './relevanceScorer';
import axios from 'axios';

export interface EnrichmentOptions {
  /** Whether to fetch metadata from the page */
  fetchMetadata?: boolean;
  /** Whether to extract structured data (schema.org, OpenGraph, etc.) */
  extractStructuredData?: boolean;
  /** Whether to analyze content for key topics */
  analyzeContent?: boolean;
  /** Whether to check for contact information */
  findContacts?: boolean;
  /** Whether to estimate traffic and domain authority */
  checkMetrics?: boolean;
  /** Whether to find similar websites */
  findSimilarSites?: boolean;
  /** Maximum time to wait for enrichment in milliseconds */
  timeout?: number;
  /** Language code for content analysis */
  language?: string;
}

export interface EnrichedData {
  /** The original URL */
  url: string;
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Language of the content */
  language?: string;
  /** Keywords extracted from the content */
  keywords?: string[];
  /** Main topics identified in the content */
  topics?: string[];
  /** Sentiment analysis of the content */
  sentiment?: {
    score: number; // -1 to 1
    magnitude: number; // 0 to +inf
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
  };
  /** Estimated reading time in minutes */
  readingTime?: number;
  /** Word count */
  wordCount?: number;
  /** Detected schema.org types */
  schemaTypes?: string[];
  /** OpenGraph metadata */
  openGraph?: Record<string, string>;
  /** Twitter card metadata */
  twitterCard?: Record<string, string>;
  /** JSON-LD data */
  jsonLd?: any[];
  /** Contact information found on the page */
  contacts?: {
    emails?: string[];
    phones?: string[];
    socialLinks?: Record<string, string>; // platform -> url
  };
  /** Estimated domain metrics */
  metrics?: {
    domainAuthority?: number; // 0-100
    pageAuthority?: number; // 0-100
    estimatedMonthlyVisitors?: number;
    bounceRate?: number; // 0-1
    pagesPerVisit?: number;
  };
  /** List of similar websites */
  similarSites?: Array<{
    url: string;
    similarity: number; // 0-1
    reason?: string;
  }>;
  /** When the data was enriched */
  enrichedAt: string;
  /** Any errors that occurred during enrichment */
  errors?: string[];
  /** Raw response from the enrichment process */
  rawData?: Record<string, any>;
}

export class DataEnrichmentService {
  private rateLimiter: RateLimiterService;
  private relevanceScorer: RelevanceScorer;
  private supabase = createClient();
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds

  constructor() {
    this.rateLimiter = new RateLimiterService();
    this.relevanceScorer = new RelevanceScorer();
  }

  /**
   * Enrich website data with additional information
   */
  async enrichWebsite(
    url: string,
    userId: string,
    options: EnrichmentOptions = {}
  ): Promise<EnrichedData> {
    const startTime = Date.now();
    const enrichedData: EnrichedData = {
      url,
      enrichedAt: new Date().toISOString(),
      errors: [],
    };

    try {
      // Check rate limits
      await this.checkRateLimit(userId);

      // Apply default options
      const {
        fetchMetadata = true,
        extractStructuredData = true,
        analyzeContent = true,
        findContacts = true,
        checkMetrics = false, // Disabled by default as it may require external APIs
        findSimilarSites = false, // Disabled by default as it may require external APIs
        timeout = this.DEFAULT_TIMEOUT,
        language = 'en',
      } = options;

      // Try to get from cache first
      const cachedData = await this.getCachedEnrichment(url);
      if (cachedData) {
        return cachedData;
      }

      // Fetch the page content
      let html: string | undefined;
      try {
        const response = await axios.get(url, {
          timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SikryBot/1.0; +https://sikry.com/bot)'
          }
        });
        html = response.data;
      } catch (error) {
        this.handleError(enrichedData, 'Failed to fetch page content', error);
        // Continue with partial data
      }

      // Process the page content in parallel
      const processingPromises: Promise<void>[] = [];

      if (fetchMetadata && html) {
        processingPromises.push(
          this.extractMetadata(html, enrichedData).catch(error =>
            this.handleError(enrichedData, 'Failed to extract metadata', error)
          )
        );
      }

      if (extractStructuredData && html) {
        processingPromises.push(
          this.extractStructuredData(html, enrichedData).catch(error =>
            this.handleError(enrichedData, 'Failed to extract structured data', error)
          )
        );
      }

      if (analyzeContent && html) {
        processingPromises.push(
          this.analyzeContent(html, language, enrichedData).catch(error =>
            this.handleError(enrichedData, 'Failed to analyze content', error)
          )
        );
      }

      if (findContacts && html) {
        processingPromises.push(
          this.findContactInfo(html, enrichedData).catch(error =>
            this.handleError(enrichedData, 'Failed to find contact information', error)
          )
        );
      }

      // Wait for all processing to complete
      await Promise.all(processingPromises);

      // Add metrics if requested (external API call)
      if (checkMetrics) {
        try {
          await this.addDomainMetrics(url, enrichedData);
        } catch (error) {
          this.handleError(enrichedData, 'Failed to get domain metrics', error);
        }
      }

      // Add similar sites if requested (external API call)
      if (findSimilarSites) {
        try {
          await this.findSimilarSites(url, enrichedData);
        } catch (error) {
          this.handleError(enrichedData, 'Failed to find similar sites', error);
        }
      }

      // Calculate processing time
      const processingTime = Date.now() - startTime;
      Logger.logInfo('Website enrichment completed', {
        url,
        processingTime,
        success: !enrichedData.errors?.length,
        category: 'enrichment',
      });

      // Cache the result
      await this.cacheEnrichment(enrichedData);

      return enrichedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Logger.logError('Website enrichment failed', {
        error: errorMessage,
        url,
        category: 'enrichment',
      });
      
      // Add to errors if not already added
      if (!enrichedData.errors?.includes(errorMessage)) {
        enrichedData.errors = [...(enrichedData.errors || []), errorMessage];
      }
      
      // Cache even failed attempts to avoid repeated failures
      await this.cacheEnrichment(enrichedData);
      
      return enrichedData;
    }
  }

  /**
   * Extract basic metadata from HTML
   */
  private async extractMetadata(html: string, data: EnrichedData): Promise<void> {
    // This is a simplified implementation. In a real app, you might use a library like cheerio or jsdom
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      data.title = this.cleanText(titleMatch[1]);
    }

    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (descMatch && descMatch[1]) {
      data.description = this.cleanText(descMatch[1]);
    }

    const langMatch = html.match(/<html[^>]*\s+lang=["']([^"']+)["']/i);
    if (langMatch && langMatch[1]) {
      data.language = langMatch[1].substring(0, 2); // Just the language code
    }
  }

  /**
   * Extract structured data (schema.org, OpenGraph, etc.)
   */
  private async extractStructuredData(html: string, data: EnrichedData): Promise<void> {
    // Extract JSON-LD data
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi) || [];
    const jsonLd: any[] = [];
    
    for (const match of jsonLdMatches) {
      try {
        const jsonStr = match.replace(/<[^>]*>/g, '').trim();
        const jsonData = JSON.parse(jsonStr);
        jsonLd.push(jsonData);
      } catch (error) {
        // Skip invalid JSON
      }
    }
    
    if (jsonLd.length > 0) {
      data.jsonLd = jsonLd;
      
      // Extract schema types
      const schemaTypes = new Set<string>();
      jsonLd.forEach(item => {
        if (item['@type']) {
          const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
          types.forEach((type: string) => schemaTypes.add(type.toLowerCase()));
        }
      });
      
      if (schemaTypes.size > 0) {
        data.schemaTypes = Array.from(schemaTypes);
      }
    }

    // Extract OpenGraph data
    const ogData: Record<string, string> = {};
    const ogMatches = html.match(/<meta\s+property="og:([^"]+)"\s+content="([^"]*)"/gi) || [];
    
    ogMatches.forEach(match => {
      const propMatch = match.match(/property="og:([^"]+)"/);
      const contentMatch = match.match(/content="([^"]*)"/);
      
      if (propMatch && contentMatch && propMatch[1] && contentMatch[1]) {
        ogData[propMatch[1]] = contentMatch[1];
      }
    });
    
    if (Object.keys(ogData).length > 0) {
      data.openGraph = ogData;
      
      // Use OpenGraph title/description if not already set
      if (!data.title && ogData.title) {
        data.title = this.cleanText(ogData.title);
      }
      
      if (!data.description && ogData.description) {
        data.description = this.cleanText(ogData.description);
      }
    }

    // Extract Twitter Card data
    const tcData: Record<string, string> = {};
    const tcMatches = html.match(/<meta\s+name="twitter:([^"]+)"\s+content="([^"]*)"/gi) || [];
    
    tcMatches.forEach(match => {
      const nameMatch = match.match(/name="twitter:([^"]+)"/);
      const contentMatch = match.match(/content="([^"]*)"/);
      
      if (nameMatch && contentMatch && nameMatch[1] && contentMatch[1]) {
        tcData[nameMatch[1]] = contentMatch[1];
      }
    });
    
    if (Object.keys(tcData).length > 0) {
      data.twitterCard = tcData;
    }
  }

  /**
   * Analyze page content for topics, sentiment, etc.
   */
  private async analyzeContent(html: string, language: string, data: EnrichedData): Promise<void> {
    // Extract text content (simplified - in reality, you'd want to remove scripts, styles, etc.)
    const text = this.extractTextContent(html);
    
    // Basic word count and reading time
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    data.wordCount = wordCount;
    data.readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 WPM
    
    // Use the relevance scorer for content analysis
    const analysis = await this.relevanceScorer.analyzeContent({
      content: text,
      language,
      maxTopics: 5,
    });
    
    if (analysis.topics) {
      data.topics = analysis.topics;
    }
    
    if (analysis.keywords) {
      data.keywords = analysis.keywords;
    }
    
    if (analysis.sentiment) {
      data.sentiment = analysis.sentiment;
    }
  }

  /**
   * Find contact information on the page
   */
  private async findContactInfo(html: string, data: EnrichedData): Promise<void> {
    const contacts = {
      emails: new Set<string>(),
      phones: new Set<string>(),
      socialLinks: {} as Record<string, string>,
    };

    // Email regex pattern
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = html.match(emailRegex) || [];
    emailMatches.forEach(email => contacts.emails.add(email.toLowerCase()));

    // Phone regex pattern (simplified)
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatches = html.match(phoneRegex) || [];
    phoneMatches.forEach(phone => contacts.phones.add(phone));

    // Social media links
    const socialPlatforms = [
      { name: 'twitter', pattern: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/ },
      { name: 'linkedin', pattern: /https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]+)/ },
      { name: 'facebook', pattern: /https?:\/\/(?:www\.)?(?:facebook|fb)\.com\/([a-zA-Z0-9.]+)/ },
      { name: 'instagram', pattern: /https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/ },
      { name: 'youtube', pattern: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|user\/)?([a-zA-Z0-9_-]+)/ },
    ];

    socialPlatforms.forEach(platform => {
      const match = html.match(platform.pattern);
      if (match && match[0]) {
        contacts.socialLinks[platform.name] = match[0];
      }
    });

    // Add to result if any contacts found
    if (contacts.emails.size > 0 || contacts.phones.size > 0 || Object.keys(contacts.socialLinks).length > 0) {
      data.contacts = {
        emails: Array.from(contacts.emails),
        phones: Array.from(contacts.phones),
        socialLinks: contacts.socialLinks,
      };
    }
  }

  /**
   * Add domain metrics using an external API (placeholder implementation)
   */
  private async addDomainMetrics(url: string, data: EnrichedData): Promise<void> {
    // In a real implementation, this would call an external API like Moz, Ahrefs, etc.
    // This is a placeholder that simulates the API response
    data.metrics = {
      domainAuthority: Math.floor(Math.random() * 100),
      pageAuthority: Math.floor(Math.random() * 100),
      estimatedMonthlyVisitors: Math.floor(Math.random() * 1000000),
      bounceRate: Math.random(),
      pagesPerVisit: Math.random() * 10,
    };
  }

  /**
   * Find similar websites (placeholder implementation)
   */
  private async findSimilarSites(url: string, data: EnrichedData): Promise<void> {
    // In a real implementation, this would call an external API
    // This is a placeholder that returns mock data
    data.similarSites = [
      { url: 'https://example.com', similarity: 0.85, reason: 'Similar content and audience' },
      { url: 'https://demo.com', similarity: 0.72, reason: 'Related industry' },
    ];
  }

  /**
   * Check rate limits for the user
   */
  private async checkRateLimit(userId: string): Promise<void> {
    const isAllowed = await this.rateLimiter.checkLimit({
      userId,
      action: 'data_enrichment',
      cost: 1,
      windowMs: 60 * 1000, // 1 minute window
      maxRequests: 30, // 30 requests per minute
    });

    if (!isAllowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  /**
   * Get cached enrichment data if available
   */
  private async getCachedEnrichment(url: string): Promise<EnrichedData | null> {
    try {
      const { data, error } = await this.supabase
        .from('cached_enrichments')
        .select('*')
        .eq('url', url)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      return data.data as EnrichedData;
    } catch (error) {
      Logger.logError('Failed to get cached enrichment', error as Error, {
        url,
        category: 'enrichment',
      });
      return null;
    }
  }

  /**
   * Cache enrichment data
   */
  private async cacheEnrichment(data: EnrichedData): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Cache for 7 days

      await this.supabase.from('cached_enrichments').upsert({
        url: data.url,
        data,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      Logger.logError('Failed to cache enrichment', error as Error, {
        url: data.url,
        category: 'enrichment',
      });
      // Don't throw - caching is not critical
    }
  }

  /**
   * Extract text content from HTML (simplified)
   */
  private extractTextContent(html: string): string {
    // This is a simplified implementation. In a real app, you'd want to use a proper HTML parser
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      .trim();
  }

  /**
   * Handle errors during enrichment
   */
  private handleError(data: EnrichedData, message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${message}: ${errorMessage}`;
    
    Logger.logError(message, error as Error, {
      url: data.url,
      category: 'enrichment',
    });
    
    if (!data.errors) {
      data.errors = [];
    }
    
    if (!data.errors.includes(fullMessage)) {
      data.errors.push(fullMessage);
    }
  }
}

// Export a singleton instance
export const dataEnrichmentService = new DataEnrichmentService();
