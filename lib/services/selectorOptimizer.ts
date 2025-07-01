import * as cheerio from 'cheerio';
import { SelectorDetail } from './aiScraperGenerator'; // Assuming this contains the structure for a selector

export interface OptimizeSelectorParams {
  selectors: SelectorDetail[]; // The selectors to optimize for a specific field
  htmlContent: string; // The HTML content of the page to test against
  fieldName?: string; // Optional: name of the field these selectors are for (for context/logging)
  // Options for optimization strategies
  options?: {
    preferIdBased?: boolean;
    avoidHighlyGenericTags?: string[]; // e.g., ['div', 'span'] if they are too broad
    minSpecificity?: number; // Placeholder for a future specificity score
    maxResultsThreshold?: number; // If a selector returns too many elements, it might be too generic
  };
}

export interface OptimizedSelectorResult extends SelectorDetail {
  originalSelector: string;
  optimizationNotes?: string[];
  isValidAndNotEmpty?: boolean; // Did it find at least one element?
  elementCount?: number; // How many elements did it match?
  specificityScore?: number; // Placeholder for a calculated specificity
  alternativeSelectors?: SelectorDetail[]; // Suggested alternatives
}

export interface SelectorOptimizationOutput {
  fieldName?: string;
  optimizedSelectors: OptimizedSelectorResult[];
  overallSummary?: string; // e.g., "Optimized 2 out of 3 selectors", "No changes made"
}

// Basic check if a selector is "too generic" - very naive for now
function isPotentiallyTooGeneric(selector: string, commonGenericTags: string[] = ['div', 'span', 'p', 'a']): boolean {
  // Example: if selector is just 'div' or 'span' or 'div > span' without further qualification.
  // This is a placeholder for more sophisticated checks.
  const simpleSelector = selector.toLowerCase().trim();
  if (commonGenericTags.includes(simpleSelector)) return true;
  // Could add regex for things like 'div > span' or selectors with only tag names.
  if (/^[a-z]+(\s*>\s*[a-z]+)*$/.test(simpleSelector) && !simpleSelector.includes('.') && !simpleSelector.includes('#') && !simpleSelector.includes('[')) {
     // Only tag names like 'div > ul > li'
     if (simpleSelector.split(/\s*>\s*/).length > 1 && simpleSelector.split(/\s*>\s*/).every(tag => commonGenericTags.includes(tag))) {
         return true;
     }
  }
  return false;
}


/**
 * Analyzes and potentially optimizes a list of CSS selectors against given HTML content.
 * This is a foundational version; true optimization is complex.
 *
 * @param params - Parameters for selector optimization.
 * @returns A promise that resolves to the selector optimization output.
 */
export async function optimizeSelectors(
  params: OptimizeSelectorParams
): Promise<SelectorOptimizationOutput> {
  const { selectors, htmlContent, fieldName, options } = params;
  const $ = cheerio.load(htmlContent);
  const optimizedResults: OptimizedSelectorResult[] = [];
  let changesMadeCount = 0;

  console.log(`[selectorOptimizer] Optimizing selectors for field: ${fieldName || 'N/A'}`);

  for (const currentSelectorObj of selectors) {
    const originalSelector = currentSelectorObj.selector;
    const notes: string[] = [];
    let currentBestSelector = originalSelector;
    let isValidAndNotEmpty = false;
    let elementCount = 0;
    
    try {
      const elements = $(originalSelector);
      elementCount = elements.length;
      isValidAndNotEmpty = elementCount > 0;

      if (!isValidAndNotEmpty) {
        notes.push(`Original selector "${originalSelector}" did not match any elements.`);
      } else {
        notes.push(`Original selector "${originalSelector}" matched ${elementCount} element(s).`);
        // Placeholder for actual optimization logic
        // 1. Simplification: Can parts of the selector be removed while still matching the same element(s)?
        //    e.g., 'div.main > p.text#unique' might simplify to '#unique' if it's truly unique.
        //    This is hard to do programmatically without extensive tree analysis.

        // 2. Specificity/Robustness:
        //    - If options.preferIdBased, and an ID is part of a complex selector, can we use just the ID?
        //    - Check if selector is too generic (e.g., just 'div')
        if (isPotentiallyTooGeneric(currentBestSelector, options?.avoidHighlyGenericTags)) {
            notes.push(`Selector "${currentBestSelector}" might be too generic.`);
            // No actual change made here, just a note.
        }

        //    - If elementCount > options.maxResultsThreshold, it's likely too broad.
        if (options?.maxResultsThreshold && elementCount > options.maxResultsThreshold) {
            notes.push(`Selector "${currentBestSelector}" matched ${elementCount} elements, exceeding threshold of ${options.maxResultsThreshold}. Consider making it more specific.`);
        }
        
        // 3. Alternative Generation (Placeholder):
        //    Could try to generate alternatives, e.g., by adding/removing classes, using child/parent relationships.
        //    For instance, if selector is `div.foo p`, an alternative could be `div.foo > p` (direct child).
        //    This is also very complex for a generic solution.

        // For now, this "optimizer" mostly validates and annotates.
        // No actual selector transformation is implemented in this basic version.
        if (currentBestSelector !== originalSelector) {
          changesMadeCount++;
        }

      }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error during selector processing";
        console.error(`[selectorOptimizer] Error processing selector "${originalSelector}": ${errorMessage}`);
        notes.push(`Error processing selector: ${errorMessage}`);
        isValidAndNotEmpty = false; // Mark as invalid due to error
    }


    optimizedResults.push({
      ...currentSelectorObj, // Keep original type, attributeName, description
      selector: currentBestSelector, // This would be the optimized selector if logic was implemented
      originalSelector: originalSelector,
      optimizationNotes: notes,
      isValidAndNotEmpty: isValidAndNotEmpty,
      elementCount: elementCount,
      // specificityScore and alternativeSelectors would be populated by more advanced logic
    });
  }
  
  const summary = changesMadeCount > 0
    ? `Made changes to ${changesMadeCount} selector(s).`
    : `No structural changes made to selectors; validation and annotation performed.`;

  return {
    fieldName,
    optimizedSelectors: optimizedResults,
    overallSummary: summary,
  };
}


// Example Usage
async function testOptimizer() {
  if (process.env.NODE_ENV === 'development') {
    console.log('--- Testing Selector Optimizer ---');
    const sampleHtml = `
      <html>
        <body>
          <div id="main-content">
            <h1 class="title main">Hello World</h1>
            <p class_name="description">This is a test page.</p> <!-- Intentional typo: class_name -->
            <span>Generic span 1</span>
            <div class="container">
                <p class="text">Text 1</p>
                <p class="text">Text 2</p>
            </div>
            <div id="footer">
                <span>Footer text</span>
            </div>
            <a href="/another">Link</a>
          </div>
        </body>
      </html>
    `;

    const selectorsToTest: SelectorDetail[] = [
      { selector: 'h1.title.main', type: 'text', description: 'Main title' },
      { selector: '#main-content > p.description', type: 'text', description: 'Description paragraph' }, // Should work
      { selector: 'p.descriptoon', type: 'text', description: 'Typo in class' }, // Should not find
      { selector: 'span', type: 'text', description: 'Generic span' }, // Potentially too generic
      { selector: 'div > p.text', type: 'text', description: 'Paragraphs in container' }, // Should match 2
      { selector: 'invalid-selector!!!!', type: 'text', description: 'Invalid syntax' },
    ];

    try {
      const result = await optimizeSelectors({
        selectors: selectorsToTest,
        htmlContent: sampleHtml,
        fieldName: 'TestData',
        options: { 
            avoidHighlyGenericTags: ['div', 'span', 'p', 'a'],
            maxResultsThreshold: 1 // To test threshold warning
        }
      });
      // console.log('Selector Optimization Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error testing selectorOptimizer:', error);
    }
  }
}

// testOptimizer(); // Uncomment to run

