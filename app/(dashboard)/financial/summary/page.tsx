"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/src/i18n/config.client'
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart2, AlertTriangle } from 'lucide-react';

const FinancialSummaryPage = () => {
  // Mock data for summary - will be replaced by API call
  const summaryData = {
    totalRevenueYTD: 125000,
    totalExpensesYTD: 75000,
    netProfitYTD: 50000,
    averageTransactionValue: 450.75,
    burnRateMonthly: 6250,
    revenueGrowthPercentage: 15,
  };

  // Mock change data
  const revenueChange = "+12% vs last year";
  const expenseChange = "+8% vs last year";
  const profitChange = "+15% vs last year"; // Example value
  const avgTxnChange = "-2.5% vs last month"; // Example value
  const burnRateChange = "-1.0% vs last month"; // Example value
  const revenueGrowthYTD = "+2pts YTD"; // Example value

  const { t } = useTranslation(['financialPage', 'common']);

  const monthlyPerformance = [
    { month: 'Jan', revenue: 10000, expenses: 6000 },
    { month: 'Feb', revenue: 12000, expenses: 7000 },
    { month: 'Mar', revenue: 15000, expenses: 8000 },
    { month: 'Apr', revenue: 13000, expenses: 7500 },
    { month: 'May', revenue: 16000, expenses: 8200 },
  ];
  const maxPerformanceValue = Math.max(...monthlyPerformance.flatMap(item => [item.revenue, item.expenses]));


  const expenseCategories = [
    { name: 'Salaries', value: 40, color: '#3B82F6' }, // Blue
    { name: 'Marketing', value: 25, color: '#10B981' }, // Green
    { name: 'Operations', value: 20, color: '#F59E0B' }, // Amber
    // Mapping static category definitions to translated names
    { nameKey: "summaryPage.charts.expenseCategories.categories.salaries", value: 40, color: '#3B82F6' },
    { nameKey: "summaryPage.charts.expenseCategories.categories.marketing", value: 25, color: '#10B981' },
    { nameKey: "summaryPage.charts.expenseCategories.categories.operations", value: 20, color: '#F59E0B' },
    { nameKey: "summaryPage.charts.expenseCategories.categories.software", value: 15, color: '#6366F1' },
  ].map(cat => ({ ...cat, name: t(cat.nameKey) }));

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader title={t('summaryPage.header.title')} subtitle={t('summaryPage.header.subtitle')} />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard
            title={t('summaryPage.metrics.totalRevenueYTD.title')}
            value={summaryData.totalRevenueYTD.toLocaleString()}
            unit={t('summaryPage.metrics.currencyUnit.usd')}
            icon={<TrendingUp size={24} />}
            change={t('summaryPage.metrics.changeSuffix.vsLastYear', { value: revenueChange })}
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title={t('summaryPage.metrics.totalExpensesYTD.title')}
            value={summaryData.totalExpensesYTD.toLocaleString()}
            unit={t('summaryPage.metrics.currencyUnit.usd')}
            icon={<TrendingDown size={24} />}
            change={t('summaryPage.metrics.changeSuffix.vsLastYear', { value: expenseChange })}
            changeColor="text-red-600"
          />
          <QualityMetricCard
            title={t('summaryPage.metrics.netProfitYTD.title')}
            value={summaryData.netProfitYTD.toLocaleString()}
            unit={t('summaryPage.metrics.currencyUnit.usd')}
            icon={<DollarSign size={24} />}
            change={t('summaryPage.metrics.changeSuffix.vsLastYear', { value: profitChange })}
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title={t('summaryPage.metrics.avgTransactionValue.title')}
            value={summaryData.averageTransactionValue.toLocaleString()}
            unit={t('summaryPage.metrics.currencyUnit.usd')}
            icon={<BarChart2 size={24} />}
            change={t('summaryPage.metrics.changeSuffix.vsLastMonth', { value: avgTxnChange })}
            changeColor="text-red-600"
          />
          <QualityMetricCard
            title={t('summaryPage.metrics.monthlyBurnRate.title')}
            value={summaryData.burnRateMonthly.toLocaleString()}
            unit={t('summaryPage.metrics.currencyUnit.usd')}
            icon={<AlertTriangle size={24} />}
            change={t('summaryPage.metrics.changeSuffix.vsLastMonth', { value: burnRateChange })}
            changeColor="text-green-600" // Assuming lower burn rate is good
          />
          <QualityMetricCard
            title={t('summaryPage.metrics.revenueGrowth.title')}
            value={`${summaryData.revenueGrowthPercentage}%`}
            icon={<TrendingUp size={24} />}
            change={t('summaryPage.metrics.changeSuffix.ytd', { value: revenueGrowthYTD })}
            changeColor="text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#1B1F3B] flex items-center">
              <BarChart2 className="mr-2 text-gray-400" /> {t('summaryPage.charts.monthlyPerformance.title')}
            </h2>
            <div className="h-72 bg-gray-50 p-4 rounded flex items-end justify-around space-x-2">
              {monthlyPerformance.map(item => (
                <div key={item.month} className="text-center flex-1">
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="flex items-end w-full h-full space-x-1">
                        <div
                            className="bg-blue-500 w-1/2"
                            style={{ height: `${(item.revenue / maxPerformanceValue) * 100}%` }}
                            title={t('summaryPage.charts.monthlyPerformance.tooltipRevenue', {value: item.revenue.toLocaleString()})}
                        ></div>
                        <div
                            className="bg-red-400 w-1/2"
                            style={{ height: `${(item.expenses / maxPerformanceValue) * 100}%` }}
                            title={t('summaryPage.charts.monthlyPerformance.tooltipExpenses', {value: item.expenses.toLocaleString()})}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.month}</p> {/* Month initials are usually not translated or handled by date lib's locale */}
                  </div>
                </div>
              ))}
            </div>
             <div className="flex justify-center space-x-4 text-xs mt-2">
                <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 mr-1"></span>{t('summaryPage.charts.monthlyPerformance.legendRevenue')}</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-red-400 mr-1"></span>{t('summaryPage.charts.monthlyPerformance.legendExpenses')}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#1B1F3B] flex items-center">
              <PieChart className="mr-2 text-gray-400" /> {t('summaryPage.charts.expenseCategories.title')}
            </h2>
            <div className="h-72 bg-gray-50 p-4 rounded flex items-center justify-center">
              <div className="flex flex-wrap justify-center items-center">
                {expenseCategories.map(cat => (
                  <div key={cat.name} className="flex flex-col items-center m-2">
                     <div
                        style={{width: '60px', height: '60px', backgroundColor: cat.color, borderRadius: '50%'}}
                        className="flex items-center justify-center shadow"
                        title={t('summaryPage.charts.expenseCategories.tooltipLabel', { name: cat.name, value: cat.value })}
                    >
                       {/* <span className="text-white text-xs font-medium">{cat.value}%</span> */}
                     </div>
                     <p className="text-xs text-gray-600 mt-1">{cat.name} ({cat.value}%)</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryPage;
