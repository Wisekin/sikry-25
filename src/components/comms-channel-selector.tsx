"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Mail, MessageSquare, Phone, Send, LayoutTemplateIcon as Template, Zap } from "lucide-react"

interface CommsChannelSelectorProps {
  companyId: string
}

export function CommsChannelSelector({ companyId }: CommsChannelSelectorProps) {
  const [selectedChannel, setSelectedChannel] = useState<"email" | "sms" | "whatsapp">("email")
  const [message, setMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const channels = [
    { id: "email", label: "Email", icon: Mail, color: "bg-blue-500" },
    { id: "sms", label: "SMS", icon: MessageSquare, color: "bg-green-500" },
    { id: "whatsapp", label: "WhatsApp", icon: Phone, color: "bg-emerald-500" },
  ]

  const templates = {
    email: [
      {
        id: "intro",
        name: "Introduction",
        subject: "Partnership Opportunity with [Company Name]",
        content:
          "Hi there,\n\nI came across TechFlow Solutions and was impressed by your work in digital transformation. I'd love to explore potential partnership opportunities.\n\nBest regards,\n[Your Name]",
      },
      {
        id: "follow-up",
        name: "Follow-up",
        subject: "Following up on our conversation",
        content:
          "Hi,\n\nI wanted to follow up on our previous conversation about potential collaboration opportunities.\n\nLooking forward to hearing from you.\n\nBest,\n[Your Name]",
      },
    ],
    sms: [
      {
        id: "intro",
        name: "Introduction",
        content:
          "Hi! I'm interested in discussing partnership opportunities with TechFlow Solutions. Would you be open to a brief call this week?",
      },
    ],
    whatsapp: [
      {
        id: "intro",
        name: "Introduction",
        content:
          "Hello! I came across your company and would love to discuss potential collaboration. Are you available for a quick chat?",
      },
    ],
  }

  const handleSend = () => {
    // Simulate sending message
    console.log("Sending message via", selectedChannel, ":", message)
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates[selectedChannel].find((t) => t.id === templateId)
    if (template) {
      setMessage(template.content)
      setSelectedTemplate(templateId)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Communication Hub
        </CardTitle>
        <CardDescription>Engage prospects through unified channels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Selector */}
        <div>
          <h4 className="font-medium mb-3">Select Channel</h4>
          <div className="grid grid-cols-3 gap-2">
            {channels.map((channel) => {
              const Icon = channel.icon
              const isSelected = selectedChannel === channel.id
              return (
                <Button
                  key={channel.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`flex flex-col items-center gap-2 h-auto py-3 ${isSelected ? channel.color : ""}`}
                  onClick={() => setSelectedChannel(channel.id as any)}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{channel.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Template Selector */}
        <div>
          <h4 className="font-medium mb-3">Templates</h4>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates[selectedChannel].map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <Template className="w-3 h-3" />
                    {template.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Composer */}
        <div>
          <h4 className="font-medium mb-3">Message</h4>
          {selectedChannel === "email" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Subject line..."
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
            </div>
          )}
          <Textarea
            placeholder={`Compose your ${selectedChannel} message...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{message.length} characters</span>
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
        </div>

        {/* Send Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delivery Rate</span>
            <Badge variant="secondary">98.5%</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Compliance</span>
            <Badge variant="secondary">GDPR ✓</Badge>
          </div>
          <Button className="w-full" onClick={handleSend} disabled={!message.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Send {selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
