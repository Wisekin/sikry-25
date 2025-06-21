import { type NextRequest, NextResponse } from 'next/server';
import { mergeAndRankResults } from '@/src/search/search-logic';
import { createClient } from '@/src/utils/supabase/server';
import type { ApiResponse, SearchScope } from '@/src/types';
import type { SearchResult } from '@/src/types/search';
import { CacheManager } from '@/src/utils/cache/cacheManager';
import { DbRateLimiter } from '@/src/utils/cache/rateLimiter';
import { randomUUID } from 'crypto';
import { Company } from '@/src/types/company';
import { getCache, setCache, generateCacheKey, clearSearchCache } from '@/lib/redis';

import redisConfig from '@/lib/config/redis';

const supabase = createClient();

// Cache key generators
const CACHE_KEYS = {
  SEARCH_RESULTS: (key: string) => `search:results:${key}`,
  SEARCH_METADATA: (key: string) => `search:metadata:${key}`,
  SEARCH_PAGE: (key: string, page: number) => `search:page:${key}:${page}`,
  SEARCH_QUERY: (key: string) => `search:query:${key}`,
};

// Helper function to create a consistent cache key for search parameters
function createSearchCacheKey(params: {
  query: string;
  scope: string;
  organizationId?: string;
  filters?: Record<string, any>;
}): string {
  return generateCacheKey({
    q: params.query,
    s: params.scope,
    org: params.organizationId || '',
    ...(params.filters || {})
  });
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const searchStartTime = Date.now();
  
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const scope = (searchParams.get('scope') || 'companies') as SearchScope;
  const cacheKey = searchParams.get('cacheKey');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const forceRefresh = searchParams.get('refresh') === 'true';

  // If a cacheKey is provided, try to fetch paginated results from the cache
  if (cacheKey) {
    try {
      // Try to get the specific page from cache
      const pageCacheKey = CACHE_KEYS.SEARCH_PAGE(cacheKey, page);
      const cachedPage = await getCache<{
        results: SearchResult[];
        metadata: {
          totalCount: number;
          pageCount: number;
          currentPage: number;
          cacheKey: string;
        };
      }>(pageCacheKey);

      if (cachedPage) {
        console.log(`[API Search] Serving page ${page} from cache (key: ${cacheKey})`);
        return NextResponse.json({
          success: true,
          data: cachedPage.results,
          metadata: {
            ...cachedPage.metadata,
            cached: true,
            cacheKey,
          },
        });
      }

      // If page not in cache, check if we have the full results
      const fullResultsKey = CACHE_KEYS.SEARCH_RESULTS(cacheKey);
      const fullResults = await getCache<SearchResult[]>(fullResultsKey);
      
      if (fullResults) {
        const totalCount = fullResults.length;
        const pageCount = Math.ceil(totalCount / limit);
        const currentPage = Math.min(page, pageCount);
        const paginatedResults = fullResults.slice(
          (currentPage - 1) * limit,
          currentPage * limit
        );

        // Cache this page for future requests
        const pageMetadata = {
          totalCount,
          pageCount,
          currentPage,
          cacheKey,
        };

        await setCache(
          CACHE_KEYS.SEARCH_PAGE(cacheKey, currentPage),
          {
            results: paginatedResults,
            metadata: pageMetadata,
          },
          redisConfig.ttl.searchResults
        );

        console.log(`[API Search] Generated page ${currentPage} from full results cache`);
        return NextResponse.json({
          success: true,
          data: paginatedResults,
          metadata: {
            ...pageMetadata,
            cached: true,
          },
        });
      }

      // If we get here, the cache key is invalid or expired
      console.log(`[API Search] Cache key ${cacheKey} not found. Performing a new search.`);
    } catch (error) {
      console.error('Error accessing cache:', error);
      // Continue with a new search if there's a cache error
    }
  }

  try {
    // Initialize rate limiter and check limits
    const rateLimiter = new DbRateLimiter();
    const { 
      allowed: canProceed, 
      status, 
      message, 
      userId, 
      organizationId, 
      plan 
    } = await rateLimiter.isAllowed(req);

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

    // Generate a cache key for this search
    const searchCacheKey = createSearchCacheKey({
      query,
      scope,
      organizationId,
      filters: searchParams.get('filters') ? JSON.parse(searchParams.get('filters')!) : {}
    });
    
    // If this is a new search (no cacheKey provided), check if we have cached results
    if (!cacheKey && !forceRefresh) {
      const cachedResultsKey = CACHE_KEYS.SEARCH_RESULTS(searchCacheKey);
      const cachedResults = await getCache<SearchResult[]>(cachedResultsKey);
      
      if (cachedResults) {
        const totalCount = cachedResults.length;
        const pageCount = Math.ceil(totalCount / limit);
        const currentPage = 1;
        const paginatedResults = cachedResults.slice(0, limit);
        
        // Prepare metadata for the response
        const metadata = {
          query,
          scope,
          page: currentPage,
          limit,
          totalCount,
          pageCount,
          cacheKey: searchCacheKey,
          cached: true,
        };
        
        // Cache the first page
        await setCache(
          CACHE_KEYS.SEARCH_PAGE(searchCacheKey, currentPage),
          {
            results: paginatedResults,
            metadata: {
              totalCount,
              pageCount,
              currentPage,
              cacheKey: searchCacheKey,
            },
          },
          redisConfig.ttl.searchResults
        );
        
        console.log(`[API Search] Serving from cache (key: ${searchCacheKey})`);
        return NextResponse.json({
          success: true,
          data: paginatedResults,
          metadata,
        });
      }
    }

    // --- Modular Search Integration ---
    const { parseQuery } = await import('@/src/search/queryParser');
    const { companiesHouseAdapter } = await import('@/src/search/adapters/companiesHouse');
    const { wikidataAdapter } = await import('@/src/search/adapters/wikidata');

    // Parse the query using the modular parser
    const parsedQuery = await parseQuery(query);

    // DEBUG: Log the parsed query to inspect what the AI is returning

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

    // Call Wikidata adapter and map results
    let wikidataResults: SearchResult[] = [];
    if (parsedQuery) {
        const adapterResults = await wikidataAdapter.search(parsedQuery);
        wikidataResults = adapterResults.map((item, index) => ({
            id: `wd-${Date.now()}-${index}`,
            name: item.name,
            domain: item.url,
            description: item.description,
            industry: item.industry,
            location_text: item.location,
            source: 'wikidata',
            confidence: item.confidence,
        }));
    }

    // --- Advanced Merging and Ranking ---
    const allResults = [
      ...(supabaseResult.data || []),
      ...companiesHouseResults,
      ...wikidataResults,
    ];

    let mergedResults: SearchResult[];
    let mergeMetadata: Record<string, any> = {};

    if (parsedQuery) {
      const ranked = await mergeAndRankResults(allResults, parsedQuery);
      mergedResults = ranked.mergedResults;
      mergeMetadata = ranked.mergeMetadata;
    } else {
      // If AI query parsing failed, fall back to unranked, raw results
      mergedResults = allResults;
      mergeMetadata = { note: 'AI parsing failed; returning unranked results.' };
    }
    const totalCount = mergedResults.length;
    const pageCount = Math.ceil(totalCount / limit);
    const currentPage = 1; // Always return first page for new searches
    const paginatedResults = mergedResults.slice(0, limit);
    
    // Prepare metadata for the response
    const metadata = {
      query,
      scope,
      page: currentPage,
      limit,
      totalCount,
      pageCount,
      cacheKey: searchCacheKey,
      cached: false,
      originalSupabaseCount: supabaseResult.data?.length || 0,
      companiesHouseCount: companiesHouseResults.length,
      wikidataCount: wikidataResults.length,
      preMergeCount: allResults.length,
      mergedCount: totalCount,
      mergeDetails: mergeMetadata,
    };
    
    // Cache the full results and first page if we have enough results
    if (totalCount > 0) {
      try {
        // Cache full results
        await setCache(
          CACHE_KEYS.SEARCH_RESULTS(searchCacheKey),
          mergedResults,
          redisConfig.ttl.searchResults
        );
        
        // Cache first page
        await setCache(
          CACHE_KEYS.SEARCH_PAGE(searchCacheKey, currentPage),
          {
            results: paginatedResults,
            metadata: {
              totalCount,
              pageCount,
              currentPage,
              cacheKey: searchCacheKey,
            },
          },
          redisConfig.ttl.searchResults
        );
        
        console.log(`[API Search] Cached ${totalCount} results with key ${searchCacheKey}`);
      } catch (cacheError) {
        console.error('Error caching search results:', cacheError);
        // Continue with the response even if caching fails
      }
    }

    const sources: string[] = [];
    if (supabaseResult.data && supabaseResult.data.length > 0) {
      sources.push('internal');
    }
    if (companiesHouseResults.length > 0) {
      sources.push('companies_house');
    }
    if (wikidataResults.length > 0) {
      sources.push('wikidata');
    }

    const response = {
      success: true,
      data: paginatedResults,
      metadata: {
        ...metadata,
        sources,
        parsedQuery,
        timestamp: new Date().toISOString(),
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
      results_count: totalCount,
      execution_time_ms: Date.now() - searchStartTime
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

async function performSearch(query: string, scope: string, organizationId: string): Promise<{
  success: boolean;
  data: SearchResult[] | null;
  error?: { code: string; message: string };
  metadata?: Record<string, any>;
}> {
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
      data: data || [],
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
