import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const sort = searchParams.get("sort") || "name"
    const order = searchParams.get("order") || "asc"
    const industry = searchParams.get("industry")
    const location = searchParams.get("location")
    const search = searchParams.get("search")
    const size = searchParams.get("size")

    const supabase = await createClient()

    // Get current user's organization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !teamMember) {
      return NextResponse.json({ error: "User not part of any organization" }, { status: 403 })
    }

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Query discovered_companies table (matching schema.sql)
    let query = supabase
      .from("discovered_companies")
      .select("*", { count: "exact" })
      .eq("organization_id", teamMember.organization_id)

    // Apply filters using correct field names from schema
    if (industry) {
      query = query.eq("industry", industry)
    }

    if (location) {
      query = query.ilike("location_text", `%${location}%`)
    }

    if (size) {
      query = query.eq("company_size", size)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting and pagination
    query = query.order(sort, { ascending: order === "asc" }).range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      data: data || [],
      success: true,
      meta: {
        total: count || 0,
        page,
        limit,
        hasMore: count ? from + data.length < count : false,
      },
    })
  } catch (error) {
    console.error("Companies API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch companies",
        errors: [{ code: "fetch_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Get current user's organization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !teamMember) {
      return NextResponse.json({ error: "User not part of any organization" }, { status: 403 })
    }

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Name is required" }],
        },
        { status: 400 },
      )
    }

    // Create company using exact schema field names
    const companyData = {
      organization_id: teamMember.organization_id,
      name: body.name,
      domain: body.domain || null,
      description: body.description || null,
      industry: body.industry || null,
      location_text: body.location || null, // Schema uses location_text
      founded_year: body.founded_year || null,
      employee_count: body.employee_count || null,
      revenue_range: body.revenue_range || null,
      technologies_list: body.technologies || [],
      source_url: body.source_url || "manual_entry",
      confidence_score: body.confidence_score || 0.5,
      company_size: body.company_size || null, // Schema field name
      location_structured: body.location_structured || null, // Schema field
      financials_data: body.financials || null, // Schema field
      technology_profile: body.technology_profile || null, // Schema field
      social_media_profiles: body.social || null, // Schema field
      company_status: "active", // Schema field
      tags_list: body.tags || [], // Schema field
      internal_notes: body.notes || null, // Schema field
    }

    const { data, error } = await supabase.from("discovered_companies").insert(companyData).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Company created successfully",
    })
  } catch (error) {
    console.error("Companies API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create company",
        errors: [{ code: "create_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
