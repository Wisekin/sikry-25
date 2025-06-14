"use client";
import React from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Link as LinkIcon, Users, Clock, Gift, Copy, Share2 } from 'lucide-react';

interface UserReferralStats {
  invitesSentOrClicks: number;
  successfulReferrals: number;
  pendingReferrals: number;
  earnedRewardsUsd: number;
}

interface ReferredFriend {
  id: string;
  nameOrEmail: string;
  dateReferred: string;
  status: 'Joined' | 'Pending Action' | 'Reward Earned' | 'Inactive';
  rewardAmountUsd?: number;
}

const ReferralDashboardPage = () => {
  const userReferralLink = "https://yourapp.com/signup?ref=USER123XYZ";
  const userStats: UserReferralStats = {
    invitesSentOrClicks: 75,
    successfulReferrals: 8,
    pendingReferrals: 3,
    earnedRewardsUsd: 400,
  };
  const referredFriends: ReferredFriend[] = [
    { id: 'ref001', nameOrEmail: 'Alice B.', dateReferred: '2023-09-15', status: 'Reward Earned', rewardAmountUsd: 50 },
    { id: 'ref002', nameOrEmail: 'bob****@example.com', dateReferred: '2023-10-02', status: 'Joined', rewardAmountUsd: 0 },
    { id: 'ref003', nameOrEmail: 'Charlie D.', dateReferred: '2023-10-20', status: 'Pending Action', rewardAmountUsd: 0 },
    { id: 'ref004', nameOrEmail: 'diana****@example.com', dateReferred: '2023-08-01', status: 'Inactive', rewardAmountUsd: 0 },
    { id: 'ref005', nameOrEmail: 'Edward F.', dateReferred: '2023-07-10', status: 'Reward Earned', rewardAmountUsd: 50 },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userReferralLink).then(() => {
      alert('Referral link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const getStatusBadgeStyle = (status: ReferredFriend['status']) => {
    switch (status) {
      case 'Reward Earned': return 'bg-green-100 text-green-700';
      case 'Pending Action': return 'bg-amber-100 text-amber-700';
      case 'Joined': return 'bg-blue-100 text-blue-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader title="My Referral Dashboard" subtitle="Share your link, track your referrals, and see your rewards." />

      <div className="p-6 md:p-10">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-3">Your Unique Referral Link</h2>
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <input
              type="text"
              readOnly
              value={userReferralLink}
              className="w-full sm:flex-grow p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={copyToClipboard}
              className="w-full sm:w-auto bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-3 px-4 rounded-lg flex items-center justify-center text-sm transition-colors"
            >
              <Copy size={16} className="mr-2" /> Copy Link
            </button>
            <button className="w-full sm:w-auto bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 py-3 px-4 rounded-lg flex items-center justify-center text-sm transition-colors">
              <Share2 size={16} className="mr-2" /> Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QualityMetricCard title="Invites/Clicks" value={userStats.invitesSentOrClicks.toLocaleString()} icon={<LinkIcon size={24} className="text-blue-500"/>} />
          <QualityMetricCard title="Successful Referrals" value={userStats.successfulReferrals.toLocaleString()} icon={<Users size={24} className="text-green-500"/>} change={`+${userStats.successfulReferrals - 5} this month`} changeColor="text-green-600" />
          <QualityMetricCard title="Pending Referrals" value={userStats.pendingReferrals.toLocaleString()} icon={<Clock size={24} className="text-amber-500"/>} />
          <QualityMetricCard title="Total Rewards Earned (USD)" value={`$${userStats.earnedRewardsUsd.toLocaleString()}`} icon={<Gift size={24} className="text-indigo-500"/>} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">Your Referred Friends</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name/Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date Referred</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Reward Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {referredFriends.map((friend) => (
                  <tr key={friend.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{friend.nameOrEmail}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">{friend.dateReferred}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(friend.status)}`}>
                        {friend.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-right">
                      {friend.rewardAmountUsd && friend.rewardAmountUsd > 0 ? `$${friend.rewardAmountUsd.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {referredFriends.length === 0 && <p className="text-center py-4 text-gray-500">You haven't referred anyone yet. Share your link to get started!</p>}
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboardPage;
