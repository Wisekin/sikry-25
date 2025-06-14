"use client"

import type React from "react"

import { useState } from "react"
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Input } from "@/src/components/ui/input"

interface UnifiedSearchProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function UnifiedSearch({ placeholder = "Search...", value = "", onChange, className = "" }: UnifiedSearchProps) {
  const [searchValue, setSearchValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    onChange?.(newValue)
  }

  const handleClear = () => {
    setSearchValue("")
    onChange?.("")
  }

  return (
    <div className={`relative ${className}`}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        className="pl-10 pr-10 py-2.5 rounded-full border-gray-200 bg-white shadow-sm focus:border-accent focus:ring-accent"
      />
      {searchValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
