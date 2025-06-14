# Natural Language Search Feature Implementation Progress

### Date: 2025-06-08: Translation and Search Component Updates

**Objective:** Fix translation object rendering issues in SelectValue components and update French translations.

**Work Performed & Key Changes:**
1. Fixed translation object rendering in search results components:
   - Updated SelectValue components to properly display values instead of translation objects
   - Added missing French translations for search filters and related UI elements
   - Ensured consistent translation handling across filter components

**Current Status:**
- Translation objects are now properly rendered in SelectValue components
- French translations are complete for search-related UI elements
- Components consistently use translated strings

**Next Steps:**
1. **Component Review:**
   - Review remaining SelectValue components in other parts of the application for similar issues
   - Test translation rendering with other languages if supported
2. **Error Handling:**
   - Add fallback text for missing translations
   - Implement proper error boundaries around translation-dependent components
3. **User Experience:**
   - Test filter behavior with different languages
   - Ensure proper translation of dynamic content (e.g., search results, error messages)
4. **Documentation:**
   - Document translation requirements for new components
   - Update contributor guidelines for handling translations

---

## 🤖 Agent Rules
IMPORTANT: These rules must never be deleted and must be referenced before any action:
1. Always verify file existence before creation using appropriate tools
2. Update this progress file after EVERY significant change:
   - Move completed items to "Completed ✅" section
   - Add new tasks to "Next Steps 📝" section
   - Update "In Progress 🚧" with current tasks
3. Each update must maintain clear tracking of:
   - What was just completed
   - What is currently being worked on
   - What should be done next
4. Never remove completed items - they serve as implementation history

---

### Date: 2025-06-07 (Evening): RLS, Session, and User ID Mismatch Resolution

**Objective:** Resolve critical Supabase session errors, RLS infinite recursion, and subsequent data access issues.

**Previous State (from earlier today):**
- Next.js 15.x & Supabase SSR cookie handling issues were largely resolved by updating Supabase client initialization and middleware.
- A critical "infinite recursion detected in policy for relation 'team_members'" error was the primary blocker.
- After initial RLS policy adjustments, a "PGRST116: JSON object requested, multiple (or no) rows returned" error appeared when fetching team member data, indicating the user wasn't found in `team_members`.

**Work Performed & Key Changes (This Session):**
1.  **Middleware Naming Correction (Recap & Confirmation):**
    *   Ensured the Next.js middleware file was correctly named `middleware.ts` at the project root. This was a key step in resolving initial "No active session found" errors by allowing Next.js to correctly process Supabase session cookies.
2.  **RLS Infinite Recursion Fix (`team_members`):
    *   The RLS policy on `team_members` causing infinite recursion (likely `USING (organization_id IN (SELECT organization_id FROM team_members WHERE user_id = auth.uid()))`) was successfully replaced.
    *   Implemented a `SECURITY DEFINER` SQL function `public.get_user_organization_ids_array(user_id_input uuid)` that returns an array of `organization_id`s for a given user, crucially *without* re-triggering RLS on `team_members` within the function itself.
    *   Updated the `SELECT` RLS policy on `team_members` to use this function: `USING (organization_id = ANY (public.get_user_organization_ids_array(auth.uid())))`.
    *   Added a policy to allow users to see their own `team_member` entries: `USING (user_id = auth.uid())`.
    *   These changes were applied to `schema.sql` and confirmed in the Supabase project, resolving the recursion error.
3.  **User ID Mismatch & "PGRST116" Error Resolution:
    *   Diagnosed the "PGRST116" (0 rows returned for `.single()`) error on `team_members` lookup.
    *   Discovered a mismatch between `auth.users.id` (e.g., `ec5ff86e-...` for `john.doe@acme.com`) and the `user_id` stored in `public.users` and subsequently in `team_members` for older/mock data (e.g., `c0eebc...`).
    *   The `handle_new_user` trigger (copying `auth.users.id` to `public.users.id` on new user creation) was confirmed to be working correctly for new users.
    *   Tested with a newer user (`salomon@sikso.ch`, auth ID `47504076-...`) whose `public.users.id` and `team_members.user_id` correctly matched their `auth.uid()`. This user successfully fetched their companies, confirming the RLS and data access logic now works when IDs are consistent.

