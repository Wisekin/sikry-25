"use client"

import { useState, useCallback } from "react"
import { searchClient } from "@/lib/api/searchClient"
import type { SearchResponse } from '@/types/search'

export function useNaturalLanguage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSources, setActiveSources] = useState(new Set(['internal']))
  const [sourceResults, setSourceResults] = useState<Record<string, SearchResponse['data']>>({})
  const [searchHistory, setSearchHistory] = useState<Array<{
    query: string
    timestamp: string
    resultCount: number
    sources: string[]
  }>>([])

  const search = useCallback(async (query: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const sources = Array.from(activeSources)
      const response = await searchClient.post<SearchResponse>("/api/search/natural", {
        query,
        sources
      })

      if (!response.success) {
        throw new Error("Search request failed")
      }

      setSearchHistory(prev => [{
        query,
        timestamp: new Date().toISOString(),
        resultCount: response.data.length,
        sources
      }, ...prev].slice(0, 10))

      // Store results by source
      const resultsBySource: Record<string, SearchResponse['data']> = {}
      response.data.forEach(result => {
        const source = result.source || 'internal'
        if (!resultsBySource[source]) {
          resultsBySource[source] = []
        }
        resultsBySource[source].push(result)
      })
      setSourceResults(resultsBySource)

      setResults(response)
    } catch (err) {
      console.error("Search error:", err)
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setIsLoading(false)
    }
  }, [activeSources])

  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) return []
    
    try {
      const response = await searchClient.get<{ suggestions: string[] }>(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
      return response.suggestions || []
    } catch (err) {
      console.error('Suggestions error:', err)
      return []
    }
  }, [])

  const toggleDataSource = useCallback((sourceId: string) => {
    setActiveSources(prev => {
      const next = new Set(prev)
      if (next.has(sourceId)) {
        next.delete(sourceId)
      } else {
        next.add(sourceId)
      }
      return next
    })
  }, [])

  return {
    search,
    getSuggestions,
    toggleDataSource,
    activeSources,
    sourceResults,
    isLoading,
    results,
    error,
    searchHistory
  }
}
