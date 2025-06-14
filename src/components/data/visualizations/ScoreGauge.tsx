import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Target } from "lucide-react"

interface ScoreGaugeProps {
  title: string
  description?: string
  score: number
  maxScore?: number
  label?: string
  color?: "primary" | "accent" | "emerald" | "warning" | "destructive"
}

export function ScoreGauge({ title, description, score, maxScore = 100, label, color = "primary" }: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    primary: "stroke-primary",
    accent: "stroke-accent",
    emerald: "stroke-emerald-600",
    warning: "stroke-warning",
    destructive: "stroke-destructive",
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600"
    if (score >= 70) return "text-warning"
    if (score >= 50) return "text-orange-600"
    return "text-destructive"
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Target className="w-5 h-5" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${colorClasses[color]}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="text-xs text-secondary">/ {maxScore}</span>
          </div>
        </div>

        {label && (
          <Badge variant="outline" className="text-xs">
            {label}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
