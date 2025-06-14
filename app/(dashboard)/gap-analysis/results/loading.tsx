import { LoadingSkeleton } from "@/components/core/loading/LoadingSkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Loading() {
  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <LoadingSkeleton width="300px" height="36px" className="mb-2" />
          <LoadingSkeleton width="350px" height="20px" />
        </div>
        <LoadingSkeleton width="180px" height="40px" /> {/* Placeholder for a potential button */}
      </div>

      {/* Summary Statistics Skeletons */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-white border-none shadow-sm">
            <CardHeader>
              <LoadingSkeleton width="60%" height="20px" className="mb-1" />
              <LoadingSkeleton width="40%" height="28px" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton width="80%" height="16px" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton (Optional) */}
      <Card className="bg-white border-none shadow-sm mb-8">
        <CardHeader>
          <LoadingSkeleton width="40%" height="24px" />
        </CardHeader>
        <CardContent>
          <LoadingSkeleton width="100%" height="250px" />
        </CardContent>
      </Card>
      
      {/* Detailed Results Table Skeleton */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <LoadingSkeleton width="30%" height="24px" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><LoadingSkeleton width="20%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="40%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="15%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="25%" height="16px" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell><LoadingSkeleton width="80%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="90%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="70%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="85%" height="14px" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
