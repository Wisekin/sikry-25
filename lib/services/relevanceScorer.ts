import { createClient } from '@/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';
import OpenAI from 'openai';

interface ScoringParams {
  query: string;
  content: string;
  url?: string;
  title?: string;
  metadata?: Record<string, any>;
  userId: string;
}

interface RelevanceScore {
  overall: number;
  semantic: number;
  keyword: number;
  contextual: number;
  freshness: number;
  authority: number;
  breakdown: {
    semanticFactors: {
      topicAlignment: number;
      conceptSimilarity: number;
      intentMatch: number;
    };
    keywordFactors: {
      exactMatches: number;
      partialMatches: number;
      synonymMatches: number;
      density: number;
    };
    contextualFactors: {
      domainRelevance: number;
      contentQuality: number;
      structureScore: number;
    };
    freshnessFactors: {
      publishDate: number;
      lastModified: number;
      contentAge: number;
    };
    authorityFactors: {
      domainAuthority: number;
      pageRank: number;
      backlinks: number;
    };
  };
  confidence: number;
  explanation: string;
}

interface BatchScoringParams {
  query: string;
  items: Array<{
    id: string;
    content: string;
    url?: string;
    title?: string;
    metadata?: Record<string, any>;
  }>;
  userId: string;
}

interface ScoringWeights {
  semantic: number;
  keyword: number;
  contextual: number;
  freshness: number;
  authority: number;
}

export class RelevanceScorerService {
  private supabase = createClient();
  private openai: OpenAI;
  private defaultWeights: ScoringWeights = {
    semantic: 0.35,
    keyword: 0.25,
    contextual: 0.20,
    freshness: 0.10,
    authority: 0.10
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async scoreRelevance(params: ScoringParams, weights?: ScoringWeights): Promise<RelevanceScore> {
    try {
      Logger.logInfo('Starting relevance scoring', {
        query: params.query,
        url: params.url,
        userId: params.userId,
        category: 'scoring'
      });

      const scoringWeights = weights || this.defaultWeights;
      
      // Calculate individual scores
      const semanticScore = await this.calculateSemanticScore(params);
      const keywordScore = this.calculateKeywordScore(params);
      const contextualScore = this.calculateContextualScore(params);
      const freshnessScore = this.calculateFreshnessScore(params);
      const authorityScore = await this.calculateAuthorityScore(params);

      // Calculate weighted overall score
      const overall = (
        semanticScore.score * scoringWeights.semantic +
        keywordScore.score * scoringWeights.keyword +
        contextualScore.score * scoringWeights.contextual +
        freshnessScore.score * scoringWeights.freshness +
        authorityScore.score * scoringWeights.authority
      );

      // Calculate confidence based on score consistency
      const scores = [semanticScore.score, keywordScore.score, contextualScore.score, freshnessScore.score, authorityScore.score];
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((acc, score) => acc + Math.pow(score - avgScore, 2), 0) / scores.length;
      const confidence = Math.max(0, 1 - variance);

      const result: RelevanceScore = {
        overall: Math.round(overall * 100) / 100,
        semantic: Math.round(semanticScore.score * 100) / 100,
        keyword: Math.round(keywordScore.score * 100) / 100,
        contextual: Math.round(contextualScore.score * 100) / 100,
        freshness: Math.round(freshnessScore.score * 100) / 100,
        authority: Math.round(authorityScore.score * 100) / 100,
        breakdown: {
          semanticFactors: semanticScore.breakdown,
          keywordFactors: keywordScore.breakdown,
          contextualFactors: contextualScore.breakdown,
          freshnessFactors: freshnessScore.breakdown,
          authorityFactors: authorityScore.breakdown
        },
        confidence: Math.round(confidence * 100) / 100,
        explanation: this.generateExplanation({
          overall,
          semantic: semanticScore.score,
          keyword: keywordScore.score,
          contextual: contextualScore.score,
          freshness: freshnessScore.score,
          authority: authorityScore.score,
          query: params.query,
          url: params.url
        })
      };

      // Store scoring result for analytics
      await this.storeScoringResult({
        query: params.query,
        url: params.url || '',
        score: result,
        userId: params.userId
      });

      return result;

    } catch (error) {
      Logger.logError('Relevance scoring failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: params.query,
        url: params.url,
        category: 'scoring'
      });
      throw error;
    }
  }

