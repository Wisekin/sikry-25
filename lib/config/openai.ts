import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration for the query parser
export const QUERY_PARSER_CONFIG = {
  model: 'gpt-3.5-turbo',
  temperature: 0.1, // Low temperature for more focused, consistent results
  max_tokens: 150,
};

// Type for parsed query structure
export interface ParsedQuery {
  industry?: string;
  location?: string;
  filters?: {
    max_employees?: number;
    min_employees?: number;
    [key: string]: any;
  };
  keywords?: string[];
}
