import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MOCK_USER_ID = 'c3d4e5f6-a7b8-9012-3456-7890abcdef12';
const MOCK_ORG_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

test.describe('Natural Language Search History', () => {
  // This test is now much faster as it hits the API directly.
  test.beforeEach(async () => {
    // Clear previous history for this user to ensure a clean slate for each test
    await supabase
      .from('search_history')
      .delete()
      .eq('user_id', MOCK_USER_ID);
  });

  test('NLS_HIST_001: Verify search history recording', async ({ request }) => {
    const query = 'tech startups in London';
    
    // Perform a search via API
    const response = await request.get(`/api/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'x-user-id': MOCK_USER_ID,
        'x-organization-id': MOCK_ORG_ID,
        'x-user-plan': 'starter' // or any valid plan
      }
    });
    expect(response.ok()).toBeTruthy();

    // Verify search history entry
    const { data: history, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', MOCK_USER_ID)
      .eq('search_query', query)
      .single();

    expect(error).toBeNull();
    expect(history).toBeTruthy();
    expect(history.search_query).toBe(query);
    expect(history.results_count).toBeGreaterThanOrEqual(0);
    expect(history.execution_time_ms).toBeGreaterThan(0);
  });

  test('NLS_HIST_002: Verify source information in history', async ({ request }) => {
    // This query is known to return results from Companies House
    const query = 'BBC'; 
    
    // Perform search
    const response = await request.get(`/api/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'x-user-id': MOCK_USER_ID,
        'x-organization-id': MOCK_ORG_ID,
        'x-user-plan': 'starter'
      }
    });
    expect(response.ok()).toBeTruthy();
    
    // Verify search history entry with sources
    const { data: history, error } = await supabase
      .from('search_history')
      .select('sources')
      .eq('user_id', MOCK_USER_ID)
      .eq('search_query', query)
      .single();
    
    expect(error).toBeNull();
    expect(history).not.toBeNull();

    if (history) {
      expect(history.sources).toBeInstanceOf(Array);
      
      // Verify sources array contains expected sources. 
      // The API should return 'companies_house' for this query.
      // It may or may not return 'internal' depending on the test DB state.
      expect(history.sources.length).toBeGreaterThan(0);
      expect(history.sources).toContain('companies_house');
    }
  });
}); 