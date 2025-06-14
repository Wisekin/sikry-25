import React from 'react'
import { Button } from "@/src/components/ui/button"
import { Database, Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

interface DataSourcesMenuProps {
  activeDataSources: Set<string>
  onToggleDataSource: (sourceId: string) => void
}

const dataSources = [
  { id: 'internal', name: 'Internal Database', icon: <Database className="h-4 w-4" /> },
  { id: 'wikidata', name: 'Wikidata', icon: <Globe className="h-4 w-4" /> },
  { id: 'opencorporates', name: 'OpenCorporates', icon: <Globe className="h-4 w-4" /> },
  { id: 'business_registries', name: 'Business Registries', icon: <Database className="h-4 w-4" /> }
]

export function DataSourcesMenu({ activeDataSources, onToggleDataSource }: DataSourcesMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Database className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {dataSources.map(source => (
          <DropdownMenuItem
            key={source.id}
            onClick={() => onToggleDataSource(source.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {source.icon}
              <span>{source.name}</span>
            </div>
            {activeDataSources.has(source.id) && (
              <div className="h-2 w-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
