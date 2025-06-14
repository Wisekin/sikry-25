import { Badge } from "@/src/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface ConfidenceBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
}

export function ConfidenceBadge({ score, size = "md", showIcon = true }: ConfidenceBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-200"
    if (score >= 70) return "text-warning bg-warning/10 border-warning/20"
    return "text-destructive bg-destructive/10 border-destructive/20"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle
    if (score >= 70) return AlertCircle
    return XCircle
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "High Confidence"
    if (score >= 70) return "Medium Confidence"
    return "Low Confidence"
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-caption px-3 py-1",
    lg: "text-body px-4 py-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const Icon = getScoreIcon(score)

  return (
    <Badge variant="outline" className={`${getScoreColor(score)} ${sizeClasses[size]} font-medium`}>
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {score}% {size !== "sm" && getScoreLabel(score)}
    </Badge>
  )
}
