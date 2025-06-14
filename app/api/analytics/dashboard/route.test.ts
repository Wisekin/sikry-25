import { GET } from './route'; // Adjust path as necessary
import { NextRequest } from 'next/server';

describe('API /api/analytics/dashboard GET', () => {
  const validateAnalyticsDataStructure = (data: any, expectedDays: number) => {
    expect(data).toHaveProperty('vsl_performance');
    expect(data.vsl_performance).toHaveProperty('total_views');
    expect(data.vsl_performance).toHaveProperty('total_views_change'); // Check for change field
    // ... (add more checks for vsl_performance fields)

    expect(data).toHaveProperty('lead_response');
    // ... (checks for lead_response fields)
    expect(data.lead_response).toHaveProperty('avg_response_time_change');

    expect(data).toHaveProperty('funnel_performance');
    // ... (checks for funnel_performance fields)

    expect(data).toHaveProperty('revenue_attribution');
    expect(data.revenue_attribution).toHaveProperty('total_revenue_change');
    // ... (checks for revenue_attribution fields)

    expect(data).toHaveProperty('dailyPerformance');
    expect(Array.isArray(data.dailyPerformance)).toBe(true);

    // If days is 1 (for 24h range), it might produce 1 entry.
    // Otherwise, it should match expectedDays.
    // The mock currently generates `days` items regardless.
    expect(data.dailyPerformance.length).toBe(expectedDays);

    if (expectedDays > 0 && data.dailyPerformance.length > 0) {
      const dailyEntry = data.dailyPerformance[0];
      expect(dailyEntry).toHaveProperty('name');
      expect(dailyEntry).toHaveProperty('views');
      expect(dailyEntry).toHaveProperty('leads');
      expect(dailyEntry).toHaveProperty('conversions');
      expect(dailyEntry).toHaveProperty('revenue'); // revenue is optional in type, but mock provides it
    }
  };

  test('should return analytics data with default range (7d)', async () => {
    const req = new NextRequest('http://localhost/api/analytics/dashboard', {
      method: 'GET',
    });
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    validateAnalyticsDataStructure(json.data, 7); // 7 days for default
  });

  test('should return analytics data for range=30d', async () => {
    const req = new NextRequest('http://localhost/api/analytics/dashboard?range=30d', {
      method: 'GET',
    });
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    validateAnalyticsDataStructure(json.data, 30);
  });

  test('should return analytics data for range=90d', async () => {
    const req = new NextRequest('http://localhost/api/analytics/dashboard?range=90d', {
      method: 'GET',
    });
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    validateAnalyticsDataStructure(json.data, 90);
  });

  test('should return analytics data for range=24h (mocked as 1 day)', async () => {
    const req = new NextRequest('http://localhost/api/analytics/dashboard?range=24h', {
      method: 'GET',
    });
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    validateAnalyticsDataStructure(json.data, 1); // Mock for 24h currently generates 1 day of data
  });

  test('should correctly sum total_views and total_revenue from dailyPerformance', async () => {
    const req = new NextRequest('http://localhost/api/analytics/dashboard?range=3d', { // Use a small, predictable range
      method: 'GET',
    });
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);

    const data = json.data;
    validateAnalyticsDataStructure(data, 3);

    const expectedTotalViews = data.dailyPerformance.reduce((sum: number, item: { views: number }) => sum + item.views, 0);
    const expectedTotalRevenue = data.dailyPerformance.reduce((sum: number, item: { revenue?: number }) => sum + (item.revenue || 0), 0);

    expect(data.vsl_performance.total_views).toBe(expectedTotalViews);
    expect(data.revenue_attribution.total_revenue).toBe(expectedTotalRevenue);
  });

  // Similar to activity/recent, forcing an internal error in the current mock implementation is hard.
  // test('should handle internal errors gracefully', async () => {
  //   // ... setup to make generateDailyPerformance or part of data construction throw error ...
  //   const req = new NextRequest('http://localhost/api/analytics/dashboard');
  //   const response = await GET(req);
  //   const json = await response.json();
  //   expect(response.status).toBe(500);
  //   expect(json.success).toBe(false);
  //   // ...
  // });
});
