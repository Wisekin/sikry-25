import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/utils/supabase/server'
import type { ApiResponse, SearchScope } from '@/src/types';
import type { SearchResult } from '@/src/types/search';
import { CacheManager } from '@/src/utils/cache/cacheManager'
import { DbRateLimiter } from '@/src/utils/cache/rateLimiter'

const supabase = createClient()

// Cache TTL per search scope
const CACHE_TTL: Record<SearchScope, number> = {
  companies: 3600,      // 1 hour for company searches
  contacts: 1800,       // 30 minutes for contact searches
  insights: 900,        // 15 minutes for insights
  default: 600         // 10 minutes default
}

export async function GET(request: NextRequest) {
  const searchStartTime = Date.now();
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const scope = (url.searchParams.get('scope') || 'companies') as SearchScope
    // Initialize rate limiter and check limits
    const rateLimiter = new DbRateLimiter();
    const { 
      allowed: canProceed, 
      status, 
      message, 
      userId, 
      organizationId, 
      plan 
    } = await rateLimiter.isAllowed(request);

    if (!canProceed || !userId || !organizationId || !plan) {
      return NextResponse.json(
        {
          success: false,
          message: message || 'Rate limit exceeded or unauthorized.',
          errors: [{ code: 'RATE_LIMIT_OR_AUTH_ERROR', message: message || 'Too many requests or user context not found.' }]
        } as ApiResponse,
        { status: status || 429 }
      );
    }

    // Initialize cache manager
    const cacheManager = new CacheManager(organizationId, plan);
    const cacheKey = `search:${scope}:${query}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    // --- Modular Search Integration ---
    const { parseQuery } = await import('@/src/search/queryParser');
    const { companiesHouseAdapter } = await import('@/src/search/adapters/companiesHouse');

    // Parse the query using the modular parser
    const parsedQuery = await parseQuery(query);

    // Call Supabase (internal DB)
    const supabaseResult = await performSearch(query, scope, organizationId);
    
    if (!supabaseResult.success) {
        console.error("Search failed due to database error:", supabaseResult.error);
        return NextResponse.json(
            {
                success: false,
                message: 'An error occurred during the database search.',
                errors: [supabaseResult.error]
            } as ApiResponse,
            { status: 500 }
        );
    }

    // Call Companies House adapter and map results
    let companiesHouseResults: SearchResult[] = [];
    if (parsedQuery) {
      const adapterResults = await companiesHouseAdapter.search(parsedQuery);
      companiesHouseResults = adapterResults.map((item, index) => ({
        id: `ch-${Date.now()}-${index}`,
        name: item.name,
        domain: item.url,
        description: item.description,
        industry: item.industry,
        location_text: item.location,
        source: 'companies_house',
        confidence: item.confidence,
      }));
    }

    // Merge results (simple concat, dedupe by name+location)
    const allResults = [
      ...(supabaseResult.data || []),
      ...companiesHouseResults
    ];
    const seen = new Set();
    const mergedResults = allResults.filter(item => {
      const key = `${item.name?.toLowerCase() || ''}|${item.location?.toLowerCase() || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const sources: string[] = [];
    if (supabaseResult.data && supabaseResult.data.length > 0) {
      sources.push('internal');
    }
    if (companiesHouseResults.length > 0) {
      sources.push('companies_house');
    }

    const response = {
      success: true,
      data: mergedResults,
      metadata: {
        query,
        parsedQuery,
        sources,
        timestamp: new Date().toISOString(),
        originalSupabaseCount: supabaseResult.data?.length || 0,
        companiesHouseCount: companiesHouseResults.length,
        mergedCount: mergedResults.length
      }
    };

    // Store search metrics
    await supabase.from('search_history').insert({
      organization_id: organizationId,
      user_id: userId,
      search_query: query,
      sources,
      search_filters: parsedQuery || {},
      search_scope: scope,
      search_type: 'modular',
      results_count: mergedResults.length,
      execution_time_ms: Date.now() - searchStartTime
    });

    // Cache the successful response
    await cacheManager.set({
      cacheKey,
      data: response,
      ttlSeconds: CACHE_TTL[scope] || CACHE_TTL.default,
      metadata: {
        query,
        parsedQuery,
        executionTime: Date.now() - searchStartTime,
        resultsCount: mergedResults.length
      }
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errors: [{ code: 'INTERNAL_ERROR', message: (error as Error).message || 'An unexpected error occurred' }]
      } as ApiResponse,
      { status: 500 }
    )
  }
}

async function performSearch(query: string, scope: string, organizationId: string) {
  try {
    // Base query
    let searchQuery = supabase.from(scope === 'companies' ? 'discovered_companies' : scope)
      .select('*')
      .eq('organization_id', organizationId)

    // Add search conditions based on scope
    if (scope === 'companies') {
      searchQuery = searchQuery.textSearch('searchable_tsvector_en', query, {
        type: 'websearch',
        config: 'english'
      })
    } else if (scope === 'contacts') {
      searchQuery = searchQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    } else {
      searchQuery = searchQuery.textSearch('searchable_tsvector', query)
    }

    const { data, error } = await searchQuery.limit(50)

    if (error) {
      console.error('Supabase search error in performSearch:', error);
      return {
        success: false,
        data: null,
        error: { code: 'DB_SEARCH_FAILED', message: 'Failed to execute database search.' }
      };
    }

    return {
      success: true,
      data,
      metadata: {
        query,
        scope,
        timestamp: new Date().toISOString()
      }
    }
  } catch (e) {
      console.error('Unexpected error in performSearch:', e);
      return {
        success: false,
        data: null,
        error: { code: 'UNEXPECTED_DB_ERROR', message: 'An unexpected error occurred in the database module.' }
      };
  }
}
