"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Search, Mic, History, Globe, Database, ChevronDown, Settings, Filter, Linkedin } from "lucide-react"
import { DataSourcesMenu } from "./data-sources-menu"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils" // Assumed to be available from shadcn/ui

interface SmartSearchBarProps {
  placeholder?: string
  showSuggestions?: boolean
  className?: string
}

import { useNaturalLanguage, EnhancedSearchResult } from '@/features/search-engine/hooks/useNaturalLanguage'
import { useDebounce } from '@/lib/hooks/useDebounce'

import { Badge } from '@/src/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'

interface SuggestionItem {
  text: string
  type: 'recent' | 'entity' | 'filter' | 'example'
  icon?: React.ReactNode
  confidence?: number
}

export function SmartSearchBar({
  placeholder = "Search for companies or topics...",
  showSuggestions = true,
  className = "",
}: SmartSearchBarProps) {
  const { search, getSuggestions, results, isLoading } = useNaturalLanguage()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>(["google", "linkedin", "crunchbase"])
  const [searchSettings, setSearchSettings] = useState({
    minimumConfidence: 0.7,
    includeAnalytics: true,
    maxResults: 50
  })
  const [isSourcesMenuOpen, setIsSourcesMenuOpen] = useState(false)
  const [activeDataSources, setActiveDataSources] = useState(new Set(['internal']))
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  const showSuggestionsList = isFocused && query.length > 2 && suggestions.length > 0 && showSuggestions

  // Example suggestions with natural language patterns
  const searchSuggestions: SuggestionItem[] = [
    { 
      text: "Marketing agencies in Geneva using HubSpot",
      type: "example",
      icon: <Globe className="w-4 h-4" />
    },
    { 
      text: "Compare SaaS companies with Series A funding",
      type: "example",
      icon: <Database className="w-4 h-4" />
    },
    { 
      text: "Analyze tech startups using React with >50 employees",
      type: "example",
      icon: <Search className="w-4 h-4" />
    },
    { 
      text: "Filter Fintech companies in Switzerland by revenue",
      type: "example",
      icon: <Filter className="w-4 h-4" />
    }
  ]

  const sources = [
    { id: "google", label: "Google", icon: Globe },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "crunchbase", label: "Crunchbase", icon: Database },
  ]

  const availableDataSources = [
    { id: 'internal', name: 'Internal Database', icon: <Database className="h-4 w-4" /> },
    { id: 'wikidata', name: 'Wikidata', icon: <Globe className="h-4 w-4" /> },
    { id: 'opencorporates', name: 'OpenCorporates', icon: <Globe className="h-4 w-4" /> },
    { id: 'business_registries', name: 'Business Registries', icon: <Database className="h-4 w-4" /> }
  ]

  useEffect(() => {
    if (query.length > 2 && showSuggestions) {
      const filtered = searchSuggestions.filter((suggestion) => 
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered.slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [query, showSuggestions])

  const toggleDataSource = (sourceId: string) => {
    const newSources = new Set(activeDataSources)
    if (newSources.has(sourceId)) {
      newSources.delete(sourceId)
    } else {
      newSources.add(sourceId)
    }
    setActiveDataSources(newSources)
  }

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    
    try {
      await search(query)
    } catch (error) {
      console.error('Search error:', error)
    }
  }, [query, search])

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
    <div className={cn("relative w-full", className)} ref={wrapperRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="pl-10 pr-4 h-12 text-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2">
          <DataSourcesMenu
            activeDataSources={activeDataSources}
            onToggleDataSource={toggleDataSource}
          />

          <Button onClick={handleSearch} disabled={isLoading} size="lg">
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Data Sources Menu */}
      {isSourcesMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-popover rounded-md shadow-lg border z-50">
          <div className="p-2">
            <h3 className="text-sm font-medium mb-2">Data Sources</h3>
            <div className="space-y-2">
              {availableDataSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleDataSource(source.id)}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm",
                    activeDataSources.has(source.id)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  {source.icon}
                  <span>{source.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestionsList && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 shadow-md rounded-b-3xl z-50 overflow-hidden">
          <ul>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                onClick={() => {
                  setQuery(suggestion.text)
                  setIsFocused(false)
                  inputRef.current?.focus()
                }}
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-slate-400" />
                  <span className="text-sm dark:text-slate-200">{suggestion.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}