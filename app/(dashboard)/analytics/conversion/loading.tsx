import EnterprisePageHeader from '@/src/components/core/layout/EnterprisePageHeader';
import { Skeleton } from '@/src/components/ui/skeleton';

export default function ConversionAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <EnterprisePageHeader title="Conversion Analytics" subtitle="Analyzing conversion funnels..." />
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
          <Skeleton className="h-32 rounded-lg bg-white" />
        </div>
        <Skeleton className="h-72 rounded-lg bg-white mb-6" /> {/* For funnel viz */}
        <Skeleton className="h-64 rounded-lg bg-white" /> {/* For table/bar chart */}
      </div>
    </div>
  );
}
