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

  // --- TEMPORARY FIX: Bypassing deduplication ---
  // The original deduplication logic was too strict, reducing ~100 results to 2.
  // This is temporarily bypassed to allow for pagination testing.
  // A more sophisticated merging strategy is needed long-term.
  results.forEach((result, index) => {
    // Use a unique key for each result to prevent merging
    const uniqueKey = `${result.source}-${result.name}-${index}`;
    merged.set(uniqueKey, result);
  });
  // --- END TEMPORARY FIX ---

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
