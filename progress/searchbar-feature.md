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

## 📝 Current Status & Key Fixes (As of 2025-06-20)

This document summarizes the successful debugging and enhancement of the modular search feature. All major runtime errors have been resolved, and the system is now stable.

*   **Live Companies House Integration:** The search feature is now connected to the **live UK Companies House API**. After a thorough debugging session, we resolved all `401 Unauthorized` errors by obtaining and using a valid **live API key**. The system now successfully retrieves and displays real-time, official company data.

*   **Modular Query Parser:** Fully implemented using a **Strategy Pattern**. It supports Google AI, OpenAI, and a local fallback. The system gracefully falls back from Google -> OpenAI -> Local on API key errors or quota issues.

*   **Database & Caching:**
    *   The `CacheManager` has been completely **rewritten** to match the actual `api_cache` database schema (`key`, `data` columns).
    *   The internal database search uses a powerful PostgreSQL **full-text search** for intelligent matching.

---

## 🚀 Next Steps (New Session)

Our next objective is to further enrich the search results by adding another powerful, free data source: **Wikidata**.

*   **[FEATURE] Implement Wikidata Adapter:**
    *   Create a new adapter file: `src/search/adapters/wikidata.ts`.
    *   Implement the `SearchAdapter` interface to query the live Wikidata API.
    *   Map the Wikidata API response to our internal `SearchAdapterResult` format.
    *   Integrate the new adapter into the main `/api/search` route.

*   **[FEATURE] Enhance Results:** Once the Wikidata adapter is complete, we will improve the result deduplication and ranking logic to provide a cleaner, more relevant final list to the user.

*   **[TESTING] Comprehensive Testing:** Write a full suite of Playwright (E2E) and Jest (unit) tests to cover the new Wikidata integration and all related functionality.

---

## ✅ Completed Tasks

- [x] **Integrated Live Companies House API:** Successfully connected to the live Companies House API, resolved all authentication issues, and confirmed live data retrieval.
- [x] **Implemented Modular Query Parser:** Integrated Google AI, OpenAI, and a local fallback parser using a Strategy Pattern.
- [x] **Fixed All Runtime Errors:** Resolved critical bugs related to Google AI model, cache schema, and full-text search column.
- [x] **Upgraded Internal Search:** Replaced basic `ILIKE` search with intelligent full-text search on the `discovered_companies` table.
- [x] **Rewrote CacheManager:** Aligned the caching logic with the actual database schema, fixing all cache-related errors.