// Future Considerations:
// 1. Actual Selector Transformation:
//    - Simplification: Removing redundant parts of selectors (e.g., `div#myId` -> `#myId`).
//    - Strengthening: Adding attributes or parent/child context to make selectors more robust if they are too generic.
//    - Generating alternatives: e.g., XPath, or variations using different attributes or paths.
// 2. Specificity Calculation: Implement a proper CSS specificity calculator.
// 3. DOM Structure Analysis: Analyze the position of matched elements, their siblings, parents to suggest better selectors.
//    (e.g., if a selector matches multiple items, but only one is in `<main>`, prefer that).
// 4. Uniqueness Validation: Check if a simplified selector (like just an ID) is truly unique on the page.
// 5. Attribute-based selectors: Prioritize selectors with `id`, `data-*` attributes, or stable-looking classes.
// 6. Feedback Loop: If this optimizer is used after AI generation, its findings could feedback into prompt engineering for the AI.
// 7. Performance: Optimizing many complex selectors against large DOMs can be slow.
// 8. Testing against multiple HTML samples: A selector might be good on one page but bad on another similar one.
// 9. Integration with `intelligentScraping`: Could be called by the scraper if initial selectors fail or perform poorly.
// 10. Handling of dynamic content: This static analyzer won't help with selectors for content loaded by JS. (Needs headless browser context).
// 11. User-defined rules/heuristics for optimization.
// 12. More sophisticated `isPotentiallyTooGeneric` check.
// 13. Visual inspection aid: If possible, linking results to a visual representation of the page with elements highlighted.
// 14. Ranking of optimized/alternative selectors based on multiple factors (specificity, readability, stability assumption).
// 15. The current version primarily validates and annotates; actual optimization is a significant research/engineering task.
// 16. Consider using libraries that specialize in selector generation or analysis if available and suitable.
// 17. Robust error handling for Cheerio operations or invalid CSS selectors. (Basic try-catch added).
// 18. Output could include suggested repairs for slightly broken selectors if identifiable.


/*I have created `lib/services/selectorOptimizer.ts`.

This initial version of the service includes:
*   **TypeScript Interfaces:**
    *   `OptimizeSelectorParams`: Defines the input, which includes an array of `SelectorDetail` objects (the selectors to be optimized), the `htmlContent` to test against, an optional `fieldName` for context, and `options` for optimization strategies (e.g., `preferIdBased`, `avoidHighlyGenericTags`).
    *   `OptimizedSelectorResult`: Extends `SelectorDetail` to include the `originalSelector`, `optimizationNotes` (array of strings), `isValidAndNotEmpty` (boolean indicating if it matched any elements), `elementCount`, and placeholders for `specificityScore` and `alternativeSelectors`.
    *   `SelectorOptimizationOutput`: The overall output, containing the `fieldName`, an array of `OptimizedSelectorResult` objects, and an `overallSummary` string.
*   **Core Function `optimizeSelectors`:**
    *   Takes `OptimizeSelectorParams` as input.
    *   Loads the `htmlContent` using `cheerio`.
    *   Iterates through each `SelectorDetail` provided:
        *   Attempts to find elements using the selector on the parsed HTML.
        *   Records the `elementCount` and whether the selector `isValidAndNotEmpty`.
        *   Adds notes, such as whether the selector matched elements or if it might be too generic (using a naive `isPotentiallyTooGeneric` helper).
        *   Checks if the `elementCount` exceeds a `maxResultsThreshold` from options.
        *   **Important:** This initial version focuses on validation and annotation rather than actual transformation or generation of new selectors. The structure is in place for such logic to be added later.
    *   Populates `OptimizedSelectorResult` for each selector with the findings.
    *   Returns a `SelectorOptimizationOutput` object.
*   **Helper Function `isPotentiallyTooGeneric`:**
    *   A very basic placeholder function to identify selectors that might be too broad (e.g., just 'div' or 'span'). This is marked for future improvement.
*   **Example Usage:**
    *   A commented-out `testOptimizer` function demonstrates how `optimizeSelectors` can be called with sample HTML and a list of selectors, including some that are intentionally problematic (typos, too generic, invalid syntax).
*   **Future Considerations:**
    *   A detailed list of future enhancements, emphasizing that actual selector transformation (simplification, strengthening, alternative generation), specificity calculation, and deeper DOM analysis are complex tasks for future iterations. Other points include feedback loops, performance, and handling dynamic content.

This service provides a basic framework for analyzing CSS selectors against HTML content. While it doesn't perform deep optimization yet, it can validate selectors, count matches, and provide initial feedback, which is a useful first step and can be integrated into a larger scraping workflow (e.g., after AI generation or before committing to using a set of selectors). This completes step 11.*/
