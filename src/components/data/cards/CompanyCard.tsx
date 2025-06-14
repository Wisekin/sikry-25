import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { ConfidenceBadge } from "@/src/components/company/ConfidenceBadge"
import { DataFieldPill } from "@/src/components/company/DataFieldPill"
import { useTranslation } from "react-i18next"
import {
  Building2,
  MapPin,
  Users,
  Globe,
  ExternalLink,
  MessageSquare,
  Download,
  TrendingUp,
  Calendar,
  Star,
} from "lucide-react"
import Link from "next/link"
import { Text } from "@/src/components/core/typography/Text"

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
  trending?: boolean
  featured?: boolean
}

interface CompanyCardProps {
  company: Company
  layout?: "grid" | "list"
}

export function CompanyCard({ company, layout = "grid" }: CompanyCardProps) {
  const isListLayout = layout === "list"
  const { t } = useTranslation()

  return (
    <Card
      className={`
      servicenow-card group cursor-pointer relative overflow-hidden
      ${isListLayout ? "flex" : ""}
      ${company.featured ? "ring-2 ring-accent ring-opacity-50" : ""}
    `}
    >
      {/* Featured/Trending Indicators */}
      {company.featured && (
        <div className="absolute top-3 right-3 z-10">
          <div className="servicenow-badge servicenow-badge-accent">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </div>
        </div>
      )}

      {company.trending && (
        <div className="absolute top-3 left-3 z-10">
          <div className="servicenow-badge servicenow-badge-success">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending
          </div>
        </div>
      )}

      <CardHeader className={`${isListLayout ? "flex-1" : ""} relative`}>
        <div className={`flex ${isListLayout ? "items-center gap-4" : "items-start justify-between"}`}>
          <div className={`flex items-center gap-3 ${isListLayout ? "flex-1" : ""}`}>
            {/* Company Logo/Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-secondary rounded-lg flex items-center justify-center shadow-servicenow group-hover:shadow-servicenow-md transition-all duration-200">
                {company.logo ? (
                  <img
                    src={company.logo || "/placeholder.svg"}
                    alt={company.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-white" />
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white shadow-sm" />
            </div>

            <div className={isListLayout ? "flex-1" : ""}>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg text-text-primary group-hover:text-accent transition-colors">
                  {company.name}
                </h3>
                <ConfidenceBadge score={company.confidenceScore} size="sm" />
              </div>
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <Globe className="w-3 h-3" />
                <span className="hover:text-accent transition-colors cursor-pointer">{company.domain}</span>
              </div>
            </div>
          </div>
        </div>

        {!isListLayout && (
          <div className="space-y-3 mt-4">
            {/* Company Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <MapPin className="w-3 h-3 text-accent" />
                <span>{company.location_text}</span>
              </div>
              <div className="flex items-center gap-2 text-caption text-text-secondary">
                <Users className="w-3 h-3 text-accent" />
                <span>
                  {company.employees} {t("companies.employees")}
                </span>
              </div>
            </div>

            {/* Industry Badge */}
            <div className="flex items-center gap-2">
              <Badge className="servicenow-badge servicenow-badge-primary">{company.industry}</Badge>
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Calendar className="w-3 h-3" />
                <span>
                  {t("companies.lastUpdated")}: {new Date(company.lastScraped).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className={`${isListLayout ? "flex-1" : ""}`}>
        {isListLayout ? (
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 text-caption text-text-secondary mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span>{company.location_text}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-accent" />
                  <span>{company.employees}</span>
                </div>
                <Badge className="servicenow-badge servicenow-badge-primary text-xs">{company.industry}</Badge>
              </div>
              <Text size="sm" className="text-text-secondary line-clamp-2">
                {company.description}
              </Text>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="servicenow-button-accent">
                <Download className="w-3 h-3 mr-1" />
                {t("companies.scrape")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-white"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                {t("companies.contact")}
              </Button>
              <Button size="sm" asChild className="servicenow-button-primary">
                <Link href={`/companies/${company.id}`}>
                  {t("companies.viewDetails")}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Description */}
            <Text size="sm" className="text-text-secondary mb-4 line-clamp-3">
              {company.description}
            </Text>

            {/* Extracted Data Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-caption font-semibold text-text-primary flex items-center gap-2">
                  {t("companies.extractedData")}
                  <div className="h-px bg-border flex-1" />
                </h4>
                <div className="flex flex-wrap gap-1">
                  {company.extractedData.emails.slice(0, 2).map((email, index) => (
                    <DataFieldPill key={index} type="email" value={email} />
                  ))}
                  {company.extractedData.phones.slice(0, 2).map((phone, index) => (
                    <DataFieldPill key={index} type="phone" value={phone} />
                  ))}
                  {company.extractedData.technologies.slice(0, 3).map((tech, index) => (
                    <DataFieldPill key={index} type="technology" value={tech} />
                  ))}
                  {company.extractedData.emails.length +
                    company.extractedData.phones.length +
                    company.extractedData.technologies.length >
                    7 && (
                    <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                      +
                      {company.extractedData.emails.length +
                        company.extractedData.phones.length +
                        company.extractedData.technologies.length -
                        7}{" "}
                      more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {t("companies.scrape")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {t("companies.contact")}
                  </Button>
                </div>
                <Button size="sm" asChild className="servicenow-button-primary">
                  <Link href={`/companies/${company.id}`}>
                    {t("companies.viewDetails")}
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
