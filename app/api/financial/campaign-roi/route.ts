import { NextResponse } from 'next/server';

interface CampaignRoiData {
  campaign_id: string;
  campaign_name: string;
  total_spend: number;
  total_revenue: number;
  net_profit: number;
  roi_percentage: number;
  start_date: string; // ISO date string
  end_date?: string; // ISO date string, optional
  status: 'active' | 'completed' | 'planned' | 'archived';
}

const mockCampaignRoiData: CampaignRoiData[] = [
  {
    campaign_id: 'camp_001',
    campaign_name: 'Q4 Holiday Push 2023',
    total_spend: 15000,
    total_revenue: 45000,
    net_profit: 30000,
    roi_percentage: 200,
    start_date: '2023-11-01T00:00:00Z',
    end_date: '2023-12-31T23:59:59Z',
    status: 'completed'
  },
  {
    campaign_id: 'camp_002',
    campaign_name: 'Spring Product Launch 2023',
    total_spend: 25000,
    total_revenue: 60000,
    net_profit: 35000,
    roi_percentage: 140,
    start_date: '2023-03-15T00:00:00Z',
    end_date: '2023-05-15T23:59:59Z',
    status: 'completed'
  },
  {
    campaign_id: 'camp_003',
    campaign_name: 'Summer SaaS Promo',
    total_spend: 10000,
    total_revenue: 12500,
    net_profit: 2500,
    roi_percentage: 25,
    start_date: '2023-06-01T00:00:00Z',
    end_date: '2023-08-31T23:59:59Z',
    status: 'completed'
  },
  {
    campaign_id: 'camp_004',
    campaign_name: 'New Year Engagement 2024',
    total_spend: 12000,
    total_revenue: 5000,
    net_profit: -7000,
    roi_percentage: -58.33,
    start_date: '2024-01-01T00:00:00Z',
    status: 'active'
  },
  {
    campaign_id: 'camp_005',
    campaign_name: 'Influencer Outreach Q1 2024',
    total_spend: 8000,
    total_revenue: 0,
    net_profit: -8000,
    roi_percentage: -100,
    start_date: '2024-02-01T00:00:00Z',
    status: 'planned'
  },
  {
    campaign_id: 'camp_006',
    campaign_name: 'Archived Test Campaign',
    total_spend: 1000,
    total_revenue: 500,
    net_profit: -500,
    roi_percentage: -50,
    start_date: '2022-01-01T00:00:00Z',
    end_date: '2022-01-31T23:59:59Z',
    status: 'archived'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

    let filteredCampaigns = mockCampaignRoiData;
    if (statusFilter && ['active', 'completed', 'planned', 'archived'].includes(statusFilter)) {
      filteredCampaigns = mockCampaignRoiData.filter(campaign => campaign.status === statusFilter);
    }

    return NextResponse.json({ data: filteredCampaigns });
  } catch (error) {
    console.error("Error fetching campaign ROI data:", error);
    return NextResponse.json({ error: { message: "Error fetching campaign ROI data" } }, { status: 500 });
  }
}
