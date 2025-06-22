import { type NextRequest, NextResponse } from "next/server"
import { webhookManager } from "@/lib/webhooks/manager"
import { Logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-webhook-signature")
    const body = await request.text()

    // Verify webhook signature
    const isValid = await webhookManager.verifySignature(body, signature)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)

    // Log the external webhook
    Logger.logInfo("External webhook received", {
      source: request.headers.get("user-agent"),
      data,
      category: "webhook"
    })

    // Process the webhook
    await webhookManager.processExternalWebhook(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    Logger.logError("External webhook failed", {
      error: error instanceof Error ? error.message : 'Unknown error',
      category: "webhook"
    })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
