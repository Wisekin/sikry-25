import { type NextRequest, NextResponse } from "next/server"
import { webhookManager } from "@/lib/webhooks/manager"
import { logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json()

    // Log the internal event
    logger.info("Internal webhook triggered", "webhook", { event, data })

    // Process the webhook
    await webhookManager.processInternalWebhook(event, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Internal webhook failed", "webhook", { error })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
