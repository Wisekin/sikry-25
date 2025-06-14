"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useTranslation } from 'react-i18next'
import {
  SparklesIcon,
  PaperAirplaneIcon,
  LightBulbIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  BoltIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"

export function AIAssistant() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: t("ai.welcome"),
      timestamp: new Date(),
    },
  ])

  const suggestions = [
    {
      icon: BuildingOfficeIcon,
      text: t("ai.suggestions.findCompanies"),
      action: "search",
    },
    {
      icon: BoltIcon,
      text: t("ai.suggestions.createScraper"),
      action: "scraper",
    },
    {
      icon: ChartBarIcon,
      text: t("ai.suggestions.analyzeMarket"),
      action: "analysis",
    },
    {
      icon: LightBulbIcon,
      text: t("ai.suggestions.leadStrategy"),
      action: "strategy",
    },
  ]

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "ai",
        content: t("ai.response", { query: message }),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label={t("ai.openAssistant")}
        >
          <SparklesIcon className="w-6 h-6 text-white" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5" />
              {t("ai.title")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              aria-label={t("ai.close")}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {messages.length === 1 && (
            <div className="p-4 border-t">
              <p className="text-sm text-gray-600 mb-3">{t("ai.quickSuggestions")}:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 text-left justify-start hover:bg-gray-50"
                    onClick={() => setMessage(suggestion.text)}
                  >
                    <suggestion.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{suggestion.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder={t("ai.placeholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm" disabled={!message.trim()}>
                <PaperAirplaneIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
