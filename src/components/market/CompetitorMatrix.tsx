import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src//components/ui/badge"
import { Button } from "@/src//components/ui/button"
import { BarChart3, Download } from "lucide-react"
import { Text } from "@/src//components/core/typography/Text"

export function CompetitorMatrix() {
  const { t } = useTranslation('marketIntelPage');
  const competitors = [
    {
      name: t('competitorMatrix.competitors.competitorA.name'),
      marketShare: 25,
      growth: 12,
      funding: t('competitorMatrix.competitors.competitorA.funding'),
      employees: t('competitorMatrix.competitors.competitorA.employees'),
      score: 85,
      threat: t('competitorMatrix.threatLevels.high'),
    },
    {
      name: t('competitorMatrix.competitors.competitorB.name'),
      marketShare: 18,
      growth: 8,
      funding: t('competitorMatrix.competitors.competitorB.funding'),
      employees: t('competitorMatrix.competitors.competitorB.employees'),
      score: 72,
      threat: t('competitorMatrix.threatLevels.medium'),
    },
    {
      name: t('competitorMatrix.competitors.competitorC.name'),
      marketShare: 15,
      growth: 15,
      funding: t('competitorMatrix.competitors.competitorC.funding'),
      employees: t('competitorMatrix.competitors.competitorC.employees'),
      score: 78,
      threat: t('competitorMatrix.threatLevels.high'),
    },
  ]

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case t('competitorMatrix.threatLevels.high'):
        return "bg-red-50 text-red-700 border-red-200"
      case t('competitorMatrix.threatLevels.medium'):
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case t('competitorMatrix.threatLevels.low'):
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      default:
        return "bg-muted text-secondary"
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('competitorMatrix.title')}
            </CardTitle>
            <CardDescription>{t('competitorMatrix.description')}</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('competitorMatrix.export')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-caption font-medium">{t('competitorMatrix.tableHeaders.company')}</th>
                <th className="text-left py-2 text-caption font-medium">{t('competitorMatrix.tableHeaders.marketShare')}</th>
                <th className="text-left py-2 text-caption font-medium">{t('competitorMatrix.tableHeaders.growth')}</th>
                <th className="text-left py-2 text-caption font-medium">{t('competitorMatrix.tableHeaders.funding')}</th>
                <th className="text-left py-2 text-caption font-medium">{t('competitorMatrix.tableHeaders.employees')}</th>
                <th className="text-left py-2 text-caption font-medium">{t('competitorMatrix.tableHeaders.score')}</th>
                <th className="text-left py-2 text-caption font-medium">{t('competitorMatrix.tableHeaders.threatLevel')}</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((competitor, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">
                    <Text className="font-medium">{competitor.name}</Text>
                  </td>
                  <td className="py-3">
                    <Text size="sm">{competitor.marketShare}%</Text>
                  </td>
                  <td className="py-3">
                    <Text size="sm" className="text-emerald-600">
                      +{competitor.growth}%
                    </Text>
                  </td>
                  <td className="py-3">
                    <Text size="sm">{competitor.funding}</Text>
                  </td>
                  <td className="py-3">
                    <Text size="sm">{competitor.employees}</Text>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {competitor.score}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className={`text-xs ${getThreatColor(competitor.threat)}`}>
                      {competitor.threat}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
