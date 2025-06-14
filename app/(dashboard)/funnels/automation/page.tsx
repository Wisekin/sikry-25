"use client"; // For stateful components like dropdowns

import React, { useState } from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Zap, Settings2, AlertTriangle, CheckCircle2, PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FunnelAutomationRule {
  id: string;
  name: string;
  triggerDescription: string; // e.g., "Lead enters 'Stage X'" or "Stuck in 'Stage Y' for > 3 days"
  actionsSummary: string[]; // e.g., ["Send Email: 'Follow-up'", "Add Tag: 'Stalled'"]
  status: 'Active' | 'Inactive';
  timesTriggered: number;
  errorCount: number;
}

interface FunnelAutomationData {
  funnelId: string;
  funnelName: string;
  rules: FunnelAutomationRule[];
  // Aggregate stats for this funnel's automation
  activeRulesCount: number;
  totalAutomatedActionsToday: number; // Mocked
  totalErrorsToday: number; // Mocked
}


// Mock Data
const mockFunnelsListForAutomation = [
    { id: 'fnl_onboarding_001', name: 'SaaS Trial Onboarding Funnel' },
    { id: 'fnl_webinar_002', name: 'Webinar Signup Funnel' },
];

const mockFunnelAutomationRulesStore: Record<string, FunnelAutomationData> = {
  'fnl_onboarding_001': {
    funnelId: 'fnl_onboarding_001',
    funnelName: 'SaaS Trial Onboarding Funnel',
    activeRulesCount: 2,
    totalAutomatedActionsToday: 120,
    totalErrorsToday: 1,
    rules: [
      { id: 'fauto001', name: 'Welcome Email Follow-up', triggerDescription: "Enters stage 'Welcome Email Sent'", actionsSummary: ["Wait 2 days", "Send Email: 'Product Tips #1'"], status: 'Active', timesTriggered: 230, errorCount: 0 },
      { id: 'fauto002', name: 'Stalled Lead Nudge', triggerDescription: "Stuck in 'Feature Used' > 3 days", actionsSummary: ["Add Tag: 'Stalled_FeatureUsed'", "Notify Sales Rep: 'Check on Lead'"], status: 'Active', timesTriggered: 45, errorCount: 1 },
      { id: 'fauto003', name: 'Post-Conversion Thank You', triggerDescription: "Enters stage 'Converted to Paid'", actionsSummary: ["Send Email: 'Thank You & Next Steps'"], status: 'Inactive', timesTriggered: 50, errorCount: 0 },
    ]
  },
  'fnl_webinar_002': {
    funnelId: 'fnl_webinar_002',
    funnelName: 'Webinar Signup Funnel',
    activeRulesCount: 1,
    totalAutomatedActionsToday: 75,
    totalErrorsToday: 0,
    rules: [
      { id: 'fauto004', name: 'Webinar Reminder Email', triggerDescription: "Enters stage 'Registered for Webinar'", actionsSummary: ["Wait 1 day before webinar", "Send Email: 'Webinar Reminder'"], status: 'Active', timesTriggered: 180, errorCount: 0 },
    ]
  }
};


const FunnelAutomationPage = () => {
  const { t } = useTranslation('funnelAutomationPage');
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>(mockFunnelsListForAutomation[0].id);
  const currentFunnelAutomationData = mockFunnelAutomationRulesStore[selectedFunnelId];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />

      <div className="p-6 md:p-10">
        {/* Funnel Selector */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
            <label htmlFor="funnelSelectAuto" className="text-sm font-medium text-gray-700">Configure Automation For:</label>
            <select
                id="funnelSelectAuto"
                value={selectedFunnelId}
                onChange={(e) => setSelectedFunnelId(e.target.value)}
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[250px]"
            >
                {mockFunnelsListForAutomation.map(funnel => (
                    <option key={funnel.id} value={funnel.id}>{funnel.name}</option>
                ))}
            </select>
        </div>

        {currentFunnelAutomationData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <QualityMetricCard title={t('metrics.activeRules.title')} value={currentFunnelAutomationData.activeRulesCount} icon={<Settings2 className="text-blue-600" />} />
              <QualityMetricCard title="Automated Actions Today" value={currentFunnelAutomationData.totalAutomatedActionsToday} icon={<Zap className="text-emerald-600" />} />
              <QualityMetricCard title="Errors Today" value={currentFunnelAutomationData.totalErrorsToday} icon={<AlertTriangle className="text-red-600" />}
                changeColor={currentFunnelAutomationData.totalErrorsToday > 0 ? "text-red-600" : "text-green-600"}
                change={currentFunnelAutomationData.totalErrorsToday > 0 ? "Needs attention" : "All clear"}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#1B1F3B]">{t('automationRules.title')}</h2>
                <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-2 px-4 rounded-lg flex items-center text-sm">
                  <PlusCircle size={18} className="mr-2" /> Add New Rule
                </button>
              </div>

              <div className="space-y-4">
                {currentFunnelAutomationData.rules.map((rule) => (
                  <div key={rule.id} className="bg-gray-50 p-4 rounded-md border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-md font-semibold text-gray-800">{rule.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rule.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {rule.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button title={rule.status === 'Active' ? 'Deactivate Rule' : 'Activate Rule'} className="text-gray-500 hover:text-gray-700">
                          {rule.status === 'Active' ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-400" />}
                        </button>
                        <button title="Edit Rule" className="text-gray-500 hover:text-blue-600"><Edit size={16} /></button>
                        <button title="Delete Rule" className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1"><strong className="font-medium text-gray-700">Trigger:</strong> {rule.triggerDescription}</p>
                    <div>
                      <strong className="text-sm font-medium text-gray-700">Actions:</strong>
                      <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                        {rule.actionsSummary.map((action, index) => <li key={index}>{action}</li>)}
                      </ul>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
                      <span>Times Triggered: {rule.timesTriggered.toLocaleString()}</span>
                      <span>Errors: {rule.errorCount > 0 ? <span className="text-red-500 font-semibold">{rule.errorCount}</span> : rule.errorCount}</span>
                    </div>
                  </div>
                ))}
                {currentFunnelAutomationData.rules.length === 0 && <p className="text-center py-6 text-gray-500">No automation rules configured for this funnel yet.</p>}
              </div>
            </div>
          </>
        )}
        {!currentFunnelAutomationData && <p className="text-center py-10 text-gray-500">Select a funnel to view its automation rules.</p>}
      </div>
    </div>
  );
};

export default FunnelAutomationPage;
