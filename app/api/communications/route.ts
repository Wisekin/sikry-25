import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const campaign_id = searchParams.get("campaign_id")
    const contact_id = searchParams.get("contact_id")
    const status = searchParams.get("status")
    const channel = searchParams.get("channel")

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

    // Query communications table with exact schema field names
    let query = supabase
      .from("communications")
      .select(
        `
        *,
        contact:contact_id(id, name, email),
        company:company_id(id, name, domain),
        campaign:campaign_id(id, name, status)
      `,
        { count: "exact" },
      )
      .eq("organization_id", teamMember.organization_id)

    // Apply filters using exact schema field names
    if (campaign_id) {
      query = query.eq("campaign_id", campaign_id)
    }

    if (contact_id) {
      query = query.eq("contact_id", contact_id)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (channel) {
      query = query.eq("channel", channel)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order("created_at", { ascending: false })

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
    console.error("Communications API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch communications",
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
    if (!body.channel || !body.content) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Channel and content are required" }],
        },
        { status: 400 },
      )
    }

    // Create communication using exact schema field names
    const communicationData = {
      organization_id: teamMember.organization_id,
      campaign_id: body.campaign_id || null,
      recipient_id: body.recipient_id || null,
      contact_id: body.contact_id || null,
      company_id: body.company_id || null,
      channel: body.channel, // Schema: 'email', 'sms', 'whatsapp', 'call', 'linkedin', 'other'
      direction: body.direction || "outbound", // Schema: 'inbound', 'outbound'
      subject: body.subject || null,
      content: body.content,
      personalization_data: body.personalization_data || null, // Schema field
      status: body.status || "pending", // Schema: 'pending', 'sent', 'delivered', 'read', 'failed', 'received', 'answered'
      bounce_reason: body.bounce_reason || null, // Schema field
      metadata: body.metadata || {}, // Schema field
      sent_at: body.direction === "outbound" ? new Date().toISOString() : null,
      received_at: body.direction === "inbound" ? new Date().toISOString() : null,
    }

    const { data, error } = await supabase
      .from("communications")
      .insert(communicationData)
      .select(
        `
        *,
        contact:contact_id(id, name, email),
        company:company_id(id, name, domain),
        campaign:campaign_id(id, name, status)
      `,
      )
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      data,
      success: true,
      message: "Communication created successfully",
    })
  } catch (error) {
    console.error("Communications API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create communication",
        errors: [{ code: "create_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
