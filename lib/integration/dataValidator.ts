import { ScrapedData } from '@/src/types/integration';

export class DataValidator {
  validate(data: ScrapedData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.companyName) {
      errors.push('Company name is missing');
    }
    if (!data.emails || data.emails.length === 0) {
      errors.push('No emails found');
    }
    // Add more validation rules here
    return { isValid: errors.length === 0, errors };
  }

  score(data: ScrapedData): number {
    let score = 0;
    if (data.companyName) score += 1;
    if (data.website) score += 1;
    if (data.emails && data.emails.length > 0) score += 1;
    if (data.phones && data.phones.length > 0) score += 1;
    if (data.address) score += 1;
    if (data.socialMedia) score += 1;
    return score;
  }
}