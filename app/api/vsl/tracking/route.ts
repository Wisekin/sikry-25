import { NextResponse, type NextRequest } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

interface VSLTrackingSummary {
  totalViews: number;
  totalLeads: number;
  overallConversionRate: number; // Percentage
  totalVSLsTracked: number;
}

interface TimeSeriesDataPoint {
  date: string; // e.g., "2024-07-01"
  value: number;
}

interface PerVSLTrackingStat {
  pageId: string;
  pageTitle: string;
  views: number;
  leads: number;
  conversionRate: number; // Percentage
  watchTimeAvg?: number; // Optional: average watch time in seconds
}

// This structure will be returned when 'all' VSLs are selected.
interface AllVSLsTrackingData {
  type: 'all';
  summary: VSLTrackingSummary;
  viewsOverTime: TimeSeriesDataPoint[];
  leadsOverTime: TimeSeriesDataPoint[]; // Separate for clarity, or combine if preferred
  conversionRateOverTime: TimeSeriesDataPoint[];
  perPageStats: PerVSLTrackingStat[];
}

// This structure will be returned when a specific VSL ID is provided.
interface SingleVSLTrackingData {
  type: 'single';
  pageId: string;
  pageTitle: string;
  summary: Omit<PerVSLTrackingStat, 'pageId' | 'pageTitle'>; // Re-use PerVSLTrackingStat structure
  viewsOverTime: TimeSeriesDataPoint[];
  leadsOverTime: TimeSeriesDataPoint[];
  conversionRateOverTime: TimeSeriesDataPoint[];
  // Potentially more detailed stats for a single VSL, e.g., drop-off points
}

// Helper to generate some time series data
const generateTimeSeries = (days: number, startValue: number, fluctuation: number): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days); // Start from 'days' ago

  for (let i = 0; i < days; i++) {
    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: Math.max(0, Math.round(startValue + (Math.random() - 0.5) * fluctuation * 2)),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const mockVSLPages = [
  { id: 'vsl-page-001', title: 'Revolutionary SaaS Product Launch' },
  { id: 'vsl-page-002', title: 'Exclusive Webinar Sign-up VSL' },
  { id: 'vsl-page-004', title: 'New Feature Announcement VSL' },
];

const allVSLData: AllVSLsTrackingData = {
  type: 'all',
  summary: {
    totalViews: 28930,
    totalLeads: 1450,
    overallConversionRate: 5.01,
    totalVSLsTracked: 3,
  },
  viewsOverTime: generateTimeSeries(30, 900, 200), // 30 days, around 900 views/day, fluctuate by 200
  leadsOverTime: generateTimeSeries(30, 45, 10),   // 30 days, around 45 leads/day, fluctuate by 10
  conversionRateOverTime: generateTimeSeries(30, 5, 1.5), // 30 days, around 5% CR, fluctuate by 1.5%
  perPageStats: [
    { pageId: 'vsl-page-001', pageTitle: 'Revolutionary SaaS Product Launch', views: 15230, leads: 760, conversionRate: 5.0, watchTimeAvg: 120 },
    { pageId: 'vsl-page-002', pageTitle: 'Exclusive Webinar Sign-up VSL', views: 8500, leads: 450, conversionRate: 5.3, watchTimeAvg: 95 },
    { pageId: 'vsl-page-004', pageTitle: 'New Feature Announcement VSL', views: 5200, leads: 240, conversionRate: 4.6, watchTimeAvg: 150 },
  ],
};

const singleVSLDataStore: { [key: string]: SingleVSLTrackingData } = {
  'vsl-page-001': {
    type: 'single',
    pageId: 'vsl-page-001',
    pageTitle: 'Revolutionary SaaS Product Launch',
    summary: { views: 15230, leads: 760, conversionRate: 5.0, watchTimeAvg: 120 },
    viewsOverTime: generateTimeSeries(30, 500, 100),
    leadsOverTime: generateTimeSeries(30, 25, 5),
    conversionRateOverTime: generateTimeSeries(30, 5, 1),
  },
  'vsl-page-002': {
    type: 'single',
    pageId: 'vsl-page-002',
    pageTitle: 'Exclusive Webinar Sign-up VSL',
    summary: { views: 8500, leads: 450, conversionRate: 5.3, watchTimeAvg: 95 },
    viewsOverTime: generateTimeSeries(30, 280, 70),
    leadsOverTime: generateTimeSeries(30, 15, 4),
    conversionRateOverTime: generateTimeSeries(30, 5.3, 1.2),
  },
  'vsl-page-004': {
    type: 'single',
    pageId: 'vsl-page-004',
    pageTitle: 'New Feature Announcement VSL',
    summary: { views: 5200, leads: 240, conversionRate: 4.6, watchTimeAvg: 150 },
    viewsOverTime: generateTimeSeries(30, 170, 50),
    leadsOverTime: generateTimeSeries(30, 8, 3),
    conversionRateOverTime: generateTimeSeries(30, 4.6, 0.8),
  },
};


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const vslPageId = searchParams.get('vslPageId');
  // const period = searchParams.get('period'); // Period could be used to adjust time series data length/range

  let dataToReturn: AllVSLsTrackingData | SingleVSLTrackingData;

  if (vslPageId && vslPageId !== 'all' && singleVSLDataStore[vslPageId]) {
    dataToReturn = singleVSLDataStore[vslPageId];
  } else {
    dataToReturn = allVSLData;
  }
  
  const delay = Math.random() * 500 + 800; // 0.8 to 1.3 seconds delay
  const response = await createMockApiResponse(dataToReturn, delay);
  return NextResponse.json(response);
}
