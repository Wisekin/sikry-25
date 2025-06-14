"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  ChartBarIcon, // Page Icon & general analytics
  PresentationChartLineIcon, // For line charts
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon, // For success rate
  XCircleIcon, // For failure rate
  ClockIcon, // For response time
  UsersIcon, // For total leads processed
  ScaleIcon, // For rule performance or general balance
  CalendarDaysIcon, // For date filters
} from "@heroicons/react/24/outline";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useTranslation } from 'react-i18next';
import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton"; // Using the main skeleton loader

// Helper function for date formatting
const formatDate = (dateString: string, locale: string = 'en', short: boolean = false) => {
  const options: Intl.DateTimeFormatOptions = short ? 
    { month: 'short', day: 'numeric' } :
    { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(locale, options);
};

interface AnalyticsData {
  summary: {
    totalLeads: number;
    processedLeads: number;
    averageResponseTime: number;
    successRate: number;
  };
  timeSeriesData: Array<{
    date: string;
    leads: number;
    processed: number;
    responseTime: number;
  }>;
  rulePerformance: Array<{
    ruleId: string;
    ruleName: string;
    triggerCount: number;
    successRate: number;
    averageResponseTime: number;
  }>;
  errorDistribution: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
}

export default function LeadResponseAnalyticsPage() {
  const { t } = useTranslation('leadResponse.analyticsPage');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lead-response/analytics");
      if (!response.ok) throw new Error(t('error.fetchFailed'));
      const responseData = await response.json();
      setAnalyticsData(responseData.data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(t('error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (isLoading && !analyticsData) {
    return <AnalyticsLoadingPlaceholder />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6 text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">{t('error.title')}</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchAnalyticsData} className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5" /> {t('common.tryAgain')}
        </Button>
      </div>
    );
  }
  
  if (!analyticsData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6 text-center">
        <ChartBarIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('noData.title')}</h2>
        <p className="text-gray-500">{t('noData.description')}</p>
      </div>
    );
  }

  const { summary, timeSeriesData, rulePerformance } = analyticsData;

  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <Button variant="outline" className="bg-white border-gray-300">
          <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-500" /> {t('common.filter')}
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title={t('summary.totalProcessed')} 
          value={summary.totalLeads.toLocaleString()} 
          icon={<UsersIcon className="w-6 h-6 text-blue-500" />} 
        />
        <StatCard 
          title={t('summary.avgResponseTime')} 
          value={`${summary.averageResponseTime} ${t('common.minutesShort')}`} 
          icon={<ClockIcon className="w-6 h-6 text-amber-500" />} 
        />
        <StatCard 
          title={t('summary.successRate')} 
          value={`${summary.successRate.toFixed(1)}%`} 
          icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} 
        />
        <StatCard 
          title={t('summary.failureRate')} 
          value={`${(100 - summary.successRate).toFixed(1)}%`} 
          icon={<XCircleIcon className="w-6 h-6 text-red-500" />} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard title={t('charts.leadsProcessedTitle')}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
              <XAxis dataKey="date" tickFormatter={(val) => formatDate(val, 'en', true)} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), t('charts.leadsProcessedLabel')]} />
              <Area type="monotone" dataKey="leads" name={t('charts.leadsProcessedLabel') as string} stroke="#3B82F6" fill="#BFDBFE" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title={t('charts.responseTimeTitle')}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5}/>
              <XAxis dataKey="date" tickFormatter={(val) => formatDate(val, 'en', true)} fontSize={12} />
              <YAxis unit={` ${t('common.minutesAbbr')}`} fontSize={12} />
              <Tooltip formatter={(value: number) => [value.toFixed(1) + ` ${t('common.minutesAbbr')}`, t('charts.avgResponseTimeLabel')]} />
              <Line type="monotone" dataKey="responseTime" name={t('charts.avgResponseTimeLabel') as string} stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Rule Performance Table */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <ScaleIcon className="w-6 h-6 mr-2 text-purple-600" /> {t('table.title')}
          </CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.headers.ruleName')}</TableHead>
                  <TableHead className="text-right">{t('table.headers.processed')}</TableHead>
                  <TableHead className="text-right">{t('table.headers.successRate')}</TableHead>
                  <TableHead className="text-right">{t('table.headers.avgTime')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rulePerformance.map((rule) => (
                  <TableRow key={rule.ruleId} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800">{rule.ruleName}</TableCell>
                    <TableCell className="text-right">{rule.triggerCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{rule.successRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{rule.averageResponseTime} {t('common.minutesAbbr')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components for cards to maintain consistency
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-[#1B1F3B]">{value}</div>
    </CardContent>
  </Card>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className="bg-white border-none shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center text-lg">
        <PresentationChartLineIcon className="w-6 h-6 mr-2 text-indigo-600" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// Placeholder for the actual loading component defined in loading.tsx
// This is just for type consistency if this component was imported directly
// but loading.tsx is what Next.js will use for route transitions.
const AnalyticsLoadingPlaceholder = () => (
  <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div><LoadingSkeleton width="350px" height="36px" className="mb-2" /><LoadingSkeleton width="400px" height="20px" /></div>
          <div className="flex gap-2"><LoadingSkeleton width="120px" height="40px" /><LoadingSkeleton width="100px" height="40px" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">{[...Array(4)].map((_,i)=><Card key={i}><CardHeader><LoadingSkeleton width="70%" height="20px"/></CardHeader><CardContent><LoadingSkeleton width="50%" height="28px"/></CardContent></Card>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"><Card><CardHeader><LoadingSkeleton width="40%" height="24px"/></CardHeader><CardContent><LoadingSkeleton width="100%" height="250px"/></CardContent></Card><Card><CardHeader><LoadingSkeleton width="50%" height="24px"/></CardHeader><CardContent><LoadingSkeleton width="100%" height="250px"/></CardContent></Card></div>
      <Card><CardHeader><LoadingSkeleton width="30%" height="24px"/></CardHeader><CardContent><LoadingSkeleton width="100%" height="150px"/></CardContent></Card>
  </div>
);
