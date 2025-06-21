# Scalable Search: Pagination & Backend Caching Plan

## 🚦 Next Action Steps (for Developer/Agent)

1. **Start with the Backend:**
   - Implement a paginated, cache-keyed search API.
   - API should accept query, filters, and pagination params (page/limit or cursor).
   - On first search, run the query, cache the result set, and return the first page, a cacheKey/searchToken, and totalCount.
   - On subsequent requests, accept cacheKey and page/cursor to return the next page from the cached result set.
   - Use offset/limit for small datasets, keyset/cursor-based pagination for large datasets.
   - Store cached result sets with an expiry and clean up expired caches.

2. **Then Update the Frontend:**
   - Add pagination controls (page numbers, next/prev, or infinite scroll) to the /search page.
   - On new search, send query/filters to backend, get first page, cacheKey, and totalCount.
   - Store query, filters, currentPage, and cacheKey in Zustand/localStorage.
   - On page change, fetch the next page using cacheKey and page/cursor.
   - On reload/return, restore state from localStorage and re-fetch the current page using cacheKey.

---

## Context
For large-scale business search (millions of records), the following architecture ensures performance, cost-efficiency, and a great user experience. This plan is for the next developer/agent to implement robust, scalable search with pagination and backend caching.

---

## 1. **Frontend (React/Next.js + Zustand/localStorage)**

### **Persist in State (Zustand/localStorage):**
- `query`: The last search query string
- `filters`: The last used filters (object)
- `currentPage` or `cursor`: The current page number or cursor for pagination
- `cacheKey` or `searchToken`: (If backend returns a cache key for the search session)

### **Do NOT Persist:**
- All results at once (never store millions of records in the browser)

### **Behavior:**
- On search, send query/filters to backend, get first page of results and cache key.
- On page change (next/prev/infinite scroll), fetch only the next page using cache key and page/cursor info.
- On reload or return, restore last query/filters/page/cacheKey from localStorage and re-fetch current page if needed.

---

## 2. **Backend (API/Database)**

### **Implement Efficient Pagination:**
- Use **offset/limit** for small datasets.
- Use **keyset/cursor-based pagination** for large datasets (e.g., `WHERE id > last_seen_id LIMIT 50`).

### **Backend Caching:**
- On new search, run the expensive query (AI/full-text/etc.), cache the result set, and return:
  - First page of results
  - A `cacheKey` or `searchToken` for this search session
- On subsequent page requests, use the cache key to fetch the next page from the cached result set (no need to re-run the expensive query).

### **API Contract Example:**
- `POST /api/search` (body: { query, filters }) → returns { results, cacheKey, totalCount }
- `GET /api/search/page?cacheKey=...&page=2` → returns { results, page, totalCount }

---

## 3. **UI/UX**
- Show paginated results (page numbers or infinite scroll)
- Show total results if available (e.g., "Page 2 of 1000")
- Restore last search state on reload or return to the search page

---

## 4. **Rationale & Best Practices**
- **Performance:** Only a small page of results is ever loaded in the browser.
- **Cost/Quota:** Avoids repeated expensive API/AI/database calls by caching on the backend.
- **UX:** Users see their last search instantly, even after reloads.
- **Scalability:** Works for millions of records; never loads or stores all results at once.

---

## 5. **Next Steps for Implementation**
1. Add pagination UI to the search page (page numbers or infinite scroll)
2. Update backend API to support paginated, cache-keyed search
3. Persist query, filters, current page, and cacheKey in Zustand/localStorage
4. On reload, restore state and re-fetch current page using cacheKey
5. Test with large datasets to ensure performance and UX

---

**This plan is based on best practices for SaaS, search, and AI-powered business intelligence platforms.** 



## Diagnosing the Search Result Limitation

### Problem
- Despite configuring the frontend and external API adapters to fetch 50 results per page, the final search results returned to the user were consistently limited to only 2-3 items.
- Initial investigation ruled out frontend filtering, caching issues, and adapter-level limits.

