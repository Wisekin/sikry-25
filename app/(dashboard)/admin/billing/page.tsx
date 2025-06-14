"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { CreditCard, Receipt, Activity, Package } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"

export default function BillingPage() {
  const { t } = useTranslation(['adminBillingPage', 'common']); // Added 'common' just in case, though not strictly needed by task
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('stats.currentPlan.title')}</CardTitle>
                  <Package className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{t('stats.currentPlan.planName')}</div>
                  {/* Assuming 'amount' is a placeholder for actual price value from data */}
                  <p className="text-xs text-gray-500">{t('stats.currentPlan.priceFormat', { amount: "$99" })}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('stats.nextInvoice.title')}</CardTitle>
                  <Receipt className="w-5 h-5 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {/* Amount is directly from JSON as it includes currency symbol */}
                  <div className="text-2xl font-bold text-amber-600">{t('stats.nextInvoice.amount')}</div>
                  {/* Assuming 'date' is a placeholder for actual date value from data */}
                  <p className="text-xs text-gray-500">{t('stats.nextInvoice.dueOnFormat', { date: "March 1, 2024" })}</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">{t('stats.usage.title')}</CardTitle>
                  <Activity className="w-5 h-5 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  {/* Assuming currentUsage and quota are placeholders for actual values from data */}
                  <div className="text-2xl font-bold text-emerald-600">{t('stats.usage.usageFormat', { currentUsage: "7500", quota: "10000" })}</div>
                  <p className="text-xs text-gray-500">{t('stats.usage.ofMonthlyQuota')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-white border-none shadow-sm">
              <CardHeader>
                <CardTitle>{t('billingOverview.title')}</CardTitle>
                <CardDescription>{t('billingOverview.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add billing content here */}
                </div>
              </CardContent>
            </Card>
          </>
        )
      case 'invoices':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('invoices.title')}</CardTitle>
              <CardDescription>{t('invoices.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add invoices content here */}
              </div>
            </CardContent>
          </Card>
        )
      case 'usage':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('usageAnalytics.title')}</CardTitle>
              <CardDescription>{t('usageAnalytics.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add usage content here */}
              </div>
            </CardContent>
          </Card>
        )
      case 'plans':
        return (
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t('availablePlans.title')}</CardTitle>
              <CardDescription>{t('availablePlans.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add plans content here */}
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
            <p className="text-gray-500 mt-1">{t('header.subtitle')}</p>
          </div>
          <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <span>{t('buttons.updatePaymentMethod')}</span>
          </Button>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}
