// import { SupabaseClient } from '@supabase/supabase-js'; // Or your chosen DB client
// import { getSupabaseClient } from '@/lib/supabase'; // Example utility to get client

// Define the structure for scraped data input
// This might come from intelligentScraping.ts's ScrapingResult.data
interface ScrapedDataItem {
  [key: string]: any; // Field name and its scraped value
}

// Define the structure for existing data from the database
interface ExistingDbRecord {
  id: string | number;
  // Define fields that exist in your database which might correlate with scraped data
  name?: string;
  website?: string;
  address?: string;
  phoneNumber?: string;
  // ... other relevant DB fields
  [key: string]: any;
}

// Define parameters for the correlation function
export interface DataCorrelationParams {
  scrapedData: ScrapedDataItem;
  // Optional: Identifiers that can help narrow down the search in the database
  companyName?: string; // If known from search or previous steps
  websiteUrl?: string;  // A strong identifier if available
  // Optional: Specify which DB table or entity type to correlate against
  // entityType?: string; // e.g., 'companies', 'contacts'
}

// Define the structure for the correlation result
export interface CorrelationMatch {
  dbRecord: ExistingDbRecord;
  confidenceScore: number; // A score from 0 to 1 indicating the likelihood of a match
  matchDetails: Record<string, { scrapedValue: any; dbValue: any; match: boolean }>; // Details of which fields matched
}

export interface DataCorrelationResult {
  scrapedData: ScrapedDataItem;
  matches: CorrelationMatch[]; // Array of potential matches from the database
  bestMatch?: CorrelationMatch; // The highest confidence match
  correlationSummary: string; // e.g., "Strong match found", "No confident match", "New entity"
  // Potentially, a merged version of the data:
  // mergedData?: ExistingDbRecord & ScrapedDataItem; // A simple merge, could be more sophisticated
}

// Placeholder for database interaction logic
// In a real scenario, this would query your database (e.g., Supabase, PostgreSQL)
async function findPotentialDbMatches(
  // dbClient: SupabaseClient,
  params: DataCorrelationParams
): Promise<ExistingDbRecord[]> {
  console.log(`[dataCorrelation] Simulating DB query for potential matches...`);
  console.log(`[dataCorrelation] Query params: Name='${params.companyName}', Website='${params.websiteUrl}'`);

  // Mocked DB interaction:
  // 1. Try to find by websiteUrl (strongest identifier)
  // 2. Try to find by companyName (weaker, might return multiple)
  // 3. Consider other fields from params.scrapedData if available (e.g., address, phone)

  const mockDb: ExistingDbRecord[] = [
    { id: 1, name: 'Example Corp', website: 'https://www.example.com', address: '123 Main St', industry: 'Tech' },
    { id: 2, name: 'Another Inc', website: 'https://www.another.com', phoneNumber: '555-1234', industry: 'Retail' },
    { id: 3, name: 'Example Corp.', website: 'https://www.examplecorp.net', address: '456 Oak Ave', industry: 'Tech' }, // Slight variation
    { id: 4, name: 'Sample Solutions', website: params.websiteUrl, address: '789 Pine Ln', industry: 'Services' }, // Match if websiteUrl is provided
  ];

  let potentialMatches: ExistingDbRecord[] = [];
  if (params.websiteUrl) {
    potentialMatches = mockDb.filter(record => record.website && record.website.toLowerCase() === params.websiteUrl?.toLowerCase());
  }
  if (potentialMatches.length === 0 && params.companyName) {
    potentialMatches = mockDb.filter(record => record.name && record.name.toLowerCase().includes(params.companyName!.toLowerCase()));
  }
  
  // If still no matches, and scrapedData has a name or website, try those
  if (potentialMatches.length === 0) {
    const scrapedWebsite = params.scrapedData?.website as string | undefined;
    const scrapedName = params.scrapedData?.name as string | undefined;
    if (scrapedWebsite) {
         potentialMatches = mockDb.filter(record => record.website && record.website.toLowerCase() === scrapedWebsite.toLowerCase());
    }
    if (potentialMatches.length === 0 && scrapedName) {
        potentialMatches = mockDb.filter(record => record.name && record.name.toLowerCase().includes(scrapedName.toLowerCase()));
    }
  }


  console.log(`[dataCorrelation] Mock DB returned ${potentialMatches.length} potential matches.`);
  return potentialMatches;
}

