import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { ConfidenceBadge } from "@/src/components/company/ConfidenceBadge"
import { Building2, Globe, MapPin, Users, Calendar, ExternalLink } from "lucide-react"
import { Heading } from "@/src/components/core/typography/Heading"
import { Text } from "@/src/components/core/typography/Text"

interface CompanyData {
  id: string
  name: string
  domain: string
  location_text: string
  industry: string
  employees: string
  description: string
  logo?: string
  founded?: string
  website: string
  extractedData: {
    emails: Array<{ value: string; confidence: number; source: string }>
    phones: Array<{ value: string; confidence: number; source: string }>
    technologies: Array<{ value: string; confidence: number; category: string }>
    addresses: Array<{ value: string; confidence: number; type: string }>
    socialMedia: Array<{ platform: string; url: string; confidence: number }>
  }
  confidenceScore: number
  lastScraped: string
  scrapingHistory: Array<{ date: string; fieldsFound: number; confidence: number }>
}

interface CompanyHeaderProps {
  company: CompanyData
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              {company.logo ? (
                <img src={company.logo || "/placeholder.svg"} alt={company.name} className="w-12 h-12 rounded-lg" />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <Heading level={1}>{company.name}</Heading>
              <div className="flex items-center gap-4 mt-2 text-secondary">
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    {company.domain}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{company.location_text}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{company.employees} employees</span>
                </div>
                {company.founded && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Founded {company.founded}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConfidenceBadge score={company.confidenceScore} size="lg" showIcon />
            <Button>
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Website
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{company.industry}</Badge>
          <Badge variant="outline">Last updated: {new Date(company.lastScraped).toLocaleDateString()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Text className="text-secondary">{company.description}</Text>
      </CardContent>
    </Card>
  )
}
