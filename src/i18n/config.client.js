'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18n only on the client side
if (typeof window !== 'undefined') {
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      ns: [
        'common',
        'auth',
        'dashboardPage',
        'companiesPage',
        'analyticsOverviewPage',
        'performanceAnalyticsPage',
        'revenueAnalyticsPage',
        'conversionAnalyticsPage',
        'adminBillingPage',
        'adminUsersPage',
        'adminSecurityPage',
        'adminCompliancePage',
        'adminTeamPage',
        'adminAntiSpamPage',
        'adminMonitoringPage',
        'commsPage',
        'commsBulkSenderPage',
        'searchPage',
        'statisticsOverviewPage',
        'statisticsPage',
        'reviews',
        'gapAnalysisPage',
        'analyticsDashboard',
        'scrapingPage',
        'financialPage'
      ],
      defaultNS: 'common',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        addPath: '/api/locales/add/{{lng}}/{{ns}}',
        requestOptions: {
          cache: 'no-cache',
        },
      },
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      supportedLngs: ['en', 'fr'],
      nonExplicitSupportedLngs: true,
      load: 'languageOnly',
      cleanCode: true,
      saveMissing: process.env.NODE_ENV === 'development',
      saveMissingTo: 'all',
      returnObjects: true,
    });
}

export default i18n;
