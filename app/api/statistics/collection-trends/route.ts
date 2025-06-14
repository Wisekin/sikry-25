import { NextResponse } from 'next/server';

interface TrendDataPoint {
  date: string; // YYYY-MM-DD or YYYY-MM depending on period
  count: number;
}

interface CollectionTrendsResponse {
  period: 'daily' | 'weekly' | 'monthly';
  data: TrendDataPoint[];
  summaryStats: {
    totalCollectedInPeriod: number;
    averageDailyCollection?: number; // if period is not daily
    peakCollection: { date: string; count: number };
  };
}

// Helper to generate mock data
const generateMockTrendData = (period: 'daily' | 'weekly' | 'monthly', days: number): TrendDataPoint[] => {
  const data: TrendDataPoint[] = [];
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days); // Start from 'days' ago

  for (let i = 0; i < days; i++) {
    let dateStr = '';
    let items = Math.floor(Math.random() * 150) + 20; // Random count

    if (period === 'daily') {
      dateStr = currentDate.toISOString().split('T')[0];
    } else if (period === 'weekly') {
      // For weekly, group by week start (e.g., Monday)
      if (i % 7 === 0) { // New week
        const weekStartDate = new Date(currentDate);
        weekStartDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
        dateStr = weekStartDate.toISOString().split('T')[0];
        items = Math.floor(Math.random() * 700) + 100; // Weekly sum
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
        continue; // Skip for non-start of week if weekly
      }
    } else { // monthly
      if (i === 0 || currentDate.getDate() === 1) { // New month
         dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
         items = Math.floor(Math.random() * 3000) + 500; // Monthly sum
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
        continue; // Skip for non-start of month if monthly
      }
    }
    data.push({ date: dateStr, count: items });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | null;
  const requestedPeriod = periodParam && ['daily', 'weekly', 'monthly'].includes(periodParam) ? periodParam : 'daily';

  let daysToFetch = 30; // Default for daily
  if (requestedPeriod === 'weekly') daysToFetch = 90; // Approx 3 months for weekly
  if (requestedPeriod === 'monthly') daysToFetch = 365; // Approx 1 year for monthly

  const trendData = generateMockTrendData(requestedPeriod, daysToFetch);

  if (trendData.length === 0) {
    // This case should ideally not happen with generateMockTrendData logic but as a safeguard
    return NextResponse.json({ data: { period: requestedPeriod, data: [], summaryStats: { totalCollectedInPeriod: 0, peakCollection: { date: '', count: 0} } } });
  }

  const totalCollected = trendData.reduce((sum, item) => sum + item.count, 0);
  const peak = trendData.reduce((max, item) => item.count > max.count ? item : max, trendData[0] || { date: '', count: 0 });


  const responseData: CollectionTrendsResponse = {
    period: requestedPeriod,
    data: trendData,
    summaryStats: {
      totalCollectedInPeriod: totalCollected,
      averageDailyCollection: requestedPeriod !== 'daily' && daysToFetch > 0 ? Math.round(totalCollected / daysToFetch) : undefined,
      peakCollection: { date: peak.date, count: peak.count },
    }
  };

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error("Error fetching collection trends data:", error);
    return NextResponse.json({ error: { message: "Error fetching collection trends data" } }, { status: 500 });
  }
}
