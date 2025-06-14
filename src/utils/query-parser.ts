import { openai, QUERY_PARSER_CONFIG, ParsedQuery } from '@/lib/config/openai';

/**
 * Parses a natural language query into structured data
 * @param query - The natural language query from the user
 * @returns ParsedQuery object with structured search parameters
 */
export async function parseQuery(query: string): Promise<ParsedQuery> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a query parser that converts natural language business search queries into structured JSON.
          Extract key information like industry, location, and any numerical filters.
          Output only valid JSON matching this structure:
          {
            "industry": "string or null",
            "location": "string or null",
            "filters": {
              "max_employees": number or null,
              "min_employees": number or null,
              ... other relevant filters
            },
            "keywords": ["relevant", "search", "terms"]
          }`
        },
        {
          role: 'user',
          content: query
        }
      ],
      ...QUERY_PARSER_CONFIG,
      response_format: { type: 'json_object' }
    });

    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    return parsedResponse;
  } catch (error) {
    console.error('Error parsing query:', error);
    // Return a basic structure if parsing fails
    return {
      keywords: [query]
    };
  }
}
