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
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const forceRefresh = searchParams.get('refresh') === 'true';

  // --- Start: Rate Limiting and Auth ---
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
      { success: false, message: message || 'Rate limit exceeded or unauthorized.' },
      { status: status || 429 }
    );
  }
  // --- End: Rate Limiting and Auth ---
  
  // Generate a consistent cache key for the overall query and the specific page
  const searchCacheKey = createSearchCacheKey({ query, scope, organizationId });
  const pageCacheKey = CACHE_KEYS.SEARCH_PAGE(searchCacheKey, page);

  // --- Step 1: Check cache unless forced to refresh ---
  if (!forceRefresh) {
    try {
      const cachedPage = await getCache<any>(pageCacheKey);
      if (cachedPage) {
        console.log(`[API Search] Cache HIT for page ${page} (key: ${searchCacheKey})`);
        return NextResponse.json({
          success: true,
          data: cachedPage.results,
          metadata: { ...cachedPage.metadata, cached: true },
        });
      }
      console.log(`[API Search] Cache MISS for page ${page} (key: ${searchCacheKey})`);
    } catch (error) {
      console.error('Error accessing cache:', error);
    }
  }

  // --- Step 2: If no cache, perform a new search ---
  try {
    const { parseQuery } = await import('@/src/search/queryParser');
    const { companiesHouseAdapter } = await import('@/src/search/adapters/companiesHouse');
    const { wikidataAdapter } = await import('@/src/search/adapters/wikidata');

    const parsedQuery = await parseQuery(query);
    if (!parsedQuery) {
      return NextResponse.json({ success: false, message: 'Failed to parse search query.' }, { status: 400 });
    }
    
    // Perform searches on all sources for the CURRENT page
    const [supabaseResult, companiesHouseResponse, wikidataResponse] = await Promise.all([
      performSearch(query, scope, organizationId, { page, limit }),
      companiesHouseAdapter.search(parsedQuery, { limit, page }),
      wikidataAdapter.search(parsedQuery, { limit, page })
    ]);

    if (!supabaseResult.success) {
        console.error("Search failed due to database error:", supabaseResult.error);
        return NextResponse.json({ success: false, message: 'An error occurred during the database search.' }, { status: 500 });
    }

    // Map adapter results
    const companiesHouseResults = companiesHouseResponse.results.map((item, index) => ({ id: `ch-${page}-${index}`, ...item, source: 'companies_house' }));
    const wikidataResults = wikidataResponse.results.map((item, index) => ({ id: `wd-${page}-${index}`, ...item, source: 'wikidata' }));
    
    const allResults = [...(supabaseResult.data || []), ...companiesHouseResults, ...wikidataResults];

    // Merge and rank the results for the CURRENT page
    const { mergedResults, mergeMetadata } = await mergeAndRankResults(allResults, parsedQuery);

    // Calculate total count from all sources
    const supabaseTotal = supabaseResult.metadata?.totalCount || 0;
    const companiesHouseTotal = companiesHouseResponse.totalCount || 0;
    const wikidataTotal = (wikidataResponse.results.length === limit) ? (page * limit) + 1 : ((page - 1) * limit) + wikidataResponse.results.length;
    const totalCount = supabaseTotal + companiesHouseTotal + wikidataTotal;
    const pageCount = Math.ceil(totalCount / limit);

    const responseMetadata = {
      query, scope, page, limit, totalCount, pageCount, searchCacheKey, cached: false,
      mergeDetails: {
        ...mergeMetadata,
        supabaseCount: supabaseResult.data?.length || 0,
        companiesHouseCount: companiesHouseResults.length,
        wikidataCount: wikidataResults.length,
      }
    };
    
    // --- Step 3: Cache the new page results ---
    try {
      await setCache(pageCacheKey, { results: mergedResults, metadata: responseMetadata }, redisConfig.ttl.searchResults);
      console.log(`[API Search] Cached results for page ${page} (key: ${searchCacheKey})`);
    } catch (cacheError) {
      console.error('Error caching search results:', cacheError);
    }
    
    await supabase.from('search_history').insert({
      organization_id: organizationId, userId, search_query: query,
      results_count: totalCount, execution_time_ms: Date.now() - searchStartTime,
    });

    return NextResponse.json({ success: true, data: mergedResults, metadata: responseMetadata });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

async function performSearch(query: string, scope: string, organizationId: string, options: { page: number; limit: number }): Promise<{
  success: boolean;
  data: SearchResult[] | null;
  error?: { code: string; message: string };
  metadata?: Record<string, any>;
}> {
  try {
    const { page, limit } = options;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = rangeFrom + limit - 1;
    const table = scope === 'companies' ? 'discovered_companies' : scope;

    let dataQuery = supabase.from(table).select('*').eq('organization_id', organizationId);
    let countQuery = supabase.from(table).select('*', { count: 'exact', head: true }).eq('organization_id', organizationId);

    if (query) {
      if (scope === 'companies') {
        const ftsQuery = query.split(' ').filter(Boolean).join(' & ');
        dataQuery = dataQuery.textSearch('searchable_tsvector_en', ftsQuery, { type: 'websearch', config: 'english' });
        countQuery = countQuery.textSearch('searchable_tsvector_en', ftsQuery, { type: 'websearch', config: 'english' });
      } else if (scope === 'contacts') {
        const orFilter = `name.ilike.%${query}%,email.ilike.%${query}%`;
        dataQuery = dataQuery.or(orFilter);
        countQuery = countQuery.or(orFilter);
      } else {
        const ftsQuery = query.split(' ').filter(Boolean).join(' | ');
        dataQuery = dataQuery.textSearch('searchable_tsvector', ftsQuery);
        countQuery = countQuery.textSearch('searchable_tsvector', ftsQuery);
      }
    }
    
    const { count, error: countError } = await countQuery;
    if (countError) {
        console.error('Error fetching Supabase count:', JSON.stringify(countError, null, 2));
        throw countError;
    }

    const { data, error: dataError } = await dataQuery.range(rangeFrom, rangeTo);
    if (dataError) {
        console.error('Error fetching Supabase data:', JSON.stringify(dataError, null, 2));
        return { success: false, data: null, error: { code: 'DB_SEARCH_ERROR', message: dataError.message } };
    }

    return {
      success: true,
      data: data as SearchResult[],
      metadata: { totalCount: count || 0 },
    };
  } catch (error: any) {
    console.error('An error occurred during performSearch:', error);
    return {
      success: false,
      data: null,
      error: { code: 'DB_UNEXPECTED_ERROR', message: error.message || 'An unexpected database error occurred.' },
    };
  }
}
