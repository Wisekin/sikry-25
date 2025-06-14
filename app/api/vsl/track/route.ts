import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const {
      vsl_page_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      fbclid,
      ad_id,
      ad_set_id,
      campaign_name,
      session_id,
      visitor_id,
      ip_address,
      user_agent,
      referrer_url,
      landing_url,
      device_type,
      browser,
      operating_system,
    } = body

    // Get VSL page to determine organization
    const { data: vslPage, error: pageError } = await supabase
      .from("vsl_pages")
      .select("organization_id")
      .eq("id", vsl_page_id)
      .single()

    if (pageError || !vslPage) {
      return NextResponse.json({ error: "VSL page not found" }, { status: 404 })
    }

    // Create ad click record
    const adClickData = {
      organization_id: vslPage.organization_id,
      vsl_page_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      fbclid,
      ad_id,
      ad_set_id,
      campaign_name,
      ip_address,
      user_agent,
      referrer_url,
      landing_url,
      device_type,
      browser,
      operating_system,
      session_id,
      is_returning_visitor: false, // TODO: Implement returning visitor detection
    }

    const { data: adClick, error: clickError } = await supabase.from("ad_clicks").insert(adClickData).select().single()

    if (clickError) {
      throw clickError
    }

    // Create page view record
    const pageViewData = {
      organization_id: vslPage.organization_id,
      vsl_page_id,
      ad_click_id: adClick.id,
      session_id,
      visitor_id,
    }

    const { data: pageView, error: viewError } = await supabase
      .from("vsl_page_views")
      .insert(pageViewData)
      .select()
      .single()

    if (viewError) {
      throw viewError
    }

    // Update VSL page view count
    await supabase.rpc("increment", {
      table_name: "vsl_pages",
      row_id: vsl_page_id,
      column_name: "view_count",
    })

    return NextResponse.json({
      success: true,
      data: {
        ad_click_id: adClick.id,
        page_view_id: pageView.id,
      },
    })
  } catch (error) {
    console.error("VSL tracking API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to track visit",
        errors: [{ code: "tracking_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
