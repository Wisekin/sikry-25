the usage-based pruning and metrics that the current schema doesn't support  at sewrch: (. Cache Pruning and Metrics
You're right to ask about this. The features I removed are indeed valuable for a production application, but they depended on a database structure that your project doesn't have. Here’s what they do:

Usage-Based Pruning:

What it is: Imagine your cache is like a small, fast-access shelf. When it gets full, you need to decide what to remove to make space for new items. A simple approach is to just remove the oldest items. Usage-based pruning is smarter. It removes items based on how often they are used.
How it works: The old 
CacheManager
 was designed to track an access_count for each cached item. When the cache reached its size limit (e.g., 1000 entries for a "starter" plan), the pruning function would run and delete the 10% of entries that were accessed the least.)


 * **Usage-Based Pruning:** This feature helps

 * **The feature to redirect the user google if the AI and fallback  failled to find a match** is not supported in your current schema because it depends on a database structure that


 * **For production or large datasets, consider self-hosting Nominatim or using a paid service.**

```To Do next: 
 Geocoding To-Do List
1. Backend Geocoding Integration
[ ] Choose a Geocoding Service:
Use OpenStreetMap Nominatim for free, open-source geocoding (recommended for your stack and cost goals).
[ ] Create a Geocoding Utility:
Write a utility function (e.g., in lib/utils/geocode.ts) that takes an address and returns latitude/longitude using the Nominatim API.
[ ] Integrate Geocoding in Data Pipeline:
In your backend API route (e.g., /app/api/companies/ or wherever you fetch/enrich company data):
When a company is fetched/created/updated, check if it has latitude and longitude.
If not, call the geocoding utility to get coordinates.
Store the coordinates in Supabase for future use (to avoid repeated geocoding).
[ ] Respect Rate Limits:
Add a delay (e.g., 1 request/second) or batch geocoding to avoid being blocked by Nominatim.
2. Frontend/Map Integration
[ ] Update MapView Logic:
Ensure the map only tries to render markers for companies with valid coordinates.
[ ] (Optional) Fallback Geocoding:
If you want, add a fallback in the frontend to geocode addresses on the fly (not recommended for production, but useful for demos).
3. Testing & Validation
[ ] Test with Real Data:
Run a search and verify that companies with addresses but no coordinates are geocoded and appear on the map.
[ ] Handle Geocoding Failures:
Gracefully handle cases where geocoding fails (e.g., show a warning, skip marker).
4. Documentation
[ ] Document the Geocoding Flow:
Add a section to your README or developer docs explaining how/where geocoding is performed, and any rate limits or caveats. ```



FOR DEVELOPER A:

1. Implement the missing piece in stores/searchStore.ts.
2. Add the necessary logic to handle geocoding in the frontend and map integration
. Missing Piece
The core state management logic for discovery/scraping (actions, state, and wiring in the store) is missing from the codebase. The frontend and tests assume it exists, but it is not implemented in stores/searchStore.ts or any other file found so far.
Path: stores/searchStore.ts


-keep both AI triggered scraper Approach
-Leave the old scraper component to support advanced/manual scraping for power users (e.g., custom selectors, scheduled scrapes, bulk jobs),upport advanced/manual scraping for power users (e.g., custom selectors, scheduled scrapes, bulk jobs), an admin dashboard for managing all scrapers, monitoring jobs, or debugging scraping issues.

-----
Old Approach: Users could create/manage custom scrapers, configure selectors, and run them manually.
New Approach: Scraping is triggered directly from the search/company card UI, often with auto-generated or AI-assisted config, and is more “one-click” for the user.


Further automating the scraping logic
Improving the UI/UX for the one-click flow
Integrating more AI/auto-detection
Or anything else in this new approach


CompanyCard.tsx (main card design)
DiscoveryModal.tsx (dialog design)
ScrapingProgress.tsx (progress indicators) -- to beautify

Next steps:
1.Beautify the UI ---> Done but we can still improve because I want the best of the best
2. redirect the user to use google if an info is not found (like if the serach querry is: "trip advisor" and the user does not find any results, redirect or ask the user to go the the link to main google search outside the app and come back to the app to paste the link and scrape)
3. filter the free data from the backend to have only data that have valid website with "https://"
4. Implement auto-generated or AI-assisted config ---> I think done
5. Implement the AI scrapping logic and save into the database,  but before, check the db to see  if the info correlate ...

NB: Read progress/Plan/search-scraper-integration-plan.md  to understand how we distributed the tasks to 3 developpers and do the same. But please talke your time go through the plan, the codebase, read progress/Building-Plan.md and progress/Building.Plan-reviewed-Only-Search-feature.md, you can check all database tables here: database/migrations and create a good plan for the next steps. Finally attribute the tasks to the developpers A , B and C.

