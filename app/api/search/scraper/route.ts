import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { ScraperGeneratorService } from '@/lib/services/scraperGenerator';
import { TemplateMatcher } from '@/lib/services/templateMatcher';
import { rateLimit } from '@/lib/security/rateLimiter';
import { Logger } from '@/lib/monitoring/logger';

export interface ScraperRequest {
  url: string;
  selectors?: Record<string, string>;
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
    const { url, selectors, templateId, options = {} } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const scraperService = new ScraperGeneratorService();
    const templateMatcher = new TemplateMatcher();
    
    let result;
    
    try {
      // If template ID is provided, use it
      if (templateId) {
        const template = await templateMatcher.getTemplate(templateId);
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }
        
        result = await scraperService.generateFromTemplate({
          url,
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
      // If selectors are provided, use them
      else if (selectors && Object.keys(selectors).length > 0) {
        result = await scraperService.generateWithSelectors({
          url,
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
      // Otherwise, try to find a matching template or use AI
      else {
        // First try to find a matching template
        const templateMatch = await templateMatcher.findMatchingTemplates({
          url,
          html: '', // Will be fetched by the matcher if needed
          userId: user.id,
        });

        if (templateMatch.length > 0 && templateMatch[0].confidence > 0.7) {
          // Use the best matching template
          const template = templateMatch[0].template;
          result = await scraperService.generateFromTemplate({
            url,
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
          // Use AI to generate selectors if no good template match
          result = await scraperService.generateWithAi({
            url,
            userId: user.id,
            options: {
              waitForSelectors: options.waitForSelectors,
              timeout: options.timeout,
              screenshot: options.screenshot,
              metadata: options.metadata,
            },
          });
        } else {
          return NextResponse.json(
            { 
              error: 'No template or selectors provided',
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
import { NextResponse } from 'next/server';

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
