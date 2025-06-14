"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/src/utils/supabase/client"

interface AppConfig {
  features: {
    aiSearch: boolean
    bulkMessaging: boolean
    advancedScraping: boolean
    marketIntel: boolean
    realTimeSync: boolean
  }
  limits: {
    maxCompanies: number
    maxScrapers: number
    maxCampaigns: number
    maxMessagesPerDay: number
  }
  integrations: {
    linkedin: boolean
    salesforce: boolean
    hubspot: boolean
    zapier: boolean
  }
  branding: {
    logo: string
    primaryColor: string
    secondaryColor: string
    companyName: string
  }
}

const defaultConfig: AppConfig = {
  features: {
    aiSearch: true,
    bulkMessaging: true,
    advancedScraping: true,
    marketIntel: true,
    realTimeSync: true,
  },
  limits: {
    maxCompanies: 10000,
    maxScrapers: 50,
    maxCampaigns: 100,
    maxMessagesPerDay: 1000,
  },
  integrations: {
    linkedin: false,
    salesforce: false,
    hubspot: false,
    zapier: false,
  },
  branding: {
    logo: "/images/logos/sikry-logo.svg",
    primaryColor: "#0066cc",
    secondaryColor: "#00a86b",
    companyName: "SIKRY",
  },
}

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("app_config").select("*").single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setConfig({ ...defaultConfig, ...data.config })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config")
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (updates: Partial<AppConfig>) => {
    try {
      const newConfig = { ...config, ...updates }

      const { error } = await supabase.from("app_config").upsert({
        id: "default",
        config: newConfig,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setConfig(newConfig)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update config"
      setError(message)
      return { success: false, error: message }
    }
  }

  const resetConfig = async () => {
    try {
      const { error } = await supabase.from("app_config").delete().eq("id", "default")

      if (error) throw error

      setConfig(defaultConfig)
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset config"
      setError(message)
      return { success: false, error: message }
    }
  }

  return {
    config,
    loading,
    error,
    updateConfig,
    resetConfig,
    reload: loadConfig,
  }
}
