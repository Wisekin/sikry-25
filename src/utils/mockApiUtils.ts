/**
 * Simulates a delay for the specified number of milliseconds.
 * @param milliseconds The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
export function simulateDelay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
  
  /**
   * Creates a mock API response that returns the given data after a simulated delay.
   * @param data The data to be returned in the response.
   * @param delayMs The delay in milliseconds before the response is returned. Defaults to 1500ms.
   * @returns A promise that resolves with the data after the delay.
   */
  export async function createMockApiResponse<T>(
    data: T,
    delayMs: number = 1500
  ): Promise<T> {
    await simulateDelay(delayMs);
    return data;
  }
  