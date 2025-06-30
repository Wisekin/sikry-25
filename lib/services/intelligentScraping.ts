import { AIScraperConfig, ScraperFieldConfig, SelectorDetail } from './aiScraperGenerator';
// It's good practice to use a robust HTTP client.
// Consider adding 'axios' or 'node-fetch' to package.json
// For now, we'll use the global fetch if available, or placeholder.
// import axios from 'axios'; // Example: yarn add axios
// import * as cheerio from 'cheerio'; // Example: yarn add cheerio

// Placeholder for actual HTML fetching and parsing library
// For Cheerio, you would uncomment the import and use it like:
// const $ = cheerio.load(htmlContent);
// const text = $(selector.selector).text();

interface ScrapedData {
  [fieldName: string]: any; // Using 'any' for now, could be string | string[] | null
}

interface ScrapingResult {
  success: boolean;
  data?: ScrapedData;
  error?: string;
  errorsByField?: Record<string, string[]>; // Store errors for specific fields
  url: string;
  configUsed: AIScraperConfig; // Include the config that was used for this scrape attempt
  messages?: string[]; // For warnings or informational messages
}

export interface IntelligentScrapingParams {
  config: AIScraperConfig;
  // targetUrl might be redundant if config.websiteUrl is always the source of truth.
  // However, it could be useful if a config is generic and applied to multiple similar pages.
  targetUrl?: string;
  // Options for scraping behavior
  // TODO: Define more options like custom headers, proxy usage, etc.
  // For now, this is a placeholder.
  options?: {
    // Example:
    // userAgent?: string;
    // retryAttempts?: number;
  };
}

// Helper function to fetch HTML content.
// In a real application, this would be more robust: error handling, retries, user-agent spoofing, etc.
async function fetchHtmlContent(url: string): Promise<string> {
  console.log(`[intelligentScraping] Fetching HTML for URL: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        // It's often necessary to set a realistic User-Agent
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} while fetching ${url}`);
    }
    const html = await response.text();
    // console.log(`[intelligentScraping] Fetched HTML (first 200 chars): ${html.substring(0,200)}...`);
    return html;
  } catch (error) {
    console.error(`[intelligentScraping] Error fetching HTML for ${url}:`, error);
    throw error; // Re-throw to be caught by the main scraping function
  }
}

