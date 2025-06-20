import type { SearchAdapter, SearchAdapterResult } from './adapter';
import type { ParsedQuery } from '../queryParser';

// LIVE implementation
export const companiesHouseAdapter: SearchAdapter = {
  id: 'companies_house',
  label: 'Companies House',
  async search(query: ParsedQuery): Promise<SearchAdapterResult[]> {
    const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
    if (!apiKey) {
      console.warn('COMPANIES_HOUSE_API_KEY is not set. Skipping Companies House search.');
      return [];
    }

    const searchQuery = [...query.keywords, ...query.exactPhrases].join(' ');
    if (!searchQuery) {
      return [];
    }

    const endpoint = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(searchQuery)}&items_per_page=10`;

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
        return [];
      }

      const data = await response.json();

      // Map the API response to our internal SearchAdapterResult format
      return (data.items || []).map((item: any) => ({
        name: item.title,
        description: item.snippet || 'No description available.',
        industry: (item.company_type || 'unknown').replace(/-/g, ' '),
        location: `${item.address_snippet || 'Location not specified'}`,
        size: 'Unknown', // This info is not in the search result
        url: `https://find-and-update.company-information.service.gov.uk/company/${item.company_number}`,
        confidence: 0.9, // Confidence is high as it's from an official source
      }));

    } catch (error) {
      console.error('Failed to fetch from Companies House API:', error);
      return [];
    }
  },
};
