import React from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Users, UserPlus, Clock, Gift, Filter as FilterIcon, Edit2 } from 'lucide-react';

interface ReferralTrackRecord {
  id: string;
  dateInitiated: string;
  referrerName: string;
  refereeEmail: string;
  refereeName?: string;
  status: 'Invited' | 'Signed Up' | 'Pending Criteria' | 'Converted' | 'Reward Paid' | 'Expired' | 'Failed';
  conversionDate?: string;
  rewardAmount?: number;
}

const ReferralTrackingPage = () => {
  const allReferrals: ReferralTrackRecord[] = [
    { id: 'trk001', dateInitiated: '2023-10-01', referrerName: 'Alice Wonderland', refereeEmail: 'friend1@example.com', refereeName: 'Friend One', status: 'Reward Paid', conversionDate: '2023-10-05', rewardAmount: 50 },
    { id: 'trk002', dateInitiated: '2023-10-05', referrerName: 'Bob The Builder', refereeEmail: 'friend2@example.com',refereeName: 'Friend Two', status: 'Signed Up' },
    { id: 'trk003', dateInitiated: '2023-10-10', referrerName: 'Charlie Brown', refereeEmail: 'friend3@example.com', refereeName: 'Friend Three', status: 'Pending Criteria' },
    { id: 'trk004', dateInitiated: '2023-10-15', referrerName: 'Diana Prince', refereeEmail: 'friend4@example.com', status: 'Invited' },
    { id: 'trk005', dateInitiated: '2023-09-20', referrerName: 'Edward Scissorhands', refereeEmail: 'friend5@example.com',refereeName: 'Friend Five', status: 'Failed', conversionDate: '2023-09-25' },
    { id: 'trk006', dateInitiated: '2023-11-01', referrerName: 'Alice Wonderland', refereeEmail: 'friend6@example.com', status: 'Converted', conversionDate: '2023-11-05', rewardAmount: 50 },
  ];

  const stats = {
    totalInitiated: allReferrals.length,
    pendingAcceptance: allReferrals.filter(r => r.status === 'Invited' || r.status === 'Signed Up' || r.status === 'Pending Criteria').length,
    successfullyConverted: allReferrals.filter(r => r.status === 'Converted' || r.status === 'Reward Paid').length,
    totalRewardsDisbursed: allReferrals.filter(r => r.status === 'Reward Paid').reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
  };

  const getStatusBadgeStyle = (status: ReferralTrackRecord['status']) => {
    switch (status) {
      case 'Reward Paid': return 'bg-green-100 text-green-700';
      case 'Converted': return 'bg-teal-100 text-teal-700';
      case 'Pending Criteria': return 'bg-amber-100 text-amber-700';
      case 'Signed Up': return 'bg-blue-100 text-blue-700';
      case 'Invited': return 'bg-indigo-100 text-indigo-700';
      case 'Expired': return 'bg-gray-100 text-gray-600';
      case 'Failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader title="Referral Tracking" subtitle="Monitor all referral activities and their statuses." />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QualityMetricCard title="Total Referrals Initiated" value={stats.totalInitiated.toLocaleString()} icon={<Users size={24} className="text-blue-500"/>} />
          <QualityMetricCard title="Pending Full Conversion" value={stats.pendingAcceptance.toLocaleString()} icon={<Clock size={24} className="text-amber-500"/>} />
          <QualityMetricCard title="Successfully Converted" value={stats.successfullyConverted.toLocaleString()} icon={<UserPlus size={24} className="text-green-500"/>} />
          <QualityMetricCard title="Total Rewards Disbursed (USD)" value={`$${stats.totalRewardsDisbursed.toLocaleString()}`} icon={<Gift size={24} className="text-indigo-500"/>} />
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1B1F3B] mb-3">Filter Referrals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="text" placeholder="Referrer Name" className="p-2 rounded border border-gray-300 bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400" />
            <input type="text" placeholder="Referee Email" className="p-2 rounded border border-gray-300 bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400" />
            <select className="p-2 rounded border border-gray-300 bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Statuses</option>
              <option value="Invited">Invited</option>
              <option value="Signed Up">Signed Up</option>
              <option value="Pending Criteria">Pending Criteria</option>
              <option value="Converted">Converted</option>
              <option value="Reward Paid">Reward Paid</option>
              <option value="Expired">Expired</option>
              <option value="Failed">Failed</option>
            </select>
            <input type="date" className="p-2 rounded border border-gray-300 bg-gray-50 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
           <div className="mt-4 flex justify-end">
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center text-sm justify-center">
              <FilterIcon size={16} className="mr-2" /> Apply Filters
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">All Referral Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date Initiated</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Referrer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Referee Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Referee Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Reward</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allReferrals.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{referral.dateInitiated}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{referral.referrerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{referral.refereeEmail}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{referral.refereeName || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-right">
                      {referral.rewardAmount ? `$${referral.rewardAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button title="Edit Status" className="text-blue-600 hover:text-blue-800 transition-colors"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {allReferrals.length === 0 && <p className="text-center py-4 text-gray-500">No referral records found.</p>}
        </div>
      </div>
    </div>
  );
};

export default ReferralTrackingPage;
