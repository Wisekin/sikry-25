"use client"

import { useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Building2, MapPin } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"

interface Company {
  id: string
  name: string
  domain: string
  location_text: string
  industry: string
  employees: string
  description: string
  logo?: string
  confidenceScore: number
  extractedData: {
    emails: string[]
    phones: string[]
    technologies: string[]
  }
  lastScraped: string
}

interface MapViewProps {
  companies: Company[]
}

export function MapView({ companies }: MapViewProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const { t } = useTranslation()

  // This is a placeholder for an actual map implementation
  // In a real application, you would use a library like Mapbox, Google Maps, or Leaflet
  return (
    <div className="relative w-full h-[600px] bg-muted rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-accent mx-auto mb-4" />
          <p className="text-lg font-medium">{t("search.map.placeholder")}</p>
          <p className="text-secondary">{t("search.map.companiesShown", { count: companies.length })}</p>
        </div>
      </div>

      {/* Company markers - in a real implementation, these would be positioned on the map */}
      <div className="absolute bottom-4 left-4 right-4 flex gap-4 overflow-x-auto pb-4">
        {companies.map((company) => (
          <Link href={`/companies/${company.id}`} key={company.id} className="block flex-shrink-0 w-64">
            <Card
              className={`transition-all duration-200 hover:shadow-servicenow-md ${
                selectedCompany?.id === company.id ? "border-accent" : ""
              }`}
              onClick={() => setSelectedCompany(company)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-background rounded-md flex items-center justify-center flex-shrink-0">
                    {company.logo ? (
                      <img
                        src={company.logo || "/placeholder.svg"}
                        alt={company.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{company.name}</h3>
                    <p className="text-xs text-secondary truncate">{company.location_text}</p>
                  </div>
                  <Badge variant={company.confidenceScore > 90 ? "success" : "default"} className="ml-auto text-xs">
                    {company.confidenceScore}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
