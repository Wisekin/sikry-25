import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { ConfidenceMeter } from "@/src/components/confidence-meter"
import { DataFieldPill } from "@/src/components/data-field-pill"
import { Building2, MapPin, Users, Globe, ExternalLink } from "lucide-react"
import Link from "next/link"

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

interface CompanyCardProps {
  company: Company
  layout?: "grid" | "list"
}

export function CompanyCard({ company, layout = "grid" }: CompanyCardProps) {
  const isListLayout = layout === "list"

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${isListLayout ? "flex" : ""}`}>
      <CardHeader className={`${isListLayout ? "flex-1" : ""}`}>
        <div className={`flex ${isListLayout ? "items-center gap-4" : "items-start justify-between"}`}>
          <div className={`flex items-center gap-3 ${isListLayout ? "flex-1" : ""}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-600 rounded-lg flex items-center justify-center">
              {company.logo ? (
                <img src={company.logo || "/placeholder.svg"} alt={company.name} className="w-8 h-8 rounded" />
              ) : (
                <Building2 className="w-6 h-6 text-white" />
              )}
            </div>
            <div className={isListLayout ? "flex-1" : ""}>
              <h3 className="font-semibold text-lg">{company.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-3 h-3" />
                <span>{company.domain}</span>
              </div>
            </div>
          </div>

          {!isListLayout && <ConfidenceMeter score={company.confidenceScore} size="sm" />}
        </div>

        {!isListLayout && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{company.location_text}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{company.employees} employees</span>
            </div>
            <Badge variant="secondary">{company.industry}</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className={`${isListLayout ? "flex-1" : ""}`}>
        {isListLayout ? (
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{company.location_text}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{company.employees}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {company.industry}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <ConfidenceMeter score={company.confidenceScore} size="sm" />
              <Button asChild>
                <Link href={`/companies/${company.id}`}>
                  View Details
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{company.description}</p>

            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Extracted Data</h4>
                <div className="flex flex-wrap gap-1">
                  {company.extractedData.emails.map((email, index) => (
                    <DataFieldPill key={index} type="email" value={email} />
                  ))}
                  {company.extractedData.phones.map((phone, index) => (
                    <DataFieldPill key={index} type="phone" value={phone} />
                  ))}
                  {company.extractedData.technologies.slice(0, 3).map((tech, index) => (
                    <DataFieldPill key={index} type="technology" value={tech} />
                  ))}
                  {company.extractedData.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{company.extractedData.technologies.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  Last updated: {new Date(company.lastScraped).toLocaleDateString()}
                </span>
                <Button size="sm" asChild>
                  <Link href={`/companies/${company.id}`}>
                    View Details
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
