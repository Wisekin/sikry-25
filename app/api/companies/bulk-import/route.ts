import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Company } from "@/types/company"

export async function POST(request: Request) {
  try {
    const body: { companies: Partial<Company>[] } = await request.json()
    const supabase = createClient()

    if (!body.companies || !Array.isArray(body.companies) || body.companies.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format",
          errors: [{ code: "validation_error", message: "Companies array is required" }],
        },
        { status: 400 },
      )
    }

    // Validate and prepare companies for insertion
    const companiesToInsert = body.companies.map((company) => {
      if (!company.name || !company.domain) {
        throw new Error("Each company must have a name and domain")
      }

      // Generate searchable text for full-text search
      const searchableText = [
        company.name,
        company.domain,
        company.industry,
        company.description,
        company.location?.country,
        company.location?.city,
      ]
        .filter(Boolean)
        .join(" ")

      return {
        ...company,
        searchable: searchableText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Insert companies in batches of 100 to avoid hitting limits
    const batchSize = 100
    const results = []

    for (let i = 0; i < companiesToInsert.length; i += batchSize) {
      const batch = companiesToInsert.slice(i, i + batchSize)
      const { data, error } = await supabase.from("companies").insert(batch).select()

      if (error) {
        throw error
      }

      if (data) {
        results.push(...data)
      }
    }

    return NextResponse.json({
      data: {
        imported: results.length,
        total: companiesToInsert.length,
      },
      success: true,
      message: `Successfully imported ${results.length} companies`,
    })
  } catch (error) {
    console.error("Bulk import API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to import companies",
        errors: [{ code: "import_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