**Current Status & Outcomes:**
-   **SUCCESS:** The "No active session" errors are resolved (due to correct middleware and Supabase SSR setup).
-   **SUCCESS:** The "infinite recursion detected in policy for relation 'team_members'" error is **resolved** by the new RLS function and policies.
-   **SUCCESS:** The "PGRST116" error (0 rows for team member) is understood and **resolved for users with consistent IDs**. The application functions correctly for these users (e.g., `salomon@sikso.ch`).
-   **Known Issue:** Older users populated with mock data (e.g., `john.doe@acme.com`) still have mismatched IDs in `public.users` and `team_members` compared to their `auth.uid()`. This will cause issues for these specific users until their data is corrected or they are no longer used for testing.
-   The `team_members` table is populated via application logic (e.g., user invites, organization creation), not automatically by a trigger upon user signup (beyond the `public.users` table population).

**Next Steps (Revised Priority):**
1.  **Data Cleanup (Mock Users - As Needed):**
    *   For `john.doe@acme.com` and any other mock users with inconsistent IDs: Decide whether to manually correct their `public.users.id` and `team_members.user_id` to match their `auth.uid()`, or to exclusively use users like `salomon@sikso.ch` (who have correct ID alignment) for further testing and development. *User has indicated they will use `salomon@sikso.ch` and clean up mock data later.*
2.  **Verify Organization/Team Membership Logic:**
    *   Review and test the application flows responsible for adding users to `team_members` (e.g., creating an organization, inviting users). Ensure this process correctly uses the `auth.uid()` for the `user_id` field in `team_members`.
3.  **Security Refinement (`getSession` vs. `getUser` - Optional but Recommended):**
    *   In server-side actions (e.g., `lib/actions/companies.ts`), consider replacing `supabase.auth.getSession()` with `supabase.auth.getUser()` for more robust session validation, as per Supabase recommendations. This is a minor refinement, not a bug fix.
4.  **Re-evaluate Previous "Next Steps":**
    *   Re-check if the `401 Unauthorized` on `/api/search/natural` is still occurring with the `salomon@sikso.ch` user. If so, investigate.
    *   Address React Hydration Mismatch if still present and impacting development.
    *   Monitor Webpack Warning.
    *   Revisit `npm audit` vulnerabilities later.
5.  **Continue with Core Feature Development:** Proceed with the main objectives outlined in the "Overview" and previous "Next Steps" sections now that critical auth/RLS issues are stable.

---

### Date: 2025-06-07: Resolving Next.js 15 & Supabase SSR Cookie Issues & New RLS Challenge

**Objective:** Stabilize Supabase integration in Next.js 15.x, primarily fixing cookie handling errors, and then address subsequent issues.

**Previous State:**
- Persistent `cookies() should be awaited` error in Next.js 15.2.4 (later updated to 15.3.3) when using Supabase SSR, affecting various parts of the application.
- Suspected issues with deprecated Supabase helper libraries and incorrect asynchronous handling of Next.js `cookies()` API.

**Work Performed & Key Changes:**
1.  **Dependency Audit & Cleanup:**
    *   Identified that Next.js 15 made the `cookies()` API from `next/headers` asynchronous, requiring `await`.
    *   Removed the deprecated `@supabase/auth-helpers-nextjs` package from `package.json` and updated dependencies (`npm install`).
2.  **Server-Side Supabase Client (`utils/supabase/server.ts`):**
    *   Modified the `createClient` function to use `createServerClient` from `@supabase/ssr`.
    *   Ensured the `get`, `set`, and `remove` methods within the `cookies` configuration are `async` and correctly `await cookies()`.
3.  **Next.js Middleware (`middleware.ts`):**
    *   Replaced `createMiddlewareClient` (from the deprecated package) with `createServerClient` from `@supabase/ssr`.
    *   Updated cookie handlers (`get`, `set`, `remove`) to be `async` and correctly interact with `request.cookies` and `response.cookies` as per `@supabase/ssr` guidelines for middleware.
4.  **Client-Side Supabase Client (`utils/supabase/client.ts`):**
    *   Replaced `createClientComponentClient` (from deprecated package) with `createBrowserClient` from `@supabase/ssr`.
5.  **Code Cleanup:**
    *   Identified and removed an unused/outdated `utils/supabase/middleware.ts` file that contained incorrect synchronous cookie handling.

