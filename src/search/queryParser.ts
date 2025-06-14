import OpenAI from "openai"

export interface ParsedQuery {
  industry?: string
  location?: string
  size?: string
  keywords?: string[]
  raw: string
}

/**
 * Main entry point for parsing a natural language query.
 * Uses OpenAI if API key is available, otherwise falls back to local parser.
 */
export async function parseQuery(query: string): Promise<ParsedQuery> {
  const openAiKey = process.env.OPENAI_API_KEY
  if (openAiKey) {
    try {
      const result = await parseWithOpenAI(query, openAiKey)
      if (result) return result
    } catch (e) {
      // Fallback to local parser on error
    }
  }
  return parseLocally(query)
}

/**
 * OpenAI-powered parser (modular, can be swapped for other providers)
 */
async function parseWithOpenAI(query: string, apiKey: string): Promise<ParsedQuery | null> {
  const openai = new OpenAI({
    apiKey: apiKey,
  })

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that parses search queries into structured data. Extract industry, location, company size, and keywords from the query.",
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) return null

    // Parse the response (assuming it's in JSON format)
    return { ...JSON.parse(content), raw: query } as ParsedQuery
  } catch (error) {
    console.error("OpenAI API error:", error)
    return null
  }
}

/**
 * Simple fallback parser (regex/keyword-based)
 */
function parseLocally(query: string): ParsedQuery {
  // Basic examples, can be improved
  const industryMatch = query.match(/(marketing|finance|tech|saas|fintech|ecommerce|legal|consulting)/i)
  const locationMatch = query.match(/in ([A-Za-z ]+)/i)
  const sizeMatch = query.match(/(less than|under|more than|over|between) ([0-9]+( and | to |-)?[0-9]*) ?(employees|people)?/i)
  return {
    industry: industryMatch?.[1],
    location: locationMatch?.[1],
    size: sizeMatch?.[0],
    keywords: query.split(/\s+/).filter(Boolean),
    raw: query
  }
}

/**
 * How to swap parsers:
 * - To use another provider, add a new function (e.g., parseWithAnthropic) and call it in parseQuery.
 * - To disable OpenAI, remove the OPENAI_API_KEY from your env config.
 */
