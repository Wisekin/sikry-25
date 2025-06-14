import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <LoadingSkeleton width="250px" height="36px" className="mb-2" />
          <LoadingSkeleton width="300px" height="20px" />
        </div>
        <LoadingSkeleton width="150px" height="40px" />
      </div>

      {/* Tabs Skeleton (Optional, if we decide to add tabs) */}
      {/* <div className="mb-6">
        <LoadingSkeleton width="300px" height="40px" />
      </div> */}

      {/* Letter Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardHeader>
              <LoadingSkeleton width="60%" height="24px" className="mb-1" />
              <LoadingSkeleton width="40%" height="16px" />
            </CardHeader>
            <CardContent className="space-y-3">
              <LoadingSkeleton width="80%" height="16px" />
              <LoadingSkeleton width="90%" height="16px" />
              <LoadingSkeleton width="70%" height="16px" />
              <div className="flex justify-between items-center mt-4">
                <LoadingSkeleton width="100px" height="32px" />
                <LoadingSkeleton width="80px" height="20px" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
