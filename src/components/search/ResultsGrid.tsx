import Link from "next/link"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Building2, Mail, Phone, Globe, Calendar } from "lucide-react"
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

interface ResultsGridProps {
  companies: Company[]
  layout?: "grid" | "list"
}

export function ResultsGrid({ companies, layout = "grid" }: ResultsGridProps) {
  const { t } = useTranslation()

  if (layout === "list") {
    return (
      <div className="space-y-4">
        {companies.map((company) => (
          <Link href={`/companies/${company.id}`} key={company.id} className="block">
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-servicenow-md border-l-4 border-l-accent">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                    {company.logo ? (
                      <img
                        src={company.logo || "/placeholder.svg"}
                        alt={company.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold truncate">{company.name}</h3>
                      <Badge variant={company.confidenceScore > 90 ? "success" : "default"} className="ml-2">
                        {company.confidenceScore}% {t("search.confidence")}
                      </Badge>
                    </div>
                    <p className="text-sm text-secondary truncate">
                      {company.industry} • {company.location_text}
                    </p>
                    <p className="text-sm truncate mt-1">{company.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <Link href={`/companies/${company.id}`} key={company.id} className="block">
          <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-servicenow-md hover:translate-y-[-2px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                  {company.logo ? (
                    <img
                      src={company.logo || "/placeholder.svg"}
                      alt={company.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold truncate">{company.name}</h3>
                  <p className="text-xs text-secondary truncate">{company.domain}</p>
                </div>
                <Badge variant={company.confidenceScore > 90 ? "success" : "default"} className="ml-auto">
                  {company.confidenceScore}%
                </Badge>
              </div>

              <p className="text-sm mb-3 line-clamp-2">{company.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-secondary">
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="truncate">{company.location_text}</span>
                </div>
                {company.extractedData.emails.length > 0 && (
                  <div className="flex items-center text-secondary">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{company.extractedData.emails[0]}</span>
                  </div>
                )}
                {company.extractedData.phones.length > 0 && (
                  <div className="flex items-center text-secondary">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="truncate">{company.extractedData.phones[0]}</span>
                  </div>
                )}
                <div className="flex items-center text-secondary">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="truncate">{new Date(company.lastScraped).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {company.extractedData.technologies.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="outline" className="bg-muted/50">
                    {tech}
                  </Badge>
                ))}
                {company.extractedData.technologies.length > 3 && (
                  <Badge variant="outline" className="bg-muted/50">
                    +{company.extractedData.technologies.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
