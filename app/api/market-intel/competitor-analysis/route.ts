import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import type { CompetitorAnalysis, Competitor } from "@/types/market"

export async function POST(request: Request) {
  try {
    const body: { companyId: string } = await request.json()
    const { companyId } = body

    // Validate required fields
    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Company ID is required" }],
        },
        { status: 400 },
      )
    }

    const supabase = createClient()

    // Get the company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single()

    if (companyError) {
      throw companyError
    }

    // In a real implementation, this would analyze competitors
    // For now, we'll return mock data
    const mockAnalysis = generateMockCompetitorAnalysis(companyId)
    const mockCompetitors = generateMockCompetitors(companyId, company.industry)

    // Store the analysis in the database
    const { error: analysisError } = await supabase
      .from("competitor_analysis")
      .upsert({
        company_id: companyId,
        ...mockAnalysis,
        last_updated: new Date().toISOString(),
      })
      .select()

    if (analysisError) {
      throw analysisError
    }

    // Store the competitors in the database
    const { error: competitorsError } = await supabase.from("competitors").upsert(
      mockCompetitors.map((competitor) => ({
        primary_company_id: companyId,
        ...competitor,
      })),
    )

    if (competitorsError) {
      throw competitorsError
    }

    return NextResponse.json({
      success: true,
      analysis: mockAnalysis,
      competitors: mockCompetitors,
      message: "Competitor analysis generated successfully",
    })
  } catch (error) {
    console.error("Competitor analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate competitor analysis",
        errors: [{ code: "analysis_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

function generateMockCompetitorAnalysis(companyId: string): CompetitorAnalysis {
  return {
    companyId,
    competitors: [],
    marketPosition: {
      rank: Math.floor(Math.random() * 10) + 1,
      marketShare: Math.random() * 30,
      strengths: ["Strong brand recognition", "Innovative product features", "Efficient distribution network"],
      weaknesses: ["Limited international presence", "High customer acquisition cost", "Legacy technology stack"],
      opportunities: ["Emerging markets expansion", "Strategic partnerships", "Product line diversification"],
      threats: ["Increasing competition", "Regulatory changes", "Market saturation"],
    },
    benchmarks: [
      {
        metric: "Customer Satisfaction",
        ourValue: Math.random() * 100,
        competitorAverage: Math.random() * 100,
        marketLeader: Math.random() * 100,
        percentile: Math.random() * 100,
        trend: Math.random() > 0.5 ? "improving" : "declining",
      },
      {
        metric: "Market Share",
        ourValue: Math.random() * 30,
        competitorAverage: Math.random() * 30,
        marketLeader: Math.random() * 30,
        percentile: Math.random() * 100,
        trend: Math.random() > 0.5 ? "improving" : "declining",
      },
      {
        metric: "Revenue Growth",
        ourValue: Math.random() * 50,
        competitorAverage: Math.random() * 50,
        marketLeader: Math.random() * 50,
        percentile: Math.random() * 100,
        trend: Math.random() > 0.5 ? "improving" : "declining",
      },
    ],
    lastUpdated: new Date().toISOString(),
  }
}

function generateMockCompetitors(companyId: string, industry: string): Competitor[] {
  const competitors = []
  const companyNames = [
    "Acme Corp",
    "Globex",
    "Initech",
    "Umbrella Corp",
    "Stark Industries",
    "Wayne Enterprises",
    "Cyberdyne Systems",
    "Soylent Corp",
    "Massive Dynamic",
    "Weyland-Yutani",
  ]

  for (let i = 0; i < 5; i++) {
    const name = companyNames[i]
    competitors.push({
      companyId: `comp-${i + 1}`,
      name,
      domain: `${name.toLowerCase().replace(/\s+/g, "")}.com`,
      relationship: i % 3 === 0 ? "direct" : i % 3 === 1 ? "indirect" : "potential",
      similarity: Math.random() * 100,
      marketShare: Math.random() * 30,
      strengths: ["Strong brand", "Innovative products", "Efficient distribution"],
      weaknesses: ["Limited presence", "High costs", "Legacy systems"],
      recentActivity: [
        {
          id: `insight-${i}-1`,
          type: "funding",
          title: `${name} secures new funding`,
          description: `${name} has secured $${Math.floor(Math.random() * 100)}M in Series ${String.fromCharCode(
            65 + i,
          )} funding.`,
          impact: "high",
          confidence: Math.random() * 100,
          source: "TechCrunch",
          url: "https://techcrunch.com",
          date: new Date().toISOString(),
          relevanceScore: Math.random() * 100,
          tags: ["funding", industry.toLowerCase()],
        },
        {
          id: `insight-${i}-2`,
          type: "partnership",
          title: `${name} announces strategic partnership`,
          description: `${name} has partnered with another major player in the ${industry} industry.`,
          impact: "medium",
          confidence: Math.random() * 100,
          source: "Press Release",
          url: "https://example.com",
          date: new Date().toISOString(),
          relevanceScore: Math.random() * 100,
          tags: ["partnership", industry.toLowerCase()],
        },
      ],
    })
  }

  return competitors
}
