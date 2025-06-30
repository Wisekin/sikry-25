import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('searchPage');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-3 text-sm text-gray-600">{t('dataPreview.loading')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="mt-3 text-sm font-medium text-red-700">{t('dataPreview.errorTitle')}</p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      );
    }

    if (!scrapedData || Object.keys(scrapedData).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-4">
          <EyeOff className="h-10 w-10 text-gray-400" />
          <p className="mt-3 text-sm text-gray-500">{t('dataPreview.noData')}</p>
          <p className="text-xs text-gray-400">{t('dataPreview.noDataHint')}</p>
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
            {companyName 
              ? t('dataPreview.title', { companyName }) 
              : t('dataPreview.defaultTitle')}
          </DialogTitle>
          <DialogDescription>
            {companyName
              ? t('dataPreview.description', { companyName })
              : t('dataPreview.defaultDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {renderContent()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataPreview;
