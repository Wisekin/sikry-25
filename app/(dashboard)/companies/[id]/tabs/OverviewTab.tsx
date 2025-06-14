import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Separator } from "@/src/components/ui/separator"
import { DataFieldPill } from "@/src/components/company/DataFieldPill"
import { Shield, TrendingUp } from "lucide-react"
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

interface OverviewTabProps {
  company: CompanyData
}

export function OverviewTab({ company }: OverviewTabProps) {
  const { t } = useTranslation(['companiesPage', 'common']);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Extracted Data */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("tabs.overview.extractedData.title", { ns: 'companiesPage' })}
          </CardTitle>
          <CardDescription>{t("tabs.overview.extractedData.description", { ns: 'companiesPage' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emails */}
          <div>
            <h4 className="font-medium mb-3">{t("tabs.overview.extractedData.emailAddressesTitle", { ns: 'companiesPage' })}</h4>
            <div className="space-y-2">
              {company.extractedData.emails.map((email, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <DataFieldPill type="email" value={email.value} confidence={email.confidence} />
                  <Text size="sm" className="text-secondary">
                    {email.source}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Phones */}
          <div>
            <h4 className="font-medium mb-3">{t("tabs.overview.extractedData.phoneNumbersTitle", { ns: 'companiesPage' })}</h4>
            <div className="space-y-2">
              {company.extractedData.phones.map((phone, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <DataFieldPill type="phone" value={phone.value} confidence={phone.confidence} />
                  <Text size="sm" className="text-secondary">
                    {phone.source}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Technologies */}
          <div>
            <h4 className="font-medium mb-3">{t("tabs.overview.extractedData.technologiesTitle", { ns: 'companiesPage' })}</h4>
            <div className="grid grid-cols-2 gap-2">
              {company.extractedData.technologies.map((tech, index) => (
                <div key={index} className="p-2 bg-muted rounded-lg">
                  <DataFieldPill type="technology" value={tech.value} confidence={tech.confidence} />
                  <Text size="sm" className="text-secondary mt-1">
                    {tech.category}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Metrics */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t("tabs.overview.dataQualityMetrics.title", { ns: 'companiesPage' })}
          </CardTitle>
          <CardDescription>{t("tabs.overview.dataQualityMetrics.description", { ns: 'companiesPage' })}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-caption mb-2">
                <span>{t("tabs.overview.dataQualityMetrics.overallConfidenceLabel", { ns: 'companiesPage' })}</span>
                <span className="font-medium">{t("tabs.overview.dataQualityMetrics.percentageValue", { ns: 'companiesPage', value: company.confidenceScore })}</span>
              </div>
              <Progress value={company.confidenceScore} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-caption mb-2">
                <span>{t("tabs.overview.dataQualityMetrics.dataCompletenessLabel", { ns: 'companiesPage' })}</span>
                <span className="font-medium">{t("tabs.overview.dataQualityMetrics.percentageValue", { ns: 'companiesPage', value: 85 })}</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-caption mb-2">
                <span>{t("tabs.overview.dataQualityMetrics.sourceReliabilityLabel", { ns: 'companiesPage' })}</span>
                <span className="font-medium">{t("tabs.overview.dataQualityMetrics.percentageValue", { ns: 'companiesPage', value: 92 })}</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">{t("tabs.overview.dataQualityMetrics.scrapingHistoryTitle", { ns: 'companiesPage' })}</h4>
            <div className="space-y-2">
              {company.scrapingHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-caption">
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <Text size="sm" className="text-secondary">
                      {t("tabs.overview.dataQualityMetrics.fieldsFoundText", { ns: 'companiesPage', count: entry.fieldsFound })}
                    </Text>
                    <Badge variant="outline" className="text-xs">
                      {t("tabs.overview.dataQualityMetrics.percentageValue", { ns: 'companiesPage', value: entry.confidence })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
