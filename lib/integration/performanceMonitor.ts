export class PerformanceMonitor {
  startTimer(label: string): { stop: () => void } {
    const startTime = Date.now();
    return {
      stop: () => {
        const duration = Date.now() - startTime;
        console.log(`${label} took ${duration}ms`);
        // Integrate with a performance monitoring service here
      },
    };
  }

  reportError(error: Error, context: Record<string, any> = {}): void {
    console.error('ERROR REPORTED', { 
      message: error.message, 
      stack: error.stack, 
      context 
    });
    // Integrate with an error reporting service like Sentry or Bugsnag
  }
}