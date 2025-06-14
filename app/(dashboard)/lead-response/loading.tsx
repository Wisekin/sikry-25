import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <LoadingSkeleton width="300px" height="36px" className="mb-2" />
          <LoadingSkeleton width="350px" height="20px" />
        </div>
      </div>

      {/* Overview Stats Skeletons */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardHeader>
              <LoadingSkeleton width="60%" height="20px" className="mb-1" /> {/* Title */}
            </CardHeader>
            <CardContent>
              <LoadingSkeleton width="40%" height="28px" /> {/* Value */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Link Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardHeader>
              <LoadingSkeleton width="50%" height="24px" className="mb-1" /> {/* Section Title */}
            </CardHeader>
            <CardContent>
              <LoadingSkeleton width="90%" height="16px" /> {/* Description Line 1 */}
              <LoadingSkeleton width="70%" height="16px" className="mt-2" /> {/* Description Line 2 */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Example Card Skeleton */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <LoadingSkeleton width="40%" height="24px" /> {/* Example Title */}
        </CardHeader>
        <CardContent className="space-y-3">
          <LoadingSkeleton width="100%" height="16px" />
          <LoadingSkeleton width="95%" height="16px" />
          <LoadingSkeleton width="80%" height="16px" />
          <LoadingSkeleton width="90%" height="16px" />
        </CardContent>
      </Card>
    </div>
  );
}
