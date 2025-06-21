export interface Company {
  id: string;
  name: string;
  domain: string;
  location_text: string;
  industry: string;
  employees: string;
  description: string;
  logo?: string;
  confidenceScore: number;
  extractedData: {
    emails: string[];
    phones: string[];
    technologies: string[];
  };
  lastScraped: string;
}
