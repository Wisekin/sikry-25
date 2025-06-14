import { NextResponse } from 'next/server';

interface UserReferralDashboardData {
  user_referral_code: string;
  user_referral_link: string;
  stats: {
    invites_sent_or_clicks: number;
    successful_referrals: number;
    pending_referrals: number;
    earned_rewards_usd: number;
  };
  referred_users_details: Array<{
    referral_id: string;
    name_or_email_preview: string;
    date_referred: string; // ISO date string
    status: 'Joined' | 'Pending Reward Criteria' | 'Reward Earned' | 'Inactive';
    reward_amount_usd_earned?: number;
  }>;
}

const mockUserDashboardData: UserReferralDashboardData = {
  user_referral_code: 'USER123XYZ',
  user_referral_link: 'https://yourapp.com/signup?ref=USER123XYZ',
  stats: {
    invites_sent_or_clicks: 75,
    successful_referrals: 8,
    pending_referrals: 3,
    earned_rewards_usd: 400,
  },
  referred_users_details: [
    { referral_id: 'ref_friend_alice', name_or_email_preview: 'Alice B.', date_referred: '2023-09-15T10:00:00Z', status: 'Reward Earned', reward_amount_usd_earned: 50 },
    { referral_id: 'ref_friend_bob', name_or_email_preview: 'bob****@example.com', date_referred: '2023-10-02T11:30:00Z', status: 'Joined', reward_amount_usd_earned: 0 },
    { referral_id: 'ref_friend_charlie', name_or_email_preview: 'Charlie D.', date_referred: '2023-10-20T14:15:00Z', status: 'Pending Reward Criteria', reward_amount_usd_earned: 0 },
    { referral_id: 'ref_friend_diana', name_or_email_preview: 'diana****@example.com', date_referred: '2023-08-01T09:00:00Z', status: 'Inactive', reward_amount_usd_earned: 0 },
    { referral_id: 'ref_friend_edward', name_or_email_preview: 'Edward F.', date_referred: '2023-07-10T16:45:00Z', status: 'Reward Earned', reward_amount_usd_earned: 50 },
  ],
};

export async function GET(request: Request) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return NextResponse.json({ data: mockUserDashboardData }); // Wrapped response
  } catch (error) {
    console.error("Error fetching user referral dashboard data:", error);
    return NextResponse.json({ error: { message: "Error fetching user referral dashboard data" } }, { status: 500 });
  }
}
