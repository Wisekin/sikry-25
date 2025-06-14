"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { useTranslation } from "react-i18next"
import type { FinancialRecord, CampaignROI, FinancialFilters } from "@/src/types/financial"
import { FinancialSummaryPanel } from "@/src/components/financial/FinancialSummaryPanel"
import { DollarSign, Download, Filter, Plus, Search, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { format } from "date-fns"

export default function FinancialDashboard() {
  const { t } = useTranslation()
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [campaignROI, setCampaignROI] = useState<CampaignROI[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FinancialFilters>({ source_type: "", type: "", currency: "" })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch financial records
      const recordsParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) recordsParams.append(key, value)
      })

      const [recordsResponse, roiResponse] = await Promise.all([
        fetch(`/api/financial/records?${recordsParams}`),
        fetch("/api/financial/campaign-roi"),
      ])

      const recordsData = await recordsResponse.json()
      const roiData = await roiResponse.json()

      if (recordsData.records) setRecords(recordsData.records)
      if (roiData.campaigns) setCampaignROI(roiData.campaigns)
    } catch (error) {
      console.error("Error fetching financial data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FinancialFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Type", "Source", "Amount", "Currency", "Category", "Description"].join(","),
      ...records.map((record) =>
        [
          format(new Date(record.recorded_at), "yyyy-MM-dd"),
          record.type,
          record.source_type,
          record.amount,
          record.currency,
          record.category || "",
          record.description || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financial-records-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "revenue":
        return "bg-green-100 text-green-800"
      case "cost":
        return "bg-red-100 text-red-800"
      case "expense":
        return "bg-orange-100 text-orange-800"
      case "refund":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("financialPage:dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("financialPage:dashboard.description")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("common:export")}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("financialPage:buttons.addRecord")}
          </Button>
        </div>
      </div>

      {/* Summary Panel */}
      <FinancialSummaryPanel className="w-full" />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("common:filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("common:search")}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("financialPage:filter.searchPlaceholder")}
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("financialPage:filter.sourceTypeLabel")}</label>
              <Select
                value={filters.source_type || "all"}
                onValueChange={(value) => handleFilterChange("source_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("common:all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common:all")}</SelectItem>
                  <SelectItem value="campaign">{t("financialPage:filter.sourceTypeOptions.campaign")}</SelectItem>
                  <SelectItem value="contact">{t("financialPage:filter.sourceTypeOptions.contact")}</SelectItem>
                  <SelectItem value="scraper">{t("financialPage:filter.sourceTypeOptions.scraper")}</SelectItem>
                  <SelectItem value="subscription">{t("financialPage:filter.sourceTypeOptions.subscription")}</SelectItem>
                  <SelectItem value="manual">{t("financialPage:filter.sourceTypeOptions.manual")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("financialPage:filter.typeLabel")}</label>
              <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("common:all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common:all")}</SelectItem>
                  <SelectItem value="revenue">{t("financialPage:types.revenue")}</SelectItem>
                  <SelectItem value="cost">{t("financialPage:types.cost")}</SelectItem>
                  <SelectItem value="expense">{t("financialPage:types.expense")}</SelectItem>
                  <SelectItem value="refund">{t("financialPage:types.refund")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("financialPage:filter.currencyLabel")}</label>
              <Select
                value={filters.currency || "all"}
                onValueChange={(value) => handleFilterChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("common:all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign ROI Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("financialPage:campaignROITable.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t("financialPage:campaignROITable.headers.campaign")}</th>
                  <th className="text-right p-2">{t("financialPage:campaignROITable.headers.revenue")}</th>
                  <th className="text-right p-2">{t("financialPage:campaignROITable.headers.costs")}</th>
                  <th className="text-right p-2">{t("financialPage:campaignROITable.headers.netProfit")}</th>
                  <th className="text-right p-2">{t("financialPage:campaignROITable.headers.roi")}</th>
                </tr>
              </thead>
              <tbody>
                {campaignROI.map((campaign) => (
                  <tr key={campaign.campaign_id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{campaign.campaign_name}</td>
                    <td className="p-2 text-right text-green-600">{formatCurrency(campaign.total_revenue)}</td>
                    <td className="p-2 text-right text-red-600">{formatCurrency(campaign.total_costs)}</td>
                    <td
                      className={`p-2 text-right font-semibold ${campaign.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(campaign.net_profit)}
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {campaign.roi_percentage >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={campaign.roi_percentage >= 0 ? "text-green-600" : "text-red-600"}>
                          {campaign.roi_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("financialPage:recordsTable.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t("common:date")}</th>
                  <th className="text-left p-2">{t("common:type")}</th>
                  <th className="text-left p-2">{t("financialPage:recordsTable.headers.source")}</th>
                  <th className="text-right p-2">{t("financialPage:recordsTable.headers.amount")}</th>
                  <th className="text-left p-2">{t("financialPage:recordsTable.headers.category")}</th>
                  <th className="text-left p-2">{t("common:description")}</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(record.recorded_at), "MMM dd, yyyy")}
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={getTypeColor(record.type)}>{t(`financialPage:types.${record.type}`)}</Badge>
                    </td>
                    <td className="p-2 capitalize">{record.source_type}</td>
                    <td
                      className={`p-2 text-right font-semibold ${
                        record.type === "revenue" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(record.amount, record.currency)}
                    </td>
                    <td className="p-2">{record.category || "-"}</td>
                    <td className="p-2 text-muted-foreground max-w-xs truncate">{record.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
