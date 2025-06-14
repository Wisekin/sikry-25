import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface Scraper {
  id: string
  name: string
  type: "v2" | "legacy"
  status: "active" | "paused" | "error"
  url_pattern: string
  selectors: Record<string, string>
  success_rate: number
  last_run: string
  fields_detected: number
  created_at: string
  updated_at: string
}

export interface ScrapeJob {
  id: string
  scraper_id: string
  url: string
  status: "pending" | "running" | "completed" | "failed"
  data: Record<string, any>
  error_message?: string
  started_at?: string
  completed_at?: string
}

export interface FieldDetection {
  field_name: string
  selector: string
  confidence: number
  sample_value: string
}

export const scrapingClient = {
  // Scrapers
  async getScrapers(): Promise<Scraper[]> {
    const { data, error } = await supabase.from("scrapers").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  async getScraper(id: string): Promise<Scraper | null> {
    const { data, error } = await supabase.from("scrapers").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async createScraper(scraper: Omit<Scraper, "id" | "created_at" | "updated_at">): Promise<Scraper> {
    const { data, error } = await supabase.from("scrapers").insert(scraper).select().single()

    if (error) throw error
    return data
  },

  async updateScraper(id: string, updates: Partial<Scraper>): Promise<Scraper> {
    const { data, error } = await supabase
      .from("scrapers")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Jobs
  async createScrapeJob(job: Omit<ScrapeJob, "id" | "started_at">): Promise<ScrapeJob> {
    const { data, error } = await supabase
      .from("scrape_jobs")
      .insert({ ...job, started_at: new Date().toISOString() })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getScrapeJobs(scraperId: string): Promise<ScrapeJob[]> {
    const { data, error } = await supabase
      .from("scrape_jobs")
      .select("*")
      .eq("scraper_id", scraperId)
      .order("started_at", { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  },

  // Field Detection (V2 AI-powered)
  async detectFields(url: string): Promise<FieldDetection[]> {
    // This would call your AI field detection service
    const response = await fetch("/api/selector-discovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) throw new Error("Field detection failed")
    return response.json()
  },

  async testSelector(url: string, selector: string): Promise<{ success: boolean; value?: string; error?: string }> {
    const response = await fetch("/api/scrapers/test-selector", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, selector }),
    })

    if (!response.ok) throw new Error("Selector test failed")
    return response.json()
  },

  // Preview scraping
  async previewScrape(url: string, selectors: Record<string, string>): Promise<Record<string, any>> {
    const response = await fetch("/api/scrapers/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, selectors }),
    })

    if (!response.ok) throw new Error("Preview failed")
    return response.json()
  },
}
