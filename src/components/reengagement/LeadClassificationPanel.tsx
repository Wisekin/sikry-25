"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { useTranslation } from "react-i18next"
import { Flame, Thermometer, Snowflake, Moon, X, RefreshCw, Target, TrendingUp } from "lucide-react"

interface LeadClassificationPanelProps {
  contactId?: string
  showActions?: boolean
  className?: string
}

export function LeadClassificationPanel({
  contactId,
  showActions = true,
  className = "",
}: LeadClassificationPanelProps) {
  const { t } = useTranslation()
  const [classifications, setClassifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [classifying, setClassifying] = useState(false)

  useEffect(() => {
    loadClassifications()
  }, [contactId])

  const loadClassifications = async () => {
    try {
      setLoading(true)
      const url = contactId
        ? `/api/reengagement/classifications?contact_id=${contactId}`
        : `/api/reengagement/classifications`

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setClassifications(result.data || [])
      }
    } catch (error) {
      console.error("Error loading classifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const runClassification = async () => {
    try {
      setClassifying(true)
      const response = await fetch("/api/reengagement/classify-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (result.success) {
        await loadClassifications()
      }
    } catch (error) {
      console.error("Error running classification:", error)
    } finally {
      setClassifying(false)
    }
  }

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case "hot":
        return <Flame className="h-4 w-4 text-red-500" />
      case "warm":
        return <Thermometer className="h-4 w-4 text-orange-500" />
      case "cold":
        return <Snowflake className="h-4 w-4 text-blue-500" />
      case "dormant":
        return <Moon className="h-4 w-4 text-gray-500" />
      case "unresponsive":
        return <X className="h-4 w-4 text-gray-400" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "hot":
        return "bg-red-100 text-red-800"
      case "warm":
        return "bg-orange-100 text-orange-800"
      case "cold":
        return "bg-blue-100 text-blue-800"
      case "dormant":
        return "bg-gray-100 text-gray-800"
      case "unresponsive":
        return "bg-gray-50 text-gray-600"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const summary = classifications.reduce((acc, item) => {
    acc[item.classification] = (acc[item.classification] || 0) + 1
    return acc
  }, {})

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("reengagement.leadClassification")}
            </CardTitle>
            <CardDescription>{t("reengagement.classificationDescription")}</CardDescription>
          </div>
          {showActions && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadClassifications} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button size="sm" onClick={runClassification} disabled={classifying}>
                {classifying ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Target className="h-4 w-4 mr-2" />
                )}
                {t("reengagement.classifyLeads")}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(summary).map(([classification, count]) => (
            <div key={classification} className="text-center">
              <div className="flex items-center justify-center mb-2">{getClassificationIcon(classification)}</div>
              <div className="text-2xl font-bold">{count as number}</div>
              <Badge variant="outline" className={getClassificationColor(classification)}>
                {t(`reengagement.${classification}`)}
              </Badge>
            </div>
          ))}
        </div>

        {/* Recent Classifications */}
        {classifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">{t("reengagement.recentClassifications")}</h4>
            {classifications.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getClassificationIcon(item.classification)}
                  <div>
                    <div className="font-medium">{item.contact?.name || "Unknown Contact"}</div>
                    <div className="text-sm text-muted-foreground">
                      {t("reengagement.score")}: {item.score}/100
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getClassificationColor(item.classification)}>
                    {t(`reengagement.${item.classification}`)}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(item.classification_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {classifications.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("reengagement.noClassifications")}</p>
            <p className="text-sm">{t("reengagement.runClassificationHint")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
