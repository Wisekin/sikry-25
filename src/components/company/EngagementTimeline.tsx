"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Mail, MessageSquare, Phone, Calendar, ExternalLink, Clock } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

interface EngagementTimelineProps {
  companyId: string
}

interface EngagementEvent {
  id: string
  type: "email" | "sms" | "whatsapp" | "call" | "meeting"
  title: string
  description: string
  timestamp: string
  status: "sent" | "delivered" | "opened" | "replied" | "scheduled" | "completed"
  channel?: string
}

export function EngagementTimeline({ companyId }: EngagementTimelineProps) {
  const events: EngagementEvent[] = [
    {
      id: "1",
      type: "email",
      title: "Partnership Introduction",
      description: "Initial outreach email sent to contact@techflow.ch",
      timestamp: "2024-01-15T14:30:00Z",
      status: "opened",
      channel: "Email",
    },
    {
      id: "2",
      type: "email",
      title: "Follow-up Email",
      description: "Follow-up message with additional information",
      timestamp: "2024-01-12T09:15:00Z",
      status: "replied",
      channel: "Email",
    },
    {
      id: "3",
      type: "call",
      title: "Discovery Call",
      description: "30-minute call to discuss collaboration opportunities",
      timestamp: "2024-01-10T16:00:00Z",
      status: "completed",
      channel: "Phone",
    },
    {
      id: "4",
      type: "meeting",
      title: "Partnership Meeting",
      description: "In-person meeting scheduled at their Geneva office",
      timestamp: "2024-01-20T10:00:00Z",
      status: "scheduled",
      channel: "In-Person",
    },
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail
      case "sms":
        return MessageSquare
      case "whatsapp":
        return MessageSquare
      case "call":
        return Phone
      case "meeting":
        return Calendar
      default:
        return Mail
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "opened":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "replied":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "scheduled":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "completed":
        return "bg-muted text-secondary border-input"
      default:
        return "bg-muted text-secondary border-input"
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Engagement Timeline
        </CardTitle>
        <CardDescription>Communication history and upcoming activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => {
            const Icon = getEventIcon(event.type)
            const isUpcoming = new Date(event.timestamp) > new Date()

            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isUpcoming ? "bg-accent text-white" : "bg-muted text-secondary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < events.length - 1 && <div className="w-px h-8 bg-input mt-2" />}
                </div>

                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <Text size="sm" className="text-secondary mt-1">
                        {event.description}
                      </Text>
                      <div className="flex items-center gap-2 mt-2">
                        <Text size="sm" className="text-secondary">
                          {new Date(event.timestamp).toLocaleDateString()} at{" "}
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                        <Badge variant="outline" className="text-xs">
                          {event.channel}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                      {event.status === "scheduled" && (
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button className="w-full" variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule New Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
