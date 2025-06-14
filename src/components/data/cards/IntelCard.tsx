"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

interface IntelCardProps {
  title: string
  description?: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease" | "neutral"
    period: string
  }
  badge?: {
    text: string
    variant?: "default" | "secondary" | "outline"
  }
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function IntelCard({ title, description, value, change, badge, action }: IntelCardProps) {
  const getTrendIcon = (type: string) => {
    switch (type) {
      case "increase":
        return <TrendingUp className="w-4 h-4 text-emerald-600" />
      case "decrease":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-secondary" />
    }
  }

  const getTrendColor = (type: string) => {
    switch (type) {
      case "increase":
        return "text-emerald-600"
      case "decrease":
        return "text-red-600"
      default:
        return "text-secondary"
    }
  }

  return (
    <Card className="shadow-card hover:shadow-floating transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-caption text-secondary">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {badge && (
            <Badge variant={badge.variant || "secondary"} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-h2 font-semibold">{value}</div>
            {change && (
              <div className={`flex items-center gap-1 mt-1 ${getTrendColor(change.type)}`}>
                {getTrendIcon(change.type)}
                <Text size="sm">
                  {change.value > 0 ? "+" : ""}
                  {change.value}% {change.period}
                </Text>
              </div>
            )}
          </div>
          {action && (
            <Button variant="ghost" size="sm" onClick={action.onClick}>
              {action.label}
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
