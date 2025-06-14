import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import { Skeleton } from '@/src/components/ui/skeleton'; // Assuming this path

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title="Analytics Overview" subtitle="Loading insights..." />
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-40 rounded-lg bg-white" />
          <Skeleton className="h-40 rounded-lg bg-white" />
          <Skeleton className="h-40 rounded-lg bg-white" />
        </div>
        <Skeleton className="h-64 rounded-lg bg-white" />
      </div>
    </div>
  );
}
