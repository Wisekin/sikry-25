'use client'

import { useTranslation } from 'react-i18next'

export default function StatisticsOverviewPage() {
  const { t } = useTranslation('statisticsOverviewPage')

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
