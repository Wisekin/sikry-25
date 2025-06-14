import { NextRequest, NextResponse } from "next/server"

// Mock notifications data
const notifications = [
  { id: 1, type: "new", message: "New message from Alice", time: "2m ago", read: false },
  { id: 2, type: "job", message: "Your report is ready", time: "1h ago", read: false },
  { id: 3, type: "alert", message: "Password will expire soon", time: "1d ago", read: true },
]

export async function GET(req: NextRequest) {
  // In a real app, fetch notifications from DB for the user
  return NextResponse.json(notifications)
}

export async function POST(req: NextRequest) {
  // In a real app, mark notifications as read or handle actions
  return NextResponse.json({ success: true })
}