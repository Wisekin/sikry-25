"use client"

import { useState } from "react"
import type { Template } from "@/types/comms"
import type { Contact } from "@/types/company"
import { createClient } from "@/utils/supabase/client"

interface SendMessageOptions {
  templateId: string
  contactIds: string[]
  campaignId?: string
  personalizations?: Record<string, any>
  scheduleAt?: string
}

interface BulkSendOptions {
  templateId: string
  audienceFilters: any
  campaignId: string
  batchSize?: number
  delay?: number
}

export function useMessageSender() {
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const supabase = createClient()

  const sendMessage = async (options: SendMessageOptions) => {
    try {
      setSending(true)
      setError(null)
      setProgress(0)

      const response = await fetch("/api/comms/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const result = await response.json()
      setResults(result)
      setProgress(100)

      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message"
      setError(message)
      return { success: false, error: message }
    } finally {
      setSending(false)
    }
  }

  const sendBulkMessages = async (options: BulkSendOptions) => {
    try {
      setSending(true)
      setError(null)
      setProgress(0)

      // Start bulk send job
      const response = await fetch("/api/comms/bulk-send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error("Failed to start bulk send")
      }

      const { jobId } = await response.json()

      // Poll for progress
      const pollProgress = async () => {
        const progressResponse = await fetch(`/api/comms/bulk-send/${jobId}/progress`)
        const progressData = await progressResponse.json()

        setProgress(progressData.progress)

        if (progressData.status === "completed") {
          setResults(progressData.results)
          return progressData
        } else if (progressData.status === "failed") {
          throw new Error(progressData.error)
        } else {
          // Continue polling
          setTimeout(pollProgress, 2000)
        }
      }

      const finalResult = await pollProgress()
      return { success: true, data: finalResult }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send bulk messages"
      setError(message)
      return { success: false, error: message }
    } finally {
      setSending(false)
    }
  }

  const testMessage = async (templateId: string, contactId: string, personalizations?: Record<string, any>) => {
    try {
      const response = await fetch("/api/comms/test-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId,
          contactId,
          personalizations,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to test message")
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to test message"
      return { success: false, error: message }
    }
  }

  const previewMessage = async (template: Template, contact: Contact, personalizations?: Record<string, any>) => {
    try {
      const response = await fetch("/api/comms/preview-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template,
          contact,
          personalizations,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to preview message")
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to preview message"
      return { success: false, error: message }
    }
  }

  const validateTemplate = async (template: Template) => {
    try {
      const response = await fetch("/api/comms/validate-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template }),
      })

      if (!response.ok) {
        throw new Error("Failed to validate template")
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to validate template"
      return { success: false, error: message }
    }
  }

  const checkDeliverability = async (content: string, subject?: string) => {
    try {
      const response = await fetch("/api/comms/check-deliverability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, subject }),
      })

      if (!response.ok) {
        throw new Error("Failed to check deliverability")
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check deliverability"
      return { success: false, error: message }
    }
  }

  const cancelBulkSend = async (jobId: string) => {
    try {
      const response = await fetch(`/api/comms/bulk-send/${jobId}/cancel`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel bulk send")
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel bulk send"
      return { success: false, error: message }
    }
  }

  const getMessageStatus = async (messageId: string) => {
    try {
      const { data, error } = await supabase.from("messages").select("*").eq("id", messageId).single()

      if (error) throw error

      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get message status"
      return { success: false, error: message }
    }
  }

  const retryFailedMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/comms/messages/${messageId}/retry`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to retry message")
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to retry message"
      return { success: false, error: message }
    }
  }

  return {
    sending,
    progress,
    error,
    results,
    sendMessage,
    sendBulkMessages,
    testMessage,
    previewMessage,
    validateTemplate,
    checkDeliverability,
    cancelBulkSend,
    getMessageStatus,
    retryFailedMessage,
  }
}
