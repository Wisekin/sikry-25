import { NextResponse } from 'next/server';

interface ReviewEntry {
  review_id: string;
  platform: string;
  reviewer_name: string;
  reviewer_avatar_url?: string;
  rating: number;
  review_title?: string;
  review_text: string;
  review_date: string;
  original_review_url?: string;
  status: 'New' | 'Viewed' | 'Replied' | 'Archived' | 'Flagged' | 'Pending Reply';
  reply_text?: string;
  reply_date?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  notes?: string;
  last_fetched_at: string;
}

let mockReviews: ReviewEntry[] = [ // Changed to let
  { review_id: 'rev_gmb_001', platform: 'Google My Business', reviewer_name: 'Jane D.', rating: 5, review_title: 'Amazing Experience!', review_text: 'The team was fantastic and the product exceeded my expectations. Highly recommend to everyone looking for top-notch service!', review_date: '2023-11-15T10:30:00Z', original_review_url: '#', status: 'Replied', reply_text: 'Thank you Jane for your kind words! We are thrilled to hear about your positive experience.', reply_date: '2023-11-15T14:00:00Z', sentiment: 'Positive', last_fetched_at: new Date().toISOString() },
  { review_id: 'rev_tp_002', platform: 'Trustpilot', reviewer_name: 'John S.', rating: 2, review_title: 'Could be better, had some issues.', review_text: 'The setup process was a bit complicated and I had some issues with customer support response times. The product itself is okay once it works.', review_date: '2023-11-14T11:00:00Z', original_review_url: '#', status: 'Pending Reply', sentiment: 'Negative', last_fetched_at: new Date().toISOString() },
  { review_id: 'rev_fb_003', platform: 'Facebook Recommendation', reviewer_name: 'Alice B.', rating: 4, review_text: 'Good service overall, very helpful staff. The app is mostly intuitive and has helped our workflow.', review_date: '2023-11-14T09:15:00Z', original_review_url: '#', status: 'New', sentiment: 'Positive', last_fetched_at: new Date().toISOString() },
  { review_id: 'rev_cap_004', platform: 'Capterra', reviewer_name: 'Bob G.', rating: 3, review_title: 'Average, does the job.', review_text: 'It does what it says on the tin, but nothing extraordinary. Fair price for the features offered. Support was decent.', review_date: '2023-11-13T16:45:00Z', original_review_url: '#', status: 'Viewed', sentiment: 'Neutral', last_fetched_at: new Date().toISOString() },
];

const validReviewStatuses: ReviewEntry['status'][] = ['New', 'Viewed', 'Replied', 'Archived', 'Flagged', 'Pending Reply'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platformFilter = searchParams.get('platform');
  const ratingFilter = searchParams.get('rating');
  const statusFilter = searchParams.get('status') as ReviewEntry['status'] | null;

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filteredReviews = mockReviews;

    if (platformFilter) {
      filteredReviews = filteredReviews.filter(review => review.platform.toLowerCase().includes(platformFilter.toLowerCase()));
    }
    if (ratingFilter) {
      const rating = parseInt(ratingFilter, 10);
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        filteredReviews = filteredReviews.filter(review => review.rating === rating);
      }
    }
    if (statusFilter && validReviewStatuses.includes(statusFilter)) {
      filteredReviews = filteredReviews.filter(review => review.status === statusFilter);
    }

    return NextResponse.json({ data: filteredReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: { message: "Error fetching reviews" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { review_id, reply_text } = await request.json() as { review_id: string; reply_text: string };
    if (!review_id || typeof review_id !== 'string') {
      return NextResponse.json({ error: { message: "Valid review_id is required." } }, { status: 400 });
    }
    if (!reply_text || typeof reply_text !== 'string' || reply_text.trim() === '') {
      return NextResponse.json({ error: { message: "Reply text cannot be empty." } }, { status: 400 });
    }

    const reviewIndex = mockReviews.findIndex(r => r.review_id === review_id);
    if (reviewIndex === -1) {
      return NextResponse.json({ error: { message: "Review not found" } }, { status: 404 });
    }

    const updatedReview = {
        ...mockReviews[reviewIndex],
        reply_text: reply_text,
        status: 'Replied' as ReviewEntry['status'],
        reply_date: new Date().toISOString(),
        last_fetched_at: new Date().toISOString(),
    };
    mockReviews[reviewIndex] = updatedReview;

    return NextResponse.json({ data: updatedReview });
  } catch (error) {
    console.error("Error posting reply:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: { message: "Invalid JSON payload" } }, { status: 400 });
    }
    return NextResponse.json({ error: { message: "Error posting reply" } }, { status: 500 });
  }
}
