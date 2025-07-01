// For HTML parsing, Cheerio is a good choice for server-side manipulation.
// Ensure it's added to your project: yarn add cheerio
import * as cheerio from 'cheerio';

export interface WebsiteAnalysis {
  url: string;
  fetchTimestamp: string;
  title?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  language?: string; // Extracted from <html lang="...">
  mainContentArea?: { // Placeholder for more advanced analysis
    selector?: string; // A potential CSS selector for the main content
    textSnippet?: string; // A snippet of text from the presumed main content
  };
  headings?: { // Counts of H1-H6 tags
    h1: number;
    h2: number;
    h3: number;
    // ... up to h6
  };
  linkCounts?: {
    internal: number;
    external: number;
  };
  hasPotentialForms?: boolean;
  detectedTechnologies?: string[]; // Very basic, e.g., from generator meta tag
  // TODO: Add more advanced structural analysis results
  // e.g., presence of navigation, footer, sidebars, article tags, etc.
  // e.g., sitemap URL if found
  // e.g., primary HTML structure summary (for AI context)
  simplifiedDOM?: string; // A simplified version of the DOM, potentially for AI context
  errors?: string[]; // Any errors encountered during analysis
}

export interface AnalyzeWebsiteParams {
  url: string;
  htmlContent?: string; // Optional: provide existing HTML content to avoid refetching
  // Options for analysis depth or specific features to enable/disable
  options?: {
    analyzeMainContent?: boolean; // Example option
    extractSimplifiedDOM?: boolean;
    maxSimplifiedDOMLength?: number;
  };
}

// Re-usable HTML fetching logic (similar to what's in aiScraperGenerator)
// In a real app, this should be a shared utility.
async function fetchHtml(url: string, providedHtml?: string): Promise<string> {
  if (providedHtml) {
    console.log(`[websiteAnalyzer] Using provided HTML content for ${url}.`);
    return providedHtml;
  }
  console.log(`[websiteAnalyzer] Fetching HTML content for ${url} for analysis.`);
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzerBot/1.0; +http://example.com/bot)' }
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching ${url}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`[websiteAnalyzer] Failed to fetch HTML for ${url}:`, error);
    throw new Error(`Failed to retrieve HTML content for analysis from ${url}.`);
  }
}

// Basic function to simplify DOM: remove scripts, styles, comments, and excessive whitespace
// This is a naive simplification. More advanced techniques exist.
function getSimplifiedDOM(fullHtml: string, maxLength: number = 20000): string {
  const $ = cheerio.load(fullHtml);
  $('script, style, noscript, comment, svg, path, metadata, link[rel="alternate"], link[rel="canonical"]').remove(); // Remove non-content elements

  // Remove attributes that are not typically relevant for content structure analysis by AI
  $('*').each((i, el) => {
    const element = $(el);
    Object.keys(el.attribs).forEach(attrName => {
      if (!['href', 'src', 'alt', 'title', 'id', 'class', 'role', 'aria-label', 'itemprop', 'itemscope', 'itemtype'].includes(attrName.toLowerCase()) && !attrName.startsWith('data-')) {
        element.removeAttr(attrName);
      }
    });
  });
  
  // TODO: More aggressive simplification:
  // - Collapse whitespace
  // - Remove empty tags
  // - Potentially keep only "main" content area if identifiable

  let simplified = $('body').html() || $.html(); // Fallback to full HTML if body is empty
  simplified = simplified.replace(/\s\s+/g, ' ').trim(); // Compact whitespace

  if (simplified.length > maxLength) {
    console.warn(`[websiteAnalyzer] Simplified DOM is still long (${simplified.length} chars). Truncating.`);
    // Smart truncation would be better (e.g., keep start and end)
    return simplified.substring(0, maxLength);
  }
  return simplified;
}


/**
 * Analyzes a website's structure and extracts metadata.
 *
 * @param params - Parameters for website analysis, including URL and optional HTML content.
 * @returns A promise that resolves to the WebsiteAnalysis object.
 */
