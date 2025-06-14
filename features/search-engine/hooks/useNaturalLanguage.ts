"use client"

import { useState, useCallback } from "react"
import { searchClient } from "@/lib/api/searchClient"
import { QueryParser } from '../utils/queryParser'
import type { SearchResult } from '@/types/search'
import type { SearchResponse } from '@/features/search-engine/types'

export interface EnhancedSearchResult {
  companies: Array<{
    id: string
    name: string
    domain?: string
    description?: string
    matchConfidence: number
    highlights: Array<{
      field: string
      text: string
    }>
  }>
  totalCount: number
  suggestions: Array<{
    text: string
    type: 'company' | 'industry' | 'technology' | 'location'
    confidence: number
  }>
  analysis: {
    topIndustries: Array<{ name: string; count: number }>
    topTechnologies: Array<{ name: string; count: number }>
    locationDistribution: Array<{ location: string; count: number }>
    averageCompanySize: number
    confidenceStats: {
      min: number
      max: number
      average: number
    }
  }
  metadata: {
    executionTime: number
    timestamp: string
    searchSources: string[]
  }
  query: string
}

export function useNaturalLanguage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<EnhancedSearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSources, setActiveSources] = useState(new Set(['internal']))
  const [sourceResults, setSourceResults] = useState<Record<string, SearchResult[]>>({})
  const [searchHistory, setSearchHistory] = useState<Array<{
    query: string
    timestamp: string
    resultCount: number
    sources: string[]
  }>>([])

  const search = useCallback(async (query: string, options?: {
    sources?: string[]
    limit?: number
    includeAnalytics?: boolean
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const parsedQuery = QueryParser.parse(query)
      const response = await searchClient.naturalLanguageSearch(query)

      // Add search to history
      setSearchHistory(prev => [{
        query,
        timestamp: new Date().toISOString(),
        resultCount: response.results.length,
        sources: options?.sources || ['internal']
      }, ...prev].slice(0, 10))

      // Group results by source
      const resultsBySource: Record<string, SearchResult[]> = {
        internal: []
      }
      
      response.results.forEach(result => {
        resultsBySource.internal.push({
          id: result.id,
          name: result.title || '',
          domain: result.url,
          description: result.description,
          location_text: '',
          highlights: result.highlights.map(text => ({
            field: 'description',
            text
          })),
          confidence: result.confidence
        })
      })
      
      setSourceResults(resultsBySource)

      // Transform API response to EnhancedSearchResult
      const enhancedResult: EnhancedSearchResult = {
        companies: response.results.map(result => ({
          id: result.id,
          name: result.title || '',
          domain: result.url,
          description: result.description,
          matchConfidence: result.confidence,
          highlights: result.highlights.map(text => ({
            field: 'description',
            text
          }))
        })),
        totalCount: response.totalCount,
        suggestions: response.suggestions.map(suggestion => ({
          text: suggestion,
          type: 'company',
          confidence: 0.8
        })),
        analysis: {
          topIndustries: response.facets?.industry?.map(f => ({ name: f.value, count: f.count })) || [],
          topTechnologies: response.facets?.technology?.map(f => ({ name: f.value, count: f.count })) || [],
          locationDistribution: response.facets?.location?.map(f => ({ location: f.value, count: f.count })) || [],
          averageCompanySize: 0,
          confidenceStats: {
            min: Math.min(...response.results.map(r => r.confidence)),
            max: Math.max(...response.results.map(r => r.confidence)),
            average: response.results.reduce((acc, r) => acc + r.confidence, 0) / response.results.length
          }
        },
        metadata: {
          executionTime: response.executionTime,
          timestamp: new Date().toISOString(),
          searchSources: options?.sources || ['internal']
        },
        query
      }

      setResults(enhancedResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) return []
    
    try {
      const suggestions = await searchClient.getSuggestions(query)
      return suggestions
    } catch (err) {
      console.error('Suggestions error:', err)
      return []
    }
  }, [])

  const refreshSearch = useCallback(() => {
    if (results) {
      search(results.query)
    }
  }, [results, search])

  return {
    search,
    getSuggestions,
    refreshSearch,
    isLoading,
    results,
    error,
    sourceResults,
    searchHistory
  }
}
