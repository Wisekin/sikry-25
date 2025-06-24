import type { SearchResponse, SearchFilters, SearchScope } from "@/features/search-engine/types"

class SearchClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async naturalLanguageSearch(query: string): Promise<SearchResponse> {
    console.log('[SearchClient] Sending POST to /search/natural with query:', query);
    const response = await fetch(`${this.baseUrl}/search/natural`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[SearchClient] /search/natural error:', errorData.message || response.statusText);
      throw new Error(errorData.message || "Search request failed")
    }
    const data = await response.json();
    console.log('[SearchClient] /search/natural response:', data);
    return data;
  }

  async advancedSearch(filters: SearchFilters, scope: SearchScope): Promise<SearchResponse> {
    const params = new URLSearchParams()
    if (scope) {
      Object.entries(scope).forEach(([key, value]) => {
        if (value) params.set(`scope.${key}`, 'true')
      })
    }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            if (value.length > 0) params.set(key, value.join(','))
          } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== undefined && subValue !== null) {
                params.set(`${key}.${subKey}`, String(subValue))
              }
            })
          } else {
            params.set(key, String(value))
          }
        }
      })
    }
    console.log('[SearchClient] Sending GET to /search with params:', params.toString());
    const response = await fetch(`${this.baseUrl}/search?${params.toString()}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[SearchClient] /search error:', errorData.message || response.statusText);
      throw new Error(errorData.message || "Advanced search failed")
    }
    const data = await response.json();
    console.log('[SearchClient] /search response:', data);
    return data;
  }

  async getSuggestions(query: string): Promise<string[]> {
    console.log('[SearchClient] Getting suggestions for:', query);
    const response = await fetch(`${this.baseUrl}/search/suggestions?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      console.error('[SearchClient] /search/suggestions error:', response.statusText);
      throw new Error("Failed to get suggestions")
    }
    const data = await response.json()
    console.log('[SearchClient] /search/suggestions response:', data);
    return data.suggestions
  }

  async saveSearch(query: string, filters: SearchFilters): Promise<{ id: string }> {
    console.log('[SearchClient] Saving search:', { query, filters });
    const response = await fetch(`${this.baseUrl}/search/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, filters }),
    })
    if (!response.ok) {
      console.error('[SearchClient] /search/saved error:', response.statusText);
      throw new Error("Failed to save search")
    }
    const data = await response.json();
    console.log('[SearchClient] /search/saved response:', data);
    return data;
  }

  async getSavedSearches(): Promise<Array<{ id: string; query: string; filters: SearchFilters; createdAt: string }>> {
    console.log('[SearchClient] Getting saved searches');
    const response = await fetch(`${this.baseUrl}/search/saved`)
    if (!response.ok) {
      console.error('[SearchClient] /search/saved (GET) error:', response.statusText);
      throw new Error("Failed to get saved searches")
    }
    const data = await response.json();
    console.log('[SearchClient] /search/saved (GET) response:', data);
    return data.searches
  }
}

export const searchClient = new SearchClient()
