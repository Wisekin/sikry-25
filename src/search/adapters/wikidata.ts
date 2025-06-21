import type { SearchAdapter, SearchAdapterResult, SearchAdapterResponse } from './adapter';
import type { ParsedQuery } from '../queryParser';

/**
 * Search adapter for Wikidata.
 * Uses the MediaWiki Action API (`wbsearchentities`) to find entities.
 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
 */
export const wikidataAdapter: SearchAdapter = {
  id: 'wikidata',
  label: 'Wikidata',
  async search(query: ParsedQuery, options?: { limit?: number; page?: number }): Promise<SearchAdapterResponse> {
    const searchQuery = [...query.keywords, ...query.exactPhrases].join(' ');
    if (!searchQuery) {
      return { results: [] };
    }

    // Support pagination via limit and offset (Wikidata API supports limit, but not offset for wbsearchentities)
    const limit = options?.limit || 15;
    // Note: wbsearchentities does not support offset, so true pagination is limited
    const endpoint = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(searchQuery)}&language=en&format=json&limit=${limit}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          // Wikidata is open, no API key needed, but a good practice to set a User-Agent
          'User-Agent': 'Sikry-Search-Agent/1.0 (https://sikry.com)',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Wikidata API error: ${response.status} ${response.statusText}`);
        return { results: [] };
      }

      const data = await response.json();

      if (!data.search) {
        return { results: [] };
      }

      // Map the API response to our internal SearchAdapterResult format
      const results = (data.search || []).map((item: any) => ({
        name: item.label || 'No name',
        description: item.description || 'No description available.',
        industry: 'General Information',
        location_text: 'Global',
        domain: undefined, // Explicitly set domain as undefined
        url: item.url ? `https:${item.url}` : '#',
        confidence: 0.8, // Align with test expectation
        source: 'wikidata',
      }));

      // Wikidata does not provide a total count, so we don't return it.
      return { results };

    } catch (error) {
      console.error('Failed to fetch from Wikidata API:', error);
      return { results: [] };
    }
  },
};
