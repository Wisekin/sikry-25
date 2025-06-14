"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { getCommunications } from "@/src/actions/communications"
import { CommunicationsTable } from "@/src/components/communications/CommunicationsTable"
import { CommunicationFilters } from "@/src/components/communications/CommunicationFilters"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Plus } from "lucide-react"
import type { Communication } from "@/src/types/database"

export default function CommunicationsPage() {
  const { t } = useTranslation('commsPage')
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadCommunications()
  }, [activeTab])

  const loadCommunications = async () => {
    try {
      setLoading(true)
      const filters = activeTab !== "all" ? { status: activeTab } : undefined
      const data = await getCommunications(filters)
      setCommunications(data)
    } catch (error) {
      console.error("Failed to load communications:", error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: communications.length,
    sent: communications.filter((c) => c.status === "sent").length,
    delivered: communications.filter((c) => c.status === "delivered").length,
    opened: communications.filter((c) => c.status === "read").length,
    replied: communications.filter((c) => c.status === "answered").length,
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('header.title')}</h1>
          <p className="text-muted-foreground">{t('header.description')}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('header.newButton')}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('stats.sent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('stats.delivered')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('stats.opened')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.opened}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t('stats.replied')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.replied}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="pending">{t('tabs.pending')}</TabsTrigger>
          <TabsTrigger value="sent">{t('tabs.sent')}</TabsTrigger>
          <TabsTrigger value="delivered">{t('tabs.delivered')}</TabsTrigger>
          <TabsTrigger value="read">{t('tabs.opened')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <CommunicationFilters />
          {loading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : (
            <CommunicationsTable communications={communications} onRefresh={loadCommunications} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
