"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/src/components/core/layout/AppShell"
import { Heading } from "@/src/components/core/typography/Heading"
import { Text } from "@/src/components/core/typography/Text"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Progress } from "@/src/components/ui/progress"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import { useTranslation } from 'react-i18next'
import { getScrapers, getScraperStats, updateScraperStatus, executeScraper } from "@/lib/actions/scrapers"
import Link from "next/link"

interface Scraper {
  id: string
  name: string
  type: string
  url: string
  status: "active" | "inactive" | "running" | "error"
  last_run: string | null
  success_rate: number
  total_runs: number
  config: any
  created_at: string
  updated_at: string
}

interface ScraperStats {
  activeScrapers: number
  successRate: number
  totalJobs: number
  v2Scrapers: number
}

export default function ScrapersPage() {
  const { t } = useTranslation(['scrapersPage', 'common'])
  const [scrapers, setScrapers] = useState<Scraper[]>([])
  const [stats, setStats] = useState<ScraperStats>({
    activeScrapers: 0,
    successRate: 0,
    totalJobs: 0,
    v2Scrapers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [scrapersData, statsData] = await Promise.all([getScrapers(), getScraperStats()])
      setScrapers(scrapersData || [])
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load scrapers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateScraperStatus(id, newStatus)
      await loadData() // Reload data
    } catch (error) {
      console.error("Failed to update scraper status:", error)
    }
  }

  const handleExecute = async (id: string, url: string) => {
    try {
      await executeScraper(id, url)
      await loadData() // Reload data
    } catch (error) {
      console.error("Failed to execute scraper:", error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "running":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "inactive":
        return "bg-gray-50 text-gray-700 border-gray-200"
      case "error":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
      case "running":
        return <ClockIcon className="w-4 h-4 text-blue-600" />
      case "error":
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
      default:
        return <PauseIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredScrapers = scrapers.filter((scraper) => {
    const matchesSearch =
      scraper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scraper.url.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || scraper.status === statusFilter
    const matchesType = typeFilter === "all" || scraper.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <Text className="ml-2">{t('loading', { ns: 'scrapersPage' })}</Text>
        </div>
      </AppShell>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1}>{t('title', { ns: 'scrapersPage' })}</Heading>
          <Text className="text-muted-foreground">{t('description', { ns: 'scrapersPage' })}</Text>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/scrapers/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            {t('createScraper', { ns: 'scrapersPage' })}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('activeScrapers', { ns: 'scrapersPage' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.activeScrapers}</div>
            <Text size="sm" className="text-emerald-600">
              {t('currentlyRunning', { ns: 'scrapersPage' })}
            </Text>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('successRate', { ns: 'scrapersPage' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <Progress value={stats.successRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('totalJobs', { ns: 'scrapersPage' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <Text size="sm" className="text-muted-foreground">
              {t('last24Hours', { ns: 'scrapersPage' })}
            </Text>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('v2Scrapers', { ns: 'scrapersPage' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.v2Scrapers}</div>
            <Text size="sm" className="text-muted-foreground">
              {t('nextGenScrapers', { ns: 'scrapersPage' })}
            </Text>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-sm border border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartBarIcon className="w-4 h-4 mr-2" />
            {t('scraperManagement', { ns: 'scrapersPage' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder', { ns: 'scrapersPage' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <FunnelIcon className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('filterByStatus', { ns: 'scrapersPage' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses', { ns: 'scrapersPage' })}</SelectItem>
                <SelectItem value="active">{t('status.active', { ns: 'scrapersPage' })}</SelectItem>
                <SelectItem value="inactive">{t('status.inactive', { ns: 'scrapersPage' })}</SelectItem>
                <SelectItem value="running">{t('status.running', { ns: 'scrapersPage' })}</SelectItem>
                <SelectItem value="error">{t('status.error', { ns: 'scrapersPage' })}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('filterByType', { ns: 'scrapersPage' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes', { ns: 'scrapersPage' })}</SelectItem>
                <SelectItem value="v1">{t('v1', { ns: 'scrapersPage' })}</SelectItem>
                <SelectItem value="v2">{t('v2', { ns: 'scrapersPage' })}</SelectItem>
                <SelectItem value="api">{t('api', { ns: 'scrapersPage' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scrapers Table */}
          <div className="space-y-4">
            {filteredScrapers.length === 0 ? (
              <div className="text-center py-8">
                <Text className="text-muted-foreground">{t('noScrapers', { ns: 'scrapersPage' })}</Text>
                <Button asChild className="mt-4">
                  <Link href="/scrapers/new">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    {t('createFirstScraper', { ns: 'scrapersPage' })}
                  </Link>
                </Button>
              </div>
            ) : (
              filteredScrapers.map((scraper) => (
                <div
                  key={scraper.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                      {getStatusIcon(scraper.status)}
                    </div>
                    <div>
                      <div className="font-medium">{scraper.name}</div>
                      <Text size="sm" className="text-muted-foreground">
                        {scraper.url}
                      </Text>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {scraper.type.toUpperCase()}
                        </Badge>
                        <Text size="sm" className="text-muted-foreground">
                          {scraper.total_runs} runs • {scraper.success_rate}% success
                        </Text>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getStatusBadgeColor(scraper.status)}>
                      {t(`scrapers.${scraper.status}`, { ns: 'scrapersPage' })}
                    </Badge>
                    <Text size="sm" className="text-muted-foreground w-24">
                      {scraper.last_run ? new Date(scraper.last_run).toLocaleDateString() : "Never"}
                    </Text>
                    <div className="flex items-center gap-2">
                      {scraper.status === "inactive" && (
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(scraper.id, "active")}>
                          <PlayIcon className="w-3 h-3" />
                        </Button>
                      )}
                      {scraper.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => handleExecute(scraper.id, scraper.url)}>
                          <PlayIcon className="w-3 h-3" />
                        </Button>
                      )}
                      {scraper.status === "running" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(scraper.id, "inactive")}
                        >
                          <StopIcon className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/scrapers/${scraper.id}/configure`}>
                          <Cog6ToothIcon className="w-3 h-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
