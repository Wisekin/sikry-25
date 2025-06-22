import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { chromium, Browser, Page } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Simple logger implementation if @/lib/logger is not available
interface ILogger {
  logInfo: (message: string, meta?: Record<string, unknown>) => void;
  logError: (message: string, error: unknown, meta?: Record<string, unknown>) => void;
  logWarn: (message: string, meta?: Record<string, unknown>) => void;
  logDebug: (message: string, meta?: Record<string, unknown>) => void;
}

// Simple console logger implementation
class ConsoleLogger implements ILogger {
  logInfo(message: string, meta?: Record<string, unknown>) {
    console.log(`[INFO] ${message}`, meta || '');
  }
  
  logError(message: string, error: unknown, meta?: Record<string, unknown>) {
    console.error(`[ERROR] ${message}`, { error, ...meta });
  }
  
  logWarn(message: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN] ${message}`, meta || '');
  }
  
  logDebug(message: string, meta?: Record<string, unknown>) {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
}

// Default logger instance
const defaultLogger: ILogger = new ConsoleLogger();

// Define types and interfaces at the top level
type ScraperStatus = 'active' | 'inactive' | 'error';

interface ScraperConfig {
  id: string;
  name: string;
  url: string;
  targetFields: string[];
  selectors: Record<string, string>;
  config: {
    delay?: number;
    userAgent?: string;
    headers?: Record<string, string>;
    javascript?: boolean;
    respectRobots?: boolean;
    depth?: number;
  };
  aiGenerated: boolean;
  status: ScraperStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface GenerateScraperParams {
  url: string;
  targetFields: string[];
  userId: string;
  options?: {
    delay?: number;
    userAgent?: string;
    headers?: Record<string, string>;
    javascript?: boolean;
    respectRobots?: boolean;
    depth?: number;
  };
  aiEnhanced?: boolean;
  scraperType?: 'static' | 'dynamic';
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

interface ScraperGenerationOptions {
  waitForSelectors?: string[];
  timeout?: number;
  screenshot?: boolean;
  metadata?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
}

interface ScraperGenerationResult {
  data: Record<string, unknown>;
  metadata: {
    url: string;
    timestamp: string;
    executionTime: number;
    screenshotPath?: string;
    templateId?: string;
    selectorsUsed: Record<string, string>;
    status: 'success' | 'partial' | 'failed';
    errors?: string[];
  };
}

export class ScraperGeneratorService {
  private supabase: SupabaseClient;
  private openai: OpenAI;
  private browser: Browser | null = null;
  private readonly logger: ILogger;
  private readonly SCREENSHOT_DIR = join(process.cwd(), 'public', 'screenshots');
  private readonly DEFAULT_CONFIG: ScraperConfig['config'] = {
    delay: 1000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    headers: {},
    javascript: true,
    respectRobots: true,
    depth: 1,
  };

  constructor(logger?: ILogger) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || ''
    );
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    this.logger = logger || new ConsoleLogger();
  }

  // Ensure the screenshots directory exists
  private async ensureScreenshotDir(): Promise<void> {
    if (!existsSync(this.SCREENSHOT_DIR)) {
      await fs.mkdir(this.SCREENSHOT_DIR, { recursive: true });
    }
  }

  // Initialize the browser instance if not already initialized
  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  // Close the browser instance
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Take a screenshot of the page
  private async takeScreenshot(page: Page, url: string): Promise<string> {
    try {
      await this.ensureScreenshotDir();
      const filename = `${uuidv4()}.png`;
      const filepath = join(this.SCREENSHOT_DIR, filename);
      await page.screenshot({ path: filepath, fullPage: true });
      return `/screenshots/${filename}`;
    } catch (error) {
      this.logger.logError('Failed to take screenshot', error as Error, { url });
      return '';
    }
  }

  private async analyzeWebsite(url: string): Promise<Record<string, any>> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 // 30 seconds timeout
      });
      
      // Wait for network to be idle
      await page.waitForLoadState('networkidle');
      
      // Extract basic page information
      const pageInfo = await page.evaluate((): Record<string, any> => {
        const getMeta = (name: string): string => {
          const element = document.querySelector(`meta[name='${name}']`) || 
                        document.querySelector(`meta[property='og:${name}']`) ||
                        document.querySelector(`meta[property='twitter:${name}']`);
          return element ? element.getAttribute('content') || '' : '';
        };

        // Get all links
        const links = Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent?.trim() || '',
          href: a.href,
          title: a.title || ''
        }));

        // Get all forms
        const forms = Array.from(document.forms).map((form, index) => ({
          id: form.id || `form-${index}`,
          action: form.action,
          method: form.method,
          inputs: Array.from(form.elements).map((el: Element) => {
            const input = el as HTMLInputElement;
            return {
              type: input.type || 'text',
              name: input.name || '',
              id: input.id || '',
              className: input.className,
              required: input.required || false
            };
          })
        }));

        return {
          title: document.title,
          description: getMeta('description'),
          keywords: getMeta('keywords'),
          url: window.location.href,
          hostname: window.location.hostname,
          pathname: window.location.pathname,
          headings: {
            h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim() || ''),
            h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim() || ''),
            h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim() || '')
          },
          meta: {
            viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '',
            robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
            ogTitle: getMeta('title'),
            ogDescription: getMeta('description'),
            ogImage: getMeta('image')
          },
          links: {
            stylesheets: Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(link => link.href),
            scripts: Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]')).map(script => script.src),
            all: links
          },
          forms: forms
        };
      });

      // Take a screenshot for reference
      const screenshotPath = await this.takeScreenshot(page, url);

      return {
        ...pageInfo,
        screenshotPath,
        analyzedAt: new Date().toISOString(),
        detectedPlatform: this.detectPlatform(pageInfo)
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during website analysis';
      this.logger.logError(`Error analyzing website: ${errorMessage}`, error, { url });
      throw new Error(`Failed to analyze website: ${errorMessage}`);
    } finally {
      await page.close();
    }
  }

  private generateBasicSelectors(targetFields: string[]): Record<string, string> {
    const selectors: Record<string, string> = {};
    
    targetFields.forEach(field => {
      // Simple mapping of common field names to potential selectors
      const fieldLower = field.toLowerCase();
      
      if (fieldLower.includes('title')) {
        selectors[field] = 'h1';
      } else if (fieldLower.includes('description')) {
        selectors[field] = 'meta[name="description"]';
      } else if (fieldLower.includes('price')) {
        selectors[field] = '.price, [itemprop="price"]';
      } else if (fieldLower.includes('image')) {
        selectors[field] = 'img[src]';
      } else {
        // Default to class-based selector
        selectors[field] = `.${field.toLowerCase().replace(/\s+/g, '-')}`;
      }
    });
    
    return selectors;
  }

  private async generateAISelectors(params: {
    url: string;
    targetFields: string[];
    websiteAnalysis: Record<string, any>;
    scraperType: string;
  }): Promise<Record<string, string>> {
    // In a real implementation, this would use the OpenAI API to generate selectors
    // For now, we'll return a simplified version that uses the basic selectors
    // and adds some AI-specific optimizations
    
    const baseSelectors = this.generateBasicSelectors(params.targetFields);
    const enhancedSelectors: Record<string, string> = {};
    
    // Add some AI-specific optimizations based on the website analysis
    for (const [field, selector] of Object.entries(baseSelectors)) {
      const fieldLower = field.toLowerCase();
      
      // Example: If the page has many h1 elements, be more specific
      if (fieldLower.includes('title') && params.websiteAnalysis.headings?.length > 1) {
        enhancedSelectors[field] = 'h1:first-of-type';
      } 
      // Add more AI-specific optimizations here
      else {
        enhancedSelectors[field] = selector as string;
      }
    }
    
    return enhancedSelectors;
  }

  async generateScraper(params: GenerateScraperParams): Promise<ScraperConfig> {
    try {
      this.logger.logInfo('Starting scraper generation', {
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
          scraperType: params.scraperType || 'static'
        });
      } else {
        // Generate basic selectors
        selectors = this.generateBasicSelectors(params.targetFields);
      }

      // Create scraper configuration
      const now = new Date().toISOString();
      const scraperConfig: Omit<ScraperConfig, 'id'> = {
        name: `Scraper for ${new URL(params.url).hostname}`,
        url: params.url,
        targetFields: params.targetFields,
        selectors,
        config: {
          delay: params.options?.delay || 1000,
          userAgent: params.options?.userAgent || 'Mozilla/5.0 (compatible; SikryBot/1.0)',
          headers: params.options?.headers || {},
          javascript: params.options?.javascript || false,
          respectRobots: params.options?.respectRobots !== false,
          depth: params.options?.depth || 1
        },
        aiGenerated: !!params.aiEnhanced,
        status: 'active',
        userId: params.userId,
        createdAt: now,
        updatedAt: now
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

      this.logger.logInfo('Scraper generated successfully', {
        scraperId: result.id,
        url: params.url,
        userId: params.userId,
        category: 'scraper'
      });

      return result;

    } catch (error) {
      this.logger.logError('Failed to generate scraper', error, {
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
      this.logger.logError('Failed to get scraper', error, {
        scraperId: params.scraperId,
        userId: params.userId,
        category: 'scraper'
      });
      throw error;
    }
  }

  /**
   * Get paginated list of scrapers with optional user filtering
   * @param page Page number (1-based)
   * @param limit Number of items per page
   * @param userId Optional user ID to filter by
   * @returns Object containing scraper data and total count
   */
  async getScrapers(
    page: number = 1, 
    limit: number = 10, 
    userId?: string
  ): Promise<{ data: ScraperConfig[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = this.supabase
        .from('scrapers')
        .select('*', { count: 'exact' });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        this.logger.logError('Error fetching scrapers', error);
        throw new Error(`Failed to fetch scrapers: ${error.message}`);
      }
      
      // Transform the data to match ScraperConfig interface
      const scrapers = (data || []).map(item => ({
        id: String(item?.id || ''),
        name: String(item?.name || ''),
        url: String(item?.url || ''),
        targetFields: Array.isArray(item?.target_fields) ? item.target_fields : [],
        selectors: item?.selectors && typeof item.selectors === 'object' ? item.selectors : {},
        config: item?.config && typeof item.config === 'object' ? item.config : {},
        aiGenerated: Boolean(item?.ai_generated),
        status: ['active', 'inactive', 'error'].includes(String(item?.status)) 
          ? item.status as ScraperStatus 
          : 'inactive',
        createdAt: item?.created_at 
          ? new Date(item.created_at).toISOString() 
          : new Date().toISOString(),
        updatedAt: item?.updated_at 
          ? new Date(item.updated_at).toISOString() 
          : new Date().toISOString(),
        userId: String(item?.user_id || '')
      }));

      return {
        data: scrapers,
        total: count || 0
      };
    } catch (error) {
      this.logger.logError('Error in getScrapers', error);
      throw error;
    }
  }

  /**
   * Get common selectors for different website types and domains
   * @param websiteTypeOrDomain Type of website (wordpress, shopify, etc.) or domain name
   * @returns Object containing common selectors for the website type or domain
   */
  private getCommonSelectors(websiteTypeOrDomain: string): Record<string, string> {
    // First check for platform-specific selectors (wordpress, shopify, etc.)
    const platformSelectors: Record<string, Record<string, string>> = {
      wordpress: {
        title: 'h1.entry-title, h1.page-title',
        content: 'div.entry-content, div.post-content',
        date: 'time.entry-date, span.posted-on',
        author: 'span.author a, a.url.fn.n',
        excerpt: 'div.entry-summary, div.post-excerpt',
        featuredImage: 'img.attachment-post-thumbnail, img.wp-post-image'
      },
      shopify: {
        productTitle: 'h1.product-title, h1.product-single__title',
        price: 'span.price-item--regular, span.product-price__price',
        description: 'div.product-description, div.product-single__description',
        addToCart: 'button.add-to-cart, button.product-form__submit',
        variants: 'select.product-form__variants, select.single-option-selector'
      },
      magento: {
        productName: 'h1.page-title span.base',
        price: 'span.price-container .price-wrapper .price',
        description: 'div.product.attribute.description',
        addToCart: 'button#product-addtocart-button',
        productImage: 'img.gallery-placeholder__image'
      },
      squarespace: {
        title: 'h1.entry-title, h1.portfolio-title',
        content: 'div.entry-content, div.sqs-block-content',
        date: 'time.entry-date, .entry-meta time',
        author: '.entry-author, .entry-byline',
        featuredImage: 'img.entry-image, .sqs-block-image img'
      }
    };

    // Check for domain-specific selectors
    const domainSelectors: Record<string, Record<string, string>> = {
      'amazon.com': {
        title: '#productTitle',
        price: '.a-price-whole',
        description: '#feature-bullets',
        image: '#landingImage',
        rating: '.a-icon-alt',
        reviews: '#acrCustomerReviewText'
      },
      'linkedin.com': {
        name: '.text-heading-xlarge',
        title: '.text-body-medium',
        company: '.org-top-card-summary__title',
        about: '.display-flex.ph5.pv3 > div > div > div > div > span'
      },
      'github.com': {
        username: '.p-nickname',
        name: '.p-name',
        bio: '.p-note',
        location: '.p-label',
        website: 'a[rel="nofollow me"]',
        repos: '.UnderlineNav-item[data-tab-item="repositories"] .Counter'
      }
    };

    // Default selectors for unknown platforms/domains
    const defaultSelectors = {
      title: 'h1',
      content: 'article, main, .content, #content',
      description: 'meta[property="og:description"], meta[name="description"]',
      image: 'img:first-of-type, .hero-image, .main-image',
      price: '.price, .amount, [itemprop="price"]',
      url: 'a[href^="http"], link[rel="canonical"]',
      date: 'time, .date, .timestamp, [datetime]',
      h1: 'h1',
      h2: 'h2',
      h3: 'h3'
    };

    // Check if the input is a known platform
    const normalizedType = websiteTypeOrDomain.toLowerCase();
    if (platformSelectors[normalizedType]) {
      return { ...defaultSelectors, ...platformSelectors[normalizedType] };
    }

    // Check if the input is a known domain or subdomain
    for (const [domain, selectors] of Object.entries(domainSelectors)) {
      if (normalizedType.endsWith(domain) || 
          normalizedType === domain || 
          normalizedType.endsWith(`.${domain}`)) {
        return { ...defaultSelectors, ...selectors };
      }
    }

    // Return default selectors if no specific ones found
    return defaultSelectors;
  }

  /**
   * Detect the platform/technology used by the website
   * @param analysis Page analysis information
   * @returns Detected platform name
   */
  private detectPlatform(analysis: Record<string, any>): string {
    // Check for WordPress
    if ((analysis.meta?.generator && 
        typeof analysis.meta.generator === 'string' && 
        analysis.meta.generator.toLowerCase().includes('wordpress')) ||
        (Array.isArray(analysis.links?.all) && 
         analysis.links.all.some((link: any) => 
          typeof link.href === 'string' && link.href.includes('wp-content')))) {
      return 'wordpress';
    }
    
    // Check for Shopify
    if (Array.isArray(analysis.links?.all) && 
        analysis.links.all.some((link: any) => 
          typeof link.href === 'string' && 
          (link.href.includes('shopify.com') || 
           link.href.includes('shopify.edgekey.net')))) {
      return 'shopify';
    }
    
    // Check for Magento
    if (Array.isArray(analysis.links?.all) && 
        analysis.links.all.some((link: any) => 
          typeof link.href === 'string' && 
          (link.href.includes('magento') || 
           link.href.includes('magento2')))) {
      return 'magento';
    }
    
    // Check for Squarespace
    if (Array.isArray(analysis.links?.all) && 
        analysis.links.all.some((link: any) => 
          typeof link.href === 'string' && 
          link.href.includes('squarespace'))) {
      return 'squarespace';
    }
    
    // Check for Angular
    if (Array.isArray(analysis.links?.scripts) && 
        analysis.links.scripts.some((script: string) => 
          script.includes('@angular/') || 
          script.includes('angular'))) {
      return 'angular';
    }
    
    // Check for Vue
    if ((Array.isArray(analysis.links?.scripts) && 
         analysis.links.scripts.some((script: string) => 
           script.includes('vue.') || script.includes('nuxt.'))) ||
        (analysis.meta?.generator && 
         typeof analysis.meta.generator === 'string' && 
         analysis.meta.generator.includes('Nuxt'))) {
      return 'vue';
    }
    
    return 'custom';
  }



  /**
   * Clean up resources when the service is no longer needed
   */
  async destroy(): Promise<void> {
    await this.close();
  }
}