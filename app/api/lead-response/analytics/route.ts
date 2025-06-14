import { NextResponse } from 'next/server';
import { createMockApiResponse } from '@/utils/mockApiUtils';

interface AnalyticsData {
  summary: {
    totalLeads: number;
    processedLeads: number;
    averageResponseTime: number; // in minutes
    successRate: number; // percentage
  };
  timeSeriesData: Array<{
    date: string;
    leads: number;
    processed: number;
    responseTime: number;
  }>;
  rulePerformance: Array<{
    ruleId: string;
    ruleName: string;
    triggerCount: number;
    successRate: number;
    averageResponseTime: number;
  }>;
  errorDistribution: Array<{
    errorType: string;
    count: number;
    percentage: number;
  }>;
}

const mockAnalyticsData: AnalyticsData = {
  summary: {
    totalLeads: 1250,
    processedLeads: 1180,
    averageResponseTime: 4.5,
    successRate: 94.4
  },
  timeSeriesData: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseLeads = 40 + Math.random() * 20;
    return {
      date: date.toISOString().split('T')[0],
      leads: Math.round(baseLeads),
      processed: Math.round(baseLeads * 0.95),
      responseTime: 3 + Math.random() * 4
    };
  }),
  rulePerformance: [
    {
      ruleId: 'rule-001',
      ruleName: 'High Value Lead',
      triggerCount: 450,
      successRate: 98.2,
      averageResponseTime: 3.2
    },
    {
      ruleId: 'rule-002',
      ruleName: 'New Lead Assignment',
      triggerCount: 380,
      successRate: 95.5,
      averageResponseTime: 4.1
    },
    {
      ruleId: 'rule-003',
      ruleName: 'Lead Scoring Update',
      triggerCount: 320,
      successRate: 92.8,
      averageResponseTime: 5.3
    },
    {
      ruleId: 'rule-004',
      ruleName: 'Follow-up Reminder',
      triggerCount: 280,
      successRate: 96.7,
      averageResponseTime: 4.8
    }
  ],
  errorDistribution: [
    {
      errorType: 'Invalid Email Format',
      count: 35,
      percentage: 45.5
    },
    {
      errorType: 'API Timeout',
      count: 20,
      percentage: 26.0
    },
    {
      errorType: 'Missing Required Fields',
      count: 12,
      percentage: 15.6
    },
    {
      errorType: 'Other',
      count: 10,
      percentage: 13.0
    }
  ]
};

export async function GET() {
  const delay = Math.random() * 500 + 1000;
  const data = await createMockApiResponse(mockAnalyticsData, delay);
  return NextResponse.json({ data });
}
