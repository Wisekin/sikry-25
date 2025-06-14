  "use client"

  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
  import { AlertTriangle, Lock, ShieldCheck } from "lucide-react"
  import { useTranslation } from 'react-i18next';

  export default function SecurityPage() {
    const { t } = useTranslation('adminSecurityPage');

    // Mock data for values - in a real app, these would come from state or props
    const activeThreatsCount = 3;
    const twoFaPercentage = 98;
    const securityScoreValue = 92;
    const securityScoreMax = 100;

    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6 space-y-6">
          {/* Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{t('activeThreats.title')}</CardTitle>
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{activeThreatsCount}</div>
                <p className="text-xs text-gray-500">{t('activeThreats.description')}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{t('twoFaStatus.title')}</CardTitle>
                <Lock className="w-5 h-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{t('twoFaStatus.valueFormat', { percentage: twoFaPercentage })}</div>
                <p className="text-xs text-gray-500">{t('twoFaStatus.description')}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{t('securityScore.title')}</CardTitle>
                <ShieldCheck className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{t('securityScore.valueFormat', { score: securityScoreValue, maxScore: securityScoreMax })}</div>
                <p className="text-xs text-gray-500">{t('securityScore.description')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }


  // NOT AD TO IMPLEMENT AS A FEATURE OR PAGE:
/*<Card className="bg-white border-none shadow-sm">
<CardHeader>
  <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" />{t('apiKeys.title')}</CardTitle>
  <CardDescription>{t('apiKeys.description')}</CardDescription>
</CardHeader>
<CardContent>
  <Button>{t('apiKeys.button')}</Button>
</CardContent>
</Card>*/