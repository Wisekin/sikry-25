"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowRightIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid"

export function SmartInsights() {
  const insights = [
    {
      id: 1,
      type: "opportunity",
      title: "High-Value Prospects Detected",
      description: "Found 23 companies with recent funding rounds in your target market",
      impact: "High",
      action: "Review prospects",
      icon: ArrowTrendingUpIcon,
      color: "bg-green-500",
    },
    {
      id: 2,
      type: "warning",
      title: "Scraper Performance Drop",
      description: "LinkedIn scraper success rate dropped to 67% in the last 24 hours",
      impact: "Medium",
      action: "Check configuration",
      icon: ExclamationTriangleIcon,
      color: "bg-yellow-500",
    },
    {
      id: 3,
      type: "suggestion",
      title: "Market Expansion Opportunity",
      description: "Consider targeting fintech companies in Geneva - 40% growth detected",
      impact: "High",
      action: "Explore market",
      icon: LightBulbIcon,
      color: "bg-blue-500",
    },
    {
      id: 4,
      type: "trend",
      title: "Industry Trend Alert",
      description: "AI/ML companies are hiring 35% more than last quarter",
      impact: "Medium",
      action: "View analysis",
      icon: ChartBarIcon,
      color: "bg-purple-500",
    },
  ]

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-yellow-500" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full ${insight.color} flex items-center justify-center flex-shrink-0`}>
                <insight.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-700">
                  {insight.action}
                  <ArrowRightIcon className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
