import React from 'react';
import Link from 'next/link';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Users, UserPlus, Percent, Gift, LayoutDashboard, Eye, Award } from 'lucide-react';

const ReferralsPage = () => {
  const overviewStats = {
    totalReferrers: 150,
    successfulReferrals: 320,
    conversionRate: '25%',
    totalRewardsPaid: 4500,
  };

  const referralsOverTime = [
    { period: 'Jan', count: 30, color: '#3B82F6' }, // Blue
    { period: 'Feb', count: 45, color: '#10B981' }, // Green
    { period: 'Mar', count: 60, color: '#F59E0B' }, // Amber
    { period: 'Apr', count: 55, color: '#6366F1' }, // Indigo
    { period: 'May', count: 70, color: '#EC4899' }, // Pink
  ];
  const maxReferrals = Math.max(...referralsOverTime.map(r => r.count), 0) || 1;

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader title="Referral Program Overview" subtitle="Monitor and manage your company's referral program." />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QualityMetricCard
            title="Total Referrers"
            value={overviewStats.totalReferrers.toLocaleString()}
            icon={<Users size={24} className="text-blue-500" />}
            change="+10 this month"
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title="Successful Referrals"
            value={overviewStats.successfulReferrals.toLocaleString()}
            icon={<UserPlus size={24} className="text-green-500" />}
            change="+30 this month"
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title="Conversion Rate"
            value={overviewStats.conversionRate}
            icon={<Percent size={24} className="text-amber-500" />}
            change="-2% vs last month"
            changeColor="text-red-600"
          />
          <QualityMetricCard
            title="Total Rewards Paid (USD)"
            value={overviewStats.totalRewardsPaid.toLocaleString()}
            icon={<Gift size={24} className="text-indigo-500" />}
            change="+$500 this month"
            changeColor="text-green-600" // Or red if higher payout is bad
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/referrals/dashboard" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-200">
            <div className="flex items-center mb-3">
              <LayoutDashboard size={20} className="mr-3 text-blue-600" />
              <h3 className="text-xl font-semibold text-[#1B1F3B]">My Referral Dashboard</h3>
            </div>
            <p className="text-sm text-gray-600">View your personal referral link, track your invites, and see your earned rewards.</p>
          </Link>

          <Link href="/referrals/tracking" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-500 transition-all duration-200">
            <div className="flex items-center mb-3">
              <Eye size={20} className="mr-3 text-green-600" />
              <h3 className="text-xl font-semibold text-[#1B1F3B]">Referral Tracking</h3>
            </div>
            <p className="text-sm text-gray-600">Monitor the status of all referrals, see who signed up, and their progress towards earning rewards.</p>
          </Link>

          <Link href="/referrals/rewards" className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-500 transition-all duration-200">
            <div className="flex items-center mb-3">
              <Award size={20} className="mr-3 text-indigo-600" />
              <h3 className="text-xl font-semibold text-[#1B1F3B]">View Rewards Program</h3>
            </div>
            <p className="text-sm text-gray-600">Understand the referral reward structure, eligibility criteria, and how to claim rewards.</p>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-[#1B1F3B]">Referrals Over Time</h2>
          <div className="h-72 bg-gray-50 p-4 rounded flex flex-col space-y-2">
            {referralsOverTime.map(item => (
              <div key={item.period} className="flex items-center group">
                <span className="w-12 text-xs text-gray-500 group-hover:text-gray-700">{item.period}</span>
                <div className="flex-grow h-6 rounded-r flex items-center" style={{ backgroundColor: item.color + '33' }}> {/* Lighter background tint */}
                  <div
                    className="h-full rounded-r shadow-sm"
                    style={{ width: `${(item.count / maxReferrals) * 90}%`, backgroundColor: item.color, minWidth: '2px' }}
                    title={`Referrals: ${item.count.toLocaleString()}`}
                  ></div>
                </div>
                <span className="ml-2 text-xs text-gray-600 group-hover:text-gray-800 font-medium">{item.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReferralsPage;
