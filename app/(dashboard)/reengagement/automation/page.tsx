import React from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Settings2, PlayCircle, CheckCheck, BarChart3, PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'Active' | 'Inactive';
  emailsSent?: number;
  openRate?: number;
  clickRate?: number;
}

const ReEngagementAutomationPage = () => {
  const rules: AutomationRule[] = [
    {
      id: 'rule_001',
      name: 'Cold Lead Welcome Email',
      trigger: 'Lead becomes "Cold"',
      actions: ['Send "Cold Lead Intro" email template', 'Wait 3 days', 'Send follow-up email "Check-in"'],
      status: 'Active',
      emailsSent: 1250,
      openRate: 22,
      clickRate: 5
    },
    {
      id: 'rule_002',
      name: 'Warm Lead Follow-up Task',
      trigger: 'Lead becomes "Warm" after 7 days of inactivity',
      actions: ['Create task for sales rep: "Personalized follow-up call"', 'Add tag "Warm-FollowUp"'],
      status: 'Active',
      emailsSent: 0,
      openRate: 0,
      clickRate: 0
    },
    {
      id: 'rule_003',
      name: 'Inactive Trial Reminder',
      trigger: 'Trial user inactive for 5 days',
      actions: ['Send "Trial Tips & Reminder" email', 'Notify account manager'],
      status: 'Inactive',
      emailsSent: 50,
      openRate: 35,
      clickRate: 10
    },
  ];

  const activeRules = rules.filter(r => r.status === 'Active').length;
  const leadsProcessedToday = 85;
  const automatedConversions = 12;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader title="Re-engagement Automation" subtitle="Set up and manage automated workflows to re-engage leads." />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard title="Active Automation Rules" value={activeRules} icon={<Settings2 size={24} className="text-blue-500"/>} change={`Total ${rules.length} rules`} />
          <QualityMetricCard title="Leads Processed Today (Auto)" value={leadsProcessedToday} icon={<PlayCircle size={24} className="text-green-500"/>} />
          <QualityMetricCard title="Automated Re-engagements" value={automatedConversions} icon={<CheckCheck size={24} className="text-indigo-500"/>} change="+3 this week" changeColor="text-green-600"/>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-[#1B1F3B] mb-3 sm:mb-0">Automation Rule List</h2>
            <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-2 px-4 rounded-lg flex items-center text-sm transition-colors">
              <PlusCircle size={16} className="mr-2" /> Create New Rule
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-800">{rule.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {rule.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button title={rule.status === 'Active' ? 'Deactivate' : 'Activate'} className="text-gray-500 hover:text-[#1B1F3B] transition-colors">
                      {rule.status === 'Active' ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} className="text-gray-400"/>}
                    </button>
                    <button title="Edit Rule" className="text-gray-500 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                    <button title="Delete Rule" className="text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600"><strong className="font-medium text-gray-700">Trigger:</strong> {rule.trigger}</p>
                  <div className="mt-1">
                    <strong className="text-sm font-medium text-gray-700">Actions:</strong>
                    <ul className="list-disc list-inside ml-4 text-sm text-gray-600 space-y-0.5">
                      {rule.actions.map((action, index) => <li key={index}>{action}</li>)}
                    </ul>
                  </div>
                </div>
                {(rule.emailsSent !== undefined && rule.emailsSent > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center"><BarChart3 size={14} className="inline mr-1 text-gray-400" /> Performance:</span>
                    <span>Emails Sent: <span className="font-medium text-gray-700">{rule.emailsSent.toLocaleString()}</span></span>
                    <span>Open Rate: <span className="font-medium text-gray-700">{rule.openRate}%</span></span>
                    <span>Click Rate: <span className="font-medium text-gray-700">{rule.clickRate}%</span></span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {rules.length === 0 && <p className="text-center py-4 text-gray-500">No automation rules configured.</p>}
        </div>
      </div>
    </div>
  );
};

export default ReEngagementAutomationPage;
