"use client"

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/i18n/config.client';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Users, Zap, TrendingUp, Filter, Settings, ListChecks } from 'lucide-react';

const ReEngagementPage = () => {
  const { t } = useTranslation('reengagementPage');
  
  const overviewStats = {
    coldLeadsIdentified: 1250,
    campaignsActive: 12,
    successfulReEngagements: 185,
    engagementRateLift: '15%',
  };

  const reEngagementFunnel = [
    { stage: t('funnel.stages.identified'), count: 1250, color: '#3B82F6' }, // Blue
    { stage: t('funnel.stages.contacted'), count: 980, color: '#10B981' },  // Green
    { stage: t('funnel.stages.responded'), count: 350, color: '#F59E0B' },  // Amber
    { stage: t('funnel.stages.reEngaged'), count: 185, color: '#6366F1' }, // Indigo
  ];
  const maxFunnelCount = Math.max(...reEngagementFunnel.map(item => item.count), 0) || 1;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader 
        title={t('header.title')} 
        subtitle={t('header.subtitle')} 
      />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QualityMetricCard
            title={t('overviewStats.coldLeads.title')}
            value={overviewStats.coldLeadsIdentified.toLocaleString()}
            icon={<Users size={24} className="text-blue-500"/>}
            change={t('overviewStats.coldLeads.change')}
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title={t('overviewStats.activeCampaigns.title')}
            value={overviewStats.campaignsActive}
            icon={<Zap size={24} className="text-amber-500"/>}
            change={t('overviewStats.activeCampaigns.change')}
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title={t('overviewStats.successfulReEngagements.title')}
            value={overviewStats.successfulReEngagements.toLocaleString()}
            icon={<TrendingUp size={24} className="text-green-500"/>}
            change={t('overviewStats.successfulReEngagements.change')}
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title={t('overviewStats.engagementRateLift.title')}
            value={overviewStats.engagementRateLift}
            icon={<TrendingUp size={24} className="text-green-500"/>}
            change={t('overviewStats.engagementRateLift.change')}
            changeColor="text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/reengagement/classification" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#3C4568] transition-all duration-200">
            <div className="flex items-center mb-3">
              <Filter size={20} className="mr-3 text-blue-600" />
              <h3 className="text-xl font-semibold text-[#1B1F3B]">{t('navLinks.classification.title')}</h3>
            </div>
            <p className="text-sm text-gray-600">{t('navLinks.classification.description')}</p>
          </Link>

          <Link href="/reengagement/tasks" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#3C4568] transition-all duration-200">
            <div className="flex items-center mb-3">
              <ListChecks size={20} className="mr-3 text-green-600" />
              <h3 className="text-xl font-semibold text-[#1B1F3B]">{t('navLinks.tasks.title')}</h3>
            </div>
            <p className="text-sm text-gray-600">{t('navLinks.tasks.description')}</p>
          </Link>

          <Link href="/reengagement/automation" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#3C4568] transition-all duration-200">
            <div className="flex items-center mb-3">
              <Settings size={20} className="mr-3 text-indigo-600" />
              <h3 className="text-xl font-semibold text-[#1B1F3B]">{t('navLinks.automation.title')}</h3>
            </div>
            <p className="text-sm text-gray-600">{t('navLinks.automation.description')}</p>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-[#1B1F3B]">{t('funnel.title')}</h2>
          <div className="h-72 bg-gray-50 p-4 rounded flex items-end justify-around space-x-2">
            {reEngagementFunnel.map(item => (
              <div key={item.stage} className="text-center flex-1 flex flex-col items-center justify-end">
                <p className="text-sm font-medium text-gray-700">{item.count.toLocaleString()}</p>
                <div
                  className="w-12 md:w-16 mt-1 rounded-t-sm"
                  style={{ height: `${(item.count / maxFunnelCount) * 80}%`, backgroundColor: item.color, minHeight: '10px' }}
                  title={t('funnel.tooltip', { stageName: item.stage, count: item.count })}
                ></div>
                <p className="text-xs text-gray-500 mt-1">{item.stage}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReEngagementPage;
