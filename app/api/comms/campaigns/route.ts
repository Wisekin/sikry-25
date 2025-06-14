import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Campaign } from "@/types/comms"

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
    let query = supabase.from("campaigns").select(
      `
        *,
        templates(name, type),
        messages:messages_count(count)
      `,
      { count: "exact" },
    )

    // Apply filters if provided
    if (status) {
      query = query.eq("status", status)
    }

    if (type) {
      query = query.eq("type", type)
    }

    if (search) {
      query = query.ilike("name", `%${search}%`)
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
    console.error("Campaigns API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch campaigns",
        errors: [{ code: "fetch_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<Campaign> = await request.json()
    const supabase = createClient()

    // Validate required fields
    if (!body.name || !body.templateId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Name and templateId are required" }],
        },
        { status: 400 },
      )
    }

    // Set default values
    const campaign: Partial<Campaign> = {
      ...body,
      status: body.status || "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        bounced: 0,
        failed: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        bounceRate: 0,
      },
    }

    // Create the campaign
    const { data, error } = await supabase.from("campaigns").insert(campaign).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Campaign created successfully",
    })
  } catch (error) {
    console.error("Campaigns API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create campaign",
        errors: [{ code: "create_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
