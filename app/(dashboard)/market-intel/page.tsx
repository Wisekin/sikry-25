"use client"

import { useTranslation } from 'react-i18next';
import { AppShell } from "@/src/components/core/layout/AppShell"
import { Heading } from "@/src/components/core/typography/Heading"
import { Text } from "@/src/components/core/typography/Text"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { CompetitorMatrix } from "@/src/components/market/CompetitorMatrix"
import { RelationshipGraph } from "@/src/components/market/RelationshipGraph"
import { LeadScoreCard } from "@/src/components/market/LeadScoreCard"
import { ArrowTrendingUpIcon, UserGroupIcon, LightBulbIcon, ChartBarIcon } from "@heroicons/react/24/solid"

export default function MarketIntelPage() {
  const { t } = useTranslation(['marketIntelPage', 'common']);
  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="border-b pb-6">
        <Heading level={1} className="text-gray-900">{t('title')}</Heading>
        <Text className="text-gray-500 mt-2">
          {t('subtitle')}
        </Text>
      </div>

      {/* Stats Overview - Modern Cards with Enhanced Hover */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <ChartBarIcon className="w-4 h-4 text-[#1B1F3B]" />
              {t('cards.marketSize.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B1F3B]">{t('cards.marketSize.value')}</div>
            <Text size="sm" className="flex items-center mt-1 text-emerald-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {t('cards.marketSize.growth')}
            </Text>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <UserGroupIcon className="w-4 h-4 text-[#1B1F3B]" />
              {t('cards.keyPlayers.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B1F3B]">{t('cards.keyPlayers.count')}</div>
            <Text size="sm" className="text-gray-500 mt-1">{t('cards.keyPlayers.description')}</Text>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <LightBulbIcon className="w-4 h-4 text-[#1B1F3B]" />
              {t('cards.leadScore.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B1F3B]">{t('cards.leadScore.score')}</div>
            <Text size="sm" className="flex items-center mt-1 text-emerald-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              {t('cards.leadScore.improvement')}
            </Text>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <LightBulbIcon className="w-4 h-4 text-[#1B1F3B]" />
              {t('cards.opportunities.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B1F3B]">{t('cards.opportunities.count')}</div>
            <Text size="sm" className="text-[#1B1F3B] font-medium mt-1">
              {t('cards.opportunities.description')}
            </Text>
          </CardContent>
        </Card>
      </div>

      {/* Insights Banner */}
      <div className="bg-gradient-to-r from-[#1B1F3B] to-[#2D325E] rounded-xl p-5 text-white transition-all duration-300 hover:shadow-lg hover:from-[#2A3050] hover:to-[#3C4568]">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{t('banner.title')}</h3>
            <p className="text-sm opacity-80 mt-1">
              {t('banner.description')}
            </p>
          </div>
          <button className="text-sm font-medium px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition">
            {t('banner.button')}
          </button>
        </div>
      </div>

      {/* Main Content - Modern Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-lg">{t('sections.competitorLandscape.title')}</CardTitle>
              <Text className="text-gray-500 text-sm">
                {t('sections.competitorLandscape.description')}
              </Text>
            </CardHeader>
            <CardContent>
              <CompetitorMatrix />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-lg">{t('sections.relationshipMapping.title')}</CardTitle>
              <Text className="text-gray-500 text-sm">
                {t('sections.relationshipMapping.description')}
              </Text>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              <RelationshipGraph />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-lg">{t('sections.leadScoring.title')}</CardTitle>
              <Text className="text-gray-500 text-sm">
                {t('sections.leadScoring.description')}
              </Text>
            </CardHeader>
            <CardContent>
              <LeadScoreCard />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:border hover:border-[#2A3050] hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-lg">{t('sections.marketTrends.title')}</CardTitle>
              <Text className="text-gray-500 text-sm">
                {t('sections.marketTrends.description')}
              </Text>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{t('sectors.fintech.name')}</span>
                    <span className="text-sm font-medium text-[#1B1F3B]">{t('sectors.fintech.growth')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#1B1F3B] h-2 rounded-full transition-all duration-500 ease-out" style={{width: '75%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{t('sectors.healthtech.name')}</span>
                    <span className="text-sm font-medium text-[#1B1F3B]">{t('sectors.healthtech.growth')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#1B1F3B] h-2 rounded-full transition-all duration-500 ease-out" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{t('sectors.saas.name')}</span>
                    <span className="text-sm font-medium text-[#1B1F3B]">{t('sectors.saas.growth')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#1B1F3B] h-2 rounded-full transition-all duration-500 ease-out" style={{width: '50%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{t('sectors.ecommerce.name')}</span>
                    <span className="text-sm font-medium text-[#1B1F3B]">{t('sectors.ecommerce.growth')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#1B1F3B] h-2 rounded-full transition-all duration-500 ease-out" style={{width: '40%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}