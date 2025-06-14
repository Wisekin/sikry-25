import { NextResponse } from 'next/server';

interface PerformanceSummaryMetrics {
  totalVisits: number;
  uniqueVisitors: number;
  avgSessionDurationMinutes: number;
  bounceRatePercent: number;
  pagesPerVisit: number;
  topReferrer: string;
}
interface ActivityDataPoint { date: string; visits: number; pageViews: number; }
interface TopPage { path: string; views: number; }
interface PerformanceData {
    summaryMetrics: PerformanceSummaryMetrics;
    activityOverTime: ActivityDataPoint[];
    topPages: TopPage[];
}

// Mock data generation
const generatePerformanceData = (period: string): PerformanceData => {
  let days = 30;
  let periodMultiplier = 1;
  if (period === 'last7days') {
    days = 7;
    periodMultiplier = 7/30;
  }
  if (period === 'last3months') {
    days = 90;
    periodMultiplier = 3;
  }

  const summaryMetrics: PerformanceSummaryMetrics = {
    totalVisits: Math.floor((Math.random() * 20000 + 10000) * periodMultiplier),
    uniqueVisitors: Math.floor((Math.random() * 15000 + 5000) * periodMultiplier),
    avgSessionDurationMinutes: parseFloat((Math.random() * 10 + 2).toFixed(1)),
    bounceRatePercent: parseFloat((Math.random() * 50 + 20).toFixed(1)),
    pagesPerVisit: parseFloat((Math.random() * 5 + 1.5).toFixed(1)),
    topReferrer: ['Google', 'Direct', 'Social Media', 'ReferralSite.com', 'Email Campaign X'][Math.floor(Math.random()*5)],
  };
  // Ensure unique visitors is not more than total visits
  summaryMetrics.uniqueVisitors = Math.min(summaryMetrics.totalVisits, summaryMetrics.uniqueVisitors);


  const activityOverTime: ActivityDataPoint[] = [];
  let currentDate = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - (days - 1 - i));
    const dailyVisits = Math.floor(Math.random() * (summaryMetrics.totalVisits / days * 1.8)) + Math.floor(summaryMetrics.totalVisits / days * 0.2);
    activityOverTime.push({
      date: date.toISOString().split('T')[0],
      visits: dailyVisits,
      pageViews: Math.floor(dailyVisits * (summaryMetrics.pagesPerVisit * (Math.random() * 0.4 + 0.8))), // pageviews related to visits and pagesPerVisit
    });
  }

  const topPagesData = [
    { path: '/home', viewsMultiplier: 0.4 },
    { path: '/features', viewsMultiplier: 0.25 },
    { path: '/pricing', viewsMultiplier: 0.15 },
    { path: '/blog/popular-post', viewsMultiplier: 0.1 },
    { path: '/contact', viewsMultiplier: 0.05 },
    { path: '/about-us', viewsMultiplier: 0.03 },
    { path: '/blog/another-post', viewsMultiplier: 0.02 },
  ];

  let remainingPageViews = summaryMetrics.totalVisits * summaryMetrics.pagesPerVisit;
  const topPages : TopPage[] = topPagesData.map(p => {
      const views = Math.floor(remainingPageViews * p.viewsMultiplier);
      remainingPageViews -= views;
      return {path: p.path, views: views};
  }).filter(p => p.views > 0) // Only include pages with some views
  .sort((a,b) => b.views - a.views);


  return { summaryMetrics, activityOverTime, topPages };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'last30days';

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    const performanceData = generatePerformanceData(period as string);
    return NextResponse.json({ data: performanceData });
  } catch (error) {
    console.error("Error fetching performance analytics data:", error);
    return NextResponse.json({ error: { message: "Error fetching performance analytics data" } }, { status: 500 });
  }
}
