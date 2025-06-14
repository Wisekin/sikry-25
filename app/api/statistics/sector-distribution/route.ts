import { NextResponse } from 'next/server';

interface SectorDataPoint {
  sector_id: string;
  sector_name: string;
  data_count: number;
  data_percentage?: number; // Percentage of total
  color_hint?: string; // Optional color suggestion for charts
}

interface SectorDistributionResponse {
  filter_summary: {
    data_type_filter?: string;
    period_filter?: string;
  };
  sectors: SectorDataPoint[];
  summary_stats: {
    total_sectors_with_data: number;
    top_sector: { name: string; count: number };
    // fastest_growing_sector?: { name: string; growth_rate: number }; // More complex, omit for now
  };
}

const mockSectorDataPoints: SectorDataPoint[] = [
  { sector_id: "tech", sector_name: "Technology", data_count: 9800, data_percentage: 39.2, color_hint: 'hsl(200 80% 50%)' },
  { sector_id: "finance", sector_name: "Finance & Insurance", data_count: 5500, data_percentage: 22.0, color_hint: 'hsl(142.1 76.2% 42.2%)' },
  { sector_id: "healthcare", sector_name: "Healthcare", data_count: 3200, data_percentage: 12.8, color_hint: 'hsl(38.3 95.8% 53.1%)' },
  { sector_id: "retail", sector_name: "Retail & E-commerce", data_count: 2500, data_percentage: 10.0, color_hint: 'hsl(260 70% 60%)' },
  { sector_id: "manufacturing", sector_name: "Manufacturing", data_count: 1800, data_percentage: 7.2, color_hint: 'hsl(0 70% 60%)' },
  { sector_id: "education", sector_name: "Education", data_count: 1000, data_percentage: 4.0, color_hint: 'hsl(300 70% 60%)' },
  { sector_id: "other", sector_name: "Other Sectors", data_count: 1200, data_percentage: 4.8, color_hint: 'hsl(210 10% 70%)' },
];


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get('dataType') || "All Data Types";
  const period = searchParams.get('period') || "All Time";

  let filteredData = [...mockSectorDataPoints];

  if (dataType !== "All Data Types") {
    filteredData = filteredData.map(s => ({
      ...s,
      data_count: Math.floor(s.data_count * (Math.random() * 0.4 + 0.6)),
    }));
    const total = filteredData.reduce((sum, item) => sum + item.data_count, 0);
    if (total > 0) {
      filteredData.forEach(s => s.data_percentage = parseFloat(((s.data_count / total) * 100).toFixed(1)) );
    } else {
      filteredData.forEach(s => s.data_percentage = 0);
    }
  }

  filteredData.sort((a, b) => b.data_count - a.data_count);

  const topSector = filteredData.length > 0 ? { name: filteredData[0].sector_name, count: filteredData[0].data_count } : { name: 'N/A', count: 0};

  const responseData: SectorDistributionResponse = {
    filter_summary: {
      data_type_filter: dataType,
      period_filter: period,
    },
    sectors: filteredData,
    summary_stats: {
      total_sectors_with_data: filteredData.filter(s => s.data_count > 0).length,
      top_sector: topSector,
    }
  };

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching sector distribution data:", error);
    return NextResponse.json({ error: { message: "Error fetching sector distribution data" } }, { status: 500 });
  }
}
