import { wikidataAdapter } from '@/src/search/adapters/wikidata';
import type { ParsedQuery } from '@/src/search/queryParser';

// Mocking global fetch
global.fetch = jest.fn();

const mockParsedQuery: ParsedQuery = {
  keywords: ['test', 'query'],
  exactPhrases: [],
  excludedKeywords: [],
  filters: {},
};

describe('wikidataAdapter', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should correctly parse a successful response from the Wikidata API', async () => {
    const mockApiResponse = {
      search: [
        {
          id: 'Q123',
          label: 'Test Item',
          description: 'A thing for testing',
          url: '//www.wikidata.org/wiki/Q123',
        },
      ],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const results = await wikidataAdapter.search(mockParsedQuery);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      name: 'Test Item',
      description: 'A thing for testing',
      url: 'https://www.wikidata.org/wiki/Q123',
      source: 'wikidata',
      confidence: 0.8,
      industry: 'General Information',
      location_text: 'Global',
      domain: undefined,
    });
  });

  it('should return an empty array if the API request fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const results = await wikidataAdapter.search(mockParsedQuery);
    expect(results).toEqual([]);
  });

  it('should return an empty array if the API response is empty', async () => {
    const mockApiResponse = { search: [] };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const results = await wikidataAdapter.search(mockParsedQuery);
    expect(results).toEqual([]);
  });
});