export async function analyzeWebsite(
  params: AnalyzeWebsiteParams
): Promise<WebsiteAnalysis> {
  const { url, htmlContent: providedHtmlContent, options } = params;
  const analysis: WebsiteAnalysis = {
    url,
    fetchTimestamp: new Date().toISOString(),
    errors: [],
  };

  console.log(`[websiteAnalyzer] Starting analysis for URL: ${url}`);

  try {
    const html = await fetchHtml(url, providedHtmlContent);
    const $ = cheerio.load(html);

    // Extract basic metadata
    analysis.title = $('title').first().text()?.trim();
    analysis.metaDescription = $('meta[name="description"]').attr('content')?.trim();
    const keywordsAttr = $('meta[name="keywords"]').attr('content');
    if (keywordsAttr) {
      analysis.metaKeywords = keywordsAttr.split(',').map(k => k.trim()).filter(k => k);
    }
    analysis.language = $('html').attr('lang')?.trim();

    // Count headings
    analysis.headings = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length,
      // Could add h4, h5, h6 if needed
    };

    // Count links (basic example)
    let internalLinks = 0;
    let externalLinks = 0;
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const linkUrl = new URL(href, url); // Resolve relative URLs
          if (linkUrl.hostname === new URL(url).hostname) {
            internalLinks++;
          } else {
            externalLinks++;
          }
        } catch (e) {
          // Invalid or mailto link, etc. Could classify further.
          if (href.startsWith('#') || href.startsWith('javascript:')) internalLinks++; // Simple classification
          else externalLinks++; // Assume external if resolution fails or different protocol
        }
      }
    });
    analysis.linkCounts = { internal: internalLinks, external: externalLinks };

    // Check for forms
    analysis.hasPotentialForms = $('form').length > 0;

    // Basic technology detection (example: WordPress generator tag)
    analysis.detectedTechnologies = [];
    const generatorTag = $('meta[name="generator"]').attr('content');
    if (generatorTag) {
      analysis.detectedTechnologies.push(generatorTag);
    }
    // Could add more checks (e.g., for common JS libraries, server headers if fetch was more advanced)

    // Placeholder for main content analysis
    if (options?.analyzeMainContent) {
      // This is complex. Could try common selectors or heuristics.
      // e.g., look for <main>, <article>, role="main", or divs with id/class like "content", "main-content"
      let mainContentElement = $('main').first();
      if (!mainContentElement.length) mainContentElement = $('article').first();
      if (!mainContentElement.length) mainContentElement = $('[role="main"]').first();
      // Add more heuristics...

      if (mainContentElement.length) {
        analysis.mainContentArea = {
          // Generating a robust selector for an arbitrary element is hard.
          // For now, just indicate it was found or provide its tag name.
          selector: mainContentElement.prop('tagName')?.toLowerCase(),
          textSnippet: mainContentElement.text().trim().substring(0, 200) + '...', // Example snippet
        };
      }
    }
    
    if (options?.extractSimplifiedDOM) {
        analysis.simplifiedDOM = getSimplifiedDOM(html, options.maxSimplifiedDOMLength);
    }


  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during website analysis.';
    console.error(`[websiteAnalyzer] Error analyzing ${url}: ${errorMessage}`);
    analysis.errors?.push(errorMessage);
  }

  console.log(`[websiteAnalyzer] Analysis finished for ${url}. Title: ${analysis.title || 'N/A'}`);
  return analysis;
}


// Example Usage
async function testAnalyzer() {
  if (process.env.NODE_ENV === 'development') {
    console.log('--- Testing Website Analyzer ---');
    try {
      const result1 = await analyzeWebsite({ 
          url: 'https://example.com', 
          options: { analyzeMainContent: true, extractSimplifiedDOM: true, maxSimplifiedDOMLength: 5000 } 
      });
      // console.log('Analysis for example.com:', JSON.stringify(result1, null, 2));

      // Test with a more complex site like books.toscrape.com
      const result2 = await analyzeWebsite({ 
          url: 'https://books.toscrape.com/',
          options: { analyzeMainContent: true, extractSimplifiedDOM: true, maxSimplifiedDOMLength: 10000 } 
      });
      // console.log('Analysis for books.toscrape.com:', JSON.stringify(result2, null, 2));
      // if (result2.simplifiedDOM) {
      //   console.log('Books.toscrape.com Simplified DOM (snippet):', result2.simplifiedDOM.substring(0, 500));
      // }


    } catch (error) {
      console.error('Error testing websiteAnalyzer:', error);
    }
  }
}

// testAnalyzer(); // Uncomment to run

