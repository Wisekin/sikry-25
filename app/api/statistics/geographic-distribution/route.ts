import { NextResponse } from 'next/server';

interface GeoDataPoint {
  region_id: string;
  region_name: string;
  data_count: number;
  data_percentage?: number; // Percentage of total
  // Optional: more specific data if filtering by type
  // company_count?: number;
  // user_count?: number;
  // Example coordinates for map plotting
  latitude?: number;
  longitude?: number;
}

interface GeographicDistributionResponse {
  filter_summary: {
    data_type_filter?: string; // e.g., "All", "Companies", "Users"
    period_filter?: string; // e.g., "Last 30 Days", "All Time"
  };
  regions: GeoDataPoint[];
  summary_stats: {
    total_regions_with_data: number;
    top_region: { name: string; count: number };
  };
}

const mockGeoDataPoints: GeoDataPoint[] = [
  { region_id: "US", region_name: "United States", data_count: 12500, data_percentage: 44.6, latitude: 39.8283, longitude: -98.5795 },
  { region_id: "DE", region_name: "Germany", data_count: 4500, data_percentage: 16.1, latitude: 51.1657, longitude: 10.4515 },
  { region_id: "GB", region_name: "United Kingdom", data_count: 3800, data_percentage: 13.6, latitude: 55.3781, longitude: -3.4360 },
  { region_id: "IN", region_name: "India", data_count: 2200, data_percentage: 7.9, latitude: 20.5937, longitude: 78.9629 },
  { region_id: "CA", region_name: "Canada", data_count: 1800, data_percentage: 6.4, latitude: 56.1304, longitude: -106.3468 },
  { region_id: "FR", region_name: "France", data_count: 1500, data_percentage: 5.4 }, // No lat/lng for some
  { region_id: "AU", region_name: "Australia", data_count: 1200, data_percentage: 4.3 },
  // ... more regions
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get('dataType') || "All Data Types";
  const period = searchParams.get('period') || "All Time"; // Placeholder

  // Simulate filtering - in a real app, this would affect the data fetched
  let filteredData = [...mockGeoDataPoints]; // Create a copy to modify for filtering simulation
  if (dataType !== "All Data Types") {
    // Simple mock: just reduce counts slightly if filtered
    filteredData = filteredData.map(d => ({ ...d, data_count: Math.floor(d.data_count * (Math.random() * 0.3 + 0.7)) }));
    // Recalculate percentages if counts change
    const total = filteredData.reduce((sum, item) => sum + item.data_count, 0);
    if (total > 0) {
        // Ensure data_percentage is always defined when recalculating
        filteredData = filteredData.map(d => ({...d, data_percentage: parseFloat(((d.data_count / total) * 100).toFixed(1)) }));
    } else {
        filteredData = filteredData.map(d => ({...d, data_percentage: 0 }));
    }
  }

  filteredData.sort((a, b) => b.data_count - a.data_count); // Sort by count desc

  const topRegion = filteredData.length > 0 ? { name: filteredData[0].region_name, count: filteredData[0].data_count } : { name: 'N/A', count: 0};

  const responseData: GeographicDistributionResponse = {
    filter_summary: {
      data_type_filter: dataType,
      period_filter: period,
    },
    regions: filteredData,
    summary_stats: {
      total_regions_with_data: filteredData.length,
      top_region: topRegion,
    }
  };

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching geographic distribution data:", error);
    return NextResponse.json({ error: { message: "Error fetching geographic distribution data" } }, { status: 500 });
  }
}
