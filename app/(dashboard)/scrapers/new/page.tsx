"use client"

import { AppShell } from "@/src/components/core/layout/AppShell"
import { Heading } from "@/src/components/core/typography/Heading"
import { Text } from "@/src/components/core/typography/Text"
import { V2ScraperEditor } from "@/src/components/scraping/V2ScraperEditor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft, Save, Play } from "lucide-react"
import Link from "next/link"

export default function NewScraperPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/scrapers">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scrapers
              </Link>
            </Button>
            <div>
              <Heading level={1}>Create New Scraper</Heading>
              <Text className="text-secondary">Build a new V2 scraper with AI-powered field detection</Text>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Test Run
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Scraper
            </Button>
          </div>
        </div>

        {/* Scraper Editor */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Scraper Configuration</CardTitle>
            <CardDescription>Configure your scraper settings and field mappings</CardDescription>
          </CardHeader>
          <CardContent>
            <V2ScraperEditor />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
