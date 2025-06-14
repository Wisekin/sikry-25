"use client"

import { useState, useEffect } from "react"

interface BreakpointConfig {
  sm: number
  md: number
  lg: number
  xl: number
  "2xl": number
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial size
    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile = windowSize.width < breakpoints.md
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg
  const isLargeDesktop = windowSize.width >= breakpoints.xl

  const breakpoint = (() => {
    if (windowSize.width >= breakpoints["2xl"]) return "2xl"
    if (windowSize.width >= breakpoints.xl) return "xl"
    if (windowSize.width >= breakpoints.lg) return "lg"
    if (windowSize.width >= breakpoints.md) return "md"
    return "sm"
  })()

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint,
    isBreakpoint: (bp: keyof BreakpointConfig) => windowSize.width >= breakpoints[bp],
  }
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])

  return matches
}
