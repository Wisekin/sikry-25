import { type NextRequest, NextResponse } from "next/server"
import { webhookManager } from "@/lib/webhooks/manager"
import { logger } from "@/lib/monitoring/logger"

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
    logger.info("External webhook received", "webhook", {
      source: request.headers.get("user-agent"),
      data,
    })

    // Process the webhook
    await webhookManager.processExternalWebhook(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("External webhook failed", "webhook", { error })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
