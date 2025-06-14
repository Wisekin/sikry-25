import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { searchExternalSources } from "@/lib/utils/data-sources/index"
import { getCachedSearchResults, cacheSearchResults } from "@/lib/utils/cache/searchCache"
import type { SearchResponse, SearchResult, ExternalSource } from "@/types/search"
import { QueryParser } from "@/features/search-engine/utils/queryParser"

export const runtime = "edge"

export async function POST(request: Request) {
  const startTime = Date.now()
  try {
    const body = await request.json()
    const { query, sources = ["google", "linkedin", "crunchbase"] as ExternalSource[], limit = 20, language } = body

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Query is required",
          errors: [{ code: "validation_error", message: "Query is required" }],
        },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = await createClient()

    // Get current user and organization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          errors: [{ code: "auth_error", message: "User not authenticated" }],
        },
        { status: 401 }
      )
    }

    const { data: teamMember } = await supabase
      .from("team_members")
      .select("organization_id, organizations!inner(plan)")
      .eq("user_id", user.id)
      .single()

    if (!teamMember) {
      return NextResponse.json(
        {
          success: false,
          message: "User not part of any organization",
          errors: [{ code: "auth_error", message: "User not part of any organization" }],
        },
        { status: 403 }
      )
    }

    // Check cache first
    const { data: cachedData, metrics: cacheMetrics } = await getCachedSearchResults(query, sources, { limit, organization: teamMember?.organization_id });
    
    if (cachedData) {
      // Log cache hit in search history
      await supabase.from("search_history").insert({
        organization_id: teamMember.organization_id,
        user_id: user.id,
        query,
        search_type: "natural",
        search_scope: "companies",
        execution_time_ms: 0, // Cache hit // Consider using cacheMetrics.avgResponseTime or a specific retrieval time if available
        results_count: cachedData.results.length,
        search_filters: sources,
        created_at: new Date().toISOString(),
      })

      return NextResponse.json({
        ...cachedData,
        source: "cache",
        meta: {
          ...cachedData.meta,
          cacheMetrics,
        },
      })
    }

    // Parse the natural language query
    const queryAnalysis = QueryParser.parse(query)

    // Log search query start for analytics
    const searchHistoryEntry = await supabase
      .from("search_history")
      .insert({
        organization_id: teamMember.organization_id,
        user_id: user.id,
        query,
        search_type: "natural",
        search_scope: "companies",
        search_filters: sources,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Start with a base query
    let dbQuery = supabase.from("discovered_companies").select("*", { count: "exact" })

    // Determine language for text search
    const searchLanguage = typeof language === 'string' && language.toLowerCase() === 'fr' ? 'french' : 'english';
    const tsVectorColumn = searchLanguage === 'french' ? 'searchable_tsvector_fr' : 'searchable_tsvector_en';

    // Apply primary text search with web search configuration
    dbQuery = dbQuery.textSearch(tsVectorColumn, query, {
      type: "websearch",
      config: searchLanguage,
    })

    // Apply entity-based filters
    if (queryAnalysis.entities.locations.length > 0) {
      const locationTerms = queryAnalysis.entities.locations
        .map(loc => `%${loc.name}%`)
        .filter(term => term.length > 2) // Filter out very short location names
      if (locationTerms.length > 0) {
        dbQuery = dbQuery.or(`location_text.ilike.(${locationTerms.map(term => `%${term}%`).join(",")})`)
      }
    }

    if (queryAnalysis.entities.industries.length > 0) {
      const industryTerms = queryAnalysis.entities.industries
        .map(ind => ind.name)
        .filter(term => term.length > 2)
      if (industryTerms.length > 0) {
        dbQuery = dbQuery.or(`industry.ilike.(${industryTerms.map(term => `%${term}%`).join(",")})`)
      }
    }

    if (queryAnalysis.entities.technologies.length > 0) {
      const techTerms = queryAnalysis.entities.technologies
        .map(tech => tech.name)
        .join(" | ")
      dbQuery = dbQuery.textSearch("technologies", techTerms, {
        type: "websearch",
        config: "english"
      })
    }

    // Apply filter-based constraints
    if (queryAnalysis.filters.size) {
      const { min, max } = queryAnalysis.filters.size
      if (min !== undefined && max !== undefined) {
        dbQuery = dbQuery.gte("employee_count", min).lte("employee_count", max)
      } else if (min !== undefined) {
        dbQuery = dbQuery.gte("employee_count", min)
      } else if (max !== undefined) {
        dbQuery = dbQuery.lte("employee_count", max)
      }
    }

    if (queryAnalysis.filters.revenue) {
      const { min, max } = queryAnalysis.filters.revenue
      if (min !== undefined && max !== undefined) {
        dbQuery = dbQuery.gte("annual_revenue", min).lte("annual_revenue", max)
      } else if (min !== undefined) {
        dbQuery = dbQuery.gte("annual_revenue", min)
      } else if (max !== undefined) {
        dbQuery = dbQuery.lte("annual_revenue", max)
      }
    }

    // Apply pagination
    dbQuery = dbQuery.limit(limit)

    // Execute the database query
    const { data: dbResults, error, count } = await dbQuery

    if (error) {
      throw error
    }

    // Search external sources in parallel with database query
    const externalResults = sources.length > 0 ? await searchExternalSources(query) : []

    // Combine and enhance all results
    const combinedResults = [...(dbResults || []), ...externalResults] as SearchResult[]
    
    // Calculate confidence scores and enhance results
    const enhancedResults = combinedResults.map((company) => {
      // Calculate match confidence based on various factors
      let confidence = 0.5 // Base confidence

      // Increase confidence for exact name matches
      if (company.name.toLowerCase().includes(query.toLowerCase())) {
        confidence += 0.3
      }

      // Increase confidence for industry matches
      const matchesIndustry = queryAnalysis.entities.industries.some(
        (ind) => company.industry?.toLowerCase().includes(ind.name.toLowerCase())
      )
      if (matchesIndustry) {
        confidence += 0.2
      }

      // Increase confidence for location matches
      const matchesLocation = queryAnalysis.entities.locations.some(
        (loc) => company.location?.toLowerCase().includes(loc.name.toLowerCase())
      )
      if (matchesLocation) {
        confidence += 0.1
      }

      // Increase confidence for technology matches
      const matchesTech = queryAnalysis.entities.technologies.some(
        (tech) => company.technologies?.some(t => t.toLowerCase().includes(tech.name.toLowerCase()))
      )
      if (matchesTech) {
        confidence += 0.15;
      }

      // Normalize confidence score
      confidence = Math.min(confidence, 1);

      // Generate highlights
      const highlights = [
        { field: "name", text: company.name },
        company.description && { field: "description", text: company.description.substring(0, 200) + "..." },
        company.industry && { field: "industry", text: company.industry },
        company.location && { field: "location", text: company.location }
      ].reduce<Array<{ field: string; text: string; }>>((acc, highlightItem) => {
        if (highlightItem) {
          acc.push(highlightItem as { field: string; text: string; });
        }
        return acc;
      }, []);

      return {
        ...company,
        confidence,
        highlights
      };
    });

    // Get search suggestions for future queries
    const { data: suggestions } = await supabase
      .from("search_history")
      .select("query")
      .eq("organization_id", teamMember.organization_id)
      .order("created_at", { ascending: false })
      .limit(5);

    // Calculate execution time and update search history
    const executionTime = Date.now() - startTime;
    if (searchHistoryEntry?.data) {
      await supabase
        .from("search_history")
        .update({
          execution_time_ms: executionTime,
          results_count: enhancedResults.length,
        })
        .eq("id", searchHistoryEntry.data.id);
    }

    // Construct the response object
    const response: SearchResponse = {
      success: true,
      results: enhancedResults,
      totalCount: count || 0,
      suggestions: suggestions?.map(s => s.query) || [],
      queryAnalysis: {
        intent: queryAnalysis.intent,
        entities: queryAnalysis.entities,
        filters: queryAnalysis.filters,
        confidence: queryAnalysis.confidence,
        originalQuery: queryAnalysis.originalQuery,
        normalizedQuery: queryAnalysis.normalizedQuery,
      },
      meta: {
        total: count || 0,
        page: 1, // Defaulting page to 1, consider making this dynamic if pagination is added
        limit,
        hasMore: (count || 0) > limit, // Simplified hasMore, assumes page 1
        executionTime,
        sources: [
          ...sources, // These are the sources requested by the client
          // Add actual sources used if different, e.g. from searchExternalSources logic
        ]
      },
    };

    // Cache for future use
    await cacheSearchResults(query, sources, response, { limit, organization: teamMember?.organization_id });

    return NextResponse.json(response)
  } catch (error) {
    console.error("Natural language search API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform natural language search",
        errors: [{ code: "search_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 }
    )
  }
}
