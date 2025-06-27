import OpenAI from 'openai'; // Using openai v4+

// Ensure OPENAI_API_KEY is set in your environment variables for this to work.
// The actual instantiation should ideally be in a centralized place or managed.
// For this service, we might receive an instance or configure it here.
// This is a simplified setup for demonstration.
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("[aiScraperGenerator] OPENAI_API_KEY not set. AI features will be non-functional. Using mocks.");
}

// Define the types for scraper configuration
export interface SelectorDetail {
  selector: string; // CSS selector
  type: 'text' | 'attribute' | 'html'; // Type of data to extract
  attributeName?: string; // e.g., 'href', 'src', only if type is 'attribute'
  description?: string; // Optional description of what this selector targets
}

export interface ScraperFieldConfig {
  fieldName: string; // e.g., 'companyName', 'jobTitle', 'phoneNumber'
  selectors: SelectorDetail[]; // Array of potential selectors, AI might provide multiple
  required?: boolean; // Is this field essential for the scrape to be considered successful?
  // TODO: Add more properties like data type (string, number, date), validation rules, etc.
  // Added from prompt example in step 9
  type?: 'text' | 'attribute' | 'html'; // This seems redundant if SelectorDetail.type is the source of truth
                                       // However, if a field itself has a primary type, it could be here.
                                       // For now, assuming SelectorDetail.type is primary.
}

export interface AIScraperConfig {
  websiteUrl: string;
  targetFields: ScraperFieldConfig[];
  // TODO: Add global config: e.g., preferred User-Agent, delay between requests, pagination strategy
  lastGenerated?: string; // ISO date string of when this config was generated
  aiModelUsed?: string; // Identifier for the AI model that generated this
  aiModelProvider?: string; // e.g., 'OpenAI', 'Anthropic'
  promptUsed?: string; // For debugging and reproducibility
  rawAiResponse?: string; // For debugging
}

// Define input parameters for the AI scraper generator
export interface GenerateScraperConfigParams {
  url: string;
  // Specify what kind of data we want to extract.
  // This could be a list of predefined field names or a more abstract description.
  dataRequirements: Array<{ fieldName: string; description: string, type?: string, required?: boolean }> | string; // Added type and required from prompt example
  // Optional: Provide existing HTML content to avoid refetching
  htmlContent?: string;
  // Optional: User preferences or hints for the AI
  userHints?: string[];
  // Options for AI generation
  aiOptions?: {
    model?: string; // e.g., "gpt-4-turbo-preview", "gpt-3.5-turbo"
    maxTokens?: number;
    temperature?: number;
    // Potentially, a budget or max retries for the AI call
  };
}


