










"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { BarChart3 as BarChart3Icon, Briefcase, TrendingUp, Filter as FilterIcon, List, PieChart as PieChartIcon, AlertCircle } from 'lucide-react';

// Import chart components
import type { ChartConfig } from "@/src/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/src/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';


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


// Initialize bar chart config outside component to avoid re-renders
const barChartConfig = {
  data_count: {
    label: "Data Count",  // This will be overridden in the component
    color: "hsl(200 70% 50%)",
  },
} satisfies ChartConfig;


const SectorDistributionPage = () => {
  const { t, i18n } = useTranslation(['sectorDistributionPage', 'common']);
  const [apiData, setApiData] = useState<SectorDistributionAPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('all_data');

  // Dynamic pieChartConfig based on fetched data
  const [pieChartConfig, setPieChartConfig] = useState<ChartConfig>({});
  
  // Update chart config with translations
  const chartConfig = React.useMemo(() => ({
    ...barChartConfig,
    data_count: {
      ...barChartConfig.data_count,
      label: t('chart.dataCountLabel') || barChartConfig.data_count.label,
    },
  }), [t]);
  
  // Create bar chart data with proper sorting and limiting
  const barChartData = React.useMemo(() => 
    apiData?.sectors 
      ? [...apiData.sectors].sort((a, b) => b.data_count - a.data_count).slice(0, 10)
      : []
  , [apiData]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`/api/statistics/sector-distribution?dataType=${dataTypeFilter}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sector distribution data');
        return res.json();
      })
      .then(responseData => {
        if (responseData.error) {
            throw new Error(responseData.error.message || 'Failed to fetch data');
        }
        setApiData(responseData.data);
        if (responseData.data && responseData.data.sectors) {
            const newPieConfig = Object.fromEntries(
                responseData.data.sectors.map((entry: ApiSectorDataPoint) => [
                entry.sector_id,
                { label: entry.sector_name, color: entry.color_hint || 'hsl(0 0% 50%)' }
              ])
            ) satisfies ChartConfig;
            setPieChartConfig(newPieConfig);
        }
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
                fetch(`/api/statistics/sector-distribution?dataType=${dataTypeFilter}`)
                  .then(res => res.json())
                  .then(responseData => { 
                    if(responseData.error) throw new Error(responseData.error.message); 
                    setApiData(responseData.data); 
                    if (responseData.data?.sectors) { 
                      const newPieConfig = Object.fromEntries(
                        responseData.data.sectors.map((entry: ApiSectorDataPoint) => [
                          entry.sector_id, 
                          { 
                            label: entry.sector_name, 
                            color: entry.color_hint || 'hsl(0 0% 50%)' 
                          }
                        ])
                      ) satisfies ChartConfig; 
                      setPieChartConfig(newPieConfig); 
                    } 
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

  if (!apiData) return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader 
        title={t('title')} 
        subtitle={t('noData.title')} 
      />
      <div className="p-6 md:p-10 text-center text-gray-500">
        {t('noData.message')}
      </div>
    </div>
  );

  const { sectors, summary_stats } = apiData;
  // Mocking fastestGrowingSector as it's not in API
  const fastestGrowingSector = "Healthcare Tech (Mock)";

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
            value={t('metrics.totalSectors.value', { 
              count: summary_stats.total_sectors_with_data 
            })}
            icon={<Briefcase className="text-blue-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.topSector.title')} 
            value={t('metrics.topSector.value', { 
              sector: summary_stats.top_sector.name, 
              count: summary_stats.top_sector.count
            })} 
            icon={<PieChartIcon className="text-emerald-600" />} 
          />
          <QualityMetricCard 
            title={t('metrics.sectorDiversity.title')} 
            value={t('metrics.sectorDiversity.value', {
              percentage: Math.round(summary_stats.top_sector.count / summary_stats.total_sectors_with_data * 100)
            })} 
            icon={<TrendingUp className="text-purple-600" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <h2 className="text-xl font-semibold text-[#1B1F3B] flex items-center">
                  <BarChart3Icon className="mr-2 text-gray-500" /> {t('chart.title')}
                </h2>
                <div className="flex items-center space-x-2">
                    <select 
                      value={dataTypeFilter} 
                      onChange={(e) => setDataTypeFilter(e.target.value)} 
                      className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {Object.entries(t('filters.dataTypes', { returnObjects: true })).map(([key, value]) => (
                          <option key={key} value={key}>{value as string}</option>
                        ))}
                    </select>
                </div>
            </div>
            {isLoading && apiData ? <Skeleton className="h-96 w-full" /> : sectors.length > 0 ? (
                <div className="h-96 w-full">
                <ChartContainer config={pieChartConfig} className="h-full w-full">
                    <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent nameKey="sector_name" hideLabel />} />
                    <Pie data={sectors} dataKey="data_percentage" nameKey="sector_name" cx="50%" cy="50%" outerRadius={120} labelLine={true}
                        label={({ sector_name, data_percentage, x, y, midAngle, outerRadius = 0, percent }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 25;
                            const xLabel = x + radius * Math.cos(-midAngle! * RADIAN);
                            const yLabel = y + radius * Math.sin(-midAngle! * RADIAN);
                            return (
                            <text x={xLabel} y={yLabel} fill="hsl(var(--foreground))" textAnchor={x > midAngle! ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                                {`${sector_name} (${(percent! * 100).toFixed(0)}%)`}
                            </text>
                            );
                        }}>
                        {sectors.map((entry) => (
                        <Cell key={`cell-pie-${entry.sector_id}`} fill={entry.color_hint || 'gray'} />
                        ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="sector_name" />} />
                    </PieChart>
                </ChartContainer>
                </div>
            ) : (
                <p className="text-center py-10 text-gray-500 h-96 flex items-center justify-center">
                  {t('chart.noData')}
                </p>
            )}
          </div>

          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4 flex items-center">
              <List className="mr-2 text-gray-500"/>
              {t('breakdown.title')}
            </h2>
            {isLoading && apiData ? <Skeleton className="h-[420px] w-full" /> : sectors.length > 0 ? (
                <div className="h-[420px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart
                      accessibilityLayer
                      data={barChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={8} 
                        tickFormatter={(val: number) => val.toLocaleString(i18n.language)}
                      />
                      <YAxis 
                        dataKey="sector_name" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={5} 
                        width={110} 
                        className="text-xs"
                      />
                      <ChartTooltip 
                        cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} 
                        content={<ChartTooltipContent />} 
                      />
                      <Bar dataKey="data_count" layout="vertical" radius={4}>
                        {barChartData.map((entry) => (
                          <Cell 
                            key={`cell-bar-${entry.sector_id}`} 
                            fill={entry.color_hint || 'var(--color-data_count)'} 
                          />
                        ))}
                        <LabelList 
                          dataKey="data_count" 
                          position="right" 
                          offset={8} 
                          className="fill-foreground text-xs" 
                          formatter={(val: number) => val.toLocaleString(i18n.language)} 
                        />
                      </Bar>
                    </BarChart>
                </ChartContainer>
                </div>
            ) : (
                <p className="text-center py-10 text-gray-500 h-[420px] flex items-center justify-center">
                  {t('breakdown.noData')}
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectorDistributionPage;