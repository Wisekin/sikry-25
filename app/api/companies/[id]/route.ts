import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { Company } from "@/types/company"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createClient()

    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        contacts(*),
        insights(*),
        competitor_analysis(*)
      `)
      .eq("id", id)
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

    return NextResponse.json({
      data,
      success: true,
    })
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
    const body: Partial<Company> = await request.json()
    const supabase = createClient()

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

    const { error } = await supabase.from("companies").delete().eq("id", id)

    if (error) {
      throw error
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
