import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Template } from "@/types/comms"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const supabase = createClient()

    // Start with a base query
    let query = supabase.from("templates").select("*", { count: "exact" })

    // Apply filters if provided
    if (category) {
      query = query.eq("category", category)
    }

    if (type) {
      query = query.eq("type", type)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,subject.ilike.%${search}%`)
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
    console.error("Templates API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch templates",
        errors: [{ code: "fetch_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<Template> = await request.json()
    const supabase = createClient()

    // Validate required fields
    if (!body.name || !body.content || !body.type) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Name, content, and type are required" }],
        },
        { status: 400 },
      )
    }

    // Set default values
    const template: Partial<Template> = {
      ...body,
      variables: body.variables || [],
      tags: body.tags || [],
      is_public: body.is_public ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Create the template
    const { data, error } = await supabase.from("templates").insert(template).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Template created successfully",
    })
  } catch (error) {
    console.error("Templates API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create template",
        errors: [{ code: "create_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
