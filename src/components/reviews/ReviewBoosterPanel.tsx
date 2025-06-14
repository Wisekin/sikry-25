"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { useTranslation } from "react-i18next"
import { Star, Send, Eye, CheckCircle, Clock } from "lucide-react"

interface ReviewBoosterPanelProps {
  contactId?: string
  campaignId?: string
  className?: string
}

export function ReviewBoosterPanel({ contactId, campaignId, className }: ReviewBoosterPanelProps) {
  const { t } = useTranslation('reviews')
  const [stats, setStats] = useState({
    total_requests: 0,
    total_sent: 0,
    total_clicked: 0,
    total_completed: 0,
    click_rate: 0,
    completion_rate: 0,
    platform_breakdown: [],
    recent_activity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviewStats()
  }, [contactId, campaignId])

  const loadReviewStats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (contactId) params.append("contact_id", contactId)
      if (campaignId) params.append("campaign_id", campaignId)

      const response = await fetch(`/api/reviews/stats?${params}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Error loading review stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestReview = async () => {
    try {
      const response = await fetch("/api/reviews/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contactId,
          campaign_id: campaignId,
          platform: "google",
          review_url: "https://g.page/r/YOUR_BUSINESS_ID/review",
          request_type: "manual",
        }),
      })

      const data = await response.json()
      if (data.success) {
        loadReviewStats() // Refresh stats
      }
    } catch (error) {
      console.error("Error requesting review:", error)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_sent}</div>
            <div className="text-xs text-gray-500">{t("sent")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total_clicked}</div>
            <div className="text-xs text-gray-500">{t("clicked")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total_completed}</div>
            <div className="text-xs text-gray-500">{t("completed")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.completion_rate}%</div>
            <div className="text-xs text-gray-500">{t("rate")}</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{t("clickRate")}</span>
            <span className="font-medium">{stats.click_rate}%</span>
          </div>
          <Progress value={stats.click_rate} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <span>{t("completionRate")}</span>
            <span className="font-medium">{stats.completion_rate}%</span>
          </div>
          <Progress value={stats.completion_rate} className="h-2" />
        </div>

        {/* Platform Breakdown */}
        {stats.platform_breakdown.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t("platformBreakdown")}</h4>
            {stats.platform_breakdown.map((platform: any) => (
              <div key={platform.platform} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {platform.platform}
                  </Badge>
                  <span>
                    {platform.requests} {t("requests")}
                  </span>
                </div>
                <span className="font-medium">{platform.rate}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {contactId && (
          <Button onClick={handleRequestReview} className="w-full" size="sm">
            <Send className="w-4 h-4 mr-2" />
            {t("requestReview")}
          </Button>
        )}

        {/* Recent Activity */}
        {stats.recent_activity.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t("recentActivity")}</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {stats.recent_activity.slice(0, 3).map((activity: any) => (
                <div key={activity.id} className="flex items-center gap-2 text-xs">
                  {activity.status === "completed" && <CheckCircle className="w-3 h-3 text-green-500" />}
                  {activity.status === "clicked" && <Eye className="w-3 h-3 text-blue-500" />}
                  {activity.status === "sent" && <Send className="w-3 h-3 text-gray-500" />}
                  {activity.status === "pending" && <Clock className="w-3 h-3 text-yellow-500" />}
                  <span className="flex-1 truncate">{activity.contact?.name || "Unknown"}</span>
                  <Badge variant="outline">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
