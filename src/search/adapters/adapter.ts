// Modular Search Adapter Interface
export interface SearchAdapterResult {
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  size?: string;
  url?: string;
  confidence?: number;
  [key: string]: any;
}

export interface SearchAdapter {
  id: string;
  label: string;
  search(query: import('../queryParser').ParsedQuery): Promise<SearchAdapterResult[]>;
}
