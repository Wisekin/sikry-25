import { createClient } from '@/utils/supabase/server';
import { Logger } from '@/lib/monitoring/logger';
import OpenAI from 'openai';

interface QualityMetrics {
  overall_score: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  freshness: number;
  uniqueness: number;
  reliability: number;
}

interface QualityIssue {
  type: 'missing' | 'invalid' | 'inconsistent' | 'duplicate' | 'outdated' | 'format' | 'range';
  field: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
  confidence: number;
  examples?: string[];
}

interface QualityReport {
  id: string;
  data_source: string;
  metrics: QualityMetrics;
  issues: QualityIssue[];
  recommendations: string[];
  data_profile: DataProfile;
  timestamp: string;
  user_id: string;
}

interface DataProfile {
  total_records: number;
  total_fields: number;
  field_types: Record<string, string>;
  null_counts: Record<string, number>;
  unique_counts: Record<string, number>;
  value_distributions: Record<string, any>;
  data_patterns: Record<string, string[]>;
  outliers: Record<string, any[]>;
}

interface AnalysisParams {
  data: Record<string, any>[];
  schema?: Record<string, any>;
  rules?: QualityRule[];
  source: string;
  userId: string;
}

interface QualityRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'enum' | 'unique' | 'relationship';
  parameters: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface BatchAnalysisParams {
  datasets: Array<{
    id: string;
    data: Record<string, any>[];
    source: string;
    schema?: Record<string, any>;
  }>;
  rules?: QualityRule[];
  userId: string;
}

interface ComparisonParams {
  dataset1: {
    data: Record<string, any>[];
    source: string;
  };
  dataset2: {
    data: Record<string, any>[];
    source: string;
  };
  userId: string;
}

interface ComparisonResult {
  similarity_score: number;
  schema_differences: any[];
  data_differences: any[];
  quality_comparison: {
    dataset1: QualityMetrics;
    dataset2: QualityMetrics;
  };
  recommendations: string[];
}

