"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Search, Globe, Linkedin, Database, Mic, History } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils" // Assumed to be available from shadcn/ui

interface SmartSearchBarProps {
  placeholder?: string
  showSuggestions?: boolean
  className?: string
}

export function SmartSearchBar({
  placeholder = "Search for companies or topics...",
  showSuggestions = true, // Defaulting to true for better UX
  className = "",
}: SmartSearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>(["google", "linkedin", "crunchbase"])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const showSuggestionsList = isFocused && query.length > 2 && suggestions.length > 0 && showSuggestions

  const searchSuggestions = [
    "Marketing agencies in Geneva",
    "SaaS companies with Series A funding",
    "Tech startups using React",
    "Fintech companies in Switzerland",
    "E-commerce platforms with 50+ employees",
    "AI companies in Europe",
    "Healthcare startups in Zurich",
    "Consulting firms in London",
  ]

  const sources = [
    { id: "google", label: "Google", icon: Globe },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "crunchbase", label: "Crunchbase", icon: Database },
  ]

  useEffect(() => {
    if (query.length > 2 && showSuggestions) {
      const filtered = searchSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [query, showSuggestions])

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      const searchParams = new URLSearchParams({
        q: query,
        sources: selectedSources.join(","),
      })
      router.push(`/search/results?${searchParams.toString()}`)
      inputRef.current?.blur()
    }
  }, [query, selectedSources, router])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) => (prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]))
  }

  // Handle clicks outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div ref={wrapperRef} className="relative">
        {/* Main Search Bar Wrapper for Styling */}
        <div
          className={cn(
            "relative flex items-center w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md",
            isFocused && "shadow-md ring-2 ring-blue-500/20",
            showSuggestionsList ? "rounded-t-3xl" : "rounded-full",
          )}
        >
          <div className="pl-4 pr-2">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            className="w-full h-full text-base bg-transparent border-none focus:ring-0 focus-visible:ring-0 dark:text-white"
          />
          <div className="px-4">
            <Mic className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestionsList && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 shadow-md rounded-b-3xl z-50 overflow-hidden">
            <ul>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  onClick={() => {
                    setQuery(suggestion)
                    setIsFocused(false)
                    inputRef.current?.focus()
                  }}
                >
                  <div className="flex items-center gap-3">
                    <History className="w-4 h-4 text-slate-400" />
                    <span className="text-sm dark:text-slate-200">{suggestion}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Buttons and Source Selectors Below the Bar */}
      <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
        <Button onClick={handleSearch} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
          Search
        </Button>
        {sources.map((source) => {
          const Icon = source.icon
          const isSelected = selectedSources.includes(source.id)
          return (
            <Button
              key={source.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex items-center gap-1.5 text-slate-500",
                isSelected && "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300",
              )}
              onClick={() => toggleSource(source.id)}
            >
              <Icon className="w-4 h-4" />
              {source.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}