**Current Status & Outcomes:**
-   **SUCCESS:** The primary `cookies() should be awaited` error has been **resolved**. The application now starts, and initial navigation and API calls (e.g., search suggestions) seem to function without this specific cookie error.
-   **New Issues Uncovered:**
    1.  **RLS Infinite Recursion (Critical - Intermittent):**
        *   Error: `infinite recursion detected in policy "team_members"`
        *   Previously occurred when fetching data for the dashboard. This error has **intermittently disappeared** during recent testing (2025-06-07).
        *   The root cause (exact RLS policy definition on `team_members` and the function `get_teams_for_user` it calls) remains unverified. If the error returns, this is the **top priority blocker**.
    2.  **Organization Membership Error:**
        *   Error: `User not part of any organization` (e.g., in `lib/actions/communications.ts`).
        *   Likely a cascading failure due to the `team_members` RLS issue preventing organization lookup.
    3.  **API Unauthorized Error:**
        *   `POST /api/search/natural` now returns a `401 Unauthorized` error (previously was 403, then RLS recursion).
        *   The API route's authentication logic (`supabase.auth.getUser()`) appears correct. The `401` suggests an issue with the user's session or cookies not being sent/validated correctly with the API request.
    4.  **React Hydration Mismatch (Browser):**
        *   Persistent hydration warnings in the browser console. Potentially due to browser extensions (e.g., "monica-id" attributes seen in HTML) or client/server rendering discrepancies.
    5.  **Webpack Warning (Terminal):**
        *   `@supabase/realtime-js` shows a "Critical dependency: the request of a dependency is an expression" warning. Considered minor for now.

**Next Steps:**
1.  **Investigate `401 Unauthorized` on `/api/search/natural` (Current Top Priority):**
    *   Verify user login status when the error occurs.
    *   Inspect browser request headers/cookies for the `/api/search/natural` call to ensure session cookies are present and valid.
    *   If necessary, add temporary debugging in `utils/supabase/server.ts` to trace cookie handling for API routes.
2.  **Monitor & Prepare for `team_members` RLS Issue:**
    *   If the "infinite recursion" error on `team_members` returns, this becomes the top priority.
    *   **Crucial:** Obtain the exact current SQL definition of the RLS policy on `public.team_members` (especially the one named "Policy with security definer functions") directly from the Supabase Dashboard. Also, confirm the exact name and definition of the function it calls (e.g., `get_teams_for_user`).
    *   Analyze the policy and function for recursive logic or incorrect column references (e.g., `team_id` vs. `organization_id`).
3.  **Verify Dashboard Data Loading:** Once API authentication and any RLS issues are stable, confirm that dashboard data loads correctly and related errors (e.g., "User not part of any organization") are resolved.
4.  **Address React Hydration Mismatch:** Attempt to isolate the cause (e.g., by disabling browser extensions, reviewing components that might render differently on server/client).
5.  **Security Hardening (Later):** Review instances of `supabase.auth.getSession()` and consider replacing with `supabase.auth.getUser()` where appropriate for enhanced security, as per Supabase recommendations (e.g., in `lib/actions/companies.ts`).
6.  **Monitor Webpack Warning:** Keep an eye on the `@supabase/realtime-js` warning, but do not prioritize fixing unless it causes functional issues with real-time features (if used).
7.  **Revisit `npm audit`:** After core functionality is stable, address the vulnerabilities reported by `npm audit`.

---
## Overview
Implementing a natural language search system with:
- OpenAI query parsing
- Supabase caching
- Free public data sources
- Rate limiting

## Completed ✅
- Initial project planning and architecture design.
- Documentation review.
- Database setup:
  - Created migration script (`013-search-rate-limit.sql`) for API cache table, rate limiting table, enhanced search history table, and helper functions.
  - Created migration script (`014-add-metadata-to-api-cache.sql`) to add `metadata` column to `api_cache` table.
  - Verified missing tables from main schema.
  - Added proper database indexes and RLS policies.
  - Initial cache table structure and validation.
  - Cleanup functions for maintenance.
- Core utilities:
  - OpenAI configuration (`lib/config/openai.ts`).
  - Query parser implementation (`lib/utils/query-parser.ts`).
  - Cache utility functions (`lib/utils/cache.ts` and `lib/utils/cache/searchCache.ts`).
- Search API implementation (`app/api/search/natural/route.ts`):
  - Initial natural language parsing, cache integration, Supabase querying, error handling, and response formatting.
  - Corrected `searchExternalSources` function call to use only the `query` argument.
  - Fixed `highlights` array generation to conform to `Array<{ field: string; text: string; }>` type and restored overall function structure.
- Fixed useNaturalLanguage hook:
  - Resolved type conflicts between different SearchResponse interfaces
  - Updated result transformation to properly handle optional fields
  - Fixed undefined property access errors in search response handling
  - Added proper error handling for API responses
  - Improved source result grouping