// Helper function to fetch HTML content if not provided.
// This might be moved to websiteAnalyzer.ts later or use a shared utility.
async function fetchHtmlForAI(url: string, providedHtml?: string): Promise<string> {
  if (providedHtml) {
    console.log(`[aiScraperGenerator] Using provided HTML content for ${url}.`);
    return providedHtml;
  }
  console.log(`[aiScraperGenerator] Fetching HTML content for ${url} for AI analysis.`);
  try {
    // In a real scenario, use a robust fetch with User-Agent, error handling, retries.
    // This is a simplified fetch.
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIScraperBot/1.0; +http://example.com/bot)' }
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching ${url}`);
    }
    const text = await response.text();
    // Truncate very long HTML to avoid excessive token usage with AI
    // This is a naive truncation; smarter summarization/extraction of relevant parts is better.
    const MAX_HTML_LENGTH = 30000; // Approx 10k tokens, adjust based on model and budget
    if (text.length > MAX_HTML_LENGTH) {
      console.warn(`[aiScraperGenerator] HTML content for ${url} is very long (${text.length} chars). Truncating to ${MAX_HTML_LENGTH} chars for AI prompt.`);
      return text.substring(0, MAX_HTML_LENGTH);
    }
    return text;
  } catch (error) {
    console.error(`[aiScraperGenerator] Failed to fetch HTML for ${url}:`, error);
    throw new Error(`Failed to retrieve HTML content for AI analysis from ${url}.`);
  }
}


/**
 * Generates a scraper configuration for a given website URL and data requirements using an AI model.
 *
 * @param params - The parameters for generating the scraper configuration.
 * @returns A promise that resolves to the AI-generated scraper configuration.
 */
export async function generateAIScraperConfig(
  params: GenerateScraperConfigParams
): Promise<AIScraperConfig> {
  const { url, dataRequirements, htmlContent: providedHtmlContent, userHints, aiOptions } = params;

  console.log(`[aiScraperGenerator] Generating config for URL: ${url}`);
  console.log(`[aiScraperGenerator] Data Requirements: ${JSON.stringify(dataRequirements)}`);
  if (userHints) console.log(`[aiScraperGenerator] User Hints: ${userHints.join(', ')}`);

  let actualHtmlContent: string;
  try {
    actualHtmlContent = await fetchHtmlForAI(url, providedHtmlContent);
  } catch (fetchError) {
     // If fetching HTML fails, we can't proceed with AI generation based on content.
     // Return a config indicating failure or throw. For now, let's throw.
     throw fetchError;
  }

  const dataReqString = typeof dataRequirements === 'string'
    ? dataRequirements
    : dataRequirements.map(dr => `- ${dr.fieldName} (${dr.type || 'text'}): ${dr.description}`).join('\n');

  // Construct a more detailed prompt for the AI model
  const prompt = `
    Analyze the HTML content from the website at URL: ${url}
    The (potentially truncated) HTML content is provided below:
    ---BEGIN HTML CONTENT---
    ${actualHtmlContent}
    ---END HTML CONTENT---

    Based on this HTML, generate CSS selectors to extract the following data fields.
    For each field, provide an array of SelectorDetail objects. Each SelectorDetail should include:
    - selector: A robust CSS selector.
    - type: The type of data to extract ('text', 'attribute', 'html').
    - attributeName (optional, string): If type is 'attribute', specify the attribute (e.g., 'href', 'src', 'content').
    - description (optional, string): A brief note about this specific selector.

    Data Fields to Extract:
    ${dataReqString}

    User Hints for selector generation (if any):
    ${userHints ? userHints.join('\n') : 'None'}

    Return your response as a JSON object with a single key "targetFields",
    which is an array of ScraperFieldConfig objects.
    Each ScraperFieldConfig object should have:
    - fieldName: The original fieldName requested.
    - selectors: An array of SelectorDetail objects as described above. Try to provide 1-3 good selectors per field if possible.
    - required (optional, boolean): You can infer this if the description implies necessity.

    Example SelectorDetail: { "selector": "h1.main-title", "type": "text", "description": "Main heading of the page" }
    Example ScraperFieldConfig: { "fieldName": "productTitle", "selectors": [{ "selector": "h1.product-name", "type": "text" }] }

    Ensure the output is ONLY the valid JSON object. Do not include any other text or explanations outside the JSON structure.
    If you cannot determine selectors for a field, you can return an empty array for its "selectors" property or omit the field.
  `;

  let generatedFields: ScraperFieldConfig[] = [];
  let aiModelUsed = aiOptions?.model || 'gpt-3.5-turbo'; // Default model
  let rawAiResponseContent: string | undefined;

  if (!openai) {
    console.warn("[aiScraperGenerator] OpenAI client not initialized. OPENAI_API_KEY might be missing. Using mock response.");
    aiModelUsed = 'mock-ai-v2.0-no-apikey';
    // Fallback to previous mock if OpenAI client is not available
    generatedFields = (typeof dataRequirements === 'string' ? [{ fieldName: 'genericData', description: dataRequirements, type: 'text' }] : dataRequirements).map(dr => ({
        fieldName: dr.fieldName,
        selectors: [
          { selector: `.${dr.fieldName.toLowerCase()}-class-mock`, type: (dr.type || 'text') as SelectorDetail['type'], description: `Mock AI selector for ${dr.fieldName}` },
          { selector: `#${dr.fieldName.toLowerCase()}-id-mock`, type: (dr.type || 'text') as SelectorDetail['type'], description: `Alternative mock for ${dr.fieldName}` }
        ],
        required: dr.required || false,
    }));
  } else {
    try {
      console.log(`[aiScraperGenerator] Sending request to OpenAI model: ${aiModelUsed}`);
      const aiResponse = await openai.chat.completions.create({
        model: aiModelUsed,
        messages: [{ role: "user", content: prompt }],
        // Using response_format for JSON mode is highly recommended if the model supports it (e.g., newer GPT versions)
        // For older models, you'd parse the text content and hope it's valid JSON.
        response_format: { type: "json_object" }, // Available for models like gpt-4-1106-preview, gpt-3.5-turbo-1106
        temperature: aiOptions?.temperature || 0.2, // Low temperature for more deterministic selector generation
        max_tokens: aiOptions?.maxTokens || 1024, // Adjust as needed
      });

      rawAiResponseContent = aiResponse.choices[0]?.message?.content;
      if (!rawAiResponseContent) {
        throw new Error("AI response content is empty.");
      }

      console.log("[aiScraperGenerator] Received AI response. Attempting to parse JSON.");
      // console.log("[aiScraperGenerator] Raw AI Response Snippet:", rawAiResponseContent.substring(0, 200));

      const parsedJson = JSON.parse(rawAiResponseContent);
      if (!parsedJson.targetFields || !Array.isArray(parsedJson.targetFields)) {
        throw new Error("AI response JSON does not contain a valid 'targetFields' array.");
      }
      generatedFields = parsedJson.targetFields;
      // TODO: Add validation for the structure of generatedFields against ScraperFieldConfig[]
      console.log("[aiScraperGenerator] Successfully parsed AI-generated fields.");

    } catch (error) {
      console.error("[aiScraperGenerator] Error interacting with AI or parsing response:", error);
      // Fallback or re-throw, or return a config indicating failure
      // For now, let's create a config that signals an error in generation for this URL.
      const errorMessage = error instanceof Error ? error.message : "Unknown AI interaction error.";
      // Construct a "failed" config or throw. Let's throw for now so orchestrator handles it.
      throw new Error(`AI generation failed for ${url}: ${errorMessage}`);
      // Alternative: return a config with an error field or empty targetFields
      // generatedFields = []; // Or some error indication
      // aiModelUsed = `error-state: ${aiModelUsed}`;
    }
  }

  const config: AIScraperConfig = {
    websiteUrl: url,
    targetFields: generatedFields,
    lastGenerated: new Date().toISOString(),
    aiModelProvider: openai ? 'OpenAI' : 'MockProvider',
    aiModelUsed: aiModelUsed,
    promptUsed: process.env.NODE_ENV === 'development' ? prompt : undefined, // Optionally store prompt for debugging
    rawAiResponse: process.env.NODE_ENV === 'development' ? rawAiResponseContent : undefined, // Optionally store raw response
  };

  console.log(`[aiScraperGenerator] Generated config (fields count: ${config.targetFields.length}): ${JSON.stringify(config.targetFields, null, 2)}`);
  return config;
}

