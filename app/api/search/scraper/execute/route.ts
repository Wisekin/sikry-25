import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { chromium } from 'playwright';
import { createClient } from '@/src/utils/supabase/server';

// Default selectors for zero-scraping mode
const defaultSelectors = [
  { fieldName: 'emails', cssSelector: 'a[href^="mailto:"]', type: 'attribute', attributeName: 'href' },
  { fieldName: 'phones', cssSelector: 'a[href^="tel:"]', type: 'attribute', attributeName: 'href' },
  { fieldName: 'address', cssSelector: 'address', type: 'text' },
  { fieldName: 'companyName', cssSelector: 'meta[property="og:site_name"], meta[name="application-name"]', type: 'attribute', attributeName: 'content' },
  { fieldName: 'website', cssSelector: 'meta[property="og:url"]', type: 'attribute', attributeName: 'content' },
  { fieldName: 'socialMedia', cssSelector: 'a[href*="linkedin.com"],a[href*="twitter.com"],a[href*="facebook.com"]', type: 'attribute', attributeName: 'href' },
];

const scraperRequestSchema = z.object({
  url: z.string().url(),
  config: z.object({
    websiteUrl: z.string().url(),
    selectors: z.array(z.object({
      fieldName: z.string(),
      cssSelector: z.string(),
      type: z.enum(['text', 'attribute', 'html']),
      attributeName: z.string().optional()
    }))
  })
});

interface ScrapedData {
  companyName?: string;
  emails?: string[];
  phones?: string[];
  address?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { url, config } = scraperRequestSchema.parse(body);

    // Merge default selectors with user-provided selectors (avoid duplicates by fieldName)
    const mergedSelectors = [
      ...defaultSelectors.filter(defSel => !config.selectors.some(sel => sel.fieldName === defSel.fieldName)),
      ...config.selectors
    ];

    // Initialize browser
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(30000);
      await page.goto(url, { waitUntil: 'networkidle' });
      const scrapedData: ScrapedData = {};
      for (const selector of mergedSelectors) {
        try {
          let elements: string[] = [];
          if (selector.type === 'attribute' && selector.attributeName) {
            elements = await page.$$eval(selector.cssSelector,
              (els: Element[], attr: string) => els.map(el => el.getAttribute(attr) || ''),
              selector.attributeName
            );
          } else if (selector.type === 'text') {
            elements = await page.$$eval(selector.cssSelector,
              (els: Element[]) => els.map(el => el.textContent?.trim() || '')
            );
          } else if (selector.type === 'html') {
            elements = await page.$$eval(selector.cssSelector,
              (els: Element[]) => els.map(el => el.innerHTML?.trim() || '')
            );
          }
          const validElements = elements.filter(Boolean);
          if (validElements.length > 0) {
            scrapedData[selector.fieldName] = validElements.length === 1
              ? validElements[0]
              : validElements;
            if (selector.fieldName === 'emails') {
              scrapedData.emails = validElements.map(email =>
                email.replace('mailto:', '').trim()
              );
            } else if (selector.fieldName === 'phones') {
              scrapedData.phones = validElements.map(phone =>
                phone.replace('tel:', '').trim()
              );
            } else if (selector.fieldName === 'socialMedia') {
              const socialMedia: Record<string, string> = {};
              validElements.forEach(url => {
                const platform = url.toLowerCase().includes('linkedin.com') ? 'linkedin' :
                  url.toLowerCase().includes('twitter.com') ? 'twitter' :
                  url.toLowerCase().includes('facebook.com') ? 'facebook' : 'other';
                socialMedia[platform] = url;
              });
              scrapedData.socialMedia = socialMedia;
            }
          }
        } catch (error) {
          console.error(`Failed to extract ${selector.fieldName}:`, error);
        }
      }
      // Save to database
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from('scraped_data')
        .insert({
          url,
          data: scrapedData,
          scraped_at: new Date().toISOString(),
          config: config
        });
      if (dbError) {
        throw dbError;
      }
      return NextResponse.json(scrapedData);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to scrape website' },
      { status: 500 }
    );
  }
}
