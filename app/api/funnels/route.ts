import { NextResponse } from 'next/server';

interface OverallFunnelStats {
  total_funnels_count: number;
  total_leads_in_all_funnels: number; // Sum of leads from all active funnels
  average_conversion_rate_all_funnels: number; // Weighted average or simple average
  top_performing_funnel_by_conversion?: {
    funnel_id: string;
    funnel_name: string;
    conversion_rate_percent: number;
  };
  top_performing_funnel_by_revenue?: { // Assuming funnels can be tied to revenue
    funnel_id: string;
    funnel_name: string;
    revenue_generated_usd: number;
  };
}

// Mock data for overall funnel statistics
// In a real app, this would be calculated dynamically from all funnels data
const mockOverallFunnelStats: OverallFunnelStats = {
  total_funnels_count: 2, // Based on mockFunnelsList in progress/route.ts or builder/route.ts
  total_leads_in_all_funnels: 750, // Sum of 250 + 500 from mock progress data
  average_conversion_rate_all_funnels: 25.0, // (20+30)/2 = 25% (simple average)
  top_performing_funnel_by_conversion: {
    funnel_id: 'fnl_webinar_002',
    funnel_name: 'Webinar Signup Funnel',
    conversion_rate_percent: 30.0,
  },
  top_performing_funnel_by_revenue: { // Example, assuming revenue can be tracked per funnel
    funnel_id: 'fnl_onboarding_001',
    funnel_name: 'SaaS Trial Onboarding Funnel',
    revenue_generated_usd: 12500, // Mocked revenue
  },
};

export async function GET(request: Request) {
  // In a real application, these stats would be aggregated from the funnels data (builder definitions, progress data, etc.)
  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return NextResponse.json({ data: mockOverallFunnelStats });
  } catch (error) {
    console.error("Error fetching overall funnel stats:", error);
    return NextResponse.json({ error: { message: "Error fetching overall funnel stats" } }, { status: 500 });
  }
}
