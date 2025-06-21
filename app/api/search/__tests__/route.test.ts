import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '../route'; // Adjust path as needed
import { NextRequest } from 'next/server';

// Mock internal DB results
const mockInternalResults = [
  { id: 'db-1', name: 'Internal Corp', source: 'internal_db' },
];

// Mock dependencies
vi.mock('@/src/search/queryParser', () => ({
  parseQuery: vi.fn().mockResolvedValue(null), // Simulate AI failure
}));

vi.mock('@/src/search/adapters/companiesHouse', () => ({
  companiesHouseAdapter: { search: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/src/search/adapters/wikidata', () => ({
  wikidataAdapter: { search: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/lib/redis', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
  generateCacheKey: vi.fn().mockReturnValue('mock-cache-key'),
}));

vi.mock('@/src/utils/cache/rateLimiter', () => ({
  DbRateLimiter: vi.fn(() => ({
    isAllowed: vi.fn().mockResolvedValue({ 
      allowed: true, 
      userId: 'test-user', 
      organizationId: 'test-org', 
      plan: 'premium' 
    }),
  })),
}));

// This is a deep mock for the Supabase client chain
vi.mock('@/src/utils/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockResolvedValue({ data: mockInternalResults, error: null }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }), // For search_history
  })),
}));

describe('GET /api/search', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return raw results from internal DB when AI parsing fails', async () => {
    // 1. Create a mock request
    const req = new NextRequest('http://localhost/api/search?q=test');

    // 2. Call the endpoint handler
    const response = await GET(req);
    const body = await response.json();

    // 3. Assert the response
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // 4. Verify that the data is the raw internal DB result
    expect(body.data).toEqual(mockInternalResults);

    // 5. Verify the metadata note indicates a fallback was used
    expect(body.metadata.mergeDetails.note).toBe('AI parsing failed; returning unranked results.');
  });
});
