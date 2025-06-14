import { createClient } from "@/utils/supabase/server"
import { logger } from "@/lib/monitoring/logger"
import crypto from "crypto"

class WebhookManager {
  async processInternalWebhook(event: string, data: any) {
    const supabase = createClient()

    // Get all active webhooks for this event
    const { data: webhooks } = await supabase
      .from("webhooks")
      .select("*")
      .contains("events", [event])
      .eq("is_active", true)

    if (!webhooks?.length) return

    // Send to all matching webhooks
    for (const webhook of webhooks) {
      await this.deliverWebhook(webhook, event, data)
    }
  }

  async processExternalWebhook(data: any) {
    // Handle external webhooks (from third-party services)
    const { source, event, payload } = data

    switch (source) {
      case "clearbit":
        await this.handleClearbitWebhook(event, payload)
        break
      case "hunter":
        await this.handleHunterWebhook(event, payload)
        break
      default:
        logger.warn("Unknown webhook source", "webhook", { source })
    }
  }

  async deliverWebhook(webhook: any, event: string, data: any) {
    const supabase = createClient()

    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        webhook_id: webhook.id,
      }

      const signature = this.generateSignature(JSON.stringify(payload), webhook.secret)

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          ...webhook.headers,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(webhook.timeout_seconds * 1000),
      })

      // Log delivery
      await supabase.from("webhook_deliveries").insert({
        webhook_id: webhook.id,
        event_type: event,
        payload,
        response_status: response.status,
        response_body: await response.text(),
        delivered_at: new Date().toISOString(),
      })
    } catch (error) {
      // Log failed delivery
      await supabase.from("webhook_deliveries").insert({
        webhook_id: webhook.id,
        event_type: event,
        payload: { event, data },
        error_message: error instanceof Error ? error.message : "Unknown error",
        attempt_number: 1,
      })

      logger.error("Webhook delivery failed", "webhook", {
        webhook_id: webhook.id,
        error,
      })
    }
  }

  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex")
  }

  async verifySignature(payload: string, signature: string | null): Promise<boolean> {
    if (!signature) return false

    // In a real implementation, you'd get the secret from the webhook config
    const secret = process.env.WEBHOOK_SECRET || "default-secret"
    const expectedSignature = this.generateSignature(payload, secret)

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  }

  private async handleClearbitWebhook(event: string, payload: any) {
    // Handle Clearbit enrichment webhooks
    logger.info("Clearbit webhook processed", "webhook", { event, payload })
  }

  private async handleHunterWebhook(event: string, payload: any) {
    // Handle Hunter.io email verification webhooks
    logger.info("Hunter webhook processed", "webhook", { event, payload })
  }
}

export const webhookManager = new WebhookManager()
