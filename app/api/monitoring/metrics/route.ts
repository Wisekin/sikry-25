import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("range") || "24h"
    const metricName = searchParams.get("metric")

    const supabase = createClient()

    // Calculate time range
    const now = new Date()
    const timeRangeMs =
      {
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      }[timeRange] || 24 * 60 * 60 * 1000

    const startTime = new Date(now.getTime() - timeRangeMs).toISOString()

    // Build query
    let query = supabase.from("metrics").select("*").gte("timestamp", startTime).order("timestamp", { ascending: true })

    if (metricName) {
      query = query.eq("name", metricName)
    }

    const { data: metrics, error } = await query

    if (error) {
      throw error
    }

    // Aggregate metrics by time buckets
    const bucketSize = timeRangeMs / 100 // 100 data points
    const buckets: Record<string, any[]> = {}

    metrics?.forEach((metric) => {
      const bucketTime = Math.floor(new Date(metric.timestamp).getTime() / bucketSize) * bucketSize
      const bucketKey = new Date(bucketTime).toISOString()

      if (!buckets[bucketKey]) {
        buckets[bucketKey] = []
      }
      buckets[bucketKey].push(metric)
    })

    // Calculate aggregated values
    const aggregatedData = Object.entries(buckets).map(([timestamp, bucketMetrics]) => {
      const metricsByName: Record<string, number[]> = {}

      bucketMetrics.forEach((metric) => {
        if (!metricsByName[metric.name]) {
          metricsByName[metric.name] = []
        }
        metricsByName[metric.name].push(metric.value)
      })

      const aggregated: Record<string, number> = {}
      Object.entries(metricsByName).forEach(([name, values]) => {
        // Use appropriate aggregation based on metric type
        if (name.includes("total") || name.includes("count")) {
          aggregated[name] = values.reduce((sum, val) => sum + val, 0)
        } else {
          aggregated[name] = values.reduce((sum, val) => sum + val, 0) / values.length
        }
      })

      return {
        timestamp,
        ...aggregated,
      }
    })

    return NextResponse.json({
      data: aggregatedData,
      meta: {
        timeRange,
        startTime,
        endTime: now.toISOString(),
        bucketSize: bucketSize / 1000, // in seconds
      },
      success: true,
    })
  } catch (error) {
    console.error("Metrics API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch metrics",
        errors: [{ code: "metrics_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
