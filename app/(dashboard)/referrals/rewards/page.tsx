"use client";
import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config.client';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Gift, DollarSign, HelpCircle, ListChecks, Users } from 'lucide-react';

const ReferralRewardsPage = () => {
  const { t, ready } = useTranslation('referralsRewardsPage');
  if (!ready) return null;

  // Get arrays from translation files
  const rewardTiers = t('rewardDetails.tiers', { returnObjects: true }) as Array<any>;
  const eligibilityNotes = t('eligibility.notes', { returnObjects: true }) as string[];
  const faqItems = t('faq.items', { returnObjects: true }) as Array<{ question: string; answer: string }>;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader
        title={t('header.defaultProgramName')}
        subtitle={t('header.subtitle')}
      />
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard
            title={t('metrics.referrerRewardStandard.title')}
            value={rewardTiers?.[0]?.rewardForReferrer || ''}
            icon={<Gift size={24} className="text-indigo-500" />}
          />
          <QualityMetricCard
            title={t('metrics.refereeRewardStandard.title')}
            value={rewardTiers?.[0]?.rewardForReferee || ''}
            icon={<DollarSign size={24} className="text-green-500" />}
          />
          <QualityMetricCard
            title={t('metrics.friendsToInvite.title')}
            value={t('metrics.friendsToInvite.value')}
            icon={<Users size={24} className="text-blue-500" />}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-3 text-[#1B1F3B]">{t('howItWorks.title')}</h2>
          <p className="text-gray-700 leading-relaxed">{t('howItWorks.defaultSummary')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-[#1B1F3B]">{t('rewardDetails.title')}</h2>
          {rewardTiers?.map((tier, idx) => (
            <div key={tier.id || idx} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">{tier.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 mb-1">{t('rewardDetails.tier.referrerLabel')}</p>
                  <p className="font-semibold text-gray-800">{tier.rewardForReferrer}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-500 mb-1">{t('rewardDetails.tier.refereeLabel')}</p>
                  <p className="font-semibold text-gray-800">{tier.rewardForReferee}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">{t('rewardDetails.tier.conditionsLabel')}</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-4">
                  {tier.conditions && tier.conditions.map((condition: string, index: number) => <li key={index}>{condition}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#1B1F3B] flex items-center">
              <ListChecks size={20} className="mr-2 text-gray-400" />
              {t('eligibility.title')}
            </h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 pl-4 leading-relaxed">
              {eligibilityNotes?.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-[#1B1F3B]">{t('claiming.title')}</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{t('claiming.defaultInfo')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-[#1B1F3B] flex items-center">
            <HelpCircle size={20} className="mr-2 text-gray-400" />
            {t('faq.title')}
          </h2>
          <div className="space-y-4">
            {faqItems?.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <h3 className="font-semibold text-gray-800">{item.question}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralRewardsPage;
