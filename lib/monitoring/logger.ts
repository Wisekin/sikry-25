import { createClient } from "@/utils/supabase/server"

export interface LogEntry {
  level: "info" | "warn" | "error" | "debug"
  message: string
  category: "api" | "scraper" | "user" | "system" | "security"
  metadata?: Record<string, any>
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
}

export class Logger {
  private static async writeLog(entry: LogEntry) {
    try {
      const supabase = createClient()

      await supabase.from("system_logs").insert({
        level: entry.level,
        message: entry.message,
        category: entry.category,
        metadata: entry.metadata || {},
        user_id: entry.userId,
        session_id: entry.sessionId,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to write log:", error)
    }
  }

  static async logAPIRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    await this.writeLog({
      level: statusCode >= 400 ? "error" : "info",
      message: `${method} ${path} - ${statusCode} (${duration}ms)`,
      category: "api",
      metadata: {
        method,
        path,
        statusCode,
        duration,
      },
      userId,
      ipAddress,
      userAgent,
    })
  }

  static async logScraperExecution(
    scraperId: string,
    url: string,
    status: "started" | "completed" | "failed",
    duration?: number,
    error?: string,
    dataCount?: number,
  ) {
    await this.writeLog({
      level: status === "failed" ? "error" : "info",
      message: `Scraper ${scraperId} ${status} for ${url}`,
      category: "scraper",
      metadata: {
        scraperId,
        url,
        status,
        duration,
        error,
        dataCount,
      },
    })
  }

  static async logUserAction(
    userId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>,
  ) {
    await this.writeLog({
      level: "info",
      message: `User ${userId} performed ${action}`,
      category: "user",
      metadata: {
        action,
        resourceType,
        resourceId,
        ...metadata,
      },
      userId,
    })
  }

  static async logSecurityEvent(
    event: string,
    severity: "low" | "medium" | "high" | "critical",
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    await this.writeLog({
      level: severity === "critical" || severity === "high" ? "error" : "warn",
      message: `Security event: ${event}`,
      category: "security",
      metadata: {
        event,
        severity,
        ...details,
      },
      ipAddress,
      userAgent,
    })
  }

  static async logSystemEvent(event: string, level: "info" | "warn" | "error", metadata?: Record<string, any>) {
    await this.writeLog({
      level,
      message: `System event: ${event}`,
      category: "system",
      metadata,
    })
  }
}
