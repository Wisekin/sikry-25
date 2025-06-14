import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const { scraperId, url } = await request.json()
    const supabase = createClient()

    // Get scraper configuration
    const { data: scraper, error: scraperError } = await supabase
      .from("scrapers")
      .select("*")
      .eq("id", scraperId)
      .single()

    if (scraperError || !scraper) {
      return NextResponse.json({ success: false, message: "Scraper not found" }, { status: 404 })
    }

    // Create scrape job
    const { data: job, error: jobError } = await supabase
      .from("scrape_jobs")
      .insert({
        scraper_id: scraperId,
        url,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json({ success: false, message: "Failed to create job" }, { status: 500 })
    }

    // Simulate scraping process (in real implementation, this would be a background job)
    setTimeout(async () => {
      const mockData = {
        name: "Scraped Company",
        email: "contact@scraped.com",
        phone: "+1-555-0123",
        address: "123 Scraped St",
      }

      await supabase
        .from("scrape_jobs")
        .update({
          status: "completed",
          data: mockData,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id)
    }, 5000)

    return NextResponse.json({
      success: true,
      job,
      message: "Scraping started",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute scraper",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
