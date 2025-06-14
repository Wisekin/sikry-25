import { LoadingSkeleton } from "@/src//components/core/loading/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/src//components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <LoadingSkeleton width="250px" height="36px" className="mb-2" />
          <LoadingSkeleton width="300px" height="20px" />
        </div>
        <LoadingSkeleton width="180px" height="40px" /> {/* Button Skeleton */}
      </div>

      {/* Optional Tabs Skeleton */}
      {/* <div className="mb-6">
        <LoadingSkeleton width="300px" height="40px" />
      </div> */}

      {/* VSL Page Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardHeader>
              <LoadingSkeleton width="70%" height="24px" className="mb-1" /> {/* Title */}
              <LoadingSkeleton width="40%" height="16px" /> {/* Status Badge */}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-video bg-gray-200 rounded-md animate-pulse mb-3">
                {/* Placeholder for preview image skeleton */}
              </div>
              <div className="flex justify-between text-sm">
                <LoadingSkeleton width="45%" height="16px" /> {/* Views */}
                <LoadingSkeleton width="45%" height="16px" /> {/* Conversion Rate */}
              </div>
              <LoadingSkeleton width="60%" height="16px" /> {/* Created At */}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <LoadingSkeleton width="90px" height="32px" /> {/* View Details Button */}
              <div className="flex space-x-2">
                <LoadingSkeleton width="32px" height="32px" shape="circle" /> {/* Edit */}
                <LoadingSkeleton width="32px" height="32px" shape="circle" /> {/* Preview */}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
