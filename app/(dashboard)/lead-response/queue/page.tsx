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
  ArrowPathIcon as RetryIcon,
  XCircleIcon as CancelIcon,
  ClockIcon, // For pending/retrying status
  CheckCircleIcon, // For completed status
  ExclamationCircleIcon, // For failed status
  CogIcon, // For processing status (or BoltIcon)
  ExclamationTriangleIcon, // For error messages
  QueueListIcon, // Page icon
  ArrowPathIcon as RefreshIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from 'react-i18next';
import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";
import type { LeadResponseQueueItem } from '@/app/api/lead-response/queue/route.ts'; // Import type from API

// Loading component for the queue page
const QueueLoading = () => (
  <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <LoadingSkeleton width="300px" height="36px" className="mb-2" />
        <LoadingSkeleton width="350px" height="20px" />
      </div>
      <LoadingSkeleton width="120px" height="40px" />
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-4">
        <LoadingSkeleton width="200px" height="24px" className="mb-4" />
        <LoadingSkeleton width="100%" height="40px" />
        <LoadingSkeleton width="100%" height="40px" />
        <LoadingSkeleton width="100%" height="40px" />
        <LoadingSkeleton width="100%" height="40px" />
      </div>
    </div>
  </div>
);

// Helper function for date formatting
const formatDate = (dateString?: string, locale: string = 'en') => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString(locale, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

const StatusDisplay: React.FC<{ status: LeadResponseQueueItem['status']; t: Function }> = ({ status, t }) => {
  let icon: JSX.Element;
  let textColor = "text-gray-700";
  let bgColor = "bg-gray-100";

  switch (status) {
    case 'completed':
      icon = <CheckCircleIcon className="w-4 h-4 mr-1.5" />;
      textColor = "text-green-700";
      bgColor = "bg-green-100";
      break;
    case 'pending':
      icon = <ClockIcon className="w-4 h-4 mr-1.5" />;
      textColor = "text-gray-700"; // Neutral for pending
      bgColor = "bg-gray-100";
      break;
    case 'processing':
      icon = <CogIcon className="w-4 h-4 mr-1.5 animate-spin" />;
      textColor = "text-blue-700";
      bgColor = "bg-blue-100";
      break;
    case 'retrying':
      icon = <RetryIcon className="w-4 h-4 mr-1.5 animate-spin" />;
      textColor = "text-orange-700";
      bgColor = "bg-orange-100";
      break;
    case 'failed':
      icon = <ExclamationCircleIcon className="w-4 h-4 mr-1.5" />;
      textColor = "text-red-700";
      bgColor = "bg-red-100";
      break;
    default:
      icon = <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" />;
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {t(`status.${status}`, status.charAt(0).toUpperCase() + status.slice(1))}
    </span>
  );
};


export default function LeadResponseQueuePage() {
  const { t } = useTranslation('leadResponse.queuePage');
  const [queueItems, setQueueItems] = useState<LeadResponseQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{[itemId: string]: boolean}>({});


  const fetchQueueItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/lead-response/queue");
      if (!response.ok) throw new Error(t('error.fetchFailed'));
      const apiResponse = await response.json();
      setQueueItems(apiResponse.data || []); // Assuming API wraps in { data: ... }
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(t('error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchQueueItems();
  }, [fetchQueueItems]);

  const handleQueueAction = async (itemId: string, action: 'retry' | 'cancel') => {
    setActionLoading(prev => ({...prev, [itemId]: true}));
    setError(null); // Clear previous main errors
    try {
        const response = await fetch('/api/lead-response/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, action })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `${t('error.actionFailed')} ${action}`);
        }
        // Optimistic update or refetch
        // For simplicity, refetching the whole queue.
        // Optimistic: update item in setQueueItems, or remove if cancelled.
        await fetchQueueItems();
    } catch (err) {
        if (err instanceof Error) setError(err.message); // Display error to user
        else setError(`${t('error.actionFailed')} ${action}`);
    } finally {
        setActionLoading(prev => ({...prev, [itemId]: false}));
    }
  };


  if (isLoading && queueItems.length === 0) {
    return <QueueLoading />; // Using the dedicated loading component
  }


  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 text-[#1B1F3B] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <Button 
            size="lg" 
            className="bg-white text-[#1B1F3B] border border-gray-300 hover:bg-gray-100 flex items-center gap-2"
            onClick={fetchQueueItems}
            disabled={isLoading}
        >
          <RefreshIcon className={`w-5 h-5 ${isLoading && Object.values(actionLoading).every(v => !v) ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200 shadow-sm mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <div><p className="text-red-700 font-semibold">{error}</p></div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <QueueListIcon className="w-6 h-6 mr-2 text-purple-600" /> {t('tableTitle')}
          </CardTitle>
          <CardDescription>{t('tableDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {queueItems.length === 0 && !isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">{t('noItems')}</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableHeaders.leadId')}</TableHead>
                  <TableHead>{t('tableHeaders.ruleTriggered')}</TableHead>
                  <TableHead>{t('tableHeaders.status')}</TableHead>
                  <TableHead>{t('tableHeaders.queuedAt')}</TableHead>
                  <TableHead>{t('tableHeaders.lastAttempt')}</TableHead>
                  <TableHead>{t('tableHeaders.errorMessage')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800" title={item.leadId}>{item.leadIdentifier}</TableCell>
                    <TableCell className="text-sm text-gray-600" title={item.ruleId}>{item.ruleTriggered}</TableCell>
                    <TableCell><StatusDisplay status={item.status} t={t} /></TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDate(item.queuedAt, 'en')}</TableCell>
                    <TableCell className="text-xs text-gray-500">{formatDate(item.lastAttemptAt, 'en')}</TableCell>
                    <TableCell className="text-xs text-red-600 max-w-xs truncate" title={item.errorMessage}>{item.errorMessage || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {(item.status === 'failed' || item.status === 'pending') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => handleQueueAction(item.id, 'retry')}
                            disabled={actionLoading[item.id]}
                            title={t('actions.retry') as string}
                          >
                            <RetryIcon className={`w-3.5 h-3.5 ${actionLoading[item.id] ? 'animate-spin':''}`} />
                          </Button>
                        )}
                        {item.status !== 'completed' && item.status !== 'processing' && ( // Cannot cancel completed or currently processing items
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2 text-xs border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => handleQueueAction(item.id, 'cancel')}
                            disabled={actionLoading[item.id]}
                            title={t('actions.cancel') as string}
                          >
                            <CancelIcon className={`w-3.5 h-3.5 ${actionLoading[item.id] ? 'animate-pulse':''}`} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
