"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { Badge } from "@/src/components/ui/badge"
import { useState } from "react"
import { Sparkles, Copy, Check } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function AISelector() {
  const { t } = useTranslation('scrapingPage')
  const [description, setDescription] = useState("")
  const [selectors, setSelectors] = useState<
    Array<{
      field: string
      selector: string
      confidence: number
    }>
  >([])
  const [generating, setGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateSelectors = async () => {
    setGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setSelectors([
        { field: "Company Name", selector: "h1.company-name, .company-title, [data-company-name]", confidence: 95 },
        { field: "Email", selector: "a[href^='mailto:'], .email, .contact-email", confidence: 92 },
        { field: "Phone", selector: ".phone, .tel, [href^='tel:']", confidence: 88 },
        { field: "Address", selector: ".address, .location, .contact-address", confidence: 85 },
      ])
      setGenerating(false)
    }, 3000)
  }

  const copySelector = async (selector: string, index: number) => {
    try {
      await navigator.clipboard.writeText(selector)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {t('aiSelector.title')}
        </CardTitle>
        <CardDescription>{t('aiSelector.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-caption font-medium mb-2 block">{t('aiSelector.prompt')}</label>
          <Textarea
            placeholder="I want to extract the company name, contact email, phone number, and office address from company websites..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24"
          />
        </div>

        <Button onClick={generateSelectors} disabled={!description.trim() || generating} className="w-full">
          <Sparkles className="w-4 h-4 mr-2" />
          {generating ? "Generating Selectors..." : "Generate AI Selectors"}
        </Button>

        {selectors.length > 0 && (
          <div className="space-y-4">
            <Text className="font-medium">{t('aiSelector.generatedSelectors')}</Text>
            {selectors.map((item, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium">{item.field}</Text>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.confidence}% confidence
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copySelector(item.selector, index)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <Text size="sm" className="font-mono bg-muted p-2 rounded text-secondary">
                  {item.selector}
                </Text>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
