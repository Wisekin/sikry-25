import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <LoadingSkeleton width="350px" height="36px" className="mb-2" />
          <LoadingSkeleton width="400px" height="20px" />
        </div>
        {/* Placeholder for potential top-right controls like date filters */}
        <div className="flex gap-2">
            <LoadingSkeleton width="120px" height="40px" />
            <LoadingSkeleton width="100px" height="40px" />
        </div>
      </div>

      {/* Summary Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardHeader>
              <LoadingSkeleton width="70%" height="20px" className="mb-1" /> {/* Title */}
            </CardHeader>
            <CardContent>
              <LoadingSkeleton width="50%" height="28px" /> {/* Value */}
              <LoadingSkeleton width="80%" height="16px" className="mt-2" /> {/* Description/Change */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <LoadingSkeleton width="40%" height="24px" /> {/* Chart Title */}
          </CardHeader>
          <CardContent>
            <LoadingSkeleton width="100%" height="250px" /> {/* Chart Area */}
          </CardContent>
        </Card>
        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <LoadingSkeleton width="50%" height="24px" /> {/* Chart Title */}
          </CardHeader>
          <CardContent>
            <LoadingSkeleton width="100%" height="250px" /> {/* Chart Area */}
          </CardContent>
        </Card>
      </div>
      
      {/* Rule Performance Table Skeleton */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <LoadingSkeleton width="30%" height="24px" /> {/* Table Title */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><LoadingSkeleton width="40%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="20%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="20%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="20%" height="16px" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell><LoadingSkeleton width="90%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="70%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="70%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="80%" height="14px" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
