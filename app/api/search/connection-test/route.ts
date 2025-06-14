import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  const startTime = Date.now()
  const results: Record<string, any> = {
    success: true,
    timestamp: new Date().toISOString(),
    tests: {}
  }

  try {
    // Initialize Supabase client
    const supabase = await createClient()

    // Test 1: Basic Connection
    try {
      const { data, error } = await supabase.from("companies").select("count").limit(1)
      results.tests.connection = {
        status: error ? "failed" : "success",
        error: error?.message
      }
    } catch (e) {
      results.tests.connection = {
        status: "failed",
        error: e instanceof Error ? e.message : "Unknown error"
      }
    }

    // Test 2: Required Tables
    const requiredTables = ["companies", "search_history", "team_members"]
    results.tests.tables = {}

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1)
        results.tests.tables[table] = {
          status: error ? "failed" : "success",
          error: error?.message
        }
      } catch (e) {
        results.tests.tables[table] = {
          status: "failed",
          error: e instanceof Error ? e.message : "Unknown error"
        }
      }
    }

    // Test 3: Full Text Search Configuration
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .textSearch("searchable", "test", { type: "websearch", config: "english" })
        .limit(1)

      results.tests.fullTextSearch = {
        status: error ? "failed" : "success",
        error: error?.message
      }
    } catch (e) {
      results.tests.fullTextSearch = {
        status: "failed",
        error: e instanceof Error ? e.message : "Unknown error"
      }
    }

    // Record execution time
    results.executionTime = Date.now() - startTime

    return NextResponse.json(results)
  } catch (error) {
    console.error("Connection test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
