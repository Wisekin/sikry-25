import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/src/providers/ThemeProvider"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/src/providers/AuthProvider"
import { TranslationProvider } from "@/src/providers/TranslationProvider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sikso Intelligent Platform",
  description: "Advanced business intelligence and automation platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
<AuthProvider>
            <TranslationProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
              </ThemeProvider>
            </TranslationProvider>
</AuthProvider>
        
        </body>
   
    </html>
  )
 }