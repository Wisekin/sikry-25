import { mergeAndRankResults } from '@/src/search/search-logic';
import type { SearchResult } from '@/src/types/search';

// Mock data for testing
const mockResults: SearchResult[] = [
  // Duplicate by domain (example.com)
  {
    id: 'ch-1',
    name: 'Example Corp',
    domain: 'https://www.example.com',
    description: 'From Companies House.',
    source: 'companies_house',
    location_text: 'London',
  },
  {
    id: 'wd-1',
    name: 'Example Company',
    domain: 'http://example.com',
    industry: 'Technology', // This should be merged
    source: 'wikidata',
    location_text: 'London',
  },
  // Duplicate by name/location
  {
    id: 'internal-1',
    name: 'Unique Biz',
    location_text: 'New York',
    source: 'internal',
    description: 'Internal data is best.',
  },
  {
    id: 'ch-2',
    name: 'Unique Biz',
    location_text: 'New York',
    source: 'companies_house',
    industry: 'Finance', // Should be merged
  },
  // A unique result
  {
    id: 'wd-2',
    name: 'Another One',
    location_text: 'Paris',
    source: 'wikidata',
  },
];

const mockParsedQuery = {
  keywords: ['example', 'biz'],
  exactPhrases: [],
};

describe('mergeAndRankResults', () => {
  it('should correctly deduplicate results based on domain and name/location', async () => {
    const { mergedResults } = await mergeAndRankResults(mockResults, mockParsedQuery);
    expect(mergedResults).toHaveLength(3);
  });

  it('should merge properties from lower-priority sources into higher-priority ones', async () => {
    const { mergedResults } = await mergeAndRankResults(mockResults, mockParsedQuery);

    const exampleResult = mergedResults.find(r => r.name.includes('Example'));
    expect(exampleResult).toBeDefined();
    expect(exampleResult?.source).toBe('companies_house'); // Higher priority source
    expect(exampleResult?.industry).toBe('Technology'); // Merged from wikidata

    const uniqueBizResult = mergedResults.find(r => r.name.includes('Unique Biz'));
    expect(uniqueBizResult).toBeDefined();
    expect(uniqueBizResult?.source).toBe('internal'); // Higher priority source
    expect(uniqueBizResult?.industry).toBe('Finance'); // Merged from companies_house
  });

  it('should rank results based on score (source, completeness, query match)', async () => {
    const { mergedResults } = await mergeAndRankResults(mockResults, mockParsedQuery);

    // Expected ranking order: Unique Biz > Example Corp > Another One
    expect(mergedResults[0].name).toBe('Unique Biz');
    expect(mergedResults[1].name).toBe('Example Corp');
    expect(mergedResults[2].name).toBe('Another One');
  });

  it('should return correct metadata about the merge process', async () => {
    const { mergeMetadata } = await mergeAndRankResults(mockResults, mockParsedQuery);
    expect(mergeMetadata.duplicatesFound).toBe(2);
    expect(mergeMetadata.finalCount).toBe(3);
  });
});
