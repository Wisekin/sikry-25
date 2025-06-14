import type { SearchResponse, SearchFilters, SearchScope } from "@/features/search-engine/types"

class SearchClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  async naturalLanguageSearch(query: string): Promise<SearchResponse> {
    const response = await fetch(`${this.baseUrl}/search/natural`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error("Search request failed")
    }

    return response.json()
  }

  async advancedSearch(filters: SearchFilters, scope: SearchScope): Promise<SearchResponse> {
    const response = await fetch(`${this.baseUrl}/search/advanced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filters, scope }),
    })

    if (!response.ok) {
      throw new Error("Advanced search failed")
    }

    return response.json()
  }

  async getSuggestions(query: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/search/suggestions?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error("Failed to get suggestions")
    }

    const data = await response.json()
    return data.suggestions
  }

  async saveSearch(query: string, filters: SearchFilters): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/search/saved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, filters }),
    })

    if (!response.ok) {
      throw new Error("Failed to save search")
    }

    return response.json()
  }

  async getSavedSearches(): Promise<Array<{ id: string; query: string; filters: SearchFilters; createdAt: string }>> {
    const response = await fetch(`${this.baseUrl}/search/saved`)

    if (!response.ok) {
      throw new Error("Failed to get saved searches")
    }

    const data = await response.json()
    return data.searches
  }
}

export const searchClient = new SearchClient()
