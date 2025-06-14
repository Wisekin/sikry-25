import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body: { schedule: string; active: boolean; urls?: string[] } = await request.json()
    const supabase = createClient()

    // Validate required fields
    if (!body.schedule) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Schedule is required" }],
        },
        { status: 400 },
      )
    }

    // Verify scraper exists
    const { data: scraper, error: scraperError } = await supabase.from("scrapers").select("*").eq("id", id).single()

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

    // Update scraper with schedule
    const { data, error } = await supabase
      .from("scrapers")
      .update({
        schedule: body.schedule,
        status: body.active ? "active" : "inactive",
        config: {
          ...scraper.config,
          urls: body.urls || [scraper.url],
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // In a real implementation, this would register the schedule with a job scheduler
    // For now, we'll just return success

    return NextResponse.json({
      data,
      success: true,
      message: `Scraper schedule ${body.active ? "activated" : "updated"}`,
    })
  } catch (error) {
    console.error("Scraper schedule API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to schedule scraper",
        errors: [{ code: "schedule_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
