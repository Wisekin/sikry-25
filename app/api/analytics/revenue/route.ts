import { NextResponse } from 'next/server';

interface RevenueSummaryMetrics {
  totalRevenue: number;
  avgRevenuePerUser: number;
  monthlyRecurringRevenue?: number;
  lifetimeValue?: number;
}
interface RevenueTrendDataPoint { date: string; revenue: number; }
interface RevenueBreakdownItem { name: string; revenue: number; percentageOfTotal: number; }
interface RevenueData {
    summaryMetrics: RevenueSummaryMetrics;
    revenueOverTime: RevenueTrendDataPoint[];
    revenueBreakdown: RevenueBreakdownItem[];
    filtersApplied: { period: string; breakdownType: string };
}

const generateRevenueData = (period: string, breakdownType: string): RevenueData => {
  let days = 30;
  let periodMultiplier = 1; // For scaling revenue based on period length relative to 30 days
  let pointsToGenerate = 30; // Number of data points for time series

  if (period === 'last7days') {
    days = 7;
    periodMultiplier = 7 / 30;
    pointsToGenerate = 7;
  } else if (period === 'last3months') {
    days = 90;
    periodMultiplier = 3;
    pointsToGenerate = 12; // Approx 12 weeks
  } else if (period === 'last12months') {
    days = 365;
    periodMultiplier = 12;
    pointsToGenerate = 12; // 12 months
  }

  const baseTotalRevenue = 50000; // Base for a 30-day period
  const totalRevenue = Math.floor(baseTotalRevenue * periodMultiplier * (Math.random() * 0.4 + 0.8)); // Fluctuate by +/- 20%
  const totalUsers = Math.max(1, Math.floor((totalRevenue / ((Math.random() * 30) + 40)) * (Math.random() * 0.2 + 0.9)));


  const summaryMetrics: RevenueSummaryMetrics = {
    totalRevenue: totalRevenue,
    avgRevenuePerUser: parseFloat((totalRevenue / totalUsers).toFixed(2)),
    monthlyRecurringRevenue: Math.floor(totalRevenue / (days/30) * (Math.random() * 0.2 + 0.65)), // Approx 65-85% of period revenue normalized to month
    lifetimeValue: parseFloat(((totalRevenue / totalUsers) * (Math.random() * 6 + 6)).toFixed(2)),
  };
  // Ensure MRR is not greater than total revenue for short periods
  if (days < 30 && summaryMetrics.monthlyRecurringRevenue) {
    summaryMetrics.monthlyRecurringRevenue = Math.min(summaryMetrics.monthlyRecurringRevenue, totalRevenue);
  }


  const revenueOverTime: RevenueTrendDataPoint[] = [];
  let currentDate = new Date();
  for (let i = 0; i < pointsToGenerate; i++) {
    const date = new Date(currentDate);
    let dateStr = '';
    let pointRevenue = 0;

    if (period === 'last12months') {
      date.setMonth(currentDate.getMonth() - (pointsToGenerate - 1 - i));
      dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      pointRevenue = Math.floor(Math.random() * (totalRevenue / pointsToGenerate * 1.8)) + Math.floor(totalRevenue / pointsToGenerate * 0.2);
    } else if (period === 'last3months') { // Weekly points for 3 months
      date.setDate(currentDate.getDate() - ((pointsToGenerate - 1 - i) * 7)); // Go back by weeks
      dateStr = date.toISOString().split('T')[0]; // Start of week (approx)
      pointRevenue = Math.floor(Math.random() * (totalRevenue / pointsToGenerate * 1.8)) + Math.floor(totalRevenue / pointsToGenerate * 0.2);
    } else { // Daily for 7/30 days
      date.setDate(currentDate.getDate() - (pointsToGenerate - 1 - i));
      dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      pointRevenue = Math.floor(Math.random() * (totalRevenue / pointsToGenerate * 1.8)) + Math.floor(totalRevenue / pointsToGenerate * 0.2);
    }
    revenueOverTime.push({ date: dateStr, revenue: pointRevenue });
  }
   if (revenueOverTime.length === 0 && pointsToGenerate > 0) { // Safeguard for empty array
       revenueOverTime.push({ date: new Date().toISOString().split('T')[0], revenue: totalRevenue });
   }


  let revenueBreakdown: RevenueBreakdownItem[] = [];
  let breakdownItems: string[] = [];
  if (breakdownType === 'product') {
    breakdownItems = ['Product Alpha', 'Service Beta', 'Subscription Gamma', 'Add-on Delta', 'Consulting Epsilon'];
  } else if (breakdownType === 'segment') {
    breakdownItems = ['SMB', 'Mid-Market', 'Enterprise', 'Startups', 'Individual Pro'];
  } else { // region
    breakdownItems = ['North America', 'Europe', 'Asia-Pacific', 'LATAM', 'MEA', 'Other'];
  }

  let remainingRevenue = totalRevenue;
  const minPercentage = 5; // Minimum percentage for a slice to ensure it's visible

  for (let i = 0; i < breakdownItems.length; i++) {
    const isLast = i === breakdownItems.length - 1;
    let itemRevenue;
    if (isLast) {
        itemRevenue = Math.max(0, remainingRevenue); // Assign whatever is left, ensure non-negative
    } else {
        // Assign a random portion, ensuring it's not too small and leaves enough for others
        const maxPossibleForThisItem = remainingRevenue - (breakdownItems.length - 1 - i) * (totalRevenue * (minPercentage / 100));
        const randomShare = Math.random() * (0.5 - (minPercentage/100)) + (minPercentage/100); // e.g. 5% to 50%
        itemRevenue = Math.max(0, Math.min(Math.floor(totalRevenue * randomShare), maxPossibleForThisItem));
    }

    revenueBreakdown.push({
      name: breakdownItems[i],
      revenue: itemRevenue,
      percentageOfTotal: parseFloat(((itemRevenue / (totalRevenue || 1)) * 100).toFixed(1)),
    });
    remainingRevenue -= itemRevenue;
  }
  // If remainingRevenue is still > 0 due to rounding or logic, add to 'Other' or last item
   if(remainingRevenue > 0 && revenueBreakdown.length > 0) {
       const otherIndex = revenueBreakdown.findIndex(item => item.name === 'Other Sectors' || item.name === 'Other');
       if(otherIndex !== -1) revenueBreakdown[otherIndex].revenue += remainingRevenue;
       else revenueBreakdown[revenueBreakdown.length-1].revenue += remainingRevenue;
        // Recalculate percentages for accuracy after adjustment
        revenueBreakdown.forEach(item => item.percentageOfTotal = parseFloat(((item.revenue / (totalRevenue || 1)) * 100).toFixed(1)));
   }
  revenueBreakdown.sort((a,b) => b.revenue - a.revenue);


  return { summaryMetrics, revenueOverTime, revenueBreakdown, filtersApplied: { period, breakdownType } };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'last30days';
  const breakdownType = searchParams.get('breakdown') || 'product';

  try {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
    const revenueData = generateRevenueData(period as string, breakdownType as string);
    return NextResponse.json({ data: revenueData });
  } catch (error) {
    console.error("Error fetching revenue analytics data:", error);
    return NextResponse.json({ error: { message: "Error fetching revenue analytics data" } }, { status: 500 });
  }
}
