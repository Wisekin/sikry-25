I'll explain how Next.js server and client components work, and why we needed to make these changes:

1. **Server vs Client Components in Next.js 13+**
   - By default, all components in Next.js 13+ are **Server Components**
   - Server Components run on the server and can't use:
     - React hooks (`useState`, `useEffect`, `useTranslation`, etc.)
     - Browser APIs
     - Event listeners
     - React context
   - Client Components run in the browser and can use all React features

2. **The Error We Were Seeing**
   ```typescript
   TypeError: (0 , react__WEBPACK_IMPORTED_MODULE_0__.createContext) is not a function
   ```
   This error occurred because:
   - `useTranslation` from `react-i18next` uses React's `createContext` internally
   - We were trying to use it in a server component
   - Server components can't use `createContext`

3. **The Solution Pattern**
   We split our code into two files:

   ```typescript
   // metadata.ts (Server Component)
   export const metadata = {
     title: "Page Title",
     description: "Page description"
   }
   ```
   - This file handles metadata (SEO, page info)
   - It's a server component by default
   - It can't use any client-side features

   ```typescript
   // page.tsx (Client Component)
   "use client"  // This directive makes it a client component

   import { useTranslation } from 'react-i18next'
   import '@/i18n/config.client'

   export default function Page() {
     const { t } = useTranslation()  // Now this works!
     // ... rest of the component
   }
   ```
   - The `"use client"` directive tells Next.js this is a client component
   - Now we can use hooks, context, and other client-side features
   - The i18n configuration is loaded on the client side

4. **Why This Works**
   - Server Components are rendered on the server and sent as HTML
   - Client Components are hydrated on the browser with JavaScript
   - By marking our page as a client component, we ensure all the React features we need are available
   - The metadata is still handled server-side where it belongs

5. **Best Practices**
   - Keep metadata in server components
   - Use client components when you need:
     - React hooks
     - Browser APIs
     - Event listeners
     - React context
     - Interactive features
   - Use server components for:
     - Static content
     - SEO metadata
     - Data fetching
     - Performance optimization

This pattern is particularly important for pages that need:
- Internationalization (i18n)
- State management
- User interactions
- Real-time updates
- Browser APIs

By following this pattern, we get the best of both worlds:
- Server-side rendering for performance and SEO
- Client-side interactivity where needed
- Proper separation of concerns

   // app/(dashboard)/financial/campaign-roi/metadata.ts
   export const metadata = {
     title: "Campaign ROI | SIKRY",
     description: "Track and analyze your campaign return on investment",
   }



   --------------------
   I noticed that the translation keys in your component don't match those in your 
companiesPage.json
 file. Let's update the component to use the correct keys:



------------------
 Added to English translations (
/public/locales/en/commsPage.json
):
json
"history": {
  "title": "Communications History"
}
Added to French translations (
/public/locales/fr/commsPage.json
):
json
"history": {
  "title": "Historique des Communications"
}
Updated the CommunicationsTable component to use the translation key:
Added the useTranslation hook import
Initialized the translation hook with const { t } = useTranslation('commsPage')
Replaced the hardcoded text with the translation key: {t('history.title')}




----------
const filteredCompanies = companies.filter(company => {
    if (filters.industry !== "All Industries" && company.industry !== filters.industry) return false;
    if (filters.location && !company.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.employeeCount !== "All Sizes" && company.employees !== filters.employeeCount) return false;
    if (filters.confidenceScore && company.confidenceScore < filters.confidenceScore) return false;
    if (filters.hasEmail && company.extractedData.emails.length === 0) return false;
    if (filters.hasPhone && company.extractedData.phones.length === 0) return false;
    return true;
  });


  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">
            {t('companySearch.title', { ns: 'searchPage' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {loading && t('searching', { ns: 'searchPage' })}
            {!loading && !error && !noResults && `${filteredCompanies.length} ${t('results.found', { ns: 'searchPage' })}`}
          </p>
          {noResults && !loading && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
              {t('noResults', { ns: 'commsPage' })}
            </div>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {t('error', { ns: 'searchPage' })} {error}
            </div>
          )}
        </div>
        <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
          <Download className="w-5 h-5" /> {t('exportButton', { ns: 'searchPage' })}
        </Button>
      </div>
      
      {/* Search and Source Filters */}
      <Card className="bg-white p-4 shadow-sm">
        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={t('searchPlaceholder', { ns: 'searchPage' })} 
              className="p-6 text-base border-gray-300 focus:ring-2 focus:ring-[#2A3050]" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {t('sources.title', { ns: 'searchPage' })}
            </span>
            {["google", "linkedin", "crunchbase"].map(source => (
              <button key={source} onClick={() => toggleSource(source)} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${selectedSources.includes(source) ? 'bg-[#1B1F3B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {source === "google" && <Globe className="w-4 h-4" />}
                {source === "linkedin" && <Linkedin className="w-4 h-4" />}
                {source === "crunchbase" && <Database className="w-4 h-4" />}
                <span className="capitalize">{source}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Advanced Filters Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-8 h-fit">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1B1F3B]" /> 