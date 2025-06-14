"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Zap, Play, Save } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function V2ScraperEditor() {
  const { t } = useTranslation('scrapingPage')
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <CardTitle>{t('v2ScraperEditor.title')}</CardTitle>
        </CardTitle>
        <CardDescription>{t('v2ScraperEditor.description')} with natural language instructions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-caption font-medium mb-2 block">{t('v2ScraperEditor.scraperName')}</label>
            <Input placeholder="Enter scraper name..." />
          </div>
          <div>
            <label className="text-caption font-medium mb-2 block">{t('v2ScraperEditor.targetUrlPattern')}</label>
            <Input placeholder="https://example.com/*" />
          </div>
        </div>

        <div>
          <label className="text-caption font-medium mb-2 block">{t('v2ScraperEditor.aiInstructions')}</label>
          <Textarea placeholder="Describe what data you want to extract in natural language..." className="min-h-32" />
          <Text size="sm" className="text-secondary mt-2">
            Example: "Extract the company name, email addresses, phone numbers, and social media links from the contact
            page"
          </Text>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <Text className="font-medium mb-2">AI-Generated Selectors</Text>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Text size="sm" className="font-mono">
                h1.company-name
              </Text>
              <Badge variant="outline" className="text-xs">
                Company Name
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Text size="sm" className="font-mono">
                a[href^="mailto:"]
              </Text>
              <Badge variant="outline" className="text-xs">
                Email
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Text size="sm" className="font-mono">
                .contact-phone
              </Text>
              <Badge variant="outline" className="text-xs">
                Phone
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Scraper
          </Button>
          <Button variant="outline">
            <Play className="w-4 h-4 mr-2" />
            Test Run
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
