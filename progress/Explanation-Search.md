When and How Public Registries Are Queried
Right now, only the Companies House (the UK's official company registry) adapter is implemented. Wikidata and OpenCorporates are planned for the future.

Here's the process for every search you make:

AI Parser First: Your query (e.g., "AI companies in London") is first sent to the active AI parser (Google AI, in our current setup). The AI translates it into a structured JSON object like { "keywords": ["AI"], "filters": { "location": "London" } }.
Parallel Searches: The application then initiates two searches at the same time:
Internal Search: It uses your raw query ("AI companies in London") to perform a full-text search on your local discovered_companies table.
External Search: It takes the structured JSON from the AI and passes it to the companiesHouseAdapter. The adapter then makes a formal API call to the real Companies House service to find matching companies.
Merge and Display: The results from both your internal database and Companies House are collected, merged, and sent to the UI for you to see.
So, the external registry is queried on every search, not just when the internal database returns no results.

How You Can Test the Companies House Integration
You've already performed the most important test, which is to confirm the fallback and mock data work. Here are two ways to test it with real data:

1. The Live UI Test (Easiest):

Make sure your GOOGLE_AI_API_KEY is active in your 
.env.local
 file and you've restarted your server.
Search for a well-known, real company that is registered in the UK.
Good Example Query: "Tesco PLC" or "Rolls-Royce Holdings PLC".
The AI should parse this, the adapter should query the live Companies House API, and you should see the real, official data for that company appear in your search results.
2. The Fallback Test (Which you already did!):

Comment out the GOOGLE_AI_API_KEY in 
.env.local
 and restart the server.
Search for anything (e.g., "AI").
The system will fail over to the LocalFallback parser. This parser sends a very basic query to the adapter.
The adapter is designed to return the "Mock Ltd" data when it receives such a basic query.
Seeing "Mock Ltd" proves that the entire pipeline to the adapter is wired up correctly.
This confirms that the connection is live and the system is robust enough to handle parser failures. When you're ready to build out the other adapters (Wikidata, etc.), you will follow the same pattern.



-------IMPORTANT ----
2. What UI/UX Should Be Present According to the Plan?
From the Plan (Developer A’s Tasks):
Company Card should have:
A “Discover” or “Scrape” button.
A modal or dialog (when you click “Scrape”) where the user can define what they want to scrape (e.g., which fields, custom config).
Progress indicators for scraping/discovery.
(Later phases) Data preview, enrichment, and confidence indicators.
What You’re Seeing Now:
You only see “Discover for [company name]” on the card.
You do NOT yet see:
A “Scrape” button.
A modal/dialog for custom scraping config.
Real-time progress or data preview.
Why?
The plan’s UI components for scraping and enrichment (e.g., DiscoveryButton, ScrapingProgress, DiscoveryModal, ScraperConfigEditor, etc.) are not yet implemented or integrated into your CompanyCard component.
Only the initial “Discover” action is present.
3. How Should It Work According to the Plan?
Ideal Flow (per the plan):
User sees a “Scrape” or “Discover” button on each company card.
User clicks the button:
A modal/dialog opens (e.g., DiscoveryModal or ScraperConfigEditor).
User can define what to scrape (fields, custom config, etc.).
User starts the scrape:
Progress is shown (e.g., ScrapingProgress).
When done, a preview of the scraped/enriched data is shown.
User can view enriched data on the card, with indicators for data quality/confidence.
You are currently at step 1, with only a basic “Discover” button.
4. What’s Next to Implement?
Add a “Scrape” button to each company card.
When clicked, open a modal/dialog for the user to define scraping options.
Show progress and preview when scraping is running/completed.
(Optional) Add enrichment and confidence indicators as per later phases.
Summary Table
Feature/Component	Status	Plan Reference
Discover/Scrape Button	Basic present	Phase 1, CompanyCard
Scraper Config Modal	Not present	Phase 2, ScraperConfigEditor
Progress Indicator	Not present	Phase 2, ScrapingProgress
Data Preview/Enrichment	Not present	Phase 3, DataPreview, Enrich
