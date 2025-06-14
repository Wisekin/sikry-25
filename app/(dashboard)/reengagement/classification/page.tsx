import React from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Thermometer, Meh, Frown, HelpCircle, Edit3, ListFilter } from 'lucide-react';

interface LeadClassificationStats {
  hot: number;
  warm: number;
  cold: number;
  unclassified: number;
}

interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  classification: 'Hot' | 'Warm' | 'Cold';
  criteriaSummary: string;
}

const LeadClassificationPage = () => {
  const classificationStats: LeadClassificationStats = {
    hot: 78,
    warm: 230,
    cold: 1150,
    unclassified: 310,
  };

  const classificationRules: ClassificationRule[] = [
    { id: 'rule_cold_1', name: 'Inactive Users', classification: 'Cold', description: 'Users who have not logged in or opened an email in the last 90 days.', criteriaSummary: 'Last active > 90 days' },
    { id: 'rule_cold_2', name: 'Low Engagement', classification: 'Cold', description: 'Users with an engagement score below 10, indicating minimal interaction.', criteriaSummary: 'Engagement score < 10' },
    { id: 'rule_warm_1', name: 'Recent Interest', classification: 'Warm', description: 'Users who visited key product pages or the pricing page in the last 14 days.', criteriaSummary: 'Visited key pages recently' },
    { id: 'rule_hot_1', name: 'High Intent Signals', classification: 'Hot', description: 'Users who requested a demo, started a trial, or had multiple high-value interactions.', criteriaSummary: 'Demo request or Trial started' },
  ];

  const mockLeads = [
    { id: 'lead_001', name: 'John Doe', email: 'john.doe@example.com', classification: 'Cold', lastActivity: '2023-05-10' },
    { id: 'lead_002', name: 'Jane Smith', email: 'jane.smith@example.com', classification: 'Warm', lastActivity: '2023-10-20' },
    { id: 'lead_003', name: 'Alice Brown', email: 'alice.brown@example.com', classification: 'Hot', lastActivity: '2023-11-01' },
    { id: 'lead_004', name: 'Bob Green', email: 'bob.green@example.com', classification: 'Unclassified', lastActivity: '2023-09-15' },
    { id: 'lead_005', name: 'Carol White', email: 'carol.white@example.com', classification: 'Cold', lastActivity: '2023-06-15' },
  ];

  const getClassificationColor = (classification: 'Hot' | 'Warm' | 'Cold' | 'Unclassified') => {
    switch (classification) {
      case 'Hot': return 'text-red-600';
      case 'Warm': return 'text-amber-600';
      case 'Cold': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  const getClassificationBadgeStyle = (classification: 'Hot' | 'Warm' | 'Cold' | 'Unclassified') => {
    switch (classification) {
      case 'Hot': return 'bg-red-100 text-red-700';
      case 'Warm': return 'bg-amber-100 text-amber-700';
      case 'Cold': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader title="Lead Classification" subtitle="Define, manage, and monitor lead classifications for targeted re-engagement." />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QualityMetricCard title="Hot Leads" value={classificationStats.hot.toLocaleString()} icon={<Thermometer size={24} className={getClassificationColor('Hot')} />} change="+5 this week" changeColor="text-green-600"/>
          <QualityMetricCard title="Warm Leads" value={classificationStats.warm.toLocaleString()} icon={<Meh size={24} className={getClassificationColor('Warm')} />} change="-2 this week" changeColor="text-red-600"/>
          <QualityMetricCard title="Cold Leads" value={classificationStats.cold.toLocaleString()} icon={<Frown size={24} className={getClassificationColor('Cold')} />} change="+20 this week" changeColor="text-green-600"/>
          <QualityMetricCard title="Unclassified" value={classificationStats.unclassified.toLocaleString()} icon={<HelpCircle size={24} className={getClassificationColor('Unclassified')} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#1B1F3B]">Classification Rules</h2>
              <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-2 px-4 rounded-lg flex items-center text-sm transition-colors">
                <Edit3 size={16} className="mr-2" /> Add New Rule
              </button>
            </div>
            {classificationRules.length > 0 ? (
              <ul className="space-y-3">
                {classificationRules.map(rule => (
                  <li key={rule.id} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{rule.name} <span className={`text-xs px-2 py-0.5 rounded-full ml-2 font-medium ${getClassificationBadgeStyle(rule.classification)}`}>{rule.classification}</span></h3>
                        <p className="text-xs text-gray-500 mt-1">{rule.criteriaSummary}</p>
                      </div>
                      {/* <p className="text-sm text-gray-500">{rule.description}</p> */}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No classification rules defined.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#1B1F3B]">Leads Overview</h2>
                <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg flex items-center text-sm transition-colors">
                    <ListFilter size={16} className="mr-2" /> Filter Leads
                </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">A list of leads with their current classification. Advanced filtering and manual classification options will be available here.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Classification</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-800">{lead.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{lead.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getClassificationBadgeStyle(lead.classification as 'Hot' | 'Warm' | 'Cold' | 'Unclassified')}`}>
                          {lead.classification}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{lead.lastActivity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadClassificationPage;
