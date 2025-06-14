import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface TextProps {
  children: ReactNode
  size?: "sm" | "base" | "lg"
  className?: string
}

export function Text({ children, size = "base", className }: TextProps) {
  const sizeClasses = {
    sm: "text-caption",
    base: "text-body",
    lg: "text-lg",
  }

  return <p className={cn(sizeClasses[size], className)}>{children}</p>
}
