"use client"

import { useState, useCallback } from "react"
import type { ScrapingResult } from "../legacy/playwrightAdapter"

interface ScrapePreviewState {
  isLoading: boolean
  result: ScrapingResult | null
  error: string | null
}

export function useScrapePreview() {
  const [state, setState] = useState<ScrapePreviewState>({
    isLoading: false,
    result: null,
    error: null,
  })

  const previewScrape = useCallback(async (url: string, selectors: Record<string, string>) => {
    setState({ isLoading: true, result: null, error: null })

    try {
      const response = await fetch("/api/scrapers/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, selectors }),
      })

      if (!response.ok) {
        throw new Error("Failed to preview scrape")
      }

      const result = await response.json()
      setState({ isLoading: false, result, error: null })
    } catch (error) {
      setState({
        isLoading: false,
        result: null,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }, [])

  const clearPreview = useCallback(() => {
    setState({ isLoading: false, result: null, error: null })
  }, [])

  return {
    ...state,
    previewScrape,
    clearPreview,
  }
}
