import { NextResponse } from 'next/server';

interface ReferralTrackRecord {
  referral_id: string;
  date_initiated: string;
  referrer_user_id: string;
  referrer_name: string;
  referee_email: string;
  referee_name?: string;
  referee_user_id?: string;
  status: 'Invited' | 'Signed Up' | 'Pending Criteria' | 'Converted' | 'Reward Paid' | 'Expired' | 'Failed';
  conversion_date?: string;
  reward_id?: string;
  reward_amount_usd?: number;
  notes?: string;
  last_updated_at: string;
}

let mockAllReferralRecords: ReferralTrackRecord[] = [ // Changed to let
  { referral_id: 'trk_001', date_initiated: '2023-10-01T10:00:00Z', referrer_user_id: 'user_alice', referrer_name: 'Alice Wonderland', referee_email: 'friend1@example.com', referee_name: 'Friend One', referee_user_id: 'user_friend1', status: 'Reward Paid', conversion_date: '2023-10-05T14:00:00Z', reward_id: 'rew_standard_50', reward_amount_usd: 50, last_updated_at: '2023-10-05T14:00:00Z' },
  { referral_id: 'trk_002', date_initiated: '2023-10-05T11:00:00Z', referrer_user_id: 'user_bob', referrer_name: 'Bob The Builder', referee_email: 'friend2@example.com', referee_name: 'Friend Two', referee_user_id: 'user_friend2', status: 'Signed Up', last_updated_at: '2023-10-06T09:00:00Z' },
  { referral_id: 'trk_003', date_initiated: '2023-10-10T12:00:00Z', referrer_user_id: 'user_charlie', referrer_name: 'Charlie Brown', referee_email: 'friend3@example.com', referee_name: 'Friend Three', referee_user_id: 'user_friend3', status: 'Pending Criteria', notes: 'Awaiting first purchase over $20.', last_updated_at: '2023-10-11T10:00:00Z' },
  { referral_id: 'trk_004', date_initiated: '2023-10-15T13:00:00Z', referrer_user_id: 'user_diana', referrer_name: 'Diana Prince', referee_email: 'friend4@example.com', status: 'Invited', last_updated_at: '2023-10-15T13:00:00Z' },
  { referral_id: 'trk_005', date_initiated: '2023-09-20T14:00:00Z', referrer_user_id: 'user_edward', referrer_name: 'Edward Scissorhands', referee_email: 'friend5@example.com', status: 'Failed', notes: 'Referee marked as existing customer.', last_updated_at: '2023-09-25T10:00:00Z' },
  { referral_id: 'trk_006', date_initiated: '2023-11-01T09:00:00Z', referrer_user_id: 'user_alice', referrer_name: 'Alice Wonderland', referee_email: 'friend6@example.com', referee_name: 'Friend Six', referee_user_id: 'user_friend6', status: 'Converted', conversion_date: '2023-11-05T16:00:00Z', reward_id: 'rew_standard_50', reward_amount_usd: 50, notes: 'Eligible for payout.', last_updated_at: '2023-11-05T16:00:00Z' },
];

const validReferralStatuses: ReferralTrackRecord['status'][] = ['Invited', 'Signed Up', 'Pending Criteria', 'Converted', 'Reward Paid', 'Expired', 'Failed'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') as ReferralTrackRecord['status'] | null;
  const referrerNameFilter = searchParams.get('referrer_name');

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredRecords = mockAllReferralRecords;

    if (statusFilter && validReferralStatuses.includes(statusFilter)) {
      filteredRecords = filteredRecords.filter(record => record.status === statusFilter);
    }

    if (referrerNameFilter) {
      filteredRecords = filteredRecords.filter(record =>
        record.referrer_name.toLowerCase().includes(referrerNameFilter.toLowerCase())
      );
    }

    return NextResponse.json({ data: filteredRecords });
  } catch (error) {
    console.error("Error fetching referral tracking data:", error);
    return NextResponse.json({ error: { message: "Error fetching referral tracking data" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const referralId = searchParams.get('referralId');
    if (!referralId) {
      return NextResponse.json({ error: { message: "Referral ID (referralId) is required for update" } }, { status: 400 });
    }

    const updates = await request.json() as Partial<Omit<ReferralTrackRecord, 'referral_id' | 'date_initiated' | 'referrer_user_id' | 'referrer_name' | 'referee_email'>>;

    // Basic validation for updates
    if (updates.status && !validReferralStatuses.includes(updates.status)) {
        return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validReferralStatuses.join(', ')}` } }, { status: 400 });
    }
    if (updates.reward_amount_usd && (typeof updates.reward_amount_usd !== 'number' || updates.reward_amount_usd < 0) ) {
        return NextResponse.json({ error: { message: "Invalid reward_amount_usd. Must be a non-negative number." } }, { status: 400 });
    }


    const recordIndex = mockAllReferralRecords.findIndex(r => r.referral_id === referralId);

    if (recordIndex === -1) {
      return NextResponse.json({ error: { message: "Referral record not found" } }, { status: 404 });
    }

    mockAllReferralRecords[recordIndex] = {
      ...mockAllReferralRecords[recordIndex],
      ...updates,
      last_updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ data: mockAllReferralRecords[recordIndex] });
  } catch (error) {
    console.error("Error updating referral record:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error updating referral record" } }, { status: 500 });
  }
}
