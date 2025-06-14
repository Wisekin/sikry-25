"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useTranslation } from "react-i18next"
import { Search, Filter, Download, RefreshCw } from "lucide-react"

type Column = {
  key: string
  label: string
  sortable?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onSearch?: (query: string) => void
  onFilter?: () => void
  onDownload?: () => void
  onRefresh?: () => void
  searchPlaceholder?: string
}

export function DataTable({
  columns,
  data,
  onSearch,
  onFilter,
  onDownload,
  onRefresh,
  searchPlaceholder,
}: DataTableProps) {
  const { t } = useTranslation('common')
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch?.(query)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || t('search.placeholder')}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
          {onFilter && (
            <Button variant="outline" size="icon" onClick={onFilter}>
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDownload && (
            <Button variant="outline" size="icon" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {columns.map((column) => (
                  <td key={column.key} className="p-4 align-middle">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
