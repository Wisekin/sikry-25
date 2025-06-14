import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface ConfidenceMeterProps {
  score: number
  size?: "sm" | "md" | "lg"
  showIcon?: boolean
  showProgress?: boolean
}

export function ConfidenceMeter({ score, size = "md", showIcon = true, showProgress = false }: ConfidenceMeterProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-50 border-green-200"
    if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-rose-600 bg-rose-50 border-rose-200"
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
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const Icon = getScoreIcon(score)

  return (
    <div className="space-y-2">
      <Badge variant="outline" className={`${getScoreColor(score)} ${sizeClasses[size]} font-medium`}>
        {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
        {score}% {size !== "sm" && getScoreLabel(score)}
      </Badge>

      {showProgress && (
        <div className="space-y-1">
          <Progress value={score} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  )
}
