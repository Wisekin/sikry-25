import type React from "react"
import { TranslationProvider } from "@/src/providers/TranslationProvider"
import { SidebarNav } from "@/src/components/core/navigation/SidebarNav"
import { TopNav } from "@/src/components/core/navigation/TopNav"
import { ThemeProvider } from "@/src/providers/ThemeProvider"
import { AuthProvider } from "@/src/providers/AuthProvider"
import { SupabaseProvider } from "@/src/providers/SupabaseProvider"
import "../globals.css"
import { Logo } from "@/src/components/core/branding/Logo"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <TranslationProvider>
          <div className="min-h-screen bg-background">
            <div className="flex h-screen overflow-hidden">
              <div className="hidden md:flex md:w-64 flex-col h-full bg-sidebar border-r">
                <div className="flex-1 overflow-y-auto">
                  <SidebarNav />
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="h-16 flex-shrink-0 bg-background border-b">
                  <TopNav />
                </div>
                <main className="flex-1 overflow-y-auto bg-background pt-8">
                  <ThemeProvider attribute="class" defaultTheme="brand" enableSystem>
                    <div className="flex-grow ml-5 mr-5">
                      {children}
                    </div>
                  </ThemeProvider>
                </main>
              </div>
            </div>
          </div>
        </TranslationProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
}
