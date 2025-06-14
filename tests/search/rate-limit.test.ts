import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

test.describe('Natural Language Search Rate Limiting', () => {
  test('NLS_RATE_001: Verify rate limiting for different plans', async ({ page }) => {
    // Test implementation
    const plans = ['free', 'pro', 'enterprise'];
    const limits = {
      free: 10,
      pro: 50,
      enterprise: 200
    };

    for (const plan of plans) {
      // Set up test organization with plan
      const { data: org } = await supabase
        .from('organizations')
        .insert({
          name: `Test Org ${plan}`,
          plan: plan
        })
        .select()
        .single();

      // Perform searches up to limit
      for (let i = 0; i < limits[plan]; i++) {
        await page.goto('/search');
        await page.fill('[data-testid="search-input"]', `test query ${i}`);
        await page.click('[data-testid="search-button"]');
      }

      // Try one more search
      await page.goto('/search');
      await page.fill('[data-testid="search-input"]', 'one more query');
      await page.click('[data-testid="search-button"]');

      // Verify rate limit error
      const errorMessage = await page.textContent('[data-testid="error-message"]');
      expect(errorMessage).toContain('Rate limit exceeded');

      // Clean up test organization
      await supabase
        .from('organizations')
        .delete()
        .eq('id', org.id);
    }
  });

  test('NLS_RATE_002: Verify rate limit reset', async ({ page }) => {
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