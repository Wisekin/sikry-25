import { test, expect } from '@playwright/test';

const API_URL = '/api/search';
const MOCK_USER_ID = 'e5f6a7b8-c9d0-1234-5678-90abcdef1234';
const MOCK_ORG_ID = 'f6a7b8c9-d0e1-2345-6789-0abcdef12345';

// E2E test for the main search API endpoint.
// This test makes live calls to external APIs (Companies House, Wikidata)
// to ensure the entire integration, merging, and ranking pipeline works as expected.

test.describe('Search API Integration E2E', () => {
  const headers = {
    'x-user-id': MOCK_USER_ID,
    'x-organization-id': MOCK_ORG_ID,
  };

  test('should return a successful response with merged results from all sources', async ({ request }) => {
    const query = 'tech company';
    const response = await request.get(`${API_URL}?q=${encodeURIComponent(query)}`, { headers });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(Array.isArray(json.results)).toBe(true);
    // Check if results are coming from more than one source
    const sources = new Set(json.results.map((r: any) => r.source));
    expect(sources.size).toBeGreaterThan(1);
  });

  test('should correctly deduplicate and merge results for a known entity', async ({ request }) => {
    const query = 'Apple Inc';
    const response = await request.get(`${API_URL}?q=${encodeURIComponent(query)}`, { headers });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();

    const appleResults = json.results.filter((r: any) => r.name.includes('Apple'));
    // There should be a primary result and potentially others, but not a huge number of duplicates
    expect(appleResults.length).toBeLessThan(5);
    // The top result should be from a reliable source
    if (appleResults.length > 0) {
      expect(['companies_house', 'internal_db']).toContain(appleResults[0].source);
    }
  });

  test('should return an empty array for a nonsensical query', async ({ request }) => {
    const query = 'zxcvbnm lkjhgfdsa';
    const response = await request.get(`${API_URL}?q=${encodeURIComponent(query)}`, { headers });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.results.length).toBe(0);
  });
});
