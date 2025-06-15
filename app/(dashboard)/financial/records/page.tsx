"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/src/i18n/config.client'
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

const FinancialRecordsPage = () => {
  // Mock data for financial records - will be replaced by API call
  const mockRecords = [
    { id: '1', type: 'income', description: 'Invoice #123 Paid', amount: 1500, currency: 'USD', date: '2023-10-15' },
    { id: '2', type: 'expense', description: 'Software Subscription', amount: 99, currency: 'USD', date: '2023-10-14' },
    { id: '3', type: 'income', description: 'Project Alpha - Phase 1', amount: 5000, currency: 'USD', date: '2023-10-10' },
    { id: '4', type: 'expense', description: 'Office Supplies', amount: 250, currency: 'USD', date: '2023-10-05' },
    { id: '5', type: 'income', description: 'Consulting Services Q3', amount: 2200, currency: 'USD', date: '2023-09-28' },
    { id: '6', type: 'expense', description: 'Cloud Hosting Bill', amount: 150, currency: 'USD', date: '2023-09-25' },
  ];

  // Mock summary data for metric cards
  const totalRevenue = mockRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = mockRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Example change data (replace with actual logic if available)
  // These raw percentage strings will be replaced by t() calls with interpolation
  const revenueChangeValue = "+5.2%"; // Example value
  const expenseChangeValue = "+1.8%"; // Example value
  const profitChangeValue = "+10.5%"; // Example value

  const { t } = useTranslation(['financialPage', 'common']);

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <EnterprisePageHeader title={t('recordsPage.header.title')} subtitle={t('recordsPage.header.subtitle')} />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard
            title={t('recordsPage.metrics.totalRevenue.title')}
            value={totalRevenue.toLocaleString()}
            unit={t('recordsPage.metrics.currencyUnit.usd')}
            icon={<TrendingUp size={24} />}
            change={t('recordsPage.metrics.changeSuffix', { value: revenueChangeValue })}
            changeColor="text-green-600"
          />
          <QualityMetricCard
            title={t('recordsPage.metrics.totalExpenses.title')}
            value={totalExpenses.toLocaleString()}
            unit={t('recordsPage.metrics.currencyUnit.usd')}
            icon={<TrendingDown size={24} />}
            change={t('recordsPage.metrics.changeSuffix', { value: expenseChangeValue })}
            changeColor="text-red-600"
          />
          <QualityMetricCard
            title={t('recordsPage.metrics.netProfit.title')}
            value={netProfit.toLocaleString()}
            unit={t('recordsPage.metrics.currencyUnit.usd')}
            icon={<Briefcase size={24} />}
            change={t('recordsPage.metrics.changeSuffix', { value: profitChangeValue })}
            changeColor="text-green-600"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-[#1B1F3B]">{t('recordsPage.table.title')}</h2>
          {mockRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('recordsPage.table.headers.date')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('recordsPage.table.headers.description')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('recordsPage.table.headers.type')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">{t('recordsPage.table.headers.amount')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">{t('recordsPage.table.headers.currency')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{record.date}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{record.description}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t(`recordsPage.types.${record.type}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">{record.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{record.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">{t('recordsPage.table.noData')}</p>
          )}
          {/* TODO: Add pagination and filtering options */}
        </div>
      </div>
    </div>
  );
};

export default FinancialRecordsPage;
