"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton'; // For inline loading state
import { TrendingUp, CalendarDays, BarChart3 as BarChart3Icon, Filter as FilterIcon, AlertCircle } from 'lucide-react';

// Import chart components
import type { ChartConfig } from "@/src/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart"; // Removed ChartLegend, ChartLegendContent as not used for single series bar
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';


interface TrendDataPoint {
  date: string;
  count: number;
}

interface CollectionTrendsSummaryStats {
    totalCollectedInPeriod: number;
    averageDailyCollection?: number;
    peakCollection: { date: string; count: number };
}

interface CollectionTrendsAPIData {
    period: 'daily' | 'weekly' | 'monthly';
    data: TrendDataPoint[];
    summaryStats: CollectionTrendsSummaryStats;
}

const chartConfig = {
  count: {
    label: "Records Collected",
    color: "hsl(200 70% 50%)",
  },
} satisfies ChartConfig;

const CollectionTrendsPage = () => {
  const { t } = useTranslation(['collectionTrendsPage', 'common']);
  const [apiData, setApiData] = useState<CollectionTrendsAPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState<string>(''); // Example: '2023-11-01'
  const [endDate, setEndDate] = useState<string>('');   // Example: '2023-11-15'


  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Construct API query params
    const queryParams = new URLSearchParams();
    queryParams.append('period', periodFilter);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    fetch(`/api/statistics/collection-trends?${queryParams.toString()}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch collection trends data');
        }
        return res.json();
      })
      .then(responseData => {
        if (responseData.error) {
            throw new Error(responseData.error.message || 'Failed to fetch data');
        }
        setApiData(responseData.data);
      })
      .catch(err => {
        setError(err.message);
        setApiData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [periodFilter, startDate, endDate]);


  // Inline loading state (Next.js Suspense with loading.tsx is primary)
  if (isLoading && !apiData) { // Show full page skeleton if apiData is null (initial load)
    return (
        <div className="min-h-screen bg-gray-50/50">
          <EnterprisePageHeader 
            title={t('loading.title')} 
            subtitle={t('loading.subtitle')} 
          />
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Skeleton className="h-32 rounded-lg bg-white" />
              <Skeleton className="h-32 rounded-lg bg-white" />
              <Skeleton className="h-32 rounded-lg bg-white" />
            </div>
            <Skeleton className="h-[450px] rounded-lg bg-white" />
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title={t('title')} subtitle={t('error.title')} />
        <div className="p-6 md:p-10">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 flex flex-col items-center justify-center h-96">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-700 mb-2">{t('error.title')}</h2>
                <p className="text-gray-600 text-center mb-4">{error}</p>
                <button
                    onClick={() => { /* Simple refetch based on current filters */ setIsLoading(true); setError(null); const queryParams = new URLSearchParams({period: periodFilter}); if(startDate) queryParams.append('startDate', startDate); if(endDate) queryParams.append('endDate', endDate); fetch(`/api/statistics/collection-trends?${queryParams.toString()}`).then(res => res.json()).then(responseData => { if(responseData.error) throw new Error(responseData.error.message); setApiData(responseData.data);}).catch(err => setError(err.message)).finally(() => setIsLoading(false)); }}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
                >
                    {t('error.tryAgain')}
                </button>
            </div>
        </div>
      </div>
    );
  }

  const chartData = apiData?.data || [];
  const summaryStats = apiData?.summaryStats;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader 
        title={t('title')} 
        subtitle={t('subtitle')} 
      />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard 
            title={t('metrics.newRecords.title')} 
            value={summaryStats?.totalCollectedInPeriod.toLocaleString() ?? 'N/A'} 
            icon={<BarChart3Icon className="text-blue-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.avgDaily.title')} 
            value={summaryStats?.averageDailyCollection?.toLocaleString() ?? (periodFilter === 'daily' && summaryStats ? (summaryStats.totalCollectedInPeriod / (chartData.length || 1)).toFixed(0) : 'N/A')} 
            icon={<TrendingUp className="text-emerald-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.peakCollection.title')} 
            value={summaryStats ? t('metrics.peakCollection.value', {
              count: summaryStats.peakCollection.count.toLocaleString(),
              date: new Date(summaryStats.peakCollection.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})
            }) : 'N/A'} 
            icon={<CalendarDays className="text-purple-600" />} 
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <h2 className="text-xl font-semibold text-[#1B1F3B] flex items-center">
              <BarChart3Icon className="mr-2 text-gray-500" /> {t('chart.title')}
            </h2>
            <div className="flex items-center space-x-3">
              <select 
                value={periodFilter} 
                onChange={(e) => setPeriodFilter(e.target.value as typeof periodFilter)} 
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">{t('chart.periods.daily')}</option>
                <option value="weekly">{t('chart.periods.weekly')}</option>
                <option value="monthly">{t('chart.periods.monthly')}</option>
              </select>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('filters.startDate')}
              />
              <span className="text-gray-500 text-sm">{t('chart.dateRange.to')}</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('filters.endDate')}
              />
            </div>
          </div>

          {isLoading && apiData ? (
            <Skeleton className="h-96 w-full rounded-md bg-slate-50 border-dashed border-gray-200" />
          ) : chartData.length > 0 ? (
            <div className="h-96 w-full mt-4">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => typeof value === 'string' ? (periodFilter === 'monthly' ? value : value.substring(5)) : String(value)}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="dot" hideLabel />}
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <p className="text-center py-10 text-gray-500 h-96 flex items-center justify-center">
              {t('chart.noData')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionTrendsPage;