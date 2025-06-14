import { GET } from './route'; // Adjust path as necessary
import { NextRequest } from 'next/server';
// No need to mock uuid as it's used internally by the route's mock data generation

describe('API /api/activity/recent GET', () => {
  test('should return a list of recent activities with correct structure', async () => {
    const req = new NextRequest('http://localhost/api/activity/recent', {
      method: 'GET',
    });

    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);

    // Check if at least one activity is returned (mock data has several)
    expect(json.length).toBeGreaterThan(0);
    const activity = json[0];

    // Verify structure of the first activity object
    expect(activity).toHaveProperty('id');
    expect(typeof activity.id).toBe('string');
    expect(activity).toHaveProperty('type');
    expect(typeof activity.type).toBe('string');
    expect(activity).toHaveProperty('description');
    expect(typeof activity.description).toBe('string');
    expect(activity).toHaveProperty('timestamp');
    expect(typeof activity.timestamp).toBe('string');
    // Validate timestamp is a valid ISO string
    expect(() => new Date(activity.timestamp).toISOString()).not.toThrow();

    expect(activity).toHaveProperty('status'); // Optional based on spec, but mock provides it
    expect(typeof activity.status).toBe('string');
    expect(activity).toHaveProperty('link'); // Optional, mock provides it
    expect(typeof activity.link).toBe('string');

    // Ensure activities are sorted by timestamp descending (most recent first)
    if (json.length > 1) {
      const time1 = new Date(json[0].timestamp).getTime();
      const time2 = new Date(json[1].timestamp).getTime();
      expect(time1).toBeGreaterThanOrEqual(time2);
    }
  });

  test('should return up to 7 activities (as per mock implementation)', async () => {
    const req = new NextRequest('http://localhost/api/activity/recent', {
      method: 'GET',
    });
    const response = await GET(req);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.length).toBeLessThanOrEqual(7);
  });

  // Example of how to test error handling if the route had complex logic that could fail
  // For the current mock, it's hard to force an internal error without modifying the route itself.
  // If GET handler had, e.g., database calls that could be mocked to throw error:
  // test('should handle internal errors gracefully', async () => {
  //   // Mock a dependency to throw an error
  //   jest.spyOn(someInternalModule, 'getData').mockImplementationOnce(() => {
  //     throw new Error('Forced internal error');
  //   });
  //
  //   const req = new NextRequest('http://localhost/api/activity/recent');
  //   const response = await GET(req);
  //   const json = await response.json();
  //
  //   expect(response.status).toBe(500);
  //   expect(json.success).toBe(false);
  //   expect(json.message).toBe('Failed to fetch recent activity');
  //   expect(json.errors[0].message).toBe('Forced internal error');
  //
  //   someInternalModule.getData.mockRestore(); // Clean up spy
  // });
});
