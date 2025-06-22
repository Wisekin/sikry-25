import { createClient } from "@/utils/supabase/server"

export type LogLevel = "info" | "warn" | "error" | "debug"
export type LogCategory = "api" | "scraper" | "user" | "system" | "security"

export interface LogEntry {
  level: LogLevel
  message: string
  category: LogCategory
  metadata?: Record<string, any>
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  error?: Error
}

export class Logger {
  private category: LogCategory;
  private context: Record<string, any> = {};

  constructor(category: LogCategory = 'system') {
    this.category = category;
  }

  private async writeLog(entry: Omit<LogEntry, 'category'>) {
    try {
      const supabase = createClient()
      const metadata = {
        ...this.context,
        ...entry.metadata,
        ...(entry.error ? { 
          error: {
            name: entry.error.name,
            message: entry.error.message,
            stack: process.env.NODE_ENV === 'development' ? entry.error.stack : undefined
          } 
        } : {})
      };

      await supabase.from("system_logs").insert({
        level: entry.level,
        message: entry.message,
        category: this.category,
        metadata,
        user_id: entry.userId,
        session_id: entry.sessionId,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        created_at: new Date().toISOString(),
      });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        const logMethod = console[entry.level] || console.log;
        logMethod(`[${entry.level.toUpperCase()}] [${this.category}] ${entry.message}`, metadata);
      }
    } catch (error) {
      console.error("Failed to write log:", error);
    }
  }

  // Set context that will be included in all subsequent logs
  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
  }

  // Log an info message
  async logInfo(message: string, meta?: Record<string, any>): Promise<void> {
    await this.writeLog({
      level: 'info',
      message,
      metadata: meta
    });
  }

  // Log an error
  async logError(message: string, error: Error, meta?: Record<string, any>): Promise<void> {
    await this.writeLog({
      level: 'error',
      message: `${message}: ${error.message}`,
      error,
      metadata: meta
    });
  }

  // Log a warning
  async logWarn(message: string, meta?: Record<string, any>): Promise<void> {
    await this.writeLog({
      level: 'warn',
      message,
      metadata: meta
    });
  }

  // Log debug information
  async logDebug(message: string, meta?: Record<string, any>): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      await this.writeLog({
        level: 'debug',
        message,
        metadata: meta
      });
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
