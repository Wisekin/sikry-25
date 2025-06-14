import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const body: {
      type: "scrape" | "enrich" | "bulk" | "campaign"
      config: Record<string, any>
      schedule?: string
      immediate?: boolean
    } = await request.json()

    const { type, config, schedule, immediate = false } = body

    if (!type || !config) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Type and config are required" }],
        },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Create the job
    const job = {
      type,
      config,
      schedule,
      status: immediate ? "queued" : "scheduled",
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("background_jobs").insert(job).select().single()

    if (error) {
      throw error
    }

    // In a real implementation, this would trigger the job scheduler
    // For now, we'll simulate immediate execution if requested
    if (immediate) {
      setTimeout(async () => {
        await supabase
          .from("background_jobs")
          .update({
            status: "completed",
            result: { success: true, message: "Job completed successfully" },
            completed_at: new Date().toISOString(),
          })
          .eq("id", data.id)
      }, 5000)
    }

    return NextResponse.json({
      data,
      success: true,
      message: immediate ? "Job queued for immediate execution" : "Job scheduled successfully",
    })
  } catch (error) {
    console.error("Job scheduling API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to schedule job",
        errors: [{ code: "schedule_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
