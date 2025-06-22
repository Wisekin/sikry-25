import { ScrapedData } from '@/src/types/integration';

export class DataMerger {
  merge(existingData: any, newData: ScrapedData): any {
    // Basic merge, prioritizing new data
    const merged = { ...existingData, ...newData };

    // Conflict resolution for specific fields can be added here
    // For example, concatenating arrays or choosing the most recent value

    return merged;
  }
}