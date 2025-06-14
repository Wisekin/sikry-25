import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { BarChart3 } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

interface TrendChartProps {
  title: string
  description?: string
  data: Array<{
    label: string
    value: number
    change?: number
  }>
  timeframe?: string
}

export function TrendChart({ title, description, data, timeframe }: TrendChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {timeframe && (
            <Badge variant="outline" className="text-xs">
              {timeframe}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <Text size="sm" className="font-medium">
                  {item.label}
                </Text>
                <div className="flex items-center gap-2">
                  <Text size="sm">{item.value.toLocaleString()}</Text>
                  {item.change !== undefined && (
                    <Text
                      size="sm"
                      className={
                        item.change > 0 ? "text-emerald-600" : item.change < 0 ? "text-red-600" : "text-secondary"
                      }
                    >
                      {item.change > 0 ? "+" : ""}
                      {item.change}%
                    </Text>
                  )}
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
