"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Database, ShieldCheck, BarChart2 as BarChart2Icon, Filter as FilterIcon, ListChecks, AlertCircle } from 'lucide-react';

// Import chart components
import type { ChartConfig } from "@/src/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/src/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

interface ApiDataSourceComparisonMetric {
  source_id: string;
  source_name: string;
  data_volume: number;
  quality_score?: number;
  coverage_percent?: number;
  update_frequency?: 'Real-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Ad-hoc';
  color_hint?: string;
}

interface ApiSummaryStats {
  total_sources_compared: number;
  highest_volume_source?: { name: string; volume: number };
  best_quality_source?: { name: string; score: number };
}

interface SourceComparisonAPIData {
  filter_summary: {
    metric_type_filter?: string;
    period_filter?: string;
  };
  sources_metrics: ApiDataSourceComparisonMetric[];
  summary_stats: ApiSummaryStats;
}

const SourceComparisonPage = () => {
  const { t } = useTranslation(['sourceComparisonPage', 'common']);
  
  const [apiData, setApiData] = useState<SourceComparisonAPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricTypeFilter, setMetricTypeFilter] = useState('all_metrics');
  const [periodFilter, setPeriodFilter] = useState('all_time');
  
  const chartConfig = {
    data_volume: { 
      label: t('metrics.dataVolume'), 
      color: "hsl(200 70% 50%)" 
    },
    quality_score: { 
      label: t('metrics.qualityScore'), 
      color: "hsl(142.1 76.2% 42.2%)" 
    },
    coverage_percent: { 
      label: t('metrics.coverage'), 
      color: "hsl(38.3 95.8% 53.1%)" 
    },
  } satisfies ChartConfig;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams({
          metricType: metricTypeFilter,
          period: periodFilter
        });
        
        const response = await fetch(`/api/statistics/source-comparison?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(t('error.fetchFailed'));
        }
        
        const responseData = await response.json();
        
        if (responseData.error) {
          throw new Error(responseData.error.message || t('error.unknown'));
        }
        
        setApiData(responseData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setApiData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [metricTypeFilter, periodFilter, t]);

  if (isLoading && !apiData) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader 
          title={t('loading.title')}
          subtitle={t('loading.subtitle')} 
        />
        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32 rounded-lg bg-white" />
            <Skeleton className="h-32 rounded-lg bg-white" />
            <Skeleton className="h-32 rounded-lg bg-white" />
          </div>
          <Skeleton className="h-24 rounded-lg bg-white mb-6" />
          <Skeleton className="h-96 rounded-lg bg-white mb-6" />
          <Skeleton className="h-64 rounded-lg bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader 
          title={t('error.title')}
          subtitle={t('error.subtitle')} 
        />
        <div className="p-6 md:p-10 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              {t('error.title')}
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                setError(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
            >
              {t('error.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!apiData) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader 
          title={t('noData.title')}
          subtitle={t('noData.subtitle')} 
        />
        <div className="p-6 md:p-10 text-center text-gray-500">
          {t('noData.message')}
        </div>
      </div>
    );
  }

  const { summary_stats, sources_metrics } = apiData;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader 
        title={t('title')}
        subtitle={t('subtitle')} 
      />
      
      <div className="p-6 md:p-10">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard 
            title={t('metrics.totalSources.title')}
            value={t('metrics.totalSources.value', { count: summary_stats.total_sources_compared })}
            icon={<Database className="text-blue-600" />}
          />
          <QualityMetricCard 
            title={t('metrics.highestVolume.title')}
            value={summary_stats.highest_volume_source?.name || t('notAvailable')}
            icon={<BarChart2Icon className="text-emerald-600" />}
          />
          <QualityMetricCard 
            title={t('metrics.bestQuality.title')}
            value={summary_stats.best_quality_source?.name || t('notAvailable')}
            icon={<ShieldCheck className="text-purple-600" />}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-start items-center gap-3">
            <label htmlFor="metricTypeFilter" className="text-sm font-medium text-gray-700 mr-2">
              {t('filters.compareBy')}:
            </label>
            <select 
              id="metricTypeFilter" 
              value={metricTypeFilter}
              onChange={(e) => setMetricTypeFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all_metrics">{t('filters.allMetrics')}</option>
              <option value="volume">{t('filters.dataVolume')}</option>
              <option value="quality">{t('filters.qualityScore')}</option>
              <option value="coverage">{t('filters.coverage')}</option>
            </select>
            
            <label htmlFor="periodFilter" className="text-sm font-medium text-gray-700 md:ml-4 mr-2">
              {t('filters.period')}:
            </label>
            <select 
              id="periodFilter"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all_time">{t('filters.allTime')}</option>
              <option value="last_30_days">{t('filters.last30Days')}</option>
              <option value="last_90_days">{t('filters.last90Days')}</option>
            </select>
          </div>
        </div>

        {/* Main Chart */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">
            {t('charts.performanceMetrics.title')}
          </h2>
          
          {sources_metrics.length > 0 ? (
            <div className="h-96 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart 
                  accessibilityLayer 
                  data={sources_metrics} 
                  margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="source_name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => 
                      value.length > 15 ? `${value.substring(0, 12)}...` : value
                    }
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    stroke="var(--color-data_volume)" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="var(--color-quality_score)" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8} 
                    domain={[0, 100]}
                  />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="data_volume" 
                    fill="var(--color-data_volume)" 
                    radius={4} 
                    name={t('metrics.dataVolume')}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="quality_score" 
                    fill="var(--color-quality_score)" 
                    radius={4} 
                    name={t('metrics.qualityScore')}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="coverage_percent" 
                    fill="var(--color-coverage_percent)" 
                    radius={4} 
                    name={t('metrics.coverage')}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          ) : (
            <p className="text-center py-10 text-gray-500 h-96 flex items-center justify-center">
              {t('charts.performanceMetrics.noData')}
            </p>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4 flex items-center">
            <ListChecks className="mr-2 text-gray-500" />
            {t('table.title')}
          </h2>
          
          {sources_metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      {t('table.headers.sourceName')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      {t('table.headers.dataVolume')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      {t('table.headers.qualityScore')}
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                      {t('table.headers.coverage')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      {t('table.headers.updateFrequency')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sources_metrics.map((source) => (
                    <tr key={source.source_id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {source.source_name}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {source.data_volume.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {source.quality_score ? `${source.quality_score}%` : t('notAvailable')}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {source.coverage_percent ? `${source.coverage_percent}%` : t('notAvailable')}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {source.update_frequency || t('notAvailable')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-10 text-gray-500">
              {t('table.noData')}
            </p>
          )}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-right">
          {t('lastUpdated', { date: new Date().toLocaleDateString() })}
        </div>
      </div>
    </div>
  );
};

export default SourceComparisonPage;
