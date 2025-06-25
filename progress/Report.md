feat: Complete pending Developer A tasks and integrate components

This commit addresses several pending tasks from Developer A's original plan and integrates various UI components for the search and discovery feature.

Completed Work:

1.  **Integrated `DiscoveryModal.tsx` with `CompanyCard.tsx`:**
    *   Added a button to `CompanyCard.tsx` to open `DiscoveryModal`.
    *   Passed company ID, name, and initial URL to the modal.
    *   Connected the modal's URL confirmation to the `initiateWebsiteDiscovery` store action.

2.  **Enhanced `DiscoveryModal.tsx` and Integrated `ScraperConfigEditor.tsx`:**
    *   Refactored `DiscoveryModal` to support multiple views (URL input, Scraper Config).
    *   Embedded `ScraperConfigEditor` within the modal for the configuration view.
    *   Updated `searchStore.ts` to include `scraperConfig` in `CompanyDiscoveryState` and modified `initiateWebsiteDiscovery` to accept this config.

3.  **Integrated `DataPreview.tsx` (now `EnrichedDataDisplay`) into `CompanyCard.tsx`:**
    *   The modal component previously known as `DataPreview` (which hosted the data view) now uses `EnrichedDataDisplay.tsx` to show formatted enriched data.
    *   Added a "View Data" button to `CompanyCard` (when data is complete) to trigger this modal.

4.  **Implemented Drag-and-Drop for `CustomScraperBuilderUI.tsx`:**
    *   Installed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
    *   Added a "Field Palette" for draggable source field types.
    *   Made existing configured fields sortable via drag-and-drop.
    *   Implemented `onDragEnd` logic to handle adding new fields from the palette and reordering existing fields.
    *   Added `DragOverlay` for better visual feedback.

5.  **Fleshed out Placeholder UI Components:**
    *   `EnrichmentDashboard.tsx`: Added a sample line chart using `react-chartjs-2` for "Enrichment Trends".
    *   `ExportButton.tsx`: Integrated into `EnrichmentDashboard` with a client-side CSV export implementation for recent activity data.
    *   `DataVisualizationWidget.tsx`: Enhanced to render actual Bar, Line, and Pie charts using `react-chartjs-2` based on its props.
    *   `DisplayPreferences.tsx`: Verified it was already functional and connected to `searchStore`.

6.  **Addressed Original Week 8 Tasks (Partial):**
    *   `src/components/search/AnalyticsDashboard.tsx`: Created the file with an initial structure, placeholder stat cards, and placeholder charts using `DataVisualizationWidget`.
    *   User Onboarding (Tooltips): Added tooltips to key buttons and elements in `CompanyCard.tsx` and `DiscoveryModal.tsx` for better usability.
    *   Updated English i18n translations for new UI text and tooltips. (German translation files were not found).

Attempted to use `request_user_input` to clarify the "Advanced search features (UI): Design UI mockups" task, as UI mockups are beyond my capabilities and further specifics were needed. The tool call failed due to a syntax error (unterminated string literal) which I would normally fix and retry, but per instructions, I am submitting now.
