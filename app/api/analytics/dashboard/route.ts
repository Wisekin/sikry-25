import { NextResponse } from 'next/server';

interface AnalyticsDashboardStats {
  overall_key_metric?: string;
  total_tracked_events?: number;
  active_users_today?: number; // Example of another stat
  conversion_rate_wow?: number; // Example: week-over-week change
}

const mockDashboardData: AnalyticsDashboardStats = {
  overall_key_metric: "Stable Growth QTD",
  total_tracked_events: 1780350,
  active_users_today: 1250,
  conversion_rate_wow: 2.5, // Represents +2.5%
};

export async function GET(request: Request) {
  try {
    // Simulate fetching data, perhaps from different services or a data warehouse
    await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay for more "realistic" loading of a dashboard

    // Potentially, you could vary mockDashboardData slightly based on query params (e.g., date range)
    // For now, it returns a static set.

    return NextResponse.json({ data: mockDashboardData });
  } catch (error) {
    console.error("Error fetching analytics dashboard data:", error);
    // Ensure a consistent error response structure
    return NextResponse.json({ error: { message: "Failed to fetch analytics dashboard data. Please try again later." } }, { status: 500 });
  }
}
