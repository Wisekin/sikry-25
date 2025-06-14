"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { Play, Pause, Settings, Eye } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function CampaignTracker() {
  const campaigns = [
    {
      id: "1",
      name: "Q1 Partnership Outreach",
      status: "active",
      channel: "email",
      sent: 450,
      opened: 312,
      replied: 89,
      scheduled: 150,
      startDate: "2024-01-15",
      endDate: "2024-03-15",
    },
    {
      id: "2",
      name: "Product Launch Announcement",
      status: "paused",
      channel: "email",
      sent: 230,
      opened: 187,
      replied: 45,
      scheduled: 0,
      startDate: "2024-01-10",
      endDate: "2024-02-10",
    },
    {
      id: "3",
      name: "Follow-up SMS Campaign",
      status: "completed",
      channel: "sms",
      sent: 180,
      opened: 180,
      replied: 67,
      scheduled: 0,
      startDate: "2024-01-05",
      endDate: "2024-01-20",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "paused":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-muted text-secondary"
    }
  }

  return (
    <div className="space-y-6">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="shadow-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={getStatusColor(campaign.status)}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">{campaign.channel.toUpperCase()}</Badge>
                  <Text size="sm" className="text-secondary">
                    {campaign.startDate} - {campaign.endDate}
                  </Text>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                {campaign.status === "active" ? (
                  <Button variant="outline" size="sm">
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </Button>
                ) : campaign.status === "paused" ? (
                  <Button variant="outline" size="sm">
                    <Play className="w-3 h-3 mr-1" />
                    Resume
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-h2 font-semibold text-blue-600">{campaign.sent}</div>
                <Text size="sm" className="text-secondary">
                  Sent
                </Text>
              </div>
              <div className="text-center">
                <div className="text-h2 font-semibold text-yellow-600">{campaign.opened}</div>
                <Text size="sm" className="text-secondary">
                  Opened
                </Text>
              </div>
              <div className="text-center">
                <div className="text-h2 font-semibold text-emerald-600">{campaign.replied}</div>
                <Text size="sm" className="text-secondary">
                  Replied
                </Text>
              </div>
              <div className="text-center">
                <div className="text-h2 font-semibold text-accent">{campaign.scheduled}</div>
                <Text size="sm" className="text-secondary">
                  Scheduled
                </Text>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-caption mb-2">
                  <span>Open Rate</span>
                  <span>{Math.round((campaign.opened / campaign.sent) * 100)}%</span>
                </div>
                <Progress value={(campaign.opened / campaign.sent) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-caption mb-2">
                  <span>Response Rate</span>
                  <span>{Math.round((campaign.replied / campaign.sent) * 100)}%</span>
                </div>
                <Progress value={(campaign.replied / campaign.sent) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
