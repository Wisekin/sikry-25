"use client"

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Activity, AlertTriangle, Bell } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function MonitoringPage() {
  const { t } = useTranslation('adminMonitoringPage');
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const viewMode = searchParams.get('view') || 'grid';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.systemStatus.title')}</CardTitle>
                  <Activity className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{t('overview.systemStatus.value')}</div>
                  <p className="text-xs text-gray-500">{t('overview.systemStatus.description')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.activeAlerts.title')}</CardTitle>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">3</div>
                  <p className="text-xs text-gray-500">{t('overview.activeAlerts.description')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.notifications.title')}</CardTitle>
                  <Bell className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <p className="text-xs text-gray-500">{t('overview.notifications.description')}</p>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle>{t('overview.mainContent.title')}</CardTitle>
                <CardDescription>{t('overview.mainContent.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add monitoring content here */}
                </div>
              </CardContent>
            </Card>
          </>
        );
      case 'alerts':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('alerts.title')}</CardTitle>
              <CardDescription>{t('alerts.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {/* Add alerts list/grid content here */}
              </div>
            </CardContent>
          </Card>
        );
      case 'metrics':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('metrics.title')}</CardTitle>
              <CardDescription>{t('metrics.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {/* Add metrics list/grid content here */}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('header.title')}</h1>
            <p className="text-gray-500 mt-1">{t('header.description')}</p>
          </div>
          <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span>{t('header.refreshButton')}</span>
          </Button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
