"use client";

import React, { useEffect, useState } from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Users, Eye, Clock, AlertCircle, ExternalLink, BarChart3, LineChart, Filter as FilterIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PerformanceSummaryMetrics {
  totalVisits: number;
  uniqueVisitors: number;
  avgSessionDurationMinutes: number;
  bounceRatePercent: number;
  pagesPerVisit: number;
  topReferrer: string;
}

interface ActivityDataPoint {
  date: string; // YYYY-MM-DD
  visits: number;
  pageViews: number;
}

interface TopPage {
  path: string;
  views: number;
}

interface PerformanceData {
    summaryMetrics: PerformanceSummaryMetrics;
    activityOverTime: ActivityDataPoint[];
    topPages: TopPage[];
}

const PerformanceAnalyticsPage = () => {
  const { t } = useTranslation('performanceAnalyticsPage');
  const [data, setData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('last30days'); // Mock filter state

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    fetch(`/api/analytics/performance?period=${period}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch performance data');
        }
        return res.json();
      })
      .then(responseData => {
        if (responseData.error) { // Check for application-level error from API
            throw new Error(responseData.error.message || 'Failed to fetch performance data');
        }
        setData(responseData.data);
      })
      .catch(err => {
        setError(err.message);
        setData(null); // Clear data on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [period, t]);

  if (isLoading) {
    // This will be typically handled by loading.tsx via Next.js Suspense
    // but as a fallback or for direct component loading state:
    return (
        <div className="min-h-screen bg-gray-50/50">
          <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg bg-white" />)}
            </div>
            <Skeleton className="h-96 rounded-lg bg-white" />
            <Skeleton className="h-64 rounded-lg bg-white mt-6" />
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title={t('header.title')} subtitle={t('error.title')} />
        <div className="p-6 md:p-10">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 flex flex-col items-center justify-center h-96">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-700 mb-2">{t('error.title')}</h2>
                <p className="text-gray-600 text-center mb-4">{error}</p>
                <button
                    onClick={() => { setIsLoading(true); setError(null); fetch(`/api/analytics/performance?period=${period}`).then(res => res.json()).then(responseData => { if(responseData.error) throw new Error(responseData.error.message); setData(responseData.data);}).catch(err => setError(err.message)).finally(() => setIsLoading(false)); }}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
                >
                    {t('error.tryAgain')}
                </button>
            </div>
        </div>
      </div>
    );
  }

  if (!data) {
     // Should be caught by loading or error state, but as a fallback
    return (
        <div className="min-h-screen bg-gray-50/50">
            <EnterprisePageHeader title={t('header.title')} subtitle={t('noData')} />
            <div className="p-6 md:p-10 text-center text-gray-500">{t('noData')}</div>
        </div>
    );
  }

  const { summaryMetrics, activityOverTime, topPages } = data;
  const maxActivityVisits = Math.max(...activityOverTime.map(d => d.visits), 0) || 1;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />
      <div className="p-6 md:p-10">
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-start items-center gap-3">
                <label htmlFor="periodSelectPerf" className="text-sm font-medium text-gray-700">{t('filters.period')}</label>
                <select
                    id="periodSelectPerf"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="last7days">{t('filters.last7days')}</option>
                    <option value="last30days">{t('filters.last30days')}</option>
                    <option value="last3months">{t('filters.last3months')}</option>
                </select>
                {/* Add more filters if needed */}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <QualityMetricCard title={t('summary.totalVisits')} value={summaryMetrics.totalVisits.toLocaleString()} icon={<Users className="text-blue-600" />} />
          <QualityMetricCard title={t('summary.uniqueVisitors')} value={summaryMetrics.uniqueVisitors.toLocaleString()} icon={<Users className="text-sky-600" />} />
          <QualityMetricCard title={t('summary.avgSessionDuration')} value={`${summaryMetrics.avgSessionDurationMinutes.toFixed(1)} min`} icon={<Clock className="text-emerald-600" />} />
          <QualityMetricCard title={t('summary.bounceRate')} value={`${summaryMetrics.bounceRatePercent.toFixed(1)}%`} icon={<AlertCircle className="text-red-500" />} />
          <QualityMetricCard title={t('summary.pagesPerVisit')} value={summaryMetrics.pagesPerVisit.toFixed(1)} icon={<ExternalLink className="text-purple-600" />} />
          <QualityMetricCard title={t('summary.topReferrer')} value={summaryMetrics.topReferrer} icon={<BarChart3 className="text-amber-600" />} />
        </div>

        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">{t('charts.activity.title')}</h2>
          <div className="h-96 bg-slate-50 p-4 rounded-md border-gray-200 border flex items-end space-x-1 md:space-x-2 overflow-x-auto">
            {activityOverTime.map((item, index) => (
              <div key={index} className="flex-grow flex flex-col items-center justify-end h-full" title={`Date: ${item.date}, Visits: ${item.visits}`}>
                <div className="w-full md:w-5 bg-blue-500 hover:bg-blue-600 transition-colors" style={{ height: `${(item.visits / maxActivityVisits) * 95}%` }}></div>
                <span className="text-xs text-gray-500 mt-1 transform rotate-[-45deg] origin-center whitespace-nowrap md:rotate-0">{item.date.substring(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">{t('charts.topPages.title')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('charts.topPages.path')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('charts.topPages.views')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topPages.map(page => (
                  <tr key={page.path} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-blue-600 hover:underline"><a href={page.path} target="_blank" rel="noopener noreferrer">{page.path}</a></td>
                    <td className="px-4 py-3 text-right text-gray-600">{page.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PerformanceAnalyticsPage;
