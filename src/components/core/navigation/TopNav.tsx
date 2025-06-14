"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { LanguageSelector } from "@/src/components/core/navigation/LanguageSelector"
import {
  Search, HelpCircle, Settings, LogOut, Menu, Moon, Monitor, Sun,
} from "lucide-react"
//import { useTranslation } from "@/src/lib/i18n/useTranslation"
import { useTranslation } from 'react-i18next';
import Link from "next/link"
import { useTheme } from "next-themes"
import { useAuth } from "@/src/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { NotificationCenter } from "@/src/components/notifications/NotificationCenter"

export function TopNav() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { t } = useTranslation()
  const { setTheme, theme } = useTheme()
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Set brand theme as default when component mounts
  useEffect(() => {
    if (!theme) {
      setTheme("brand")
    }
  }, [theme, setTheme])

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 left-0 right-0 h-16 bg-[var(--topnav-bg)] text-[var(--topnav-foreground)] z-50 px-3 flex items-center justify-between shadow-md">
      <div className="flex items-center lg:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="text-[var(--topnav-foreground)] hover:bg-[var(--topnav-hover)]">
          <Menu className="h-4 w-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            className="w-full bg-gray-700/60 border border-gray-300 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2">
        <LanguageSelector />

        {/* Notification Center */}
        <NotificationCenter />

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-[var(--topnav-foreground)] hover:bg-[var(--topnav-hover)]">
          <HelpCircle className="h-5 w-5 text-[var(--topnav-foreground)]" />
        </Button>

        {/* Login/Logout Button */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="bg-primary/20 text-primary">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href='/my-account'}>My Account</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href='/profile'}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("brand")} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Brand</span>
                {theme === "brand" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === "light" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === "dark" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                <Monitor className="mr-2 h-4 w-4" />
                <span>System</span>
                {theme === "system" && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={() => router.push("/login")}>Login</Button>
        )}
      </div>
    </header>
  )
}
