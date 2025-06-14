import React from 'react';
import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import QualityMetricCard from '@/src/components/ui/quality-metric-card';
import { Search, MessageCircle,ThumbsUp, ThumbsDown, CornerDownRight, Star as StarIcon, Filter as FilterIcon } from 'lucide-react'; // StarIcon to avoid conflict with Star component if any

interface ReviewEntry {
  id: string;
  platform: string; // e.g., 'Google', 'Trustpilot', 'Facebook'
  reviewerName: string;
  avatarUrl?: string; // Optional
  rating: number; // 1-5
  reviewTitle?: string;
  reviewText: string;
  reviewDate: string;
  status: 'New' | 'Viewed' | 'Replied' | 'Pending Reply'; // Added Pending Reply
  replyText?: string;
  sentiment?: 'Positive' | 'Neutral' | 'Negative';
}

const ReviewMonitoringPage = () => {
  // Mock data
  const stats = {
    newReviewsToday: 12,
    pendingReply: 8,
    overallSentimentPositive: 75, // Percentage
  };

  const reviews: ReviewEntry[] = [
    { id: 'rev001', platform: 'Google', reviewerName: 'Jane Doe', rating: 5, reviewTitle: 'Amazing Experience!', reviewText: 'The team was fantastic and the product exceeded my expectations. Highly recommend!', reviewDate: '2023-11-15', status: 'Replied', replyText: 'Thank you Jane for your kind words!', sentiment: 'Positive' },
    { id: 'rev002', platform: 'Trustpilot', reviewerName: 'John Smith', rating: 2, reviewTitle: 'Could be better', reviewText: 'The setup process was a bit complicated and I had some issues with customer support response times.', reviewDate: '2023-11-14', status: 'Pending Reply', sentiment: 'Negative' },
    { id: 'rev003', platform: 'Facebook', reviewerName: 'Alice Brown', rating: 4, reviewText: 'Good service overall, very helpful staff. The app is mostly intuitive.', reviewDate: '2023-11-14', status: 'New', sentiment: 'Positive' },
    { id: 'rev004', platform: 'Google', reviewerName: 'Bob Green', rating: 3, reviewTitle: 'Average', reviewText: 'It does what it says, but nothing extraordinary. Fair price for the features.', reviewDate: '2023-11-13', status: 'Viewed', sentiment: 'Neutral' },
  ];

  const getSentimentStyle = (sentiment?: ReviewEntry['sentiment']) => {
    if (sentiment === 'Positive') return 'bg-green-100 text-green-700';
    if (sentiment === 'Negative') return 'bg-red-100 text-red-700';
    if (sentiment === 'Neutral') return 'bg-amber-100 text-amber-700'; // Using amber for neutral
    return 'bg-gray-100 text-gray-700';
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <StarIcon key={i} size={16} className={`inline-block ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
    ));
  };

  const getStatusBadgeStyle = (status: ReviewEntry['status']) => {
    switch (status) {
        case 'Replied': return 'bg-green-100 text-green-700';
        case 'New': return 'bg-blue-100 text-blue-700';
        case 'Viewed': return 'bg-indigo-100 text-indigo-700';
        case 'Pending Reply': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title="Review Monitoring" subtitle="Track and respond to customer reviews from various platforms." />

      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <QualityMetricCard title="New Reviews Today" value={stats.newReviewsToday} icon={<Search className="text-blue-600" />} />
          <QualityMetricCard title="Pending Reply" value={stats.pendingReply} icon={<MessageCircle className="text-amber-600" />} />
          <QualityMetricCard title="Overall Sentiment" value={`${stats.overallSentimentPositive}% Positive`} icon={<ThumbsUp className="text-emerald-600" />} />
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <select className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Platforms</option>
              <option value="google">Google</option>
              <option value="trustpilot">Trustpilot</option>
              <option value="facebook">Facebook</option>
            </select>
            <select className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select className="p-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Viewed">Viewed</option>
              <option value="Replied">Replied</option>
              <option value="Pending Reply">Pending Reply</option>
            </select>
            <button className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center text-sm justify-center">
              <FilterIcon size={16} className="mr-2" /> Apply Filters
            </button>
          </div>
        </div>

        {/* Reviews List Section */}
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-2">
                <div className="flex items-start mb-2 sm:mb-0">
                    {/* Placeholder for avatar - replace with img tag if avatarUrl is present */}
                    {/* review.avatarUrl ? <img src={review.avatarUrl} alt={review.reviewerName} className="w-10 h-10 rounded-full mr-3" /> : <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-400"><User size={20}/></div> */}
                    <div>
                        <h3 className="font-semibold text-gray-800">{review.reviewerName}
                            <span className="text-xs text-gray-500 ml-2">on {review.platform}</span>
                        </h3>
                        <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-gray-500 ml-2">({review.rating}/5)</span>
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-500 text-left sm:text-right">
                    {review.reviewDate}
                    {review.sentiment && (
                        <span className={`ml-0 sm:ml-2 mt-1 sm:mt-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getSentimentStyle(review.sentiment)}`}>
                            {review.sentiment}
                        </span>
                    )}
                </div>
              </div>
              {review.reviewTitle && <h4 className="font-medium text-gray-700 mb-1 mt-2">{review.reviewTitle}</h4>}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{review.reviewText}</p>

              {review.replyText && (
                <div className="mt-3 pt-3 border-t border-gray-200 pl-4 border-l-2 border-blue-500 bg-gray-50/50 p-3 rounded-r-md">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">Your Reply:</p>
                  <p className="text-sm text-gray-600">{review.replyText}</p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeStyle(review.status)}`}>
                    Status: {review.status}
                </span>
                <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">View Original</a>
                    {review.status !== 'Replied' && (
                    <button className="bg-[#1B1F3B] hover:bg-[#2A3050] text-white py-1.5 px-3 rounded-md text-xs flex items-center transition-colors">
                        <CornerDownRight size={14} className="mr-1.5" /> Reply
                    </button>
                    )}
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-center py-10 text-gray-500">No reviews to display.</p>}
        </div>
      </div>
    </div>
  );
};

export default ReviewMonitoringPage;
