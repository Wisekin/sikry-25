import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'; // No longer directly using Card for layout
import { ScrapedData } from '@/stores/searchStore';
import { Loader2, AlertTriangle, EyeOff } from 'lucide-react';
import { EnrichedDataDisplay } from './EnrichedDataDisplay'; // Import EnrichedDataDisplay

interface DataPreviewModalProps { // Renamed props interface for clarity
  isOpen: boolean;
  onClose: () => void;
  scrapedData: ScrapedData | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  companyName?: string;
}

// DataField component is removed as EnrichedDataDisplay handles its own rendering logic.

export function DataPreview({ // Component name kept as DataPreview for now, acts as a modal host
  isOpen,
  onClose,
  scrapedData,
  isLoading = false,
  error = null,
  companyName,
}: DataPreviewModalProps) {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-gray-600">Loading data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="mt-3 text-sm font-medium text-red-700">Error loading data</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      );
    }

    if (!scrapedData || Object.keys(scrapedData).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <EyeOff className="h-10 w-10 text-gray-400" />
          <p className="mt-3 text-sm text-gray-500">No data available to display.</p>
          <p className="text-xs text-gray-400">Scraping might not have run or yielded no results.</p>
        </div>
      );
    }

    // Use EnrichedDataDisplay to render the scraped data
    return (
      <div className="max-h-[70vh] overflow-y-auto p-1">
        <EnrichedDataDisplay enrichedData={scrapedData} isLoading={false} error={null} />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Increased width to better accommodate EnrichedDataDisplay which uses Card internally */}
      <DialogContent className="sm:max-w-xl"> 
        <DialogHeader>
          <DialogTitle>
            Enriched Data for {companyName || 'Company'}
          </DialogTitle>
          <DialogDescription>
            Detailed information gathered for {companyName}.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {renderContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataPreview;
