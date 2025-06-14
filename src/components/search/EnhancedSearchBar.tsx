"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { 
  Search, Globe, Linkedin, Database, Mic, 
  History, Filter, Settings, ChevronDown,
  SlidersHorizontal
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useNaturalLanguage } from '@/features/search-engine/hooks/useNaturalLanguage'
import { useDebounce } from '@/lib/hooks/useDebounce'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import {
  Slider
} from "@/src/components/ui/slider"

interface SuggestionItem {
  text: string
  type: 'recent' | 'entity' | 'filter' | 'example'
  icon?: React.ReactNode
  confidence?: number
}

interface EnhancedSearchBarProps {
  placeholder?: string
  showSuggestions?: boolean
  className?: string
  onSearch?: (query: string, settings: SearchSettings) => void
}

interface SearchSettings {
  minimumConfidence: number
  includeAnalytics: boolean
  maxResults: number
  sources: string[]
}

const DEFAULT_SETTINGS: SearchSettings = {
  minimumConfidence: 0.7,
  includeAnalytics: true,
  maxResults: 50,
  sources: ["google", "linkedin", "crunchbase"]
}

export function EnhancedSearchBar({
  placeholder = "Search for companies...",
  showSuggestions = true,
  className = "",
  onSearch
}: EnhancedSearchBarProps) {
  const { search, getSuggestions, results, isLoading } = useNaturalLanguage()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [settings, setSettings] = useState<SearchSettings>(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  const showSuggestionsList = isFocused && query.length > 2 && suggestions.length > 0 && showSuggestions

  const exampleQueries: SuggestionItem[] = [
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

  useEffect(() => {
    async function updateSuggestions() {
      if (debouncedQuery.length > 2 && showSuggestions) {
        try {
          const apiSuggestions = await getSuggestions(debouncedQuery)
          
          const matchingExamples = exampleQueries
            .filter(example => 
              example.text.toLowerCase().includes(debouncedQuery.toLowerCase())
            )
            .map(example => ({
              ...example,
              confidence: 1
            }))

          const allSuggestions = [
            ...apiSuggestions.map(suggestion => ({
              text: suggestion.text,
              type: suggestion.type as 'entity' | 'filter',
              confidence: suggestion.confidence,
              icon: suggestion.type === 'entity' ? <Database className="w-4 h-4" /> : <Filter className="w-4 h-4" />
            })),
            ...matchingExamples
          ]

          setSuggestions(
            allSuggestions
              .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
              .slice(0, 5)
          )
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          setSuggestions([])
        }
      } else {
        setSuggestions([])
      }
    }

    updateSuggestions()
  }, [debouncedQuery, showSuggestions, getSuggestions])

  const handleSearch = useCallback(async () => {
    if (query.trim()) {
      try {
        // Perform search
        const searchResults = await search(query, {
          sources: settings.sources,
          limit: settings.maxResults,
          includeAnalytics: settings.includeAnalytics
        })

        // Call onSearch prop if provided
        onSearch?.(query, settings)

        // Navigate to results page
        const searchParams = new URLSearchParams({
          q: query,
          sources: settings.sources.join(","),
          confidence: settings.minimumConfidence.toString(),
          analytics: settings.includeAnalytics.toString()
        })
        router.push(`/search/results?${searchParams.toString()}`)
        inputRef.current?.blur()
      } catch (error) {
        console.error('Search error:', error)
      }
    }
  }, [query, settings, router, search, onSearch])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const toggleSource = (sourceId: string) => {
    setSettings(prev => ({
      ...prev,
      sources: prev.sources.includes(sourceId)
        ? prev.sources.filter(id => id !== sourceId)
        : [...prev.sources, sourceId]
    }))
  }

  const sources = [
    { id: "google", label: "Google", icon: Globe },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "crunchbase", label: "Crunchbase", icon: Database }
  ]

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
        {/* Search Bar */}
        <div className={cn(
          "relative flex items-center w-full h-12 bg-white dark:bg-slate-800 border border-slate-200",
          "dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md",
          isFocused && "shadow-md ring-2 ring-blue-500/20",
          showSuggestionsList ? "rounded-t-3xl" : "rounded-full"
        )}>
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
            className="w-full h-full text-base bg-transparent border-none focus:ring-0 focus-visible:ring-0"
          />

          <div className="flex items-center gap-2 px-4">
            <Mic className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
            <Popover>
              <PopoverTrigger>
                <SlidersHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Minimum Confidence</h4>
                    <Slider
                      value={[settings.minimumConfidence]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={([value]) => 
                        setSettings(prev => ({ ...prev, minimumConfidence: value }))
                      }
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-500">Low</span>
                      <span className="text-xs text-slate-500">High</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Max Results</h4>
                    <Input
                      type="number"
                      value={settings.maxResults}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, maxResults: parseInt(e.target.value) || 50 }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Include Analytics</span>
                    <input
                      type="checkbox"
                      checked={settings.includeAnalytics}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, includeAnalytics: e.target.checked }))
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestionsList && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 shadow-md rounded-b-3xl z-50">
            <ul className="py-1">
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
                    {suggestion.icon || <History className="w-4 h-4 text-slate-400" />}
                    <span className="flex-1 text-sm">{suggestion.text}</span>
                    {suggestion.confidence && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Source Selection and Search Button */}
      <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>

        {sources.map(({ id, label, icon: Icon }) => (
          <TooltipProvider key={id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={settings.sources.includes(id) ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center gap-1.5",
                    settings.sources.includes(id) 
                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                  onClick={() => toggleSource(id)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search in {label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}
