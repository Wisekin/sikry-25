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