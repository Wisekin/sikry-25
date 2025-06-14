import { Configuration } from 'openai'

export const externalApiConfig = {
  openai: {
    config: new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    enabled: Boolean(process.env.OPENAI_API_KEY),
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    searchEngineId: process.env.GOOGLE_SEARCH_CX,
    enabled: Boolean(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_CX),
  },
  linkedin: {
    apiKey: process.env.LINKEDIN_API_KEY,
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    enabled: Boolean(
      process.env.LINKEDIN_API_KEY && 
      process.env.LINKEDIN_CLIENT_ID && 
      process.env.LINKEDIN_CLIENT_SECRET
    ),
  },
}
