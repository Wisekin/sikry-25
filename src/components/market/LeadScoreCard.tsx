import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src//components/ui/card";
import { Badge } from "@/src//components/ui/badge";
import { Progress } from "@/src//components/ui/progress";
import { Target, ArrowUp as ArrowTrendingUpIcon } from "lucide-react";
import { Text } from "@/src//components/core/typography/Text";

interface LeadScore {
  company: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

export function LeadScoreCard() {
  const { t } = useTranslation('marketIntelPage');
  
  // Get leads data from translations
  const leadsData = t('leadScoringCard.leads', { returnObjects: true }) as Array<{
    company: string;
    factors: string[];
  }>;
  
  // Map to LeadScore array with scores and trends
  const leadScores: LeadScore[] = [
    {
      ...leadsData[0],
      score: 95,
      trend: 'up' as const,
    },
    {
      ...leadsData[1],
      score: 78,
      trend: 'stable' as const,
    },
    {
      ...leadsData[2],
      score: 85,
      trend: 'up' as const,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-600" />
      case "down":
        return <ArrowTrendingUpIcon className="w-3 h-3 text-red-600 rotate-180" />
      default:
        return <div className="w-3 h-3 bg-yellow-600 rounded-full" />
    }
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          {t('leadScoringCard.title')}
        </CardTitle>
        <CardDescription>{t('leadScoringCard.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {leadScores.map((lead, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center justify-between">
              <Text className="font-medium">{lead.company}</Text>
              <div className="flex items-center gap-2">
                {getTrendIcon(lead.trend)}
                <span className={`font-semibold ${getScoreColor(lead.score)}`}>{lead.score}</span>
              </div>
            </div>

            <Progress value={lead.score} className="h-2" />

            <div className="space-y-1">
              {lead.factors.map((factor, factorIndex) => (
                <Badge key={factorIndex} variant="outline" className="text-xs mr-1 mb-1">
                  {factor}
                </Badge>
              ))}
            </div>

            {index < leadScores.length - 1 && <div className="border-b border-input" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
