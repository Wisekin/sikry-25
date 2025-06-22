import { ScrapedData } from '@/src/types/integration';

export class AnalyticsTracker {
  trackEvent(eventName: string, properties: Record<string, any>): void {
    // Replace with your analytics provider (e.g., Segment, Mixpanel)
        // Replace with a real analytics provider
    console.log('ANALYTICS EVENT', { eventName, properties });
  }

  trackPerformance(metricName: string, durationMs: number): void {
        // Replace with a real performance monitoring tool
    console.log('PERFORMANCE METRIC', { metricName, durationMs });
  }

  trackScrapingResult(companyId: string, data: ScrapedData, success: boolean) {
    this.trackEvent('Scraping Completed', {
      companyId,
      success,
      emailCount: data.emails?.length || 0,
      phoneCount: data.phones?.length || 0,
    });
  }
}