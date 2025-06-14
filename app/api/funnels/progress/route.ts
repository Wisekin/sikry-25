import { NextResponse } from 'next/server';

interface FunnelStageProgress {
  stage_id: string;
  stage_name: string;
  leads_in_stage: number;
  conversion_to_stage_percent: number;
  drop_off_from_stage_percent: number;
}

interface LeadInFunnelDetail {
  lead_id: string;
  lead_name: string;
  email: string;
  current_stage_id: string;
  current_stage_name: string;
  entry_date_to_funnel: string;
  time_in_current_stage_days: number;
  status: 'Progressing' | 'Stalled' | 'Converted' | 'Dropped';
}

interface FunnelProgressApiResponse {
  funnel_id: string;
  funnel_name: string;
  overall_stats: {
    total_leads_in_funnel: number;
    converted_leads: number;
    overall_conversion_rate_percent: number;
    average_time_in_funnel_days: number;
    leads_stalled_count?: number;
  };
  stages_progress: FunnelStageProgress[];
  leads_detail_sample?: LeadInFunnelDetail[];
}

let mockFunnelProgressDataStore: Record<string, FunnelProgressApiResponse> = { // Changed to let
  'fnl_onboarding_001': {
    funnel_id: 'fnl_onboarding_001',
    funnel_name: 'SaaS Trial Onboarding Funnel',
    overall_stats: { total_leads_in_funnel: 250, converted_leads: 50, overall_conversion_rate_percent: 20.0, average_time_in_funnel_days: 7, leads_stalled_count: 15 },
    stages_progress: [
      { stage_id: 's1', stage_name: 'Trial Signup', leads_in_stage: 100, conversion_to_stage_percent: 100, drop_off_from_stage_percent: 10 },
      { stage_id: 's2', stage_name: 'Welcome Email Sent', leads_in_stage: 90, conversion_to_stage_percent: 90, drop_off_from_stage_percent: 5 },
      { stage_id: 's3', stage_name: 'Key Feature Used', leads_in_stage: 70, conversion_to_stage_percent: 77.8, drop_off_from_stage_percent: 15 },
      { stage_id: 's4', stage_name: 'Converted to Paid', leads_in_stage: 50, conversion_to_stage_percent: 71.4, drop_off_from_stage_percent: 0 },
    ],
    leads_detail_sample: [
      { lead_id: 'lead_alice', lead_name: 'Alice Wonderland', email: 'alice@example.com', current_stage_id: 's3', current_stage_name: 'Key Feature Used', entry_date_to_funnel: '2023-11-10T00:00:00Z', time_in_current_stage_days: 2, status: 'Progressing' },
      { lead_id: 'lead_bob', lead_name: 'Bob The Builder', email: 'bob@example.com', current_stage_id: 's2', current_stage_name: 'Welcome Email Sent', entry_date_to_funnel: '2023-11-12T00:00:00Z', time_in_current_stage_days: 5, status: 'Stalled' },
      { lead_id: 'lead_clara', lead_name: 'Clara Oswald', email: 'clara@example.com', current_stage_id: 's4', current_stage_name: 'Converted to Paid', entry_date_to_funnel: '2023-11-01T00:00:00Z', time_in_current_stage_days: 0, status: 'Converted' },
      { lead_id: 'lead_danny', lead_name: 'Danny Pink', email: 'danny@example.com', current_stage_id: 's1', current_stage_name: 'Trial Signup', entry_date_to_funnel: '2023-11-15T00:00:00Z', time_in_current_stage_days: 1, status: 'Dropped' },
    ]
  },
  'fnl_webinar_002': {
    funnel_id: 'fnl_webinar_002',
    funnel_name: 'Webinar Signup Funnel',
    overall_stats: { total_leads_in_funnel: 500, converted_leads: 150, overall_conversion_rate_percent: 30.0, average_time_in_funnel_days: 3, leads_stalled_count: 30 },
    stages_progress: [
      { stage_id: 'ws1', stage_name: 'Visited Landing Page', leads_in_stage: 300, conversion_to_stage_percent: 100, drop_off_from_stage_percent: 20 },
      { stage_id: 'ws2', stage_name: 'Registered for Webinar', leads_in_stage: 200, conversion_to_stage_percent: 66.7, drop_off_from_stage_percent: 25 },
      { stage_id: 'ws3', stage_name: 'Attended Webinar', leads_in_stage: 150, conversion_to_stage_percent: 75.0, drop_off_from_stage_percent: 10 },
    ],
    leads_detail_sample: [
        { lead_id: 'lead_diana', lead_name: 'Diana Prince', email: 'diana@example.com', current_stage_id: 'ws3', current_stage_name: 'Attended Webinar', entry_date_to_funnel: '2023-10-20T00:00:00Z', time_in_current_stage_days: 1, status: 'Progressing' },
        { lead_id: 'lead_steve', lead_name: 'Steve Trevor', email: 'steve@example.com', current_stage_id: 'ws2', current_stage_name: 'Registered for Webinar', entry_date_to_funnel: '2023-10-19T00:00:00Z', time_in_current_stage_days: 3, status: 'Stalled' },
    ]
  }
};

let mockFunnelsList = [ // Changed to let
    { funnel_id: 'fnl_onboarding_001', funnel_name: 'SaaS Trial Onboarding Funnel', total_leads: 250, conversion_rate: 20.0 },
    { funnel_id: 'fnl_webinar_002', funnel_name: 'Webinar Signup Funnel', total_leads: 500, conversion_rate: 30.0 },
];

const validLeadStatuses: LeadInFunnelDetail['status'][] = ['Progressing', 'Stalled', 'Converted', 'Dropped'];


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const funnelId = searchParams.get('funnelId');
  const leadStatusFilter = searchParams.get('leadStatus') as LeadInFunnelDetail['status'] | null;

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (funnelId) {
      const progressData = mockFunnelProgressDataStore[funnelId];
      if (progressData) {
        let leadsDetail = progressData.leads_detail_sample || [];
        if (leadStatusFilter && validLeadStatuses.includes(leadStatusFilter)) {
            leadsDetail = leadsDetail.filter(lead => lead.status === leadStatusFilter);
        }
        return NextResponse.json({ data: { ...progressData, leads_detail_sample: leadsDetail } }); // Wrapped response
      }
      return NextResponse.json({ error: { message: "Funnel progress data not found" } }, { status: 404 });
    }
    return NextResponse.json({ data: mockFunnelsList }); // Wrapped response

  } catch (error) {
    console.error("Error fetching funnel progress:", error);
    return NextResponse.json({ error: { message: "Error fetching funnel progress" } }, { status: 500 });
  }
}