  async batchScore(params: BatchScoringParams, weights?: ScoringWeights): Promise<Array<{ id: string; score: RelevanceScore }>> {
    try {
      Logger.logInfo('Starting batch relevance scoring', {
        query: params.query,
        itemCount: params.items.length,
        userId: params.userId,
        category: 'scoring'
      });

      const results = await Promise.all(
        params.items.map(async (item) => {
          const score = await this.scoreRelevance({
            query: params.query,
            content: item.content,
            url: item.url,
            title: item.title,
            metadata: item.metadata,
            userId: params.userId
          }, weights);

          return {
            id: item.id,
            score
          };
        })
      );

      // Sort by overall score descending
      results.sort((a, b) => b.score.overall - a.score.overall);

      return results;

    } catch (error) {
      Logger.logError('Batch relevance scoring failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: params.query,
        category: 'scoring'
      });
      throw error;
    }
  }

  private async calculateSemanticScore(params: ScoringParams): Promise<{
    score: number;
    breakdown: {
      topicAlignment: number;
      conceptSimilarity: number;
      intentMatch: number;
    };
  }> {
    try {
      // Use AI to analyze semantic similarity
      const prompt = `
Analyze the semantic relevance between the search query and content.

Query: "${params.query}"
Content: "${params.content.substring(0, 1000)}..."
Title: "${params.title || 'N/A'}"

Rate the following aspects on a scale of 0-1:
1. Topic Alignment: How well does the content match the main topic of the query?
2. Concept Similarity: How similar are the concepts discussed?
3. Intent Match: How well does the content satisfy the search intent?

Return a JSON object with scores:
{
  "topicAlignment": 0.0-1.0,
  "conceptSimilarity": 0.0-1.0,
  "intentMatch": 0.0-1.0
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const breakdown = JSON.parse(content);
      const score = (breakdown.topicAlignment + breakdown.conceptSimilarity + breakdown.intentMatch) / 3;

      return {
        score: Math.max(0, Math.min(1, score)),
        breakdown: {
          topicAlignment: Math.max(0, Math.min(1, breakdown.topicAlignment)),
          conceptSimilarity: Math.max(0, Math.min(1, breakdown.conceptSimilarity)),
          intentMatch: Math.max(0, Math.min(1, breakdown.intentMatch))
        }
      };

    } catch (error) {
      Logger.logError('Semantic scoring failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'scoring'
      });
      
      // Fallback to basic text similarity
      const similarity = this.calculateTextSimilarity(params.query, params.content);
      return {
        score: similarity,
        breakdown: {
          topicAlignment: similarity,
          conceptSimilarity: similarity * 0.8,
          intentMatch: similarity * 0.9
        }
      };
    }
  }

  private calculateKeywordScore(params: ScoringParams): {
    score: number;
    breakdown: {
      exactMatches: number;
      partialMatches: number;
      synonymMatches: number;
      density: number;
    };
  } {
    const queryTerms = params.query.toLowerCase().split(/\s+/);
    const content = params.content.toLowerCase();
    const title = (params.title || '').toLowerCase();
    const combinedText = `${title} ${content}`;
    
    let exactMatches = 0;
    let partialMatches = 0;
    const totalTerms = queryTerms.length;
    
    queryTerms.forEach(term => {
      if (combinedText.includes(term)) {
        exactMatches++;
      } else {
        // Check for partial matches (substring)
        const partialMatch = queryTerms.some(t => 
          t.includes(term) || term.includes(t)
        );
        if (partialMatch) {
          partialMatches++;
        }
      }
    });
    
    // Calculate keyword density
    const wordCount = combinedText.split(/\s+/).length;
    const keywordOccurrences = queryTerms.reduce((count, term) => {
      const matches = (combinedText.match(new RegExp(term, 'g')) || []).length;
      return count + matches;
    }, 0);
    
    const density = wordCount > 0 ? keywordOccurrences / wordCount : 0;
    
    // Simple synonym matching (could be enhanced with a thesaurus)
    const synonymMatches = this.findSynonymMatches(queryTerms, combinedText);
    
    const breakdown = {
      exactMatches: exactMatches / totalTerms,
      partialMatches: partialMatches / totalTerms,
      synonymMatches: synonymMatches / totalTerms,
      density: Math.min(1, density * 10) // Scale density
    };
    
    const score = (
      breakdown.exactMatches * 0.4 +
      breakdown.partialMatches * 0.2 +
      breakdown.synonymMatches * 0.2 +
      breakdown.density * 0.2
    );
    
    return {
      score: Math.max(0, Math.min(1, score)),
      breakdown
    };
  }

  private calculateContextualScore(params: ScoringParams): {
    score: number;
    breakdown: {
      domainRelevance: number;
      contentQuality: number;
      structureScore: number;
    };
  } {
    const url = params.url || '';
    const content = params.content;
    const title = params.title || '';
    
    // Domain relevance based on URL
    const domainRelevance = this.calculateDomainRelevance(url, params.query);
    
    // Content quality indicators
    const contentQuality = this.calculateContentQuality(content, title);
    
    // Structure score based on content organization
    const structureScore = this.calculateStructureScore(content, title);
    
    const breakdown = {
      domainRelevance,
      contentQuality,
      structureScore
    };
    
    const score = (domainRelevance + contentQuality + structureScore) / 3;
    
    return {
      score: Math.max(0, Math.min(1, score)),
      breakdown
    };
  }

  private calculateFreshnessScore(params: ScoringParams): {
    score: number;
    breakdown: {
      publishDate: number;
      lastModified: number;
      contentAge: number;
    };
  } {
    const metadata = params.metadata || {};
    const now = new Date();
    
    // Extract dates from metadata or content
    const publishDate = metadata.publishDate || metadata.datePublished;
    const lastModified = metadata.lastModified || metadata.dateModified;
    
    let publishScore = 0.5; // Default neutral score
    let modifiedScore = 0.5;
    let ageScore = 0.5;
    
    if (publishDate) {
      const pubDate = new Date(publishDate);
      const daysSincePublish = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
      publishScore = Math.max(0, 1 - (daysSincePublish / 365)); // Decay over a year
    }
    
    if (lastModified) {
      const modDate = new Date(lastModified);
      const daysSinceModified = (now.getTime() - modDate.getTime()) / (1000 * 60 * 60 * 24);
      modifiedScore = Math.max(0, 1 - (daysSinceModified / 180)); // Decay over 6 months
    }
    
    // Content age estimation based on references to recent events
    ageScore = this.estimateContentAge(params.content);
    
    const breakdown = {
      publishDate: publishScore,
      lastModified: modifiedScore,
      contentAge: ageScore
    };
    
    const score = (publishScore + modifiedScore + ageScore) / 3;
    
    return {
      score: Math.max(0, Math.min(1, score)),
      breakdown
    };
  }

  private async calculateAuthorityScore(params: ScoringParams): Promise<{
    score: number;
    breakdown: {
      domainAuthority: number;
      pageRank: number;
      backlinks: number;
    };
  }> {
    const url = params.url || '';
    
    // Domain authority estimation
    const domainAuthority = this.estimateDomainAuthority(url);
    
    // PageRank estimation (simplified)
    const pageRank = this.estimatePageRank(url);
    
    // Backlinks estimation
    const backlinks = this.estimateBacklinks(url);
    
    const breakdown = {
      domainAuthority,
      pageRank,
      backlinks
    };
    
    const score = (domainAuthority + pageRank + backlinks) / 3;
    
    return {
      score: Math.max(0, Math.min(1, score)),
      breakdown
    };
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private findSynonymMatches(queryTerms: string[], content: string): number {
    // Simple synonym mapping - could be enhanced with a proper thesaurus
    const synonyms: Record<string, string[]> = {
      'company': ['business', 'corporation', 'firm', 'enterprise'],
      'search': ['find', 'look', 'seek', 'discover'],
      'data': ['information', 'details', 'facts', 'statistics']
    };
    
    let matches = 0;
    queryTerms.forEach(term => {
      const termSynonyms = synonyms[term] || [];
      termSynonyms.forEach(synonym => {
        if (content.includes(synonym)) {
          matches++;
        }
      });
    });
    
    return matches;
  }

  private calculateDomainRelevance(url: string, query: string): number {
    if (!url) return 0.5;
    
    try {
      const domain = new URL(url).hostname.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Check if query terms appear in domain
      const queryTerms = queryLower.split(/\s+/);
      const domainMatches = queryTerms.filter(term => domain.includes(term)).length;
      
      // Bonus for authoritative domains
      const authoritativeDomains = ['wikipedia.org', 'gov', 'edu', 'org'];
      const isAuthoritative = authoritativeDomains.some(auth => domain.includes(auth));
      
      let score = domainMatches / queryTerms.length;
      if (isAuthoritative) score += 0.2;
      
      return Math.max(0, Math.min(1, score));
    } catch {
      return 0.5;
    }
  }

  private calculateContentQuality(content: string, title: string): number {
    const wordCount = content.split(/\s+/).length;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    // Quality indicators
    let score = 0.5;
    
    // Length indicators
    if (wordCount > 300) score += 0.1;
    if (wordCount > 1000) score += 0.1;
    
    // Structure indicators
    if (avgWordsPerSentence > 10 && avgWordsPerSentence < 25) score += 0.1;
    if (title && title.length > 10) score += 0.1;
    
    // Content richness
    if (content.includes('http')) score += 0.05; // Has links
    if (/\d+/.test(content)) score += 0.05; // Has numbers/data
    
    return Math.max(0, Math.min(1, score));
  }

  private calculateStructureScore(content: string, title: string): number {
    let score = 0.5;
    
    // Has title
    if (title && title.length > 0) score += 0.2;
    
    // Has paragraphs
    const paragraphs = content.split(/\n\s*\n/).length;
    if (paragraphs > 2) score += 0.1;
    
    // Has lists or structured content
    if (content.includes('•') || content.includes('-') || content.includes('1.')) {
      score += 0.1;
    }
    
    // Has headings (simple detection)
    if (/^[A-Z][^.]*:/.test(content)) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  private estimateContentAge(content: string): number {
    const currentYear = new Date().getFullYear();
    const yearMatches = content.match(/\b(19|20)\d{2}\b/g) || [];
    
    if (yearMatches.length === 0) return 0.5;
    
    const years = yearMatches.map(y => parseInt(y));
    const mostRecentYear = Math.max(...years);
    const yearsDiff = currentYear - mostRecentYear;
    
    return Math.max(0, 1 - (yearsDiff / 5)); // Decay over 5 years
  }

  private estimateDomainAuthority(url: string): number {
    if (!url) return 0.5;
    
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // High authority domains
      const highAuthority = ['wikipedia.org', 'github.com', 'stackoverflow.com', 'medium.com'];
      if (highAuthority.some(auth => domain.includes(auth))) return 0.9;
      
      // Government and educational domains
      if (domain.endsWith('.gov') || domain.endsWith('.edu')) return 0.8;
      
      // Organization domains
      if (domain.endsWith('.org')) return 0.7;
      
      // Commercial domains
      if (domain.endsWith('.com')) return 0.6;
      
      return 0.5;
    } catch {
      return 0.5;
    }
  }

  private estimatePageRank(url: string): number {
    // Simplified PageRank estimation based on URL structure
    if (!url) return 0.5;
    
    try {
      const urlObj = new URL(url);
      const pathDepth = urlObj.pathname.split('/').length - 1;
      
      // Shorter paths generally have higher PageRank
      let score = Math.max(0.3, 1 - (pathDepth * 0.1));
      
      // Root pages get bonus
      if (urlObj.pathname === '/' || urlObj.pathname === '') score += 0.2;
      
      return Math.max(0, Math.min(1, score));
    } catch {
      return 0.5;
    }
  }

  private estimateBacklinks(url: string): number {
    // Simplified backlink estimation
    if (!url) return 0.5;
    
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Popular domains likely have more backlinks
      const popularDomains = ['wikipedia.org', 'github.com', 'stackoverflow.com'];
      if (popularDomains.some(pop => domain.includes(pop))) return 0.9;
      
      // Domain age estimation (simplified)
      const tld = domain.split('.').pop() || '';
      if (['com', 'org', 'net'].includes(tld)) return 0.6;
      
      return 0.5;
    } catch {
      return 0.5;
    }
  }

  private generateExplanation(scores: {
    overall: number;
    semantic: number;
    keyword: number;
    contextual: number;
    freshness: number;
    authority: number;
    query: string;
    url?: string;
  }): string {
    const { overall, semantic, keyword, contextual, freshness, authority, query, url } = scores;
    
    let explanation = `Relevance analysis for query "${query}":\n\n`;
    
    // Overall assessment
    if (overall >= 0.8) {
      explanation += "🟢 Highly relevant content that strongly matches the search intent.\n";
    } else if (overall >= 0.6) {
      explanation += "🟡 Moderately relevant content with good alignment to the query.\n";
    } else if (overall >= 0.4) {
      explanation += "🟠 Somewhat relevant content with partial matches.\n";
    } else {
      explanation += "🔴 Low relevance with limited connection to the query.\n";
    }
    
    explanation += "\nScore breakdown:\n";
    explanation += `• Semantic relevance: ${(semantic * 100).toFixed(1)}% - ${semantic >= 0.7 ? 'Strong' : semantic >= 0.5 ? 'Moderate' : 'Weak'} conceptual alignment\n`;
    explanation += `• Keyword matching: ${(keyword * 100).toFixed(1)}% - ${keyword >= 0.7 ? 'Excellent' : keyword >= 0.5 ? 'Good' : 'Limited'} keyword coverage\n`;
    explanation += `• Contextual fit: ${(contextual * 100).toFixed(1)}% - ${contextual >= 0.7 ? 'High' : contextual >= 0.5 ? 'Medium' : 'Low'} quality content\n`;
    explanation += `• Content freshness: ${(freshness * 100).toFixed(1)}% - ${freshness >= 0.7 ? 'Recent' : freshness >= 0.5 ? 'Moderate' : 'Dated'} information\n`;
    explanation += `• Source authority: ${(authority * 100).toFixed(1)}% - ${authority >= 0.7 ? 'Authoritative' : authority >= 0.5 ? 'Reliable' : 'Unknown'} source\n`;
    
    if (url) {
      explanation += `\nSource: ${url}`;
    }
    
    return explanation;
  }

  private async storeScoringResult(params: {
    query: string;
    url: string;
    score: RelevanceScore;
    userId: string;
  }): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('relevance_scores')
        .insert({
          query: params.query,
          url: params.url,
          overall_score: params.score.overall,
          semantic_score: params.score.semantic,
          keyword_score: params.score.keyword,
          contextual_score: params.score.contextual,
          freshness_score: params.score.freshness,
          authority_score: params.score.authority,
          confidence: params.score.confidence,
          breakdown: params.score.breakdown,
          explanation: params.score.explanation,
          user_id: params.userId,
          created_at: new Date().toISOString()
        });

      if (error) {
        Logger.logError('Store scoring result failed', {
          error: error.message,
          query: params.query,
          category: 'scoring'
        });
      }

    } catch (error) {
      Logger.logError('Store scoring result failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: params.query,
        category: 'scoring'
      });
    }
  }

  async getScoringHistory(params: {
    userId: string;
    query?: string;
    page: number;
    limit: number;
  }): Promise<{ data: any[]; total: number }> {
    try {
      let query = this.supabase
        .from('relevance_scores')
        .select('*', { count: 'exact' })
        .eq('user_id', params.userId);

      if (params.query) {
        query = query.ilike('query', `%${params.query}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((params.page - 1) * params.limit, params.page * params.limit - 1);

      if (error) {
        throw new Error(`Failed to get scoring history: ${error.message}`);
      }

      return {
        data: data || [],
        total: count || 0
      };

    } catch (error) {
      Logger.logError('Get scoring history failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: params.userId,
        category: 'scoring'
      });
      throw error;
    }
  }
}