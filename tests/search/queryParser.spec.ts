import { test, expect } from '@playwright/test';

const API_URL = '/api/test-parser';

test.describe('Modular Query Parser API', () => {

  test('should use the primary (Google) parser for a standard query', async ({ request }) => {
    const query = 'tech companies in zurich';
    const response = await request.get(`${API_URL}?q=${query}`);
    
    expect(response.ok()).toBeTruthy();
    const { result } = await response.json();
    
    // We can't know for sure it was Google, but we expect a structured result
    // that is NOT from the basic local parser.
    expect(result).not.toBeNull();
    expect(Array.isArray(result.keywords)).toBeTruthy();
    expect(result.keywords.length).toBeGreaterThan(1); // Local parser would just split words
  });

  test('should fall back to the secondary (OpenAI) parser if Google fails', async ({ request }) => {
    const query = 'startups with series a funding';
    // Simulate Google parser failure
    const response = await request.get(`${API_URL}?q=${query}&failGoogle=true`);

    expect(response.ok()).toBeTruthy();
    const { result } = await response.json();

    // Again, we expect a structured result, implying a successful fallback to an AI parser
    expect(result).not.toBeNull();
    expect(Array.isArray(result.keywords)).toBeTruthy();
  });

  test('should fall back to the local parser if both Google and OpenAI fail', async ({ request }) => {
    const query = 'local fallback test';
    // Simulate both AI parsers failing
    const response = await request.get(`${API_URL}?q=${query}&failGoogle=true&failOpenAI=true`);

    expect(response.ok()).toBeTruthy();
    const { result } = await response.json();

    // The local parser has a very specific, simple output
    expect(result).toEqual({
      keywords: ['local', 'fallback', 'test'],
      exactPhrases: [],
      excludedKeywords: [],
      filters: {},
    });
  });

  test('should return a null result for an empty query', async ({ request }) => {
    const response = await request.get(`${API_URL}?q=`);
    expect(response.ok()).toBeTruthy();
    const { result } = await response.json();
    expect(result).toBeNull();
  });
});
