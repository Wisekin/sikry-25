import { cn } from "@/lib/utils"
import { ElementType } from "react"

interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  as?: ElementType
  className?: string
  children: React.ReactNode
}

const baseClasses = "font-semibold tracking-tight"
const levelClasses = {
  1: "text-4xl md:text-5xl",
  2: "text-3xl md:text-4xl",
  3: "text-2xl md:text-3xl",
  4: "text-xl md:text-2xl",
  5: "text-lg md:text-xl",
  6: "text-base md:text-lg",
}

export function Heading({ level = 1, as, className, children }: HeadingProps) {
  const Component = as || `h${level}` as ElementType

  return <Component className={cn(baseClasses, levelClasses[level], className)}>{children}</Component>
}
