"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Building2, TrendingUp, BarChart3 as BarChart3Icon, Filter as FilterIcon, AlertCircle } from 'lucide-react';

// Import chart components
import type { ChartConfig } from "@/src/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ApiSectorDataPoint {
  sector_id: string;
  sector_name: string;
  data_count: number;
  data_percentage?: number;
  color_hint?: string;
}

interface ApiSummaryStats {
    total_sectors_with_data: number;
    top_sector: { name: string; count: number };
}

interface SectorDistributionAPIData {
  filter_summary: {
    data_type_filter?: string;
    period_filter?: string;
  };
  sectors: ApiSectorDataPoint[];
  summary_stats: ApiSummaryStats;
}

const chartConfig = {
  count: {
    label: "Companies",
    color: "hsl(200 70% 50%)",
  },
} satisfies ChartConfig;

const SectorDistributionPage = () => {
  const { t } = useTranslation(['sectorDistributionPage', 'common']);
  const [apiData, setApiData] = useState<SectorDistributionAPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [minCompaniesFilter, setMinCompaniesFilter] = useState<number>(0);
  const [growthRateFilter, setGrowthRateFilter] = useState<number>(0);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/statistics/sector-distribution?dataType=${sectorFilter}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sector distribution data');
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
  }, [sectorFilter]);

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
              onClick={() => { setIsLoading(true); setError(null); fetch(`/api/statistics/sector-distribution?dataType=${sectorFilter}`).then(res => res.json()).then(responseData => { if(responseData.error) throw new Error(responseData.error.message); setApiData(responseData.data); }).catch(err => setError(err.message)).finally(() => setIsLoading(false)); }}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
            >
              {t('error.tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = apiData?.sectors || [];
  const summaryStats = apiData?.summary_stats;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader 
        title={t('title')} 
        subtitle={t('subtitle')} 
      />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard 
            title={t('metrics.totalSectors.title')} 
            value={t('metrics.totalSectors.value', { count: summaryStats?.total_sectors_with_data.toLocaleString() ?? 'N/A' })} 
            icon={<Building2 className="text-blue-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.topSector.title')} 
            value={t('metrics.topSector.value', {
              sector: summaryStats?.top_sector.name ?? 'N/A',
              count: summaryStats?.top_sector.count.toLocaleString() ?? '0'
            })} 
            icon={<BarChart3Icon className="text-emerald-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.sectorDiversity.title')} 
            value={t('metrics.sectorDiversity.value', {
              percentage: summaryStats?.top_sector.count / summaryStats?.total_sectors_with_data * 100 ?? '0'
            })} 
            icon={<TrendingUp className="text-purple-600" />} 
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <h2 className="text-xl font-semibold text-[#1B1F3B] flex items-center">
              <BarChart3Icon className="mr-2 text-gray-500" /> {t('chart.title')}
            </h2>
            <div className="flex items-center space-x-3">
              <select 
                value={sectorFilter} 
                onChange={(e) => setSectorFilter(e.target.value)} 
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('filters.sector')}</option>
                {Object.entries(t('chart.sectors', { returnObjects: true })).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <input 
                type="text" 
                value={industryFilter} 
                onChange={e => setIndustryFilter(e.target.value)} 
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('filters.industry')}
              />
              <input 
                type="number" 
                value={minCompaniesFilter} 
                onChange={e => setMinCompaniesFilter(Number(e.target.value))} 
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('filters.minCompanies')}
              />
              <input 
                type="number" 
                value={growthRateFilter} 
                onChange={e => setGrowthRateFilter(Number(e.target.value))} 
                className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('filters.growthRate')}
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
                    dataKey="sector_name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="dot" hideLabel />}
                  />
                  <Bar dataKey="data_count" fill="var(--color-count)" radius={4} />
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

export default SectorDistributionPage;