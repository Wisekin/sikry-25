import { SearchScope } from './types';

export * from './types';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

export interface SearchResult {
  success: boolean;
  data: any[];
  metadata: {
    query: string;
    scope: SearchScope;
    timestamp: string;
  };
}
