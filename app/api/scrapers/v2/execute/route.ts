import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { ScraperConfig } from "@/types/scraping"

export async function POST(request: Request) {
  try {
    const body: { scraperId?: string; url: string; config?: ScraperConfig } = await request.json()
    const { scraperId, url, config } = body
    const supabase = createClient()

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "URL is required" }],
        },
        { status: 400 },
      )
    }

    let scraperConfig = config
    const jobData: any = {}

    // If scraperId is provided, get the scraper config
    if (scraperId) {
      const { data: scraper, error: scraperError } = await supabase
        .from("scrapers")
        .select("*")
        .eq("id", scraperId)
        .single()

      if (scraperError) {
        return NextResponse.json(
          {
            success: false,
            message: "Scraper not found",
            errors: [{ code: "not_found", message: "Scraper not found" }],
          },
          { status: 404 },
        )
      }

      scraperConfig = scraper.config
      jobData.scraper_id = scraperId
    } else if (!config) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Either scraperId or config is required" }],
        },
        { status: 400 },
      )
    }

    // Create a scrape job
    const { data: job, error: jobError } = await supabase
      .from("scrape_jobs")
      .insert({
        ...jobData,
        url,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      throw jobError
    }

    // In a real implementation, this would call a scraping service
    // For now, we'll return mock data
    const mockData = generateMockScrapedData(scraperConfig?.selectors || [])

    // Update the job with the results
    await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        data: mockData,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id)

    // Update scraper stats if scraperId was provided
    if (scraperId) {
      const { data: scraper } = await supabase.from("scrapers").select("stats").eq("id", scraperId).single()

      if (scraper) {
        const stats = scraper.stats || {
          totalRuns: 0,
          successfulRuns: 0,
          failedRuns: 0,
          averageRunTime: 0,
        }

        stats.totalRuns += 1
        stats.successfulRuns += 1

        await supabase
          .from("scrapers")
          .update({
            stats,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scraperId)
      }
    }

    return NextResponse.json({
      success: true,
      data: mockData,
      meta: {
        jobId: job.id,
        url,
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 5000) + 1000, // Random duration between 1-6 seconds
      },
    })
  } catch (error) {
    console.error("Scraper execution error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute scraper",
        errors: [{ code: "execution_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

function generateMockScrapedData(selectors: any[]) {
  const results = []

  // Generate 5 mock results
  for (let i = 0; i < 5; i++) {
    const result: Record<string, any> = {}

    selectors.forEach((selector) => {
      switch (selector.type) {
        case "text":
          result[selector.name] = `Sample ${selector.name} ${i + 1}`
          break
        case "link":
          result[selector.name] = `https://example.com/${selector.name.toLowerCase()}/${i + 1}`
          break
        case "email":
          result[selector.name] = `contact${i + 1}@example.com`
          break
        case "phone":
          result[selector.name] = `+1-555-${100 + i}-${1000 + i}`
          break
        case "number":
          result[selector.name] = Math.floor(Math.random() * 1000)
          break
        case "date":
          const date = new Date()
          date.setDate(date.getDate() - i)
          result[selector.name] = date.toISOString()
          break
        default:
          result[selector.name] = `Unknown type: ${selector.type}`
      }
    })

    results.push(result)
  }

  return results
}
