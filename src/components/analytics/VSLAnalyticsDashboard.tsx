"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Eye, Clock, Mail, Phone, MessageSquare, Target, DollarSign } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AnalyticsData {
  vsl_performance: {
    total_pages: number
    total_views: number
    total_leads: number
    conversion_rate: number
    avg_watch_time: number
    top_performing_pages: Array<{
      page_name: string
      views: number
      leads: number
      conversion_rate: number
    }>
  }
  lead_response: {
    total_leads: number
    responded_within_sla: number
    avg_response_time: number
    success_rate: number
    channel_performance: {
      email: { sent: number; opened: number; clicked: number }
      sms: { sent: number; replied: number }
      calls: { attempted: number; answered: number }
    }
  }
  funnel_performance: {
    active_funnels: number
    total_contacts: number
    completion_rate: number
    avg_conversion_time: number
  }
  revenue_attribution: {
    total_revenue: number
    vsl_attributed: number
    lead_response_attributed: number
    funnel_attributed: number
  }
}

export function VSLAnalyticsDashboard() {
  const { t } = useTranslation("analyticsDashboard")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return <div>{t('loading')}</div>
  }

  const chartData = [
    { name: "Mon", views: 120, leads: 12, conversions: 8 },
    { name: "Tue", views: 150, leads: 18, conversions: 12 },
    { name: "Wed", views: 180, leads: 22, conversions: 15 },
    { name: "Thu", views: 200, leads: 25, conversions: 18 },
    { name: "Fri", views: 170, leads: 20, conversions: 14 },
    { name: "Sat", views: 90, leads: 8, conversions: 5 },
    { name: "Sun", views: 110, leads: 10, conversions: 7 },
  ]

  const channelData = [
    { name: "Email", value: data.lead_response.channel_performance.email.sent, color: "#3B82F6" },
    { name: "SMS", value: data.lead_response.channel_performance.sms.sent, color: "#10B981" },
    { name: "Calls", value: data.lead_response.channel_performance.calls.attempted, color: "#F59E0B" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">{t('timeRanges.24h')}</SelectItem>
            <SelectItem value="7d">{t('timeRanges.7d')}</SelectItem>
            <SelectItem value="30d">{t('timeRanges.30d')}</SelectItem>
            <SelectItem value="90d">{t('timeRanges.90d')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('keyMetrics.totalPages.title')}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.vsl_performance.total_views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('keyMetrics.totalPages.change', { value: 12 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('keyMetrics.conversionRate.title')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.vsl_performance.conversion_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{t('keyMetrics.conversionRate.change', { value: 2.1 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('keyMetrics.avgResponseTime.title')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(data.lead_response.avg_response_time / 60)}m</div>
            <p className="text-xs text-muted-foreground">{t('keyMetrics.avgResponseTime.change', { value: 30 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('keyMetrics.revenueAttribution.title')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.revenue_attribution.total_revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('keyMetrics.revenueAttribution.change', { value: 18 })}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vsl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vsl">{t('tabs.vsl')}</TabsTrigger>
          <TabsTrigger value="lead-response">{t('tabs.leadResponse')}</TabsTrigger>
          <TabsTrigger value="funnels">{t('tabs.funnels')}</TabsTrigger>
          <TabsTrigger value="revenue">{t('tabs.revenue')}</TabsTrigger>
        </TabsList>

        <TabsContent value="vsl" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('vslPerformance.trend.title')}</CardTitle>
                <CardDescription>{t('vslPerformance.trend.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('vslPerformance.topPages.title')}</CardTitle>
                <CardDescription>{t('vslPerformance.topPages.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.vsl_performance.top_performing_pages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{page.page_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('vslPerformance.topPages.stats', { views: page.views, leads: page.leads })}
                        </p>
                      </div>
                      <Badge variant="secondary">{page.conversion_rate.toFixed(1)}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lead-response" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('leadResponse.performance.title')}</CardTitle>
                <CardDescription>{t('leadResponse.performance.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('leadResponse.performance.slaCompliance')}</span>
                    <span>
                      {Math.round((data.lead_response.responded_within_sla / data.lead_response.total_leads) * 100)}%
                    </span>
                  </div>
                  <Progress value={(data.lead_response.responded_within_sla / data.lead_response.total_leads) * 100} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{t('leadResponse.performance.successRate')}</span>
                    <span>{data.lead_response.success_rate.toFixed(1)}%</span>
                  </div>
                  <Progress value={data.lead_response.success_rate} />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <Mail className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium">{t('leadResponse.performance.email.label')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('leadResponse.performance.email.sent', { count: data.lead_response.channel_performance.email.sent })}
                    </p>
                  </div>
                  <div className="text-center">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">{t('leadResponse.performance.sms.label')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('leadResponse.performance.sms.sent', { count: data.lead_response.channel_performance.sms.sent })}
                    </p>
                  </div>
                  <div className="text-center">
                    <Phone className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm font-medium">{t('leadResponse.performance.calls.label')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('leadResponse.performance.calls.attempted', { count: data.lead_response.channel_performance.calls.attempted })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('leadResponse.distribution.title')}</CardTitle>
                <CardDescription>{t('leadResponse.distribution.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('funnels.active.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.funnel_performance.active_funnels}</div>
                <p className="text-sm text-muted-foreground">{t('funnels.active.description')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('funnels.contacts.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.funnel_performance.total_contacts.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">{t('funnels.contacts.description')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('funnels.completion.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.funnel_performance.completion_rate.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">{t('funnels.completion.description')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('revenue.attribution.title')}</CardTitle>
                <CardDescription>{t('revenue.attribution.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t('revenue.attribution.vsl')}</span>
                    <span className="font-bold">${data.revenue_attribution.vsl_attributed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('revenue.attribution.leadResponse')}</span>
                    <span className="font-bold">
                      ${data.revenue_attribution.lead_response_attributed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('revenue.attribution.funnels')}</span>
                    <span className="font-bold">${data.revenue_attribution.funnel_attributed.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold">{t('revenue.attribution.total')}</span>
                    <span className="font-bold">${data.revenue_attribution.total_revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('revenue.trend.title')}</CardTitle>
                <CardDescription>{t('revenue.trend.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversions" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
