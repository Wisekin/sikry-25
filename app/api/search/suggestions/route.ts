import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        success: true,
      })
    }

    const supabase = createClient()

    // Get recent searches that match the query
    const { data: recentSearches } = await supabase
      .from("search_history")
      .select("query")
      .ilike("query", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get company names that match the query
    const { data: companyMatches } = await supabase
      .from("companies")
      .select("name")
      .ilike("name", `%${query}%`)
      .limit(5)

    // Get industry matches
    const { data: industryMatches } = await supabase
      .from("companies")
      .select("industry")
      .ilike("industry", `%${query}%`)
      .limit(3)

    // Combine and deduplicate suggestions
    const suggestions = [
      ...new Set([
        ...(recentSearches?.map((item) => item.query) || []),
        ...(companyMatches?.map((item) => item.name) || []),
        ...(industryMatches?.map((item) => item.industry) || []),
      ]),
    ].slice(0, 10)

    return NextResponse.json({
      suggestions,
      success: true,
    })
  } catch (error) {
    console.error("Search suggestions API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get search suggestions",
        errors: [{ code: "suggestions_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
