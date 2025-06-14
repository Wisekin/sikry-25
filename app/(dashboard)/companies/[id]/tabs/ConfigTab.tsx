import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Separator } from "@/src/components/ui/separator"
import { Settings } from "lucide-react"

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

interface ConfigTabProps {
  company: CompanyData
}

export function ConfigTab({ company }: ConfigTabProps) {
  const { t } = useTranslation(['companiesPage', 'common']);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {t("tabs.configuration.title", { ns: 'companiesPage' })}
        </CardTitle>
        <CardDescription>{t("tabs.configuration.description", { ns: 'companiesPage' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">{t("tabs.configuration.autoDetection.title", { ns: 'companiesPage' })}</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-caption">{t("tabs.configuration.autoDetection.emailLabel", { ns: 'companiesPage' })}</span>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                  {t("status.enabled", { ns: 'common' })}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-caption">{t("tabs.configuration.autoDetection.phoneLabel", { ns: 'companiesPage' })}</span>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                  {t("status.enabled", { ns: 'common' })}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-caption">{t("tabs.configuration.autoDetection.techStackLabel", { ns: 'companiesPage' })}</span>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                  {t("status.enabled", { ns: 'common' })}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-caption">{t("tabs.configuration.autoDetection.socialMediaLabel", { ns: 'companiesPage' })}</span>
                <Badge variant="outline">{t("status.disabled", { ns: 'common' })}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">{t("tabs.configuration.confidenceThresholds.title", { ns: 'companiesPage' })}</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-caption mb-2">
                  <span>{t("tabs.configuration.confidenceThresholds.minScoreLabel", { ns: 'companiesPage' })}</span>
                  <span>{t("percentageFormat", { ns: 'common', value: 70 })}</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button>{t("tabs.configuration.buttons.save", { ns: 'companiesPage' })}</Button>
            <Button variant="outline">{t("tabs.configuration.buttons.resetToDefaults", { ns: 'companiesPage' })}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
