"use client"

import { usePathname } from "next/navigation"
import { SecondaryMenuBar } from "./SecondaryMenuBar"

export function SecondaryMenuBarWrapper() {
  const pathname = usePathname()

  // Array of paths where SecondaryMenuBar should be disabled
  const disabledPaths = [
    '/dashboard',
    '/referrals',
    '/reviews',
    '/reviews/requests',
    '/reviews/booster'
  ]

  // Check if current path should have SecondaryMenuBar
  const shouldShowSecondaryMenu = !disabledPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  )

  if (!shouldShowSecondaryMenu) {
    return null
  }

  return (
    <div className="h-12 flex-shrink-0 bg-background border-b">
      <SecondaryMenuBar />
    </div>
  )
} 