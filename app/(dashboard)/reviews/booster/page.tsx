"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/src/i18n/config.client';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Zap, Rocket, Star, MessageSquareText, Send, Gift, QrCode as QrCodeLucide, Settings, List } from 'lucide-react'; // Zap for booster, Rocket for launch

interface BoosterStrategy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
}

interface ActiveBoosterCampaign {
  id: string;
  name: string;
  strategyName: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Draft';
  startDate: string;
  reviewsGenerated: number;
  avgRating?: number;
}

const ReviewBoosterPage = () => {
  const { t } = useTranslation('reviewsBoosterPage');

  // Mock data
  const stats = {
    activeCampaigns: 2,
    reviewsFromBooster: 48,
    avgRatingFromBooster: 4.7,
  };

  // Using QrCodeLucide if available, otherwise the placeholder will be used.
  const QrCodeComp = QrCodeLucide || (({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-12v8h8V3h-8zm6 6h-4V5h4v4zm0 8h-4v2h2v-2h2v2h-2v2h4v-4h-2v2h-2v-2zm-2 2v-2h2v2h-2zM13 9h2V7h-2v2zm0 4h2v-2h-2v2zm0-6h2V5h-2v2zm-2 4h2v-2H9v2zm0 2h2v-2H9v2zm0-4h2V9H9v2zm0-2h2V7H9v2zm-2 2h2V9H7v2zm0 2h2v-2H7v2z"/></svg>);


  const strategies: BoosterStrategy[] = [
    { 
      id: 'email_sequence', 
      name: t('strategies.emailSequence.name'), 
      description: t('strategies.emailSequence.description'), 
      icon: <Send className="w-6 h-6 text-blue-600" />, 
      actionText: t('strategies.emailSequence.actionText') 
    },
    { 
      id: 'sms_campaign', 
      name: t('strategies.smsCampaign.name'), 
      description: t('strategies.smsCampaign.description'), 
      icon: <MessageSquareText className="w-6 h-6 text-emerald-600" />, 
      actionText: t('strategies.smsCampaign.actionText') 
    },
    { 
      id: 'qr_generator', 
      name: t('strategies.qrGenerator.name'), 
      description: t('strategies.qrGenerator.description'), 
      icon: <QrCodeComp className="w-6 h-6 text-purple-600" />, 
      actionText: t('strategies.qrGenerator.actionText') 
    },
    { 
      id: 'social_contest', 
      name: t('strategies.socialContest.name'), 
      description: t('strategies.socialContest.description'), 
      icon: <Gift className="w-6 h-6 text-amber-600" />, 
      actionText: t('strategies.socialContest.actionText') 
    },
  ];

  const activeCampaigns: ActiveBoosterCampaign[] = [
    { id: 'camp001', name: 'Q4 Holiday Email Booster', strategyName: 'Post-Purchase Email Sequence', status: 'Active', startDate: '2023-10-15', reviewsGenerated: 35, avgRating: 4.8 },
    { id: 'camp002', name: 'VIP Customer SMS Push', strategyName: 'Targeted SMS Blasts', status: 'Paused', startDate: '2023-11-01', reviewsGenerated: 13, avgRating: 4.5 },
    { id: 'camp003', name: 'New Year Review Drive', strategyName: 'Post-Purchase Email Sequence', status: 'Draft', startDate: '2024-01-05', reviewsGenerated: 0 },
  ];

  const getStatusBadgeStyle = (status: ActiveBoosterCampaign['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Paused': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-blue-100 text-blue-700';
      case 'Draft': return 'bg-gray-200 text-gray-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader 
        title={t('header.title')} 
        subtitle={t('header.subtitle')} 
      />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard 
            title={t('metrics.activeCampaigns.title')} 
            value={stats.activeCampaigns} 
            icon={<Zap className="text-blue-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.reviewsFromBooster.title')} 
            value={stats.reviewsFromBooster} 
            icon={<MessageSquareText className="text-emerald-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.avgRating.title')} 
            value={stats.avgRatingFromBooster.toFixed(1)} 
            unit={t('metrics.avgRating.unit')} 
            icon={<Star className="text-amber-600" />} 
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#1B1F3B] mb-4">{t('strategies.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Adjusted to 2 columns for better content fit */}
            {strategies.map(strategy => (
              <div key={strategy.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center mb-3">
                    {strategy.icon}
                    <h3 className="ml-3 text-lg font-semibold text-[#1B1F3B]">{strategy.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{strategy.description}</p> {/* min-h for alignment */}
                </div>
                <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-2 px-4 rounded-lg text-sm self-start flex items-center transition-colors">
                  <Rocket size={16} className="mr-2" /> {strategy.actionText}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#1B1F3B]">{t('campaigns.title')}</h2>
            {/* <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center text-sm">
              <PlusCircle size={16} className="mr-2" /> Create New Campaign
            </button> */}
          </div>
          {activeCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">{t('campaigns.table.headers.name')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">{t('campaigns.table.headers.strategy')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">{t('campaigns.table.headers.startDate')}</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">{t('campaigns.table.headers.status')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 uppercase tracking-wider">{t('campaigns.table.headers.reviewsGenerated')}</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600 uppercase tracking-wider">{t('campaigns.table.headers.avgRating')}</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600 uppercase tracking-wider">{t('campaigns.table.headers.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeCampaigns.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{campaign.name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{campaign.strategyName}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{campaign.startDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeStyle(campaign.status)}`}>
                          {t(`campaigns.status.${campaign.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{campaign.reviewsGenerated.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{campaign.avgRating ? campaign.avgRating.toFixed(1) : '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button title={t('campaigns.actions.manage')} className="text-blue-600 hover:text-blue-800"><Settings size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">{t('campaigns.emptyMessage')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewBoosterPage;
