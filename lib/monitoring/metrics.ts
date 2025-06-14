import { createClient } from "@/utils/supabase/server"

export interface MetricData {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
  timestamp?: string
}

export class MetricsCollector {
  private static async recordMetric(metric: MetricData) {
    try {
      const supabase = createClient()

      await supabase.from("metrics").insert({
        name: metric.name,
        value: metric.value,
        unit: metric.unit || "count",
        tags: metric.tags || {},
        timestamp: metric.timestamp || new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to record metric:", error)
    }
  }

  static async recordAPIMetrics(endpoint: string, method: string, statusCode: number, duration: number) {
    await Promise.all([
      this.recordMetric({
        name: "api_requests_total",
        value: 1,
        tags: { endpoint, method, status: statusCode.toString() },
      }),
      this.recordMetric({
        name: "api_request_duration",
        value: duration,
        unit: "milliseconds",
        tags: { endpoint, method },
      }),
    ])
  }

  static async recordScraperMetrics(scraperId: string, status: string, duration?: number, dataCount?: number) {
    const metrics = [
      {
        name: "scraper_executions_total",
        value: 1,
        tags: { scraper_id: scraperId, status },
      },
    ]

    if (duration !== undefined) {
      metrics.push({
        name: "scraper_execution_duration",
        value: duration,
        unit: "milliseconds",
        tags: { scraper_id: scraperId },
      })
    }

    if (dataCount !== undefined) {
      metrics.push({
        name: "scraper_data_extracted",
        value: dataCount,
        unit: "records",
        tags: { scraper_id: scraperId },
      })
    }

    await Promise.all(metrics.map((metric) => this.recordMetric(metric)))
  }

  static async recordUserMetrics(action: string, userId?: string) {
    await this.recordMetric({
      name: "user_actions_total",
      value: 1,
      tags: { action, user_id: userId || "anonymous" },
    })
  }

  static async recordDataQualityMetrics(entityType: string, qualityScore: number, totalRecords: number) {
    await Promise.all([
      this.recordMetric({
        name: "data_quality_score",
        value: qualityScore,
        unit: "percentage",
        tags: { entity_type: entityType },
      }),
      this.recordMetric({
        name: "data_records_total",
        value: totalRecords,
        tags: { entity_type: entityType },
      }),
    ])
  }

  static async recordSystemMetrics(cpuUsage: number, memoryUsage: number, diskUsage: number) {
    await Promise.all([
      this.recordMetric({
        name: "system_cpu_usage",
        value: cpuUsage,
        unit: "percentage",
      }),
      this.recordMetric({
        name: "system_memory_usage",
        value: memoryUsage,
        unit: "percentage",
      }),
      this.recordMetric({
        name: "system_disk_usage",
        value: diskUsage,
        unit: "percentage",
      }),
    ])
  }
}