export class DataQualityAnalyzer {
  private supabase = createClient();
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async analyzeQuality(params: AnalysisParams): Promise<QualityReport> {
    try {
      Logger.logInfo('Starting data quality analysis', {
        source: params.source,
        recordCount: params.data.length,
        userId: params.userId,
        category: 'quality'
      });

      // Generate data profile
      const dataProfile = this.generateDataProfile(params.data);
      
      // Calculate quality metrics
      const metrics = await this.calculateQualityMetrics(params.data, params.schema, dataProfile);
      
      // Identify quality issues
      const issues = await this.identifyQualityIssues(params.data, params.rules, dataProfile);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(metrics, issues, dataProfile);
      
      const report: QualityReport = {
        id: crypto.randomUUID(),
        data_source: params.source,
        metrics,
        issues,
        recommendations,
        data_profile: dataProfile,
        timestamp: new Date().toISOString(),
        user_id: params.userId
      };

      // Store the report
      await this.storeQualityReport(report);

      return report;

    } catch (error) {
      Logger.logError('Data quality analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        source: params.source,
        category: 'quality'
      });
      throw error;
    }
  }

  async batchAnalyze(params: BatchAnalysisParams): Promise<QualityReport[]> {
    try {
      Logger.logInfo('Starting batch data quality analysis', {
        datasetCount: params.datasets.length,
        userId: params.userId,
        category: 'quality'
      });

      const reports = await Promise.all(
        params.datasets.map(async (dataset) => {
          return this.analyzeQuality({
            data: dataset.data,
            schema: dataset.schema,
            rules: params.rules,
            source: dataset.source,
            userId: params.userId
          });
        })
      );

      return reports;

    } catch (error) {
      Logger.logError('Batch data quality analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'quality'
      });
      throw error;
    }
  }

  async compareDatasets(params: ComparisonParams): Promise<ComparisonResult> {
    try {
      Logger.logInfo('Starting dataset comparison', {
        dataset1Source: params.dataset1.source,
        dataset2Source: params.dataset2.source,
        userId: params.userId,
        category: 'quality'
      });

      // Analyze both datasets
      const analysis1 = await this.analyzeQuality({
        data: params.dataset1.data,
        source: params.dataset1.source,
        userId: params.userId
      });

      const analysis2 = await this.analyzeQuality({
        data: params.dataset2.data,
        source: params.dataset2.source,
        userId: params.userId
      });

      // Calculate similarity
      const similarityScore = this.calculateDatasetSimilarity(
        params.dataset1.data,
        params.dataset2.data
      );

      // Find schema differences
      const schemaDifferences = this.findSchemaDifferences(
        analysis1.data_profile,
        analysis2.data_profile
      );

      // Find data differences
      const dataDifferences = this.findDataDifferences(
        params.dataset1.data,
        params.dataset2.data
      );

      // Generate comparison recommendations
      const recommendations = this.generateComparisonRecommendations(
        analysis1,
        analysis2,
        similarityScore
      );

      return {
        similarity_score: similarityScore,
        schema_differences: schemaDifferences,
        data_differences: dataDifferences,
        quality_comparison: {
          dataset1: analysis1.metrics,
          dataset2: analysis2.metrics
        },
        recommendations
      };

    } catch (error) {
      Logger.logError('Dataset comparison failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'quality'
      });
      throw error;
    }
  }

  private generateDataProfile(data: Record<string, any>[]): DataProfile {
    if (data.length === 0) {
      return {
        total_records: 0,
        total_fields: 0,
        field_types: {},
        null_counts: {},
        unique_counts: {},
        value_distributions: {},
        data_patterns: {},
        outliers: {}
      };
    }

    const fields = Object.keys(data[0]);
    const fieldTypes: Record<string, string> = {};
    const nullCounts: Record<string, number> = {};
    const uniqueCounts: Record<string, number> = {};
    const valueDistributions: Record<string, any> = {};
    const dataPatterns: Record<string, string[]> = {};
    const outliers: Record<string, any[]> = {};

    fields.forEach(field => {
      const values = data.map(row => row[field]);
      const nonNullValues = values.filter(v => v != null && v !== '');
      
      // Field type inference
      fieldTypes[field] = this.inferFieldType(nonNullValues);
      
      // Null count
      nullCounts[field] = values.length - nonNullValues.length;
      
      // Unique count
      uniqueCounts[field] = new Set(nonNullValues.map(v => String(v))).size;
      
      // Value distribution
      valueDistributions[field] = this.calculateValueDistribution(nonNullValues);
      
      // Data patterns
      dataPatterns[field] = this.extractDataPatterns(nonNullValues);
      
      // Outliers
      outliers[field] = this.detectOutliers(nonNullValues, fieldTypes[field]);
    });

    return {
      total_records: data.length,
      total_fields: fields.length,
      field_types: fieldTypes,
      null_counts: nullCounts,
      unique_counts: uniqueCounts,
      value_distributions: valueDistributions,
      data_patterns: dataPatterns,
      outliers
    };
  }

  private inferFieldType(values: any[]): string {
    if (values.length === 0) return 'unknown';
    
    const sample = values.slice(0, Math.min(100, values.length));
    
    // Check for specific patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[\+]?[1-9]?[0-9]{7,15}$/;
    const urlPattern = /^https?:\/\/.+/;
    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    
    let emailCount = 0;
    let phoneCount = 0;
    let urlCount = 0;
    let dateCount = 0;
    let numberCount = 0;
    let booleanCount = 0;
    
    sample.forEach(value => {
      const strValue = String(value).trim();
      
      if (emailPattern.test(strValue)) emailCount++;
      else if (phonePattern.test(strValue.replace(/[\s\-\(\)]/g, ''))) phoneCount++;
      else if (urlPattern.test(strValue)) urlCount++;
      else if (datePattern.test(strValue)) dateCount++;
      else if (!isNaN(Number(strValue)) && strValue !== '') numberCount++;
      else if (['true', 'false', '1', '0'].includes(strValue.toLowerCase())) booleanCount++;
    });
    
    const total = sample.length;
    const threshold = 0.8;
    
    if (emailCount / total >= threshold) return 'email';
    if (phoneCount / total >= threshold) return 'phone';
    if (urlCount / total >= threshold) return 'url';
    if (dateCount / total >= threshold) return 'date';
    if (numberCount / total >= threshold) return 'number';
    if (booleanCount / total >= threshold) return 'boolean';
    
    return 'text';
  }

  private calculateValueDistribution(values: any[]): any {
    const distribution: Record<string, number> = {};
    const total = values.length;
    
    values.forEach(value => {
      const key = String(value);
      distribution[key] = (distribution[key] || 0) + 1;
    });
    
    // Convert to percentages and sort
    const sortedDistribution = Object.entries(distribution)
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 values
    
    return {
      top_values: sortedDistribution,
      unique_count: Object.keys(distribution).length,
      most_common: sortedDistribution[0]?.value || null
    };
  }

  private extractDataPatterns(values: any[]): string[] {
    const patterns: Set<string> = new Set();
    
    values.slice(0, 100).forEach(value => {
      const strValue = String(value);
      
      // Length patterns
      if (strValue.length <= 5) patterns.add('short');
      else if (strValue.length <= 20) patterns.add('medium');
      else patterns.add('long');
      
      // Character patterns
      if (/^[A-Z]+$/.test(strValue)) patterns.add('uppercase');
      if (/^[a-z]+$/.test(strValue)) patterns.add('lowercase');
      if (/^[0-9]+$/.test(strValue)) patterns.add('numeric');
      if (/^[A-Za-z0-9]+$/.test(strValue)) patterns.add('alphanumeric');
      if (/[^A-Za-z0-9\s]/.test(strValue)) patterns.add('special_chars');
      
      // Format patterns
      if (/^\d{4}-\d{2}-\d{2}$/.test(strValue)) patterns.add('iso_date');
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(strValue)) patterns.add('us_date');
      if (/^[A-Z]{2,3}-\d+$/.test(strValue)) patterns.add('code_format');
    });
    
    return Array.from(patterns);
  }

  private detectOutliers(values: any[], fieldType: string): any[] {
    if (fieldType !== 'number' || values.length < 10) return [];
    
    const numericValues = values
      .map(v => Number(v))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);
    
    if (numericValues.length < 10) return [];
    
    // IQR method for outlier detection
    const q1Index = Math.floor(numericValues.length * 0.25);
    const q3Index = Math.floor(numericValues.length * 0.75);
    const q1 = numericValues[q1Index];
    const q3 = numericValues[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return numericValues.filter(v => v < lowerBound || v > upperBound);
  }

  private async calculateQualityMetrics(
    data: Record<string, any>[],
    schema?: Record<string, any>,
    profile?: DataProfile
  ): Promise<QualityMetrics> {
    const dataProfile = profile || this.generateDataProfile(data);
    
    // Completeness: percentage of non-null values
    const completeness = this.calculateCompleteness(data, dataProfile);
    
    // Accuracy: estimated based on format validation
    const accuracy = await this.calculateAccuracy(data, dataProfile);
    
    // Consistency: uniformity of data formats and patterns
    const consistency = this.calculateConsistency(data, dataProfile);
    
    // Validity: adherence to expected formats and constraints
    const validity = this.calculateValidity(data, schema, dataProfile);
    
    // Freshness: estimated based on timestamps and patterns
    const freshness = this.calculateFreshness(data);
    
    // Uniqueness: percentage of unique values where expected
    const uniqueness = this.calculateUniqueness(data, dataProfile);
    
    // Reliability: overall confidence in data quality
    const reliability = this.calculateReliability(data, dataProfile);
    
    // Overall score: weighted average
    const overallScore = (
      completeness * 0.20 +
      accuracy * 0.20 +
      consistency * 0.15 +
      validity * 0.15 +
      freshness * 0.10 +
      uniqueness * 0.10 +
      reliability * 0.10
    );
    
    return {
      overall_score: Math.round(overallScore * 100) / 100,
      completeness: Math.round(completeness * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      validity: Math.round(validity * 100) / 100,
      freshness: Math.round(freshness * 100) / 100,
      uniqueness: Math.round(uniqueness * 100) / 100,
      reliability: Math.round(reliability * 100) / 100
    };
  }

  private calculateCompleteness(data: Record<string, any>[], profile: DataProfile): number {
    if (data.length === 0) return 0;
    
    const totalCells = data.length * profile.total_fields;
    const nullCells = Object.values(profile.null_counts).reduce((sum, count) => sum + count, 0);
    
    return totalCells > 0 ? (totalCells - nullCells) / totalCells : 0;
  }

  private async calculateAccuracy(data: Record<string, any>[], profile: DataProfile): Promise<number> {
    let totalChecks = 0;
    let accurateValues = 0;
    
    Object.entries(profile.field_types).forEach(([field, type]) => {
      const values = data.map(row => row[field]).filter(v => v != null && v !== '');
      
      values.forEach(value => {
        totalChecks++;
        if (this.validateFieldType(value, type)) {
          accurateValues++;
        }
      });
    });
    
    return totalChecks > 0 ? accurateValues / totalChecks : 1;
  }

  private validateFieldType(value: any, expectedType: string): boolean {
    const strValue = String(value).trim();
    
    switch (expectedType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue);
      case 'phone':
        return /^[\+]?[1-9]?[0-9]{7,15}$/.test(strValue.replace(/[\s\-\(\)]/g, ''));
      case 'url':
        return /^https?:\/\/.+/.test(strValue);
      case 'date':
        return !isNaN(Date.parse(strValue));
      case 'number':
        return !isNaN(Number(strValue));
      case 'boolean':
        return ['true', 'false', '1', '0', 'yes', 'no'].includes(strValue.toLowerCase());
      default:
        return true; // Text fields are generally valid
    }
  }

  private calculateConsistency(data: Record<string, any>[], profile: DataProfile): number {
    let consistencyScore = 0;
    let totalFields = 0;
    
    Object.entries(profile.data_patterns).forEach(([field, patterns]) => {
      totalFields++;
      
      // More patterns indicate less consistency
      const patternScore = Math.max(0, 1 - (patterns.length - 1) * 0.1);
      consistencyScore += patternScore;
    });
    
    return totalFields > 0 ? consistencyScore / totalFields : 1;
  }

  private calculateValidity(data: Record<string, any>[], schema?: Record<string, any>, profile?: DataProfile): number {
    if (!schema) return 0.8; // Default validity if no schema provided
    
    let validityScore = 0;
    let totalChecks = 0;
    
    Object.entries(schema).forEach(([field, fieldSchema]) => {
      const values = data.map(row => row[field]);
      
      values.forEach(value => {
        totalChecks++;
        if (this.validateAgainstSchema(value, fieldSchema)) {
          validityScore++;
        }
      });
    });
    
    return totalChecks > 0 ? validityScore / totalChecks : 1;
  }

  private validateAgainstSchema(value: any, fieldSchema: any): boolean {
    // Basic schema validation
    if (fieldSchema.required && (value == null || value === '')) {
      return false;
    }
    
    if (fieldSchema.type && !this.validateFieldType(value, fieldSchema.type)) {
      return false;
    }
    
    if (fieldSchema.minLength && String(value).length < fieldSchema.minLength) {
      return false;
    }
    
    if (fieldSchema.maxLength && String(value).length > fieldSchema.maxLength) {
      return false;
    }
    
    return true;
  }

  private calculateFreshness(data: Record<string, any>[]): number {
    // Look for timestamp fields
    const timestampFields = ['created_at', 'updated_at', 'timestamp', 'date', 'modified'];
    
    for (const field of timestampFields) {
      if (data.length > 0 && data[0][field]) {
        const timestamps = data
          .map(row => row[field])
          .filter(ts => ts && !isNaN(Date.parse(ts)))
          .map(ts => new Date(ts));
        
        if (timestamps.length > 0) {
          const now = new Date();
          const avgAge = timestamps.reduce((sum, ts) => {
            return sum + (now.getTime() - ts.getTime());
          }, 0) / timestamps.length;
          
          // Convert to days and calculate freshness score
          const avgAgeDays = avgAge / (1000 * 60 * 60 * 24);
          return Math.max(0, 1 - avgAgeDays / 365); // Decay over a year
        }
      }
    }
    
    return 0.5; // Default freshness if no timestamps found
  }

  private calculateUniqueness(data: Record<string, any>[], profile: DataProfile): number {
    // Fields that should typically be unique
    const uniqueFields = ['id', 'email', 'username', 'phone', 'url'];
    
    let uniquenessScore = 0;
    let relevantFields = 0;
    
    Object.entries(profile.unique_counts).forEach(([field, uniqueCount]) => {
      const fieldLower = field.toLowerCase();
      const shouldBeUnique = uniqueFields.some(uf => fieldLower.includes(uf));
      
      if (shouldBeUnique) {
        relevantFields++;
        const uniquenessRatio = uniqueCount / data.length;
        uniquenessScore += uniquenessRatio;
      }
    });
    
    return relevantFields > 0 ? uniquenessScore / relevantFields : 0.8;
  }

  private calculateReliability(data: Record<string, any>[], profile: DataProfile): number {
    let reliabilityFactors = [];
    
    // Data volume factor
    const volumeFactor = Math.min(1, data.length / 1000);
    reliabilityFactors.push(volumeFactor);
    
    // Field coverage factor
    const expectedFields = ['id', 'name', 'email', 'created_at'];
    const actualFields = Object.keys(profile.field_types);
    const coverageFactor = expectedFields.filter(ef => 
      actualFields.some(af => af.toLowerCase().includes(ef))
    ).length / expectedFields.length;
    reliabilityFactors.push(coverageFactor);
    
    // Data consistency factor
    const avgPatterns = Object.values(profile.data_patterns)
      .reduce((sum, patterns) => sum + patterns.length, 0) / profile.total_fields;
    const consistencyFactor = Math.max(0, 1 - (avgPatterns - 2) * 0.1);
    reliabilityFactors.push(consistencyFactor);
    
    return reliabilityFactors.reduce((sum, factor) => sum + factor, 0) / reliabilityFactors.length;
  }

  private async identifyQualityIssues(
    data: Record<string, any>[],
    rules?: QualityRule[],
    profile?: DataProfile
  ): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];
    const dataProfile = profile || this.generateDataProfile(data);
    
    // Check for missing data
    Object.entries(dataProfile.null_counts).forEach(([field, nullCount]) => {
      if (nullCount > 0) {
        const percentage = (nullCount / data.length) * 100;
        let severity: QualityIssue['severity'] = 'low';
        
        if (percentage > 50) severity = 'critical';
        else if (percentage > 25) severity = 'high';
        else if (percentage > 10) severity = 'medium';
        
        issues.push({
          type: 'missing',
          field,
          severity,
          description: `${percentage.toFixed(1)}% of values are missing in field '${field}'`,
          suggestion: `Consider data imputation or making field optional`,
          confidence: 1.0,
          examples: [`${nullCount} out of ${data.length} records`]
        });
      }
    });
    
    // Check for format issues
    Object.entries(dataProfile.field_types).forEach(([field, type]) => {
      const values = data.map(row => row[field]).filter(v => v != null && v !== '');
      const invalidValues = values.filter(value => !this.validateFieldType(value, type));
      
      if (invalidValues.length > 0) {
        const percentage = (invalidValues.length / values.length) * 100;
        
        issues.push({
          type: 'format',
          field,
          severity: percentage > 10 ? 'high' : 'medium',
          description: `${percentage.toFixed(1)}% of values don't match expected ${type} format`,
          suggestion: `Validate and standardize ${type} format`,
          confidence: 0.9,
          examples: invalidValues.slice(0, 3).map(v => String(v))
        });
      }
    });
    
    // Check for duplicates
    const duplicateFields = ['id', 'email', 'username'];
    duplicateFields.forEach(fieldName => {
      const field = Object.keys(dataProfile.field_types).find(f => 
        f.toLowerCase().includes(fieldName)
      );
      
      if (field) {
        const uniqueCount = dataProfile.unique_counts[field];
        const totalCount = data.length - dataProfile.null_counts[field];
        
        if (uniqueCount < totalCount) {
          const duplicateCount = totalCount - uniqueCount;
          
          issues.push({
            type: 'duplicate',
            field,
            severity: duplicateCount > totalCount * 0.1 ? 'high' : 'medium',
            description: `${duplicateCount} duplicate values found in field '${field}'`,
            suggestion: `Remove duplicates or investigate data source`,
            confidence: 1.0,
            examples: [`${duplicateCount} duplicates out of ${totalCount} values`]
          });
        }
      }
    });
    
    // Check custom rules if provided
    if (rules) {
      for (const rule of rules) {
        const ruleIssues = await this.validateRule(data, rule);
        issues.push(...ruleIssues);
      }
    }
    
    // Use AI to identify additional issues
    const aiIssues = await this.identifyAIIssues(data, dataProfile);
    issues.push(...aiIssues);
    
    return issues.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private async validateRule(data: Record<string, any>[], rule: QualityRule): Promise<QualityIssue[]> {
    const issues: QualityIssue[] = [];
    const field = rule.field;
    const values = data.map(row => row[field]);
    
    switch (rule.type) {
      case 'required':
        const missingCount = values.filter(v => v == null || v === '').length;
        if (missingCount > 0) {
          issues.push({
            type: 'missing',
            field,
            severity: rule.severity,
            description: `Required field '${field}' has ${missingCount} missing values`,
            suggestion: 'Ensure all required fields are populated',
            confidence: 1.0
          });
        }
        break;
        
      case 'range':
        const { min, max } = rule.parameters;
        const outOfRangeValues = values.filter(v => {
          const num = Number(v);
          return !isNaN(num) && (num < min || num > max);
        });
        
        if (outOfRangeValues.length > 0) {
          issues.push({
            type: 'range',
            field,
            severity: rule.severity,
            description: `${outOfRangeValues.length} values outside expected range [${min}, ${max}]`,
            suggestion: `Validate data source and check for outliers`,
            confidence: 1.0,
            examples: outOfRangeValues.slice(0, 3).map(v => String(v))
          });
        }
        break;
        
      case 'enum':
        const allowedValues = rule.parameters.values || [];
        const invalidEnumValues = values.filter(v => 
          v != null && v !== '' && !allowedValues.includes(v)
        );
        
        if (invalidEnumValues.length > 0) {
          issues.push({
            type: 'invalid',
            field,
            severity: rule.severity,
            description: `${invalidEnumValues.length} values not in allowed set`,
            suggestion: `Standardize values to: ${allowedValues.join(', ')}`,
            confidence: 1.0,
            examples: [...new Set(invalidEnumValues)].slice(0, 3).map(v => String(v))
          });
        }
        break;
    }
    
    return issues;
  }

  private async identifyAIIssues(data: Record<string, any>[], profile: DataProfile): Promise<QualityIssue[]> {
    try {
      // Use AI to identify potential data quality issues
      const prompt = `
Analyze this data profile for potential quality issues:

Data Profile:
- Total records: ${profile.total_records}
- Fields: ${Object.keys(profile.field_types).join(', ')}
- Field types: ${JSON.stringify(profile.field_types)}
- Null counts: ${JSON.stringify(profile.null_counts)}
- Data patterns: ${JSON.stringify(profile.data_patterns)}

Sample data:
${JSON.stringify(data.slice(0, 3), null, 2)}

Identify potential data quality issues and return a JSON array of issues:
[
  {
    "type": "missing|invalid|inconsistent|duplicate|outdated|format|range",
    "field": "field_name",
    "severity": "low|medium|high|critical",
    "description": "Issue description",
    "suggestion": "Improvement suggestion",
    "confidence": 0.0-1.0
  }
]
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const aiIssues = JSON.parse(content);
      return aiIssues.filter((issue: any) => issue.confidence >= 0.7);

    } catch (error) {
      Logger.logError('AI issue identification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'quality'
      });
      return [];
    }
  }

  private generateRecommendations(
    metrics: QualityMetrics,
    issues: QualityIssue[],
    profile: DataProfile
  ): string[] {
    const recommendations: string[] = [];
    
    // Overall quality recommendations
    if (metrics.overall_score < 0.7) {
      recommendations.push('Overall data quality is below acceptable threshold. Prioritize addressing critical and high-severity issues.');
    }
    
    // Completeness recommendations
    if (metrics.completeness < 0.8) {
      recommendations.push('Improve data completeness by implementing validation at data entry points and considering data imputation strategies.');
    }
    
    // Accuracy recommendations
    if (metrics.accuracy < 0.9) {
      recommendations.push('Enhance data accuracy by implementing format validation and data type constraints.');
    }
    
    // Consistency recommendations
    if (metrics.consistency < 0.8) {
      recommendations.push('Standardize data formats and implement consistent naming conventions across all data sources.');
    }
    
    // Issue-specific recommendations
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(`Address ${criticalIssues.length} critical data quality issues immediately to prevent data corruption.`);
    }
    
    const duplicateIssues = issues.filter(i => i.type === 'duplicate');
    if (duplicateIssues.length > 0) {
      recommendations.push('Implement deduplication processes and unique constraints to prevent duplicate data entry.');
    }
    
    // Data volume recommendations
    if (profile.total_records < 100) {
      recommendations.push('Consider collecting more data samples to improve statistical reliability of quality metrics.');
    }
    
    return recommendations;
  }

  private calculateDatasetSimilarity(dataset1: Record<string, any>[], dataset2: Record<string, any>[]): number {
    if (dataset1.length === 0 || dataset2.length === 0) return 0;
    
    const fields1 = new Set(Object.keys(dataset1[0]));
    const fields2 = new Set(Object.keys(dataset2[0]));
    
    // Schema similarity
    const commonFields = new Set([...fields1].filter(f => fields2.has(f)));
    const allFields = new Set([...fields1, ...fields2]);
    const schemaSimilarity = commonFields.size / allFields.size;
    
    // Data type similarity
    let typeSimilarity = 0;
    if (commonFields.size > 0) {
      const profile1 = this.generateDataProfile(dataset1);
      const profile2 = this.generateDataProfile(dataset2);
      
      let matchingTypes = 0;
      commonFields.forEach(field => {
        if (profile1.field_types[field] === profile2.field_types[field]) {
          matchingTypes++;
        }
      });
      
      typeSimilarity = matchingTypes / commonFields.size;
    }
    
    return (schemaSimilarity + typeSimilarity) / 2;
  }

  private findSchemaDifferences(profile1: DataProfile, profile2: DataProfile): any[] {
    const differences: any[] = [];
    
    const fields1 = new Set(Object.keys(profile1.field_types));
    const fields2 = new Set(Object.keys(profile2.field_types));
    
    // Fields only in dataset1
    fields1.forEach(field => {
      if (!fields2.has(field)) {
        differences.push({
          type: 'missing_field',
          field,
          dataset: 'dataset2',
          description: `Field '${field}' exists in dataset1 but not in dataset2`
        });
      }
    });
    
    // Fields only in dataset2
    fields2.forEach(field => {
      if (!fields1.has(field)) {
        differences.push({
          type: 'missing_field',
          field,
          dataset: 'dataset1',
          description: `Field '${field}' exists in dataset2 but not in dataset1`
        });
      }
    });
    
    // Type differences
    const commonFields = new Set([...fields1].filter(f => fields2.has(f)));
    commonFields.forEach(field => {
      if (profile1.field_types[field] !== profile2.field_types[field]) {
        differences.push({
          type: 'type_mismatch',
          field,
          dataset1_type: profile1.field_types[field],
          dataset2_type: profile2.field_types[field],
          description: `Field '${field}' has different types: ${profile1.field_types[field]} vs ${profile2.field_types[field]}`
        });
      }
    });
    
    return differences;
  }

  private findDataDifferences(dataset1: Record<string, any>[], dataset2: Record<string, any>[]): any[] {
    const differences: any[] = [];
    
    // Size difference
    if (dataset1.length !== dataset2.length) {
      differences.push({
        type: 'size_difference',
        dataset1_size: dataset1.length,
        dataset2_size: dataset2.length,
        description: `Dataset sizes differ: ${dataset1.length} vs ${dataset2.length} records`
      });
    }
    
    // Value distribution differences (for common fields)
    if (dataset1.length > 0 && dataset2.length > 0) {
      const fields1 = Object.keys(dataset1[0]);
      const fields2 = Object.keys(dataset2[0]);
      const commonFields = fields1.filter(f => fields2.includes(f));
      
      commonFields.forEach(field => {
        const values1 = new Set(dataset1.map(row => String(row[field])));
        const values2 = new Set(dataset2.map(row => String(row[field])));
        
        const uniqueToDataset1 = [...values1].filter(v => !values2.has(v));
        const uniqueToDataset2 = [...values2].filter(v => !values1.has(v));
        
        if (uniqueToDataset1.length > 0 || uniqueToDataset2.length > 0) {
          differences.push({
            type: 'value_difference',
            field,
            unique_to_dataset1: uniqueToDataset1.slice(0, 5),
            unique_to_dataset2: uniqueToDataset2.slice(0, 5),
            description: `Field '${field}' has different value distributions`
          });
        }
      });
    }
    
    return differences;
  }

  private generateComparisonRecommendations(
    analysis1: QualityReport,
    analysis2: QualityReport,
    similarity: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (similarity < 0.5) {
      recommendations.push('Datasets have low similarity. Consider data harmonization before merging.');
    }
    
    if (analysis1.metrics.overall_score > analysis2.metrics.overall_score + 0.1) {
      recommendations.push('Dataset 1 has significantly higher quality. Use it as the primary source.');
    } else if (analysis2.metrics.overall_score > analysis1.metrics.overall_score + 0.1) {
      recommendations.push('Dataset 2 has significantly higher quality. Use it as the primary source.');
    }
    
    const issues1 = analysis1.issues.filter(i => i.severity === 'critical' || i.severity === 'high');
    const issues2 = analysis2.issues.filter(i => i.severity === 'critical' || i.severity === 'high');
    
    if (issues1.length < issues2.length) {
      recommendations.push('Dataset 1 has fewer critical issues and may be more reliable.');
    } else if (issues2.length < issues1.length) {
      recommendations.push('Dataset 2 has fewer critical issues and may be more reliable.');
    }
    
    return recommendations;
  }

  private async storeQualityReport(report: QualityReport): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('data_quality_reports')
        .insert({
          id: report.id,
          data_source: report.data_source,
          metrics: report.metrics,
          issues: report.issues,
          recommendations: report.recommendations,
          data_profile: report.data_profile,
          user_id: report.user_id,
          created_at: report.timestamp
        });

      if (error) {
        Logger.logError('Store quality report failed', {
          error: error.message,
          reportId: report.id,
          category: 'quality'
        });
      }

    } catch (error) {
      Logger.logError('Store quality report failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reportId: report.id,
        category: 'quality'
      });
    }
  }

  async getQualityHistory(params: {
    userId: string;
    source?: string;
    page: number;
    limit: number;
  }): Promise<{ data: QualityReport[]; total: number }> {
    try {
      let query = this.supabase
        .from('data_quality_reports')
        .select('*', { count: 'exact' })
        .eq('user_id', params.userId);

      if (params.source) {
        query = query.eq('data_source', params.source);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((params.page - 1) * params.limit, params.page * params.limit - 1);

      if (error) {
        throw new Error(`Failed to get quality history: ${error.message}`);
      }

      return {
        data: data as QualityReport[] || [],
        total: count || 0
      };

    } catch (error) {
      Logger.logError('Get quality history failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: params.userId,
        category: 'quality'
      });
      throw error;
    }
  }

  async getQualityTrends(params: {
    userId: string;
    source: string;
    days: number;
  }): Promise<{
    trend_data: Array<{
      date: string;
      metrics: QualityMetrics;
    }>;
    improvement_rate: number;
    key_insights: string[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - params.days);

      const { data, error } = await this.supabase
        .from('data_quality_reports')
        .select('created_at, metrics')
        .eq('user_id', params.userId)
        .eq('data_source', params.source)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to get quality trends: ${error.message}`);
      }

      const trendData = (data || []).map(item => ({
        date: item.created_at,
        metrics: item.metrics as QualityMetrics
      }));

      // Calculate improvement rate
      let improvementRate = 0;
      if (trendData.length >= 2) {
        const firstScore = trendData[0].metrics.overall_score;
        const lastScore = trendData[trendData.length - 1].metrics.overall_score;
        improvementRate = ((lastScore - firstScore) / firstScore) * 100;
      }

      // Generate key insights
      const keyInsights = this.generateTrendInsights(trendData, improvementRate);

      return {
        trend_data: trendData,
        improvement_rate: Math.round(improvementRate * 100) / 100,
        key_insights: keyInsights
      };

    } catch (error) {
      Logger.logError('Get quality trends failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: params.userId,
        category: 'quality'
      });
      throw error;
    }
  }

  private generateTrendInsights(trendData: any[], improvementRate: number): string[] {
    const insights: string[] = [];
    
    if (improvementRate > 10) {
      insights.push(`Data quality has improved by ${improvementRate.toFixed(1)}% over the analyzed period.`);
    } else if (improvementRate < -10) {
      insights.push(`Data quality has declined by ${Math.abs(improvementRate).toFixed(1)}% - immediate attention required.`);
    } else {
      insights.push('Data quality has remained relatively stable over the analyzed period.');
    }
    
    if (trendData.length >= 5) {
      // Analyze metric trends
      const metrics = ['completeness', 'accuracy', 'consistency', 'validity'];
      
      metrics.forEach(metric => {
        const values = trendData.map(d => d.metrics[metric]);
        const trend = this.calculateTrend(values);
        
        if (trend > 0.05) {
          insights.push(`${metric.charAt(0).toUpperCase() + metric.slice(1)} shows consistent improvement.`);
        } else if (trend < -0.05) {
          insights.push(`${metric.charAt(0).toUpperCase() + metric.slice(1)} shows declining trend - needs attention.`);
        }
      });
    }
    
    return insights;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear trend calculation
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = values.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }
}