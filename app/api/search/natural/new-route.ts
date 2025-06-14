import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { searchExternalSources } from "@/lib/utils/data-sources"
import type { SearchResponse } from "@/types/search"

export const runtime = 'edge'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { query, sources = ['internal'] } = body

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Query is required",
          errors: [{ code: "MISSING_QUERY", message: "Search query is required" }],
        },
        { status: 400 }
      )
    }

    let allResults: SearchResponse['data'] = []
    
    // Search internal database if requested
    if (sources.includes('internal')) {
      const supabase = createClient()
      const { data: internalResults, error } = await supabase
        .from("companies")
        .select("*")
        .textSearch("searchable", query, {
          type: "websearch",
          config: "english",
        })
        .limit(20)

      if (error) {
        throw error
      }

      // Transform internal results
      allResults.push(
        ...internalResults.map(result => ({
          ...result,
          source: 'internal',
          matchConfidence: 1, // Internal results have highest confidence
          highlights: [
            { field: "name", text: result.name },
            result.description && { field: "description", text: result.description.substring(0, 200) + "..." },
            result.industry && { field: "industry", text: result.industry },
            result.location && { field: "location", text: result.location }
          ].filter(Boolean)
        }))
      )
    }

    // Search external sources if requested
    const externalSources = sources.filter(s => s !== 'internal')
    if (externalSources.length > 0) {
      const externalResults = await searchExternalSources(query)
      allResults.push(...externalResults)
    }

    // Sort results by confidence
    allResults.sort((a, b) => (b.matchConfidence || 0) - (a.matchConfidence || 0))

    const executionTime = Date.now() - startTime

    // Log search for analytics
    const supabase = createClient()
    await supabase.from("search_history").insert({
      query,
      sources,
      result_count: allResults.length,
      execution_time: executionTime,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: allResults,
      meta: {
        total: allResults.length,
        executionTime,
        sources
      },
    } as SearchResponse)
  } catch (error) {
    console.error("Natural language search API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform search",
        errors: [
          {
            code: "SEARCH_ERROR",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      },
      { status: 500 }
    )
  }
}
