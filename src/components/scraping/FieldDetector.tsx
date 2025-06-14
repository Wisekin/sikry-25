"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Search, Zap } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function FieldDetector() {
  const { t } = useTranslation('scrapingPage')
  const detectedFields = [
    { type: "email", value: "contact@example.com", confidence: 95, selector: "a[href^='mailto:']" },
    { type: "phone", value: "+1 234 567 8900", confidence: 88, selector: "span.phone-number" },
    { type: "address", value: "123 Main St, City, State", confidence: 92, selector: ".address-block" },
    { type: "technology", value: "React", confidence: 89, selector: "meta[name='generator']" },
  ]

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          {t('fieldDetector.title')}
        </CardTitle>
        <CardDescription>{t('fieldDetector.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Input placeholder="Enter URL to analyze..." className="flex-1" />
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>

        <div className="space-y-4">
          <Text className="font-medium">{t('fieldDetector.detectedFields')}</Text>
          {detectedFields.map((field, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">
                  {field.type}
                </Badge>
                <Text size="sm">{field.value}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {field.confidence}% confidence
                </Badge>
                <Text size="sm" className="text-secondary font-mono">
                  {field.selector}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
