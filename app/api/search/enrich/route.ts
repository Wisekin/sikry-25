import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server';
import { DataEnrichmentService } from '@/lib/services/dataEnrichment';
import { rateLimit } from '@/lib/security/rateLimiter';
import { Logger } from '@/lib/monitoring/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // 20 requests per window
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
      companyId, 
      scrapedData, 
      mergeStrategy = 'smart', 
      conflictResolution = 'newest',
      validateData = true 
    } = body;

    if (!companyId || !scrapedData) {
      return NextResponse.json(
        { error: 'Company ID and scraped data are required' },
        { status: 400 }
      );
    }

    const enrichmentService = new DataEnrichmentService();
    const result = await enrichmentService.enrichCompanyData({
      companyId,
      scrapedData,
      mergeStrategy,
      conflictResolution,
      validateData,
      userId: user.id
    });

    Logger.logInfo('Data enrichment completed', {
      userId: user.id,
      companyId,
      mergeStrategy,
      conflictResolution,
      qualityScore: result.qualityScore,
      category: 'enrichment'
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        companyId,
        mergeStrategy,
        conflictResolution,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    Logger.logError('Data enrichment error', error as Error, {
      category: 'enrichment'
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
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const enrichmentService = new DataEnrichmentService();
    const results = await enrichmentService.getEnrichmentHistory({
      userId: user.id,
      companyId,
      page,
      limit,
      status
    });

    return NextResponse.json({
      success: true,
      data: results.data,
      meta: {
        page,
        limit,
        total: results.total,
        totalPages: Math.ceil(results.total / limit),
        companyId,
        status
      }
    });

  } catch (error) {
    Logger.logError('Get enrichment history error', error as Error, {
      category: 'enrichment'
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
    const { enrichmentId, status, notes } = body;

    if (!enrichmentId || !status) {
      return NextResponse.json(
        { error: 'Enrichment ID and status are required' },
        { status: 400 }
      );
    }

    const enrichmentService = new DataEnrichmentService();
    const result = await enrichmentService.updateEnrichmentStatus({
      enrichmentId,
      status,
      notes,
      userId: user.id
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    Logger.logError('Update enrichment status error', error as Error, {
      category: 'enrichment'
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}