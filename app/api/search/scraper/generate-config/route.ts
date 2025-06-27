import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/src/utils/supabase/server'; // For potential auth in future
// Assuming ScraperConfig is defined in a shared location, let's define it here for now
// We should later move this to a shared types file if not already present

export interface ScraperSelector {
  fieldName: string;
  cssSelector: string;
  type: 'text' | 'attribute' | 'html';
  attributeName?: string;
}

export interface ScraperConfig {
  id?: string;
  websiteUrl: string;
  selectors: ScraperSelector[];
  extractionRules?: Record<string, any>;
  lastModified?: string;
  version?: number;
}

interface GenerateConfigRequest {
  prompt: string;
  websiteUrl: string;
}

interface GenerateConfigResponse {
  config: ScraperConfig;
  summary: string[];
}

// Placeholder default config
const defaultScraperConfig = (websiteUrl: string): ScraperConfig => ({
  websiteUrl,
  selectors: [
    { fieldName: 'email', cssSelector: 'a[href^="mailto:"]', type: 'attribute', attributeName: 'href' },
    { fieldName: 'phone', cssSelector: 'a[href^="tel:"]', type: 'attribute', attributeName: 'href' },
    { fieldName: 'title', cssSelector: 'title', type: 'text' },
    // Add other default selectors if needed
  ],
});

export async function POST(request: NextRequest) {
  // Optional: Authentication (example using Supabase)
  // const supabase = createClient();
  // const { data: { user }, error: authError } = await supabase.auth.getUser();
  // if (authError || !user) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const body: GenerateConfigRequest = await request.json();
    const { prompt, websiteUrl } = body;

    if (!websiteUrl) {
      return NextResponse.json({ error: 'websiteUrl is required' }, { status: 400 });
    }

    // If the prompt is empty, return the default configuration
    if (!prompt || prompt.trim() === '') {
      const defaultConfig = defaultScraperConfig(websiteUrl);
      return NextResponse.json<GenerateConfigResponse>({
        config: defaultConfig,
        summary: ['Default configuration loaded: emails, phone numbers, and page title.'],
      });
    }

    // Placeholder for AI processing logic
    // In a real implementation, you would call an AI service (e.g., OpenAI) here
    // For now, we'll return a mock generated config based on a simple keyword check

    let generatedConfig: ScraperConfig;
    let summary: string[];

    if (prompt.toLowerCase().includes('email') && prompt.toLowerCase().includes('about page')) {
      generatedConfig = {
        websiteUrl,
        selectors: [
          { fieldName: 'email', cssSelector: 'a[href^="mailto:"]', type: 'attribute', attributeName: 'href' },
          { fieldName: 'about_page_text', cssSelector: 'body', type: 'text' }, // Simple selector for body text
        ],
      };
      summary = ['Emails', 'About page text'];
    } else if (prompt.toLowerCase().includes('email')) {
      generatedConfig = {
        websiteUrl,
        selectors: [
          { fieldName: 'email', cssSelector: 'a[href^="mailto:"]', type: 'attribute', attributeName: 'href' },
        ],
      };
      summary = ['Emails'];
    } else if (prompt.toLowerCase().includes('title')) {
      generatedConfig = {
        websiteUrl,
        selectors: [
          { fieldName: 'title', cssSelector: 'title', type: 'text' },
        ],
      };
      summary = ['Page title'];
    } else {
      // Fallback to a more generic or default-like config if prompt is not understood
      generatedConfig = defaultScraperConfig(websiteUrl);
      summary = ['Default configuration (prompt not fully understood): emails, phone numbers, and page title.'];
    }
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json<GenerateConfigResponse>({
      config: generatedConfig,
      summary: summary,
    });

  } catch (error) {
    console.error('Error in generate-config endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to generate scraper configuration.', details: errorMessage }, { status: 500 });
  }
}

// Optional: Add OPTIONS method for CORS preflight if needed, though Next.js handles this for /api routes.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Adjust as needed for security
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
