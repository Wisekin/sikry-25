import { NextResponse } from 'next/server';

interface FinancialSummaryData {
  keyMetrics: {
    totalRevenueYTD: number;
    totalExpensesYTD: number;
    netProfitYTD: number;
    averageTransactionValue: number;
    burnRateMonthly: number;
    revenueGrowthPercentage: number;
  };
  monthlyPerformance: Array<{
    month: string;
    year: number;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

const generateMockSummaryData = (period?: string | null): FinancialSummaryData => {
  // Base data
  let baseData: FinancialSummaryData = {
    keyMetrics: {
      totalRevenueYTD: 125678.50,
      totalExpensesYTD: 75234.20,
      netProfitYTD: 50444.30,
      averageTransactionValue: 450.75,
      burnRateMonthly: 6250.00,
      revenueGrowthPercentage: 15.5,
    },
    monthlyPerformance: [
      { month: 'January', year: 2023, revenue: 25000, expenses: 15000, profit: 10000 },
      { month: 'February', year: 2023, revenue: 28000, expenses: 16000, profit: 12000 },
      { month: 'March', year: 2023, revenue: 32000, expenses: 18000, profit: 14000 },
      { month: 'April', year: 2023, revenue: 30500, expenses: 17500, profit: 13000 },
      // ... more months for a YTD
    ],
    expenseBreakdown: [
      { category: 'Salaries & Wages', amount: 35000, percentage: 46.5 },
      { category: 'Marketing & Advertising', amount: 15000, percentage: 19.9 },
      { category: 'Operations & Rent', amount: 12000, percentage: 16.0 },
      { category: 'Software & Subscriptions', amount: 8000, percentage: 10.6 },
      { category: 'Other', amount: 5234.20, percentage: 7.0 },
    ],
  };

  // Simulate data change for QTD - this is a very basic simulation
  if (period === 'QTD') {
    baseData.keyMetrics.totalRevenueYTD = baseData.keyMetrics.totalRevenueYTD / 4; // Approx 1 quarter
    baseData.keyMetrics.totalExpensesYTD = baseData.keyMetrics.totalExpensesYTD / 4;
    baseData.keyMetrics.netProfitYTD = baseData.keyMetrics.netProfitYTD / 4;
    // Only show last 1-2 months for QTD
    baseData.monthlyPerformance = baseData.monthlyPerformance.slice(-2);
    // Adjust expense breakdown amounts (simplified)
    baseData.expenseBreakdown = baseData.expenseBreakdown.map(item => ({
        ...item,
        amount: item.amount / 4,
    }));
    // Recalculate percentages for QTD if necessary (keeping it simple for mock)
  }
  // Add more period simulations (e.g., MTD) as needed

  return baseData;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period'); // e.g., "YTD", "QTD"

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

    const summaryData = generateMockSummaryData(period);

    return NextResponse.json({ data: summaryData });
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    return NextResponse.json({ error: { message: "Error fetching financial summary" } }, { status: 500 });
  }
}
