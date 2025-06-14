import { NextResponse } from 'next/server';

interface ReEngagementAutomationAction { // Renamed from AutomationAction
  type: 'send_email' | 'add_tag' | 'create_task' | 'wait' | 'notify_user';
  details: Record<string, any>;
}

interface ReEngagementAutomationRule { // Renamed from AutomationRule
  rule_id: string;
  rule_name: string;
  trigger_type: 'lead_classification_change' | 'lead_tag_added' | 'lead_inactive_period' | 'demo_completed' | 'custom_event'; // Added custom_event
  trigger_details: Record<string, any>;
  actions: ReEngagementAutomationAction[];
  status: 'active' | 'inactive' | 'draft'; // Added draft
  performance_metrics?: {
    emails_sent?: number;
    open_rate_percent?: number;
    click_rate_percent?: number;
    conversions?: number;
  };
  created_at: string;
  updated_at: string;
}

// Mock data store
let mockReEngagementAutomationRules: ReEngagementAutomationRule[] = [ // Renamed
  {
    rule_id: 're_auto_001', // Changed prefix for clarity
    rule_name: 'Cold Lead Nurturing - General',
    trigger_type: 'lead_classification_change',
    trigger_details: { new_classification: 'Cold', previous_classification_not: 'Cold' },
    actions: [
      { type: 'send_email', details: { template_id: 'tpl_re_cold_welcome_v1', subject: 'A Special Offer for You' } },
      { type: 'wait', details: { duration_days: 5 } },
      { type: 'add_tag', details: { tag_name: 're_engagement_cold_sequence_started' } }
    ],
    status: 'active',
    performance_metrics: { emails_sent: 1500, open_rate_percent: 18, click_rate_percent: 3, conversions: 25 },
    created_at: '2023-10-05T10:00:00Z',
    updated_at: '2023-10-08T14:00:00Z',
  },
  {
    rule_id: 're_auto_002',
    rule_name: 'Inactive User Follow-up Task',
    trigger_type: 'lead_inactive_period',
    trigger_details: { days_inactive: 30, segment_id: 'all_users' }, // Example details
    actions: [
      { type: 'create_task', details: { description: 'Follow-up with inactive user', assigned_to_group: 'Support Team', priority: 'medium' } },
      { type: 'add_tag', details: { tag_name: 'inactive_followup_task_created' } },
    ],
    status: 'active',
    performance_metrics: { conversions: 150 }, // e.g. tasks created
    created_at: '2023-10-06T11:00:00Z',
    updated_at: '2023-10-06T11:00:00Z',
  },
  {
    rule_id: 're_auto_003',
    rule_name: 'Post-Demo Engagement Flow (Draft)',
    trigger_type: 'demo_completed',
    trigger_details: { demo_outcome: 'positive' },
    actions: [
      { type: 'send_email', details: { template_id: 'tpl_post_demo_thank_you', subject: 'Thanks for the Demo!' } },
      { type: 'wait', details: { duration_days: 2 } },
      { type: 'send_email', details: { template_id: 'tpl_post_demo_followup_q', subject: 'Any Questions Post-Demo?' } },
    ],
    status: 'draft',
    created_at: '2023-09-20T09:00:00Z',
    updated_at: '2023-09-22T12:00:00Z',
  },
];

const validRuleStatuses: ReEngagementAutomationRule['status'][] = ['active', 'inactive', 'draft'];
const validTriggerTypes: ReEngagementAutomationRule['trigger_type'][] = ['lead_classification_change', 'lead_tag_added', 'lead_inactive_period', 'demo_completed', 'custom_event'];
const validActionTypes: ReEngagementAutomationAction['type'][] = ['send_email', 'add_tag', 'create_task', 'wait', 'notify_user'];


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') as ReEngagementAutomationRule['status'] | null;

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredRules = mockReEngagementAutomationRules;
    if (statusFilter && validRuleStatuses.includes(statusFilter)) {
        filteredRules = mockReEngagementAutomationRules.filter(rule => rule.status === statusFilter);
    }
    return NextResponse.json({ data: filteredRules });
  } catch (error) {
    console.error("Error fetching re-engagement automation rules:", error);
    return NextResponse.json({ error: { message: "Error fetching re-engagement automation rules" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newRuleData = await request.json() as Omit<ReEngagementAutomationRule, 'rule_id' | 'created_at' | 'updated_at' | 'performance_metrics'>;

    // Basic validation
    if (!newRuleData.rule_name || typeof newRuleData.rule_name !== 'string' || newRuleData.rule_name.trim() === '') {
        return NextResponse.json({ error: { message: "Rule name is required." } }, { status: 400 });
    }
    if (!newRuleData.trigger_type || !validTriggerTypes.includes(newRuleData.trigger_type)) {
        return NextResponse.json({ error: { message: `Invalid or missing trigger_type. Must be one of: ${validTriggerTypes.join(', ')}` } }, { status: 400 });
    }
    if (!newRuleData.actions || !Array.isArray(newRuleData.actions) || newRuleData.actions.length === 0) {
        return NextResponse.json({ error: { message: "At least one action is required." } }, { status: 400 });
    }
    for (const action of newRuleData.actions) {
        if (!action.type || !validActionTypes.includes(action.type)) {
            return NextResponse.json({ error: { message: `Invalid action type: ${action.type}. Must be one of: ${validActionTypes.join(', ')}` } }, { status: 400 });
        }
    }
    if (newRuleData.status && !validRuleStatuses.includes(newRuleData.status)) {
         return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validRuleStatuses.join(', ')}` } }, { status: 400 });
    }


    const newRule: ReEngagementAutomationRule = {
      ...newRuleData,
      rule_id: `re_auto_${String(Date.now()).slice(-6)}_${Math.random().toString(36).substring(2, 7)}`,
      status: newRuleData.status || 'draft', // Default to draft
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockReEngagementAutomationRules.push(newRule);
    return NextResponse.json({ data: newRule }, { status: 201 });
  } catch (error) {
    console.error("Error creating re-engagement automation rule:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating re-engagement automation rule" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId'); // Expect ruleId in query params
    if (!ruleId) {
      return NextResponse.json({ error: { message: "Rule ID (ruleId) is required for update" } }, { status: 400 });
    }

    const updates = await request.json() as Partial<Omit<ReEngagementAutomationRule, 'rule_id' | 'created_at'>>;

    // Validation for updates
    if (updates.status && !validRuleStatuses.includes(updates.status)) {
         return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validRuleStatuses.join(', ')}` } }, { status: 400 });
    }
    if (updates.trigger_type && !validTriggerTypes.includes(updates.trigger_type)) {
        return NextResponse.json({ error: { message: `Invalid trigger_type.` } }, { status: 400 });
    }
    if (updates.actions && (!Array.isArray(updates.actions) || updates.actions.some(a => !validActionTypes.includes(a.type)))) {
        return NextResponse.json({ error: { message: `Invalid action type found in actions list.` } }, { status: 400 });
    }


    const ruleIndex = mockReEngagementAutomationRules.findIndex(r => r.rule_id === ruleId);
    if (ruleIndex === -1) {
      return NextResponse.json({ error: { message: "Re-engagement automation rule not found" } }, { status: 404 });
    }

    mockReEngagementAutomationRules[ruleIndex] = {
      ...mockReEngagementAutomationRules[ruleIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ data: mockReEngagementAutomationRules[ruleIndex] });
  } catch (error) {
    console.error("Error updating re-engagement automation rule:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error updating re-engagement automation rule" } }, { status: 500 });
  }
}
