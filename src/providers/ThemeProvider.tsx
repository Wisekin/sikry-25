"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

function removeExtraClasses() {
  document.documentElement.classList.remove('brand')
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class" 
      value={{
        light: "light",
        dark: "dark",
        brand: "brand",
        system: "system"
      }}
      defaultTheme="system" 
      enableSystem 
      onValueChange={(theme) => {
        if (theme !== "brand") {
          removeExtraClasses()
        }
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
