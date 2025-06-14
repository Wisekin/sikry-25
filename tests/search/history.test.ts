import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

test.describe('Natural Language Search History', () => {
  test('NLS_HIST_001: Verify search history recording', async ({ page }) => {
    // Test implementation
    const queries = [
      'marketing companies in Paris',
      'tech startups in London',
      'consulting firms in Berlin'
    ];

    // Perform multiple searches
    for (const query of queries) {
      await page.goto('/search');
      await page.fill('[data-testid="search-input"]', query);
      await page.click('[data-testid="search-button"]');
    }

    // Verify search history entries
    const { data: history } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(queries.length);

    expect(history).toHaveLength(queries.length);
    
    // Verify each entry has correct metadata
    for (let i = 0; i < queries.length; i++) {
      expect(history[i].query).toBe(queries[i]);
      expect(history[i].execution_time).toBeGreaterThan(0);
      expect(history[i].metadata).toBeTruthy();
    }
  });

  test('NLS_HIST_002: Verify source information in history', async ({ page }) => {
    // Test implementation
    const query = 'test query with multiple sources';
    
    // Perform search
    await page.goto('/search');
    await page.fill('[data-testid="search-input"]', query);
    await page.click('[data-testid="search-button"]');
    
    // Verify search history entry with sources
    const { data: history } = await supabase
      .from('search_history')
      .select('*')
      .eq('query', query)
      .single();
    
    expect(history.sources).toBeInstanceOf(Array);
    expect(history.sources).toContain('internal');
    
    // Verify sources array contains expected sources
    const expectedSources = ['internal', 'wikidata', 'business_registry'];
    for (const source of expectedSources) {
      expect(history.sources).toContain(source);
    }
  });
}); 