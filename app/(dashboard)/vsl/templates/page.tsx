"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config.client';
import EnterprisePageHeader from '@/src//components/core/layout/EnterprisePageHeader';
import { Skeleton } from '@/src//components/ui/skeleton';
import { Button } from '@/src//components/ui/button';
import { FileText, PlusCircle, Eye, Edit3, PlayCircle, Video, AlertCircle } from 'lucide-react';

interface VSLTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
}

interface VSLTemplatesData {
  templates: VSLTemplate[];
}

const VSLTemplatesPage = () => {
  const { t } = useTranslation('vslTemplatesPage');
  const [data, setData] = useState<VSLTemplatesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch('/api/vsl/templates')
      .then(res => {
        if (!res.ok) throw new Error(t('errors.fetchFailed'));
        return res.json();
      })
      .then(responseData => {
        if (responseData.error) {
          throw new Error(responseData.error.message || t('errors.fetchFailed'));
        }
        setData(responseData.data);
      })
      .catch(err => { setError(err.message); setData(null); })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <EnterprisePageHeader title={t('header.title')} subtitle={t('header.loadingSubtitle')} />
        <div className="p-6 md:p-10">
          <div className="flex justify-end mb-6">
            <Skeleton className="h-10 w-48 rounded-lg bg-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
                <div>
                  <Skeleton className="h-32 w-full rounded-md bg-slate-200 mb-4" />
                  <Skeleton className="h-6 w-3/4 rounded-md bg-slate-200 mb-2" />
                  <Skeleton className="h-4 w-full rounded-md bg-slate-200 mb-1" />
                  <Skeleton className="h-4 w-5/6 rounded-md bg-slate-200 mb-4" />
                </div>
                <div className="flex justify-start space-x-2 mt-auto">
                  <Skeleton className="h-9 w-24 rounded-md bg-slate-200" />
                  <Skeleton className="h-9 w-20 rounded-md bg-slate-200" />
                  <Skeleton className="h-9 w-9 rounded-md bg-slate-200" />
                </div>
              </div>
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
            <Button variant="destructive" onClick={() => window.location.reload()}>
              {t('actions.tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.templates || data.templates.length === 0) return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />
      <div className="p-6 md:p-10">
        <div className="flex justify-end mb-6">
          <Button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white">
            <PlusCircle size={18} className="mr-2" /> {t('actions.createNew')}
          </Button>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-400 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('emptyState.title')}</h2>
          <p className="text-gray-600 mb-4">{t('emptyState.description')}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t('actions.refresh')}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title={t('header.title')} subtitle={t('header.subtitle')} />
      <div className="p-6 md:p-10">
        <div className="flex justify-end mb-6">
          <Button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white">
            <PlusCircle size={18} className="mr-2" /> {t('actions.createNew')}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.templates.map((template) => (
            <div key={template.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                {template.thumbnailUrl ? (
                  <img src={template.thumbnailUrl} alt={template.name} className="w-full h-32 object-cover rounded-md mb-4" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-md mb-4 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-[#1B1F3B] mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              </div>
              <div className="flex justify-start space-x-2 mt-auto">
                <Button variant="outline" className="flex-1" title={t('actions.preview')}>
                  <Eye size={18} className="mr-2" /> {t('actions.preview')}
                </Button>
                <Button variant="outline" className="flex-1" title={t('actions.use')}>
                  <PlayCircle size={18} className="mr-2" /> {t('actions.use')}
                </Button>
                <Button variant="ghost" size="icon" title={t('actions.edit')}>
                  <Edit3 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VSLTemplatesPage;