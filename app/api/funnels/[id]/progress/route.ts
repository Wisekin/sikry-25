import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase
      .from("funnel_progress")
      .select(`
        *,
        contacts(*),
        discovered_companies(*),
        funnels(name, funnel_type)
      `)
      .eq("funnel_id", params.id)
      .order("started_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ progress: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Enroll contact in funnel
    const { data, error } = await supabase
      .from("funnel_progress")
      .insert({
        funnel_id: params.id,
        contact_id: body.contact_id,
        company_id: body.company_id,
        entry_source: body.entry_source || "manual",
        entry_data: body.entry_data || {},
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update funnel enrollment count
    await supabase.rpc("increment_funnel_enrolled", { funnel_id: params.id })

    return NextResponse.json({ progress: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
