"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config.client';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Send, MailOpen, MessageSquarePlus, Filter as FilterIcon, PlusCircle, Edit3, RotateCcw } from 'lucide-react';

interface ReviewRequestRecord {
  id: string;
  dateSent: string;
  recipientName: string;
  recipientEmail: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Reviewed' | 'Failed' | 'Bounced';
  platform: string; // e.g., 'Google', 'Trustpilot'
  campaign?: string;
}

const ReviewRequestsPage = () => {
  const { t } = useTranslation('reviewsRequestsPage');

  // Mock data
  const stats = {
    sentToday: 25,
    openRate: 45, // Percentage
    reviewsFromRequests: 12,
  };

  const requests: ReviewRequestRecord[] = [
    { id: 'req001', dateSent: '2023-11-05', recipientName: 'Alice Johnson', recipientEmail: 'alice.j@example.com', status: 'Reviewed', platform: 'Google', campaign: 'Q4 Push' },
    { id: 'req002', dateSent: '2023-11-05', recipientName: 'Bob Williams', recipientEmail: 'bob.w@example.com', status: 'Opened', platform: 'Trustpilot' },
    { id: 'req003', dateSent: '2023-11-04', recipientName: 'Carol Davis', recipientEmail: 'carol.d@example.com', status: 'Sent', platform: 'Google' },
    { id: 'req004', dateSent: '2023-11-04', recipientName: 'David Miller', recipientEmail: 'david.m@example.com', status: 'Clicked', platform: 'Capterra', campaign: 'SaaS Promo' },
    { id: 'req005', dateSent: '2023-11-03', recipientName: 'Eve Wilson', recipientEmail: 'eve.w@example.com', status: 'Failed', platform: 'Google' },
  ];

  const getStatusBadgeStyle = (status: ReviewRequestRecord['status']) => {
    switch (status) {
      case 'Reviewed': return 'bg-green-100 text-green-700';
      case 'Clicked': return 'bg-sky-100 text-sky-700'; // Using sky for Clicked
      case 'Opened': return 'bg-blue-100 text-blue-700';
      case 'Sent': return 'bg-indigo-100 text-indigo-700';
      case 'Failed':
      case 'Bounced': return 'bg-red-100 text-red-700';
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
            title={t('metrics.sentToday.title')} 
            value={stats.sentToday} 
            icon={<Send className="text-blue-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.openRate.title')} 
            value={`${stats.openRate}%`} 
            icon={<MailOpen className="text-emerald-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.reviewsFromRequests.title')} 
            value={stats.reviewsFromRequests} 
            icon={<MessageSquarePlus className="text-amber-600" />} 
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center space-x-3">
              <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center text-sm">
                <FilterIcon size={16} className="mr-2" /> {t('filters.title')}
              </button>
              {/* Placeholder for more filters */}
            </div>
            <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-2 px-4 rounded-lg flex items-center text-sm w-full md:w-auto justify-center">
              <PlusCircle size={18} className="mr-2" /> {t('actions.sendNew')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.headers.dateSent')}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.headers.recipient')}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.headers.platform')}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.headers.campaign')}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.headers.status')}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('table.headers.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-700">{req.dateSent}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{req.recipientName}</div>
                      <div className="text-xs text-gray-500">{req.recipientEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{req.platform}</td>
                    <td className="px-4 py-3 text-gray-700">{req.campaign || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(req.status)}`}>
                        {t(`status.${req.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <button title={t('actions.resend')} className="text-blue-600 hover:text-blue-800 mr-2"><RotateCcw size={16}/></button>
                      <button title={t('actions.viewDetails')} className="text-gray-500 hover:text-gray-700"><Edit3 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {requests.length === 0 && <p className="text-center py-6 text-gray-500">{t('table.emptyMessage')}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReviewRequestsPage;