- Rate Limiter (`lib/utils/cache/rateLimiter.ts`):
  - Corrected `createClient` import to use server-side Supabase client.
  - Fixed `organizations.plan` access to correctly retrieve plan information.
- Search Suggestions API (`app/api/search/suggestions/route.ts` & `utils/supabase/server.ts`):
  - Made `createClient` in `utils/supabase/server.ts` synchronous to resolve `supabase.from is not a function` error.
- Integrated external data sources: Business registries, Wikidata, OpenCorporates API.
- Implemented (initial) rate limiting middleware.
- Updated frontend search component with data source selection.
- Added (initial) API response caching system.
- Enhanced error handling and loading states in UI.

## In Progress 🚧
- **Testing & Validation**:
  - Devising and executing a comprehensive test plan for the caching system:
    - Verifying search results are correctly cached (including `metadata`).
    - Ensuring cache entries are invalidated based on TTL.
    - Confirming cache hits and misses are logged/handled as expected by `searchCache.ts`.
  - Testing rate limiting functionality under different scenarios (e.g., different organization plans).
- **Refinement & Enhancement**:
  - Fine-tuning cache performance (e.g., TTL values, cache eviction strategies) based on testing.
  - Improving search metrics logging in the `search_history` table (e.g., filters, more metadata, accurate execution time and result counts).
  - Finalizing the integration and interaction of `searchCache.ts` utilities and `DbRateLimiter` within the search API and potentially other relevant endpoints.
- **Search Component Enhancement**:
  - Testing the updated useNaturalLanguage hook with real search queries
  - Verifying proper handling of different response types and error states
  - Ensuring search history and source filtering work as expected

## Next Steps 📝
1. Test the updated useNaturalLanguage hook with:
   - Different types of search queries
   - Various response formats
   - Error scenarios
   - Source filtering functionality
2. Add end-to-end tests for the search feature covering:
   - Query parsing
   - API calls
   - Result transformation
   - UI state management
3. **CRITICAL: Run database migration scripts** `013-search-rate-limit.sql` AND `014-add-metadata-to-api-cache.sql` **to set up `api_cache`, `rate_limits`, and `search_history` tables correctly.**
4. Execute the test plan for the caching system (see "In Progress").
5. Execute tests for the rate limiting system.
6. Write unit and integration tests for:
    - `performSearch` function (if applicable, or core search logic within API route).
    - Caching utilities (`searchCache.ts`).
    - Rate limiting utilities (`rateLimiter.ts`).
    - Key API endpoints.
    - Cover edge cases and error scenarios.
7. Update project documentation:
    - Add details about the refined caching and rate limiting systems.
    - Provide examples of API usage and expected responses.
    - Document environment variables needed for external APIs and other configurations.

## Current Focus
1. Ensuring the database schema is up-to-date for caching (`metadata` column).
2. Systematically testing the end-to-end caching and rate limiting functionality.
3. Monitoring and optimizing cache hit rates and search performance metrics post-fixes.

## Technical Debt/Improvements (Future Considerations)
- Implement more sophisticated query result scoring/ranking.
- Add backup data sources for reliability.
- Implement a more granular rate limiting quota system (e.g., per feature within a plan).
- Add automated testing for external data source integrations.
- Add analytics for search patterns and user behavior.
- Consider implementing query suggestions based on popular/past searches.

### In Progress 🚧
- Modular Natural Language Search Feature (tracked in detail in `searchbar-feature.md`):
  - Integrate modular query parser (OpenAI or local, easily swappable)
  - Always check Supabase cache/database first
  - If not enough results, query at least one public/free registry (Companies House, Wikidata, OpenCorporates, etc.)
  - Add modular adapters for each data source
  - Merge results from all sources
  - Cache successful results in Supabase
  - Provide Google search fallback if no results
  - Handle all third-party failures gracefully
  - Add automated tests for external data integrations
  - Add analytics for search usage and user behavior
  - Implement granular quota system (per feature, per plan)
  - Document modular architecture for easy swapping of parser or data sources

### Next Steps 📝
- Continue detailed tracking and implementation in `searchbar-feature.md` until feature is completed.
- Once the feature is stable, summarize and move completed items to this file.

## Technical Stack
- Next.js
- Supabase
- OpenAI API (requires API key; modular so can be replaced if needed)
- Various Public APIs (Wikidata, OpenCorporates, Business Registries)

