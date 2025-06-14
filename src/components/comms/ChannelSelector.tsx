"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Textarea } from "@/src/components/ui/textarea"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Mail, MessageSquare, Phone, Send, Zap } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function ChannelSelector() {
  const [selectedChannel, setSelectedChannel] = useState<"email" | "sms" | "whatsapp">("email")
  const [message, setMessage] = useState("")
  const [subject, setSubject] = useState("")

  const channels = [
    { id: "email", label: "Email", icon: Mail, color: "bg-blue-500", estimate: "~2-5 min delivery" },
    { id: "sms", label: "SMS", icon: MessageSquare, color: "bg-emerald-500", estimate: "~30 sec delivery" },
    { id: "whatsapp", label: "WhatsApp", icon: Phone, color: "bg-green-600", estimate: "~1 min delivery" },
  ]

  const selectedChannelData = channels.find((c) => c.id === selectedChannel)

  return (
    <div className="space-y-6">
      {/* Channel Selection */}
      <div>
        <Text className="font-medium mb-3">Select Channel</Text>
        <div className="grid grid-cols-3 gap-3">
          {channels.map((channel) => {
            const Icon = channel.icon
            const isSelected = selectedChannel === channel.id
            return (
              <Button
                key={channel.id}
                variant={isSelected ? "default" : "outline"}
                className={`flex flex-col items-center gap-2 h-auto py-4 ${
                  isSelected ? `${channel.color} text-white` : ""
                }`}
                onClick={() => setSelectedChannel(channel.id as any)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-caption">{channel.label}</span>
                <Text size="sm" className={isSelected ? "text-white/80" : "text-secondary"}>
                  {channel.estimate}
                </Text>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Message Composer */}
      <div className="space-y-4">
        {selectedChannel === "email" && (
          <div>
            <label className="text-caption font-medium mb-2 block">Subject Line</label>
            <Input placeholder="Enter email subject..." value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
        )}

        <div>
          <label className="text-caption font-medium mb-2 block">Message</label>
          <Textarea
            placeholder={`Compose your ${selectedChannel} message...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-32"
          />
          <div className="flex items-center justify-between mt-2">
            <Text size="sm" className="text-secondary">
              {message.length} characters
            </Text>
            <Badge variant="outline" className="text-xs border-accent/20 text-accent">
              <Zap className="w-3 h-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-caption font-medium mb-2 block">Template</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intro">Introduction Template</SelectItem>
              <SelectItem value="follow-up">Follow-up Template</SelectItem>
              <SelectItem value="partnership">Partnership Inquiry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Send Controls */}
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between text-caption">
          <span className="text-secondary">Delivery Rate</span>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            98.5%
          </Badge>
        </div>
        <div className="flex items-center justify-between text-caption">
          <span className="text-secondary">Compliance</span>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            GDPR ✓
          </Badge>
        </div>
        <div className="flex items-center justify-between text-caption">
          <span className="text-secondary">Spam Score</span>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            Low Risk
          </Badge>
        </div>

        <Button className="w-full" disabled={!message.trim()}>
          <Send className="w-4 h-4 mr-2" />
          Send {selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)}
        </Button>
      </div>
    </div>
  )
}
