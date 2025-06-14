import { NextResponse } from 'next/server';

interface LeadClassificationStats {
  hot_leads_count: number;
  warm_leads_count: number;
  cold_leads_count: number;
  unclassified_leads_count: number;
}

interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  classification_target: 'Hot' | 'Warm' | 'Cold';
  criteria_summary: string;
}

// Mock data store
let mockClassificationStats: LeadClassificationStats = {
  hot_leads_count: 78,
  warm_leads_count: 230,
  cold_leads_count: 1150,
  unclassified_leads_count: 310,
};

let mockClassificationRules: ClassificationRule[] = [
    { id: 'rule_cold_1', name: 'Inactive Users', classification_target: 'Cold', description: 'Users who have not logged in or opened an email in the last 90 days.', criteria_summary: 'Last active > 90 days' },
    { id: 'rule_cold_2', name: 'Low Engagement', classification_target: 'Cold', description: 'Users with an engagement score below 10, indicating minimal interaction.', criteria_summary: 'Engagement score < 10' },
    { id: 'rule_warm_1', name: 'Recent Product Interest', classification_target: 'Warm', description: 'Users who visited key product pages or the pricing page in the last 14 days.', criteria_summary: 'Visited key pages (product, pricing) recently' },
    { id: 'rule_hot_1', name: 'High Intent Signals', classification_target: 'Hot', description: 'Users who requested a demo, started a trial, or had multiple high-value interactions in the last 30 days.', criteria_summary: 'Demo request, Trial started, or multiple high-value interactions' },
];

export async function GET(request: Request) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    return NextResponse.json({
      data: { // Wrapped response
        stats: mockClassificationStats,
        rules: mockClassificationRules,
      }
    });
  } catch (error) {
    console.error("Error fetching lead classification data:", error);
    return NextResponse.json({ error: { message: "Error fetching lead classification data" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newRuleData = await request.json() as Omit<ClassificationRule, 'id'>;

    // Basic validation
    if (!newRuleData.name || typeof newRuleData.name !== 'string' || newRuleData.name.trim() === '') {
        return NextResponse.json({ error: { message: "Rule name is required." } }, { status: 400 });
    }
    if (!newRuleData.classification_target || !['Hot', 'Warm', 'Cold'].includes(newRuleData.classification_target)) {
        return NextResponse.json({ error: { message: "Invalid or missing classification_target. Must be 'Hot', 'Warm', or 'Cold'." } }, { status: 400 });
    }
    if (!newRuleData.criteria_summary || typeof newRuleData.criteria_summary !== 'string' || newRuleData.criteria_summary.trim() === '') {
        return NextResponse.json({ error: { message: "Criteria summary is required." } }, { status: 400 });
    }
    // Description is optional, so no validation for it here.

    const createdRule: ClassificationRule = {
      ...newRuleData,
      id: `rule_${String(Date.now()).slice(-5)}_${Math.random().toString(36).substring(2, 7)}`,
    };
    mockClassificationRules.push(createdRule);

    return NextResponse.json({ data: createdRule }, { status: 201 });
  } catch (error) {
    console.error("Error creating classification rule:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating classification rule" } }, { status: 500 });
  }
}