// Calculates a simple confidence score based on field matches
function calculateConfidence(
  scraped: ScrapedDataItem,
  dbRecord: ExistingDbRecord
): { score: number; details: Record<string, { scrapedValue: any; dbValue: any; match: boolean }> } {
  let matchedFields = 0;
  let totalComparableFields = 0;
  const details: Record<string, { scrapedValue: any; dbValue: any; match: boolean }> = {};

  const commonKeys = new Set([...Object.keys(scraped), ...Object.keys(dbRecord)]);
  // Define a list of keys that are important for matching, or use all common keys.
  // For simplicity, let's consider a few common fields if they exist in both.
  const fieldsToCompare = ['name', 'website', 'address', 'phoneNumber', 'email'];


  for (const key of fieldsToCompare) {
    const scrapedValue = scraped[key];
    const dbValue = dbRecord[key];

    if (scrapedValue !== undefined && dbValue !== undefined) {
      totalComparableFields++;
      // Normalize strings for comparison (lowercase, trim)
      const normScraped = typeof scrapedValue === 'string' ? scrapedValue.toLowerCase().trim() : scrapedValue;
      const normDb = typeof dbValue === 'string' ? dbValue.toLowerCase().trim() : dbValue;

      if (normScraped === normDb) {
        matchedFields++;
        details[key] = { scrapedValue, dbValue, match: true };
      } else {
        details[key] = { scrapedValue, dbValue, match: false };
      }
    } else if (scrapedValue !== undefined) {
        details[key] = { scrapedValue, dbValue: undefined, match: false };
    } else if (dbValue !== undefined) {
        // Not really a mismatch if scraped data doesn't have the field.
        // details[key] = { scrapedValue: undefined, dbValue, match: false };
    }
  }
  
  // Website match is a strong indicator
  let scoreBoost = 0;
  if (scraped.website && dbRecord.website && (scraped.website as string).toLowerCase() === (dbRecord.website as string).toLowerCase()){
      scoreBoost = 0.3; // Add a significant boost if website matches
  }


  if (totalComparableFields === 0 && !scoreBoost) return { score: 0, details };
  
  const baseScore = totalComparableFields > 0 ? matchedFields / totalComparableFields : 0;
  const finalScore = Math.min(1, baseScore + scoreBoost); // Cap score at 1

  return { score: finalScore, details };
}

/**
 * Correlates scraped data with existing records in the database.
 *
 * @param params - Parameters for data correlation, including the scraped data.
 * @returns A promise that resolves to the data correlation result.
 */
