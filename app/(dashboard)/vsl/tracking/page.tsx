"use client";

import React, { useEffect, useState } from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Button } from '@/src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/src/components/ui/chart";
import type { ChartConfig } from "@/src/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'; // Removed BarChart, Bar, Tooltip, Legend from here as ChartContainer handles them
import { Eye, Users, Percent, TrendingUp, CalendarDays, AlertCircle, Video, BarChart3 as BarChart3Icon, Clock } from 'lucide-react'; // Added Clock
import Link from 'next/link';

interface VSLPageSummary { id: string; title: string; }
interface VSLPerformanceStat { totalViews: number; totalLeads: number; conversionRate: number; avgWatchTime?: number; }
interface VSLTimeSeriesDataPoint { date: string; views: number; leads: number; conversionRate?: number; }
interface VSLDetailedPerformance {
    vslPageId: string;
    vslPageTitle: string;
    summaryStats: VSLPerformanceStat;
    performanceOverTime: VSLTimeSeriesDataPoint[];
}
interface AllVSLPerformanceSummary {
    pages: Array<VSLPageSummary & { stats: VSLPerformanceStat }>;
    overallSummary: VSLPerformanceStat;
}

type VSLTrackingData = VSLDetailedPerformance | AllVSLPerformanceSummary;


const VSLTrackingPage = () => {
  const [vslPagesList, setVslPagesList] = useState<VSLPageSummary[]>([]);
  const [selectedVslId, setSelectedVslId] = useState<string>('all');
  const [period, setPeriod] = useState<string>('last30days');
  const [data, setData] = useState<VSLTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVslList = () => {
    fetch('/api/vsl/pages')
      .then(res => res.json())
      .then(responseData => {
        if (responseData.data && responseData.data.pages) {
          setVslPagesList(responseData.data.pages.map((p: any) => ({ id: p.page_id, title: p.title })));
        }
      })
      .catch(err => console.error("Failed to fetch VSL pages list:", err)); // Log error, but don't block main data fetch
  };

  const fetchTrackingData = () => {
    setIsLoading(true);
    setError(null);
    let apiUrl = `/api/vsl/tracking?period=${period}`;
    if (selectedVslId !== 'all') {
      apiUrl += `&vslPageId=${selectedVslId}`;
    }

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch VSL tracking data');
        return res.json();
      })
      .then(responseData => {
        if(responseData.error) throw new Error(responseData.error.message || 'API returned an error');
        setData(responseData.data);
      })
      .catch(err => { setError(err.message); setData(null); })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchVslList();
  }, []); // Fetch VSL list once on mount

  useEffect(() => {
    fetchTrackingData();
  }, [selectedVslId, period]);

  const chartConfig: ChartConfig = {
    views: { label: "Views", color: "hsl(200 70% 50%)" },
    leads: { label: "Leads", color: "hsl(142.1 76.2% 42.2%)" },
    conversionRate: { label: "Conv. Rate (%)", color: "hsl(38.3 95.8% 53.1%)" }, // Removed yAxis: "secondary" here, handle in Line component
  };

  if (isLoading && !data) {
    return (
        <div className="min-h-screen bg-gray-50/50">
          <EnterprisePageHeader title="VSL Performance Tracking" subtitle="Loading VSL performance data..." />
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Skeleton className="h-32 rounded-lg bg-white" /> <Skeleton className="h-32 rounded-lg bg-white" />
              <Skeleton className="h-32 rounded-lg bg-white" /> <Skeleton className="h-32 rounded-lg bg-white" />
            </div>
            <Skeleton className="h-16 rounded-lg bg-white mb-6" />
            <Skeleton className="h-96 rounded-lg bg-white mb-6" />
            <Skeleton className="h-64 rounded-lg bg-white" />
          </div>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title="VSL Performance Tracking" subtitle="Error" />
         <div className="p-6 md:p-10 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
                <h2 className="text-xl font-semibold text-red-700 mb-2">Could not load VSL tracking data</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button variant="destructive" onClick={fetchTrackingData}> Try Again </Button>
            </div>
        </div>
      </div>
    );
  }

  const displayStats = data ? ('overallSummary' in data ? data.overallSummary : data.summaryStats) : null;
  const performanceOverTimeData = data && 'performanceOverTime' in data ? data.performanceOverTime : [];
  const allVSLPageStats = data && 'pages' in data ? data.pages : (data && 'vslPageId' in data ? [ {id: data.vslPageId, title: data.vslPageTitle, stats: data.summaryStats} ] : []);


  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title="VSL Performance Tracking" subtitle="Analyze views, engagement, and conversions for your VSLs." />
      <div className="p-6 md:p-10">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row justify-start items-center gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <label htmlFor="vslSelectTrack" className="text-sm font-medium text-gray-700">VSL Page:</label>
                    <Select value={selectedVslId} onValueChange={setSelectedVslId}>
                        <SelectTrigger className="min-w-[200px] md:min-w-[250px] bg-white"><SelectValue placeholder="Select VSL Page" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All VSL Pages</SelectItem>
                            {vslPagesList.map(vsl => <SelectItem key={vsl.id} value={vsl.id}>{vsl.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <label htmlFor="periodSelectTrack" className="text-sm font-medium text-gray-700">Period:</label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="min-w-[150px] md:min-w-[180px] bg-white"><SelectValue placeholder="Select Period" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="last7days">Last 7 Days</SelectItem>
                            <SelectItem value="last30days">Last 30 Days</SelectItem>
                            <SelectItem value="last3months">Last 3 Months</SelectItem>
                            <SelectItem value="alltime">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        {isLoading && !displayStats && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"><Skeleton className="h-32 rounded-lg"/><Skeleton className="h-32 rounded-lg"/><Skeleton className="h-32 rounded-lg"/><Skeleton className="h-32 rounded-lg"/></div>}
        {displayStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <QualityMetricCard title="Total Views" value={displayStats.totalViews.toLocaleString()} icon={<Eye className="text-blue-600" />} />
                <QualityMetricCard title="Total Leads" value={displayStats.totalLeads.toLocaleString()} icon={<Users className="text-emerald-600" />} />
                <QualityMetricCard title="Conversion Rate" value={`${displayStats.conversionRate.toFixed(1)}%`} icon={<Percent className="text-purple-600" />} />
                {displayStats.avgWatchTime !== undefined && <QualityMetricCard title="Avg. Watch Time" value={`${displayStats.avgWatchTime}s`} icon={<Clock className="text-amber-600" />} />}
            </div>
        )}

        {isLoading && performanceOverTimeData.length === 0 && selectedVslId !== 'all' && <Skeleton className="h-96 rounded-lg bg-white mb-6" />}
        {performanceOverTimeData.length > 0 && selectedVslId !== 'all' && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">Performance Over Time for '{apiData && 'vslPageTitle' in apiData ? apiData.vslPageTitle : 'Selected VSL'}'</h2>
                <div className="h-96 w-full">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <LineChart data={performanceOverTimeData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => value.substring(5)} tickLine={false} axisLine={false} tickMargin={8}/>
                      <YAxis yAxisId="left" label={{ value: "Views/Leads", angle: -90, position: 'insideLeft', style:{textAnchor: 'middle'}, dy:-10 }} tickLine={false} axisLine={false} tickMargin={8}/>
                      <YAxis yAxisId="right" orientation="right" label={{ value: "Conv. Rate (%)", angle: 90, position: 'insideRight', style:{textAnchor: 'middle'}, dy:20 }} tickFormatter={(value) => `${value}%`} domain={[0, 'dataMax + 5']} tickLine={false} axisLine={false} tickMargin={8}/>
                      <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} yAxisId="left" dot={false}/>
                      <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} yAxisId="left" dot={false}/>
                      {performanceOverTimeData.some(d => d.conversionRate !== undefined) &&
                        <Line type="monotone" dataKey="conversionRate" name="Conv. Rate (%)" stroke="var(--color-conversionRate)" strokeWidth={2} yAxisId="right" dot={false}/>
                      }
                    </LineChart>
                  </ChartContainer>
                </div>
            </div>
        )}

        {isLoading && allVSLPageStats.length === 0 && selectedVslId === 'all' && <Skeleton className="h-64 rounded-lg bg-white" />}
        {allVSLPageStats.length > 0 && selectedVslId === 'all' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-[#1B1F3B] mb-4">Performance by VSL Page</h2>
                <Table>
                    <TableHeader><TableRow>
                        <TableHead className="text-gray-600 font-medium">VSL Title</TableHead>
                        <TableHead className="text-right text-gray-600 font-medium">Views</TableHead>
                        <TableHead className="text-right text-gray-600 font-medium">Leads</TableHead>
                        <TableHead className="text-right text-gray-600 font-medium">Conv. Rate (%)</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {(allVSLPageStats as Array<VSLPageSummary & { stats: VSLPerformanceStat }>).map(page => (
                            <TableRow key={page.id} className="hover:bg-gray-50/50">
                                <TableCell className="font-medium text-blue-600 hover:underline">
                                    <Link href={`/vsl/pages?edit=${page.id}`}>{page.title}</Link> {/* Corrected link to VSL pages or specific edit page */}
                                </TableCell>
                                <TableCell className="text-right">{page.stats.totalViews.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{page.stats.totalLeads.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{page.stats.conversionRate.toFixed(1)}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )}
        {(!isLoading && !data) && <p className="text-center py-10 text-gray-500">No VSL tracking data available for the selected filters.</p>}
      </div>
    </div>
  );
};
export default VSLTrackingPage;