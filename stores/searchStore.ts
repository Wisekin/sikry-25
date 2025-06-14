"use client"

import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface SearchState {
  query: string
  filters: {
    industry: string[]
    location: string[]
    size: string[]
    revenue: string[]
    sources: string[] // External data sources to include
  }
  results: any[]
  isLoading: boolean
  totalResults: number
  currentPage: number
  viewMode: "grid" | "list" | "map"
  activeSources: Set<string> // Currently active external data sources
  sourceResults: Record<string, any[]> // Results from each source
}

interface SearchActions {
  setQuery: (query: string) => void
  setFilters: (filters: Partial<SearchState["filters"]>) => void
  setResults: (results: any[]) => void
  setLoading: (loading: boolean) => void
  setTotalResults: (total: number) => void
  setCurrentPage: (page: number) => void
  setViewMode: (mode: SearchState["viewMode"]) => void
  clearFilters: () => void
  reset: () => void
}

const initialState: SearchState = {
  query: "",
  filters: {
    industry: [],
    location: [],
    size: [],
    revenue: [],
    sources: []
  },
  results: [],
  isLoading: false,
  totalResults: 0,
  currentPage: 1,
  viewMode: "grid",
  activeSources: new Set(['internal']), // Start with internal search enabled
  sourceResults: {}
}

export const useSearchStore = create<SearchState & SearchActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setQuery: (query) => set({ query }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      setResults: (results) => set({ results }),

      setLoading: (isLoading) => set({ isLoading }),

      setTotalResults: (totalResults) => set({ totalResults }),

      setCurrentPage: (currentPage) => set({ currentPage }),

      setViewMode: (viewMode) => set({ viewMode }),

      clearFilters: () =>
        set({
          filters: {
            industry: [],
            location: [],
            size: [],
            revenue: [],
          },
        }),

      reset: () => set(initialState),
    }),
    {
      name: "search-store",
    },
  ),
)
