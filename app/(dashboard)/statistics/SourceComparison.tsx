"use client"

import { Text } from "@/components/core/typography/Text"
import { Badge } from "@/components/ui/badge"

export function SourceComparison() {
  // Sample data for source comparison
  const sources = [
    {
      name: "Web Scraping",
      count: 8245,
      quality: 92,
      trend: "up",
      lastUpdate: "2 hours ago",
    },
    {
      name: "API Integrations",
      count: 3127,
      quality: 98,
      trend: "up",
      lastUpdate: "1 hour ago",
    },
    {
      name: "Manual Entry",
      count: 986,
      quality: 85,
      trend: "down",
      lastUpdate: "1 day ago",
    },
    {
      name: "Partner Data",
      count: 2341,
      quality: 90,
      trend: "stable",
      lastUpdate: "6 hours ago",
    },
    {
      name: "Public Records",
      count: 1876,
      quality: 88,
      trend: "up",
      lastUpdate: "12 hours ago",
    },
  ]

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "up":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Improving</Badge>
      case "down":
        return <Badge className="bg-red-50 text-red-700 border-red-200">Declining</Badge>
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Stable</Badge>
    }
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 95) return "text-emerald-600"
    if (quality >= 85) return "text-blue-600"
    if (quality >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4 font-medium text-secondary text-sm border-b pb-2">
        <div>Source</div>
        <div>Records</div>
        <div>Quality Score</div>
        <div>Trend</div>
        <div>Last Update</div>
      </div>

      {sources.map((source, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 items-center">
          <div className="font-medium">{source.name}</div>
          <div>{source.count.toLocaleString()}</div>
          <div className={`font-bold ${getQualityColor(source.quality)}`}>{source.quality}%</div>
          <div>{getTrendBadge(source.trend)}</div>
          <Text size="sm" className="text-secondary">
            {source.lastUpdate}
          </Text>
        </div>
      ))}

      <div className="pt-4 border-t">
        <Text size="sm" className="text-secondary">
          Quality score is calculated based on data completeness, accuracy, and recency.
        </Text>
      </div>
    </div>
  )
}
