import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    let query = supabase
      .from("gap_analyses")
      .select(`
        *,
        contacts(*),
        discovered_companies(*),
        templates(*)
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (type) {
      query = query.eq("analysis_type", type)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ analyses: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Calculate scores based on responses
    const scores = calculateGapScores(body.responses, body.template_id)

    const { data, error } = await supabase
      .from("gap_analyses")
      .insert({
        contact_id: body.contact_id,
        company_id: body.company_id,
        analysis_type: body.analysis_type,
        form_responses: body.responses,
        snapshot_data: body.snapshot_data || {},
        overall_score: scores.overall,
        gap_scores: scores.categories,
        priority_areas: scores.priorities,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ analysis: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateGapScores(responses: Record<string, any>, templateId?: string) {
  // Simplified scoring logic - would be more sophisticated in production
  const scores = Object.values(responses).map((r) => (typeof r === "number" ? r : 0))
  const overall = scores.reduce((a, b) => a + b, 0) / scores.length

  return {
    overall,
    categories: {
      technology: overall * 0.9,
      process: overall * 1.1,
      people: overall * 0.95,
    },
    priorities: overall < 3 ? ["technology", "process"] : ["optimization"],
  }
}
