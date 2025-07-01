// Assuming ScrapedData and ExistingDbRecord might be similar to those in other services
interface ScrapedData {
  [key: string]: any;
}

interface ExistingDbRecord { // e.g., from dataCorrelation.ts
  id: string | number;
  [key: string]: any;
}

// Example of data from a hypothetical external API
interface ExternalApiData {
  employeeCount?: number;
  annualRevenue?: number;
  industryCodes?: string[];
  socialMediaProfiles?: Record<string, string>; // e.g., { linkedin: 'url', twitter: 'url' }
}

export interface EnrichmentParams {
  scrapedData: ScrapedData;
  // Optional: If dataCorrelation found a match, provide the DB record
  dbMatch?: ExistingDbRecord;
  // Optional: Identifiers needed for external API lookups
  companyName?: string;
  websiteUrl?: string;
  // Configuration for which enrichment sources to use and their specific options
  enrichmentConfig?: {
    useInternalDb?: boolean;
    useExternalApis?: Array<{
      apiName: string; // e.g., 'Clearbit', 'Hunter.io', 'CustomBusinessData'
      apiKeyEnvVar?: string; // Environment variable name for the API key
      // other API specific options
    }>;
  };
}

export interface EnrichedData extends ScrapedData {
  enrichmentSources?: Array<{
    sourceName: string; // 'internalDb', 'ExternalAPI:CustomBusinessData'
    status: 'success' | 'partial' | 'failed' | 'skipped';
    message?: string;
    dataAdded?: Record<string, any>; // What specific fields were added/updated by this source
  }>;
  lastEnrichedTimestamp?: string;
}

// --- Placeholder for External API Interaction ---
async function fetchFromExternalApi(
  apiName: string,
  // apiKey: string | undefined, // Actual key would be used here
  params: { companyName?: string; websiteUrl?: string }
): Promise<ExternalApiData | null> {
  console.log(`[dataEnricher] Simulating call to external API "${apiName}" for company: ${params.companyName || params.websiteUrl}`);
  // In a real scenario:
  // 1. Check if apiKey is valid.
  // 2. Construct API request based on `apiName` and `params`.
  // 3. Make the HTTP call using fetch or axios.
  // 4. Handle API rate limits, errors, authentication.
  // 5. Parse the response.

  // Mocked response:
  if (apiName === 'CustomBusinessData') {
    if (params.companyName?.toLowerCase().includes('example')) {
      return {
        employeeCount: Math.floor(Math.random() * 500) + 50, // Random employee count
        annualRevenue: Math.floor(Math.random() * 10000000) + 1000000,
        industryCodes: ["SIC1234", "NAICS5678"],
        socialMediaProfiles: { linkedin: `https://linkedin.com/company/${params.companyName?.replace(/\s+/g, '-').toLowerCase()}` }
      };
    } else if (params.websiteUrl?.includes("techcorp")) {
       return { employeeCount: 1200, socialMediaProfiles: { twitter: 'https://twitter.com/techcorp'} };
    }
  }
  return null; // No data found or API not supported in mock
}


/**
 * Enriches scraped data using internal and/or external data sources.
 *
 * @param params - Parameters for data enrichment.
 * @returns A promise that resolves to the enriched data.
 */
