import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to get the total count of companies and check schema
    const { count, error: companiesError } = await supabase
      .from('discovered_companies')
      .select('*', { count: 'exact', head: true })

    if (companiesError) {
      throw companiesError
    }

    // Test search_history table
    const { error: historyError } = await supabase
      .from('search_history')
      .select('*')
      .limit(1)

    // Combine results
    return NextResponse.json({
      success: true,
      message: "Supabase connection and schema verification successful",
      details: {
        discoveredCompaniesCount: count || 0,
        searchHistoryAccessible: !historyError,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Supabase connection test error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to connect to Supabase or verify schema",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
