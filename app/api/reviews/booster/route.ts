import { NextResponse } from 'next/server';

interface ReviewBoosterStrategyTemplate {
  strategy_template_id: string;
  name: string;
  description: string;
  configurable_options: Array<{ key: string; label: string; type: 'number' | 'text' | 'template_id' | 'segment_id'; defaultValue?: any }>;
}

interface ActiveReviewBoosterCampaign {
  campaign_id: string;
  campaign_name: string;
  strategy_template_id: string;
  strategy_name: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Draft' | 'Archived';
  start_date: string;
  end_date?: string;
  configuration?: Record<string, any>;
  stats?: {
    requests_sent?: number;
    reviews_generated?: number;
    avg_rating?: number;
    conversion_rate_percent?: number;
  };
  created_at: string;
  updated_at: string;
}

const mockStrategyTemplates: ReviewBoosterStrategyTemplate[] = [
  { strategy_template_id: 'boost_email_sequence', name: 'Post-Purchase Email Sequence', description: 'Automatically request reviews N days after a successful purchase.', configurable_options: [{key: 'delay_days', label: 'Delay (days after purchase)', type: 'number', defaultValue: 7}, {key: 'email_template_id', label: 'Email Template ID', type: 'template_id'}] },
  { strategy_template_id: 'boost_sms_blast', name: 'Targeted SMS Blasts', description: 'Send review links via SMS to specific customer segments.', configurable_options: [{key: 'target_segment_id', label: 'Target Segment ID', type: 'segment_id'}, {key: 'sms_template_id', label: 'SMS Template ID', type: 'template_id'}] },
  { strategy_template_id: 'boost_qr_code', name: 'In-Store QR Code Link', description: 'Generate a unique link for QR codes to direct customers to review platforms.', configurable_options: [{key: 'review_platform_url', label: 'Review Platform URL', type: 'text'}] },
  { strategy_template_id: 'boost_social_contest', name: 'Social Media Review Contest', description: 'Run a contest to incentivize reviews on social media.', configurable_options: [{key: 'contest_details_url', label: 'Contest Details URL', type: 'text'}, {key: 'duration_days', label: 'Contest Duration (days)', type: 'number'}] },
];

let mockActiveCampaigns: ActiveReviewBoosterCampaign[] = [ // Changed to let
  { campaign_id: 'bcamp_001', campaign_name: 'Q4 Holiday Email Booster', strategy_template_id: 'boost_email_sequence', strategy_name: 'Post-Purchase Email Sequence', status: 'Active', start_date: '2023-10-15T00:00:00Z', configuration: {delay_days: 5, email_template_id: 'tpl_holiday_review'}, stats: { requests_sent: 300, reviews_generated: 35, avg_rating: 4.8, conversion_rate_percent: 11.67 }, created_at: '2023-10-10T00:00:00Z', updated_at: '2023-10-15T00:00:00Z' },
  { campaign_id: 'bcamp_002', campaign_name: 'VIP Customer SMS Push (Nov)', strategy_template_id: 'boost_sms_blast', strategy_name: 'Targeted SMS Blasts', status: 'Paused', start_date: '2023-11-01T00:00:00Z', configuration: {target_segment_id: 'seg_vip_nov', sms_template_id: 'tpl_vip_sms_review'}, stats: { requests_sent: 50, reviews_generated: 13, avg_rating: 4.5, conversion_rate_percent: 26.00 }, created_at: '2023-10-25T00:00:00Z', updated_at: '2023-11-05T00:00:00Z' },
  { campaign_id: 'bcamp_003', campaign_name: 'New Year Review Drive Prep', strategy_template_id: 'boost_email_sequence', strategy_name: 'Post-Purchase Email Sequence', status: 'Draft', start_date: '2024-01-05T00:00:00Z', created_at: '2023-11-10T00:00:00Z', updated_at: '2023-11-10T00:00:00Z' },
];

const validCampaignStatuses: ActiveReviewBoosterCampaign['status'][] = ['Active', 'Paused', 'Completed', 'Draft', 'Archived'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') as ActiveReviewBoosterCampaign['status'] | null;

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredCampaigns = mockActiveCampaigns;
    if (statusFilter && validCampaignStatuses.includes(statusFilter)) {
        filteredCampaigns = mockActiveCampaigns.filter(campaign => campaign.status === statusFilter);
    }

    return NextResponse.json({
        data: { // Wrapped response
            strategies: mockStrategyTemplates,
            campaigns: filteredCampaigns
        }
    });
  } catch (error) {
    console.error("Error fetching review booster data:", error);
    return NextResponse.json({ error: { message: "Error fetching review booster data" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { campaign_name: string; strategy_template_id: string; configuration?: Record<string,any>, start_date?: string };

    if (!body.campaign_name || typeof body.campaign_name !== 'string' || body.campaign_name.trim() === '') {
        return NextResponse.json({ error: { message: "Campaign name is required." } }, { status: 400 });
    }
    if (!body.strategy_template_id || typeof body.strategy_template_id !== 'string') {
        return NextResponse.json({ error: { message: "strategy_template_id is required." } }, { status: 400 });
    }
    const strategy = mockStrategyTemplates.find(s => s.strategy_template_id === body.strategy_template_id);
    if (!strategy) {
      return NextResponse.json({ error: { message: "Invalid strategy_template_id." } }, { status: 400 });
    }

    const newCampaign: ActiveReviewBoosterCampaign = {
      campaign_id: `bcamp_${String(Date.now()).slice(-6)}_${Math.random().toString(36).substring(2, 7)}`,
      campaign_name: body.campaign_name,
      strategy_template_id: body.strategy_template_id,
      strategy_name: strategy.name,
      status: 'Draft',
      start_date: body.start_date || new Date().toISOString(),
      configuration: body.configuration,
      stats: { reviews_generated: 0, requests_sent: 0 }, // Initialize stats
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockActiveCampaigns.push(newCampaign);
    return NextResponse.json({ data: newCampaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating review booster campaign:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating review booster campaign" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    if (!campaignId) {
      return NextResponse.json({ error: { message: "Campaign ID (campaignId) is required for update" } }, { status: 400 });
    }
    const updates = await request.json() as Partial<Omit<ActiveReviewBoosterCampaign, 'campaign_id' | 'strategy_template_id' | 'strategy_name' | 'created_at'>>;

    if (updates.status && !validCampaignStatuses.includes(updates.status)) {
        return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validCampaignStatuses.join(', ')}` } }, { status: 400 });
    }
    if (updates.start_date && isNaN(new Date(updates.start_date).getTime())) {
        return NextResponse.json({ error: { message: "Invalid start_date." } }, { status: 400 });
    }


    const campaignIndex = mockActiveCampaigns.findIndex(c => c.campaign_id === campaignId);
    if (campaignIndex === -1) {
      return NextResponse.json({ error: { message: "Campaign not found" } }, { status: 404 });
    }

    const updatedCampaign = {
      ...mockActiveCampaigns[campaignIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    mockActiveCampaigns[campaignIndex] = updatedCampaign;

    return NextResponse.json({ data: updatedCampaign });
  } catch (error) {
    console.error("Error updating review booster campaign:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error updating review booster campaign" } }, { status: 500 });
  }
}
