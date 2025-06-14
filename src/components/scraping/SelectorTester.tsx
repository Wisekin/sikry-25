"use client"

"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { useState } from "react"
import { Play, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function SelectorTester() {
  const { t } = useTranslation('scrapingPage')
  const [url, setUrl] = useState("")
  const [selector, setSelector] = useState("")
  const [results, setResults] = useState<
    Array<{
      element: string
      value: string
      confidence: number
    }>
  >([])
  const [testing, setTesting] = useState(false)

  const testSelector = async () => {
    setTesting(true)
    // Simulate API call
    setTimeout(() => {
      setResults([
        { element: "h1.company-name", value: "TechFlow Solutions", confidence: 98 },
        { element: "a[href^='mailto:']", value: "contact@techflow.ch", confidence: 95 },
        { element: ".phone-number", value: "+41 22 123 4567", confidence: 92 },
      ])
      setTesting(false)
    }, 2000)
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="w-4 h-4 text-emerald-600" />
    if (confidence >= 70) return <AlertCircle className="w-4 h-4 text-warning" />
    return <XCircle className="w-4 h-4 text-destructive" />
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{t('selectorTester.title')}</CardTitle>
        <CardDescription>{t('selectorTester.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-caption font-medium mb-2 block">{t('selectorTester.targetUrl')}</label>
            <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div>
            <label className="text-caption font-medium mb-2 block">{t('selectorTester.cssSelector')}</label>
            <Input
              placeholder="h1.company-name, .contact-email"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={testSelector} disabled={!url || !selector || testing} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          {testing ? "Testing..." : "Test Selector"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            <Text className="font-medium">{t('selectorTester.testResults')}</Text>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getConfidenceIcon(result.confidence)}
                  <div>
                    <Text size="sm" className="font-mono">
                      {result.element}
                    </Text>
                    <Text size="sm" className="text-secondary">
                      {result.value}
                    </Text>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {result.confidence}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
