"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config.client';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import { Skeleton } from '@/src//components/ui/skeleton';
import { Button } from '@/src//components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src//components/ui/table";
import { PlusCircle, Eye, Edit3, BarChart3, Settings, Trash2, AlertCircle, Video } from 'lucide-react';
import Link from 'next/link';

interface VSLPageStat {
  views: number;
  conversions: number;
}

interface VSLPageEntry {
  id: string;
  title: string;
  templateName: string;
  status: 'Draft' | 'Published' | 'Archived';
  stats: VSLPageStat;
  createdAt: string;
  liveUrl?: string;
}

interface VSLPagesData {
  pages: VSLPageEntry[];
}

const VSLPagesPage = () => {
  const { t } = useTranslation('vslPagesPage');
  const [data, setData] = useState<VSLPagesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    fetch('/api/vsl/pages')
      .then(res => {
        if (!res.ok) throw new Error(t('errors.fetchFailed'));
        return res.json();
      })
      .then(responseData => {
        if (responseData.error) {
          throw new Error(responseData.error.message || t('errors.fetchFailed'));
        }
        const mappedPages = responseData.data.pages.map((page: any) => ({
          id: page.page_id,
          title: page.title,
          templateName: page.template_name,
          status: page.status,
          stats: page.stats,
          createdAt: page.created_at,
          liveUrl: page.live_url
        }));
        setData({ pages: mappedPages });
      })
      .catch(err => { setError(err.message); setData(null); })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadgeStyle = (status: VSLPageEntry['status']) => {
    if (status === 'Published') return 'bg-green-100 text-green-700';
    if (status === 'Archived') return 'bg-gray-200 text-gray-600';
    return 'bg-yellow-100 text-yellow-700';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title={t('header.title')} subtitle={t('header.loadingSubtitle')} />
        <div className="p-6 md:p-10">
          <div className="flex justify-end mb-6">
            <Skeleton className="h-10 w-52 rounded-lg bg-white" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <Skeleton className="h-10 w-full rounded-md bg-slate-200 mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md bg-slate-200 mb-2" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title={t('header.title')} subtitle={t('header.errorSubtitle')} />
        <div className="p-6 md:p-10 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">{t('errors.loadFailed')}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="destructive" onClick={fetchData}>
              {t('actions.tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />
      <div className="p-6 md:p-10">
        <div className="flex justify-end mb-6">
          <Button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white">
            <PlusCircle size={18} className="mr-2" /> {t('actions.createNew')}
          </Button>
        </div>

        {(!data?.pages || data.pages.length === 0) ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <Video className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('emptyState.title')}</h2>
            <p className="text-gray-600 mb-4">{t('emptyState.description')}</p>
            <Button variant="outline" onClick={fetchData}>
              {t('actions.refresh')}
            </Button>
          </div>
        ) : (
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.headers.title')}</TableHead>
                    <TableHead>{t('table.headers.template')}</TableHead>
                    <TableHead>{t('table.headers.status')}</TableHead>
                    <TableHead>{t('table.headers.views')}</TableHead>
                    <TableHead>{t('table.headers.conversions')}</TableHead>
                    <TableHead className="text-right">{t('table.headers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>{page.templateName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(page.status)}`}>
                          {t(`table.status.${page.status.toLowerCase()}`)}
                        </span>
                      </TableCell>
                      <TableCell>{page.stats.views.toLocaleString()}</TableCell>
                      <TableCell>{page.stats.conversions.toLocaleString()}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" title={t('actions.view')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t('actions.edit')}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t('actions.analytics')}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t('actions.settings')}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title={t('actions.delete')}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VSLPagesPage;