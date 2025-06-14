import { NextResponse } from 'next/server';

interface FunnelActionDetail {
  type: 'send_email' | 'add_tag' | 'remove_tag' | 'notify_user' | 'wait_period' | 'move_to_stage' | 'update_lead_property';
  template_id?: string;
  tag_name?: string;
  user_id_to_notify?: string;
  message_template?: string;
  duration_days?: number;
  target_stage_id?: string;
  property_name?: string;
  property_value?: any;
}

interface FunnelAutomationRule {
  rule_id: string;
  funnel_id: string;
  rule_name: string;
  trigger_type: 'lead_enters_stage' | 'lead_exits_stage' | 'lead_stalled_in_stage' | 'tag_added_to_lead' | 'lead_property_updated';
  trigger_config: Record<string, any>;
  actions: FunnelActionDetail[];
  status: 'active' | 'inactive' | 'draft';
  execution_count: number;
  error_count: number;
  created_at: string;
  updated_at: string;
}

let mockFunnelAutomationRulesStore: Record<string, FunnelAutomationRule[]> = { // Changed to let
  'fnl_onboarding_001': [
    { rule_id: 'fauto_onboard_001', funnel_id: 'fnl_onboarding_001', rule_name: 'Welcome Email Follow-up', trigger_type: 'lead_enters_stage', trigger_config: { stage_id: 's2_email' }, actions: [{type: 'wait_period', duration_days: 2}, {type: 'send_email', template_id: 'tpl_product_tips_1'}], status: 'active', execution_count: 230, error_count: 0, created_at: '2023-10-15T00:00:00Z', updated_at: '2023-10-15T00:00:00Z' },
    { rule_id: 'fauto_onboard_002', funnel_id: 'fnl_onboarding_001', rule_name: 'Stalled Lead Nudge (Feature Used)', trigger_type: 'lead_stalled_in_stage', trigger_config: { stage_id: 's3_wait', days_stalled: 3 }, actions: [{type: 'add_tag', tag_name: 'stalled_feature_used'}, {type: 'notify_user', user_id_to_notify: 'sales_rep_1', message_template: 'Lead {lead_name} stalled at feature adoption.'}], status: 'active', execution_count: 45, error_count: 1, created_at: '2023-10-16T00:00:00Z', updated_at: '2023-10-16T00:00:00Z' },
    { rule_id: 'fauto_onboard_003', funnel_id: 'fnl_onboarding_001', rule_name: 'Inactive Post-Welcome', trigger_type: 'lead_stalled_in_stage', trigger_config: { stage_id: 's2_email', days_stalled: 5 }, actions: [{type: 'send_email', template_id: 'tpl_reengagemement_trial_1'}], status: 'inactive', execution_count: 15, error_count: 0, created_at: '2023-10-17T00:00:00Z', updated_at: '2023-10-17T00:00:00Z' },
  ],
  'fnl_webinar_002': [
    { rule_id: 'fauto_webinar_001', funnel_id: 'fnl_webinar_002', rule_name: 'Webinar Reminder (1 Day Before)', trigger_type: 'lead_enters_stage', trigger_config: { stage_id: 'ws2' /* Registered */ }, actions: [{type: 'wait_period', duration_days: 0 /* Logic more complex */}, {type: 'send_email', template_id: 'tpl_webinar_reminder_1day'}], status: 'active', execution_count: 180, error_count: 0, created_at: '2023-10-20T00:00:00Z', updated_at: '2023-10-20T00:00:00Z' },
  ]
};

let mockFunnelsListForAutomation = [ // Changed to let
    { id: 'fnl_onboarding_001', name: 'SaaS Trial Onboarding Funnel' },
    { id: 'fnl_webinar_002', name: 'Webinar Signup Funnel' },
];

const validRuleStatuses: FunnelAutomationRule['status'][] = ['active', 'inactive', 'draft'];
const validTriggerTypes: FunnelAutomationRule['trigger_type'][] = ['lead_enters_stage', 'lead_exits_stage', 'lead_stalled_in_stage', 'tag_added_to_lead', 'lead_property_updated'];
const validActionTypes: FunnelActionDetail['type'][] = ['send_email', 'add_tag', 'remove_tag', 'notify_user', 'wait_period', 'move_to_stage', 'update_lead_property'];


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const funnelId = searchParams.get('funnelId');
  const ruleStatusFilter = searchParams.get('ruleStatus') as FunnelAutomationRule['status'] | null;

  if (!funnelId) {
    return NextResponse.json({ error: { message: "Funnel ID (funnelId) is required as a query parameter." } }, { status: 400 });
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    let rulesForFunnel = mockFunnelAutomationRulesStore[funnelId] || [];

    if (ruleStatusFilter && validRuleStatuses.includes(ruleStatusFilter)) {
        rulesForFunnel = rulesForFunnel.filter(rule => rule.status === ruleStatusFilter);
    }

    const funnelDetails = mockFunnelsListForAutomation.find(f => f.id === funnelId);
    const activeRulesCount = (mockFunnelAutomationRulesStore[funnelId] || []).filter(r => r.status === 'active').length;
    const totalAutomatedActionsToday = Math.floor(Math.random() * 200);
    const totalErrorsToday = rulesForFunnel.reduce((sum, rule) => sum + rule.error_count, 0) > 0 ? Math.floor(Math.random() * 3) : 0; // Make errors more realistic if rules have errors

    return NextResponse.json({
        data: { // Wrapped response
            funnelId: funnelId,
            funnelName: funnelDetails?.name || "Unknown Funnel",
            activeRulesCount: activeRulesCount,
            totalAutomatedActionsToday: totalAutomatedActionsToday,
            totalErrorsToday: totalErrorsToday,
            rules: rulesForFunnel
        }
    });
  } catch (error) {
    console.error("Error fetching funnel automation rules:", error);
    return NextResponse.json({ error: { message: "Error fetching funnel automation rules" } }, { status: 500 });
  }
}


