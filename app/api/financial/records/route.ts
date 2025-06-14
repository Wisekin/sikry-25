import { NextResponse } from 'next/server';

// Define the structure of a financial record based on Building-Plan.md
interface FinancialRecord {
  id: string;
  organization_id?: string;
  source_type: 'campaign' | 'contact' | 'manual_entry' | 'other';
  source_id?: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  timestamp: string; // ISO date string
  currency: string;
}

// Mock data for the API
let mockFinancialRecords: FinancialRecord[] = [ // Changed to let for in-memory modification
  {
    id: 'rec_001',
    source_type: 'manual_entry',
    amount: 1500.00,
    type: 'income',
    description: 'Payment for Invoice #INV-2023-001',
    timestamp: '2023-10-15T10:00:00Z',
    currency: 'USD'
  },
  {
    id: 'rec_002',
    source_type: 'other',
    amount: 99.50,
    type: 'expense',
    description: 'Monthly Software Subscription - CRM Pro',
    timestamp: '2023-10-14T14:30:00Z',
    currency: 'USD'
  },
  {
    id: 'rec_003',
    source_type: 'campaign',
    source_id: 'camp_xyz_789',
    amount: 5250.75,
    type: 'income',
    description: 'Revenue from Q4 Marketing Campaign',
    timestamp: '2023-10-10T16:45:00Z',
    currency: 'USD'
  },
  {
    id: 'rec_004',
    source_type: 'manual_entry',
    amount: 250.00,
    type: 'expense',
    description: 'Office Supplies Purchase',
    timestamp: '2023-10-05T11:20:00Z',
    currency: 'USD'
  },
  {
    id: 'rec_005',
    source_type: 'contact',
    source_id: 'cont_abc_123',
    amount: 75.00,
    type: 'expense',
    description: 'Client Gift Basket',
    timestamp: '2023-10-02T09:00:00Z',
    currency: 'USD'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get('type');

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

    let filteredRecords = mockFinancialRecords;
    if (typeFilter && (typeFilter === 'income' || typeFilter === 'expense')) {
      filteredRecords = mockFinancialRecords.filter(record => record.type === typeFilter);
    }

    return NextResponse.json({ data: filteredRecords });
  } catch (error) {
    console.error("Error fetching financial records:", error);
    return NextResponse.json({ error: { message: "Error fetching financial records" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newRecordData = await request.json() as Omit<FinancialRecord, 'id' | 'timestamp'>;

    // Basic type checking
    if (typeof newRecordData.amount !== 'number' || newRecordData.amount <= 0) {
      return NextResponse.json({ error: { message: "Invalid amount: Must be a positive number." } }, { status: 400 });
    }
    if (newRecordData.type !== 'income' && newRecordData.type !== 'expense') {
      return NextResponse.json({ error: { message: "Invalid type: Must be 'income' or 'expense'." } }, { status: 400 });
    }
    if (!newRecordData.description || typeof newRecordData.description !== 'string' || newRecordData.description.trim() === '') {
        return NextResponse.json({ error: { message: "Description is required." } }, { status: 400 });
    }
    if (!newRecordData.currency || typeof newRecordData.currency !== 'string' || newRecordData.currency.trim().length !== 3) {
        return NextResponse.json({ error: { message: "Valid 3-letter currency code is required." } }, { status: 400 });
    }
     if (!newRecordData.source_type || !['campaign', 'contact', 'manual_entry', 'other'].includes(newRecordData.source_type)) {
        return NextResponse.json({ error: { message: "Invalid source_type." } }, { status: 400 });
    }


    const createdRecord: FinancialRecord = {
      ...newRecordData,
      id: `rec_${String(Date.now()).slice(-5)}_${Math.random().toString(36).substring(2, 7)}`, // More unique ID
      timestamp: new Date().toISOString(),
    };
    mockFinancialRecords.push(createdRecord);
    return NextResponse.json({ data: createdRecord }, { status: 201 });
  } catch (error) {
    console.error("Error creating financial record:", error);
    if (error instanceof SyntaxError) { // Specifically for JSON parsing errors
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating financial record" } }, { status: 500 });
  }
}
