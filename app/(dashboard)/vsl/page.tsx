"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/i18n/config.client';
import EnterprisePageHeader from '@/src//components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src//components/ui/quality-metric-card';
import { Video, FileText, ListChecks, BarChart3, Eye, CheckCircle2, Percent } from 'lucide-react';

const VSLOverviewPage = () => {
  const { t } = useTranslation('vslPage');

  const overviewStats = {
    totalVSLPages: 12,
    activeVSLs: 8,
    totalViews: 25600,
    overallConversionRate: 7.5,
  };

  const navLinks = [
    { 
      href: "/vsl/templates", 
      title: t('navLinks.templates.title'),
      description: t('navLinks.templates.description'), 
      icon: <FileText className="text-blue-600 group-hover:text-blue-700" /> 
    },
    { 
      href: "/vsl/pages", 
      title: t('navLinks.myPages.title'),
      description: t('navLinks.myPages.description'),
      icon: <Video className="text-emerald-600 group-hover:text-emerald-700" /> 
    },
    { 
      href: "/vsl/tracking", 
      title: t('navLinks.tracking.title'),
      description: t('navLinks.tracking.description'),
      icon: <BarChart3 className="text-purple-600 group-hover:text-purple-700" /> 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader 
        title={t('header.title')} 
        subtitle={t('header.subtitle')} 
      />
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QualityMetricCard 
            title={t('stats.totalVSLPages.title')} 
            value={overviewStats.totalVSLPages.toLocaleString()} 
            icon={<Video className="text-indigo-600" />} 
          />
          <QualityMetricCard 
            title={t('stats.activeVSLs.title')} 
            value={overviewStats.activeVSLs.toLocaleString()} 
            icon={<CheckCircle2 className="text-green-600" />} 
          />
          <QualityMetricCard 
            title={t('stats.totalViews.title')} 
            value={overviewStats.totalViews.toLocaleString()} 
            icon={<Eye className="text-sky-600" />} 
          />
          <QualityMetricCard 
            title={t('stats.overallConversionRate.title')} 
            value={`${overviewStats.overallConversionRate.toFixed(1)}%`} 
            icon={<Percent className="text-pink-600" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#3C4568] transition-all duration-300 group">
              <div className="flex items-center mb-3">
                {React.cloneElement(link.icon, { size: 24, className: `${link.icon.props.className} mr-3` })}
                <h3 className="text-xl font-semibold text-[#1B1F3B] group-hover:text-[#2A3050]">{link.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VSLOverviewPage;