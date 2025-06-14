import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Scraper } from "@/types/scraping"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const supabase = createClient()

    // Start with a base query
    let query = supabase.from("scrapers").select("*", { count: "exact" })

    // Apply filters if provided
    if (status) {
      query = query.eq("status", status)
    }

    if (type) {
      query = query.eq("type", type)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,url.ilike.%${search}%`)
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
    console.error("Scrapers API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch scrapers",
        errors: [{ code: "fetch_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<Scraper> = await request.json()
    const supabase = createClient()

    // Validate required fields
    if (!body.name || !body.url || !body.type || !body.config) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Name, URL, type, and config are required" }],
        },
        { status: 400 },
      )
    }

    // Set default values
    const scraper: Partial<Scraper> = {
      ...body,
      status: body.status || "inactive",
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageRunTime: 0,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Create the scraper
    const { data, error } = await supabase.from("scrapers").insert(scraper).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Scraper created successfully",
    })
  } catch (error) {
    console.error("Scrapers API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create scraper",
        errors: [{ code: "create_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
