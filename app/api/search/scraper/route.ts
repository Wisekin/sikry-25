import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { ScraperGeneratorService } from '@/lib/services/scraperGenerator';
import { TemplateMatcher } from '@/lib/services/templateMatcher';
import { rateLimit } from '@/lib/security/rateLimiter';
import { Logger } from '@/lib/monitoring/logger';

// It's highly recommended to move these interfaces to a shared types file (e.g., @/types/scraper.ts)
// to be used by frontend, this API route, and the generate-config API route.
// For now, defining them here to match the structure from DiscoveryModal and generate-config endpoint.
export interface ScraperSelector {
  fieldName: string;
  cssSelector: string;
  type: 'text' | 'attribute' | 'html';
  attributeName?: string;
}

export interface ScraperConfig {
  websiteUrl: string; // Note: The ScraperRequest below uses 'url', ensure consistency or mapping.
  selectors: ScraperSelector[];
  // Other fields like id, extractionRules, etc., can be added if needed by the service.
}

// Updated ScraperRequest to potentially include the full ScraperConfig object
export interface ScraperRequest {
  url: string;
  scraperConfigPayload?: ScraperConfig; // This will carry the AI-generated or manually edited config
  selectors?: Record<string, string>; // Kept for backward compatibility or other flows
  templateId?: string;
  options?: {
    useAi?: boolean;
    waitForSelectors?: string[];
    timeout?: number;
    screenshot?: boolean;
    metadata?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 30, // 30 requests per window
      keyGenerator: (req) => req.ip || 'anonymous'
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ScraperRequest = await request.json();
    // Destructure new scraperConfigPayload as well
    const { url, scraperConfigPayload, selectors, templateId, options = {} } = body;

    // URL from scraperConfigPayload should ideally match the top-level 'url', or be prioritized.
    // For now, we assume 'url' is the primary source of truth for the target site.
    const targetUrl = scraperConfigPayload?.websiteUrl || url;

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const scraperService = new ScraperGeneratorService();
    const templateMatcher = new TemplateMatcher();
    
    let result;
    
    try {
      // Priority 1: Use scraperConfigPayload if provided (this is our new AI-generated config path)
      if (scraperConfigPayload && scraperConfigPayload.selectors && scraperConfigPayload.selectors.length > 0) {
        // TODO: This is a temporary conversion. Ideally, ScraperGeneratorService should handle structured selectors.
        // This conversion loses type and attributeName information.
        const convertedSelectors: Record<string, string> = {};
        for (const selector of scraperConfigPayload.selectors) {
          convertedSelectors[selector.fieldName] = selector.cssSelector;
        }
        Logger.logInfo('Using scraperConfigPayload with converted selectors', { userId: user?.id, url: targetUrl, fieldCount: scraperConfigPayload.selectors.length });


        result = await scraperService.generateWithSelectors({
          url: targetUrl, // Use targetUrl which considers scraperConfigPayload.websiteUrl
          selectors: convertedSelectors,
          userId: user.id,
          options: {
            waitForSelectors: options.waitForSelectors,
            timeout: options.timeout,
            screenshot: options.screenshot,
            metadata: options.metadata,
          },
        });
      }
      // Priority 2: Use template ID if provided
      else if (templateId) {
        const template = await templateMatcher.getTemplate(templateId);
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }
        Logger.logInfo('Using templateId for scraping', { userId: user?.id, url: targetUrl, templateId });
        result = await scraperService.generateFromTemplate({
          url: targetUrl,
          templateId,
          userId: user.id,
          options: {
            waitForSelectors: options.waitForSelectors,
            timeout: options.timeout,
            screenshot: options.screenshot,
            metadata: options.metadata,
          },
        });
      } 
      // Priority 3: Use flat selectors if provided (legacy or other flows)
      else if (selectors && Object.keys(selectors).length > 0) {
        Logger.logInfo('Using flat selectors for scraping', { userId: user?.id, url: targetUrl, selectorKeys: Object.keys(selectors) });
        result = await scraperService.generateWithSelectors({
          url: targetUrl,
          selectors,
          userId: user.id,
          options: {
            waitForSelectors: options.waitForSelectors,
            timeout: options.timeout,
            screenshot: options.screenshot,
            metadata: options.metadata,
          },
        });
      } 
      // Priority 4: Otherwise, try to find a matching template or use AI (existing logic)
      else {
        Logger.logInfo('Attempting template match or AI generation for scraping', { userId: user?.id, url: targetUrl });
        const templateMatch = await templateMatcher.findMatchingTemplates({
          url: targetUrl,
          html: '', // Will be fetched by the matcher if needed
          userId: user.id,
        });

        if (templateMatch.length > 0 && templateMatch[0].confidence > 0.7) {
          const template = templateMatch[0].template;
          Logger.logInfo('Found matching template', { userId: user?.id, url: targetUrl, templateId: template.id });
          result = await scraperService.generateFromTemplate({
            url: targetUrl,
            templateId: template.id,
            userId: user.id,
            options: {
              waitForSelectors: options.waitForSelectors,
              timeout: options.timeout,
              screenshot: options.screenshot,
              metadata: options.metadata,
            },
          });
        } else if (options.useAi !== false) {
          Logger.logInfo('No matching template, using AI generation', { userId: user?.id, url: targetUrl });
          result = await scraperService.generateWithAi({
            url: targetUrl,
            userId: user.id,
            options: {
              waitForSelectors: options.waitForSelectors,
              timeout: options.timeout,
              screenshot: options.screenshot,
              metadata: options.metadata,
            },
          });
        } else {
          Logger.logWarn('No scraper config, template, selectors, or AI option provided', { userId: user?.id, url: targetUrl });
          return NextResponse.json(
            { 
              error: 'No valid scraping configuration provided (e.g., AI prompt, template, or direct selectors).',
              suggestion: 'Provide selectors, a templateId, or enable AI generation'
            },
            { status: 400 }
          );
        }
      }


      // Log the successful scrape
      Logger.logInfo('Scraper execution completed', {
        userId: user.id,
        url,
        templateId: result.templateId,
        category: 'scraper',
        metadata: {
          selectors: Object.keys(result.data || {}).length,
          executionTime: result.metadata?.executionTime,
          success: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: result.data,
        metadata: {
          ...result.metadata,
          templateId: result.templateId,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Logger.logError('Scraper execution failed', {
        error: errorMessage,
        userId: user.id,
        url,
        templateId,
        category: 'scraper',
      });

      return NextResponse.json(
        { 
          error: 'Failed to generate scraper',
          details: errorMessage,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    Logger.logError('Scraper API error', error as Error, {
      category: 'scraper',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const templateId = searchParams.get('templateId');

    // Query the database for scrapers
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('scrapers')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (templateId) {
      query = query.eq('template_id', templateId);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    Logger.logError('Failed to fetch scrapers', error as Error, {
      category: 'scraper',
    });

    return NextResponse.json(
      { error: 'Failed to fetch scrapers' },
      { status: 500 }
    );
  }
}

// Add support for DELETE and PUT methods if needed
export { DELETE, PUT } from '@/lib/api/handlers';

// Add OPTIONS for CORS preflight

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
