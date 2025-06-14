"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { MapPin, Globe, Users, BarChartHorizontal as BarChartHorizontalIcon, TrendingUp, AlertCircle } from 'lucide-react';

// Import chart components
import type { ChartConfig } from "@/src/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

interface ApiGeoDataPoint {
  region_id: string;
  region_name: string;
  data_count: number;
  data_percentage?: number;
  latitude?: number;
  longitude?: number;
}

interface ApiSummaryStats {
    total_regions_with_data: number;
    top_region: { name: string; count: number };
}

interface GeographicDistributionAPIData {
  filter_summary: {
    data_type_filter?: string;
    period_filter?: string;
  };
  regions: ApiGeoDataPoint[];
  summary_stats: ApiSummaryStats;
}

const barChartConfig = {
  data_count: {
    label: "Data Volume",
    color: "hsl(200 70% 50%)",
  },
} satisfies ChartConfig;

const GeographicDistributionPage = () => {
  const { t, i18n } = useTranslation(['geographicDistributionPage', 'common']);
  const [apiData, setApiData] = useState<GeographicDistributionAPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('all_data');

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/statistics/geographic-distribution?dataType=${dataTypeFilter}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch geographic distribution data');
        return res.json();
      })
      .then(responseData => {
        if (responseData.error) {
            throw new Error(responseData.error.message || 'Failed to fetch data');
        }
        setApiData(responseData.data);
      })
      .catch(err => { setError(err.message); setApiData(null); })
      .finally(() => setIsLoading(false));
  }, [dataTypeFilter]);


  if (isLoading && !apiData) {
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><Skeleton className="h-[500px] rounded-lg bg-white" /></div>
            <div className="lg:col-span-1"><Skeleton className="h-[500px] rounded-lg bg-white" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader 
          title={t('title')} 
          subtitle={t('error.title')} 
        />
        <div className="p-6 md:p-10 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">{t('error.title')}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => { 
                setIsLoading(true); 
                setError(null); 
                fetch(`/api/statistics/geographic-distribution?dataType=${dataTypeFilter}`)
                  .then(res => res.json())
                  .then(responseData => { 
                    if(responseData.error) throw new Error(responseData.error.message); 
                    setApiData(responseData.data);
                  })
                  .catch(err => setError(err.message))
                  .finally(() => setIsLoading(false));
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
          title={t('title')} 
          subtitle={t('noData')} 
        />
        <div className="p-6 md:p-10 text-center text-gray-500">
          {t('noData')}
        </div>
      </div>
    );
  }

  const { regions, summary_stats, filter_summary } = apiData;
  // Mocking regionsWithGrowth as it's not in API, can be removed or calculated if API provides more data
  const regionsWithGrowth = Math.floor(summary_stats.total_regions_with_data * 0.3);


  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader 
        title={t('title')} 
        subtitle={t('subtitle')} 
      />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard 
            title={t('metrics.totalRegions.title')} 
            value={summary_stats.total_regions_with_data.toLocaleString(i18n.language)} 
            icon={<Globe className="text-blue-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.topRegion.title')} 
            value={
              t('metrics.topRegion.valueShort', { 
                name: summary_stats.top_region.name, 
                count: summary_stats.top_region.count
              }) as string
            } 
            icon={<MapPin className="text-emerald-600" />} 
          />
          <QualityMetricCard 
            title={`${t('metrics.regionsWithGrowth.title')} ${t('metrics.regionsWithGrowth.mockNote')}`} 
            value={regionsWithGrowth.toLocaleString(i18n.language)} 
            icon={<TrendingUp className="text-purple-600" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <h2 className="text-xl font-semibold text-[#1B1F3B]">
                {t('map.title')}
              </h2>
              <div className="flex items-center space-x-2">
                <select 
                  value={dataTypeFilter} 
                  onChange={(e) => setDataTypeFilter(e.target.value)} 
                  className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all_data">{t('filters.allDataTypes')}</option>
                  <option value="companies">{t('filters.companies')}</option>
                  <option value="users">{t('filters.users')}</option>
                </select>
              </div>
            </div>
            <div className="h-96 bg-slate-100 rounded-md border border-dashed border-gray-300 flex items-center justify-center">
              <p className="text-gray-400 text-lg">{t('map.placeholder')}</p>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4 flex items-center">
              <BarChartHorizontalIcon className="mr-2 text-gray-500"/>
              {t('topRegions.title')}
            </h2>
            {isLoading && apiData ? (
              <Skeleton className="h-96 w-full" />
            ) : regions.length > 0 ? (
              <div className="h-96 w-full">
                <ChartContainer config={barChartConfig} className="h-full w-full">
                  <BarChart
                    accessibilityLayer
                    data={regions.sort((a, b) => a.data_count - b.data_count).slice(0, 10)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8} 
                      tickFormatter={(value) => value.toLocaleString(i18n.language)} 
                    />
                    <YAxis
                      dataKey="region_name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={5}
                      width={100}
                      className="text-xs"
                    />
                    <ChartTooltip
                      cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                      content={<ChartTooltipContent />}
                    />
                    <Bar 
                      dataKey="data_count" 
                      layout="vertical" 
                      fill="var(--color-data_count)" 
                      radius={4}
                    >
                      <LabelList 
                        dataKey="data_count" 
                        position="right" 
                        offset={8} 
                        className="fill-foreground text-xs" 
                        formatter={(value: number) => value.toLocaleString(i18n.language)} 
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <p className="text-center py-10 text-gray-500 h-96 flex items-center justify-center">
                {t('noDataAvailable')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicDistributionPage;












