import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import redis from "@/lib/redis"
import redisConfig from "@/lib/config/redis"
import { z } from "zod"

// Zod schema for creating a company
const createCompanySchema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  location: z.string().optional().nullable(), // Corresponds to location_text
  founded_year: z.number().int().positive().optional().nullable(),
  employee_count: z.number().int().positive().optional().nullable(),
  revenue_range: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional().nullable(), // Corresponds to technologies_list
  source_url: z.string().url().optional().nullable(),
  confidence_score: z.number().min(0).max(1).optional().nullable(),
  company_size: z.string().optional().nullable(),
  location_structured: z.object({}).passthrough().optional().nullable(), // Assuming object, refine if known structure
  financials: z.object({}).passthrough().optional().nullable(),     // Assuming object, refine if known structure
  technology_profile: z.object({}).passthrough().optional().nullable(),// Assuming object, refine if known structure
  social: z.object({}).passthrough().optional().nullable(),          // Assuming object, refine if known structure
  tags: z.array(z.string()).optional().nullable(), // Corresponds to tags_list
  notes: z.string().optional().nullable(),       // Corresponds to internal_notes
});


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

    const organizationId = teamMember.organization_id

    // Cache key generation
    const cacheParams = { page, limit, sort, order, industry, location, search, size, organizationId }
    const cacheKey = redis.generateKey("companies", cacheParams)

    // Check cache
    if (redis.isEnabled()) {
      const cachedData = await redis.get(cacheKey)
      if (cachedData) {
        return NextResponse.json(cachedData)
      }
    }

    // Calculate pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Query discovered_companies table (matching schema.sql)
    let query = supabase
      .from("discovered_companies")
      .select("*", { count: "exact" })
      .eq("organization_id", organizationId)

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

    const responseData = {
      data: data || [],
      success: true,
      meta: {
        total: count || 0,
        page,
        limit,
        hasMore: count ? from + (data?.length || 0) < count : false,
      },
    }

    // Store in cache
    if (redis.isEnabled()) {
      await redis.set(cacheKey, responseData, redisConfig.ttl.searchResults)
    }

    return NextResponse.json(responseData)
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
    const requestBody = await request.json()
    const supabase = await createClient()

    // Validate request body
    const validationResult = createCompanySchema.safeParse(requestBody)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }
    const body = validationResult.data;


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

    // Create company using exact schema field names
    const companyData = {
      organization_id: teamMember.organization_id,
      name: body.name, // Already validated to be present by Zod
      domain: body.domain,
      description: body.description,
      industry: body.industry,
      location_text: body.location,
      founded_year: body.founded_year,
      employee_count: body.employee_count,
      revenue_range: body.revenue_range,
      technologies_list: body.technologies || [], // Default to empty array if null/undefined
      source_url: body.source_url, // Zod handles optional, so it's either valid URL, undefined or null
      confidence_score: body.confidence_score,
      company_size: body.company_size,
      location_structured: body.location_structured,
      financials_data: body.financials,
      technology_profile: body.technology_profile,
      social_media_profiles: body.social,
      company_status: "active", // Default status
      tags_list: body.tags || [], // Default to empty array
      internal_notes: body.notes,
    }

    const { data, error } = await supabase.from("discovered_companies").insert(companyData).select().single()

    if (error) {
      throw error
    }

    // Invalidate cache for companies list for this organization
    if (redis.isEnabled()) {
      // Construct a prefix that includes the organization ID if you want to be more specific,
      // for now, clearing all "companies" prefixed cache.
      // A more granular approach might involve a prefix like `companies_org:${teamMember.organization_id}`
      // For simplicity here, we clear all company lists.
      // Consider the implications: this clears lists for ALL users if not scoped by organization.
      // For now, let's assume `generateKey` for GET uses a prefix that includes `organizationId` or similar.
      // The current `generateCacheKey("companies", ...)` in GET implicitly handles org-scoping if organizationId is in cacheParams.
      // So, clearing by "companies" prefix should be safe if keys are like "companies:<hash_of_params_including_orgId>"
      await redis.clearByPrefix("companies")
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
