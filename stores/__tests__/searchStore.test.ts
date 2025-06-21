import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSearchStore } from '@/stores/searchStore';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock API responses
const mockCompaniesPage1 = [
  { id: '1', name: 'Company A' },
  { id: '2', name: 'Company B' },
];
const mockCompaniesPage2 = [
  { id: '3', name: 'Company C' },
  { id: '4', name: 'Company D' },
];

const server = setupServer(
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const data = page === '1' ? mockCompaniesPage1 : mockCompaniesPage2;

    return HttpResponse.json({
      success: true,
      data: data,
      metadata: {
        totalCount: 20, // Allows for 2 pages with a pageSize of 10
        page: parseInt(page, 10),
        limit: 10,
        cacheKey: 'test-cache-key',
      },
    });
  })
);

describe('searchStore', () => {
  beforeEach(() => {
    server.listen();
    useSearchStore.getState().reset();
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
  });

  it('should have a correct initial state', () => {
    const state = useSearchStore.getState();
    expect(state.query).toBe('');
    expect(state.results).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.pagination.currentPage).toBe(1);
  });

  it('should fetch results and handle pagination correctly', async () => {
    // 1. Initial search for page 1
    useSearchStore.getState().setQuery('test');
    await useSearchStore.getState().fetchSearchResults();

    let state = useSearchStore.getState();
    expect(state.results).toEqual(mockCompaniesPage1);
    expect(state.pagination.totalCount).toBe(20);
    expect(state.pagination.currentPage).toBe(1);
    expect(state.isLoading).toBe(false);

    // 2. Go to the next page
    await useSearchStore.getState().goToNextPage();

    state = useSearchStore.getState();
    expect(state.pagination.currentPage).toBe(2);
    expect(state.isFetchingPage).toBe(false); // Fetch is completed by goToNextPage
    expect(state.results).toEqual(mockCompaniesPage2); // Check for page 2 data
  });

  it('should reset to page 1 when filters change', () => {
    // Manually set the state for the test setup
    useSearchStore.setState({ pagination: { ...useSearchStore.getState().pagination, currentPage: 3 } });
    expect(useSearchStore.getState().pagination.currentPage).toBe(3);

    // Change filters, which should reset the current page
    useSearchStore.getState().setFilters({ industry: 'Tech' });
    expect(useSearchStore.getState().pagination.currentPage).toBe(1);
  });
});
