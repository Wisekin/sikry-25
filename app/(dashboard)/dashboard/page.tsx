"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Building2, MessageSquare, Bot, TrendingUp, Calendar, BarChart3, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from 'react-i18next';
import { getCompanies } from "@/src/actions/companies"
import { getCommunications } from "@/src/actions/communications"

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalCommunications: 0,
    activeScrapers: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [companies, communications] = await Promise.all([getCompanies(), getCommunications()])

      setStats({
        totalCompanies: companies.length,
        totalCommunications: communications.length,
        activeScrapers: 3, // This would come from scrapers API
        recentActivity: [],
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: t("companies.addNew"),
      description: t("companies.addNew"),
      icon: Building2,
      href: "/companies/new",
      color: "bg-blue-500",
    },
    {
      title: t("comms.newMessage"),
      description: t("comms.newMessage"),
      icon: MessageSquare,
      href: "/comms/new",
      color: "bg-green-500",
    },
    {
      title: t("scrapers.newScraper"),
      description: t("scrapers.newScraper"),
      icon: Bot,
      href: "/scrapers/new",
      color: "bg-purple-500",
    },
    {
      title: t("comms.newCampaign"),
      description: t("comms.newCampaign"),
      icon: Calendar,
      href: "/comms/campaigns/new",
      color: "bg-orange-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.welcome")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalCompanies")}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% {t("common.previous")} {t("pagination.page").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalCommunications")}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommunications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% {t("common.previous")} {t("pagination.page").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.activeScrapers")}</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeScrapers}</div>
            <p className="text-xs text-muted-foreground">{t("status.running")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.performance")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              +2% {t("common.previous")} {t("pagination.page").toLowerCase()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t("dashboard.quickActions")}
          </CardTitle>
          <CardDescription>{t("dashboard.quickActions")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push(action.href)}
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t("dashboard.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("companies.addNew")}</p>
                  <p className="text-xs text-muted-foreground">2 {t("common.previous")} minutes</p>
                </div>
                <Badge variant="outline">{t("status.completed")}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("comms.newMessage")}</p>
                  <p className="text-xs text-muted-foreground">5 {t("common.previous")} minutes</p>
                </div>
                <Badge variant="outline">{t("status.sent")}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("scrapers.run")}</p>
                  <p className="text-xs text-muted-foreground">10 {t("common.previous")} minutes</p>
                </div>
                <Badge variant="outline">{t("status.running")}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("dashboard.insights")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("companies.verified")}</span>
                <Badge className="bg-green-100 text-green-800">85%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("comms.deliveredAt")}</span>
                <Badge className="bg-blue-100 text-blue-800">92%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t("scrapers.active")}</span>
                <Badge className="bg-purple-100 text-purple-800">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
