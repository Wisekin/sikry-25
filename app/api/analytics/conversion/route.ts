import { NextResponse } from 'next/server';

interface ConversionSummaryMetrics {
  overallConversionRatePercent: number;
  totalConversions: number;
  topConvertingFunnelName?: string;
  avgCostPerConversion?: number;
}
interface FunnelStage { id: string; name: string; visitors: number; conversionRateFromPreviousPercent?: number; dropOffRatePercent?: number;}
interface ConversionBySource { source: string; conversions: number; conversionRatePercent?: number; }
interface ConversionData {
    summaryMetrics: ConversionSummaryMetrics;
    funnelStages: FunnelStage[];
    conversionBySource: ConversionBySource[];
    filtersApplied: { period: string; funnelId: string; };
}

const generateConversionData = (period: string, funnelId: string): ConversionData => {
  let baseConversions = 100; // Default for 'all'
  if (funnelId === 'onboarding_funnel') baseConversions = 150;
  else if (funnelId === 'sales_funnel_q4') baseConversions = 250;

  let periodMultiplier = 1; // for last30days
  if (period === 'last7days') periodMultiplier = 0.25;
  else if (period === 'last3months') periodMultiplier = 3;

  const totalConversions = Math.floor(baseConversions * periodMultiplier * (Math.random() * 0.4 + 0.8));
  // Ensure totalVisitorsForRate is not zero to avoid NaN in overallConversionRatePercent
  const totalVisitorsForRate = Math.max(1, Math.floor(totalConversions / ((Math.random() * 0.15) + 0.05)));

  const summaryMetrics: ConversionSummaryMetrics = {
    overallConversionRatePercent: parseFloat(((totalConversions / totalVisitorsForRate) * 100).toFixed(1)),
    totalConversions: totalConversions,
    topConvertingFunnelName: funnelId === 'all' ? 'Sales Funnel Q4' : funnelId.replace(/_/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
    avgCostPerConversion: parseFloat(((Math.random() * 20) + 5).toFixed(2)),
  };

  let funnelStages: FunnelStage[];
  // More distinct stage names based on funnelId for realism
  if (funnelId === 'onboarding_funnel' || (funnelId === 'all' && summaryMetrics.topConvertingFunnelName?.includes('Onboarding'))) {
    const s1Visitors = Math.floor(totalVisitorsForRate * 0.8 * periodMultiplier);
    const s2Visitors = Math.floor(s1Visitors * (Math.random() * 0.2 + 0.6));
    const s3Visitors = Math.floor(s2Visitors * (Math.random() * 0.2 + 0.5));
    const s4Visitors = totalConversions;

    funnelStages = [
      { id: 's1_onboard', name: 'Visited Sign-up Page', visitors: s1Visitors, conversionRateFromPreviousPercent: undefined, dropOffRatePercent: parseFloat(((s1Visitors - s2Visitors) / (s1Visitors || 1) * 100).toFixed(1)) },
      { id: 's2_onboard', name: 'Completed Sign-up Form', visitors: s2Visitors, conversionRateFromPreviousPercent: parseFloat(((s2Visitors / (s1Visitors || 1)) * 100).toFixed(1)), dropOffRatePercent: parseFloat(((s2Visitors - s3Visitors) / (s2Visitors || 1) * 100).toFixed(1)) },
      { id: 's3_onboard', name: 'Activated Account', visitors: s3Visitors, conversionRateFromPreviousPercent: parseFloat(((s3Visitors / (s2Visitors || 1)) * 100).toFixed(1)), dropOffRatePercent: parseFloat(((s3Visitors - s4Visitors) / (s3Visitors || 1) * 100).toFixed(1)) },
      { id: 's4_onboard', name: 'First Key Action (Converted)', visitors: s4Visitors, conversionRateFromPreviousPercent: parseFloat(((s4Visitors / (s3Visitors || 1)) * 100).toFixed(1)), dropOffRatePercent: 0 },
    ];
  } else if (funnelId === 'sales_funnel_q4' || (funnelId === 'all' && summaryMetrics.topConvertingFunnelName?.includes('Sales'))) {
    const s1Sales = Math.floor(totalVisitorsForRate * 0.9 * periodMultiplier);
    const s2Sales = Math.floor(s1Sales * (Math.random() * 0.15 + 0.5)); // 50-65%
    const s3Sales = Math.floor(s2Sales * (Math.random() * 0.15 + 0.4)); // 40-55%
    const s4Sales = totalConversions;
     funnelStages = [
      { id: 's1_sales', name: 'Lead Acquired', visitors: s1Sales, conversionRateFromPreviousPercent: undefined, dropOffRatePercent: parseFloat(((s1Sales - s2Sales) / (s1Sales || 1) * 100).toFixed(1)) },
      { id: 's2_sales', name: 'Demo Scheduled', visitors: s2Sales, conversionRateFromPreviousPercent: parseFloat(((s2Sales / (s1Sales || 1)) * 100).toFixed(1)), dropOffRatePercent: parseFloat(((s2Sales - s3Sales) / (s2Sales || 1) * 100).toFixed(1)) },
      { id: 's3_sales', name: 'Proposal Sent', visitors: s3Sales, conversionRateFromPreviousPercent: parseFloat(((s3Sales / (s2Sales || 1)) * 100).toFixed(1)), dropOffRatePercent: parseFloat(((s3Sales - s4Sales) / (s3Sales || 1) * 100).toFixed(1)) },
      { id: 's4_sales', name: 'Deal Won (Converted)', visitors: s4Sales, conversionRateFromPreviousPercent: parseFloat(((s4Sales / (s3Sales || 1)) * 100).toFixed(1)), dropOffRatePercent: 0 },
    ];
  } else { // Generic stages for 'all' if no specific top funnel or other funnels
     const s1V = Math.floor(totalVisitorsForRate * 0.9 * periodMultiplier);
     const s2V = Math.floor(s1V * 0.7);
     funnelStages = [ {id: 'gen_s1', name: 'Entry Point', visitors: s1V, conversionRateFromPreviousPercent: undefined, dropOffRatePercent: 30}, {id: 'gen_s2', name: 'Converted', visitors: s2V, conversionRateFromPreviousPercent: 70, dropOffRatePercent: 0}];
  }


  const conversionBySource: ConversionBySource[] = [
    { source: 'Organic Search', conversions: Math.floor(totalConversions * 0.4), conversionRatePercent: parseFloat((Math.random() * 5 + 10).toFixed(1)) },
    { source: 'Paid Ads', conversions: Math.floor(totalConversions * 0.3), conversionRatePercent: parseFloat((Math.random() * 8 + 8).toFixed(1)) },
    { source: 'Referral', conversions: Math.floor(totalConversions * 0.15), conversionRatePercent: parseFloat((Math.random() * 10 + 15).toFixed(1)) },
    { source: 'Social Media', conversions: Math.floor(totalConversions * 0.1), conversionRatePercent: parseFloat((Math.random() * 4 + 5).toFixed(1)) },
    { source: 'Direct', conversions: Math.floor(totalConversions * 0.05), conversionRatePercent: parseFloat((Math.random() * 10 + 20).toFixed(1)) },
  ].sort((a,b) => b.conversions - a.conversions);

  return { summaryMetrics, funnelStages, conversionBySource, filtersApplied: { period, funnelId } };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'last30days';
  const funnelId = searchParams.get('funnelId') || 'all';

  try {
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
    const conversionData = generateConversionData(period as string, funnelId as string);
    return NextResponse.json({ data: conversionData });
  } catch (error) {
    console.error("Error fetching conversion analytics data:", error);
    return NextResponse.json({ error: { message: "Error fetching conversion analytics data" } }, { status: 500 });
  }
}
