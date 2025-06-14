"use client"

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

interface Company {
  id: string
  name: string
  domain: string
  industry: string
  size: string
  location_text: string
  revenue: string
  confidence: number
  lastUpdated: string
  tags: string[]
  notes: string
}

interface CompanyState {
  companies: Company[]
  selectedCompany: Company | null
  favorites: string[]
  recentlyViewed: string[]
  isLoading: boolean
}

interface CompanyActions {
  setCompanies: (companies: Company[]) => void
  setSelectedCompany: (company: Company | null) => void
  addToFavorites: (companyId: string) => void
  removeFromFavorites: (companyId: string) => void
  addToRecentlyViewed: (companyId: string) => void
  updateCompany: (companyId: string, updates: Partial<Company>) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState: CompanyState = {
  companies: [],
  selectedCompany: null,
  favorites: [],
  recentlyViewed: [],
  isLoading: false,
}

export const useCompanyStore = create<CompanyState & CompanyActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCompanies: (companies) => set({ companies }),

        setSelectedCompany: (selectedCompany) => set({ selectedCompany }),

        addToFavorites: (companyId) =>
          set((state) => ({
            favorites: state.favorites.includes(companyId) ? state.favorites : [...state.favorites, companyId],
          })),

        removeFromFavorites: (companyId) =>
          set((state) => ({
            favorites: state.favorites.filter((id) => id !== companyId),
          })),

        addToRecentlyViewed: (companyId) =>
          set((state) => ({
            recentlyViewed: [companyId, ...state.recentlyViewed.filter((id) => id !== companyId)].slice(0, 10), // Keep only last 10
          })),

        updateCompany: (companyId, updates) =>
          set((state) => ({
            companies: state.companies.map((company) =>
              company.id === companyId ? { ...company, ...updates } : company,
            ),
            selectedCompany:
              state.selectedCompany?.id === companyId
                ? { ...state.selectedCompany, ...updates }
                : state.selectedCompany,
          })),

        setLoading: (isLoading) => set({ isLoading }),

        reset: () => set(initialState),
      }),
      {
        name: "company-store",
        partialize: (state) => ({
          favorites: state.favorites,
          recentlyViewed: state.recentlyViewed,
        }),
      },
    ),
    {
      name: "company-store",
    },
  ),
)
