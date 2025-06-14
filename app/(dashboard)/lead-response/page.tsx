"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  CogIcon, // Using CogIcon for Rules
  QueueListIcon, // Using QueueListIcon for Queue (from heroicons/react/24/solid for more distinct icon)
  ChartBarIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BoltIcon, // For recent activity type: rule_triggered
  UserGroupIcon, // For recent activity type: lead_assigned
  ExclamationCircleIcon, // For recent activity type: error
  LightBulbIcon // For example section
} from "@heroicons/react/24/outline"; // Or solid where appropriate
import { useTranslation } from "react-i18next";
import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";

interface OverviewData {
  ruleCount: number;
  queueSize: number;
  processedToday: number;
  recentActivity: Array<{
    id: string;
    description: string;
    timestamp: string;
    type: 'rule_triggered' | 'lead_assigned' | 'error';
  }>;
}

const activityIcons = {
  rule_triggered: <BoltIcon className="w-5 h-5 text-blue-500" />,
  lead_assigned: <UserGroupIcon className="w-5 h-5 text-green-500" />,
  error: <ExclamationCircleIcon className="w-5 h-5 text-red-500" />,
};

// Helper function for date formatting
const formatDate = (dateString: string, locale: string = 'en') => {
  return new Date(dateString).toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function LeadResponseDashboardPage() {
  const { t, locale } = useTranslation();
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lead-response/overview");
      if (!response.ok) {
        throw new Error(t('leadResponse.mainPage.error.fetchFailed', { statusText: response.statusText || 'Server error' }));
      }
      const data: OverviewData = await response.json();
      setOverviewData(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(t('leadResponse.mainPage.error.unknown'));
      console.error("Failed to fetch lead response overview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const sections = [
    {
      title: t('leadResponse.rules.title'),
      description: t('leadResponse.rules.description'),
      href: "/lead-response/rules",
      icon: <CogIcon className="w-8 h-8 text-blue-600" />,
    },
    {
      title: t('leadResponse.queue.title'),
      description: t('leadResponse.queue.description'),
      href: "/lead-response/queue",
      icon: <QueueListIcon className="w-8 h-8 text-purple-600" />,
    },
    {
      title: t('leadResponse.analytics.title'),
      description: t('leadResponse.analytics.description'),
      href: "/lead-response/analytics",
      icon: <ChartBarIcon className="w-8 h-8 text-emerald-600" />,
    },
  ];

  if (isLoading && !overviewData) {
    // Inline skeleton for initial load, complements loading.tsx for route transitions
    return (
        <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div><LoadingSkeleton width="300px" height="36px" className="mb-2" /><LoadingSkeleton width="350px" height="20px" /></div>
            </div>
            <div className="grid gap-6 md:grid-cols-3 mb-8">{[1,2,3].map(i => <Card key={i}><CardHeader><LoadingSkeleton width="50%" height="20px"/></CardHeader><CardContent><LoadingSkeleton width="30%" height="28px"/></CardContent></Card>)}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">{[1,2,3].map(i => <Card key={i}><CardHeader><LoadingSkeleton width="60%" height="24px"/></CardHeader><CardContent><LoadingSkeleton width="90%" height="16px"/><LoadingSkeleton width="70%" height="16px" className="mt-2"/></CardContent></Card>)}</div>
            <Card><CardHeader><LoadingSkeleton width="40%" height="24px"/></CardHeader><CardContent className="space-y-2"><LoadingSkeleton width="100%" height="16px"/><LoadingSkeleton width="90%" height="16px"/></CardContent></Card>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-6 text-center">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">{t('leadResponse.mainPage.error.title')}</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchOverviewData} className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
          <ArrowPathIcon className="w-5 h-5" />
          {t('leadResponse.mainPage.tryAgain')}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('leadResponse.mainPage.title')}</h1>
          <p className="text-gray-500 mt-1">{t('leadResponse.mainPage.subtitle')}</p>
        </div>
      </div>

      {/* Overview Stats Cards */}
      {overviewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{t('leadResponse.mainPage.stats.rules')}</CardTitle>
              <CogIcon className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-[#1B1F3B]">{overviewData.ruleCount}</div></CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{t('leadResponse.mainPage.stats.inQueue')}</CardTitle>
              <QueueListIcon className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-[#1B1F3B]">{overviewData.queueSize}</div></CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{t('leadResponse.mainPage.stats.processedToday')}</CardTitle>
              <ChartBarIcon className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-[#1B1F3B]">{overviewData.processedToday}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Section Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sections.map((section) => (
          <Link href={section.href} key={section.title} className="group">
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-[#1B1F3B]">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">{section.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0 text-sm text-blue-600 group-hover:underline">
                  {t('common.view')} {section.title.toLowerCase()}
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Usage Example Card */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500" /> {t('leadResponse.example.title')}
          </CardTitle>
          <CardDescription>{t('leadResponse.example.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
            <p><strong>{t('leadResponse.example.scenarioTitle')}:</strong> {t('leadResponse.example.scenario')}</p>
            <p><strong>{t('leadResponse.example.triggerTitle')}:</strong> {t('leadResponse.example.trigger')}</p>
            <p><strong>{t('leadResponse.example.actionTitle')}:</strong> {t('leadResponse.example.action')}</p>
            <p><strong>{t('leadResponse.example.outcomeTitle')}:</strong> {t('leadResponse.example.outcome')}</p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {overviewData && overviewData.recentActivity.length > 0 && (
        <Card className="bg-white border-none shadow-sm mt-8">
          <CardHeader>
            <CardTitle className="text-lg">{t('leadResponse.mainPage.recentActivity.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {overviewData.recentActivity.map(activity => (
                <li key={activity.id} className="flex items-start space-x-3 text-sm">
                  <div className="flex-shrink-0 pt-0.5">
                    {activityIcons[activity.type]}
                  </div>
                  <div>
                    <p className="text-gray-700">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp, locale)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
