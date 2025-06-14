"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Progress } from "@/src/components/ui/progress"
import { Badge } from "@/src/components/ui/badge"
import { Brain, TrendingUp, CheckCircle, Lightbulb, Download, Send, RefreshCw, FileText } from "lucide-react"
import type { AssessmentQuestion, GapAnalysis } from "@/src/types/gap-analysis"
import { createMockApiResponse } from "@/src/utils/mockApiUtils"

interface GapAnalysisFormProps {
  contactId?: string
  companyId?: string
  onComplete?: (analysis: GapAnalysis) => void
}

export function GapAnalysisForm({ contactId, companyId, onComplete }: GapAnalysisFormProps) {
  const { t } = useTranslation("gapAnalysisPage")
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

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
  ]

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const mockAnalysis: GapAnalysis = {
        id: "mock-analysis-1",
        overall_score: 75,
        priority_areas: ["technology_stack", "automation_level"],
        generated_letter: null,
        last_regenerated_at: null,
        regeneration_count: 0,
      }
      const result = await createMockApiResponse(mockAnalysis)
      setAnalysis(result)
      setCurrentStep(categories.length)
      onComplete?.(result)
    } catch (error) {
      console.error("Failed to submit analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateLetter = async () => {
    if (!analysis) return
    setGenerating(true)
    try {
      const mockLetter = "Based on our analysis, we recommend focusing on improving your technology infrastructure and increasing process automation..."
      const result = await createMockApiResponse({
        ...analysis,
        generated_letter: mockLetter,
        last_regenerated_at: new Date().toISOString(),
        regeneration_count: (analysis.regeneration_count || 0) + 1,
      })
      setAnalysis(result)
    } catch (error) {
      console.error("Failed to generate letter:", error)
    } finally {
      setGenerating(false)
    }
  }

  const categories = [...new Set(assessmentQuestions.map((q) => q.category))]
  const totalSteps = categories.length + 1 // +1 for the results page

  const progress = totalSteps > 1 ? (currentStep / (categories.length)) * 100 : 0

  const getCurrentStepQuestions = () => {
    if (currentStep < categories.length) {
      const category = categories[currentStep]
      return assessmentQuestions.filter((q) => q.category === category)
    }
    return []
  }

  const handleResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Results View
  if (currentStep === totalSteps - 1 && analysis) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t("results.title")}</h1>
          <p className="text-muted-foreground">{t("results.description")}</p>
        </div>

        <Card className="text-center">
          <CardHeader>
            <CardTitle>{t("results.overallScore")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold text-primary">{analysis.overall_score}</div>
            <p className="text-muted-foreground mt-2">{t("results.outOf100")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>{t("results.generatedLetterTitle")}</CardTitle>
                <CardDescription>{t("results.generatedLetterDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analysis.generated_letter ? (
              <div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">{analysis.generated_letter}</div>
                <div className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={generateLetter} disabled={generating}>
                    {generating ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {t("results.regenerateButton")}
                  </Button>
                  <span>
                    {t("results.generated")}{" "}
                    {analysis.last_regenerated_at
                      ? new Date(analysis.last_regenerated_at).toLocaleString()
                      : t("results.justNow")}
                  </span>
                  {analysis.regeneration_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{t("results.regenerations", { count: analysis.regeneration_count })}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">{t("results.readyTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("results.readyDescription")}</p>
                <Button onClick={generateLetter} disabled={generating}>
                  {generating ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  {t("results.generateButton")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle>{t("results.recommendationsTitle")}</CardTitle>
                <CardDescription>{t("results.recommendationsDescription")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.priority_areas.map((area, index) => (
                <div key={area} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium capitalize">{area.replace(/_/g, " ")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("results.focusMessage", { area: area.replace(/_/g, " ") })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => setCurrentStep(0)}>
            {t("results.newAssessmentButton")}
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            {t("results.exportButton")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("header.title")}</CardTitle>
              <CardDescription>
                {t("header.step", { currentStep: currentStep + 1, totalSteps: categories.length })}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              <div className="text-xs text-muted-foreground">{t("header.complete")}</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {currentStep < categories.length && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{getCurrentStepQuestions()[0]?.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {getCurrentStepQuestions().map((question) => (
              <div key={question.id} className="space-y-3">
                <div>
                  <Label className="text-base font-medium">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {question.help_text && <p className="text-sm text-muted-foreground mt-1">{question.help_text}</p>}
                </div>

                {question.type === "scale" && (
                  <>
                    <RadioGroup
                      value={responses[question.id]?.toString() || ""}
                      onValueChange={(value) => handleResponse(question.id, Number.parseInt(value))}
                      className="flex justify-between"
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="flex flex-col items-center gap-2">
                          <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                          <Label htmlFor={`${question.id}-${value}`} className="text-xs">
                            {value}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t("questions.scalePoor")}</span>
                      <span>{t("questions.scaleExcellent")}</span>
                    </div>
                  </>
                )}

                {question.type === "multiple_choice" && (
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponse(question.id, value)}
                  >
                    {question.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                        <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "number" && (
                  <Input
                    type="number"
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponse(question.id, e.target.value ? Number.parseInt(e.target.value) : "")}
                    placeholder={t("form.numberPlaceholder")}
                  />
                )}

                {question.type === "text" && (
                  <Textarea
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponse(question.id, e.target.value)}
                    placeholder={t("form.responsePlaceholder")}
                  />
                )}

                {question.type === "boolean" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={question.id}
                      checked={!!responses[question.id]}
                      onCheckedChange={(checked) => handleResponse(question.id, checked)}
                    />
                    <Label htmlFor={question.id}>{t("questions.booleanYes")}</Label>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          {t("navigation.previous")}
        </Button>

        {currentStep < categories.length - 1 ? (
          <Button onClick={handleNext}>{t("navigation.next")}</Button>
        ) : currentStep === categories.length - 1 ? (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            {t("navigation.completeAnalysis")}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
