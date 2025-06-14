import type { SearchAdapter, SearchAdapterResult } from './adapter';
import type { ParsedQuery } from '../queryParser';

// MOCK implementation: Replace with real API logic
export const companiesHouseAdapter: SearchAdapter = {
  id: 'companies_house',
  label: 'Companies House',
  async search(query: ParsedQuery): Promise<SearchAdapterResult[]> {
    // In real use, call the Companies House API here
    // For now, return mock data based on query
    return [
      {
        name: 'Mock Ltd',
        description: `A mock company for '${query.raw}'`,
        industry: query.industry || 'Unknown',
        location: query.location || 'UK',
        size: query.size || '1-10',
        url: 'https://www.gov.uk/government/organisations/companies-house',
        confidence: 0.9,
      },
    ];
  },
};
