import { NextResponse } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

interface OverviewData {
  ruleCount: number;
  queueSize: number;
  processedToday: number;
  recentActivity: Array<{
    id: string;
    description: string;
    timestamp: string;
    type: 'rule_triggered' | 'lead_assigned' | 'error';
  }>;
}

const mockOverviewData: OverviewData = {
  ruleCount: 12,
  queueSize: 45,
  processedToday: 156,
  recentActivity: [
    {
      id: 'act-001',
      description: 'New lead assigned to Sales Team A',
      timestamp: new Date().toISOString(),
      type: 'lead_assigned'
    },
    {
      id: 'act-002',
      description: 'Rule "High Value Lead" triggered for lead #1234',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'rule_triggered'
    },
    {
      id: 'act-003',
      description: 'Error processing lead #1235: Invalid email format',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: 'error'
    }
  ]
};

export async function GET() {
  const delay = Math.random() * 500 + 1000;
  const data = await createMockApiResponse(mockOverviewData, delay);
  return NextResponse.json(data);
}
