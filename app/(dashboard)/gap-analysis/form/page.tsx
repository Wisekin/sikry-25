"use client"

import React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { ArrowRightIcon as RightArrow } from "lucide-react"
import Link from "next/link"
import type { AssessmentQuestion, GapAnalysis } from "@/src/types/gap-analysis"
import {
  Brain,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Download,
  Send,
  RefreshCw,
  ArrowLeft,
  Building,
  Users,
  Target,
  Zap,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Progress } from "@/src/components/ui/progress"
import { Badge } from "@/src/components/ui/badge"
import { useTranslation } from 'react-i18next';

export default function GapAnalysisFormPage() {
  const { t } = useTranslation('gapAnalysisFormPage');
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [analysisTitle, setAnalysisTitle] = useState("")
  const [industry, setIndustry] = useState("")
  const [analysisDescription, setAnalysisDescription] = useState("")
  const [marketSize, setMarketSize] = useState("")
  const [geography, setGeography] = useState("")
  const [competitor1, setCompetitor1] = useState("")
  const [competitor2, setCompetitor2] = useState("")
  const [deepScan, setDeepScan] = useState(false)
  const [aiRecommendations, setAiRecommendations] = useState(true)
  const [generateSalesLetter, setGenerateSalesLetter] = useState(true)

  const assessmentQuestions: AssessmentQuestion[] = [
    {
      id: "current_revenue",
      category: "Business Performance",
      question: "What is your current annual revenue?",
      type: "multiple_choice",
      options: ["Under $100K", "$100K-$500K", "$500K-$1M", "$1M-$5M", "Over $5M"],
      weight: 1.0,
      required: true,
    },
    {
      id: "growth_rate",
      category: "Business Performance",
      question: "What has been your average growth rate over the past 2 years?",
      type: "scale",
      weight: 1.0,
      required: true,
      help_text: "Rate from 1 (declining) to 5 (rapid growth)",
    },
    {
      id: "technology_stack",
      category: "Technology",
      question: "How would you rate your current technology infrastructure?",
      type: "scale",
      weight: 1.2,
      required: true,
      help_text: "1 = Outdated, 5 = Cutting-edge",
    },
    {
      id: "automation_level",
      category: "Technology",
      question: "What percentage of your processes are automated?",
      type: "multiple_choice",
      options: ["0-20%", "21-40%", "41-60%", "61-80%", "81-100%"],
      weight: 1.1,
      required: true,
    },
    {
      id: "team_size",
      category: "Operations",
      question: "How many full-time employees do you have?",
      type: "number",
      weight: 0.8,
      required: true,
    },
    {
      id: "biggest_challenge",
      category: "Operations",
      question: "What is your biggest operational challenge?",
      type: "multiple_choice",
      options: [
        "Lead generation",
        "Sales conversion",
        "Customer retention",
        "Process efficiency",
        "Technology limitations",
        "Team productivity",
      ],
      weight: 1.3,
      required: true,
    },
    {
      id: "marketing_channels",
      category: "Marketing",
      question: "Which marketing channels do you currently use?",
      type: "multiple_choice",
      options: [
        "Social media",
        "Email marketing",
        "Content marketing",
        "Paid advertising",
        "SEO",
        "Referrals",
        "Events/Networking",
      ],
      weight: 1.0,
      required: false,
    },
    {
      id: "customer_satisfaction",
      category: "Customer Experience",
      question: "How would you rate your customer satisfaction?",
      type: "scale",
      weight: 1.1,
      required: true,
      help_text: "1 = Poor, 5 = Excellent",
    },
  ]

  const categories = Array.from(new Set(assessmentQuestions.map((q) => q.category)))
  const questionsPerStep = Math.ceil(assessmentQuestions.length / 4)
  const totalSteps = Math.ceil(assessmentQuestions.length / questionsPerStep) + 1

  const getCurrentStepQuestions = () => {
    const start = currentStep * questionsPerStep
    const end = start + questionsPerStep
    return assessmentQuestions.slice(start, end)
  }

  const handleResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_type: "business_assessment",
          responses,
          snapshot_data: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
          },
          analysis_title: analysisTitle,
          industry: industry,
          analysis_description: analysisDescription,
          market_size: marketSize,
          geography: geography,
          competitor1: competitor1,
          competitor2: competitor2,
          deep_scan: deepScan,
          ai_recommendations: aiRecommendations,
          generate_letter: generateSalesLetter,
        }),
      })

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error submitting analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSalesLetterFunction = async () => {
    if (!analysis) return

    setGenerating(true)
    try {
      const response = await fetch(`/api/gap-analysis/${analysis.id}/generate-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
        }),
      })

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error generating letter:", error)
    } finally {
      setGenerating(false)
    }
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  const categoryIcons = {
    "Business Performance": Building,
    Technology: Zap,
    Operations: Users,
    Marketing: Target,
    "Customer Experience": TrendingUp,
  }

  if (analysis && currentStep === totalSteps - 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1B1F3B] dark:to-[#2A3050] p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white dark:bg-[#2A3050] rounded-xl shadow-lg border border-slate-200 dark:border-[#3C4568] p-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/gap-analysis">
                <Button variant="outline" className="border-[#3C4568]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1B1F3B] dark:text-white">Assessment Complete</h1>
                <p className="text-slate-600 dark:text-slate-300">Your business analysis has been processed</p>
              </div>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-slate-200 dark:border-[#3C4568] bg-gradient-to-r from-white to-blue-50 dark:from-[#2A3050] dark:to-[#1B1F3B]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-[#1B1F3B] dark:text-white">Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-[#1B1F3B] dark:text-white mb-4">
                  {analysis.overall_score.toFixed(1)}/5.0
                </div>
                <Progress value={(analysis.overall_score / 5) * 100} className="h-3 bg-slate-200 dark:bg-[#3C4568]" />
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-slate-200 dark:border-[#3C4568] bg-gradient-to-r from-white to-green-50 dark:from-[#2A3050] dark:to-[#1B1F3B]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-[#1B1F3B] dark:text-white">Priority Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.priority_areas.slice(0, 3).map((area) => (
                    <Badge
                      key={area}
                      variant="outline"
                      className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"
                    >
                      {area.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-slate-200 dark:border-[#3C4568] bg-gradient-to-r from-white to-purple-50 dark:from-[#2A3050] dark:to-[#1B1F3B]">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-[#1B1F3B] dark:text-white">
                  Improvement Potential
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-lg font-semibold text-[#1B1F3B] dark:text-white">High Potential</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Significant growth opportunities identified
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="border-slate-200 dark:border-[#3C4568] bg-white dark:bg-[#2A3050] shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1B1F3B] dark:text-white">Category Breakdown</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Detailed analysis across business dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(analysis.gap_scores).map(([category, score]) => (
                  <div key={category} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-[#1B1F3B] dark:text-white capitalize">
                          {category.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-[#1B1F3B] dark:text-white">
                        {(score as number).toFixed(1)}/5.0
                      </span>
                    </div>
                    <Progress value={((score as number) / 5) * 100} className="h-3 bg-slate-200 dark:bg-[#3C4568]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI-Generated Sales Letter */}
          <Card className="border-slate-200 dark:border-[#3C4568] bg-white dark:bg-[#2A3050] shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-[#1B1F3B] dark:text-white">Personalized Sales Letter</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      AI-generated based on your assessment results
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={generateSalesLetterFunction}
                    disabled={generating}
                    className="border-[#3C4568] text-[#1B1F3B] dark:text-white"
                  >
                    {generating ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    {analysis.generated_letter ? "Regenerate" : "Generate"} Letter
                  </Button>
                  {analysis.generated_letter && (
                    <>
                      <Button variant="outline" className="border-[#3C4568]">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button className="bg-gradient-to-r from-[#1B1F3B] to-[#2A3050] hover:from-[#2A3050] hover:to-[#3C4568] text-white">
                        <Send className="h-4 w-4 mr-2" />
                        Send Letter
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analysis.generated_letter ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-slate-50 to-white dark:from-[#1B1F3B] dark:to-[#2A3050] p-6 rounded-lg border border-slate-200 dark:border-[#3C4568]">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-[#1B1F3B] dark:text-white leading-relaxed">
                      {analysis.generated_letter}
                    </pre>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                    >
                      {analysis.ai_provider}
                    </Badge>
                    <span>•</span>
                    <span>
                      Generated{" "}
                      {analysis.last_regenerated_at
                        ? new Date(analysis.last_regenerated_at).toLocaleString()
                        : "just now"}
                    </span>
                    {analysis.regeneration_count > 0 && (
                      <>
                        <span>•</span>
                        <span>{analysis.regeneration_count} regenerations</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1B1F3B] dark:text-white mb-2">Ready to Generate</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                    Click "Generate Letter" to create a personalized sales letter based on your assessment
                  </p>
                  <Button
                    onClick={generateSalesLetterFunction}
                    disabled={generating}
                    className="bg-gradient-to-r from-[#1B1F3B] to-[#2A3050] hover:from-[#2A3050] hover:to-[#3C4568] text-white"
                  >
                    {generating ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Brain className="h-4 w-4 mr-2" />
                    )}
                    Generate Letter
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-slate-200 dark:border-[#3C4568] bg-white dark:bg-[#2A3050] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-[#1B1F3B] dark:text-white">Strategic Recommendations</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    Key areas for improvement based on your assessment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.priority_areas.map((area, index) => (
                  <div
                    key={area}
                    className="flex gap-4 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-[#1B1F3B] dark:to-[#2A3050] rounded-lg border border-slate-200 dark:border-[#3C4568]"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#1B1F3B] to-[#2A3050] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-[#1B1F3B] dark:text-white capitalize mb-2">
                        {area.replace("_", " ")}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300">
                        Focus on improving your {area.replace("_", " ")} to drive better business results and
                        competitive advantage
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-6">
            <Link href="/gap-analysis">
              <Button variant="outline" className="border-[#3C4568] text-[#1B1F3B] dark:text-white px-8 py-3">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/gap-analysis/form">
              <Button variant="outline" className="border-[#3C4568] text-[#1B1F3B] dark:text-white px-8 py-3">
                Start New Assessment
              </Button>
            </Link>
            <Button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-[#1B1F3B] to-[#2A3050] hover:from-[#2A3050] hover:to-[#3C4568] text-white px-8 py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1B1F3B] dark:to-[#2A3050] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-[#2A3050] rounded-xl shadow-lg border border-slate-200 dark:border-[#3C4568] p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/gap-analysis">
              <Button variant="outline" className="border-[#3C4568]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1B1F3B] dark:text-white">Business Gap Analysis</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Step {currentStep + 1} of {totalSteps} - Answer questions to get personalized insights
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="text-right">
              <div className="text-3xl font-bold text-[#1B1F3B] dark:text-white">{Math.round(progress)}%</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-slate-200 dark:bg-[#3C4568]" />
        </div>

        {/* Market Analysis Parameters */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Market Analysis Parameters</CardTitle>
            <CardDescription>Define the scope and focus of your gap analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Analysis Title</Label>
                <Input
                  id="title"
                  placeholder="E.g., Enterprise Software Market Analysis"
                  value={analysisTitle}
                  onChange={(e) => setAnalysisTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Analysis Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and goals of this gap analysis..."
                rows={4}
                value={analysisDescription}
                onChange={(e) => setAnalysisDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="market-size">Market Size</Label>
                <Select value={marketSize} onChange={(e) => setMarketSize(e.target.value)}>
                  <SelectTrigger id="market-size">
                    <SelectValue placeholder="Select market size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (&lt; $1M)</SelectItem>
                    <SelectItem value="medium">Medium ($1M - $10M)</SelectItem>
                    <SelectItem value="large">Large ($10M - $100M)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (&gt; $100M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="geography">Geographic Focus</Label>
                <Select value={geography} onChange={(e) => setGeography(e.target.value)}>
                  <SelectTrigger id="geography">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                    <SelectItem value="latin-america">Latin America</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Competitive Analysis</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="competitor1">Primary Competitor</Label>
                  <Input
                    id="competitor1"
                    placeholder="Competitor name"
                    value={competitor1}
                    onChange={(e) => setCompetitor1(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="competitor2">Secondary Competitor</Label>
                  <Input
                    id="competitor2"
                    placeholder="Competitor name"
                    value={competitor2}
                    onChange={(e) => setCompetitor2(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Analysis Options</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="deep-scan">Deep Market Scan</Label>
                    <p className="text-sm text-muted-foreground">
                      Perform an extensive analysis of market trends and patterns
                    </p>
                  </div>
                  <Switch id="deep-scan" checked={deepScan} onCheckedChange={setDeepScan} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-recommendations">AI Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Include AI-powered strategic recommendations</p>
                  </div>
                  <Switch
                    id="ai-recommendations"
                    defaultChecked
                    checked={aiRecommendations}
                    onCheckedChange={setAiRecommendations}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="generate-letter">Generate Sales Letter</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create a sales letter based on findings
                    </p>
                  </div>
                  <Switch
                    id="generate-letter"
                    defaultChecked
                    checked={generateSalesLetter}
                    onCheckedChange={setGenerateSalesLetter}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => console.log("Save Draft")}>
              Save Draft
            </Button>
            <Link href="/gap-analysis/results">
              <Button className="bg-[#2A3050] hover:bg-[#3C4568]" onClick={handleSubmit} disabled={loading}>
                Run Analysis
                <RightArrow className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Questions */}
        {currentStep < totalSteps - 1 && (
          <Card className="border-slate-200 dark:border-[#3C4568] bg-white dark:bg-[#2A3050] shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                {getCurrentStepQuestions()[0] && (
                  <>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                      {React.createElement(
                        categoryIcons[getCurrentStepQuestions()[0].category as keyof typeof categoryIcons] || Target,
                        { className: "h-8 w-8 text-white" },
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-[#1B1F3B] dark:text-white">
                        {getCurrentStepQuestions()[0]?.category}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-300">
                        Please answer the following questions about your business
                      </CardDescription>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {getCurrentStepQuestions().map((question) => (
                <div
                  key={question.id}
                  className="space-y-4 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-[#1B1F3B] dark:to-[#2A3050] rounded-lg border border-slate-200 dark:border-[#3C4568]"
                >
                  <div>
                    <Label className="text-lg font-semibold text-[#1B1F3B] dark:text-white">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {question.help_text && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{question.help_text}</p>
                    )}
                  </div>

                  {question.type === "scale" && (
                    <RadioGroup
                      value={responses[question.id]?.toString() || ""}
                      onValueChange={(value) => handleResponse(question.id, Number.parseInt(value))}
                    >
                      <div className="flex justify-between">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <div key={value} className="flex flex-col items-center gap-3">
                            <RadioGroupItem
                              value={value.toString()}
                              id={`${question.id}-${value}`}
                              className="w-6 h-6"
                            />
                            <Label
                              htmlFor={`${question.id}-${value}`}
                              className="text-lg font-semibold text-[#1B1F3B] dark:text-white"
                            >
                              {value}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-2">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "multiple_choice" && (
                    <RadioGroup
                      value={responses[question.id] || ""}
                      onValueChange={(value) => handleResponse(question.id, value)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {question.options?.map((option) => (
                          <div
                            key={option}
                            className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-[#3C4568] rounded-lg hover:bg-slate-50 dark:hover:bg-[#3C4568] transition-colors"
                          >
                            <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                            <Label
                              htmlFor={`${question.id}-${option}`}
                              className="text-[#1B1F3B] dark:text-white cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "number" && (
                    <Input
                      type="number"
                      value={responses[question.id] || ""}
                      onChange={(e) => handleResponse(question.id, Number.parseInt(e.target.value))}
                      placeholder="Enter number"
                      className="text-lg p-4 border-slate-300 dark:border-[#3C4568] bg-slate-50 dark:bg-[#1B1F3B]"
                    />
                  )}

                  {question.type === "text" && (
                    <Textarea
                      value={responses[question.id] || ""}
                      onChange={(e) => handleResponse(question.id, e.target.value)}
                      placeholder="Enter your response"
                      className="text-lg p-4 border-slate-300 dark:border-[#3C4568] bg-slate-50 dark:bg-[#1B1F3B]"
                    />
                  )}

                  {question.type === "boolean" && (
                    <div className="flex items-center space-x-3 p-4 border border-slate-200 dark:border-[#3C4568] rounded-lg">
                      <Checkbox
                        id={question.id}
                        checked={responses[question.id] || false}
                        onCheckedChange={(checked) => handleResponse(question.id, checked)}
                        className="w-6 h-6"
                      />
                      <Label htmlFor={question.id} className="text-lg text-[#1B1F3B] dark:text-white cursor-pointer">
                        Yes
                      </Label>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-[#3C4568] text-[#1B1F3B] dark:text-white px-8 py-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps - 2 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#1B1F3B] to-[#2A3050] hover:from-[#2A3050] hover:to-[#3C4568] text-white px-8 py-3"
            >
              Next
              <RightArrow className="h-4 w-4 ml-2" />
            </Button>
          ) : currentStep === totalSteps - 2 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Complete Analysis
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
