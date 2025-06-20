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
5. All new implementations must be production-minded. Mock data and placeholders must be avoided in favor of real API integrations and robust error handling.

---

## 🚧 In Progress (As of 2025-06-20)

**Task: Debugging and Finalizing E2E Tests**

We are currently in the final phase of debugging the comprehensive Playwright E2E test suite for the search feature. The primary goal is to resolve persistent test failures and ensure the entire search API is stable and robust.

### Summary of Debugging Efforts:

A series of cascading test failures were investigated. The root cause appears to be a persistent, silent server-side crash when the API endpoints are hit during the test run.

**Key Fixes Implemented:**
- **Corrected Test Configurations:**
    - Aligned rate-limiter plans in `tests/search/rate-limit.test.ts` with server-side configuration.
    - Replaced all mock string IDs (e.g., `test-user-history`) with valid UUIDs in test files to prevent database errors (`invalid input syntax for type uuid`).
    - Added missing `x-user-id` and `x-organization-id` headers to `tests/search/search-api-integration.test.ts` to provide proper auth context.
- **Managed Test Environment:**
    - Enabled the `webServer` in `playwright.config.ts` to automatically start the dev server.
    - Attempted to resolve port conflicts by clearing ports and aligning configurations to the default port `3000`.

### Current Blocker: Silent Server Crash

Despite the fixes, the tests continue to fail with generic `response.ok()` errors and timeouts. This strongly indicates an unhandled exception on the server that is not being properly logged. The `webServer` configuration in Playwright seems to be suppressing the detailed error output.

---

## 🚀 Next Steps (for next developer)

The immediate priority is to diagnose and fix the underlying server-side crash.

1.  **[INVESTIGATE] Pinpoint the Server Crash:**
    - The primary suspect is an unhandled error within the `/api/search` route (`app/api/search/route.ts`).
    - **Strategy:** Manually start the server (`npm run dev`) and run the Playwright tests (`npm run test:search`) in a separate terminal. Carefully monitor the server terminal for any crash logs that appear when the tests execute.

2.  **[ENHANCE] Add Granular Logging:**
    - Add detailed `console.log` statements inside the `try...catch` blocks of the main search API handler and its dependencies (e.g., `DbRateLimiter`, individual search adapters). This will help trace the execution flow and identify the exact point of failure.

3.  **[ISOLATE] Run Tests Individually:**
    - Isolate the problem by running one test file at a time (e.g., `npx playwright test tests/search/history.test.ts`). This can help determine if a specific test case is triggering the crash.

4.  **[VERIFY] Check Environment Variables:**
    - Ensure all necessary environment variables from `.env.local` are correctly loaded and accessible within the API route's context when run by the test server.

---

## ✅ Completed Tasks

- [x] **[TESTING] Created E2E Test Suite:**
    - Wrote a full suite of Playwright (E2E) tests to cover the new Wikidata integration and all related functionality in `tests/search/`.
- [x] **[FEATURE] Enhanced Results:** 
    - Implemented an advanced merging and ranking system for search results.
    - Deduplication is now based on domain, with fallback to name and location.
    - Results are merged to combine data from multiple sources.
    - The final list is ranked by relevance, considering source, data completeness, and query match.
- [x] **[FEATURE] Integrated Wikidata Adapter:**
    - Created a new adapter file: `src/search/adapters/wikidata.ts`.
    - Implemented the `SearchAdapter` interface to query the live Wikidata API.
    - Mapped the Wikidata API response to our internal `SearchAdapterResult` format.
    - Integrated the new adapter into the main `/api/search` route.
- [x] **Integrated Live Companies House API:** Successfully connected to the live Companies House API, resolved all authentication issues, and confirmed live data retrieval.
- [x] **Implemented Modular Query Parser:** Integrated Google AI, OpenAI, and a local fallback parser using a Strategy Pattern.
- [x] **Fixed All Runtime Errors:** Resolved critical bugs related to Google AI model, cache schema, and full-text search column.
- [x] **Upgraded Internal Search:** Replaced basic `ILIKE` search with intelligent full-text search on the `discovered_companies` table.
- [x] **Rewrote CacheManager:** Aligned the caching logic with the actual database schema, fixing all cache-related errors.
