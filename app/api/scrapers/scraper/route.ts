import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { ScraperGeneratorService } from '@/lib/services/scraperGenerator';
import { RateLimiterService } from '@/lib/services/rateLimiter';
import { rateLimit } from '@/lib/security/rateLimiter';
import { Logger } from '@/lib/monitoring/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 scraper generations per window
      keyGenerator: (req) => req.ip || 'anonymous'
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      url, 
      targetFields, 
      scraperType = 'general',
      options = {},
      aiEnhanced = true 
    } = body;

    if (!url || !targetFields || !Array.isArray(targetFields)) {
      return NextResponse.json(
        { error: 'URL and target fields array are required' },
        { status: 400 }
      );
    }

    const scraperService = new ScraperGeneratorService();
    const rateLimiterService = new RateLimiterService();

    // Check rate limits for this user
    const canProceed = await rateLimiterService.checkLimit({
      userId: user.id,
      action: 'scraper_generation',
      limit: 10,
      windowMs: 60 * 60 * 1000 // 1 hour
    });

    if (!canProceed) {
      return NextResponse.json(
        { error: 'User rate limit exceeded' },
        { status: 429 }
      );
    }

    const result = await scraperService.generateScraper({
      url,
      targetFields,
      scraperType,
      options,
      aiEnhanced,
      userId: user.id
    });

    // Record the rate limit usage
    await rateLimiterService.recordUsage({
      userId: user.id,
      action: 'scraper_generation'
    });

    Logger.logInfo('Scraper generated successfully', {
      userId: user.id,
      url,
      scraperType,
      aiEnhanced,
      scraperId: result.id,
      category: 'scraper'
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        url,
        scraperType,
        aiEnhanced,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    Logger.logError('Scraper generation error', error as Error, {
      category: 'scraper'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scraperId = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const scraperService = new ScraperGeneratorService();

    if (scraperId) {
      // Get specific scraper
      const scraper = await scraperService.getScraper({
        scraperId,
        userId: user.id
      });

      if (!scraper) {
        return NextResponse.json(
          { error: 'Scraper not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: scraper
      });
    }

    // Get scrapers list
    const results = await scraperService.getScrapers({
      userId: user.id,
      page,
      limit,
      status,
      type
    });

    return NextResponse.json({
      success: true,
      data: results.data,
      meta: {
        page,
        limit,
        total: results.total,
        totalPages: Math.ceil(results.total / limit),
        status,
        type
      }
    });

  } catch (error) {
    Logger.logError('Get scrapers error', error as Error, {
      category: 'scraper'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { scraperId, updates } = body;

    if (!scraperId || !updates) {
      return NextResponse.json(
        { error: 'Scraper ID and updates are required' },
        { status: 400 }
      );
    }

    const scraperService = new ScraperGeneratorService();
    const result = await scraperService.updateScraper({
      scraperId,
      updates,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    Logger.logError('Update scraper error', error as Error, {
      category: 'scraper'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scraperId = searchParams.get('id');

    if (!scraperId) {
      return NextResponse.json(
        { error: 'Scraper ID is required' },
        { status: 400 }
      );
    }

    const scraperService = new ScraperGeneratorService();
    await scraperService.deleteScraper({
      scraperId,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Scraper deleted successfully'
    });

  } catch (error) {
    Logger.logError('Delete scraper error', error as Error, {
      category: 'scraper'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}