"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Building2,
  TrendingUp,
  Users,
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { SmartSearchBar } from "@/components/smart-search-bar"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    {
      title: "Companies Discovered",
      value: "1,247",
      change: "+12%",
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Active Campaigns",
      value: "23",
      change: "+3",
      icon: Target,
      color: "text-emerald-600",
    },
    {
      title: "Response Rate",
      value: "68%",
      change: "+5%",
      icon: TrendingUp,
      color: "text-indigo-600",
    },
    {
      title: "Qualified Leads",
      value: "89",
      change: "+18",
      icon: Users,
      color: "text-purple-600",
    },
  ]

  const recentSearches = [
    { query: "Marketing agencies in Geneva", results: 45, timestamp: "2 hours ago" },
    { query: "SaaS companies Series A", results: 23, timestamp: "5 hours ago" },
    { query: "Fintech startups Switzerland", results: 67, timestamp: "1 day ago" },
    { query: "AI companies Europe", results: 156, timestamp: "2 days ago" },
  ]

  const campaignPerformance = [
    { name: "Q1 Outreach", sent: 450, opened: 312, replied: 89, status: "active" },
    { name: "Partnership Drive", sent: 230, opened: 187, replied: 45, status: "active" },
    { name: "Product Launch", sent: 180, opened: 134, replied: 23, status: "completed" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-800 to-green-700 bg-clip-text text-transparent">
                S-I-K-R-Y
              </span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium hover:text-green-700 transition-colors">
                Home
              </Link>
              <Link href="/search" className="text-sm font-medium hover:text-green-700 transition-colors">
                Search
              </Link>
              <span className="text-sm font-medium text-green-700">Dashboard</span>
              <Button size="sm">
                <Zap className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground mb-6">
            Here's what's happening with your business intelligence activities.
          </p>

          <div className="max-w-2xl">
            <SmartSearchBar placeholder="Quick search: 'Tech companies in Zurich'" showSuggestions={false} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-emerald-600 font-medium">{stat.change} from last month</p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${stat.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Searches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Recent Searches
                  </CardTitle>
                  <CardDescription>Your latest company discovery activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{search.query}</p>
                          <p className="text-xs text-muted-foreground">{search.timestamp}</p>
                        </div>
                        <Badge variant="secondary">{search.results} results</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/search">
                      <Search className="w-4 h-4 mr-2" />
                      New Search
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/search">
                      <Search className="w-4 h-4 mr-2" />
                      Start New Search
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Create Email Campaign
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Follow-ups
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Campaign Performance
                </CardTitle>
                <CardDescription>Track your outreach campaigns and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {campaignPerformance.map((campaign, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.sent} contacts • {Math.round((campaign.replied / campaign.sent) * 100)}% response
                            rate
                          </p>
                        </div>
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{campaign.sent}</p>
                          <p className="text-xs text-muted-foreground">Sent</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">{campaign.opened}</p>
                          <p className="text-xs text-muted-foreground">Opened</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">{campaign.replied}</p>
                          <p className="text-xs text-muted-foreground">Replied</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Response Rate</span>
                          <span>{Math.round((campaign.replied / campaign.sent) * 100)}%</span>
                        </div>
                        <Progress value={(campaign.replied / campaign.sent) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Search Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <PieChart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground">Detailed analytics and reporting features coming soon.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Email Open Rate</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Response Rate</span>
                        <span className="font-medium">24%</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Meeting Conversion</span>
                        <span className="font-medium">12%</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>Intelligent recommendations and market analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Insights Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Advanced market intelligence and personalized recommendations will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
