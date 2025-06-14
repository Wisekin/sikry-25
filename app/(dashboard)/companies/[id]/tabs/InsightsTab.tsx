import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { TrendingUp } from "lucide-react"
import { Text } from "@/src/components/core/typography/Text"
import { Heading } from "@/src/components/core/typography/Heading"

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

interface InsightsTabProps {
  company: CompanyData
}

export function InsightsTab({ company }: InsightsTabProps) {
  const { t } = useTranslation(['companiesPage', 'common']);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>{t("tabs.insights.title", { ns: 'companiesPage' })}</CardTitle>
        <CardDescription>{t("tabs.insights.description", { ns: 'companiesPage' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-secondary mb-4" />
          <Heading level={3} className="mb-2">
            {t("tabs.insights.comingSoon.title", { ns: 'companiesPage' })}
          </Heading>
          <Text className="text-secondary">
            {t("tabs.insights.comingSoon.description", { ns: 'companiesPage' })}
          </Text>
        </div>
      </CardContent>
    </Card>
  )
}
