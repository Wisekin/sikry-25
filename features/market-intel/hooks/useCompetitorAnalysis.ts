"use client"

import { useState, useEffect } from "react"
import type { CompetitorAnalysis, Competitor } from "@/types/market"
import { createClient } from "@/utils/supabase/client"

export function useCompetitorAnalysis(companyId: string) {
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null)
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (companyId) {
      loadCompetitorAnalysis()
    }
  }, [companyId])

  const loadCompetitorAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load competitor analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from("competitor_analysis")
        .select("*")
        .eq("company_id", companyId)
        .single()

      if (analysisError && analysisError.code !== "PGRST116") {
        throw analysisError
      }

      // Load competitors
      const { data: competitorsData, error: competitorsError } = await supabase
        .from("competitors")
        .select(`
          *,
          company:companies(name, domain, industry, size)
        `)
        .eq("primary_company_id", companyId)
        .order("similarity", { ascending: false })

      if (competitorsError) {
        throw competitorsError
      }

      setAnalysis(analysisData)
      setCompetitors(competitorsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load competitor analysis")
    } finally {
      setLoading(false)
    }
  }

  const generateAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/market-intel/competitor-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate competitor analysis")
      }

      const result = await response.json()
      setAnalysis(result.analysis)
      setCompetitors(result.competitors)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate analysis")
    } finally {
      setLoading(false)
    }
  }

  const addCompetitor = async (competitorData: Partial<Competitor>) => {
    try {
      const { data, error } = await supabase
        .from("competitors")
        .insert({
          primary_company_id: companyId,
          ...competitorData,
        })
        .select()
        .single()

      if (error) throw error

      setCompetitors((prev) => [...prev, data])
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add competitor"
      setError(message)
      return { success: false, error: message }
    }
  }

  const removeCompetitor = async (competitorId: string) => {
    try {
      const { error } = await supabase.from("competitors").delete().eq("id", competitorId)

      if (error) throw error

      setCompetitors((prev) => prev.filter((c) => c.companyId !== competitorId))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove competitor"
      setError(message)
      return { success: false, error: message }
    }
  }

  const updateCompetitorRelationship = async (
    competitorId: string,
    relationship: "direct" | "indirect" | "potential",
  ) => {
    try {
      const { data, error } = await supabase
        .from("competitors")
        .update({ relationship })
        .eq("id", competitorId)
        .select()
        .single()

      if (error) throw error

      setCompetitors((prev) => prev.map((c) => (c.companyId === competitorId ? { ...c, relationship } : c)))
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update relationship"
      setError(message)
      return { success: false, error: message }
    }
  }

  const refreshAnalysis = async () => {
    await loadCompetitorAnalysis()
  }

  return {
    analysis,
    competitors,
    loading,
    error,
    generateAnalysis,
    addCompetitor,
    removeCompetitor,
    updateCompetitorRelationship,
    refreshAnalysis,
  }
}
