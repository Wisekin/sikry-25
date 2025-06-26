import React, { useState, useEffect, useRef } from 'react';
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
import { Textarea } from '@/src/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle, SettingsIcon, LinkIcon, EyeIcon, SparklesIcon, Edit3Icon, Wand2Icon, ArrowRightIcon } from 'lucide-react';
import { ScraperConfigEditor, ScraperConfig } from './ScraperConfigEditor';
import { useSearchStore } from '@/stores/searchStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

// Mock ScraperConfig types for standalone component demonstration
// In a real application, these would be imported from a central types file.
export interface ScraperSelector {
  fieldName: string;
  cssSelector: string;
  type: 'text' | 'attribute' | 'html';
  attributeName?: string;
}

export interface ScraperConfig {
  id?: string;
  websiteUrl: string;
  selectors: ScraperSelector[];
  extractionRules?: Record<string, any>;
  lastModified?: string;
  version?: number;
}


type ModalView = 'urlInput' | 'promptInput' | 'scraperConfig' | 'dataPreview';

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
  const [prompt, setPrompt] = useState('');
  const [isGeneratingConfig, setIsGeneratingConfig] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string[] | null>(null);
  const [aiGeneratedConfig, setAiGeneratedConfig] = useState<ScraperConfig | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [generatedSummary, isGeneratingConfig]);


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
      // Reset state on close
      setManualUrl('');
      setPreviewUrl('');
      setConfirmedUrl(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      setCurrentView('urlInput');
      setScraperConfig(null);
      setPrompt('');
      setGeneratedSummary(null);
      setAiGeneratedConfig(null);
    }
  }, [isOpen, initialUrl, companyId, companyDiscoveryState?.website, companyDiscoveryState?.scraperConfig, useSearchStore]);

  const isValidHttpUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setManualUrl(newUrl);
    if (isValidHttpUrl(newUrl)) {
      setPreviewUrl(newUrl);
      setPreviewError(null);
    } else {
      setPreviewUrl('');
      setPreviewError(newUrl === '' ? null : "Please enter a valid URL (e.g., https://example.com)");
    }
  };

  const handleConfirmAndProceedToConfig = () => {
    if (!manualUrl || !isValidHttpUrl(manualUrl)) {
      toast({ title: "Invalid URL", description: "Please enter a valid HTTP/HTTPS URL.", variant: "destructive" });
      return;
    }
    setConfirmedUrl(manualUrl);
    setGeneratedSummary(null);
    setPrompt('');
    setAiGeneratedConfig(null);

    const existingConfig = companyDiscoveryState?.scraperConfig;
    if (existingConfig && existingConfig.websiteUrl === manualUrl) {
      setScraperConfig(existingConfig);
    } else {
      setScraperConfig({
        websiteUrl: manualUrl,
        selectors: [],
      });
    }
    setCurrentView('promptInput');
  };

  const handleGenerateConfig = async () => {
    if (!confirmedUrl) return;
    setIsGeneratingConfig(true);
    setGeneratedSummary(null);
    setAiGeneratedConfig(null);

    // Simulate API call
    setTimeout(async () => {
      try {
        // Mock API call to '/api/search/scraper/generate-config'
        // In a real app, this would be a fetch call
        console.log("Generating config for:", { prompt, websiteUrl: confirmedUrl });
        if (prompt.includes("fail")) {
             throw new Error("The AI model failed to generate a valid configuration. Please try rephrasing your request.");
        }
        
        const mockResponse = {
            config: {
                websiteUrl: confirmedUrl,
                selectors: [
                    { fieldName: 'email', cssSelector: 'a[href^="mailto:"]', type: 'attribute', attributeName: 'href' },
                    { fieldName: 'main_heading', cssSelector: 'h1', type: 'text' },
                    { fieldName: 'primary_phone', cssSelector: '.phone', type: 'text' },
                ],
            },
            summary: [
                "Extract any email addresses found.",
                "Capture the main heading (H1) of the page.",
                "Look for elements with a 'phone' class for phone numbers."
            ]
        };
        
        const { config: newConfig, summary } = mockResponse;

        setAiGeneratedConfig(newConfig);
        setScraperConfig(newConfig);
        setGeneratedSummary(summary);
        toast({ title: "Configuration Generated", description: "AI has proposed a configuration. You can now start discovery or edit it." });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "Generation Failed", description: errorMessage, variant: "destructive" });
        setGeneratedSummary([`Error: ${errorMessage}`]);
      } finally {
        setIsGeneratingConfig(false);
        setPrompt(''); // Clear prompt after generation
      }
    }, 1500);
  };

  const handleSaveScraperConfig = async (configToSave: ScraperConfig) => {
    setIsLoading(true);
    try {
      useSearchStore.getState().setDiscoveryStateForCompany(companyId, { scraperConfig: configToSave, website: configToSave.websiteUrl });
      setScraperConfig(configToSave);
      toast({ title: "Configuration Updated", description: "Scraper configuration has been saved locally." });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to save config.";
      toast({ title: "Save Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDiscoveryWithConfig = async () => {
    if (!confirmedUrl || !scraperConfig) return;
    if (onConfirmManualUrl) {
      setIsLoading(true);
      try {
        await onConfirmManualUrl(companyId, confirmedUrl, scraperConfig);
        toast({ title: "Success", description: `Discovery process started for ${confirmedUrl}.` });
        onClose();
      } catch (error) {
        toast({ title: "Error", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderUrlInputView = () => (
    <>
      <DialogHeader className="pb-4 border-b dark:border-gray-800">
        <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Website Discovery for <span className="text-[#2A3050] dark:text-blue-400">{companyName}</span>
        </DialogTitle>
        <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
          Enter or verify the website URL. A live preview is shown below.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4 px-1">
        <div className="relative">
          <Input
            id="manualUrl"
            placeholder="https://www.example.com"
            value={manualUrl}
            onChange={handleManualUrlChange}
            className="col-span-4 pl-10 h-11 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 focus:border-[#2A3050] focus:ring-[#2A3050] dark:bg-gray-800"
          />
          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>

        <div className="mt-2 min-h-[300px] md:h-[450px] border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden relative shadow-inner">
          {previewUrl && isValidHttpUrl(previewUrl) ? (
            <>
              {(isPreviewLoading || previewError) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 dark:bg-gray-800/90 z-10 p-4 backdrop-blur-sm">
                  {isPreviewLoading ? <Loader2 className="h-8 w-8 animate-spin text-[#2A3050] dark:text-blue-400" /> : <AlertTriangle className="h-8 w-8 text-amber-500" />}
                  <p className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">{isPreviewLoading ? 'Loading preview...' : previewError}</p>
                </div>
              )}
              <iframe
                src={previewUrl}
                title="Website Preview"
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => { setIsPreviewLoading(false); if (!previewError) setPreviewError('Could not load preview. The site may have security policies that block it.'); }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <LinkIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {previewError || "Enter a valid URL to see a preview."}
              </p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="border-t dark:border-gray-800 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirmAndProceedToConfig}
          disabled={isLoading || !manualUrl || !isValidHttpUrl(manualUrl) || isPreviewLoading}
          className="bg-[#2A3050] hover:bg-[#2A3050]/90 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm"
        >
          Confirm URL & Configure <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );

  const renderPromptInputView = () => {
    if (!confirmedUrl) return <p>Error: URL not confirmed.</p>;

    return (
      <>
        <DialogHeader className="text-center pb-4">
            <DialogTitle className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-gradient-to-br from-[#3c4266] to-[#2A3050]">
                    <Wand2Icon className="h-6 w-6 text-white" />
                </span>
                <span>
                  AI-Powered Scraper for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3c4266] to-[#2A3050] dark:from-blue-400 dark:to-blue-300">{companyName}</span>
                </span>
            </DialogTitle>
             <DialogDescription className="text-gray-500 dark:text-gray-400 mt-2">
                Converse with our AI to build a scraper for <span className="font-medium text-gray-700 dark:text-gray-300">{confirmedUrl}</span>
            </DialogDescription>
        </DialogHeader>
        
        {/* Chat-style interface with messaging app design */}
        <div className="flex flex-col min-h-[400px] md:h-[450px] bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-inner">
            {/* Chat background with subtle pattern */}
            <div 
              className="flex-grow overflow-y-auto p-4 space-y-6 scroll-smooth relative"
              ref={chatContainerRef}
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)',
                backgroundSize: '16px 16px'
              }}
            >
                {/* AI Welcome/Instruction Message */}
                {!generatedSummary && !isGeneratingConfig && (
                    <div className="flex items-start gap-3 max-w-3xl">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2A3050] text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                            <SparklesIcon className="w-5 h-5" />
                        </span>
                        <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                What data should I extract? For example: <em className="text-gray-500 dark:text-gray-400">"Find all team members and their job titles."</em>
                                <br />
                                If you specify nothing, the default data <strong> (phone, email, address, and company name)</strong> will be extracted.
                            </p>
                        </div>
                    </div>
                )}
                
                {/* AI Generated Summary Message */}
                {generatedSummary && (
                    <div className="flex items-start gap-3 max-w-3xl">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2A3050] text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                           <SparklesIcon className="w-5 h-5" />
                        </span>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Here's the plan:</p>
                            <ul className="space-y-1.5 list-disc list-inside">
                                {generatedSummary.map((item, index) => (
                                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                {/* Loading indicator */}
                {isGeneratingConfig && (
                    <div className="flex items-start gap-3 max-w-3xl">
                         <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2A3050] text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                           <SparklesIcon className="w-5 h-5 animate-pulse" />
                        </span>
                        <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                <span>Generating configuration...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Prompt Input area */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-b-lg">
                <div className="relative flex items-end gap-2">
                    <Textarea
                        id="aiPrompt"
                        placeholder="e.g., 'Get all phone numbers and addresses'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerateConfig(); }}}
                        rows={1}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-2xl w-full resize-none p-3 pr-24 focus-visible:ring-2 focus-visible:ring-[#2A3050]/50 dark:focus-visible:ring-blue-500/60"
                        disabled={isGeneratingConfig}
                    />
                    <Button
                        size="sm"
                        onClick={handleGenerateConfig}
                        disabled={isGeneratingConfig || !prompt.trim()}
                        className="absolute right-2.5 bottom-2 bg-[#2A3050] hover:bg-[#2A3050]/90 dark:bg-blue-600 dark:hover:bg-blue-500 text-white"
                    >
                        {isGeneratingConfig ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowRightIcon className="h-4 w-4" />}
                        <span className="ml-1.5 hidden sm:inline">Generate</span>
                    </Button>
                </div>
            </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between pt-4 gap-2">
            <Button variant="ghost" onClick={() => setCurrentView('urlInput')} disabled={isLoading || isGeneratingConfig}>
                <LinkIcon className="mr-2 h-4 w-4" /> Back to URL
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
                {aiGeneratedConfig && (
                    <Button variant="outline" onClick={() => setCurrentView('scraperConfig')} disabled={isLoading || isGeneratingConfig}>
                        <Edit3Icon className="mr-2 h-4 w-4" /> View & Edit
                    </Button>
                )}
                <Button onClick={handleStartDiscoveryWithConfig} disabled={isLoading || isGeneratingConfig || !scraperConfig} className="bg-[#2A3050] hover:bg-[#2A3050]/90 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <EyeIcon className="mr-2 h-4 w-4" />}
                    Start Discovery
                </Button>
            </div>
        </DialogFooter>
      </>
    );
  };

  const renderScraperConfigView = () => {
    if (!confirmedUrl) return <p>Error: URL not confirmed.</p>;
    const configToEdit = aiGeneratedConfig || scraperConfig;

    return (
      <>
        <DialogHeader className="pb-4 border-b dark:border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Manual Scraper Configuration for <span className="text-[#2A3050] dark:text-blue-400">{companyName}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
            Review or manually edit data extraction rules for <span className="font-medium text-gray-700 dark:text-gray-300">{confirmedUrl}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto px-1">
          {configToEdit ? (
            <ScraperConfigEditor
              key={confirmedUrl}
              initialConfig={configToEdit}
              onSaveConfig={async (newConfig) => {
                await handleSaveScraperConfig(newConfig);
                setAiGeneratedConfig(newConfig);
                setScraperConfig(newConfig);
                toast({ title: "Manual Update", description: "Configuration updated manually." });
              }}
              isLoading={isLoading}
            />
          ) : (
             <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin text-[#2A3050] dark:text-blue-400" />
                <p className="mt-4">Loading configuration...</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-between border-t dark:border-gray-800 pt-4 gap-2">
            <Button variant="ghost" onClick={() => setCurrentView('promptInput')} disabled={isLoading}>
                <SparklesIcon className="mr-2 h-4 w-4" /> Back to AI Prompt
            </Button>
            <Button onClick={handleStartDiscoveryWithConfig} disabled={isLoading || !scraperConfig} className="bg-[#2A3050] hover:bg-[#2A3050]/90 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <EyeIcon className="mr-2 h-4 w-4" />}
                Discover with this Configuration
            </Button>
        </DialogFooter>
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={
        currentView === 'scraperConfig'
          ? "sm:max-w-4xl max-h-[90vh] md:max-w-6xl max-h-[90vh] rounded-lg"
          : currentView === 'promptInput'
          ? "sm:max-w-3xl max-h-[90vh] rounded-lg md:max-w-6xl max-h-[90vh] rounded-lg"
          : "sm:max-w-5xl max-h-[90vh] rounded-lg md:max-w-7xl max-h-[90vh] rounded-lg"
      }>
        {currentView === 'urlInput' && renderUrlInputView()}
        {currentView === 'promptInput' && renderPromptInputView()}
        {currentView === 'scraperConfig' && renderScraperConfigView()}
      </DialogContent>
    </Dialog>
  );
}

export default DiscoveryModal;