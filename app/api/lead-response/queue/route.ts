import { NextResponse } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

export interface LeadResponseQueueItem {
  id: string;
  leadId: string;
  leadIdentifier: string;
  ruleId: string;
  ruleTriggered: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  queuedAt: string;
  lastAttemptAt?: string;
  errorMessage?: string;
  retryCount: number;
}

const mockQueueItems: LeadResponseQueueItem[] = [
  {
    id: 'queue-001',
    leadId: 'lead-123',
    leadIdentifier: 'John Doe (john@example.com)',
    ruleId: 'rule-001',
    ruleTriggered: 'High Value Lead',
    status: 'completed',
    queuedAt: new Date(Date.now() - 3600000).toISOString(),
    lastAttemptAt: new Date(Date.now() - 3500000).toISOString(),
    retryCount: 0
  },
  {
    id: 'queue-002',
    leadId: 'lead-124',
    leadIdentifier: 'Jane Smith (jane@example.com)',
    ruleId: 'rule-002',
    ruleTriggered: 'New Lead Assignment',
    status: 'processing',
    queuedAt: new Date(Date.now() - 1800000).toISOString(),
    lastAttemptAt: new Date(Date.now() - 1700000).toISOString(),
    retryCount: 0
  },
  {
    id: 'queue-003',
    leadId: 'lead-125',
    leadIdentifier: 'Bob Wilson (bob@example.com)',
    ruleId: 'rule-001',
    ruleTriggered: 'High Value Lead',
    status: 'failed',
    queuedAt: new Date(Date.now() - 7200000).toISOString(),
    lastAttemptAt: new Date(Date.now() - 7100000).toISOString(),
    errorMessage: 'Failed to send notification email',
    retryCount: 2
  },
  {
    id: 'queue-004',
    leadId: 'lead-126',
    leadIdentifier: 'Alice Brown (alice@example.com)',
    ruleId: 'rule-003',
    ruleTriggered: 'Lead Scoring Update',
    status: 'retrying',
    queuedAt: new Date(Date.now() - 5400000).toISOString(),
    lastAttemptAt: new Date(Date.now() - 5300000).toISOString(),
    errorMessage: 'Temporary API error',
    retryCount: 1
  }
];

export async function GET() {
  const delay = Math.random() * 500 + 1000;
  const data = await createMockApiResponse(mockQueueItems, delay);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, action } = body;

    if (!itemId || !action) {
      return NextResponse.json(
        { error: { message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    if (!['retry', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: { message: 'Invalid action' } },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful response
    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed queue item ${itemId}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Failed to process request' } },
      { status: 500 }
    );
  }
}
