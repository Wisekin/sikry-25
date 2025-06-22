import { createClient } from '@/src/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';
import OpenAI from 'openai';

interface GenerateScraperParams {
  url: string;
  targetFields: string[];
  scraperType: 'general' | 'ecommerce' | 'social' | 'news' | 'business';
  options: {
    respectRobots?: boolean;
    delay?: number;
    userAgent?: string;
    headers?: Record<string, string>;
    javascript?: boolean;
    depth?: number;
  };
  aiEnhanced: boolean;
  userId: string;
}

interface ScraperConfig {
  id: string;
  name: string;
  url: string;
  targetFields: string[];
  selectors: Record<string, string>;
  config: {
    delay: number;
    userAgent: string;
    headers: Record<string, string>;
    javascript: boolean;
    respectRobots: boolean;
    depth: number;
  };
  aiGenerated: boolean;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface GetScrapersParams {
  userId: string;
  page: number;
  limit: number;
  status?: string;
  type?: string;
}

interface UpdateScraperParams {
  scraperId: string;
  updates: Partial<ScraperConfig>;
  userId: string;
}

export class ScraperGeneratorService {
  private supabase = createClient();
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateScraper(params: GenerateScraperParams): Promise<ScraperConfig> {
    try {
      Logger.logInfo('Starting scraper generation', {
        url: params.url,
        targetFields: params.targetFields,
        aiEnhanced: params.aiEnhanced,
        userId: params.userId,
        category: 'scraper'
      });

      // Analyze the website structure
      const websiteAnalysis = await this.analyzeWebsite(params.url);
      
      let selectors: Record<string, string> = {};
      
      if (params.aiEnhanced) {
        // Use AI to generate intelligent selectors
        selectors = await this.generateAISelectors({
          url: params.url,
          targetFields: params.targetFields,
          websiteAnalysis,
          scraperType: params.scraperType
        });
      } else {
        // Generate basic selectors
        selectors = this.generateBasicSelectors(params.targetFields);
      }

      // Create scraper configuration
      const scraperConfig: Omit<ScraperConfig, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `Scraper for ${new URL(params.url).hostname}`,
        url: params.url,
        targetFields: params.targetFields,
        selectors,
        config: {
          delay: params.options.delay || 1000,
          userAgent: params.options.userAgent || 'Mozilla/5.0 (compatible; SikryBot/1.0)',
          headers: params.options.headers || {},
          javascript: params.options.javascript || false,
          respectRobots: params.options.respectRobots !== false,
          depth: params.options.depth || 1
        },
        aiGenerated: params.aiEnhanced,
        status: 'active',
        userId: params.userId
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('scrapers')
        .insert({
          ...scraperConfig,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save scraper: ${error.message}`);
      }

      const result: ScraperConfig = {
        id: data.id,
        name: data.name,
        url: data.url,
        targetFields: data.target_fields,
        selectors: data.selectors,
        config: data.config,
        aiGenerated: data.ai_generated,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id
      };

      Logger.logInfo('Scraper generated successfully', {
        scraperId: result.id,
        url: params.url,
        userId: params.userId,
        category: 'scraper'
      });

      return result;

    } catch (error) {
      Logger.logError('Failed to generate scraper', error as Error, {
        url: params.url,
        userId: params.userId,
        category: 'scraper'
      });
      throw error;
    }
  }

  async getScraper(params: { scraperId: string; userId: string }): Promise<ScraperConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('scrapers')
        .select('*')
        .eq('id', params.scraperId)
        .eq('user_id', params.userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        url: data.url,
        targetFields: data.target_fields,
        selectors: data.selectors,
        config: data.config,
        aiGenerated: data.ai_generated,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id
      };

    } catch (error) {
      Logger.logError('Failed to get scraper', error as Error, {
        scraperId: params.scraperId,
        userId: params.userId,
        category: 'scraper'
      });
      throw error;
    }
  }

  async getScrapers(params: GetScrapersParams): Promise<{ data: ScraperConfig[]; total: number }> {
    try {
      let query = this.supabase
        .from('scrapers')
        .select('*', { count: 'exact' })
        .eq('user_id', params.userId);

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.type) {
        query = query.eq('scraper_type', params.type);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((params.page - 1) * params.limit, params.page * params.limit - 1);

      if (error) {
        throw new Error(`Failed to get scrapers: ${error.message}`);
      }

      const scrapers: ScraperConfig[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        targetFields: item.target_fields,
        selectors: item.selectors,
        config: item.config,
        aiGenerated: item.ai_generated,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        userId: item.user_id
      }));

      return {
        data: scrapers,
        total: count || 0
      };

    } catch (error) {
      Logger.logError('Failed to get scrapers', error as Error, {
        userId: params.userId,
        category: 'scraper'
      });
      throw error;
    }
  }

  async updateScraper(params: UpdateScraperParams): Promise<ScraperConfig> {
    try {
      const { data, error } = await this.supabase
        .from('scrapers')
        .update({
          ...params.updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.scraperId)
        .eq('user_id', params.userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update scraper: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        url: data.url,
        targetFields: data.target_fields,
        selectors: data.selectors,
        config: data.config,
        aiGenerated: data.ai_generated,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id
      };

    } catch (error) {
      Logger.logError('Failed to update scraper', error as Error, {
        scraperId: params.scraperId,
        userId: params.userId,
        category: 'scraper'
      });
      throw error;
    }
  }

  async deleteScraper(params: { scraperId: string; userId: string }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('scrapers')
        .delete()
        .eq('id', params.scraperId)
        .eq('user_id', params.userId);

      if (error) {
        throw new Error(`Failed to delete scraper: ${error.message}`);
      }

    } catch (error) {
      Logger.logError('Failed to delete scraper', error as Error, {
        scraperId: params.scraperId,
        userId: params.userId,
        category: 'scraper'
      });
      throw error;
    }
  }

  private async analyzeWebsite(url: string): Promise<any> {
    try {
      // Basic website analysis - in a real implementation, this would
      // fetch and analyze the website structure
      const domain = new URL(url).hostname;
      
      return {
        domain,
        detectedType: this.detectWebsiteType(domain),
        commonSelectors: this.getCommonSelectors(domain)
      };
    } catch (error) {
      Logger.logError('Website analysis failed', error as Error, {
        url,
        category: 'scraper'
      });
      return {};
    }
  }

  private async generateAISelectors(params: {
    url: string;
    targetFields: string[];
    websiteAnalysis: any;
    scraperType: string;
  }): Promise<Record<string, string>> {
    try {
      const prompt = `
Generate CSS selectors for scraping the following fields from ${params.url}:
Fields: ${params.targetFields.join(', ')}
Website type: ${params.scraperType}
Website analysis: ${JSON.stringify(params.websiteAnalysis)}

Return a JSON object with field names as keys and CSS selectors as values.
Example: {"title": "h1", "price": ".price", "description": ".description"}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      return JSON.parse(content);

    } catch (error) {
      Logger.logError('AI selector generation failed', error as Error, {
        url: params.url,
        category: 'scraper'
      });
      
      // Fallback to basic selectors
      return this.generateBasicSelectors(params.targetFields);
    }
  }

  private generateBasicSelectors(targetFields: string[]): Record<string, string> {
    const selectors: Record<string, string> = {};
    
    targetFields.forEach(field => {
      const fieldLower = field.toLowerCase();
      
      if (fieldLower.includes('title')) {
        selectors[field] = 'h1, .title, [data-title]';
      } else if (fieldLower.includes('price')) {
        selectors[field] = '.price, [data-price], .cost';
      } else if (fieldLower.includes('description')) {
        selectors[field] = '.description, .desc, [data-description]';
      } else if (fieldLower.includes('image')) {
        selectors[field] = 'img, [data-image]';
      } else if (fieldLower.includes('link')) {
        selectors[field] = 'a[href], [data-link]';
      } else {
        selectors[field] = `[data-${fieldLower}], .${fieldLower}, #${fieldLower}`;
      }
    });
    
    return selectors;
  }

  private detectWebsiteType(domain: string): string {
    if (domain.includes('shop') || domain.includes('store') || domain.includes('amazon') || domain.includes('ebay')) {
      return 'ecommerce';
    }
    if (domain.includes('news') || domain.includes('blog') || domain.includes('medium')) {
      return 'news';
    }
    if (domain.includes('linkedin') || domain.includes('facebook') || domain.includes('twitter')) {
      return 'social';
    }
    return 'general';
  }

  private getCommonSelectors(domain: string): Record<string, string> {
    const commonSelectors: Record<string, Record<string, string>> = {
      'amazon.com': {
        title: '#productTitle',
        price: '.a-price-whole',
        description: '#feature-bullets'
      },
      'linkedin.com': {
        name: '.text-heading-xlarge',
        title: '.text-body-medium',
        company: '.org-top-card-summary__title'
      }
    };

    return commonSelectors[domain] || {};
  }
}