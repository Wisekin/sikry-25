"use client"

import { create } from 'zustand';
// Company type might be needed if results are strongly typed, but results are 'any[]' for now
// import { Company } from '@/src/lib/types'; 
import { devtools, persist } from "zustand/middleware";

// As per the plan document for Search-Scraper Integration
// This might be moved to a central types/integration.ts later
export interface ScrapedData {
  companyName?: string;
  emails?: string[];
  phones?: string[];
  address?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  // ... other fields that might be scraped
}

export type DiscoveryStatus = 'idle' | 'discovering' | 'scraping' | 'completed' | 'error';

export interface CompanyDiscoveryState {
  status: DiscoveryStatus;
  website?: string;
  scraperId?: string; // As per plan, might be used later
  scrapedData?: ScrapedData;
  error?: string;
  progress?: number; // For discovery or scraping progress
  lastUpdated?: number; // Timestamp for managing state, e.g., for timeouts or cleanup
}

interface SearchState {
  // Search state
  query: string;
  // Search filters
  filters: {
    industry: string[]; // Changed from string to string[]
    location: string;
    employeeCount: { min: number | null; max: number | null }; // Changed from string
    confidenceScore: number; // Min threshold
    hasEmail: boolean;
    hasPhone: boolean;
    lastScrapedDateRange?: { from: string | null; to: string | null }; // Added, using string for ISO date
    // Add other advanced filter fields here, e.g., revenueRange, fundingStage, etc.
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
  cacheKey: string | null;
  searchTimestamp: number | null;

  // Discovery and Scraping States per company
  discoveryStates: {
    [companyId: string]: CompanyDiscoveryState | undefined; // Undefined if no discovery initiated
  };

  // User display preferences
  preferences: {
    showCompanyDescription: boolean;
    // Add more preferences here as needed
  };
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

  // Discovery and Scraping Actions
  initiateWebsiteDiscovery: (companyId: string, companyName: string, manualUrl?: string) => Promise<void>;
  setDiscoveryStateForCompany: (companyId: string, updates: Partial<CompanyDiscoveryState>) => void;
  updateCompanyDataWithScrapedResults: (companyId: string, scrapedData: ScrapedData) => void; 
  clearDiscoveryStateForCompany: (companyId: string) => void;

  // Preferences Actions
  toggleShowCompanyDescription: () => void;
  // Add more preference actions here
}

const initialState: SearchState = {
  // Search state
  query: "",
  
  // Filters
  filters: {
    industry: [],
    location: "",
    employeeCount: { min: null, max: null },
    confidenceScore: 0, // Default min confidence score
    hasEmail: false,
    hasPhone: false,
    lastScrapedDateRange: { from: null, to: null },
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
  searchTimestamp: null,

  // Discovery states
  discoveryStates: {},

  // Default preferences
  preferences: {
    showCompanyDescription: true,
  },
};

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
      reset: () => set({...initialState, discoveryStates: {}, preferences: initialState.preferences}), // Ensure preferences are also reset or handled
      setSelectedSources: (sources) => set({ selectedSources: sources }),

      // Pagination Actions (No changes needed for preferences here)
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

      // API Action (No changes needed for preferences here)
      fetchSearchResults: async (options = {}) => {
        const { query, filters, pagination, cacheKey, selectedSources } = get();
        const { currentPage, pageSize } = pagination;
        const { forceRefresh = false, type = 'new-search' } = options;

        console.log('[searchStore] fetchSearchResults called', { query, options, filters, pagination });

        if (!query) {
          return set((state) => ({ 
            results: [], 
            pagination: { ...state.pagination, totalCount: 0, currentPage: 1 }, 
            isLoading: false, isFetchingPage: false, status: 'idle',
            // discoveryStates should persist if query is cleared
          }));
        }
        
        if (type === 'new-search') {
          // Reset results and pagination for a new search, but keep discoveryStates
          set((state) => ({ 
            isLoading: true, 
            isFetchingPage: false, 
            error: null, 
            status: 'loading', 
            results: [], 
            pagination: { ...state.pagination, currentPage: 1, totalCount: 0 } 
          }));
        } else {
          set({ isFetchingPage: true, error: null, status: 'fetching' });
        }

        try {
          const params = new URLSearchParams({
            q: query,
            page: String(currentPage),
            limit: String(pageSize),
            sources: selectedSources.join(','),
            // ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v.toString().length > 0)),
            // Need to handle new filter structures for query params
          });

          // Serialize filters manually for more control
          if (filters.industry.length > 0) params.set('industry', filters.industry.join(','));
          if (filters.location) params.set('location', filters.location);
          if (filters.employeeCount && typeof filters.employeeCount === 'object' && 'min' in filters.employeeCount && 'max' in filters.employeeCount) {
            if (filters.employeeCount.min !== null) params.set('employeeMin', filters.employeeCount.min.toString());
            if (filters.employeeCount.max !== null) params.set('employeeMax', filters.employeeCount.max.toString());
          }
          if (filters.confidenceScore > 0) params.set('confidenceMin', filters.confidenceScore.toString());
          if (filters.hasEmail) params.set('hasEmail', 'true');
          if (filters.hasPhone) params.set('hasPhone', 'true');
          if (filters.lastScrapedDateRange?.from) params.set('scrapedFrom', filters.lastScrapedDateRange.from);
          if (filters.lastScrapedDateRange?.to) params.set('scrapedTo', filters.lastScrapedDateRange.to);
          
          if (cacheKey && !forceRefresh) params.set('cacheKey', cacheKey);
          if (forceRefresh) params.set('refresh', 'true');

          const response = await fetch(`/api/search?${params.toString()}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
            console.error('[searchStore] fetchSearchResults error:', errorData.message || 'Network response was not ok');
            throw new Error(errorData.message || 'Network response was not ok');
          }
          const data = await response.json();
          console.log('[searchStore] fetchSearchResults response:', data);

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
              // discoveryStates should persist and not be reset here
            }));
          } else {
            throw new Error(data.message || 'Failed to fetch results');
          }
        } catch (error) {
          console.error('[searchStore] fetchSearchResults exception:', (error as Error).message);
          set({ error: (error as Error).message, isLoading: false, isFetchingPage: false, status: 'error' });
        }
      },

      // Discovery and Scraping Actions Implementations (No changes needed for preferences here)
      setDiscoveryStateForCompany: (companyId, updates) => {
        set((state) => ({
          discoveryStates: {
            ...state.discoveryStates,
            [companyId]: {
              ...(state.discoveryStates[companyId] || { status: 'idle', progress: 0 }), 
              ...updates,
              lastUpdated: Date.now(),
            },
          },
        }));
      },

      initiateWebsiteDiscovery: async (companyId, companyName, manualUrl) => {
        const { setDiscoveryStateForCompany, updateCompanyDataWithScrapedResults } = get();
        console.log('[searchStore] initiateWebsiteDiscovery called', { companyId, companyName, manualUrl });
        
        // 1. Initial state: Discovering
        setDiscoveryStateForCompany(companyId, { status: 'discovering', progress: 20, error: undefined, website: manualUrl });

        let discoveredUrl = manualUrl;
        let discoveryConfidence: number | undefined;

        try {
          // 2. Call /api/search/discover
          if (!discoveredUrl) { // Only call discover API if no manual URL is provided
            const discoveryResponse = await fetch('/api/search/discover', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyId, companyName }), 
            });

            if (!discoveryResponse.ok) {
              const errorData = await discoveryResponse.json().catch(() => ({ message: 'Discovery request failed' }));
              console.error('[searchStore] initiateWebsiteDiscovery discovery error:', errorData.message || 'Failed to discover website');
              throw new Error(errorData.message || 'Failed to discover website');
            }
            const discoveryResult = await discoveryResponse.json();
            if (!discoveryResult.success || !discoveryResult.website) {
              throw new Error(discoveryResult.message || 'No website found by discovery API');
            }
            discoveredUrl = discoveryResult.website;
            discoveryConfidence = discoveryResult.confidence; // Store if needed
            setDiscoveryStateForCompany(companyId, { website: discoveredUrl, progress: 50 });
          } else {
             // If manual URL is provided, we skip discovery API and use it directly
             setDiscoveryStateForCompany(companyId, { website: discoveredUrl, progress: 50 });
          }

          if (!discoveredUrl) {
            throw new Error('No website URL available to proceed with scraping.');
          }
          
          // 3. Update state: Scraping
          setDiscoveryStateForCompany(companyId, { status: 'scraping', progress: 70 });

          // 4. Call /api/search/scraper/execute (or similar)
          // Assuming the plan's /api/search/scraper/route.ts is the base, let's use /api/search/scraper/execute
          const scraperResponse = await fetch('/api/search/scraper/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, url: discoveredUrl }), // Send companyId and the URL to scrape
          });

          if (!scraperResponse.ok) {
            const errorData = await scraperResponse.json().catch(() => ({ message: 'Scraping request failed'}));
            console.error('[searchStore] initiateWebsiteDiscovery scraping error:', errorData.message || 'Failed to scrape website');
            throw new Error(errorData.message || 'Failed to scrape website');
          }
          
          const scraperResult = await scraperResponse.json();
          if (!scraperResult.success || !scraperResult.data) {
            throw new Error(scraperResult.message || 'Scraping did not return data');
          }

          // 5. Update state: Completed
          const finalScrapedData: ScrapedData = scraperResult.data;
          setDiscoveryStateForCompany(companyId, { 
            status: 'completed', 
            scrapedData: finalScrapedData, 
            progress: 100 
          });
          
          // 6. Update main company results with enriched data
          updateCompanyDataWithScrapedResults(companyId, finalScrapedData);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during discovery/scraping.';
          console.error('[searchStore] initiateWebsiteDiscovery exception:', errorMessage);
          setDiscoveryStateForCompany(companyId, { status: 'error', error: errorMessage, progress: 0 });
        }
      },
      
      updateCompanyDataWithScrapedResults: (companyId, scrapedData) => {
        set(state => ({
          results: state.results.map(company => 
            company.id === companyId 
              ? { ...company, ...scrapedData, enriched: true } 
              : company
          )
        }));
      },

      clearDiscoveryStateForCompany: (companyId) => {
        set((state) => {
          const newDiscoveryStates = { ...state.discoveryStates };
          delete newDiscoveryStates[companyId];
          return { discoveryStates: newDiscoveryStates };
        });
      },

      // Preferences Actions
      toggleShowCompanyDescription: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            showCompanyDescription: !state.preferences.showCompanyDescription,
          },
        }));
      }

    })),
    {
      name: "search-store",
      partialize: (state) => ({
        query: state.query,
        filters: state.filters,
        viewMode: state.viewMode,
        selectedSources: state.selectedSources,
        pagination: { currentPage: 1, pageSize: state.pagination.pageSize || 15, totalCount: 0 }, 
        cacheKey: state.cacheKey,
        preferences: state.preferences, // Persist preferences
        // DO NOT persist results or discoveryStates here
      }),
    }
  )
);
