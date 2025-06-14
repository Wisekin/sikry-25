"use client"; // For stateful components like dropdowns

import React, { useState } from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { TrendingUp, Users, Percent, Clock, CheckCircle2, XCircle, ChevronDown, ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FunnelStageProgress {
  id: string;
  name: string;
  leadsInStage: number;
  conversionRateToStage: number; // % from previous or total entries
  dropOffRateFromStage: number; // %
}

interface LeadInFunnel {
  id: string;
  name: string;
  email: string;
  currentStage: string;
  entryDate: string;
  timeInStage: string; // e.g., "3 days"
  status: 'Progressing' | 'Stalled' | 'Converted' | 'Dropped';
}

interface FunnelProgressData {
  id: string;
  name: string;
  overallStats: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number; // Percentage
    avgTimeInFunnelDays: number;
  };
  stages: FunnelStageProgress[];
  leadsDetail: LeadInFunnel[]; // Simplified for now, could be paginated/filtered
}

// Mock Data
const mockFunnelsListData = [
    { id: 'fnl_onboarding_001', name: 'SaaS Trial Onboarding Funnel' },
    { id: 'fnl_webinar_002', name: 'Webinar Signup Funnel' },
];

const mockFunnelProgressDetails: Record<string, FunnelProgressData> = {
  'fnl_onboarding_001': {
    id: 'fnl_onboarding_001',
    name: 'SaaS Trial Onboarding Funnel',
    overallStats: { totalLeads: 250, convertedLeads: 50, conversionRate: 20, avgTimeInFunnelDays: 7 },
    stages: [
      { id: 's1', name: 'Trial Signup', leadsInStage: 100, conversionRateToStage: 100, dropOffRateFromStage: 10 },
      { id: 's2', name: 'Welcome Email Sent', leadsInStage: 90, conversionRateToStage: 90, dropOffRateFromStage: 5 },
      { id: 's3', name: 'Feature Used', leadsInStage: 70, conversionRateToStage: 78, dropOffRateFromStage: 15 },
      { id: 's4', name: 'Converted to Paid', leadsInStage: 50, conversionRateToStage: 71, dropOffRateFromStage: 0 },
    ],
    leadsDetail: [
      { id: 'lead001', name: 'Alice Wonderland', email: 'alice@example.com', currentStage: 'Feature Used', entryDate: '2023-11-10', timeInStage: '2 days', status: 'Progressing' },
      { id: 'lead002', name: 'Bob The Builder', email: 'bob@example.com', currentStage: 'Welcome Email Sent', entryDate: '2023-11-12', timeInStage: '5 days', status: 'Stalled' },
      { id: 'lead003', name: 'Charlie Brown', email: 'charlie@example.com', currentStage: 'Converted to Paid', entryDate: '2023-11-01', timeInStage: 'N/A', status: 'Converted' },
    ]
  },
   'fnl_webinar_002': {
    id: 'fnl_webinar_002',
    name: 'Webinar Signup Funnel',
    overallStats: { totalLeads: 500, convertedLeads: 150, conversionRate: 30, avgTimeInFunnelDays: 3 },
    stages: [
      { id: 'ws1', name: 'Visited Landing Page', leadsInStage: 300, conversionRateToStage: 100, dropOffRateFromStage: 20 },
      { id: 'ws2', name: 'Registered for Webinar', leadsInStage: 200, conversionRateToStage: 67, dropOffRateFromStage: 25 },
      { id: 'ws3', name: 'Attended Webinar', leadsInStage: 150, conversionRateToStage: 75, dropOffRateFromStage: 10 },
      { id: 'ws4', name: 'Post-Webinar Action', leadsInStage: 100, conversionRateToStage: 67, dropOffRateFromStage: 0 },
    ],
    leadsDetail: [
      { id: 'lead101', name: 'Diana Prince', email: 'diana@example.com', currentStage: 'Attended Webinar', entryDate: '2023-10-20', timeInStage: '1 day', status: 'Progressing' },
    ]
  }
};


const FunnelProgressPage = () => {
  const { t } = useTranslation('funnelProgressPage');
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>(mockFunnelsListData[0].id);
  const currentFunnelData = mockFunnelProgressDetails[selectedFunnelId];

  const getStatusBadgeStyle = (status: LeadInFunnel['status']) => {
    switch (status) {
      case 'Converted': return 'bg-green-100 text-green-700';
      case 'Progressing': return 'bg-blue-100 text-blue-700';
      case 'Stalled': return 'bg-yellow-100 text-yellow-700';
      case 'Dropped': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />

      <div className="p-6 md:p-10">
        {currentFunnelData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <QualityMetricCard title={t('metrics.totalLeads.title')} value={currentFunnelData.overallStats.totalLeads.toLocaleString()} icon={<Users className="text-blue-600" />} />
            <QualityMetricCard title="Converted Leads" value={currentFunnelData.overallStats.convertedLeads.toLocaleString()} icon={<CheckCircle2 className="text-green-600" />} />
            <QualityMetricCard title="Funnel Conv. Rate" value={`${currentFunnelData.overallStats.conversionRate.toFixed(1)}%`} icon={<Percent className="text-emerald-600" />} />
            <QualityMetricCard title="Avg. Time in Funnel" value={`${currentFunnelData.overallStats.avgTimeInFunnelDays} days`} icon={<Clock className="text-purple-600" />} />
          </div>
        )}

        {/* Funnel Selector */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <label htmlFor="funnelSelect" className="text-sm font-medium text-gray-700">Select Funnel:</label>
            <select
                id="funnelSelect"
                value={selectedFunnelId}
                onChange={(e) => setSelectedFunnelId(e.target.value)}
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[250px]"
            >
                {mockFunnelsListData.map(funnel => (
                    <option key={funnel.id} value={funnel.id}>{funnel.name}</option>
                ))}
            </select>
        </div>

        {/* Funnel Stages Visualization */}
        {currentFunnelData && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4 flex items-center">{t('topFunnels.title')}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-2 overflow-x-auto pb-4">
              {currentFunnelData.stages.map((stage, index) => (
                <div key={stage.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-w-[200px] md:min-w-[220px] flex-shrink-0">
                  <h3 className="text-md font-semibold text-gray-700 mb-1">{index + 1}. {stage.name}</h3>
                  <p className="text-2xl font-bold text-[#1B1F3B] mb-1">{stage.leadsInStage.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Leads in Stage</p>
                  <div className="mt-2 text-xs space-y-0.5">
                    <p className="text-green-600">Conv. to Stage: {stage.conversionRateToStage.toFixed(1)}%</p>
                    <p className="text-red-600">Drop-off: {stage.dropOffRateFromStage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Table Section */}
        {currentFunnelData && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#1B1F3B]">Leads in '{currentFunnelData.name}'</h2>
                <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg flex items-center text-sm">
                    <ListFilter size={16} className="mr-2" /> Filter Leads
                </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Current Stage</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Entry Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Time in Stage</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentFunnelData.leadsDetail.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">{lead.name}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.currentStage}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.entryDate}</td>
                      <td className="px-4 py-3 text-gray-600">{lead.timeInStage}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {currentFunnelData.leadsDetail.length === 0 && <p className="text-center py-6 text-gray-500">No leads to display for this funnel.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelProgressPage;