// Placeholder for a proper HTML parsing and data extraction function using Cheerio or similar.
// This mock function simulates the process.
function extractDataWithSelector(
  htmlContent: string, // Should be parsed DOM (e.g., CheerioAPI)
  fieldConfig: ScraperFieldConfig
): { value: any; errors: string[], appliedSelector?: SelectorDetail } {
  // In a real implementation with Cheerio:
  // const $ = cheerio.load(htmlContent);
  const errors: string[] = [];

  for (const selectorDetail of fieldConfig.selectors) {
    // --- MOCK EXTRACTION ---
    // This is highly simplified. Real extraction needs to handle various cases.
    // Imagine this part iterates through `selectorDetail` and tries to find data.
    const mockDataFound = htmlContent.toLowerCase().includes(selectorDetail.selector.replace(/[.#]/g, '').toLowerCase());

    if (mockDataFound) {
      let extractedValue: any = `Mock data for ${fieldConfig.fieldName} using ${selectorDetail.selector}`;
      switch (selectorDetail.type) {
        case 'text':
          // extractedValue = $(selectorDetail.selector).first().text()?.trim() || null;
          break;
        case 'attribute':
          if (selectorDetail.attributeName) {
            // extractedValue = $(selectorDetail.selector).first().attr(selectorDetail.attributeName) || null;
            extractedValue = `Mock attribute value for ${selectorDetail.attributeName}`;
          } else {
            errors.push(`Attribute name missing for selector type 'attribute' for field ${fieldConfig.fieldName}`);
            continue;
          }
          break;
        case 'html':
          // extractedValue = $(selectorDetail.selector).first().html() || null;
          extractedValue = `<div>Mock HTML for ${fieldConfig.fieldName}</div>`;
          break;
        default:
          errors.push(`Unknown selector type: ${selectorDetail.type} for field ${fieldConfig.fieldName}`);
          continue; // Try next selector
      }
      // In a real scenario, you'd check if extractedValue is null/empty and if so, try the next selector.
      // For this mock, we'll just return the first "successful" one.
      console.log(`[intelligentScraping] Mock extracted '${extractedValue}' for field '${fieldConfig.fieldName}' using selector '${selectorDetail.selector}'`);
      return { value: extractedValue, errors, appliedSelector: selectorDetail };
    }
    // --- END MOCK EXTRACTION ---
  }
  errors.push(`No data found for field ${fieldConfig.fieldName} with any provided selectors.`);
  return { value: null, errors };
}


/**
 * Performs intelligent scraping based on the provided configuration.
 *
 * @param params - Parameters for the scraping operation, including the configuration and target URL.
 * @returns A promise that resolves to the scraping result.
 */
export async function scrapeWebsite(
  params: IntelligentScrapingParams
): Promise<ScrapingResult> {
  const { config, targetUrl: explicitTargetUrl } = params;
  const urlToScrape = explicitTargetUrl || config.websiteUrl;
  const scrapedData: ScrapedData = {};
  const errorsByField: Record<string, string[]> = {};
  const messages: string[] = [];
  let overallSuccess = true;

  console.log(`[intelligentScraping] Starting scrape for URL: ${urlToScrape}`);
  console.log(`[intelligentScraping] Using config generated on: ${config.lastGenerated} by ${config.aiModelUsed}`);

  let htmlContent: string;
  try {
    htmlContent = await fetchHtmlContent(urlToScrape);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch HTML content.';
    console.error(`[intelligentScraping] Critical error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
      url: urlToScrape,
      configUsed: config,
      messages,
    };
  }

  // TODO: This is where a real HTML parser like Cheerio would be initialized
  // const $ = cheerio.load(htmlContent); // Example

  for (const fieldConfig of config.targetFields) {
    try {
      // Pass the raw HTML content to the mock. A real implementation would pass the parsed Cheerio object.
      const { value, errors: fieldErrors, appliedSelector } = extractDataWithSelector(htmlContent, fieldConfig);

      if (value !== null && value !== undefined) {
        scrapedData[fieldConfig.fieldName] = value;
        if(appliedSelector) {
          messages.push(`Field '${fieldConfig.fieldName}': Successfully extracted using selector '${appliedSelector.selector}'.`);
        }
      } else {
        errorsByField[fieldConfig.fieldName] = fieldErrors;
        messages.push(`Field '${fieldConfig.fieldName}': No data extracted. Errors: ${fieldErrors.join(', ')}`);
        if (fieldConfig.required) {
          overallSuccess = false;
          messages.push(`Field '${fieldConfig.fieldName}': Required field missing, marking scrape as partially unsuccessful.`);
        }
      }
    } catch (fieldError) {
      const errorMessage = fieldError instanceof Error ? fieldError.message : `Unknown error processing field ${fieldConfig.fieldName}`;
      console.error(`[intelligentScraping] Error processing field ${fieldConfig.fieldName}: ${errorMessage}`);
      errorsByField[fieldConfig.fieldName] = [...(errorsByField[fieldConfig.fieldName] || []), errorMessage];
      if (fieldConfig.required) {
        overallSuccess = false;
      }
    }
  }

  // Determine final success based on required fields and any critical errors.
  if (Object.keys(scrapedData).length === 0 && config.targetFields.length > 0) {
    // If no data was scraped at all, it's likely a failure unless all fields were optional and simply not found.
    // This condition might need refinement based on how 'required' fields are handled.
    if (config.targetFields.some(f => f.required)) {
        overallSuccess = false;
        messages.push("No required data fields were successfully scraped.");
    } else if (config.targetFields.length > 0) {
        messages.push("No data fields were scraped, but none were marked as strictly required.");
    }
  }


  const result: ScrapingResult = {
    success: overallSuccess,
    data: scrapedData,
    url: urlToScrape,
    configUsed: config,
    messages,
  };

  if (Object.keys(errorsByField).length > 0) {
    result.errorsByField = errorsByField;
    // If there were field errors but some data was scraped, success might still be true (partial success)
    // unless a required field failed. The `overallSuccess` flag should capture this.
  }
  
  if (!overallSuccess && !result.error && config.targetFields.length > 0) {
    // If it's not a success and no major fetch error occurred, populate general error.
    result.error = "Scraping completed with errors or missing required fields.";
  } else if (overallSuccess && Object.keys(scrapedData).length === 0 && config.targetFields.length > 0) {
    // If it was "successful" but no data and fields were expected
    result.message = "Scraping completed, but no data was extracted for the configured fields.";
  }


  console.log(`[intelligentScraping] Finished scrape for URL: ${urlToScrape}. Success: ${result.success}`);
  if (result.data) console.log(`[intelligentScraping] Scraped Data: ${JSON.stringify(result.data, null, 2)}`);
  if (result.errorsByField) console.log(`[intelligentScraping] Errors by Field: ${JSON.stringify(result.errorsByField, null, 2)}`);

  return result;
}

// Example usage (for testing purposes)
async function testScraper() {
  if (process.env.NODE_ENV === 'development') {
    // Mock config, similar to what aiScraperGenerator might produce
    const mockConfig: AIScraperConfig = {
      websiteUrl: 'https://example.com', // Replace with a real, simple testable URL if desired
      targetFields: [
        {
          fieldName: 'title',
          selectors: [{ selector: 'h1', type: 'text', description: 'Main title of the page' }],
          required: true,
        },
        {
          fieldName: 'description',
          selectors: [{ selector: 'meta[name="description"]', type: 'attribute', attributeName: 'content' }],
        },
        {
          fieldName: 'nonExistent',
          selectors: [{ selector: '#nonexistent-id', type: 'text' }],
          required: false
        },
         {
          fieldName: 'bodyHtml',
          selectors: [{ selector: 'body', type: 'html' }],
          required: false
        }
      ],
      lastGenerated: new Date().toISOString(),
      aiModelUsed: 'mock-testing-v1',
    };

    // To test with a real fetch, ensure example.com is accessible or use a more reliable test site.
    // For true unit testing, fetchHtmlContent and extractDataWithSelector should be mocked.
    // This test is more of an integration test for the service.
    console.log('--- Testing intelligentScraping ---');
    // For a controlled test, you might want to provide mock HTML content:
    // const mockHtml = "<html><head><title>Test Title</title><meta name='description' content='Test Description'></head><body><h1>Example Domain</h1><p>This is a test.</p></body></html>"
    // And then modify fetchHtmlContent to return this mockHtml for 'https://example.com' or mock it via Jest.

    const result = await scrapeWebsite({ config: mockConfig });
    // console.log('Test Scraping Result:', JSON.stringify(result, null, 2));
    
    // Test with a failing URL
    const failingConfig: AIScraperConfig = {
       ...mockConfig,
       websiteUrl: 'https://thissitedoesnotexistandshouldfail.com'
    }
    // const failingResult = await scrapeWebsite({ config: failingConfig });
    // console.log('Test Failing Scraping Result:', JSON.stringify(failingResult, null, 2));
  }
}

// testScraper(); // Uncomment to run test during development

// Future Considerations:
// 1. Real HTML Parsing: Integrate Cheerio for robust parsing and data extraction.
// 2. Advanced Error Handling: Implement more sophisticated error detection (e.g., CAPTCHAs, IP blocks, content changes) and retry logic (exponential backoff, jitter). This is planned for a later enhancement.
// 3. Dynamic Configuration Adjustments: Logic to interact with `aiScraperGenerator.ts` if initial selectors fail (advanced).
// 4. Proxies and User-Agent Rotation: For more resilient scraping against anti-bot measures.
// 5. JavaScript Rendering: For SPAs, integration with tools like Puppeteer or Playwright will be necessary. This service currently assumes static HTML.
// 6. Concurrency and Rate Limiting: Manage multiple scraping jobs and respect website rate limits.
// 7. Data Validation and Cleaning: Integrate `scrapingValidator.ts` and potentially apply basic cleaning rules.
// 8. Caching: Cache HTML content or scraped data where appropriate.
// 9. Logging: More detailed and structured logging.
//10. Selector Fallbacks: Implement logic to try multiple selectors for a field in order of preference. (Partially mocked)
//11. Handling different content types (JSON APIs, XML).
//12. Timeout management for fetch requests and overall scraping process.
//13. Headless browser integration (Puppeteer/Playwright) for JS-heavy sites.
//14. More granular error reporting (e.g., selector not found, attribute not found, empty text).
//15. Configuration for retries (attempts, backoff strategy) in `IntelligentScrapingParams`.
//16. Storing scrape metadata (e.g., time taken, selectors used, success rates per field).
//17. Abstraction for fetching content (to support HTTP, headless browser, etc.).
//18. Handling character encodings correctly.
//19. Normalizing URLs.
//20. Respecting robots.txt (though typically client-side or orchestrator responsibility).
//21. Allow passing custom headers or cookies if needed.
//22. Progress reporting for long-running scrapes (if applicable).
//23. Versioning of scraping results if configs change over time.
//24. Security: Be careful with URLs and HTML content; avoid SSRF if URLs are user-supplied without validation.
//25. Pluggable extraction strategies: Beyond CSS selectors (e.g., XPath, JSON-LD).
//26. Consider making `extractDataWithSelector` more generic to handle list extractions (multiple elements for one field).
//27. The `overallSuccess` logic could be refined, e.g., a scrape might be "partially successful" if some non-required fields fail but all required ones are present.
//28. Ensure consistent error object structure.
//29. Add unit tests with mocked HTML and Cheerio.
//30. The current mock `extractDataWithSelector` is very basic and needs to be replaced with actual Cheerio logic.
//31. `appliedSelector` in the return of `extractDataWithSelector` is useful for debugging and analytics.
//32. Ensure `fetchHtmlContent` handles redirects properly if needed (standard fetch does this by default up to a limit).
//33. The `options` parameter in `IntelligentScrapingParams` should be clearly defined and utilized.
//34. Consider if this service should handle pagination or if that's an orchestrator-level concern. (Likely orchestrator or a dedicated pagination service that uses this for single pages).
//35. If `AIScraperConfig` includes global settings (like User-Agent), `fetchHtmlContent` should use them.
//36. The mock extraction in `extractDataWithSelector` should at least simulate trying multiple selectors if the first one "fails". (Updated to reflect this loop).
//37. Add a timestamp for when the scraping attempt was made in `ScrapingResult`.
//38. Ensure all external dependencies (like Cheerio, axios) are added to `package.json` when uncommented.
//39. Logging of which specific selector succeeded for a field is very valuable. (Added to messages).
//40. The distinction between `result.error` (for critical/fetch errors) and `result.errorsByField` (for extraction issues) is important.
//41. `overallSuccess` should be false if `fetchHtmlContent` throws an error. (Handled).
//42. Ensure that `targetUrl` in `IntelligentScrapingParams` overrides `config.websiteUrl` if both are provided and different. (Handled by `urlToScrape` logic).
//43. Provide a summary of how many fields succeeded/failed in `messages` or a dedicated part of `ScrapingResult`.
//44. For fields that are lists (e.g., multiple job postings on a page), `extractDataWithSelector` would need to return an array, and `ScrapedData` would need to support `string[]`. The current `SelectorDetail` implies a single value. This is a significant extension for later.
//45. The mock for `extractDataWithSelector` should reflect the `type` ('text', 'attribute', 'html') in its mock output. (Updated).
//46. If a required field fails extraction, `overallSuccess` should definitely be `false`. (Handled).
//47. The `messages` array is good for verbose logging/feedback.
//48. Make sure to handle the case where `fieldConfig.selectors` is an empty array (though AI generator should ideally not produce this).
//49. Consider adding a "dry run" option that fetches HTML and shows what selectors *would* be applied, without actually extracting data.
//50. The service should be stateless and idempotent where possible (given the same inputs, produce the same output, network conditions permitting).
