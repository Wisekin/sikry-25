import { NextResponse } from 'next/server';

interface OverallReviewStats {
  total_reviews: number;
  average_rating: number;
  new_reviews_this_month: number;
  pending_reply_count: number;
  sentiment_overview: { // Example, could be more detailed
    positive_percent: number;
    neutral_percent: number;
    negative_percent: number;
  };
}

// Mock data for overall review statistics
// In a real app, this would be calculated from the mockReviews in monitoring/route.ts or a database
const mockOverallStats: OverallReviewStats = {
  total_reviews: 785, // Example value
  average_rating: 4.6, // Example value
  new_reviews_this_month: 62, // Example value
  pending_reply_count: 8, // Example value, should match unresolved reviews from monitoring
  sentiment_overview: {
    positive_percent: 75,
    neutral_percent: 15,
    negative_percent: 10,
  },
};

export async function GET(request: Request) {
  // In a real application, these stats would be aggregated from the reviews data source.
  // For now, we use a static mock object.
  // To make it slightly more dynamic with existing mock data (from monitoring):
  // const total_reviews = mockReviews.length; (Need to import mockReviews or have shared data source)
  // const average_rating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / total_reviews;
  // const pending_reply_count = mockReviews.filter(r => r.status === 'New' || r.status === 'Pending Reply').length;

  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return NextResponse.json({ data: mockOverallStats });
  } catch (error) {
    console.error("Error fetching overall review stats:", error);
    return NextResponse.json({ error: { message: "Error fetching overall review stats" } }, { status: 500 });
  }
}
