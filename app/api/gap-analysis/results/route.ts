import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
  try {
    let supabase;
    try {
      supabase = createClient()
    } catch (clientError) {
      console.error("Supabase client creation error:", clientError)
      return NextResponse.json({ error: "Failed to create database client" }, { status: 500 })
    }
    
    // Get the latest gap analysis results
    const { data, error } = await supabase
      .from("gap_analyses")
      .select(`
        id,
        overall_score,
        gap_scores,
        priority_areas,
        created_at,
        contacts (
          id,
          name,
          email
        ),
        discovered_companies (
          id,
          name,
          industry
        )
      `)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.log("No gap analysis found")
      return NextResponse.json({ error: "No gap analysis found" }, { status: 404 })
    }

    // Log the raw data for debugging
    console.log("Raw gap analysis data:", data)

    // Transform the data into the expected format
    let results;
    try {
      results = {
        summaryStats: {
          totalGapsIdentified: data.gap_scores ? Object.keys(data.gap_scores).length : 0,
          averageSeverity: calculateAverageSeverity(data.gap_scores),
          keyAreasForImprovement: data.priority_areas || [],
          overallReadinessScore: Math.round((data.overall_score || 0) * 20) // Convert 0-5 scale to percentage
        },
        detailedResults: transformGapScoresToDetailedResults(data.gap_scores),
        severityDistributionChartData: generateSeverityDistribution(data.gap_scores),
        areaDistributionChartData: generateAreaDistribution(data.gap_scores)
      }
    } catch (transformError) {
      console.error("Data transformation error:", transformError)
      return NextResponse.json({ error: "Failed to transform data" }, { status: 500 })
    }

    // Log the transformed results for debugging
    console.log("Transformed results:", results)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in gap analysis results API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function calculateAverageSeverity(gapScores: Record<string, number> | null): 'High' | 'Medium' | 'Low' {
  if (!gapScores || Object.keys(gapScores).length === 0) return 'Medium'
  
  const scores = Object.values(gapScores)
  const average = scores.reduce((a, b) => a + b, 0) / scores.length
  
  if (average >= 4) return 'High'
  if (average >= 2) return 'Medium'
  return 'Low'
}

function transformGapScoresToDetailedResults(gapScores: Record<string, number> | null) {
  if (!gapScores || Object.keys(gapScores).length === 0) {
    return [{
      id: 'gap-1',
      area: 'General Assessment',
      gapDescription: 'Initial assessment required',
      severity: 'Medium' as const,
      recommendations: ['Complete detailed assessment', 'Identify key areas for improvement'],
      responsibleTeam: 'Management Team'
    }]
  }
  
  return Object.entries(gapScores).map(([area, score], index) => ({
    id: `gap-${index + 1}`,
    area: formatAreaName(area),
    gapDescription: generateGapDescription(area, score),
    severity: calculateSeverity(score),
    recommendations: generateRecommendations(area, score),
    responsibleTeam: determineResponsibleTeam(area)
  }))
}

function formatAreaName(area: string): string {
  return area
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function generateGapDescription(area: string, score: number): string {
  const descriptions = {
    technology: [
      "Current technology infrastructure needs significant modernization",
      "Technology stack requires strategic updates",
      "Technology systems are well-maintained"
    ],
    process: [
      "Operational processes need comprehensive review",
      "Process optimization opportunities identified",
      "Processes are well-defined and efficient"
    ],
    people: [
      "Team capabilities require development",
      "Some skill gaps identified",
      "Team capabilities are strong"
    ]
  }
  
  const index = score >= 4 ? 0 : score >= 2 ? 1 : 2
  return descriptions[area as keyof typeof descriptions]?.[index] || "Area requires attention"
}

function calculateSeverity(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 4) return 'High'
  if (score >= 2) return 'Medium'
  return 'Low'
}

function generateRecommendations(area: string, score: number): string[] {
  const recommendations = {
    technology: [
      "Implement modern cloud infrastructure",
      "Upgrade core systems",
      "Enhance security measures"
    ],
    process: [
      "Streamline operational workflows",
      "Implement automation solutions",
      "Optimize resource allocation"
    ],
    people: [
      "Develop training programs",
      "Enhance team capabilities",
      "Foster knowledge sharing"
    ]
  }
  
  return recommendations[area as keyof typeof recommendations] || ["Review current practices", "Identify improvement opportunities"]
}

function determineResponsibleTeam(area: string): string {
  const teams = {
    technology: "IT Department",
    process: "Operations Team",
    people: "HR Department"
  }
  
  return teams[area as keyof typeof teams] || "Management Team"
}

function generateSeverityDistribution(gapScores: Record<string, number> | null) {
  if (!gapScores || Object.keys(gapScores).length === 0) {
    return [
      { name: 'High', value: 0 },
      { name: 'Medium', value: 1 },
      { name: 'Low', value: 0 }
    ]
  }
  
  const severityCounts = {
    High: 0,
    Medium: 0,
    Low: 0
  }
  
  Object.values(gapScores).forEach(score => {
    if (score >= 4) severityCounts.High++
    else if (score >= 2) severityCounts.Medium++
    else severityCounts.Low++
  })
  
  return Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value
  }))
}

function generateAreaDistribution(gapScores: Record<string, number> | null) {
  if (!gapScores || Object.keys(gapScores).length === 0) {
    return [
      { name: 'General Assessment', value: 50 }
    ]
  }
  
  return Object.entries(gapScores).map(([name, value]) => ({
    name: formatAreaName(name),
    value: Math.round((value || 0) * 20) // Convert to percentage
  }))
}
