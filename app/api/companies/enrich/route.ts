import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const body: { companyId: string; services?: string[] } = await request.json()
    const { companyId, services = ["all"] } = body

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Company ID is required" }],
        },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, domain")
      .eq("id", companyId)
      .single()

    if (companyError) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found",
          errors: [{ code: "not_found", message: "Company not found" }],
        },
        { status: 404 },
      )
    }

    // Create an enrichment job
    const { data: job, error: jobError } = await supabase
      .from("background_jobs")
      .insert({
        type: "enrich",
        config: {
          companyId,
          services,
        },
        status: "queued",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      throw jobError
    }

    // In a real implementation, this would trigger the enrichment service
    // For now, we'll simulate enrichment with a timeout
    setTimeout(async () => {
      // Generate mock enrichment data
      const enrichedData = {
        employees: Math.floor(Math.random() * 10000) + 10,
        revenue: `$${Math.floor(Math.random() * 1000) + 1}M`,
        founded: 1990 + Math.floor(Math.random() * 30),
        social: {
          linkedin: `https://linkedin.com/company/${company.domain.split(".")[0]}`,
          twitter: `https://twitter.com/${company.domain.split(".")[0]}`,
        },
        technology: {
          cms: ["WordPress", "Contentful"],
          analytics: ["Google Analytics", "Mixpanel"],
          hosting: ["AWS", "Cloudflare"],
        },
        confidence: Math.floor(Math.random() * 30) + 70,
      }

      // Update the company with enriched data
      await supabase
        .from("companies")
        .update({
          ...enrichedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyId)

      // Update the job status
      await supabase
        .from("background_jobs")
        .update({
          status: "completed",
          result: { success: true, enriched: Object.keys(enrichedData) },
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id)
    }, 3000)

    return NextResponse.json({
      data: {
        jobId: job.id,
        company: company.name,
        services,
      },
      success: true,
      message: "Enrichment job queued successfully",
    })
  } catch (error) {
    console.error("Company enrichment API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to enrich company",
        errors: [{ code: "enrichment_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
