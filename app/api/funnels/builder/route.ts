import { NextResponse } from 'next/server';

interface FunnelStepDefinition {
  step_id: string;
  type: 'trigger_form_submission' | 'trigger_tag_added' | 'action_send_email' | 'action_add_tag' | 'action_wait' | 'condition_email_opened' | 'condition_tag_exists';
  name?: string;
  properties: Record<string, any>;
  ui_position: { x: number; y: number };
  inputs?: string[];
  outputs?: string[];
}

interface FunnelDefinition {
  funnel_id: string;
  funnel_name: string;
  description?: string;
  steps: FunnelStepDefinition[];
  created_at: string;
  updated_at: string;
}

let mockFunnels: FunnelDefinition[] = [ // Changed to let
  {
    funnel_id: 'fnl_onboarding_001',
    funnel_name: 'SaaS Trial Onboarding Funnel',
    description: 'Nurtures new trial signups to become active users.',
    steps: [
      { step_id: 's1_form', type: 'trigger_form_submission', name: 'Trial Signup Form', properties: { form_id: 'trial_signup_v2' }, ui_position: { x: 50, y: 50 }, outputs: ['s2_email'] },
      { step_id: 's2_email', type: 'action_send_email', name: 'Welcome Email', properties: { template_id: 'tpl_welcome_trial_v2', subject: 'Welcome to OurApp!' }, ui_position: { x: 50, y: 150 }, inputs: ['s1_form'], outputs: ['s3_wait'] },
      { step_id: 's3_wait', type: 'action_wait', name: 'Wait 1 Day', properties: { duration_days: 1 }, ui_position: { x: 50, y: 250 }, inputs: ['s2_email'], outputs: ['s4_check_open'] },
      { step_id: 's4_check_open', type: 'condition_email_opened', name: 'Opened Welcome Email?', properties: { email_step_id: 's2_email' }, ui_position: { x: 50, y: 350 }, inputs: ['s3_wait'], outputs: ['s5a_tag_engaged', 's5b_followup_email'] },
      { step_id: 's5a_tag_engaged', type: 'action_add_tag', name: 'Tag as Engaged', properties: { tag_name: 'trial_engaged_welcome' }, ui_position: { x: -50, y: 450 }, inputs: ['s4_check_open'] },
      { step_id: 's5b_followup_email', type: 'action_send_email', name: 'Follow-up (Not Opened)', properties: { template_id: 'tpl_trial_followup_notopened' }, ui_position: { x: 150, y: 450 }, inputs: ['s4_check_open'] },
    ],
    created_at: '2023-10-01T00:00:00Z',
    updated_at: '2023-10-05T00:00:00Z',
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const funnelId = searchParams.get('funnelId');

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (funnelId) {
      const funnel = mockFunnels.find(f => f.funnel_id === funnelId);
      if (funnel) {
        return NextResponse.json({ data: funnel }); // Wrapped response
      }
      return NextResponse.json({ error: { message: "Funnel not found" } }, { status: 404 });
    }
    const funnelList = mockFunnels.map(f => ({ funnel_id: f.funnel_id, funnel_name: f.funnel_name, updated_at: f.updated_at }));
    return NextResponse.json({ data: funnelList }); // Wrapped response
  } catch (error) {
    console.error("Error fetching funnel(s):", error);
    return NextResponse.json({ error: { message: "Error fetching funnel(s)" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Omit<FunnelDefinition, 'funnel_id' | 'created_at' | 'updated_at'>;

    if (!body.funnel_name || typeof body.funnel_name !== 'string' || body.funnel_name.trim() === '') {
        return NextResponse.json({ error: { message: "Funnel name (funnel_name) is required." } }, { status: 400 });
    }
    if (!body.steps || !Array.isArray(body.steps)) { // Steps can be an empty array for a new funnel
        return NextResponse.json({ error: { message: "Steps must be an array." } }, { status: 400 });
    }
    // Add more validation for step structure if necessary

    const newFunnel: FunnelDefinition = {
      ...body,
      funnel_id: `fnl_${String(Date.now()).slice(-6)}_${Math.random().toString(36).substring(2,7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockFunnels.push(newFunnel);
    return NextResponse.json({ data: newFunnel }, { status: 201 });
  } catch (error) {
    console.error("Error creating funnel:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating funnel" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const funnelId = searchParams.get('funnelId');
  if (!funnelId) {
    return NextResponse.json({ error: { message: "Funnel ID (funnelId) is required for update" } }, { status: 400 });
  }

  try {
    const body = await request.json() as Partial<Omit<FunnelDefinition, 'funnel_id' | 'created_at'>>;

    if (body.funnel_name && (typeof body.funnel_name !== 'string' || body.funnel_name.trim() === '')) {
        return NextResponse.json({ error: { message: "Funnel name (funnel_name) must be a non-empty string if provided." } }, { status: 400 });
    }
    if (body.steps && !Array.isArray(body.steps)) {
        return NextResponse.json({ error: { message: "Steps must be an array if provided." } }, { status: 400 });
    }

    const funnelIndex = mockFunnels.findIndex(f => f.funnel_id === funnelId);

    if (funnelIndex === -1) {
      return NextResponse.json({ error: { message: "Funnel not found" } }, { status: 404 });
    }

    const updatedFunnel = {
      ...mockFunnels[funnelIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };
    mockFunnels[funnelIndex] = updatedFunnel;

    return NextResponse.json({ data: updatedFunnel });
  } catch (error) {
    console.error("Error updating funnel:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error updating funnel" } }, { status: 500 });
  }
}
