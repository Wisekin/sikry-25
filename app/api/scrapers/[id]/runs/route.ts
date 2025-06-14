import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const status = searchParams.get("status")

    const supabase = createClient()

    // Verify scraper exists
    const { data: scraper, error: scraperError } = await supabase.from("scrapers").select("id").eq("id", id).single()

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

    // Start with a base query
    let query = supabase.from("scrape_jobs").select("*", { count: "exact" }).eq("scraper_id", id)

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order("created_at", { ascending: false })

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      success: true,
      meta: {
        total: count || 0,
        page,
        limit,
        hasMore: count ? from + data.length < count : false,
      },
    })
  } catch (error) {
    console.error("Scraper runs API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch scraper runs",
        errors: [{ code: "fetch_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
