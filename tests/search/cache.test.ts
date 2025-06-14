import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

test.describe('Natural Language Search Cache System', () => {
  test('NLS_CACHE_001: Verify search results are correctly cached', async ({ page }) => {
    // Test implementation
    const query = 'marketing companies in Paris';
    
    // First search
    const startTime1 = Date.now();
    await page.goto('/search');
    await page.fill('[data-testid="search-input"]', query);
    await page.click('[data-testid="search-button"]');
    const firstSearchTime = Date.now() - startTime1;
    
    // Verify cache entry
    const { data: cacheEntry } = await supabase
      .from('api_cache')
      .select('*')
      .eq('key', query)
      .single();
    
    expect(cacheEntry).toBeTruthy();
    
    // Second search
    const startTime2 = Date.now();
    await page.fill('[data-testid="search-input"]', query);
    await page.click('[data-testid="search-button"]');
    const secondSearchTime = Date.now() - startTime2;
    
    // Verify second search is faster
    expect(secondSearchTime).toBeLessThan(firstSearchTime);
  });

  test('NLS_CACHE_002: Verify cache expiration', async ({ page }) => {
    // Test implementation
    const query = 'test query for expiration';
    
    // First search
    await page.goto('/search');
    await page.fill('[data-testid="search-input"]', query);
    await page.click('[data-testid="search-button"]');
    
    // Verify cache entry
    const { data: cacheEntry } = await supabase
      .from('api_cache')
      .select('*')
      .eq('key', query)
      .single();
    
    expect(cacheEntry).toBeTruthy();
    
    // Wait for cache to expire (1 hour)
    await page.waitForTimeout(3600000);
    
    // Second search
    await page.fill('[data-testid="search-input"]', query);
    await page.click('[data-testid="search-button"]');
    
    // Verify new cache entry
    const { data: newCacheEntry } = await supabase
      .from('api_cache')
      .select('*')
      .eq('key', query)
      .single();
    
    expect(newCacheEntry.created_at).toBeGreaterThan(cacheEntry.created_at);
  });

  test('NLS_CACHE_003: Verify metadata storage', async ({ page }) => {
    // Test implementation
    const query = 'test query for metadata';
    
    // Perform search
    await page.goto('/search');
    await page.fill('[data-testid="search-input"]', query);
    await page.click('[data-testid="search-button"]');
    
    // Verify cache entry with metadata
    const { data: cacheEntry } = await supabase
      .from('api_cache')
      .select('*')
      .eq('key', query)
      .single();
    
    expect(cacheEntry.metadata).toBeTruthy();
    expect(cacheEntry.metadata.sources).toBeInstanceOf(Array);
    expect(cacheEntry.metadata.query).toBe(query);
  });
}); 