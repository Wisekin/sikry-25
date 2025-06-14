"use server"

import { createClient } from "@/src/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getScrapers() {
  const supabase = createClient()

  const { data, error } = await supabase.from("scrapers").select("*").order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch scrapers: ${error.message}`)
  }

  return data
}

export async function getScraper(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("scrapers").select("*").eq("id", id).single()

  if (error) {
    throw new Error(`Failed to fetch scraper: ${error.message}`)
  }

  return data
}

export async function createScraper(formData: FormData) {
  const supabase = createClient()

  const scraperData = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    url: formData.get("url") as string,
    config: JSON.parse(formData.get("config") as string),
    status: "inactive",
  }

  const { data, error } = await supabase.from("scrapers").insert(scraperData).select().single()

  if (error) {
    throw new Error(`Failed to create scraper: ${error.message}`)
  }

  revalidatePath("/scrapers")
  return data
}

export async function updateScraperStatus(id: string, status: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("scrapers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update scraper: ${error.message}`)
  }

  revalidatePath("/scrapers")
  return data
}

export async function executeScraper(id: string, url: string) {
  const supabase = createClient()

  // Create a scrape job
  const { data: job, error: jobError } = await supabase
    .from("scrape_jobs")
    .insert({
      scraper_id: id,
      url,
      status: "running",
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (jobError) {
    throw new Error(`Failed to create scrape job: ${jobError.message}`)
  }

  // In a real implementation, this would trigger the actual scraping
  // For now, we'll simulate it with a timeout
  setTimeout(async () => {
    const mockData = {
      name: "Sample Company",
      email: "contact@example.com",
      phone: "+1-555-0123",
      address: "123 Main St, City, State",
    }

    await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        data: mockData,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id)
  }, 3000)

  revalidatePath("/scrapers")
  return job
}

export async function getScraperStats() {
  const supabase = createClient()

  const [{ count: activeScrapers }, { data: successRateData }, { count: totalJobs }, { count: v2Scrapers }] =
    await Promise.all([
      supabase.from("scrapers").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("scrape_jobs").select("status"),
      supabase
        .from("scrape_jobs")
        .select("*", { count: "exact", head: true })
        .gte("started_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("scrapers").select("*", { count: "exact", head: true }).eq("type", "v2"),
    ])

  const successfulJobs = successRateData?.filter((job) => job.status === "completed").length || 0
  const totalJobsCount = successRateData?.length || 1
  const successRate = (successfulJobs / totalJobsCount) * 100

  return {
    activeScrapers: activeScrapers || 0,
    successRate: Math.round(successRate * 10) / 10,
    totalJobs: totalJobs || 0,
    v2Scrapers: v2Scrapers || 0,
  }
}
