import type { SearchAdapter, SearchAdapterResult } from './adapter';
import type { ParsedQuery } from '../queryParser';

/**
 * Search adapter for Wikidata.
 * Uses the MediaWiki Action API (`wbsearchentities`) to find entities.
 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
 */
export const wikidataAdapter: SearchAdapter = {
  id: 'wikidata',
  label: 'Wikidata',
  async search(query: ParsedQuery): Promise<SearchAdapterResult[]> {
    const searchQuery = [...query.keywords, ...query.exactPhrases].join(' ');
    if (!searchQuery) {
      return [];
    }

    // Wikidata API endpoint for searching entities
        const endpoint = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(searchQuery)}&language=en&format=json&limit=50`;

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
        return [];
      }

      const data = await response.json();

      if (!data.search) {
        return [];
      }

      // Map the API response to our internal SearchAdapterResult format
      return (data.search || []).map((item: any) => ({
        name: item.label || 'No name',
        description: item.description || 'No description available.',
        industry: 'General Information',
        location_text: 'Global',
        domain: undefined, // Explicitly set domain as undefined
        url: item.url ? `https:${item.url}` : '#',
        confidence: 0.8, // Align with test expectation
        source: 'wikidata',
      }));

    } catch (error) {
      console.error('Failed to fetch from Wikidata API:', error);
      return [];
    }
  },
};
