import { NextResponse } from 'next/server';

interface ReviewRequestRecord {
  request_id: string;
  date_sent: string;
  recipient_email: string;
  recipient_name?: string;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Reviewed' | 'Failed' | 'Bounced';
  review_platform_target: string;
  campaign_id?: string;
  review_link_clicked_at?: string;
  review_submitted_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

let mockReviewRequests: ReviewRequestRecord[] = [
  { request_id: 'req_001', date_sent: '2023-11-05T10:00:00Z', recipient_email: 'alice.j@example.com', recipient_name: 'Alice Johnson', status: 'Reviewed', review_platform_target: 'Google', campaign_id: 'q4_push', review_submitted_at: '2023-11-06T14:00:00Z', created_at: '2023-11-05T10:00:00Z', updated_at: '2023-11-06T14:00:00Z' },
  { request_id: 'req_002', date_sent: '2023-11-05T11:00:00Z', recipient_email: 'bob.w@example.com', recipient_name: 'Bob Williams', status: 'Opened', review_platform_target: 'Trustpilot', created_at: '2023-11-05T11:00:00Z', updated_at: '2023-11-05T15:00:00Z' },
  { request_id: 'req_003', date_sent: '2023-11-04T09:30:00Z', recipient_email: 'carol.d@example.com', recipient_name: 'Carol Davis', status: 'Sent', review_platform_target: 'Google', created_at: '2023-11-04T09:30:00Z', updated_at: '2023-11-04T09:30:00Z' },
  { request_id: 'req_004', date_sent: '2023-11-04T14:00:00Z', recipient_email: 'david.m@example.com', recipient_name: 'David Miller', status: 'Clicked', review_platform_target: 'Capterra', campaign_id: 'saas_promo', review_link_clicked_at: '2023-11-04T18:00:00Z', created_at: '2023-11-04T14:00:00Z', updated_at: '2023-11-04T18:00:00Z' },
  { request_id: 'req_005', date_sent: '2023-11-03T16:00:00Z', recipient_email: 'eve.w@example.com', recipient_name: 'Eve Wilson', status: 'Failed', review_platform_target: 'Google', created_at: '2023-11-03T16:00:00Z', updated_at: '2023-11-03T16:05:00Z', notes: "Invalid email address" },
];

const validRequestStatuses: ReviewRequestRecord['status'][] = ['Sent', 'Opened', 'Clicked', 'Reviewed', 'Failed', 'Bounced'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') as ReviewRequestRecord['status'] | null;
  const platformFilter = searchParams.get('review_platform_target');

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredRequests = mockReviewRequests;

    if (statusFilter && validRequestStatuses.includes(statusFilter)) {
      filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
    }
    if (platformFilter) {
      filteredRequests = filteredRequests.filter(req => req.review_platform_target.toLowerCase() === platformFilter.toLowerCase());
    }

    return NextResponse.json({ data: filteredRequests });
  } catch (error) {
    console.error("Error fetching review requests:", error);
    return NextResponse.json({ error: { message: "Error fetching review requests" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Omit<ReviewRequestRecord, 'request_id' | 'date_sent' | 'created_at' | 'updated_at' | 'status'>;

    if (!body.recipient_email || !/\S+@\S+\.\S+/.test(body.recipient_email)) { // Simple email validation
        return NextResponse.json({ error: { message: "Valid recipient_email is required." } }, { status: 400 });
    }
    if (!body.review_platform_target || typeof body.review_platform_target !== 'string' || body.review_platform_target.trim() === '') {
        return NextResponse.json({ error: { message: "review_platform_target is required." } }, { status: 400 });
    }

    const newRequest: ReviewRequestRecord = {
      ...body,
      request_id: `req_${String(Date.now()).slice(-6)}_${Math.random().toString(36).substring(2, 7)}`,
      date_sent: new Date().toISOString(),
      status: 'Sent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockReviewRequests.unshift(newRequest);
    return NextResponse.json({ data: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating review request:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error creating review request" } }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    if (!requestId) {
      return NextResponse.json({ error: { message: "Request ID (requestId) is required" } }, { status: 400 });
    }
    const { status, ...otherUpdates } = await request.json() as Partial<ReviewRequestRecord>;

    if (status && !validRequestStatuses.includes(status)) {
      return NextResponse.json({ error: { message: `Invalid status. Must be one of: ${validRequestStatuses.join(', ')}` } }, { status: 400 });
    }

    const requestIndex = mockReviewRequests.findIndex(r => r.request_id === requestId);
    if (requestIndex === -1) {
      return NextResponse.json({ error: { message: "Review request not found" } }, { status: 404 });
    }

    const updatedRequest = {
        ...mockReviewRequests[requestIndex],
        ... (status && { status }), // only update status if provided
        ...otherUpdates, // apply other potential updates
        updated_at: new Date().toISOString()
    };
    mockReviewRequests[requestIndex] = updatedRequest;

    return NextResponse.json({ data: updatedRequest });
  } catch (error) {
    console.error("Error updating review request:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error updating review request" } }, { status: 500 });
  }
}
