"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/src/components/core/layout/AppShell"
import { Heading } from "@/src/components/core/typography/Heading"
import { Text } from "@/src/components/core/typography/Text"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Switch } from "@/src/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { ArrowLeftIcon, CheckIcon, TrashIcon, DocumentDuplicateIcon } from "@heroicons/react/24/solid"

export default function ScraperConfigPage() {
  const params = useParams()
  const router = useRouter()
  const scraperId = params.id as string
  const [activeTab, setActiveTab] = useState("general")

  // Mock scraper data - in a real app, this would be fetched from an API
  const scraper = {
    id: scraperId,
    name: "Company Contact Scraper",
    description:
      "Extracts contact information from company websites including emails, phone numbers, and social media profiles.",
    version: "v2",
    status: "active",
    lastRun: "2024-01-15T10:30:00Z",
    success: 95,
    fieldsDetected: 12,
    url: "https://{domain}",
    selectors: {
      email: ".contact-email, a[href^='mailto:']",
      phone: ".contact-phone, a[href^='tel:']",
      address: ".contact-address, .address",
      socialMedia: "a[href*='linkedin.com'], a[href*='twitter.com'], a[href*='facebook.com']",
    },
    schedule: "daily",
    retryOnFail: true,
    maxRetries: 3,
    timeout: 30000,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    javascript: true,
    proxy: false,
    proxyUrl: "",
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleSave = () => {
    // In a real app, this would save the scraper configuration to an API
    alert("Scraper configuration saved!")
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <div>
              <Heading level={1}>Configure Scraper</Heading>
              <Text className="text-secondary">{scraper.name}</Text>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <DocumentDuplicateIcon className="w-4 h-4" />
              Duplicate
            </Button>
            <Button variant="outline" className="flex items-center gap-1 text-destructive hover:bg-destructive/10">
              <TrashIcon className="w-4 h-4" />
              Delete
            </Button>
            <Button className="flex items-center gap-1 bg-primary text-white hover:bg-primary/90" onClick={handleSave}>
              <CheckIcon className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="selectors">Selectors</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Scraper Name</Label>
                    <Input id="name" defaultValue={scraper.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Select defaultValue={scraper.version}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v2">V2 (AI-powered)</SelectItem>
                        <SelectItem value="legacy">Legacy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" defaultValue={scraper.description} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Target URL Pattern</Label>
                  <Input id="url" defaultValue={scraper.url} placeholder="https://{domain}" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selectors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CSS Selectors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-selector">Email Selector</Label>
                  <Input id="email-selector" defaultValue={scraper.selectors.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-selector">Phone Selector</Label>
                  <Input id="phone-selector" defaultValue={scraper.selectors.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-selector">Address Selector</Label>
                  <Input id="address-selector" defaultValue={scraper.selectors.address} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social-selector">Social Media Selector</Label>
                  <Input id="social-selector" defaultValue={scraper.selectors.socialMedia} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input id="timeout" type="number" defaultValue={scraper.timeout} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retries">Max Retries</Label>
                    <Input id="retries" type="number" defaultValue={scraper.maxRetries} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="javascript" defaultChecked={scraper.javascript} />
                  <Label htmlFor="javascript">Enable JavaScript</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="retry" defaultChecked={scraper.retryOnFail} />
                  <Label htmlFor="retry">Retry on Failure</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-agent">User Agent</Label>
                  <Input id="user-agent" defaultValue={scraper.userAgent} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Run Schedule</Label>
                  <Select defaultValue={scraper.schedule}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
