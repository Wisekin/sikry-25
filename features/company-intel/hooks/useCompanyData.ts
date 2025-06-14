"use client"

import { useState, useEffect, useCallback } from "react"
import { companyClient } from "@/lib/api/companyClient"

export interface CompanyData {
  id: string
  name: string
  domain: string
  description: string
  industry: string
  location_text: string
  size: {
    employees: number
    range: string
  }
  revenue: {
    amount: number
    currency: string
    year: number
  }
  founded: number
  technologies: string[]
  socialMedia: {
    linkedin?: string
    twitter?: string
    facebook?: string
  }
  contacts: Array<{
    id: string
    name: string
    title: string
    email?: string
    linkedin?: string
  }>
  confidence: {
    overall: number
    dataPoints: Record<string, number>
  }
  lastUpdated: string
}

export function useCompanyData(companyId?: string) {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await companyClient.getCompany(id)
      setCompany(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch company")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const enrichCompany = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const enrichedData = await companyClient.enrichCompany(id)
      setCompany(enrichedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enrich company")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateCompany = useCallback(async (id: string, updates: Partial<CompanyData>) => {
    setIsLoading(true)
    setError(null)

    try {
      const updatedData = await companyClient.updateCompany(id, updates)
      setCompany(updatedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (companyId) {
      fetchCompany(companyId)
    }
  }, [companyId, fetchCompany])

  return {
    company,
    isLoading,
    error,
    fetchCompany,
    enrichCompany,
    updateCompany,
  }
}
