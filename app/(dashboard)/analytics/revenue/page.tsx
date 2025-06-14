"use client";

import React, { useEffect, useState } from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, Briefcase, AlertCircle, LineChart, BarChart3, Filter as FilterIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RevenueSummaryMetrics {
  totalRevenue: number;
  avgRevenuePerUser: number; // ARPU
  monthlyRecurringRevenue?: number; // MRR (optional)
  lifetimeValue?: number; // LTV (optional)
}

interface RevenueTrendDataPoint {
  date: string; // YYYY-MM or YYYY-MM-DD
  revenue: number;
}

interface RevenueBreakdownItem { // Can be by product, segment, etc.
  name: string; // Product name, Segment name
  revenue: number;
  percentageOfTotal: number;
}

interface RevenueData {
    summaryMetrics: RevenueSummaryMetrics;
    revenueOverTime: RevenueTrendDataPoint[];
    revenueBreakdown: RevenueBreakdownItem[]; // e.g., by product
}

const RevenueAnalyticsPage = () => {
  const { t } = useTranslation('revenueAnalyticsPage');
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('last30days');
  const [breakdownType, setBreakdownType] = useState('product'); // product vs segment

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/analytics/revenue?period=${period}&breakdown=${breakdownType}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch revenue data');
        return res.json();
      })
      .then(responseData => {
        if (responseData.error) {
            throw new Error(responseData.error.message || 'Failed to fetch revenue data');
        }
        setData(responseData.data);
      })
      .catch(err => { setError(err.message); setData(null); })
      .finally(() => setIsLoading(false));
  }, [period, breakdownType, t]);

  // Fallback for loading state
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-50/50">
          <EnterprisePageHeader title={t('header.title')} subtitle={t('loading')} />
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg bg-white" />)}
            </div>
            <Skeleton className="h-96 rounded-lg bg-white mb-6" />
            <Skeleton className="h-64 rounded-lg bg-white" />
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title={t('header.title')} subtitle={t('error.title')} />
        <div className="p-6 md:p-10 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
                <h2 className="text-xl font-semibold text-red-700 mb-2">{t('error.title')}</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => { setIsLoading(true); setError(null); fetch(`/api/analytics/revenue?period=${period}&breakdown=${breakdownType}`).then(res => res.json()).then(responseData => { if(responseData.error) throw new Error(responseData.error.message); setData(responseData.data);}).catch(err => setError(err.message)).finally(() => setIsLoading(false)); }}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
                >
                    {t('error.tryAgain')}
                </button>
            </div>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title={t('header.title')} subtitle={t('noData')} />
        <div className="p-6 md:p-10 text-center text-gray-500">{t('noData')}</div>
    </div>
  );

  const { summaryMetrics, revenueOverTime, revenueBreakdown } = data;
  const maxRevenueTrend = Math.max(...revenueOverTime.map(d => d.revenue), 0) || 1;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />
      <div className="p-6 md:p-10">
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-start items-center gap-3">
                <label htmlFor="periodSelectRev" className="text-sm font-medium text-gray-700">{t('filters.period')}</label>
                <select id="periodSelectRev" value={period} onChange={(e) => setPeriod(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    <option value="last7days">{t('filters.last7days')}</option>
                    <option value="last30days">{t('filters.last30days')}</option>
                    <option value="last3months">{t('filters.last3months')}</option>
                    <option value="last12months">{t('filters.last12months')}</option>
                </select>
                <label htmlFor="breakdownSelectRev" className="text-sm font-medium text-gray-700 md:ml-4">{t('filters.breakdown')}</label>
                <select id="breakdownSelectRev" value={breakdownType} onChange={(e) => setBreakdownType(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                    <option value="product">{t('filters.byProduct')}</option>
                    <option value="segment">{t('filters.bySegment')}</option>
                    <option value="region">{t('filters.byRegion')}</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QualityMetricCard title={t('summary.totalRevenue')} value={`$${summaryMetrics.totalRevenue.toLocaleString()}`} icon={<DollarSign className="text-emerald-600" />} />
          <QualityMetricCard title={t('summary.arpu')} value={`$${summaryMetrics.avgRevenuePerUser.toFixed(2)}`} icon={<Users className="text-blue-600" />} />
          {summaryMetrics.monthlyRecurringRevenue !== undefined && <QualityMetricCard title={t('summary.mrr')} value={`$${summaryMetrics.monthlyRecurringRevenue.toLocaleString()}`} icon={<TrendingUp className="text-purple-600" />} />}
          {summaryMetrics.lifetimeValue !== undefined && <QualityMetricCard title={t('summary.ltv')} value={`$${summaryMetrics.lifetimeValue.toLocaleString()}`} icon={<Briefcase className="text-amber-600" />} />}
        </div>

        {/* Revenue Trends Over Time Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">{t('charts.trend.title')}</h2>
          <div className="h-96 bg-slate-50 p-4 rounded-md border-gray-200 border flex items-end space-x-1 md:space-x-2 overflow-x-auto">
             {revenueOverTime.map((item, index) => (
              <div key={index} className="flex-grow flex flex-col items-center justify-end h-full" title={`Date: ${item.date}, Revenue: $${item.revenue.toLocaleString()}`}>
                <div className="w-full md:w-5 bg-emerald-500 hover:bg-emerald-600 transition-colors" style={{ height: `${(item.revenue / maxRevenueTrend) * 95}%` }}></div>
                <span className="text-xs text-gray-500 mt-1 transform rotate-[-45deg] origin-center whitespace-nowrap md:rotate-0">{item.date.includes("-") ? item.date.substring(5) : item.date}</span>
              </div>
            ))}
             {revenueOverTime.length === 0 && <p className="text-sm text-gray-500 text-center w-full">{t('charts.trend.noData')}</p>}
          </div>
        </div>

        {/* Revenue Breakdown Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">{t('charts.breakdown.title', { context: breakdownType })}</h2>
           <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('charts.breakdown.name', { context: breakdownType })}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('charts.breakdown.revenue')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('charts.breakdown.percentage')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {revenueBreakdown.map(item => (
                  <tr key={item.name} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600">${item.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.percentageOfTotal.toFixed(1)}%</td>
                  </tr>
                ))}
                 {revenueBreakdown.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-500">{t('charts.breakdown.noData')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default RevenueAnalyticsPage;