export async function enrichData(
  params: EnrichmentParams
): Promise<EnrichedData> {
  const { scrapedData, dbMatch, companyName, websiteUrl, enrichmentConfig } = params;
  
  // Start with a copy of the scraped data
  const enrichedOutput: EnrichedData = { 
    ...scrapedData, 
    enrichmentSources: [],
    lastEnrichedTimestamp: new Date().toISOString()
  };

  console.log(`[dataEnricher] Starting enrichment for data related to: ${companyName || websiteUrl || 'Unknown entity'}`);

  // 1. Merge with Internal DB Data (if provided and configured)
  if (enrichmentConfig?.useInternalDb !== false && dbMatch) { // Default to true if useInternalDb is undefined
    const sourceReport = { sourceName: 'internalDb', status: 'skipped', dataAdded: {} as Record<string,any> };
    console.log(`[dataEnricher] Attempting to merge with internal DB record ID: ${dbMatch.id}`);
    let internalDataAdded = 0;
    // Simple merge: scraped data takes precedence for conflicting keys.
    // More sophisticated merging (e.g., based on recency, confidence) could be applied.
    for (const key in dbMatch) {
      if (dbMatch.hasOwnProperty(key) && !enrichedOutput.hasOwnProperty(key)) {
        enrichedOutput[key] = dbMatch[key];
        sourceReport.dataAdded![key] = dbMatch[key];
        internalDataAdded++;
      }
    }
    if (internalDataAdded > 0) {
        sourceReport.status = 'success';
        sourceReport.message = `Merged ${internalDataAdded} new fields from internal DB.`;
        console.log(`[dataEnricher] Merged ${internalDataAdded} fields from internal DB record.`);
    } else {
        sourceReport.status = 'success'; // Success in the sense that it was attempted
        sourceReport.message = "No new fields to merge from internal DB record (scraped data had all common fields or DB record was empty).";
    }
    enrichedOutput.enrichmentSources?.push(sourceReport);
  } else if (enrichmentConfig?.useInternalDb !== false) {
     enrichedOutput.enrichmentSources?.push({ sourceName: 'internalDb', status: 'skipped', message: 'No DB match provided for internal enrichment.' });
  }


  // 2. Enrich with External APIs (if configured)
  if (enrichmentConfig?.useExternalApis && enrichmentConfig.useExternalApis.length > 0) {
    for (const apiConfig of enrichmentConfig.useExternalApis) {
      const sourceReport = { sourceName: `ExternalAPI:${apiConfig.apiName}`, status: 'skipped', dataAdded: {} as Record<string,any> };
      // const apiKey = apiConfig.apiKeyEnvVar ? process.env[apiConfig.apiKeyEnvVar] : undefined;
      // if (!apiKey && apiConfig.apiKeyEnvVar) { // Some APIs might not need keys for basic info
      //   console.warn(`[dataEnricher] API key for ${apiConfig.apiName} (env var: ${apiConfig.apiKeyEnvVar}) not found. Skipping this source.`);
      //   sourceReport.status = 'failed';
      //   sourceReport.message = `API key not configured.`;
      //   enrichedOutput.enrichmentSources?.push(sourceReport);
      //   continue;
      // }
      console.log(`[dataEnricher] Querying external API: ${apiConfig.apiName}`);
      try {
        const externalData = await fetchFromExternalApi(apiConfig.apiName, /* apiKey, */ { companyName, websiteUrl });
        if (externalData) {
          let externalDataAdded = 0;
          for (const key in externalData) {
            // @ts-ignore
            if (externalData.hasOwnProperty(key) && !enrichedOutput.hasOwnProperty(key)) {
              // @ts-ignore
              enrichedOutput[key] = externalData[key];
              // @ts-ignore
              sourceReport.dataAdded![key] = externalData[key];
              externalDataAdded++;
            }
          }
          if (externalDataAdded > 0) {
            sourceReport.status = 'success';
            sourceReport.message = `Added ${externalDataAdded} new fields from ${apiConfig.apiName}.`;
            console.log(`[dataEnricher] Added ${externalDataAdded} fields from ${apiConfig.apiName}.`);
          } else {
            sourceReport.status = 'success';
            sourceReport.message = `No new fields to add from ${apiConfig.apiName} (scraped/internal data had all common fields or API returned no new info).`;
          }
        } else {
          sourceReport.status = 'success'; // API call succeeded but returned no data
          sourceReport.message = `No data returned from ${apiConfig.apiName}.`;
          console.log(`[dataEnricher] No data returned from ${apiConfig.apiName}.`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during API call.';
        console.error(`[dataEnricher] Error calling external API ${apiConfig.apiName}: ${errorMessage}`);
        sourceReport.status = 'failed';
        sourceReport.message = errorMessage;
      }
      enrichedOutput.enrichmentSources?.push(sourceReport);
    }
  }
  
  enrichedOutput.lastEnrichedTimestamp = new Date().toISOString();
  console.log(`[dataEnricher] Enrichment process completed.`);
  return enrichedOutput;
}


// Example Usage
async function testEnricher() {
  if (process.env.NODE_ENV === 'development') {
    console.log('--- Testing Data Enricher ---');
    const scrapedSample: ScrapedData = {
      name: "Example Solutions Ltd.",
      website: "https://www.examplesolutions.com",
      scrapedDescription: "Leading provider of innovative solutions.",
      phoneNumberFromScrape: "555-0100"
    };

    const dbMatchSample: ExistingDbRecord = {
      id: 'db123',
      name: "Example Solutions Ltd.", // Matches scraped
      address: "123 Tech Park, Silicon Valley",
      establishedYear: 2010,
      internalNotes: "Key client."
    };
    
    // Scenario 1: Enrich with DB and External (mocked)
    const params1: EnrichmentParams = {
      scrapedData: { ...scrapedSample },
      dbMatch: { ...dbMatchSample },
      companyName: "Example Solutions Ltd.",
      websiteUrl: "https://www.examplesolutions.com",
      enrichmentConfig: {
        useInternalDb: true,
        useExternalApis: [{ apiName: 'CustomBusinessData' }]
      }
    };
    // const result1 = await enrichData(params1);
    // console.log("Enrichment Result 1 (DB + External):", JSON.stringify(result1, null, 2));

    // Scenario 2: Only scraped data, try external API
     const params2: EnrichmentParams = {
      scrapedData: { name: "TechCorp Inc.", website: "https://www.techcorp.com" },
      companyName: "TechCorp Inc.",
      websiteUrl: "https://www.techcorp.com", // website to trigger different mock response
      enrichmentConfig: {
        useInternalDb: false, // Explicitly false
        useExternalApis: [{ apiName: 'CustomBusinessData'/*, apiKeyEnvVar: 'CUSTOM_BIZ_API_KEY'*/ }]
      }
    };
    // const result2 = await enrichData(params2);
    // console.log("Enrichment Result 2 (External Only):", JSON.stringify(result2, null, 2));

    // Scenario 3: No DB match, no relevant external API data
    const params3: EnrichmentParams = {
      scrapedData: { name: "Obscure LLC", website: "https://obscure.co" },
      companyName: "Obscure LLC",
      websiteUrl: "https://obscure.co",
      enrichmentConfig: {
        useInternalDb: true, // Will be skipped as no dbMatch
        useExternalApis: [{ apiName: 'CustomBusinessData' }] // Mock won't find data
      }
    };
    // const result3 = await enrichData(params3);
    // console.log("Enrichment Result 3 (No new data):", JSON.stringify(result3, null, 2));
  }
}

// testEnricher(); // Uncomment to run

// Future Considerations:
// 1. Real External API Integrations: Implement actual HTTP calls, authentication, and response parsing for various APIs.
// 2. Sophisticated Merge Logic:
//    - Field-level precedence rules (e.g., "prefer scraped data for 'description', prefer DB data for 'address' unless scraped is newer").
//    - Handling of conflicting data (e.g., store both versions, use a confidence score).
//    - Data type coercion and normalization during merge.
// 3. API Key Management: Securely store and manage API keys (e.g., using environment variables, secrets manager).
// 4. Rate Limiting and Cost Control for External APIs: Implement local rate limiting or use a proxy service.
// 5. Asynchronous Enrichment: For multiple time-consuming API calls, run them in parallel.
// 6. Error Handling and Retries for API Calls: Similar to intelligentScraping's fetch retries.
// 7. Configuration Management: Store enrichment source configurations (API endpoints, keys, mapping rules) externally.
// 8. Data Provenance: Track which piece of data came from which source and when. (Partially done with `enrichmentSources`).
// 9. User-configurable Enrichment Workflows: Allow users to choose which enrichment sources to use.
// 10. Caching of API responses to reduce redundant calls.
// 11. Normalization of input identifiers (companyName, websiteUrl) before API calls.
// 12. Fallback strategies if primary enrichment sources fail.
// 13. Batch Enrichment: Process multiple scraped items in batches.
// 14. Logging and Monitoring of enrichment success rates and costs.
// 15. Legal and Compliance: Ensure data usage from external APIs complies with their terms of service and privacy regulations.
// 16. The current mock `fetchFromExternalApi` is very basic; real APIs have complex request/response structures.
// 17. The merge logic is simple (prefer existing, add new); real-world scenarios need more nuance.
// 18. Consider a plugin architecture for adding new enrichment sources easily.

/*I have created `lib/services/dataEnricher.ts`.

This service includes:
*   **TypeScript Interfaces:**
    *   `ScrapedData`: Represents the input scraped data.
    *   `ExistingDbRecord`: Represents data from an internal database that might match the scraped entity.
    *   `ExternalApiData`: A sample interface for data that might come from a hypothetical external API.
    *   `EnrichmentParams`: Defines the input for the enrichment process, including `scrapedData`, optional `dbMatch` (from data correlation), identifiers like `companyName` or `websiteUrl`, and `enrichmentConfig` to specify which enrichment sources to use.
    *   `EnrichedData`: The output, extending `ScrapedData` with an `enrichmentSources` array (tracking what each source did) and a `lastEnrichedTimestamp`.
*   **Core Function `enrichData`:**
    *   Takes `EnrichmentParams` as input.
    *   Initializes `enrichedOutput` as a copy of `scrapedData`.
    *   **Internal DB Merging (Mocked):** If `dbMatch` is provided and `enrichmentConfig.useInternalDb` is not false, it attempts to merge fields from `dbMatch` into `enrichedOutput`. The current mock logic adds fields from `dbMatch` only if they don't already exist in `enrichedOutput` (scraped data takes precedence for common fields).
    *   **External API Enrichment (Mocked):** If `enrichmentConfig.useExternalApis` is configured, it iterates through the specified APIs.
        *   Calls a mocked `fetchFromExternalApi` function. This function simulates calling an external API and returns sample data based on the API name and input parameters.
        *   Merges new fields from the API response into `enrichedOutput` if they don't already exist.
    *   Records the outcome (success, failure, skipped, data added) of each enrichment source in the `enrichmentSources` array.
    *   Updates `lastEnrichedTimestamp`.
*   **Mocked Helper `fetchFromExternalApi`:**
    *   Simulates calls to external APIs. It returns predefined mock data for a "CustomBusinessData" API if certain conditions on company name or website URL are met. This needs to be replaced with actual API client logic.
*   **Example Usage:**
    *   A commented-out `testEnricher` function demonstrates various scenarios: enriching with both DB and external API data, external API only, and cases where no new data is found.
*   **Future Considerations:**
    *   A comprehensive list of future enhancements, including real external API integrations, sophisticated data merging logic (handling conflicts, precedence), secure API key management, rate limiting for external APIs, asynchronous enrichment for multiple sources, data provenance tracking, and user-configurable enrichment workflows.

This service provides a foundational structure for augmenting scraped data. The current mock implementations for internal DB merging and external API calls allow it to be integrated into the `scrapingOrchestrator.ts` while the actual data source integrations and complex merging rules are developed later. This completes step 14.*/