"use client"

import { useState } from "react"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Mail, Phone, Code, MapPin, Building, Globe, User, Copy, Check } from "lucide-react"

interface DataFieldPillProps {
  type: "email" | "phone" | "technology" | "address" | "company" | "website" | "person"
  value: string
  confidence?: number
}

export function DataFieldPill({ type, value, confidence }: DataFieldPillProps) {
  const [copied, setCopied] = useState(false)

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "email":
        return { icon: Mail, color: "bg-blue-50 text-blue-700 border-blue-200", label: "Email" }
      case "phone":
        return { icon: Phone, color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Phone" }
      case "technology":
        return { icon: Code, color: "bg-purple-50 text-purple-700 border-purple-200", label: "Tech" }
      case "address":
        return { icon: MapPin, color: "bg-orange-50 text-orange-700 border-orange-200", label: "Address" }
      case "company":
        return { icon: Building, color: "bg-primary/10 text-primary border-primary/20", label: "Company" }
      case "website":
        return { icon: Globe, color: "bg-cyan-50 text-cyan-700 border-cyan-200", label: "Website" }
      case "person":
        return { icon: User, color: "bg-pink-50 text-pink-700 border-pink-200", label: "Person" }
      default:
        return { icon: Code, color: "bg-muted text-secondary border-secondary/20", label: "Data" }
    }
  }

  const config = getTypeConfig(type)
  const Icon = config.icon

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="group relative">
      <Badge
        variant="outline"
        className={`${config.color} text-xs font-medium flex items-center gap-1 max-w-fit cursor-pointer`}
        title={confidence ? `${config.label}: ${confidence}% confidence` : config.label}
        onClick={handleCopy}
      >
        <Icon className="w-3 h-3" />
        <span className="truncate max-w-24">{value}</span>
        {confidence && <span className="text-xs opacity-70">{confidence}%</span>}
        <Button variant="ghost" size="sm" className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      </Badge>
    </div>
  )
}
