import { NextResponse, type NextRequest } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

export interface LeadResponseRule {
  id: string;
  name: string;
  trigger: string; // Description of the trigger
  actions: string[]; // Array of descriptions for actions
  status: 'active' | 'inactive';
  createdAt: string;
  lastModified: string;
  priority?: number; // Optional field
}

// In-memory store for mock rules
let mockRules: LeadResponseRule[] = [
  {
    id: 'rule-001',
    name: 'High-Intent Website Lead',
    trigger: "Lead submits 'Request Demo' form AND visits pricing page > 2 times.",
    actions: ['Assign to Sales Team Alpha', 'Send "Demo Confirmed" email', 'Create CRM task for follow-up in 24h.'],
    status: 'active',
    createdAt: '2024-06-01T10:00:00Z',
    lastModified: '2024-07-15T14:30:00Z',
    priority: 1,
  },
  {
    id: 'rule-002',
    name: 'EMEA Region General Inquiry',
    trigger: "Lead's country is in EMEA region AND inquiry type is 'General Information'.",
    actions: ['Assign to EMEA Support Queue', 'Send "Thanks for your inquiry - EMEA" auto-reply.'],
    status: 'active',
    createdAt: '2024-05-20T09:15:00Z',
    lastModified: '2024-07-01T11:05:00Z',
    priority: 2,
  },
  {
    id: 'rule-003',
    name: 'Low-Engagement Lead Nurturing',
    trigger: "Lead score < 30 AND no activity in last 14 days.",
    actions: ['Add to "Low Engagement Nurture" email sequence.', 'Update CRM status to "Nurturing".'],
    status: 'inactive',
    createdAt: '2024-04-10T16:00:00Z',
    lastModified: '2024-06-25T10:00:00Z',
    priority: 5,
  },
  {
    id: 'rule-004',
    name: 'Competitor Domain Alert',
    trigger: "Lead's email domain matches known competitor list.",
    actions: ['Notify #sales-intel Slack channel.', 'Tag lead as "Competitor" in CRM.'],
    status: 'active',
    createdAt: '2024-07-01T12:00:00Z',
    lastModified: '2024-07-01T12:00:00Z',
    priority: 3,
  },
];

// GET all rules
export async function GET() {
  const delay = Math.random() * 200 + 100; // 0.1 to 0.3 seconds delay
  // The frontend might expect data wrapped in a 'data' property based on other existing APIs
  const responseData = { data: mockRules, success: true };
  const response = await createMockApiResponse(responseData, delay);
  return NextResponse.json(response);
}

// POST a new rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newRule: LeadResponseRule = {
      id: `rule-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`, // semi-unique ID
      name: body.name || 'Untitled Rule',
      trigger: body.trigger || 'Undefined trigger',
      actions: body.actions || [],
      status: body.status || 'inactive',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      priority: body.priority || mockRules.length + 1,
    };
    mockRules.push(newRule);
    // Return the new rule, perhaps wrapped for consistency
    const response = await createMockApiResponse({ data: newRule, success: true, message: "Lead response rule created successfully" }, 200);
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Invalid request body', errors: [{code: "create_error", message: e instanceof Error ? e.message : "Unknown error"}] }, { status: 400 });
  }
}

// PUT (update) an existing rule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const ruleId = body.id;
    if (!ruleId) {
      return NextResponse.json({ success: false, message: 'Rule ID is required for update' }, { status: 400 });
    }
    const ruleIndex = mockRules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) {
      return NextResponse.json({ success: false, message: 'Rule not found' }, { status: 404 });
    }
    const updatedRuleDetails = { ...body, lastModified: new Date().toISOString() };
    // Ensure fields not typically sent in PUT (like createdAt) are preserved from original if not sent
    mockRules[ruleIndex] = { ...mockRules[ruleIndex], ...updatedRuleDetails };
    
    const response = await createMockApiResponse({ data: mockRules[ruleIndex], success: true, message: "Lead response rule updated successfully" }, 150);
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Invalid request body or processing error', errors: [{code: "update_error", message: e instanceof Error ? e.message : "Unknown error"}] }, { status: 400 });
  }
}

// DELETE a rule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('id');
    if (!ruleId) {
      return NextResponse.json({ success: false, message: 'Rule ID is required for deletion' }, { status: 400 });
    }
    const initialLength = mockRules.length;
    mockRules = mockRules.filter(r => r.id !== ruleId);
    if (mockRules.length === initialLength) {
      return NextResponse.json({ success: false, message: 'Rule not found' }, { status: 404 });
    }
    const response = await createMockApiResponse({ success: true, message: `Rule ${ruleId} deleted successfully` }, 100);
    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Error processing delete request', errors: [{code: "delete_error", message: e instanceof Error ? e.message : "Unknown error"}] }, { status: 400 });
  }
}
