"use client"

import { Badge } from "@/src/components/ui/badge"
import { Globe, Linkedin, Database, Building2, MapPin, Users, X } from "lucide-react"

interface ScopeBadgesProps {
  selectedSources: string[]
  filters: {
    industry?: string
    location_text?: string
    employeeCount?: string
  }
  onRemoveSource?: (source: string) => void
  onRemoveFilter?: (filter: string) => void
}

export function ScopeBadges({ selectedSources, filters, onRemoveSource, onRemoveFilter }: ScopeBadgesProps) {
  const sourceIcons = {
    google: Globe,
    linkedin: Linkedin,
    crunchbase: Database,
  }

  const getSourceLabel = (source: string) => {
    const labels = {
      google: "Google",
      linkedin: "LinkedIn",
      crunchbase: "Crunchbase",
    }
    return labels[source as keyof typeof labels] || source
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Source badges */}
      {selectedSources.map((source) => {
        const Icon = sourceIcons[source as keyof typeof sourceIcons]
        return (
          <Badge
            key={source}
            variant="outline"
            className="flex items-center gap-1 bg-primary/5 border-primary/20 text-primary px-3 py-1 rounded-full"
          >
            {Icon && <Icon className="w-3 h-3" />}
            {getSourceLabel(source)}
            {onRemoveSource && (
              <X className="w-3 h-3 ml-1 cursor-pointer hover:text-primary/80" onClick={() => onRemoveSource(source)} />
            )}
          </Badge>
        )
      })}

      {/* Filter badges */}
      {filters.industry && filters.industry !== "All Industries" && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 px-3 py-1 rounded-full"
        >
          <Building2 className="w-3 h-3" />
          {filters.industry}
          {onRemoveFilter && (
            <X className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-600" onClick={() => onRemoveFilter("industry")} />
          )}
        </Badge>
      )}

      {filters.location_text && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-amber-50 border-amber-200 text-amber-700 px-3 py-1 rounded-full"
        >
          <MapPin className="w-3 h-3" />
          {filters.location_text}
          {onRemoveFilter && (
            <X
              className="w-3 h-3 ml-1 cursor-pointer hover:text-amber-600"
              onClick={() => onRemoveFilter("location_text")}
            />
          )}
        </Badge>
      )}

      {filters.employeeCount && filters.employeeCount !== "All Sizes" && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700 px-3 py-1 rounded-full"
        >
          <Users className="w-3 h-3" />
          {filters.employeeCount}
          {onRemoveFilter && (
            <X
              className="w-3 h-3 ml-1 cursor-pointer hover:text-purple-600"
              onClick={() => onRemoveFilter("employeeCount")}
            />
          )}
        </Badge>
      )}
    </div>
  )
}