// Example usage (for testing purposes, would typically be called by an API route or orchestrator)
async function testGenerator() {
  if (process.env.NODE_ENV === 'development' && openai) { // Avoid running in prod/test and only if openai is configured
    console.log("--- Testing AI Scraper Generator with LIVE AI Call (if OPENAI_API_KEY is set) ---");
    try {
      const params: GenerateScraperConfigParams = {
        // Use a simple, well-structured public page for initial testing
        url: 'https://books.toscrape.com/', // Example site for scraping practice
        dataRequirements: [
          { fieldName: 'firstBookTitle', description: 'The title of the first book listed on the page', type: 'text' },
          { fieldName: 'firstBookPrice', description: 'The price of the first book listed', type: 'text' },
        ],
        userHints: ['Selectors should be specific to the first book shown in the main product list.'],
        aiOptions: { model: 'gpt-3.5-turbo-1106' } // Ensure this model supports JSON mode
      };
      const config = await generateAIScraperConfig(params);
      // console.log('Test AIScraperConfig (Live AI):', JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error testing aiScraperGenerator (Live AI):', error);
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log("--- Testing AI Scraper Generator with MOCK (OPENAI_API_KEY not set or OpenAI client issue) ---");
     try {
      const params: GenerateScraperConfigParams = {
        url: 'https://example.com/product/123',
        dataRequirements: [
          { fieldName: 'productTitle', description: 'The main title of the product', type: 'text' },
          { fieldName: 'price', description: 'The price of the product, including currency symbol', type: 'text' },
        ],
      };
      const config = await generateAIScraperConfig(params);
      // console.log('Test AIScraperConfig (Mock):', JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error testing aiScraperGenerator (Mock):', error);
    }
  }
}

// testGenerator(); // Uncomment to run a test if needed during development. BEWARE OF API COSTS.

// Future considerations:
// 1. Actual AI Integration: Implemented placeholder for OpenAI. Real usage needs robust error handling, retries.
// 2. Prompt Engineering: This is key. The current prompt is a good start. Iteration needed.
// 3. HTML Fetching/Analysis: Basic fetch added. websiteAnalyzer.ts could provide more context (e.g. simplified DOM, key sections).
// 4. Error Handling: More granular error handling for AI API calls, network issues, parsing AI responses, token limits.
// 5. Cost Management: Monitor token usage. Implement caching for identical (URL, requirements) requests.
// 6. Caching: Cache generated configurations.
// 7. Iterative Improvement: Allow users to provide feedback on generated configs to refine future suggestions or prompts.
// 8. Security: Ensure that URLs and HTML content are handled safely. Sanitize inputs.
// 9. Complex Structures: Current prompt asks for simple field selectors. Needs extension for lists of items, nested data.
//10. Input Validation: Validate `dataRequirements` structure more thoroughly.
//11. Configuration Schema: Versioning for `AIScraperConfig` and the AI interaction protocol.
//12. Token Limits: The current HTML truncation is naive. Smarter chunking or summarization of HTML needed for very large pages.
//13. Human-in-the-loop: Design for potential manual review/override of AI suggestions.
//14. Few-shot prompting: Provide good examples of (HTML snippet + selectors) in the prompt.
//15. Support for different data types (numbers, dates, booleans) and cleaning/formatting instructions to AI.
//16. Selector validation: After AI generates selectors, optionally test them against the actual page content (could be done by `intelligentScraping` or `selectorOptimizer`).
//17. Fallback strategies: If AI fails, could try simpler methods or a different model.
//18. Contextual awareness: Train/prompt AI to understand common website layouts (e.g., e-commerce, articles).
//19. Handling dynamic content: Current method assumes static HTML. AI could suggest if Puppeteer/Playwright is likely needed.
//20. Specify output format to AI: `response_format: { type: "json_object" }` is used. This is good.
//21. Abstraction of AI provider: Design to potentially swap OpenAI with other providers.
//22. Asynchronous generation for long AI calls (API route might return job ID).
//23. Storing `promptUsed` and `rawAiResponse` conditionally for debugging is useful.
//24. The `fetchHtmlForAI` could be part of `websiteAnalyzer.ts`.
//25. Add more sophisticated validation for the AI's JSON output structure to ensure it matches `ScraperFieldConfig[]`.
//26. Consider a small library of common CSS selector patterns the AI can be guided to use or avoid.
//27. If AI consistently fails for certain types of sites/fields, log this for prompt improvement.
//28. Better management of OpenAI client instantiation (e.g. singleton, dependency injection).
//29. The `dataRequirements` in the prompt could be more structured, e.g. specify if a field is a list.
//30. Handle API rate limits from OpenAI gracefully (e.g. exponential backoff).
