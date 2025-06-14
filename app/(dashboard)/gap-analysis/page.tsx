"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Plus, Search, Brain, FileText, MoreHorizontal, Download, Send } from "lucide-react"
import type { GapAnalysis } from "@/src/types/gap-analysis"
import { GapAnalysisForm } from "@/src/components/gap-analysis/GapAnalysisForm"
import { useTranslation } from 'react-i18next';

export default function GapAnalysisPage() {
  const { t } = useTranslation('gapAnalysisPage');
  const [analyses, setAnalyses] = useState<GapAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadAnalyses()
  }, [activeTab])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gap-analysis${activeTab !== "all" ? `?status=${activeTab}` : ""}`)
      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (error) {
      console.error("Error loading analyses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnalysis = () => {
    setShowForm(true)
  }

  const handleAnalysisComplete = (analysis: GapAnalysis) => {
    setShowForm(false)
    loadAnalyses()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500"
      case "generated":
        return "bg-blue-500"
      case "sent":
        return "bg-green-500"
      case "responded":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600"
    if (score >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredAnalyses = analyses.filter(
    (analysis) =>
      analysis.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Gap Analysis</h1>
            <p className="text-muted-foreground">Create a personalized business assessment</p>
          </div>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Back to List
          </Button>
        </div>
        <GapAnalysisForm onComplete={handleAnalysisComplete} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('header.title')}</h1>
          <p className="text-muted-foreground">{t('header.subtitle')}</p>
        </div>
        <Button onClick={handleCreateAnalysis}>
          <Plus className="h-4 w-4 mr-2" /> {t('buttons.newAnalysis')}
        </Button>
      </div>

      {/* Search and Tabs */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search analyses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="generated">Generated</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="responded">Responded</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Analyses List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAnalyses.length > 0 ? (
        <div className="space-y-4">
          {filteredAnalyses.map((analysis) => (
            <Card key={analysis.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">
                        {analysis.contact?.name || analysis.company?.name || "Unknown Contact"}
                      </h3>
                      <Badge variant="outline" className={`${getStatusColor(analysis.status)} text-white`}>
                        {analysis.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="capitalize">{analysis.analysis_type.replace("_", " ")}</span>
                      <span>•</span>
                      <span>
                        Score:{" "}
                        <span className={getScoreColor(analysis.overall_score)}>
                          {analysis.overall_score.toFixed(1)}/5.0
                        </span>
                      </span>
                      <span>•</span>
                      <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                    </div>

                    {analysis.priority_areas.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {analysis.priority_areas.slice(0, 3).map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {area.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {analysis.generated_letter && (
                      <>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {analysis.generated_letter && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Generated Sales Letter</span>
                      <Badge variant="outline">{analysis.ai_provider}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {analysis.generated_letter.substring(0, 200)}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No gap analyses yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Create your first gap analysis to generate personalized sales letters
            </p>
            <Button onClick={handleCreateAnalysis}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
