import { createClient } from '@/src/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';
import OpenAI from 'openai';

interface Template {
  id: string;
  name: string;
  description: string;
  pattern: TemplatePattern;
  selectors: TemplateSelectors;
  metadata: TemplateMetadata;
  confidence: number;
  usage_count: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

interface TemplatePattern {
  url_patterns: string[];
  content_patterns: string[];
  structure_patterns: {
    required_elements: string[];
    optional_elements: string[];
    layout_indicators: string[];
  };
  data_patterns: {
    field_types: Record<string, string>;
    validation_rules: Record<string, any>;
    extraction_hints: Record<string, string>;
  };
}

interface TemplateSelectors {
  primary: Record<string, string>;
  fallback: Record<string, string[]>;
  dynamic: Record<string, {
    generator: string;
    parameters: Record<string, any>;
  }>;
  validation: Record<string, {
    required: boolean;
    format: string;
    constraints: Record<string, any>;
  }>;
}

interface TemplateMetadata {
  category: string;
  tags: string[];
  domain_types: string[];
  complexity: 'simple' | 'medium' | 'complex';
  reliability: number;
  last_tested: string;
  performance_metrics: {
    avg_extraction_time: number;
    success_rate: number;
    error_rate: number;
  };
}

interface MatchingParams {
  url: string;
  html: string;
  content?: string;
  metadata?: Record<string, any>;
  userId: string;
}

interface MatchResult {
  template: Template;
  confidence: number;
  match_factors: {
    url_match: number;
    structure_match: number;
    content_match: number;
    pattern_match: number;
  };
  suggested_selectors: Record<string, string>;
  extraction_preview: Record<string, any>;
  reliability_score: number;
  explanation: string;
}

interface TemplateCreationParams {
  name: string;
  description: string;
  url: string;
  html: string;
  sample_data: Record<string, any>;
  userId: string;
}

interface TemplateOptimizationParams {
  templateId: string;
  feedback: {
    successful_extractions: Array<{
      url: string;
      extracted_data: Record<string, any>;
      timestamp: string;
    }>;
    failed_extractions: Array<{
      url: string;
      error: string;
      timestamp: string;
    }>;
  };
  userId: string;
}

export class TemplateMatcher {
  private supabase = createClient();
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async findMatchingTemplates(params: MatchingParams): Promise<MatchResult[]> {
    try {
      Logger.logInfo('Finding matching templates', {
        url: params.url,
        userId: params.userId,
        category: 'template'
      });

      // Get all available templates
      const templates = await this.getAllTemplates();
      
      // Score each template against the input
      const matches = await Promise.all(
        templates.map(async (template) => {
          const matchScore = await this.calculateTemplateMatch(template, params);
          return matchScore;
        })
      );

      // Filter and sort by confidence
      const validMatches = matches
        .filter(match => match.confidence > 0.3)
        .sort((a, b) => b.confidence - a.confidence);

      // Limit to top 5 matches
      return validMatches.slice(0, 5);

    } catch (error) {
      Logger.logError('Template matching failed', error as Error, {
        url: params.url,
        category: 'template'
      });
      throw error;
    }
  }

