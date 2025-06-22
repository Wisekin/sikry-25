import { type NextRequest, NextResponse } from "next/server"
import { webhookManager } from "@/lib/webhooks/manager"
import { Logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json()

    // Log the internal event
    Logger.logInfo("Internal webhook triggered", {
      event,
      data,
      category: "webhook"
    })

    // Process the webhook
    await webhookManager.processInternalWebhook(event, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    Logger.logError("Internal webhook failed", {
      error: error instanceof Error ? error.message : 'Unknown error',
      category: "webhook"
    })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
