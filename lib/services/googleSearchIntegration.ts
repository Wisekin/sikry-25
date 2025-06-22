import { createClient } from '@/src/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';

interface GoogleSearchParams {
  query: string;
  num?: number;
  start?: number;
  siteSearch?: string;
  excludeTerms?: string[];
  dateRestrict?: string;
  language?: string;
  country?: string;
  userId: string;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  htmlTitle?: string;
  htmlSnippet?: string;
  cacheId?: string;
  pagemap?: Record<string, any>;
}

interface GoogleSearchResponse {
  results: SearchResult[];
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
    nextPage?: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
  meta: {
    query: string;
    timestamp: string;
    cached: boolean;
  };
}

interface CachedSearch {
  id: string;
  query: string;
  results: SearchResult[];
  searchInfo: any;
  createdAt: string;
  expiresAt: string;
  userId: string;
}

export class GoogleSearchIntegrationService {
  private supabase = createClient();
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';
  private cacheExpiryHours = 24;

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || '';
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    
    if (!this.apiKey || !this.searchEngineId) {
      Logger.logInfo('Google Search API credentials not configured', {
        category: 'search'
      });
    }
  }

  async search(params: GoogleSearchParams): Promise<GoogleSearchResponse> {
    try {
      Logger.logInfo('Starting Google search', {
        query: params.query,
        userId: params.userId,
        category: 'search'
      });

      // Check cache first
      const cachedResult = await this.getCachedSearch(params.query, params.userId);
      if (cachedResult) {
        Logger.logInfo('Returning cached search result', {
          query: params.query,
          cacheId: cachedResult.id,
          category: 'search'
        });
        
        return {
          results: cachedResult.results,
          searchInformation: cachedResult.searchInfo,
          queries: {
            request: [{
              title: params.query,
              totalResults: cachedResult.searchInfo.totalResults,
              searchTerms: params.query,
              count: params.num || 10,
              startIndex: params.start || 1,
              inputEncoding: 'utf8',
              outputEncoding: 'utf8',
              safe: 'off',
              cx: this.searchEngineId
            }]
          },
          meta: {
            query: params.query,
            timestamp: new Date().toISOString(),
            cached: true
          }
        };
      }

      // Perform new search
      const searchResults = await this.performGoogleSearch(params);
      
      // Cache the results
      await this.cacheSearchResults({
        query: params.query,
        results: searchResults.results,
        searchInfo: searchResults.searchInformation,
        userId: params.userId
      });

      // Record search analytics
      await this.recordSearchAnalytics({
        query: params.query,
        resultsCount: searchResults.results.length,
        userId: params.userId
      });

      return {
        ...searchResults,
        meta: {
          query: params.query,
          timestamp: new Date().toISOString(),
          cached: false
        }
      };

    } catch (error) {
      Logger.logError('Google search failed', error as Error, {
        query: params.query,
        userId: params.userId,
        category: 'search'
      });
      throw error;
    }
  }

  private async performGoogleSearch(params: GoogleSearchParams): Promise<{
    results: SearchResult[];
    searchInformation: any;
    queries: any;
  }> {
    try {
      if (!this.apiKey || !this.searchEngineId) {
        throw new Error('Google Search API not configured');
      }

      const searchParams = new URLSearchParams({
        key: this.apiKey,
        cx: this.searchEngineId,
        q: params.query,
        num: (params.num || 10).toString(),
        start: (params.start || 1).toString()
      });

      if (params.siteSearch) {
        searchParams.append('siteSearch', params.siteSearch);
      }

      if (params.excludeTerms && params.excludeTerms.length > 0) {
        const excludeQuery = params.excludeTerms.map(term => `-${term}`).join(' ');
        searchParams.set('q', `${params.query} ${excludeQuery}`);
      }

      if (params.dateRestrict) {
        searchParams.append('dateRestrict', params.dateRestrict);
      }

      if (params.language) {
        searchParams.append('lr', `lang_${params.language}`);
      }

      if (params.country) {
        searchParams.append('gl', params.country);
      }

      const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'SikryBot/1.0 (Search Integration)'
        }
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Google Search API rate limit exceeded');
        }
        if (response.status === 403) {
          throw new Error('Google Search API access denied');
        }
        throw new Error(`Google Search API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items) {
        return {
          results: [],
          searchInformation: data.searchInformation || {},
          queries: data.queries || {}
        };
      }

      const results: SearchResult[] = data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl,
        htmlTitle: item.htmlTitle,
        htmlSnippet: item.htmlSnippet,
        cacheId: item.cacheId,
        pagemap: item.pagemap
      }));

      return {
        results,
        searchInformation: data.searchInformation,
        queries: data.queries
      };

    } catch (error) {
      throw error;
    }
  }

  private async getCachedSearch(query: string, userId: string): Promise<CachedSearch | null> {
    try {
      const { data, error } = await this.supabase
        .from('search_cache')
        .select('*')
        .eq('query', query)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        query: data.query,
        results: data.results,
        searchInfo: data.search_info,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        userId: data.user_id
      };

    } catch (error) {
      Logger.logError('Get cached search failed', error as Error, {
        query,
        category: 'search'
      });
      return null;
    }
  }

  private async cacheSearchResults(params: {
    query: string;
    results: SearchResult[];
    searchInfo: any;
    userId: string;
  }): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.cacheExpiryHours);

      const { error } = await this.supabase
        .from('search_cache')
        .insert({
          query: params.query,
          results: params.results,
          search_info: params.searchInfo,
          user_id: params.userId,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        Logger.logError('Cache search results failed', error, {
          query: params.query,
          category: 'search'
        });
      }

    } catch (error) {
      Logger.logError('Cache search results failed', error as Error, {
        query: params.query,
        category: 'search'
      });
    }
  }

  private async recordSearchAnalytics(params: {
    query: string;
    resultsCount: number;
    userId: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('search_analytics')
        .insert({
          query: params.query,
          results_count: params.resultsCount,
          user_id: params.userId,
          timestamp: new Date().toISOString(),
          source: 'google'
        });

      if (error) {
        Logger.logError('Record search analytics failed', error, {
          query: params.query,
          category: 'search'
        });
      }

    } catch (error) {
      Logger.logError('Record search analytics failed', error as Error, {
        query: params.query,
        category: 'search'
      });
    }
  }

  async getSearchHistory(params: {
    userId: string;
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: any[]; total: number }> {
    try {
      let query = this.supabase
        .from('search_analytics')
        .select('*', { count: 'exact' })
        .eq('user_id', params.userId)
        .eq('source', 'google');

      if (params.startDate) {
        query = query.gte('timestamp', params.startDate);
      }

      if (params.endDate) {
        query = query.lte('timestamp', params.endDate);
      }

      const { data, error, count } = await query
        .order('timestamp', { ascending: false })
        .range((params.page - 1) * params.limit, params.page * params.limit - 1);

      if (error) {
        throw new Error(`Failed to get search history: ${error.message}`);
      }

      return {
        data: data || [],
        total: count || 0
      };

    } catch (error) {
      Logger.logError('Get search history failed', error as Error, {
        userId: params.userId,
        category: 'search'
      });
      throw error;
    }
  }

  async clearCache(params: {
    userId?: string;
    query?: string;
    olderThan?: string;
  }): Promise<void> {
    try {
      let query = this.supabase.from('search_cache').delete();

      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      if (params.query) {
        query = query.eq('query', params.query);
      }

      if (params.olderThan) {
        query = query.lt('created_at', params.olderThan);
      } else {
        // Default: clear expired cache
        query = query.lt('expires_at', new Date().toISOString());
      }

      const { error } = await query;

      if (error) {
        throw new Error(`Failed to clear cache: ${error.message}`);
      }

      Logger.logInfo('Search cache cleared', {
        ...params,
        category: 'search'
      });

    } catch (error) {
      Logger.logError('Clear cache failed', error as Error, {
        params,
        category: 'search'
      });
      throw error;
    }
  }

  async getSearchStats(params: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    avgResultsPerSearch: number;
    topQueries: Array<{ query: string; count: number }>;
    searchesByDay: Record<string, number>;
  }> {
    try {
      let query = this.supabase
        .from('search_analytics')
        .select('query, results_count, timestamp')
        .eq('source', 'google');

      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      if (params.startDate) {
        query = query.gte('timestamp', params.startDate);
      }

      if (params.endDate) {
        query = query.lte('timestamp', params.endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get search stats: ${error.message}`);
      }

      const searches = data || [];
      const queryCounts: Record<string, number> = {};
      const searchesByDay: Record<string, number> = {};
      let totalResults = 0;

      searches.forEach((search: any) => {
        queryCounts[search.query] = (queryCounts[search.query] || 0) + 1;
        totalResults += search.results_count || 0;
        
        const day = search.timestamp.split('T')[0];
        searchesByDay[day] = (searchesByDay[day] || 0) + 1;
      });

      const topQueries = Object.entries(queryCounts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalSearches: searches.length,
        uniqueQueries: Object.keys(queryCounts).length,
        avgResultsPerSearch: searches.length > 0 ? totalResults / searches.length : 0,
        topQueries,
        searchesByDay
      };

    } catch (error) {
      Logger.logError('Get search stats failed', error as Error, {
        category: 'search'
      });
      
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        avgResultsPerSearch: 0,
        topQueries: [],
        searchesByDay: {}
      };
    }
  }
}