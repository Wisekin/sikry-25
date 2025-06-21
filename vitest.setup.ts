import { vi } from 'vitest';
import 'vitest-localstorage-mock';

// Mock the 'useSearchParams' hook from 'next/navigation'
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));
