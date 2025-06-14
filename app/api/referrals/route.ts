import { NextResponse } from 'next/server';

interface OverallReferralStats {
  total_referrers: number;
  total_successful_referrals: number; // e.g. referee completed required action
  total_pending_referrals: number; // e.g. referee signed up but hasn't completed action
  conversion_rate_percent: number; // (successful_referrals / invites_sent_or_clicks) * 100 - needs more data for actual calculation
  total_rewards_paid_usd: number;
  most_effective_referrer?: { // Optional, could be more complex to calculate
    referrer_id: string;
    referrer_name: string;
    successful_referrals_count: number;
  };
}

// Mock data for overall referral program statistics
const mockOverallStats: OverallReferralStats = {
  total_referrers: 150,
  total_successful_referrals: 320,
  total_pending_referrals: 45,
  conversion_rate_percent: 25.5, // This would be dynamically calculated in a real app
  total_rewards_paid_usd: 4500,
  most_effective_referrer: {
    referrer_id: 'user_alice',
    referrer_name: 'Alice Wonderland',
    successful_referrals_count: 25,
  }
};

export async function GET(request: Request) {
  // In a real application, these stats would be aggregated from various data sources
  // like user data, referral tracking records, and reward payout logs.
  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return NextResponse.json({ data: mockOverallStats });
  } catch (error) {
    console.error("Error fetching overall referral stats:", error);
    return NextResponse.json({ error: { message: "Error fetching overall referral stats" } }, { status: 500 });
  }
}