export async function correlateData(
  params: DataCorrelationParams
): Promise<DataCorrelationResult> {
  console.log(`[dataCorrelation] Starting data correlation for scraped data:`, params.scrapedData);
  // const dbClient = getSupabaseClient(); // Get DB client instance

  // 1. Find potential matches from the database
  const potentialDbMatches = await findPotentialDbMatches(/* dbClient, */ params);

  const correlationMatches: CorrelationMatch[] = [];
  let bestMatch: CorrelationMatch | undefined = undefined;

  if (potentialDbMatches.length > 0) {
    for (const dbRecord of potentialDbMatches) {
      const { score, details } = calculateConfidence(params.scrapedData, dbRecord);
      const match: CorrelationMatch = {
        dbRecord,
        confidenceScore: score,
        matchDetails: details,
      };
      correlationMatches.push(match);

      if (!bestMatch || score > bestMatch.confidenceScore) {
        bestMatch = match;
      }
    }
    // Sort matches by confidence score descending
    correlationMatches.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  let correlationSummary = "No existing records found based on initial query.";
  if (bestMatch) {
    if (bestMatch.confidenceScore >= 0.8) {
      correlationSummary = `Strong match found with existing record ID ${bestMatch.dbRecord.id} (Confidence: ${bestMatch.confidenceScore.toFixed(2)}).`;
    } else if (bestMatch.confidenceScore >= 0.5) {
      correlationSummary = `Potential match found with existing record ID ${bestMatch.dbRecord.id} (Confidence: ${bestMatch.confidenceScore.toFixed(2)}). Review recommended.`;
    } else {
      correlationSummary = `Low confidence match with record ID ${bestMatch.dbRecord.id} (Confidence: ${bestMatch.confidenceScore.toFixed(2)}). Likely a new entity or needs more data.`;
    }
  } else if (potentialDbMatches.length > 0) {
      correlationSummary = "Potential records found in DB, but no confident correlation with scraped data.";
  } else {
      correlationSummary = "No potential records found in DB. This appears to be a new entity.";
  }


  const result: DataCorrelationResult = {
    scrapedData: params.scrapedData,
    matches: correlationMatches,
    bestMatch: bestMatch,
    correlationSummary: correlationSummary,
  };

  console.log(`[dataCorrelation] Correlation finished. Summary: ${result.correlationSummary}`);
  if (result.bestMatch) {
    console.log(`[dataCorrelation] Best match: ID ${result.bestMatch.dbRecord.id}, Score: ${result.bestMatch.confidenceScore}`);
  }
  return result;
}

// Example Usage (for testing)
async function testDataCorrelation() {
  if (process.env.NODE_ENV === 'development') {
    const exampleScrapedData: ScrapedDataItem = {
      name: 'Example Corp',
      website: 'https://www.example.com',
      address: '123 Main St, Anytown', // Slightly different address
      phoneNumber: '555-0000',
      industry: 'Technology Solutions'
    };

    const params: DataCorrelationParams = {
      scrapedData: exampleScrapedData,
      companyName: 'Example Corp', // From search context
      websiteUrl: 'https://www.example.com', // From search context or scraped
    };

    console.log('--- Testing Data Correlation ---');
    const correlationResult = await correlateData(params);
    // console.log('Correlation Result:', JSON.stringify(correlationResult, null, 2));

    const newEntityData: ScrapedDataItem = {
        name: 'Totally New LLC',
        website: 'https://www.totallynewllc.com',
        email: 'contact@totallynewllc.com'
    }
    const paramsNew: DataCorrelationParams = {
        scrapedData: newEntityData,
        companyName: 'Totally New LLC',
        websiteUrl: 'https://www.totallynewllc.com'
    }
    // const newEntityResult = await correlateData(paramsNew);
    // console.log('New Entity Correlation Result:', JSON.stringify(newEntityResult, null, 2));
  }
}

// testDataCorrelation(); // Uncomment to run test

// Future Considerations:
// 1. Real Database Integration: Replace `findPotentialDbMatches` with actual DB queries (SQL, ORM, etc.).
// 2. Advanced Matching Logic:
//    - Fuzzy string matching (Levenshtein distance, Jaro-Winkler) for names, addresses.
//    - Normalization of data (addresses, phone numbers, company name suffixes like Inc., Ltd.).
//    - Weighted scoring for different fields (e.g., website match is more important than city match).
//    - Handling of missing data in scraped or DB records.
// 3. Machine Learning for Correlation: Train a model to predict matches based on features.
// 4. Configuration: Allow configuration of matching rules, thresholds, and field weights.
// 5. Data Merging Strategies: Define how to merge scraped data with existing DB records if a match is found (e.g., update existing, create new if significantly different, store history).
// 6. Performance: Optimize DB queries, especially for large datasets. Use indexing.
// 7. Scalability: Handle large volumes of scraped data and DB records.
// 8. Logging and Auditing: Track correlation decisions and changes made to the database.
// 9. User Interface for Review: For low-confidence matches, provide a UI for manual review and confirmation/rejection.
// 10. Entity Resolution: Handle cases where multiple DB records might refer to the same real-world entity, or one scraped item matches multiple.
// 11. Handling Aliases and Parent/Child Companies: More complex relationships.
// 12. Confidence Score Calibration: Ensure the confidence score is meaningful and well-calibrated.
// 13. Batch Processing: If correlating many scraped items, consider batch operations.
// 14. Supabase (or other DB) client setup and type safety for DB records.
// 15. The `calculateConfidence` function is currently simple; it could be much more sophisticated.
// 16. `ExistingDbRecord` should be accurately typed based on the actual database schema.
// 17. Error handling for database operations.
// 18. Consider what to do if `params.scrapedData` is empty or missing key fields.
// 19. The `fieldsToCompare` in `calculateConfidence` should ideally be configurable or more dynamic.
// 20. Ensure data privacy and security when handling and comparing data.
// 21. The mock DB is very small; testing with a larger, more diverse mock dataset would be beneficial.
// 22. The `correlationSummary` string is for human readability; a more structured outcome (e.g., enum for match type) might be useful programmatically.
// 23. How to handle updates: If a strong match is found, does this service also handle updating the DB record with new info from `scrapedData`? (Likely a separate step or service). This service focuses on *identifying* matches.

/*I have created `lib/services/dataCorrelation.ts`.

This service includes:
*   **TypeScript Interfaces:**
    *   `ScrapedDataItem`: Represents the structure of data that has been scraped.
    *   `ExistingDbRecord`: Represents the structure of a record from the database.
    *   `DataCorrelationParams`: Defines the input for the correlation function, including scraped data and optional identifiers like company name or website URL.
    *   `CorrelationMatch`: Details of a single potential match found in the database, including the DB record, a confidence score, and which fields matched.
    *   `DataCorrelationResult`: The overall output, containing the original scraped data, an array of `CorrelationMatch` objects, the best match found, and a human-readable summary.
*   **Core Function `correlateData`:**
    *   Takes `DataCorrelationParams` as input.
    *   Calls `findPotentialDbMatches` (currently a **mocked** function) to simulate querying a database for records that might match the scraped data based on name, website, etc.
    *   Iterates through potential DB matches and calculates a confidence score for each using the `calculateConfidence` helper function.
    *   The `calculateConfidence` function performs a simple field-by-field comparison (currently for 'name', 'website', 'address', 'phoneNumber') and gives a boost if website URLs match.
    *   Determines the `bestMatch` based on the highest confidence score.
    *   Generates a `correlationSummary` string describing the outcome.
    *   Returns a `DataCorrelationResult` object.
*   **Mocked/Placeholder Functions:**
    *   `findPotentialDbMatches`: Simulates fetching records from a database. It includes a small mock dataset and basic filtering logic. This function will need to be replaced with actual database query logic (e.g., using Supabase client).
    *   `calculateConfidence`: As described above, this is a simplified scoring mechanism.
*   **Example Usage:**
    *   A commented-out `testDataCorrelation` function demonstrates how `correlateData` can be used with sample scraped data.
*   **Extensive Future Considerations:**
    *   A comprehensive list of points for future enhancements, focusing on real database integration, advanced matching algorithms (like fuzzy matching), machine learning for correlation, data merging strategies, performance optimization, and user interface for reviewing matches.

This service provides the foundational structure for comparing scraped information against a database. The current mock implementation allows other services (like the upcoming `scrapingOrchestrator.ts`) to integrate with it while the actual database interactions and sophisticated matching logic are developed by Developer C or in later stages. This completes step 7 of the plan.*/
