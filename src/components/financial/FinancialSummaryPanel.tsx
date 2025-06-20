"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useTranslation } from "react-i18next"
import type { FinancialSummary } from "@/src/types/financial"
import { DollarSign, TrendingUp, TrendingDown, Calculator } from "lucide-react"

interface FinancialSummaryPanelProps {
  sourceType?: string
  sourceId?: string
  currency?: string
  className?: string
}

export function FinancialSummaryPanel({
  sourceType,
  sourceId,
  currency = "USD",
  className,
}: FinancialSummaryPanelProps) {
  const { t } = useTranslation(['financialPage', 'common'])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [sourceType, sourceId, currency])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (sourceType) params.append("source_type", sourceType)
      if (sourceId) params.append("source_id", sourceId)
      if (currency) params.append("currency", currency)

      const response = await fetch(`/api/financial/summary?${params}`)
      const data = await response.json()

      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (error) {
      console.error("Error fetching financial summary:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getROIColor = (roi: number) => {
    if (roi > 20) return "text-green-600"
    if (roi > 0) return "text-yellow-600"
    return "text-red-600"
  }

  const getROIIcon = (roi: number) => {
    return roi >= 0 ? TrendingUp : TrendingDown
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('financialPage:summary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('financialPage:summary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('financialPage:summary.noData')}</p>
        </CardContent>
      </Card>
    )
  }

  const ROIIcon = getROIIcon(summary.roi_percentage)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('financialPage:summary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('financialPage:summary.revenue')}</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(summary.total_revenue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('financialPage:summary.costs')}</p>
            <p className="text-lg font-semibold text-red-600">{formatCurrency(summary.total_costs)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('financialPage:summary.netProfit')}</p>
          <p className={`text-xl font-bold ${summary.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(summary.net_profit)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('financialPage:summary.roi')}</p>
            <div className="flex items-center gap-2">
              <ROIIcon className={`h-4 w-4 ${getROIColor(summary.roi_percentage)}`} />
              <span className={`font-semibold ${getROIColor(summary.roi_percentage)}`}>
                {summary.roi_percentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calculator className="h-3 w-3" />
            {summary.records_count} {t('financialPage:summary.records')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