### Diagnosis
- Detailed logging was added to the `/api/search` endpoint to trace the number of results returned from each data source (Supabase, Companies House, Wikidata) before the final merge and rank step.
- The logs revealed that while external sources (Companies House, Wikidata) were correctly returning 50 results each, the `mergeAndRankResults` function was aggressively filtering this list down to only a few items.

### Root Cause
- The core issue lies within the `mergeAndRankResults` logic, which is too strict in its de-duplication and relevance ranking, causing it to discard the vast majority of valid results.

## 3. Search Results Investigation & Fix (June 2025)

### Summary
The primary goal was to diagnose why search queries for broad terms like "software" were only returning 2-3 results, which prevented pagination testing. The investigation revealed the issue was not with frontend filtering or API limits, but with an overly aggressive de-duplication algorithm in the backend's merging logic.

### Problem Diagnosis Journey
1.  **Initial Theory (Frontend Filtering)**: It was first suspected that client-side filters were hiding results. This was disproven.
2.  **Second Theory (API Limits)**: Investigation showed the frontend requested 10 items per page by default. This was increased to 50 in `stores/searchStore.ts`.
3.  **Third Theory (Adapter Limits)**: Further logging showed that the external data source adapters (`companiesHouse.ts`, `wikidata.ts`) had hardcoded limits of 10 results. These were also increased to 50.
4.  **Final Diagnosis (Merging Logic)**: Even with 100+ results coming from the adapters, the final output was still ~2. Detailed logging pinpointed the `mergeAndRankResults` function in `src/search/search-logic.ts` as the culprit. Its de-duplication logic was incorrectly merging dozens of unique companies.

### Solution (Temporary)
The de-duplication logic in `mergeAndRankResults` was temporarily bypassed to allow all results from the adapters to be passed through for ranking. This unblocks frontend development but requires a more sophisticated de-duplication strategy in the future.

---

## 4. Key Components Updated
The following files were modified during the investigation and fix:
- `stores/searchStore.ts`: Increased default `pageSize` to 50.
- `src/search/adapters/companiesHouse.ts`: Increased `items_per_page` to 50.
- `src/search/adapters/wikidata.ts`: Increased `limit` to 50.
- `src/search/search-logic.ts`: Temporarily bypassed the de-duplication logic.
- `app/api/search/route.ts`: Added and removed temporary logging to diagnose the issue.

---

## 5. Next Steps: Implementing Pagination UI

### Goal
The backend and state management are now ready for pagination. The next developer's task is to build the UI components to allow users to navigate through pages of search results.

### System State
- **Backend**: The `GET /api/search` endpoint is fully functional. It accepts `page` and `limit` query parameters and returns paginated data, including `totalCount` in the metadata.
- **Frontend State**: `stores/searchStore.ts` manages all necessary pagination state (`pagination.currentPage`, `pagination.totalCount`, `pagination.pageSize`) and provides actions (`goToNextPage`, `goToPrevPage`) to trigger API calls for different pages.

### Tasks for Next Developer
1.  **Build UI Controls**: In `app/(dashboard)/search/page.tsx` (or a sub-component like `SearchContent`), add UI elements for pagination. This could be "Previous" / "Next" buttons, a "Load More" button, or page numbers.
2.  **Connect UI to State**:
    - Wire the UI controls to call the `goToNextPage()` and `goToPrevPage()` actions from the `useSearchStore`.
    - Display feedback to the user, such as "Page {currentPage} of {totalPages}" or "Showing results {start}-{end} of {totalCount}". All necessary data is available in the `pagination` object in the store.
3.  **Handle UI State**:
    - Use the `isFetchingPage` state from the store to show a loading indicator when a new page is being fetched.
    - Conditionally disable the "Previous" button when `currentPage` is 1, and the "Next" button when on the last page. The last page can be calculated with `Math.ceil(totalCount / pageSize)`.

---

## Fixing the Map Issue in MapView

