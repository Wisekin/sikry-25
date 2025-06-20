import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';

// --- 1. INTERFACES & TYPES ---

/**
 * Defines the structure of a parsed query.
 */
export interface ParsedQuery {
  keywords: string[];
  exactPhrases: string[];
  excludedKeywords: string[];
  filters: Record<string, string>; // e.g., { industry: "tech", location: "Zurich" }
}

/**
 * Defines the contract for a query parser.
 * Any parser (Google, OpenAI, local) must implement this interface.
 */
interface QueryParser {
  (query: string): Promise<ParsedQuery | null>;
}

// --- 2. CONCRETE PARSER IMPLEMENTATIONS (STRATEGIES) ---

/**
 * Parses a query using the Google Generative AI (Gemini) API.
 */
const parseWithGoogleAI: QueryParser = async (query) => {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Google AI API key is not configured.");
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Parse the following search query into a JSON object with keywords, exactPhrases, excludedKeywords, and filters (for fields like industry, location, size). Query: "${query}"`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as ParsedQuery;
  } catch (error) {
    console.error("Error with Google AI Parser:", error);
    throw error; // Re-throw to allow fallback
  }
};

/**
 * Parses a query using the OpenAI API.
 */
const parseWithOpenAI: QueryParser = async (query) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }
  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an intelligent search query parser. Convert the user's query into a JSON object with four keys: 'keywords' (an array of strings), 'exactPhrases' (an array of strings), 'excludedKeywords' (an array of strings for terms to exclude), and 'filters' (an object for key-value pairs like 'industry:technology')."
        },
        { role: "user", content: query },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as ParsedQuery;
  } catch (error) {
    console.error("Error with OpenAI Parser:", error);
    throw error; // Re-throw to allow fallback
  }
};

/**
 * A simple, local fallback parser using regular expressions.
 * This ensures basic functionality even if all AI providers fail.
 */
const parseLocally: QueryParser = async (query) => {
  // Using Promise.resolve to conform to the async QueryParser interface
  return Promise.resolve({
    keywords: query.match(/\b\w+\b/g) || [],
    exactPhrases: [],
    excludedKeywords: [],
    filters: {},
  });
};


// --- 3. PARSER MANAGER ---

// Define the order of preference for the parsers.
// The system will try them sequentially until one succeeds.
const parsers: { name: string, parser: QueryParser }[] = [
  { name: 'GoogleAI', parser: parseWithGoogleAI },
  { name: 'OpenAI', parser: parseWithOpenAI },
  // To add a new provider like DeepSeek, simply create a 'parseWithDeepSeek'
  // function and add it here: { name: 'DeepSeek', parser: parseWithDeepSeek },
  { name: 'LocalFallback', parser: parseLocally },
];

/**
 * The main entry point for parsing a search query.
 * It iterates through the available parsers and uses the first one that
 * returns a successful result.
 * @param query The user's search string.
 * @returns A ParsedQuery object or null if all parsers fail.
 */
/**
 * The main entry point for parsing a search query.
 * It iterates through the available parsers and uses the first one that
 * returns a successful result.
 * @param query The user's search string.
 * @returns A ParsedQuery object or null if all parsers fail.
 */

// Exported for testing purposes only, to allow monkey-patching in test environments.
export const __test_only__ = {
  parsers,
};

export async function parseQuery(query: string): Promise<ParsedQuery | null> {
  if (!query) return null;

  for (const { name, parser } of parsers) {
    try {
      const result = await parser(query);
      if (result) {
        console.log(`Query parsed successfully with: ${name}`);
        return result;
      }
    } catch (error) {
      console.warn(`${name} parser failed. Trying next parser...`);
    }
  }

  console.error("All query parsers failed. No result could be generated.");
  return null;
}
