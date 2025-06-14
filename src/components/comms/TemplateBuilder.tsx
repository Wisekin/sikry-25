"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Plus, Edit, Trash2, Copy } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"
import { Heading } from "@/src/components/core/typography/Heading"

// Declare variables before using them
const company_name = "Example Company"
const contact_name = "John Doe"
const industry = "Technology"

export function TemplateBuilder() {
  const [templates] = useState([
    {
      id: "1",
      name: "Introduction Email",
      type: "email",
      subject: `Partnership Opportunity with ${company_name}`,
      content: `Hi ${contact_name},\n\nI came across ${company_name} and was impressed by your work in ${industry}. I'd love to explore potential partnership opportunities.\n\nBest regards,\n${contact_name}`,
      usage: 156,
      performance: "68% open rate",
    },
    {
      id: "2",
      name: "Follow-up SMS",
      type: "sms",
      content: `Hi ${contact_name}! Following up on our conversation about {{topic}}. Would you be available for a quick call this week?`,
      usage: 89,
      performance: "45% response rate",
    },
    {
      id: "3",
      name: "Partnership Inquiry",
      type: "email",
      subject: `Collaboration Opportunity - ${company_name}`,
      content: `Hello ${contact_name},\n\nI hope this email finds you well. I'm reaching out because I believe there's a great opportunity for collaboration between our companies.\n\n${company_name} has an impressive track record in ${industry}, and I think we could create significant value together.\n\nWould you be open to a brief conversation to explore this further?\n\nBest,\n${contact_name}`,
      usage: 234,
      performance: "72% open rate",
    },
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2}>Message Templates</Heading>
          <Text className="text-secondary">Create and manage reusable message templates</Text>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {template.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.type === "email" && template.subject && (
                <div>
                  <Text size="sm" className="font-medium text-secondary">
                    Subject:
                  </Text>
                  <Text size="sm" className="text-foreground">
                    {template.subject}
                  </Text>
                </div>
              )}

              <div>
                <Text size="sm" className="font-medium text-secondary">
                  Content:
                </Text>
                <div className="bg-muted rounded p-3 mt-1">
                  <Text size="sm" className="text-foreground line-clamp-4">
                    {template.content}
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <Text size="sm" className="text-secondary">
                    Used {template.usage} times
                  </Text>
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                  {template.performance}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Builder Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-medium mb-2 block">Template Name</label>
              <Input placeholder="Enter template name..." />
            </div>
            <div>
              <label className="text-caption font-medium mb-2 block">Channel Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-caption font-medium mb-2 block">Subject Line (Email only)</label>
            <Input placeholder="Enter subject line..." />
          </div>

          <div>
            <label className="text-caption font-medium mb-2 block">Message Content</label>
            <Textarea placeholder="Enter your message template..." className="min-h-32" />
            <Text size="sm" className="text-secondary mt-2">
              Use variables like {{ company_name }}, {{ contact_name }}, {{ industry }} for personalization
            </Text>
          </div>

          <div className="flex gap-2">
            <Button>Save Template</Button>
            <Button variant="outline">Preview</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
