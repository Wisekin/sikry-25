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
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ScrapedData } from '@/stores/searchStore'; // Assuming ScrapedData is available
import { Loader2, AlertTriangle, EyeOff } from 'lucide-react'; // Icons

interface DataPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  scrapedData: ScrapedData | null | undefined;
  isLoading?: boolean;
  error?: string | null;
  companyName?: string; // For context in the title
}

const DataField: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (value === null || typeof value === 'undefined' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }

  let displayValue: React.ReactNode;
  if (Array.isArray(value)) {
    displayValue = (
      <ul className="list-disc list-inside">
        {value.map((item, index) => (
          <li key={index} className="text-sm text-gray-700">{String(item)}</li>
        ))}
      </ul>
    );
  } else if (typeof value === 'object') {
    displayValue = <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
  } else {
    displayValue = <p className="text-sm text-gray-700">{String(value)}</p>;
  }

  return (
    <div className="py-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h4>
      {displayValue}
    </div>
  );
};


export function DataPreview({
  isOpen,
  onClose,
  scrapedData,
  isLoading = false,
  error = null,
  companyName,
}: DataPreviewProps) {

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-gray-600">Loading preview data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="mt-3 text-sm font-medium text-red-700">Error loading data</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      );
    }

    if (!scrapedData || Object.keys(scrapedData).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <EyeOff className="h-10 w-10 text-gray-400" />
          <p className="mt-3 text-sm text-gray-500">No data available to preview.</p>
          <p className="text-xs text-gray-400">Scraping might not have run or yielded no results.</p>
        </div>
      );
    }

    // Dynamically render fields from scrapedData
    // This is a basic rendering; more sophisticated rendering might be needed for specific data structures.
    return (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
        {Object.entries(scrapedData).map(([key, value]) => {
          // Simple transformation of key to Title Case for label
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          return <DataField key={key} label={label} value={value} />;
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Preview of Scraped Data {companyName ? `for ${companyName}` : ''}
          </DialogTitle>
          <DialogDescription>
            This is the data extracted from the website. Review it before further processing.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {renderContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {/* Add other actions if needed, e.g., "Confirm Data", "Edit Data" */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataPreview;
