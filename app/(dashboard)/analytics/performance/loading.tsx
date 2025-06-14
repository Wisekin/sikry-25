import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import { Skeleton } from '@/src/components/ui/skeleton';

export default function PerformanceAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title="Performance Analytics" subtitle="Loading performance data..." />
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {/* Adjusted to 6 cards to match the new layout */}
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
        </div>
        <Skeleton className="h-96 rounded-lg bg-white" />
        <Skeleton className="h-64 rounded-lg bg-white mt-6" />
      </div>
    </div>
  );
}