### Problem
- The map was not rendering due to a missing or invalid Mapbox access token, and the use of a Mapbox style URL with MapLibre.
- There was also a runtime error: `Invalid LngLat object: (NaN, NaN)` caused by companies with missing or invalid latitude/longitude values.

### Solution Steps
1. **Switched to MapLibre**: Used the open-source MapLibre library with `react-map-gl/maplibre` instead of Mapbox, which does not require a Mapbox access token.
2. **Used a Free Map Style**: Updated the `mapStyle` prop to use a free, open-source style URL (e.g., CartoDB Positron) instead of a Mapbox style URL.
3. **Removed Access Token Requirement**: Removed the check and prop for `mapboxAccessToken` in the `MapView` component, as it is not needed for MapLibre.
4. **Filtered Invalid Coordinates**: Added a filter to only render map markers for companies with valid (non-NaN) latitude and longitude values, preventing runtime errors.
5. **TypeScript Compatibility**: Added a `// @ts-expect-error` comment to suppress type errors for the MapLibre workaround (`maplibregl.supported = () => true`).

### Result
- The map now renders correctly using open-source tiles, without requiring a Mapbox token.
- Only companies with valid coordinates are shown as markers, preventing errors and improving user experience.

---

## 6. Implementing and Debugging Backend Pagination & Caching (June 2025)

### Summary
After implementing the basic pagination UI, several critical backend issues were discovered that prevented it from working correctly. The root causes were related to incorrect `totalCount` calculation, flawed caching logic, and an inefficient database query strategy. This section details the debugging journey and the final implementation that resolved these issues.

### Problem Diagnosis Journey
1.  **Initial Bug (UI Not Appearing)**: The pagination controls would not appear, even when there were clearly more results available. This was because the backend was only reporting the number of results on the current page (e.g., 15) as the `totalCount`, leading the frontend to believe there was only one page.
2.  **Second Bug (Disappearing Pagination)**: After a temporary fix, a caching bug emerged. The first search correctly showed the total number of pages. However, upon clicking "Next," the backend would read from a cache that only contained the first page's 15 results. It would then recalculate the `totalCount` to be 15, report this to the frontend, and the pagination controls would disappear.
3.  **Third Bug (500 Internal Server Error)**: While attempting to fix the pagination, a change to the internal database query function introduced a 500 error, which prevented any results from being returned.

### Solution Steps
1.  **Correct `pageSize`**: The default `pageSize` in `stores/searchStore.ts` was set to `15` to match the intended design.
2.  **Refactored Adapters for Pagination**:
    - The `companiesHouseAdapter` and `wikidataAdapter` were modified to accept `limit` and `page` parameters, removing hardcoded limits.
    - The `SearchAdapter` interface was updated to return a `SearchAdapterResponse` object, which includes both the `results` and the `totalCount` provided by the external API. This was key to getting an accurate total.
3.  **Accurate `totalCount` Calculation**:
    - The API route (`/api/search/route.ts`) was updated to sum the `totalCount` from all data sources (Supabase, Companies House) to generate a correct grand total for the frontend.
    - For Wikidata, which doesn't provide a total, a simple heuristic was added to estimate if more pages are available.
4.  **Database Pagination Fix**: The `performSearch` function was rewritten to use proper, efficient database-level pagination with `.range(from, to)`, ensuring it only ever fetches the requested page. The query error causing the 500 status was also fixed.
5.  **Complete Caching Rework**: The core of the fix was rewriting the caching logic. The flawed strategy of caching the "full result set" was removed. The new strategy caches each page of results individually. If a requested page is not in the cache, a fresh query is made to all data sources for that specific page, guaranteeing data consistency.

### Result
- Pagination is now stable, robust, and efficient.
- The `totalCount` remains accurate and consistent across all page requests.
- The backend and database now only process the data needed for the current page, significantly improving performance.
- The caching mechanism is simple, correct, and no longer causes state inconsistencies on the frontend.