export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const funnelId = searchParams.get('funnelId');
  if (!funnelId) {
    return NextResponse.json({ error: { message: "Funnel ID (funnelId) is required." } }, { status: 400 });
  }

  try {
    const body = await request.json() as Omit<FunnelAutomationRule, 'rule_id' | 'funnel_id' | 'created_at' | 'updated_at' | 'execution_count' | 'error_count'>;

    if (!body.rule_name || typeof body.rule_name !== 'string' || body.rule_name.trim() === '') {
        return NextResponse.json({ error: { message: "Rule name (rule_name) is required." } }, { status: 400 });
    }
    if (!body.trigger_type || !validTriggerTypes.includes(body.trigger_type)) {
        return NextResponse.json({ error: { message: `Invalid or missing trigger_type. Must be one of: ${validTriggerTypes.join(', ')}` } }, { status: 400 });
    }
    if (!body.actions || !Array.isArray(body.actions) || body.actions.length === 0) {
        return NextResponse.json({ error: { message: "At least one action is required." } }, { status: 400 });
    }
    for (const action of body.actions) {
        if (!action.type || !validActionTypes.includes(action.type)) {
            return NextResponse.json({ error: { message: `Invalid action type: ${action.type}. Must be one of: ${validActionTypes.join(', ')}` } }, { status: 400 });
        }
    }
    if (body.status && !validRuleStatuses.includes(body.status)) {
         return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validRuleStatuses.join(', ')}` } }, { status: 400 });
    }


    const newRule: FunnelAutomationRule = {
      ...body,
      rule_id: `fauto_${String(Date.now()).slice(-6)}_${Math.random().toString(36).substring(2,7)}`,
      funnel_id: funnelId,
      execution_count: 0,
      error_count: 0,
      status: body.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!mockFunnelAutomationRulesStore[funnelId]) {
      mockFunnelAutomationRulesStore[funnelId] = [];
    }
    mockFunnelAutomationRulesStore[funnelId].push(newRule);
    return NextResponse.json({ data: newRule }, { status: 201 });
  } catch (error) {
    console.error("Error creating funnel automation rule:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating funnel automation rule" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const funnelId = searchParams.get('funnelId');
  const ruleId = searchParams.get('ruleId');

  if (!funnelId || !ruleId) {
    return NextResponse.json({ error: { message: "Funnel ID (funnelId) and Rule ID (ruleId) are required." } }, { status: 400 });
  }

  try {
    const updates = await request.json() as Partial<Omit<FunnelAutomationRule, 'rule_id' | 'funnel_id' | 'created_at'>>;

    if (updates.status && !validRuleStatuses.includes(updates.status)) {
         return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validRuleStatuses.join(', ')}` } }, { status: 400 });
    }
    if (updates.trigger_type && !validTriggerTypes.includes(updates.trigger_type)) {
        return NextResponse.json({ error: { message: `Invalid trigger_type.` } }, { status: 400 });
    }
     if (updates.actions && (!Array.isArray(updates.actions) || updates.actions.some(a => !validActionTypes.includes(a.type)))) {
        return NextResponse.json({ error: { message: `Invalid action type found in actions list.` } }, { status: 400 });
    }

    const funnelRules = mockFunnelAutomationRulesStore[funnelId];
    if (!funnelRules) {
      return NextResponse.json({ error: { message: "Funnel not found or has no rules" } }, { status: 404 });
    }
    const ruleIndex = funnelRules.findIndex(r => r.rule_id === ruleId);
    if (ruleIndex === -1) {
      return NextResponse.json({ error: { message: "Automation rule not found in this funnel" } }, { status: 404 });
    }

    const updatedRule = {
      ...funnelRules[ruleIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    funnelRules[ruleIndex] = updatedRule;

    return NextResponse.json({ data: updatedRule });
  } catch (error) {
    console.error("Error updating funnel automation rule:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error updating funnel automation rule" } }, { status: 500 });
  }
}