// Future Considerations:
// 1. Advanced Main Content Detection: Use algorithms like readability.js or heuristics based on DOM density and semantic tags.
// 2. More Sophisticated Technology Detection: Wappalyzer-like capabilities (inspect JS variables, headers, known file paths).
// 3. DOM Simplification/Summarization: More intelligent methods than just tag stripping, aimed at providing useful context for AI.
// 4. Semantic Structure Analysis: Identify navigation, headers, footers, sidebars, product lists, article bodies more reliably.
// 5. Visual Layout Analysis (requires headless browser): Understanding page structure from a visual perspective.
// 6. Accessibility Insights: Basic checks for ARIA roles, alt text, etc.
// 7. Performance Metrics: If using a headless browser, could capture Core Web Vitals or load times.
// 8. Image Analysis: Count images, check alt tags, identify large images.
// 9. Form Analysis: Detail number and types of form fields.
// 10. Security Checks: Basic checks like HTTPS, presence of security headers (CSP, HSTS). (Requires access to headers).
// 11. Mobile-Friendliness: Check for viewport meta tag. (True analysis needs headless browser with mobile emulation).
// 12. Caching of analysis results.
// 13. Error handling for individual analysis steps (e.g., if title extraction fails, rest of analysis should continue).
// 14. Configuration for which analyses to run.
// 15. Integration with `aiScraperGenerator`: The `simplifiedDOM` or other structural info can be passed as context.
// 16. Use of a more robust HTML fetching utility (shared across services).
// 17. The current `getSimplifiedDOM` is basic; refining it to be more useful for AI prompts is key.
//     It should aim to preserve structural relationships while removing noise.
// 18. Consider using a dedicated library for metadata extraction if more comprehensive needs arise (e.g. `metascraper`).
// 19. Analysis of structured data (JSON-LD, Microdata, RDFa).
// 20. Language detection could be more robust (e.g., using a library if HTML lang attribute is missing/incorrect).

//I have created `lib/services/websiteAnalyzer.ts`.

//This service includes:
/*   **TypeScript Interfaces:**
    *   `WebsiteAnalysis`: Defines the structure for the analysis results, including URL, fetch timestamp, extracted title, meta description, keywords, language, heading counts, link counts, form presence, detected technologies (basic), and placeholders for main content area analysis and a simplified DOM. It also includes an `errors` array.
    *   `AnalyzeWebsiteParams`: Defines input parameters, primarily the `url`, optional `htmlContent` (to avoid refetching), and `options` to control analysis aspects like main content detection or simplified DOM extraction.
*   **Core Function `analyzeWebsite`:**
    *   Takes `AnalyzeWebsiteParams`.
    *   Fetches HTML content for the given URL using a local `fetchHtml` helper (similar to the one in `aiScraperGenerator.ts`, highlighting the need for a shared utility).
    *   Uses `cheerio` to parse the HTML.
    *   Extracts various pieces of information:
        *   Title, meta description, meta keywords, HTML lang attribute.
        *   Counts of H1, H2, H3 headings.
        *   Counts of internal and external links (basic classification).
        *   A boolean indicating if any `<form>` elements are present.
        *   Basic technology detection (e.g., from `meta[name="generator"]`).
    *   Includes placeholder logic for `analyzeMainContent` option, which attempts to identify a main content element using common tags (`<main>`, `<article>`, `role="main"`) and extracts a text snippet. This part is marked as needing more sophisticated heuristics.
    *   If `extractSimplifiedDOM` option is true, it calls `getSimplifiedDOM` to produce a stripped-down version of the HTML, potentially useful for AI prompts.
    *   Collects any errors encountered during the process.
*   **Helper Function `getSimplifiedDOM`:**
    *   A basic function that uses Cheerio to remove script, style, comment tags, and some attributes, then compacts whitespace. It also truncates the result if it's too long. This is a naive simplification and noted for future improvement.
*   **Example Usage:**
    *   A commented-out `testAnalyzer` function demonstrates how to call `analyzeWebsite` with different URLs and options.
*   **Future Considerations:**
    *   A detailed list of potential enhancements, such as advanced main content detection (e.g., using Readability.js concepts), more sophisticated technology detection (like Wappalyzer), intelligent DOM simplification for AI, semantic structure analysis, visual layout analysis (requiring a headless browser), and integration of dedicated metadata extraction libraries.

This service provides a foundational tool for dissecting website structure and metadata, which can be used by other services like `aiScraperGenerator.ts` to provide better context to the AI, or by the `scrapingOrchestrator.ts` for pre-scraping checks or information gathering. The current implementation relies on static HTML analysis with Cheerio.*/
