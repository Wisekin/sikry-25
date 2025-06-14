"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid"

export function DataQualityScore() {
  const qualityMetrics = {
    overall: 87,
    completeness: 92,
    accuracy: 85,
    freshness: 89,
    consistency: 83,
  }

  const issues = [
    {
      type: "missing",
      count: 45,
      description: "Companies missing email addresses",
      severity: "medium",
    },
    {
      type: "outdated",
      count: 23,
      description: "Contact info older than 6 months",
      severity: "low",
    },
    {
      type: "duplicate",
      count: 12,
      description: "Potential duplicate entries",
      severity: "high",
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100"
    if (score >= 70) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
            Data Quality Score
          </CardTitle>
          <Button variant="outline" size="sm">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(qualityMetrics.overall)}`}>
              {qualityMetrics.overall}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Overall Data Quality</p>
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mt-2 ${getScoreBg(qualityMetrics.overall)}`}
            >
              {qualityMetrics.overall >= 90 ? (
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
              ) : qualityMetrics.overall >= 70 ? (
                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-600" />
              )}
              <span className={getScoreColor(qualityMetrics.overall)}>
                {qualityMetrics.overall >= 90
                  ? "Excellent"
                  : qualityMetrics.overall >= 70
                    ? "Good"
                    : "Needs Improvement"}
              </span>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(qualityMetrics.completeness)}`}>
                {qualityMetrics.completeness}%
              </div>
              <p className="text-xs text-gray-600">Completeness</p>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(qualityMetrics.accuracy)}`}>
                {qualityMetrics.accuracy}%
              </div>
              <p className="text-xs text-gray-600">Accuracy</p>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(qualityMetrics.freshness)}`}>
                {qualityMetrics.freshness}%
              </div>
              <p className="text-xs text-gray-600">Freshness</p>
            </div>
            <div className="text-center">
              <div className={`text-xl font-semibold ${getScoreColor(qualityMetrics.consistency)}`}>
                {qualityMetrics.consistency}%
              </div>
              <p className="text-xs text-gray-600">Consistency</p>
            </div>
          </div>

          {/* Issues */}
          <div>
            <h4 className="font-medium text-sm mb-3">Data Quality Issues</h4>
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {issue.count} {issue.description}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
