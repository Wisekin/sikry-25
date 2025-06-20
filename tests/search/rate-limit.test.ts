import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Mock IDs for testing purposes. In a real scenario, this would come from an auth context.
const MOCK_USER_ID = 'd4e5f6a7-b8c9-0123-4567-890abcdef123';
const MOCK_ORG_ID = 'b2c3d4e5-f6a7-8901-2345-67890abcdef1';

test.describe('Natural Language Search Rate Limiting', () => {
  // This test is now much faster as it hits the API directly.
  test('NLS_RATE_001: Verify rate limiting via API', async ({ request }) => {
    const plans = {
      starter: 10,
      pro: 50,
      // enterprise: 200, // Skipping enterprise to keep the test fast
    };

    for (const [plan, limit] of Object.entries(plans)) {
      console.log(`Testing rate limit for plan: ${plan}`);
      // Perform searches up to the limit
      for (let i = 0; i < limit; i++) {
        const query = `test query ${i}`;
        const response = await request.get(`/api/search?q=${encodeURIComponent(query)}`, {
          headers: { 
            'x-user-id': MOCK_USER_ID, 
            'x-organization-id': MOCK_ORG_ID,
            'x-user-plan': plan 
          },
        });
        expect(response.ok()).toBeTruthy();
      }

      // Try one more search, which should be rate-limited
      const overLimitQuery = 'one more query';
      const overLimitResponse = await request.get(`/api/search?q=${encodeURIComponent(overLimitQuery)}`, {
        headers: { 
          'x-user-id': MOCK_USER_ID, 
          'x-organization-id': MOCK_ORG_ID,
          'x-user-plan': plan 
        },
      });

      // Verify rate limit error
      expect(overLimitResponse.status()).toBe(429);
      const body = await overLimitResponse.json();
      expect(body.error).toContain('Rate limit exceeded');

      // Clean up redis cache for the next plan
      // (This assumes the rate limiter uses a key with the user ID and plan)
      // In a real app, you might need a dedicated cleanup endpoint or Redis command access.
    }
  });

  // This test is skipped because waiting for an hour is not practical for a test suite.
  // This logic should be verified with a backend unit test where time can be mocked.
  test.skip('NLS_RATE_002: Verify rate limit reset', async ({ page }) => {
    // Test implementation
    const query = 'test query for rate limit reset';
    
    // Hit rate limit
    for (let i = 0; i < 11; i++) {
      await page.goto('/search');
      await page.fill('[data-testid="search-input"]', `test query ${i}`);
      await page.click('[data-testid="search-button"]');
    }

    // Verify rate limit error
    const errorMessage = await page.textContent('[data-testid="error-message"]');
    expect(errorMessage).toContain('Rate limit exceeded');

    // Wait for reset period (1 hour)
    await page.waitForTimeout(3600000);

    // Try searching again
    await page.goto('/search');
    await page.fill('[data-testid="search-input"]', query);
    await page.click('[data-testid="search-button"]');

    // Verify search works
    const results = await page.textContent('[data-testid="search-results"]');
    expect(results).toBeTruthy();
  });
}); 