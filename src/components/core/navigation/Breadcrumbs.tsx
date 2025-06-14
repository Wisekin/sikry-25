"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = [
    { name: "Home", href: "/" },
    ...segments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + segments.slice(0, index + 1).join("/"),
    })),
  ]

  return (
    <nav className="flex items-center space-x-2">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 text-secondary mx-2" />}
          {index === 0 ? (
            <Home className="w-4 h-4 text-secondary" />
          ) : index === breadcrumbs.length - 1 ? (
            <Text size="sm" className="text-foreground font-medium">
              {breadcrumb.name}
            </Text>
          ) : (
            <Link
              href={breadcrumb.href}
              className="text-caption text-secondary hover:text-foreground transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