  async createTemplate(params: TemplateCreationParams): Promise<Template> {
    try {
      Logger.logInfo('Creating new template', {
        name: params.name,
        url: params.url,
        category: 'template'
        userId: params.userId
      });

      // Analyze the HTML structure and generate patterns
      const analysis = await this.analyzePageStructure({
        url: params.url,
        html: params.html,
        sample_data: params.sample_data
      });

      // Generate selectors using AI
      const selectors = await this.generateSelectors({
        html: params.html,
        sample_data: params.sample_data
      });

      // Create template object
      const template: Omit<Template, 'id' | 'created_at' | 'updated_at'> = {
        name: params.name,
        description: params.description,
        pattern: analysis.pattern,
        selectors: selectors,
        metadata: {
          category: analysis.category,
          tags: analysis.tags,
          domain_types: [this.extractDomainType(params.url)],
          complexity: analysis.complexity,
          reliability: 0.8, // Initial reliability
          last_tested: new Date().toISOString(),
          performance_metrics: {
            avg_extraction_time: 0,
            success_rate: 0,
            error_rate: 0
          }
        },
        confidence: 0.8,
        usage_count: 0,
        success_rate: 0
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('scraper_templates')
        .insert({
          ...template,
          user_id: params.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create template: ${error.message}`);
      }

      return data as Template;

    } catch (error) {
      Logger.logError('Template creation failed', error as Error, {
        name: params.name,
        category: 'template'
      });
      throw error;
    }
  }

  async optimizeTemplate(params: TemplateOptimizationParams): Promise<Template> {
    try {
      Logger.logInfo('Optimizing template', {
        templateId: params.templateId,
        userId: params.userId,
        category: 'template'
      });

      // Get current template
      const template = await this.getTemplate(params.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Analyze feedback data
      const optimization = await this.analyzeFeedback({
        template,
        feedback: params.feedback
      });

      // Update template with optimizations
      const optimizedTemplate = {
        ...template,
        selectors: optimization.improved_selectors,
        pattern: optimization.improved_pattern,
        metadata: {
          ...template.metadata,
          reliability: optimization.new_reliability,
          last_tested: new Date().toISOString(),
          performance_metrics: optimization.performance_metrics
        },
        confidence: optimization.new_confidence,
        success_rate: optimization.success_rate,
        updated_at: new Date().toISOString()
      };

      // Save optimized template
      const { data, error } = await this.supabase
        .from('scraper_templates')
        .update(optimizedTemplate)
        .eq('id', params.templateId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to optimize template: ${error.message}`);
      }

      return data as Template;

    } catch (error) {
      Logger.logError('Template optimization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: params.templateId,
        category: 'template'
      });
      throw error;
    }
  }

  async getBestTemplate(params: MatchingParams): Promise<MatchResult | null> {
    try {
      const matches = await this.findMatchingTemplates(params);
      return matches.length > 0 ? matches[0] : null;
    } catch (error) {
      Logger.logError('Get best template failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: params.url,
        category: 'template'
      });
      throw error;
    }
  }

  private async getAllTemplates(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('scraper_templates')
      .select('*')
      .order('confidence', { ascending: false });

    if (error) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }

