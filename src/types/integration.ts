// All developers must agree on these signatures

export interface DiscoveryRequest {
  companyName: string;
  companyType?: string;
  location?: string;
}

export interface DiscoveryResponse {
  websites: WebsiteSuggestion[];
  confidence: number;
  searchQuery: string;
}

export interface ScrapedData {
  companyName?: string;
  emails: string[];
  phones: string[];
  address?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  // ... other fields
}

export interface WebsiteSuggestion {
    url: string;
    score: number;
}