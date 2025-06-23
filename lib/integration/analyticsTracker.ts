export class AnalyticsTracker {
  trackEvent(eventName: string, properties: Record<string, any>): void {
    // Replace with your analytics provider (e.g., Segment, Mixpanel)
    console.log(`Event: ${eventName}`, properties);
  }

  trackPerformance(metricName: string, durationMs: number): void {
    console.log(`Performance: ${metricName} took ${durationMs}ms`);
  }
}