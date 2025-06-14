"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { ShieldCheck, AlertTriangle, Lock } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function CompliancePage() {
  const { t } = useTranslation('adminCompliancePage');
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'
  const viewMode = searchParams.get('view') || 'grid'

  // Mock data for interpolation
  const gdprPercentage = 100;
  const ccpaPercentage = 100;
  const lastAuditTimeAgo = "2 days ago"; // This would typically be dynamic

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.stats.gdpr.title')}</CardTitle>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{t('overview.stats.gdpr.value', { percentage: gdprPercentage })}</div>
                  <p className="text-xs text-gray-500">{t('overview.stats.gdpr.description')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.stats.ccpa.title')}</CardTitle>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{t('overview.stats.ccpa.value', { percentage: ccpaPercentage })}</div>
                  <p className="text-xs text-gray-500">{t('overview.stats.ccpa.description')}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('overview.stats.auditStatus.title')}</CardTitle>
                  <Lock className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{t('overview.stats.auditStatus.valuePassed')}</div>
                  <p className="text-xs text-gray-500">{t('overview.stats.auditStatus.lastAuditFormat', { timeAgo: lastAuditTimeAgo })}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle>{t('overview.mainContent.title')}</CardTitle>
                <CardDescription>{t('overview.mainContent.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add compliance content here */}
                </div>
              </CardContent>
            </Card>
          </>
        )
      case 'logs':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('logsTab.title')}</CardTitle>
              <CardDescription>{t('logsTab.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {/* Add logs list/grid content here */}
              </div>
            </CardContent>
          </Card>
        )
      case 'policies':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('policiesTab.title')}</CardTitle>
              <CardDescription>{t('policiesTab.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {/* Add policies list/grid content here */}
              </div>
            </CardContent>
          </Card>
        )
      case 'reports':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('reportsTab.title')}</CardTitle>
              <CardDescription>{t('reportsTab.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                {/* Add reports list/grid content here */}
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">{t('header.title')}</h1>
            <p className="text-gray-500 mt-1">
              {t('header.subtitle')}
            </p>
          </div>
          <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span>{t('header.runAuditButton')}</span>
          </Button>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}
