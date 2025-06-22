import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { WebsiteDiscoveryService } from '@/lib/services/websiteDiscovery';
import { rateLimit } from '@/lib/security/rateLimiter';
import { Logger } from '@/lib/monitoring/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requests per window
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
    const { query, sources = ['google', 'direct', 'social'], maxResults = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const discoveryService = new WebsiteDiscoveryService();
    const results = await discoveryService.discoverWebsites({
      query,
      sources,
      maxResults,
      userId: user.id
    });

    Logger.logInfo('Website discovery completed', {
      userId: user.id,
      query,
      resultsCount: results.length,
      category: 'discovery'
    });

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        query,
        sources,
        resultsCount: results.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    Logger.logError('Website discovery error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      category: 'discovery'
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const query = searchParams.get('query');

    const discoveryService = new WebsiteDiscoveryService();
    const results = await discoveryService.getDiscoveryHistory({
      userId: user.id,
      page,
      limit,
      query
    });

    return NextResponse.json({
      success: true,
      data: results.data,
      meta: {
        page,
        limit,
        total: results.total,
        totalPages: Math.ceil(results.total / limit)
      }
    });

  } catch (error) {
    Logger.logError('Get discovery history error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      category: 'discovery'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}