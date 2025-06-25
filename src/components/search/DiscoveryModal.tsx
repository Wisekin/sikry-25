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
import { Loader2, AlertTriangle, SettingsIcon, LinkIcon, EyeIcon } from 'lucide-react'; // Removed SaveIcon as it's not used directly on a button here
import { ScraperConfigEditor, ScraperConfig } from './ScraperConfigEditor';
import { useSearchStore } from '@/stores/searchStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"; // Added Tooltip

type ModalView = 'urlInput' | 'scraperConfig' | 'dataPreview';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  initialUrl?: string;
  onConfirmManualUrl?: (companyId: string, manualUrl: string, config?: ScraperConfig) => Promise<void>; // Added optional config
  // onSaveScraperConfig?: (companyId: string, config: ScraperConfig) => Promise<void>; // Optional: if saving config is a separate step
}

export function DiscoveryModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  initialUrl = '',
  onConfirmManualUrl,
  // onSaveScraperConfig
}: DiscoveryModalProps) {
  const [currentView, setCurrentView] = useState<ModalView>('urlInput');
  const [manualUrl, setManualUrl] = useState(initialUrl);
  const [confirmedUrl, setConfirmedUrl] = useState<string | null>(null); // Store the URL confirmed by the user
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { toast } = useToast();

  // Potentially load existing config for this company/URL
  const companyDiscoveryState = useSearchStore(state => state.discoveryStates[companyId]);
  // TODO: This needs to be more robust; scraperConfig might not exist on companyDiscoveryState yet
  const [scraperConfig, setScraperConfig] = useState<ScraperConfig | null>(companyDiscoveryState?.scraperConfig || null);


  useEffect(() => {
    if (isOpen) {
      const urlToUse = companyDiscoveryState?.website || initialUrl || '';
      setManualUrl(urlToUse);
      if (isValidHttpUrl(urlToUse)) {
        setPreviewUrl(urlToUse);
        setConfirmedUrl(urlToUse); // If there's an initial valid URL, consider it confirmed for config editing
      } else {
        setPreviewUrl('');
        setConfirmedUrl(null);
      }
      // Reset to URL input view if no URL is confirmed, or if explicitly opening for URL
      // setCurrentView(urlToUse && isValidHttpUrl(urlToUse) ? 'scraperConfig' : 'urlInput'); // Or always start at 'urlInput'
      setCurrentView('urlInput'); // Always start at URL input for clarity
      
      // Load or set default scraper config
      const existingConfig = companyDiscoveryState?.scraperConfig; // This needs to be defined in searchStore.ts CompanyDiscoveryState
      if (existingConfig) {
        setScraperConfig(existingConfig);
      } else if (urlToUse && isValidHttpUrl(urlToUse)) {
        setScraperConfig({ websiteUrl: urlToUse, selectors: [{ fieldName: 'title', cssSelector: 'h1', type: 'text' }] });
      } else {
        setScraperConfig(null);
      }

    } else { // Reset when modal closes
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
      // If config doesn't exist or is for a different URL, create a new default one
      setScraperConfig({
        websiteUrl: manualUrl,
        selectors: [{ fieldName: 'title', cssSelector: 'h1', type: 'text' }], // Basic default
        // TODO: Potentially fetch default template for this URL type if available
      });
    }
    setCurrentView('scraperConfig');
  };
  
  const handleSaveScraperConfig = async (configToSave: ScraperConfig) => {
    setIsLoading(true);
    // TODO: This should ideally call a specific store action to save config,
    // which might then call a backend API.
    // For now, we'll update local state and searchStore.
    // This might also be where onSaveScraperConfig prop would be used if provided.
    try {
      useSearchStore.getState().setDiscoveryStateForCompany(companyId, { scraperConfig: configToSave, website: configToSave.websiteUrl });
      setScraperConfig(configToSave); // update local state
      toast({ title: "Configuration Updated", description: "Scraper configuration has been noted locally." });
      // Potentially proceed to data preview or allow user to initiate discovery
      // For now, let's assume after saving config, user might want to start discovery
      if (onConfirmManualUrl && confirmedUrl) {
        // await onConfirmManualUrl(companyId, confirmedUrl, configToSave); // Pass the saved config
        // onClose(); // Close modal after discovery is initiated
      }
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
        // The onConfirmManualUrl now needs to be aware it might receive a config
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
      <DialogHeader>
        <DialogTitle>Website Discovery for {companyName}</DialogTitle>
        <DialogDescription>
          Enter or verify the website URL for {companyName}. A preview is shown below.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <Input
          id="manualUrl"
          placeholder="https://www.example.com"
          value={manualUrl}
          onChange={handleManualUrlChange}
          className="col-span-4"
        />
        <div className="mt-2 h-64 border bg-gray-50 rounded-md overflow-hidden relative">
          {previewUrl ? (
            <>
              {isPreviewLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Loading preview...</p>
                </div>
              )}
              {previewError && !isPreviewLoading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80 z-10 p-4">
                      <AlertTriangle className="h-8 w-8 text-amber-500" />
                      <p className="mt-2 text-sm text-center text-amber-700">{previewError}</p>
                   </div>
              )}
              <iframe
                src={previewUrl}
                title="Website Preview"
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => { setIsPreviewLoading(false); if (!previewError) setPreviewError('Could not load preview.'); }}
                onLoadStart={() => { setIsPreviewLoading(true); setPreviewError(null); }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <LinkIcon className="h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-400">
                {previewError || "Enter a valid URL above to see a preview."}
              </p>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleConfirmAndProceedToConfig}
                disabled={isLoading || !manualUrl || !isValidHttpUrl(manualUrl) || isPreviewLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SettingsIcon className="mr-2 h-4 w-4" />}
                Confirm URL & Configure Scraper
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Validate the URL and proceed to the scraper configuration editor.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogFooter>
    </>
  );

  const renderScraperConfigView = () => {
    if (!confirmedUrl) return <p>Error: URL not confirmed.</p>; // Should not happen if flow is correct
    return (
    <>
      <DialogHeader>
        <DialogTitle>Configure Scraper for {companyName}</DialogTitle>
        <DialogDescription>
          Define data extraction rules for <span className="font-semibold">{confirmedUrl}</span>.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 max-h-[60vh] overflow-y-auto">
        {scraperConfig ? (
          <ScraperConfigEditor
            key={confirmedUrl} // Re-mount editor if URL changes, resetting its internal state
            initialConfig={scraperConfig}
            onSaveConfig={handleSaveScraperConfig} // This will update local state and potentially store
            isLoading={isLoading} // Use modal's loading state for now
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="mt-2">Loading configuration...</p>
          </div>
        )}
      </div>
      <DialogFooter className="flex-col sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={() => setCurrentView('urlInput')} disabled={isLoading}>
          <LinkIcon className="mr-2 h-4 w-4" /> Back to URL
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
        {/* Save Config Only button removed for simplicity, save happens via editor's save or implicitly with "Discover" */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                  onClick={handleStartDiscoveryWithConfig}
                  disabled={isLoading || !scraperConfig}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <EyeIcon className="mr-2 h-4 w-4" />}
                  Discover with this Configuration
                </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start the web discovery and scraping process using the current URL and the configured selectors.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>
      </DialogFooter>
    </>
  )};

  // const renderDataPreviewView = () => ( ... ); // For a future step

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Changed width to accommodate editor better */}
      <DialogContent className={currentView === 'scraperConfig' ? "sm:max-w-3xl" : "sm:max-w-2xl"}> 
        {currentView === 'urlInput' && renderUrlInputView()}
        {currentView === 'scraperConfig' && renderScraperConfigView()}
        {/* {currentView === 'dataPreview' && renderDataPreviewView()} */}
      </DialogContent>
    </Dialog>
  );
}


// Minimal Globe icon for placeholder (already exists, but ensure it's named consistently if used)
// Using LinkIcon from lucide-react for URL input placeholder now.
// const Globe = (props: React.SVGProps<SVGSVGElement>) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
//       <circle cx="12" cy="12" r="10"></circle>
//       <line x1="2" y1="12" x2="22" y2="12"></line>
//       <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
//     </svg>
//   );

export default DiscoveryModal;
