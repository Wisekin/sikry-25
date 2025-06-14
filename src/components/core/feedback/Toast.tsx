"use client"

import { useEffect, useState } from "react"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
  onClose?: () => void
}

export function Toast({ id, title, description, type = "info", duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }

  const Icon = icons[type]

  return (
    <Card
      className={cn(
        "fixed top-4 right-4 z-50 w-96 shadow-floating transition-all duration-300",
        colors[type],
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {title && <div className="font-medium text-sm">{title}</div>}
            {description && <div className="text-sm opacity-90 mt-1">{description}</div>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-black/10"
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose?.(), 300)
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
