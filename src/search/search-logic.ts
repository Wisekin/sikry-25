import type { SearchResult } from '@/src/types/search';

/**
 * Merges and ranks search results from multiple sources.
 * - Deduplicates based on domain, falling back to name + location.
 * - Merges data, prioritizing sources: internal > companies_house > wikidata.
 * - Ranks results based on source, data completeness, and query match.
 */
export async function mergeAndRankResults(results: SearchResult[], parsedQuery: any) {
  const sourcePriority: Record<string, number> = {
    'internal': 3,
    'companies_house': 2,
    'wikidata': 1,
    'default': 0
  };

  const merged = new Map<string, SearchResult>();
  let duplicatesFound = 0;

  // Sort by source priority before merging to ensure higher-priority sources are processed first
  results.sort((a, b) => (sourcePriority[b.source || 'default'] || 0) - (sourcePriority[a.source || 'default'] || 0));

  for (const result of results) {
    // Normalize domain to avoid www. subdomain issues
    // FIX: Ensure result.domain is a valid URL by prepending 'https://' if needed
    let domain = null;
    if (result.domain) {
      try {
        // If domain does not start with http, prepend https://
        const urlStr = result.domain.startsWith('http') ? result.domain : `https://${result.domain}`;
        domain = new URL(urlStr).hostname.replace(/^www\./, '');
      } catch (e) {
        // If domain is invalid, fallback to null
        domain = null;
      }
    }
    const key = domain || `${result.name?.toLowerCase() || ''}|${result.location_text?.toLowerCase() || ''}`;

    if (merged.has(key)) {
      duplicatesFound++;
      // Merge properties from lower-priority source if they don't exist in the higher-priority one
      const existing = merged.get(key)!;
      for (const prop in result) {
        if (result[prop as keyof SearchResult] && !existing[prop as keyof SearchResult]) {
          (existing[prop as keyof SearchResult] as any) = result[prop as keyof SearchResult];
        }
      }
    } else {
      merged.set(key, { ...result });
    }
  }

  // --- Ranking Logic ---
  const rankedResults = Array.from(merged.values()).map(result => {
    let score = 0;
    // 1. Source Priority Score
    score += (sourcePriority[result.source || 'default'] || 0) * 10;

    // 2. Data Completeness Score
    if (result.description) score += 5;
    if (result.industry) score += 3;
    if (result.location_text) score += 2;
    if (result.domain) score += 5;

    // 3. Query Match Score
    if (parsedQuery?.keywords) {
      const queryTerms = [...parsedQuery.keywords, ...(parsedQuery.exactPhrases || [])];
      for (const term of queryTerms) {
        if (result.name?.toLowerCase().includes(term.toLowerCase())) score += 10;
        if (result.description?.toLowerCase().includes(term.toLowerCase())) score += 5;
      }
    }
    
    // Assign score to a temporary property for sorting
    return { ...result, relevanceScore: score };
  });

  // Sort by relevance score, descending
  rankedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    mergedResults: rankedResults.map(({ relevanceScore, ...rest }) => rest), // Remove score before returning
    mergeMetadata: { duplicatesFound, finalCount: merged.size }
  };
}
