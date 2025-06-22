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
import { Loader2, AlertTriangle } from 'lucide-react'; // For loading/error states in preview

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  initialUrl?: string; // To prefill URL or show a preview immediately
  onConfirmManualUrl?: (companyId: string, manualUrl: string) => Promise<void>;
}

export function DiscoveryModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  initialUrl = '',
  onConfirmManualUrl
}: DiscoveryModalProps) {
  const [manualUrl, setManualUrl] = useState(initialUrl);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // If an initial URL is provided and the modal is open, try to load it in preview
    if (isOpen && initialUrl) {
      setManualUrl(initialUrl); // Also set it as the manual URL input
      // Basic validation for preview
      if (isValidHttpUrl(initialUrl)) {
        setPreviewUrl(initialUrl);
      } else {
        setPreviewUrl(''); // Clear preview if initial URL is not valid for iframe
      }
    }
    if (!isOpen) { // Reset when modal closes
        setManualUrl('');
        setPreviewUrl('');
        setPreviewError(null);
        setIsPreviewLoading(false);
    }
  }, [isOpen, initialUrl]);

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
    // Simple debounce or on blur could be better for performance
    if (isValidHttpUrl(newUrl)) {
      setPreviewUrl(newUrl); // Update preview URL as user types a valid URL
      setPreviewError(null);
    } else if (newUrl === '') {
      setPreviewUrl('');
      setPreviewError(null);
    } else {
      // Keep existing previewUrl or clear it if input becomes invalid
      // setPreviewUrl(''); // Option: clear preview if URL becomes invalid
      setPreviewError("Enter a valid HTTP/HTTPS URL to preview.");
    }
  };

  const handleSubmitManualUrl = async () => {
    if (!manualUrl) {
      toast({ title: "Validation Error", description: "Please enter a URL.", variant: "destructive" });
      return;
    }
    if (!isValidHttpUrl(manualUrl)) {
      toast({ title: "Validation Error", description: "Please enter a valid HTTP/HTTPS URL.", variant: "destructive" });
      return;
    }
    if (onConfirmManualUrl) {
      setIsLoading(true);
      try {
        await onConfirmManualUrl(companyId, manualUrl);
        toast({ title: "Success", description: `Discovery process started with ${manualUrl}.` });
        onClose();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(`Manual URL for ${companyName} (${companyId}): ${manualUrl}`);
      toast({ title: "URL Noted", description: `If implemented, would use: ${manualUrl}`});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl"> {/* Increased width for preview */}
        <DialogHeader>
          <DialogTitle>Website Discovery for {companyName}</DialogTitle>
          <DialogDescription>
            Enter or verify the website URL for {companyName}. A preview is shown below.
            {/* Automatic discovery will be triggered if you close this or don't provide a URL. */}
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

          <div className="mt-2 h-80 border bg-gray-50 rounded-md overflow-hidden relative">
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
                  sandbox="allow-scripts allow-same-origin" // Security: restrictive sandbox
                  onLoad={() => setIsPreviewLoading(false)}
                  onError={() => {
                    setIsPreviewLoading(false);
                    // Don't show iframe error if custom error is already set (e.g. invalid URL typed)
                    if (!previewError) setPreviewError('Could not load preview. The website might block embedding or is unavailable.');
                  }}
                  onLoadStart={() => { // This may not be supported by all browsers or consistently
                    setIsPreviewLoading(true);
                    setPreviewError(null); // Clear previous error on new load attempt
                  }}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Globe className="h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">
                  {previewError || "Enter a valid URL above to see a preview."}
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmitManualUrl}
            disabled={isLoading || !manualUrl || !isValidHttpUrl(manualUrl) || isPreviewLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Use this URL & Discover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Minimal Globe icon for placeholder
const Globe = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );

export default DiscoveryModal;
