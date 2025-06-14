"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { UsersIcon, EyeIcon, PencilIcon, PlusIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid"

export function TeamActivity() {
  const activities = [
    {
      id: 1,
      user: { name: "Sarah Chen", avatar: "/placeholder.svg", initials: "SC" },
      action: "created",
      target: "LinkedIn Scraper v2",
      type: "scraper",
      time: "5 minutes ago",
      icon: PlusIcon,
    },
    {
      id: 2,
      user: { name: "Mike Johnson", avatar: "/placeholder.svg", initials: "MJ" },
      action: "updated",
      target: "Q1 Marketing Campaign",
      type: "campaign",
      time: "12 minutes ago",
      icon: PencilIcon,
    },
    {
      id: 3,
      user: { name: "Emma Wilson", avatar: "/placeholder.svg", initials: "EW" },
      action: "viewed",
      target: "TechFlow Solutions profile",
      type: "company",
      time: "25 minutes ago",
      icon: EyeIcon,
    },
    {
      id: 4,
      user: { name: "David Kim", avatar: "/placeholder.svg", initials: "DK" },
      action: "commented on",
      target: "Market Analysis Report",
      type: "report",
      time: "1 hour ago",
      icon: ChatBubbleLeftRightIcon,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "scraper":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "campaign":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "company":
        return "bg-green-100 text-green-800 border-green-200"
      case "report":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-blue-500" />
          Team Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <activity.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-gray-600"> {activity.action} </span>
                    <span className="font-medium">{activity.target}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${getTypeColor(activity.type)}`}>
                    {activity.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
