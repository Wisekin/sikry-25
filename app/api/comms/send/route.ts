import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: Request) {
  try {
    const body: {
      type: string
      contactId?: string
      companyId?: string
      templateId?: string
      subject?: string
      content: string
      personalization?: Record<string, any>
    } = await request.json()

    const supabase = createClient()

    // Validate required fields
    if (!body.type || !body.content) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Type and content are required" }],
        },
        { status: 400 },
      )
    }

    // For email type, subject is required
    if (body.type === "email" && !body.subject) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "Subject is required for email messages" }],
        },
        { status: 400 },
      )
    }

    // Create the message
    const message = {
      type: body.type,
      contact_id: body.contactId,
      company_id: body.companyId,
      template_id: body.templateId,
      subject: body.subject,
      content: body.content,
      personalization: body.personalization || {},
      status: "pending",
      created_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("messages").insert(message).select().single()

    if (error) {
      throw error
    }

    // In a real implementation, this would send the message via an email service, SMS gateway, etc.
    // For now, we'll simulate sending and update the status after a delay
    setTimeout(async () => {
      await supabase
        .from("messages")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", data.id)
    }, 2000)

    return NextResponse.json({
      data,
      success: true,
      message: "Message queued for sending",
    })
  } catch (error) {
    console.error("Send message API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
        errors: [{ code: "send_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
