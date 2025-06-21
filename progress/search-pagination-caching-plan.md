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

