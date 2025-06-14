import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { LanguageDetectorModule } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Custom language detector to handle en-GB
const customLanguageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect() {
    if (typeof window !== 'undefined') {
      const language = window.localStorage.getItem('i18nextLng')
      if (language) {
        if (language === 'en-GB') {
          return 'en'
        }
        return language
      }
    }
    return undefined
  },
  cacheUserLanguage(lng: string) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('i18nextLng', lng)
    }
  },
}

i18n
  .use(Backend)
  .use(customLanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    ns: [
      'common',
      'auth',
      'searchPage',
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
      'scrapersPage',
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
      order: ['customLanguageDetector', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    supportedLngs: ['en', 'fr'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    cleanCode: true,
    saveMissing: process.env.NODE_ENV === 'development',
    saveMissingTo: 'all',
  })

// Add language mapping
i18n.services.languageUtils.addLanguageData({
  'en-GB': {
    name: 'English (UK)',
    nativeName: 'English (UK)',
    isRTL: false,
  },
})

// Map en-GB to en
i18n.services.languageUtils.addLanguageData({
  'en': {
    name: 'English',
    nativeName: 'English',
    isRTL: false,
  },
})

// Handle language changes
if (typeof window !== 'undefined') {
  const storedLang = window.localStorage.getItem('i18nextLng')
  if (storedLang === 'en-GB') {
    i18n.changeLanguage('en')
  }
}

export default i18n 