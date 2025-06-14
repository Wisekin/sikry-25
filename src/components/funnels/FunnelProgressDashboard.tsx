"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Users, TrendingUp, Clock, CheckCircle, XCircle, Pause, Play, MoreHorizontal, Filter } from "lucide-react"
import type { FunnelProgress, Funnel } from "@/src/types/funnels"

interface FunnelProgressDashboardProps {
  funnelId: string
}

export function FunnelProgressDashboard({ funnelId }: FunnelProgressDashboardProps) {
  const [funnel, setFunnel] = useState<Funnel | null>(null)
  const [progress, setProgress] = useState<FunnelProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    loadFunnelData()
  }, [funnelId, filter])

  const loadFunnelData = async () => {
    try {
      setLoading(true)

      // Load funnel details
      const funnelResponse = await fetch(`/api/funnels/${funnelId}`)
      const funnelData = await funnelResponse.json()
      setFunnel(funnelData.funnel)

      // Load progress data
      const progressResponse = await fetch(
        `/api/funnels/${funnelId}/progress${filter !== "all" ? `?status=${filter}` : ""}`,
      )
      const progressData = await progressResponse.json()
      setProgress(progressData.progress)
    } catch (error) {
      console.error("Error loading funnel data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "dropped":
        return "bg-red-500"
      case "paused":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "dropped":
        return <XCircle className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const stats = {
    total: progress.length,
    active: progress.filter((p) => p.status === "active").length,
    completed: progress.filter((p) => p.status === "completed").length,
    dropped: progress.filter((p) => p.status === "dropped").length,
    avgProgress: progress.reduce((acc, p) => acc + p.progress_percentage, 0) / progress.length || 0,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading funnel data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{funnel?.name}</h2>
          <p className="text-muted-foreground">{funnel?.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button size="sm">Add Contacts</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In this funnel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently progressing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgProgress)}%</div>
            <Progress value={stats.avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Progress Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact Progress</CardTitle>
              <CardDescription>Track individual contact journeys through the funnel</CardDescription>
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="dropped">Dropped</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className={`p-2 rounded-full ${getStatusColor(item.status)} text-white`}>
                  {getStatusIcon(item.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {item.contact?.name || item.company?.name || "Unknown Contact"}
                    </p>
                    <Badge variant="outline" className="capitalize">
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round(item.progress_percentage)}%</span>
                      </div>
                      <Progress value={item.progress_percentage} className="h-2" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Started {new Date(item.started_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Score: {item.engagement_score.toFixed(1)}</Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {progress.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No contacts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add contacts to this funnel to start tracking their progress
                </p>
                <Button>Add Contacts</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
