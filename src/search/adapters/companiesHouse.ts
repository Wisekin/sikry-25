import type { SearchAdapter, SearchAdapterResult, SearchAdapterResponse } from './adapter';
import type { ParsedQuery } from '../queryParser';

// LIVE implementation
export const companiesHouseAdapter: SearchAdapter = {
  id: 'companies_house',
  label: 'Companies House',
  async search(query: ParsedQuery, options?: { limit?: number; page?: number }): Promise<SearchAdapterResponse> {
    const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
    if (!apiKey) {
      console.warn('COMPANIES_HOUSE_API_KEY is not set. Skipping Companies House search.');
      return { results: [] };
    }

    const searchQuery = [...query.keywords, ...query.exactPhrases].join(' ');
    if (!searchQuery) {
      return { results: [] };
    }

    const limit = options?.limit || 15;
    const page = options?.page || 1;
    const start_index = (page - 1) * limit;
    const endpoint = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(searchQuery)}&items_per_page=${limit}&start_index=${start_index}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Companies House API error: ${response.status} ${response.statusText}`);
        const errorBody = await response.text();
        console.error('Error Body:', errorBody);
        return { results: [] };
      }

      const data = await response.json();

      // Map the API response to our internal SearchAdapterResult format
      const results = (data.items || []).map((item: any) => ({
        name: item.title,
        description: item.snippet || 'No description available.',
        industry: (item.company_type || 'unknown').replace(/-/g, ' '),
        location: `${item.address_snippet || 'Location not specified'}`,
        size: 'Unknown', // This info is not in the search result
        url: `https://find-and-update.company-information.service.gov.uk/company/${item.company_number}`,
        confidence: 0.9, // Confidence is high as it's from an official source
      }));

      return {
        results,
        totalCount: data.total_results || 0,
      };

    } catch (error) {
      console.error('Failed to fetch from Companies House API:', error);
      return { results: [] };
    }
  },
};
