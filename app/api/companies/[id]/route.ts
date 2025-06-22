import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Company } from "@/types/company"
import redis from "@/lib/redis"
import redisConfig from "@/lib/config/redis"
import { z } from "zod"

// Zod schema for updating a company (all fields optional for PATCH)
// Based on src/types/company.d.ts and existing PATCH logic
const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
  location_text: z.string().optional(), // This seems to be used in the table `companies` from context
  // contacts: z.array(z.any()).optional(), // Assuming contacts are managed separately
  financials: z.object({
    revenue: z.number().optional(),
    funding: z.number().optional(),
    valuation: z.number().optional(),
    employees: z.number().optional(),
  }).passthrough().deepPartial().optional(),
  technology: z.object({
    stack: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    integrations: z.array(z.string()).optional(),
  }).passthrough().deepPartial().optional(),
  social: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    website: z.string().url().optional(),
  }).passthrough().deepPartial().optional(),
  confidence: z.number().min(0).max(1).optional(),
  // lastUpdated: z.string().datetime().optional(), // Typically set by server
  // createdAt: z.string().datetime().optional(), // Typically set by server
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive", "prospect", "customer"]).optional(),
  // Fields from POST that might be in 'companies' table but not in Company type explicitly
  description: z.string().optional().nullable(),
  founded_year: z.number().int().positive().optional().nullable(),
  employee_count: z.number().int().positive().optional().nullable(), // Different from financials.employees
  revenue_range: z.string().optional().nullable(),
  technologies_list: z.array(z.string()).optional().nullable(), // from discovered_companies
  source_url: z.string().url().optional().nullable(),
  company_size: z.string().optional().nullable(), // from discovered_companies, maps to 'size'?
  location_structured: z.object({}).passthrough().optional().nullable(),
  financials_data: z.object({}).passthrough().optional().nullable(), // from discovered_companies, maps to 'financials'?
  technology_profile: z.object({}).passthrough().optional().nullable(), // from discovered_companies, maps to 'technology'?
  social_media_profiles: z.object({}).passthrough().optional().nullable(), // from discovered_companies, maps to 'social'?
  internal_notes: z.string().optional().nullable(), // from discovered_companies, maps to 'notes'?
}).passthrough(); // Allow other fields like 'searchable' to pass through if not strictly defined


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createClient()

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !teamMember) {
      return NextResponse.json({ error: "User not part of any organization or error fetching details" }, { status: 403 })
    }
    const organizationId = teamMember.organization_id;

    const cacheKey = redis.generateKey("company", { id, organizationId }) // Add organizationId to cache key

    if (redis.isEnabled()) {
      const cachedData = await redis.get(cacheKey)
      if (cachedData) {
        // Ensure the cached data also respects organization scoping if ever manually inserted without it.
        // However, since we add orgId to key, direct fetch should be fine.
        // For paranoia, one might re-check cachedData.data.organization_id === organizationId
        return NextResponse.json(cachedData)
      }
    }

    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        contacts(*),
        insights(*),
        competitor_analysis(*)
      `)
      .eq("id", id)
      .eq("organization_id", organizationId) // Scope by organization
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            message: "Company not found",
            errors: [{ code: "not_found", message: "Company not found" }],
          },
          { status: 404 },
        )
      }
      throw error
    }

    const responseData = {
      data,
      success: true,
    }

    if (redis.isEnabled()) {
      await redis.set(cacheKey, responseData, redisConfig.ttl.searchResults) // Using same TTL for now
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Company API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch company",
        errors: [{ code: "fetch_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const requestBody = await request.json()
    const supabase = createClient()

    // Validate request body
    const validationResult = updateCompanySchema.safeParse(requestBody)
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
    const body = validationResult.data as Partial<Company>; // Cast to Partial<Company> after validation

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !teamMember) {
      return NextResponse.json({ error: "User not part of any organization or error fetching details" }, { status: 403 })
    }
    const organizationId = teamMember.organization_id;

    // Verify company belongs to user's organization before update
    const { data: existingCompany, error: existingCompanyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .single()

    if (existingCompanyError || !existingCompany) {
      return NextResponse.json({ error: "Company not found or access denied" }, { status: 404 })
    }

    // Generate updated searchable text if relevant fields changed
    const updates: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    if (body.name || body.domain || body.industry || body.description || body.location) {
      // First get the current company data
      const { data: currentCompany } = await supabase.from("companies").select("*").eq("id", id).single()

      if (currentCompany) {
        const searchableText = [
          body.name || currentCompany.name,
          body.domain || currentCompany.domain,
          body.industry || currentCompany.industry,
          body.description || currentCompany.description,
          body.location?.country || currentCompany.location?.country,
          body.location?.city || currentCompany.location?.city,
        ]
          .filter(Boolean)
          .join(" ")

        updates.searchable = searchableText
      }
    }

    const { data, error } = await supabase.from("companies").update(updates).eq("id", id).select().single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            message: "Company not found",
            errors: [{ code: "not_found", message: "Company not found" }],
          },
          { status: 404 },
        )
      }
      throw error
    }

    if (redis.isEnabled()) {
      const cacheKey = redis.generateKey("company", { id })
      await redis.del(cacheKey)
      await redis.clearByPrefix("companies") // Invalidate lists as well
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Company updated successfully",
    })
  } catch (error) {
    console.error("Company API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update company",
        errors: [{ code: "update_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createClient()

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (teamError || !teamMember) {
      return NextResponse.json({ error: "User not part of any organization or error fetching details" }, { status: 403 })
    }
    const organizationId = teamMember.organization_id;

    // Verify company belongs to user's organization before delete
    // Important: Perform this check *before* the delete operation.
    const { data: existingCompany, error: existingCompanyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .single()

    if (existingCompanyError || !existingCompany) {
      // This means either the company doesn't exist OR it doesn't belong to this org.
      // For DELETE, it's common to return 404 if the resource isn't found for this user.
      return NextResponse.json({ error: "Company not found or access denied" }, { status: 404 })
    }

    const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", id)
        .eq("organization_id", organizationId) // Double ensure, though RLS should also handle

    if (error) {
      // Log the actual error for server-side debugging
      console.error("Error deleting company:", error.message);
      // Return a generic error to the client
      return NextResponse.json({ success: false, message: "Failed to delete company due to a server error." }, { status: 500 });
    }

    if (redis.isEnabled()) {
      const cacheKey = redis.generateKey("company", { id, organizationId }) // Add organizationId
      await redis.del(cacheKey)
      await redis.clearByPrefix("companies") // Invalidate lists as well
    }

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    })
  } catch (error) {
    console.error("Company API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete company",
        errors: [{ code: "delete_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
