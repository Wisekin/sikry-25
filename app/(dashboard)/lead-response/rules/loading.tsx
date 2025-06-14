import { LoadingSkeleton } from "@/src/components/core/loading/LoadingSkeleton";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";

export default function Loading() {
  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-10">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <LoadingSkeleton width="300px" height="36px" className="mb-2" />
          <LoadingSkeleton width="350px" height="20px" />
        </div>
        <LoadingSkeleton width="180px" height="40px" /> {/* Create New Rule Button Skeleton */}
      </div>

      {/* Rules Table Skeleton in a Card */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          {/* Optional: if there's a title or filter options above the table within the card */}
          <LoadingSkeleton width="200px" height="24px" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><LoadingSkeleton width="25%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="30%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="15%" height="16px" /></TableHead>
                <TableHead><LoadingSkeleton width="15%" height="16px" /></TableHead>
                <TableHead className="text-right"><LoadingSkeleton width="15%" height="16px" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(7)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell><LoadingSkeleton width="90%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="95%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="80%" height="14px" /></TableCell>
                  <TableCell><LoadingSkeleton width="80%" height="14px" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <LoadingSkeleton width="32px" height="32px" shape="circle" />
                      <LoadingSkeleton width="32px" height="32px" shape="circle" />
                      <LoadingSkeleton width="32px" height="32px" shape="circle" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
