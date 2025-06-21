"use client"

import { create } from 'zustand';
import { Company } from '@/src/lib/types';
import { devtools, persist } from "zustand/middleware"

interface SearchState {
  // Search state
  query: string
  // Search filters
  filters: {
    industry: string
    location: string
    employeeCount: string
    confidenceScore: number
    hasEmail: boolean
    hasPhone: boolean
  }
  // Results and pagination
  results: any[]
  isLoading: boolean
  isFetchingPage: boolean
  error: string | null
  status: 'idle' | 'loading' | 'fetching' | 'success' | 'error'
  // Pagination
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
  }
  // View settings
  viewMode: "grid" | "list" | "map"
  // Source selection
  selectedSources: string[]
  // Caching
  cacheKey: string | null
  searchTimestamp: number | null
}

interface SearchActions {
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchState["filters"]>) => void;
  setViewMode: (mode: SearchState["viewMode"]) => void;
  clearResults: () => void;
  setCurrentPage: (page: number) => Promise<void>;
  setPageSize: (size: number) => void;
  goToNextPage: () => Promise<void>;
  goToPrevPage: () => Promise<void>;
  setCacheKey: (cacheKey: string | null) => void;
  clearCache: () => void;
  reset: () => void;
  clearFilters: () => void;
  fetchSearchResults: (options?: { forceRefresh?: boolean; type?: 'new-search' | 'pagination' }) => Promise<void>;
  setSelectedSources: (sources: string[]) => void;
}

const initialState: SearchState = {
  // Search state
  query: "",
  
  // Filters
  filters: {
    industry: "",
    location: "",
    employeeCount: "",
    confidenceScore: 0,
    hasEmail: false,
    hasPhone: false,
  },
  
  // Results
  results: [],
  isLoading: false,
  isFetchingPage: false,
  error: null,
  status: 'idle',
  
  // Pagination
  pagination: {
    currentPage: 1,
    pageSize: 15,
    totalCount: 0,
  },
  
  // View settings
  viewMode: "grid",
  // Source selection
  selectedSources: ["google", "linkedin", "crunchbase"],
  // Caching
  cacheKey: null,
  searchTimestamp: null
}

export const useSearchStore = create<SearchState & SearchActions>()(
  persist(
    devtools((set, get) => ({
      ...initialState,

      // Main Actions
      setQuery: (query) => set((state) => ({ query, pagination: { ...state.pagination, currentPage: 1 } })),
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters }, pagination: { ...state.pagination, currentPage: 1 } })),
      setViewMode: (viewMode) => set({ viewMode }),
      clearResults: () => set((state) => ({ results: [], pagination: { ...state.pagination, totalCount: 0 }, cacheKey: null })),
      setPageSize: (pageSize) => set((state) => ({ pagination: { ...state.pagination, pageSize, currentPage: 1 } })),
      setCacheKey: (cacheKey) => set({ cacheKey }),
      clearCache: () => set({ cacheKey: null }),
      clearFilters: () => set({ filters: initialState.filters }),
      reset: () => set(initialState),
      setSelectedSources: (sources) => set({ selectedSources: sources }),

      // Pagination Actions
      setCurrentPage: async (page) => {
        if (page !== get().pagination.currentPage) {
          set((state) => ({ pagination: { ...state.pagination, currentPage: page }}));
          await get().fetchSearchResults({ type: 'pagination' });
        }
      },
      goToNextPage: async () => {
        const { currentPage, totalCount, pageSize } = get().pagination;
        const maxPage = Math.ceil(totalCount / pageSize);
        const nextPage = Math.min(currentPage + 1, maxPage);
        if (nextPage > currentPage && nextPage <= maxPage) {
          set((state) => ({ pagination: { ...state.pagination, currentPage: nextPage }}));
          await get().fetchSearchResults({ type: 'pagination' });
        }
      },
      goToPrevPage: async () => {
        const { currentPage } = get().pagination;
        const prevPage = Math.max(1, currentPage - 1);
        if (prevPage < currentPage) {
          set((state) => ({ pagination: { ...state.pagination, currentPage: prevPage }}));
          await get().fetchSearchResults({ type: 'pagination' });
        }
      },

      // API Action
      fetchSearchResults: async (options = {}) => {
        const { query, filters, pagination, cacheKey } = get();
        const { currentPage, pageSize } = pagination;
        const { forceRefresh = false, type = 'new-search' } = options;

        if (!query) {
          return set((state) => ({ results: [], pagination: { ...state.pagination, totalCount: 0 }, isLoading: false, isFetchingPage: false, status: 'idle' }));
        }

        if (type === 'new-search') {
          set({ isLoading: true, isFetchingPage: false, error: null, status: 'loading' });
        } else {
          set({ isFetchingPage: true, error: null, status: 'fetching' });
        }

        try {
          const params = new URLSearchParams({
            q: query,
            page: String(currentPage),
            limit: String(pageSize),
            ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
          });

          if (cacheKey && !forceRefresh) params.set('cacheKey', cacheKey);
          if (forceRefresh) params.set('refresh', 'true');

          const response = await fetch(`/api/search?${params.toString()}`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();

          if (data.success) {
            set((state) => ({
              results: data.data,
              pagination: { ...state.pagination, totalCount: data.metadata.totalCount },
              cacheKey: data.metadata.cacheKey || null,
              isLoading: false,
              isFetchingPage: false,
              error: null,
              status: 'success',
              searchTimestamp: Date.now(),
            }));
          } else {
            throw new Error(data.message || 'Failed to fetch results');
          }
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false, isFetchingPage: false, status: 'error' });
          set({ isLoading: false, isFetchingPage: false, status: 'error' })
        }
      },
    })),
    {
      name: "search-store",
      // Only persist certain parts of the state
      partialize: (state) => ({
        query: state.query,
        filters: state.filters,
        viewMode: state.viewMode,
        selectedSources: state.selectedSources,
        pagination: { currentPage: 1, pageSize: 15, totalCount: 0 },
        cacheKey: state.cacheKey,
      }),
    }
  )
)
