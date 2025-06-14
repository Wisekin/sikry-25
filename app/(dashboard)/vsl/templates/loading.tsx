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
        <LoadingSkeleton width="200px" height="40px" /> {/* Create New Template Button Skeleton */}
      </div>

      {/* Templates Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardHeader>
              {/* Thumbnail Placeholder */}
              <LoadingSkeleton className="aspect-video w-full rounded-md bg-gray-200 mb-3" />
              {/* Title */}
              <LoadingSkeleton width="70%" height="24px" className="mb-1" />
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Description Lines */}
              <LoadingSkeleton width="100%" height="16px" />
              <LoadingSkeleton width="85%" height="16px" />
              {/* Tags Placeholder */}
              <div className="flex flex-wrap gap-1 pt-1">
                <LoadingSkeleton width="50px" height="20px" className="rounded-full" />
                <LoadingSkeleton width="60px" height="20px" className="rounded-full" />
                <LoadingSkeleton width="40px" height="20px" className="rounded-full" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <LoadingSkeleton width="90px" height="32px" /> {/* Use Template/Select Button */}
              <LoadingSkeleton width="80px" height="32px" /> {/* Preview Button */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
