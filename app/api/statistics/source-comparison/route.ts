import { NextResponse } from 'next/server';

interface DataSourceComparisonMetric {
  source_id: string;
  source_name: string;
  data_volume: number;
  quality_score?: number; // 0-100
  coverage_percent?: number; // 0-100
  update_frequency?: 'Real-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Ad-hoc';
  // Example: color hint for frontend chart consistency
  color_hint?: string;
}

interface SourceComparisonResponse {
  filter_summary: {
    metric_type_filter?: string; // e.g., "All", "Companies", "Contacts"
    period_filter?: string;
  };
  sources_metrics: DataSourceComparisonMetric[];
  summary_stats: {
    total_sources_compared: number;
    highest_volume_source?: { name: string; volume: number };
    best_quality_source?: { name:string; score: number };
  };
}

const mockSourceMetrics: DataSourceComparisonMetric[] = [
  { source_id: 'internal_db', source_name: 'Internal Database', data_volume: 1250000, quality_score: 92, coverage_percent: 85, update_frequency: 'Real-time', color_hint: 'hsl(200 80% 50%)' },
  { source_id: 'public_api_a', source_name: 'Public API Alpha', data_volume: 750000, quality_score: 78, coverage_percent: 60, update_frequency: 'Daily', color_hint: 'hsl(142.1 76.2% 42.2%)' },
  { source_id: 'scraped_data_x', source_name: 'Scraped Data (Source X)', data_volume: 300000, quality_score: 65, coverage_percent: 40, update_frequency: 'Weekly', color_hint: 'hsl(38.3 95.8% 53.1%)' },
  { source_id: 'partner_feed_b', source_name: 'Partner Feed Beta', data_volume: 950000, quality_score: 88, coverage_percent: 75, update_frequency: 'Daily', color_hint: 'hsl(260 70% 60%)' },
  { source_id: 'manual_entry', source_name: 'Manual Entry', data_volume: 50000, quality_score: 95, coverage_percent: 90, update_frequency: 'Ad-hoc', color_hint: 'hsl(300 70% 60%)' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metricType = searchParams.get('metricType') || "All Metrics";
  const period = searchParams.get('period') || "All Time";

  let filteredData = [...mockSourceMetrics];

  if (metricType !== "All Metrics") {
    // Simulate filtering: adjust values slightly for different metric types
    filteredData = filteredData.map(s => ({
      ...s,
      data_volume: Math.floor(s.data_volume * (Math.random() * 0.2 + 0.8)),
      quality_score: s.quality_score ? Math.max(50, Math.floor(s.quality_score * (Math.random() * 0.2 + 0.8))) : undefined,
    }));
  }

  filteredData.sort((a,b) => b.data_volume - a.data_volume); // Default sort by volume

  const highestVolume = filteredData.length > 0 ? { name: filteredData[0].source_name, volume: filteredData[0].data_volume } : undefined;

  const qualitySorted = [...filteredData].filter(s => s.quality_score !== undefined).sort((a,b) => (b.quality_score || 0) - (a.quality_score || 0));
  const bestQuality = qualitySorted.length > 0 ? { name: qualitySorted[0].source_name, score: qualitySorted[0].quality_score! } : undefined;


  const responseData: SourceComparisonResponse = {
    filter_summary: {
      metric_type_filter: metricType,
      period_filter: period,
    },
    sources_metrics: filteredData,
    summary_stats: {
      total_sources_compared: filteredData.length,
      highest_volume_source: highestVolume,
      best_quality_source: bestQuality,
    }
  };

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching source comparison data:", error);
    return NextResponse.json({ error: { message: "Error fetching source comparison data" } }, { status: 500 });
  }
}