    return data as Template[];
  }

  private async getTemplate(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('scraper_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get template: ${error.message}`);
    }

    return data as Template;
  }

  private async calculateTemplateMatch(template: Template, params: MatchingParams): Promise<MatchResult> {
    try {
      // Calculate URL match
      const urlMatch = this.calculateUrlMatch(template.pattern.url_patterns, params.url);
      
      // Calculate structure match
      const structureMatch = this.calculateStructureMatch(template.pattern.structure_patterns, params.html);
      
      // Calculate content match
      const contentMatch = this.calculateContentMatch(template.pattern.content_patterns, params.content || '');
      
      // Calculate pattern match
      const patternMatch = this.calculatePatternMatch(template.pattern.data_patterns, params.html);
      
      // Calculate overall confidence
      const confidence = (
        urlMatch * 0.25 +
        structureMatch * 0.35 +
        contentMatch * 0.20 +
        patternMatch * 0.20
      ) * template.metadata.reliability;
      
      // Generate suggested selectors
      const suggestedSelectors = await this.generateSuggestedSelectors(template, params.html);
      
      // Create extraction preview
      const extractionPreview = await this.createExtractionPreview(template, params.html);
      
      // Calculate reliability score
      const reliabilityScore = this.calculateReliabilityScore(template, {
        url_match: urlMatch,
        structure_match: structureMatch,
        content_match: contentMatch,
        pattern_match: patternMatch
      });
      
      return {
        template,
        confidence: Math.round(confidence * 100) / 100,
        match_factors: {
          url_match: Math.round(urlMatch * 100) / 100,
          structure_match: Math.round(structureMatch * 100) / 100,
          content_match: Math.round(contentMatch * 100) / 100,
          pattern_match: Math.round(patternMatch * 100) / 100
        },
        suggested_selectors: suggestedSelectors,
        extraction_preview: extractionPreview,
        reliability_score: Math.round(reliabilityScore * 100) / 100,
        explanation: this.generateMatchExplanation({
          template,
          confidence,
          match_factors: {
            url_match: urlMatch,
            structure_match: structureMatch,
            content_match: contentMatch,
            pattern_match: patternMatch
          }
        })
      };

    } catch (error) {
      Logger.logError('Template match calculation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: template.id,
        category: 'template'
      });
      
      // Return minimal match result on error
      return {
        template,
        confidence: 0,
        match_factors: {
          url_match: 0,
          structure_match: 0,
          content_match: 0,
          pattern_match: 0
        },
        suggested_selectors: {},
        extraction_preview: {},
        reliability_score: 0,
        explanation: 'Error calculating match'
      };
    }
  }

  private calculateUrlMatch(patterns: string[], url: string): number {
    if (patterns.length === 0) return 0.5;
    
    let bestMatch = 0;
    
    patterns.forEach(pattern => {
      try {
        // Convert pattern to regex
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        if (regex.test(url)) {
          bestMatch = Math.max(bestMatch, 1.0);
        } else {
          // Partial domain match
          const urlDomain = new URL(url).hostname;
          const patternDomain = pattern.includes('://') ? new URL(pattern).hostname : pattern;
          if (urlDomain.includes(patternDomain) || patternDomain.includes(urlDomain)) {
            bestMatch = Math.max(bestMatch, 0.7);
          }
        }
      } catch {
        // Fallback to simple string matching
        if (url.toLowerCase().includes(pattern.toLowerCase())) {
          bestMatch = Math.max(bestMatch, 0.6);
        }
      }
    });
    
    return bestMatch;
  }

  private calculateStructureMatch(patterns: any, html: string): number {
    const { required_elements, optional_elements, layout_indicators } = patterns;
    
    let score = 0;
    let totalChecks = 0;
    
    // Check required elements
    required_elements.forEach((selector: string) => {
      totalChecks++;
      if (this.elementExists(html, selector)) {
        score += 1;
      }
    });
    
    // Check optional elements (weighted less)
    optional_elements.forEach((selector: string) => {
      totalChecks += 0.5;
      if (this.elementExists(html, selector)) {
        score += 0.5;
      }
    });
    
    // Check layout indicators
    layout_indicators.forEach((indicator: string) => {
      totalChecks += 0.3;
      if (html.toLowerCase().includes(indicator.toLowerCase())) {
        score += 0.3;
      }
    });
    
    return totalChecks > 0 ? score / totalChecks : 0;
  }

  private calculateContentMatch(patterns: string[], content: string): number {
    if (patterns.length === 0) return 0.5;
    
    let matches = 0;
    const contentLower = content.toLowerCase();
    
    patterns.forEach(pattern => {
      if (contentLower.includes(pattern.toLowerCase())) {
        matches++;
      }
    });
    
    return matches / patterns.length;
  }

  private calculatePatternMatch(patterns: any, html: string): number {
    const { field_types, validation_rules } = patterns;
    
    let score = 0;
    let totalChecks = 0;
    
    // Check field type patterns
    Object.entries(field_types).forEach(([field, type]) => {
      totalChecks++;
      if (this.hasFieldType(html, type as string)) {
        score++;
      }
    });
    
    return totalChecks > 0 ? score / totalChecks : 0.5;
  }

  private elementExists(html: string, selector: string): boolean {
    try {
      // Simple check for common selectors
      if (selector.startsWith('#')) {
        const id = selector.substring(1);
        return html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
      }
      
      if (selector.startsWith('.')) {
        const className = selector.substring(1);
        return html.includes(`class="${className}"`) || html.includes(`class='${className}'`) ||
               html.includes(`class=".*${className}.*"`);
      }
      
      // Tag selector
      return html.includes(`<${selector}`) || html.includes(`<${selector.toLowerCase()}`);
    } catch {
      return false;
    }
  }

  private hasFieldType(html: string, fieldType: string): boolean {
    const typePatterns: Record<string, RegExp[]> = {
      'email': [/type=["']email["']/i, /@[\w.-]+\.[a-z]{2,}/i],
      'phone': [/type=["']tel["']/i, /\+?[\d\s\-\(\)]{10,}/],
      'url': [/type=["']url["']/i, /https?:\/\/[\w.-]+/i],
      'date': [/type=["']date["']/i, /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/],
      'number': [/type=["']number["']/i, /\b\d+\b/],
      'text': [/type=["']text["']/i, /<input[^>]*>/i]
    };
    
    const patterns = typePatterns[fieldType] || [];
    return patterns.some(pattern => pattern.test(html));
  }

  private async generateSuggestedSelectors(template: Template, html: string): Promise<Record<string, string>> {
    try {
      // Use AI to suggest improved selectors
      const prompt = `
Analyze this HTML and suggest CSS selectors for extracting data fields.

Template fields: ${JSON.stringify(Object.keys(template.selectors.primary))}
Current selectors: ${JSON.stringify(template.selectors.primary)}

HTML snippet:
${html.substring(0, 2000)}...

Suggest improved CSS selectors that are more reliable and specific.
Return a JSON object with field names as keys and CSS selectors as values.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return template.selectors.primary;
      }

      return JSON.parse(content);

    } catch (error) {
      Logger.logError('Selector suggestion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'template'
      });
      return template.selectors.primary;
    }
  }

  private async createExtractionPreview(template: Template, html: string): Promise<Record<string, any>> {
    try {
      // Simulate extraction using template selectors
      const preview: Record<string, any> = {};
      
      Object.entries(template.selectors.primary).forEach(([field, selector]) => {
        // Simple extraction simulation
        const extracted = this.simulateExtraction(html, selector);
        if (extracted) {
          preview[field] = extracted;
        }
      });
      
      return preview;
    } catch (error) {
      Logger.logError('Extraction preview failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'template'
      });
      return {};
    }
  }

  private simulateExtraction(html: string, selector: string): string | null {
    try {
      // Very basic extraction simulation
      if (selector.includes('title')) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1].trim() : null;
      }
      
      if (selector.includes('h1')) {
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        return h1Match ? h1Match[1].trim() : null;
      }
      
      // Generic text extraction
      const textMatch = html.match(new RegExp(`<[^>]*class=["'][^"']*${selector.replace('.', '')}[^"']*["'][^>]*>([^<]+)<`, 'i'));
      return textMatch ? textMatch[1].trim() : null;
      
    } catch {
      return null;
    }
  }

  private calculateReliabilityScore(template: Template, matchFactors: any): number {
    const { url_match, structure_match, content_match, pattern_match } = matchFactors;
    
    // Base reliability from template metadata
    let reliability = template.metadata.reliability;
    
    // Adjust based on match quality
    const avgMatch = (url_match + structure_match + content_match + pattern_match) / 4;
    reliability = reliability * (0.5 + avgMatch * 0.5);
    
    // Factor in template usage and success rate
    if (template.usage_count > 10) {
      reliability = reliability * (0.8 + template.success_rate * 0.2);
    }
    
    return Math.max(0, Math.min(1, reliability));
  }

  private generateMatchExplanation(params: {
    template: Template;
    confidence: number;
    match_factors: any;
  }): string {
    const { template, confidence, match_factors } = params;
    const { url_match, structure_match, content_match, pattern_match } = match_factors;
    
    let explanation = `Template "${template.name}" analysis:\n\n`;
    
    if (confidence >= 0.8) {
      explanation += "🟢 Excellent match - highly recommended for this page structure.\n";
    } else if (confidence >= 0.6) {
      explanation += "🟡 Good match - suitable with minor adjustments.\n";
    } else if (confidence >= 0.4) {
      explanation += "🟠 Moderate match - may require customization.\n";
    } else {
      explanation += "🔴 Poor match - significant modifications needed.\n";
    }
    
    explanation += "\nMatch factors:\n";
    explanation += `• URL pattern: ${(url_match * 100).toFixed(1)}% - ${url_match >= 0.7 ? 'Strong' : url_match >= 0.4 ? 'Moderate' : 'Weak'} URL alignment\n`;
    explanation += `• Page structure: ${(structure_match * 100).toFixed(1)}% - ${structure_match >= 0.7 ? 'Excellent' : structure_match >= 0.4 ? 'Good' : 'Limited'} structural match\n`;
    explanation += `• Content patterns: ${(content_match * 100).toFixed(1)}% - ${content_match >= 0.7 ? 'High' : content_match >= 0.4 ? 'Medium' : 'Low'} content similarity\n`;
    explanation += `• Data patterns: ${(pattern_match * 100).toFixed(1)}% - ${pattern_match >= 0.7 ? 'Compatible' : pattern_match >= 0.4 ? 'Partially compatible' : 'Incompatible'} data structure\n`;
    
    explanation += `\nTemplate reliability: ${(template.metadata.reliability * 100).toFixed(1)}%\n`;
    explanation += `Usage history: ${template.usage_count} times, ${(template.success_rate * 100).toFixed(1)}% success rate\n`;
    
    return explanation;
  }

  private async analyzePageStructure(params: {
    url: string;
    html: string;
    sample_data: Record<string, any>;
  }): Promise<{
    pattern: TemplatePattern;
    category: string;
    tags: string[];
    complexity: 'simple' | 'medium' | 'complex';
  }> {
    try {
      // Analyze HTML structure
      const structureAnalysis = this.analyzeHtmlStructure(params.html);
      
      // Determine category and tags
      const category = this.determineCategory(params.url, params.html);
      const tags = this.generateTags(params.url, params.html, params.sample_data);
      
      // Assess complexity
      const complexity = this.assessComplexity(params.html, params.sample_data);
      
      const pattern: TemplatePattern = {
        url_patterns: [this.generateUrlPattern(params.url)],
        content_patterns: this.extractContentPatterns(params.html),
        structure_patterns: structureAnalysis,
        data_patterns: {
          field_types: this.inferFieldTypes(params.sample_data),
          validation_rules: this.generateValidationRules(params.sample_data),
          extraction_hints: this.generateExtractionHints(params.html, params.sample_data)
        }
      };
      
      return {
        pattern,
        category,
        tags,
        complexity
      };
      
    } catch (error) {
      Logger.logError('Page structure analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'template'
      });
      throw error;
    }
  }

  private analyzeHtmlStructure(html: string): any {
    const requiredElements: string[] = [];
    const optionalElements: string[] = [];
    const layoutIndicators: string[] = [];
    
    // Common structural elements
    const commonElements = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
    commonElements.forEach(element => {
      if (html.includes(`<${element}`)) {
        requiredElements.push(element);
      }
    });
    
    // Form elements
    if (html.includes('<form')) {
      requiredElements.push('form');
      layoutIndicators.push('form-based');
    }
    
    // Table structures
    if (html.includes('<table')) {
      requiredElements.push('table');
      layoutIndicators.push('tabular-data');
    }
    
    // List structures
    if (html.includes('<ul') || html.includes('<ol')) {
      optionalElements.push('ul', 'ol');
      layoutIndicators.push('list-based');
    }
    
    return {
      required_elements: requiredElements,
      optional_elements: optionalElements,
      layout_indicators: layoutIndicators
    };
  }

  private determineCategory(url: string, html: string): string {
    // Simple category determination based on URL and content
    if (url.includes('blog') || html.includes('article')) return 'blog';
    if (url.includes('shop') || html.includes('price')) return 'ecommerce';
    if (url.includes('news')) return 'news';
    if (html.includes('<form')) return 'form';
    if (html.includes('<table')) return 'data-table';
    return 'general';
  }

  private generateTags(url: string, html: string, sampleData: Record<string, any>): string[] {
    const tags: string[] = [];
    
    // URL-based tags
    if (url.includes('api')) tags.push('api');
    if (url.includes('admin')) tags.push('admin');
    
    // Content-based tags
    if (html.includes('react')) tags.push('react');
    if (html.includes('vue')) tags.push('vue');
    if (html.includes('angular')) tags.push('angular');
    
    // Data-based tags
    Object.keys(sampleData).forEach(key => {
      if (key.includes('email')) tags.push('contact');
      if (key.includes('price')) tags.push('pricing');
      if (key.includes('date')) tags.push('temporal');
    });
    
    return [...new Set(tags)];
  }

  private assessComplexity(html: string, sampleData: Record<string, any>): 'simple' | 'medium' | 'complex' {
    let complexityScore = 0;
    
    // HTML complexity
    const elementCount = (html.match(/<[^>]+>/g) || []).length;
    if (elementCount > 1000) complexityScore += 2;
    else if (elementCount > 500) complexityScore += 1;
    
    // Data complexity
    const fieldCount = Object.keys(sampleData).length;
    if (fieldCount > 20) complexityScore += 2;
    else if (fieldCount > 10) complexityScore += 1;
    
    // Structure complexity
    if (html.includes('iframe')) complexityScore += 1;
    if (html.includes('script')) complexityScore += 1;
    if (html.includes('svg')) complexityScore += 1;
    
    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'medium';
    return 'simple';
  }

  private generateUrlPattern(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.replace(/\/\d+/g, '/*')}`;
    } catch {
      return url;
    }
  }

  private extractContentPatterns(html: string): string[] {
    const patterns: string[] = [];
    
    // Extract common text patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) patterns.push(titleMatch[1].toLowerCase());
    
    // Extract meta descriptions
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (metaMatch) patterns.push(metaMatch[1].toLowerCase());
    
    return patterns;
  }

  private inferFieldTypes(sampleData: Record<string, any>): Record<string, string> {
    const fieldTypes: Record<string, string> = {};
    
    Object.entries(sampleData).forEach(([key, value]) => {
      const valueStr = String(value).toLowerCase();
      
      if (valueStr.includes('@')) fieldTypes[key] = 'email';
      else if (/^\+?[\d\s\-\(\)]{10,}$/.test(valueStr)) fieldTypes[key] = 'phone';
      else if (valueStr.startsWith('http')) fieldTypes[key] = 'url';
      else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(valueStr)) fieldTypes[key] = 'date';
      else if (/^\d+(\.\d+)?$/.test(valueStr)) fieldTypes[key] = 'number';
      else fieldTypes[key] = 'text';
    });
    
    return fieldTypes;
  }

  private generateValidationRules(sampleData: Record<string, any>): Record<string, any> {
    const rules: Record<string, any> = {};
    
    Object.entries(sampleData).forEach(([key, value]) => {
      const valueStr = String(value);
      
      rules[key] = {
        required: true,
        minLength: Math.max(1, valueStr.length - 10),
        maxLength: valueStr.length + 50
      };
    });
    
    return rules;
  }

  private generateExtractionHints(html: string, sampleData: Record<string, any>): Record<string, string> {
    const hints: Record<string, string> = {};
    
    Object.keys(sampleData).forEach(key => {
      // Generate hints based on field names and HTML structure
      if (key.toLowerCase().includes('title')) {
        hints[key] = 'Look for h1, h2, or title tags';
      } else if (key.toLowerCase().includes('description')) {
        hints[key] = 'Look for meta description or paragraph text';
      } else if (key.toLowerCase().includes('price')) {
        hints[key] = 'Look for currency symbols and numeric values';
      } else {
        hints[key] = 'Use semantic selectors when possible';
      }
    });
    
    return hints;
  }

  private extractDomainType(url: string): string {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      if (domain.endsWith('.gov')) return 'government';
      if (domain.endsWith('.edu')) return 'education';
      if (domain.endsWith('.org')) return 'organization';
      if (domain.endsWith('.com')) return 'commercial';
      
      return 'other';
    } catch {
      return 'unknown';
    }
  }

  private async generateSelectors(params: {
    html: string;
    sample_data: Record<string, any>;
  }): Promise<TemplateSelectors> {
    try {
      // Use AI to generate selectors
      const prompt = `
Generate CSS selectors for extracting the following data from HTML:

Sample data: ${JSON.stringify(params.sample_data)}

HTML snippet:
${params.html.substring(0, 1500)}...

Return a JSON object with:
{
  "primary": { "field_name": "css_selector" },
  "fallback": { "field_name": ["fallback_selector1", "fallback_selector2"] }
}
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      const aiSelectors = JSON.parse(content);
      
      return {
        primary: aiSelectors.primary || {},
        fallback: aiSelectors.fallback || {},
        dynamic: {},
        validation: this.generateValidationSelectors(params.sample_data)
      };

    } catch (error) {
      Logger.logError('Selector generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'template'
      });
      
      // Fallback to basic selectors
      return this.generateBasicSelectors(params.sample_data);
    }
  }

  private generateValidationSelectors(sampleData: Record<string, any>): Record<string, any> {
    const validation: Record<string, any> = {};
    
    Object.keys(sampleData).forEach(key => {
      validation[key] = {
        required: true,
        format: 'text',
        constraints: {}
      };
    });
    
    return validation;
  }

  private generateBasicSelectors(sampleData: Record<string, any>): TemplateSelectors {
    const primary: Record<string, string> = {};
    const fallback: Record<string, string[]> = {};
    
    Object.keys(sampleData).forEach(key => {
      const keyLower = key.toLowerCase();
      
      if (keyLower.includes('title')) {
        primary[key] = 'h1, h2, .title, [data-title]';
        fallback[key] = ['title', 'h3', '.heading'];
      } else if (keyLower.includes('description')) {
        primary[key] = '.description, [data-description], p';
        fallback[key] = ['.summary', '.content'];
      } else {
        primary[key] = `[data-${keyLower}], .${keyLower}, #${keyLower}`;
        fallback[key] = [`[class*="${keyLower}"]`, `[id*="${keyLower}"]`];
      }
    });
    
    return {
      primary,
      fallback,
      dynamic: {},
      validation: this.generateValidationSelectors(sampleData)
    };
  }

  private async analyzeFeedback(params: {
    template: Template;
    feedback: TemplateOptimizationParams['feedback'];
  }): Promise<{
    improved_selectors: TemplateSelectors;
    improved_pattern: TemplatePattern;
    new_reliability: number;
    new_confidence: number;
    success_rate: number;
    performance_metrics: any;
  }> {
    const { template, feedback } = params;
    const { successful_extractions, failed_extractions } = feedback;
    
    const totalExtractions = successful_extractions.length + failed_extractions.length;
    const successRate = totalExtractions > 0 ? successful_extractions.length / totalExtractions : 0;
    
    // Calculate new reliability based on feedback
    const newReliability = Math.max(0.1, Math.min(1.0, successRate * 1.2));
    
    // Calculate new confidence
    const newConfidence = Math.max(0.1, Math.min(1.0, template.confidence * (0.5 + successRate * 0.5)));
    
    // Performance metrics
    const performanceMetrics = {
      avg_extraction_time: 0, // Would be calculated from actual timing data
      success_rate: successRate,
      error_rate: 1 - successRate
    };
    
    return {
      improved_selectors: template.selectors, // Would implement actual optimization
      improved_pattern: template.pattern, // Would implement actual optimization
      new_reliability: newReliability,
      new_confidence: newConfidence,
      success_rate: successRate,
      performance_metrics: performanceMetrics
    };
  }

  async getTemplateStats(templateId: string): Promise<{
    usage_count: number;
    success_rate: number;
    avg_confidence: number;
    recent_performance: any[];
  }> {
    try {
      const { data, error } = await this.supabase
        .from('template_usage_stats')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        throw new Error(`Failed to get template stats: ${error.message}`);
      }

      const stats = data || [];
      const usageCount = stats.length;
      const successfulUses = stats.filter(s => s.success).length;
      const successRate = usageCount > 0 ? successfulUses / usageCount : 0;
      const avgConfidence = usageCount > 0 ? 
        stats.reduce((sum, s) => sum + (s.confidence || 0), 0) / usageCount : 0;

      return {
        usage_count: usageCount,
        success_rate: successRate,
        avg_confidence: avgConfidence,
        recent_performance: stats.slice(0, 10)
      };

    } catch (error) {
      Logger.logError('Get template stats failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId,
        category: 'template'
      });
      throw error;
    }
  }
}