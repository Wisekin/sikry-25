import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, SettingsIcon, LinkIcon, EyeIcon } from 'lucide-react';
import { ScraperConfigEditor, ScraperConfig } from './ScraperConfigEditor';
import { useSearchStore } from '@/stores/searchStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";

type ModalView = 'urlInput' | 'scraperConfig' | 'dataPreview';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  initialUrl?: string;
  onConfirmManualUrl?: (companyId: string, manualUrl: string, config?: ScraperConfig) => Promise<void>;
}

function normalizeUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function DiscoveryModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  initialUrl = '',
  onConfirmManualUrl,
}: DiscoveryModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('urlInput');
  const [manualUrl, setManualUrl] = useState(initialUrl);
  const [confirmedUrl, setConfirmedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { toast } = useToast();

  const companyDiscoveryState = useSearchStore(state => state.discoveryStates[companyId]);
  const [scraperConfig, setScraperConfig] = useState<ScraperConfig | null>(companyDiscoveryState?.scraperConfig || null);

  useEffect(() => {
    if (isOpen) {
      let urlToUse = companyDiscoveryState?.website || initialUrl || '';
      if (urlToUse) {
        urlToUse = normalizeUrl(urlToUse);
      }
      setManualUrl(urlToUse);
      if (isValidHttpUrl(urlToUse)) {
        setPreviewUrl(urlToUse);
        setConfirmedUrl(urlToUse);
      } else {
        setPreviewUrl('');
        setConfirmedUrl(null);
      }
      setCurrentView('urlInput');

      const existingConfig = companyDiscoveryState?.scraperConfig;
      if (existingConfig) {
        setScraperConfig(existingConfig);
      } else if (urlToUse && isValidHttpUrl(urlToUse)) {
        setScraperConfig({ websiteUrl: urlToUse, selectors: [{ fieldName: 'title', cssSelector: 'h1', type: 'text' }] });
      } else {
        setScraperConfig(null);
      }
    } else {
      setManualUrl('');
      setPreviewUrl('');
      setConfirmedUrl(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      setCurrentView('urlInput');
      setScraperConfig(null);
    }
  }, [isOpen, initialUrl, companyDiscoveryState?.website, companyDiscoveryState?.scraperConfig]);

  const isValidHttpUrl = (string: string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setManualUrl(newUrl);
    if (isValidHttpUrl(newUrl)) {
      setPreviewUrl(newUrl);
      setPreviewError(null);
    } else if (newUrl === '') {
      setPreviewUrl('');
      setPreviewError(null);
    } else {
      setPreviewError("Enter a valid HTTP/HTTPS URL to preview.");
    }
  };

  const handleConfirmAndProceedToConfig = () => {
    if (!manualUrl || !isValidHttpUrl(manualUrl)) {
      toast({ title: "Invalid URL", description: "Please enter a valid HTTP/HTTPS URL.", variant: "destructive" });
      return;
    }
    setConfirmedUrl(manualUrl);
    if (!scraperConfig || scraperConfig.websiteUrl !== manualUrl) {
      setScraperConfig({
        websiteUrl: manualUrl,
        selectors: [{ fieldName: 'title', cssSelector: 'h1', type: 'text' }],
      });
    }
    setCurrentView('scraperConfig');
  };

  const handleSaveScraperConfig = async (configToSave: ScraperConfig) => {
    setIsLoading(true);
    try {
      useSearchStore.getState().setDiscoveryStateForCompany(companyId, { scraperConfig: configToSave, website: configToSave.websiteUrl });
      setScraperConfig(configToSave);
      toast({ title: "Configuration Updated", description: "Scraper configuration has been noted locally." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to save config.";
      toast({ title: "Save Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDiscoveryWithConfig = async () => {
    if (!confirmedUrl) {
      toast({ title: "Error", description: "No URL confirmed for discovery.", variant: "destructive" });
      return;
    }
    if (!scraperConfig) {
      toast({ title: "Error", description: "No scraper configuration available.", variant: "destructive" });
      return;
    }
      if (onConfirmManualUrl) {
      setIsLoading(true);
      try {
        await onConfirmManualUrl(companyId, confirmedUrl, scraperConfig);
        toast({ title: "Success", description: `Discovery process started for ${confirmedUrl} with custom config.` });
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderUrlInputView = () => (
    <>
      <DialogHeader className="pb-4 border-b border-gray-100">
        <DialogTitle className="text-xl font-semibold text-gray-800">
          Website Discovery for <span className="text-[#2A3050]">{companyName}</span>
        </DialogTitle>
        <DialogDescription className="text-gray-600 mt-1">
          Enter or verify the website URL for {companyName}. A preview is shown below.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4 px-1">
        <div className="relative">
          <Input
            id="manualUrl"
            placeholder="https://www.example.com"
            value={manualUrl}
            onChange={handleManualUrlChange}
            className="col-span-4 pl-10 h-11 text-gray-700 border-gray-300 focus:border-[#2A3050] focus:ring-[#2A3050]"
          />
          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>

        <div className="mt-2 h-[400px] border border-gray-200 rounded-lg bg-gray-50 overflow-hidden relative shadow-sm">
          {previewUrl ? (
            <>
              {isPreviewLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2A3050]" />
                  <p className="mt-2 text-sm text-gray-600">Loading preview...</p>
                </div>
              )}
              {previewError && !isPreviewLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 z-10 p-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <p className="mt-2 text-sm text-center text-amber-700">{previewError}</p>
                </div>
              )}
              <iframe
                src={previewUrl}
                title="Website Preview"
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => { setIsPreviewLoading(false); if (!previewError) setPreviewError('Could not load preview.'); }}
                onLoadStart={() => { setIsPreviewLoading(true); setPreviewError(null); }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
              <LinkIcon className="h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                {previewError || "Enter a valid URL above to see a preview."}
              </p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="border-t border-gray-100 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleConfirmAndProceedToConfig}
                disabled={isLoading || !manualUrl || !isValidHttpUrl(manualUrl) || isPreviewLoading}
                className="bg-[#2A3050] hover:bg-[#2A3050]/90 text-white shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SettingsIcon className="mr-2 h-4 w-4" />
                )}
                Confirm URL & Configure Scraper
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white">
              <p>Validate the URL and proceed to the scraper configuration editor.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogFooter>
    </>
  );

  const renderScraperConfigView = () => {
    if (!confirmedUrl) return <p>Error: URL not confirmed.</p>;
    return (
      <>
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Configure Scraper for <span className="text-[#2A3050]">{companyName}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-1">
            Define data extraction rules for <span className="font-medium text-gray-700">{confirmedUrl}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto px-1">
          {scraperConfig ? (
            <ScraperConfigEditor
              key={confirmedUrl}
              initialConfig={scraperConfig}
              onSaveConfig={handleSaveScraperConfig}
              isLoading={isLoading}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-[#2A3050]" />
              <p className="mt-2 text-gray-600">Loading configuration...</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between border-t border-gray-100 pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('urlInput')}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <LinkIcon className="mr-2 h-4 w-4" /> Back to URL
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleStartDiscoveryWithConfig}
                    disabled={isLoading || !scraperConfig}
                    className="bg-[#2A3050] hover:bg-[#2A3050]/90 text-white shadow-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <EyeIcon className="mr-2 h-4 w-4" />
                    )}
                    Discover with this Configuration
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white">
                  <p>Start the web discovery and scraping process using the current configuration.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogFooter>
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={
        currentView === 'scraperConfig'
          // START: Increased max-width for scraper config view
          ? "sm:max-w-6xl md:max-w-6xl max-h-[90vh] rounded-lg" // Adjust these as needed, e.g., "lg:max-w-7xl xl:max-w-8xl"
          // END: Increased max-width for scraper config view
          // START: Increased max-width for URL input view
          : "sm:max-w-4xl md:max-w-7xl max-h-[90vh] rounded-lg" // Adjust these as needed
          // END: Increased max-width for URL input view
      }>
        {currentView === 'urlInput' && renderUrlInputView()}
        {currentView === 'scraperConfig' && renderScraperConfigView()}
      </DialogContent>
    </Dialog>
  );
}

export default DiscoveryModal;