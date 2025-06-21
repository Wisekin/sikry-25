import { Card } from "@/src/components/ui/card";

export function CompanyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-md bg-gray-200 animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
      <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded" />
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
