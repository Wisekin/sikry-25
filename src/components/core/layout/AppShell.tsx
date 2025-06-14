"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarNav } from "@/src/components/core/navigation/SidebarNav"
import { TopNav } from "@/src/components/core/navigation/TopNav"
import { SecondaryMenuBar } from "@/src/components/core/navigation/SecondaryMenuBar"
import { AIAssistant } from "@/src/components/ai/AIAssistant"

interface LayoutProps {
  children: React.ReactNode
}

// New MarketingLayout component
const MarketingLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pt-16">{children}</main>
    </div>
  )
}

// New DashboardLayout component
const DashboardLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Navigation */}

      {/* Full-width Secondary Navigation Bar (fixed below TopNav) */}
       <div className="fixed top-[3.5rem] left-[16rem] right-0 h-[3rem] bg-[#ECEFF1] border-b border-border z-40">
        <div className="flex items-center h-full px-6">
          <SecondaryMenuBar />
        </div>
      </div>

      {/* Adjusted layout for Sidebar and Main Content */}
      <div className="flex pt-[6.5rem]"> {/* This padding accounts for TopNav + SecondaryMenuBar */}
        {/* Fixed Sidebar (now sits below SecondaryMenuBar) */}
    {/*     <div >
          <SidebarNav />
        </div> */}

        {/* Main Content (starts after Sidebar, with padding for TopNav & SecondaryMenuBar already handled by parent div) */}
        <main className="flex-1 ml-36 pl-0 pr-6 py-6 overflow-y-auto scrollbar-custom">
          <div className="max-w-[1400px]">{children}</div>
        </main>
      </div>

      {/* AI Assistant - Rendered within DashboardLayout */}
      <AIAssistant />
    </div>
  )
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  // Show sidebar only for dashboard routes
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/companies") ||
    pathname.startsWith("/comms") ||
    pathname.startsWith("/market-intel") ||
    pathname.startsWith("/scrapers") ||
    pathname.startsWith("/statistics") ||
    pathname.startsWith("/financial") ||
    pathname.startsWith("/reengagement") ||
    pathname.startsWith("/referrals") ||
    pathname.startsWith("/reviews") ||
    pathname.startsWith("/funnels") ||
    pathname.startsWith("/gap-analysis") ||
    pathname.startsWith("/vsl") ||
    pathname.startsWith("/lead-response") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/settings")

  if (!isDashboardRoute) {
    return <MarketingLayout>{children}</MarketingLayout>
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
