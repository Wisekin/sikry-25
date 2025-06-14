import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { MetricsCollector } from "@/lib/monitoring/metrics"

export async function GET() {
  try {
    const startTime = Date.now()
    const supabase = createClient()

    // Test database connection
    const { data: dbTest, error: dbError } = await supabase.from("companies").select("count").limit(1)

    const dbHealthy = !dbError
    const responseTime = Date.now() - startTime

    // Get system metrics
    const systemHealth = {
      database: {
        status: dbHealthy ? "healthy" : "unhealthy",
        responseTime: responseTime,
        error: dbError?.message,
      },
      api: {
        status: "healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0",
      },
      timestamp: new Date().toISOString(),
    }

    // Record health check metrics
    await MetricsCollector.recordSystemMetrics(
      0, // CPU usage would come from system monitoring
      (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
      0, // Disk usage would come from system monitoring
    )

    const overallStatus = dbHealthy ? "healthy" : "unhealthy"

    return NextResponse.json(
      {
        status: overallStatus,
        checks: systemHealth,
        success: true,
      },
      {
        status: overallStatus === "healthy" ? 200 : 503,
      },
    )
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      {
        status: 503,
      },
    )
  }
}
