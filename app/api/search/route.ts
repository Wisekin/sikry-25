import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/utils/supabase/server'
import type { ApiResponse, SearchResult, SearchScope } from '@/src/types'
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
    const user = url.searchParams.get('user')

    // Get organization context
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('organization_id, organizations(plan)')
      .eq('user_id', user)
      .single()

    if (!teamMember) {
      return NextResponse.json(
        {
          success: false,
          message: 'Organization not found',
          errors: [{ code: 'NOT_FOUND', message: 'Organization not found' }]
        } as ApiResponse,
        { status: 404 }
      )
    }

    // Initialize rate limiter and check limits
    const rateLimiter = new DbRateLimiter()
    const { allowed: canProceed } = await rateLimiter.isAllowed(request)

    if (!canProceed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Rate limit exceeded',
          errors: [{ code: 'RATE_LIMIT', message: 'Too many requests. Please try again later.' }]
        } as ApiResponse,
        { status: 429 }
      )
    }

    // Initialize cache manager
    const cacheManager = new CacheManager(teamMember.organization_id, teamMember.organizations?.[0]?.plan || 'starter')
    const cacheKey = `search:${scope}:${query}`

    // Try to get from cache first
    const cachedResult = await cacheManager.get(cacheKey, scope)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    // --- Modular Search Integration ---
    const { parseQuery } = await import('@/src/search/queryParser');
    const { companiesHouseAdapter } = await import('@/src/search/adapters/companiesHouse');

    // Parse the query using the modular parser
    const parsedQuery = await parseQuery(query);

    // Call Supabase (internal DB)
    const supabaseResult = await performSearch(query, scope, teamMember.organization_id);

    // Call Companies House adapter (mock for now)
    const companiesHouseResults = await companiesHouseAdapter.search(parsedQuery);

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

    const response = {
      success: true,
      data: mergedResults,
      metadata: {
        query,
        parsedQuery,
        sources: ['supabase', 'companies_house'],
        timestamp: new Date().toISOString(),
        originalSupabaseCount: supabaseResult.data?.length || 0,
        companiesHouseCount: companiesHouseResults.length,
        mergedCount: mergedResults.length
      }
    };

    // Store search metrics
    await supabase.from('search_history').insert({
      organization_id: teamMember.organization_id,
      user_id: user,
      search_query: query,
      search_filters: parsedQuery || {},
      search_scope: scope,
      search_type: 'modular',
      results_count: mergedResults.length,
      execution_time_ms: Date.now() - searchStartTime
    });

    // Cache the successful response
    await cacheManager.set({
      cacheKey,
      cacheValue: response,
      cacheScope: scope,
      ttlSeconds: CACHE_TTL[scope] || CACHE_TTL.default,
      accessCount: 0,
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
        errors: [{ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }]
      } as ApiResponse,
      { status: 500 }
    )
  }
}

async function performSearch(query: string, scope: string, organizationId: string) {

  // Base query
  let searchQuery = supabase.from(scope === 'companies' ? 'discovered_companies' : scope)
    .select('*')
    .eq('organization_id', organizationId)

  // Add search conditions based on scope
  if (scope === 'companies') {
    searchQuery = searchQuery.or(`name.ilike.%${query}%, description.ilike.%${query}%`)
  } else if (scope === 'contacts') {
    searchQuery = searchQuery.or(`name.ilike.%${query}%, email.ilike.%${query}%`)
  } else {
    searchQuery = searchQuery.textSearch('searchable_tsvector', query)
  }

  const { data, error } = await searchQuery.limit(50)

  if (error) {
    throw error
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
}
