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
import {
  Loader2,
  AlertTriangle,
  SettingsIcon,
  LinkIcon,
  EyeIcon,
  SparklesIcon,
  Edit3Icon,
  Wand2Icon,
  ArrowRightIcon,
  RocketIcon,
  CheckCircle2,
  ChevronLeftIcon
} from 'lucide-react';
import { ScraperConfigEditor, ScraperConfig } from './ScraperConfigEditor';
import { useSearchStore } from '@/stores/searchStore';
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { PromptSuggestionCard } from './PromptSuggestionCard'; // Import the new component

export interface ScraperSelector {
  fieldName: string;
  cssSelector: string;
  type: 'text' | 'attribute' | 'html';
  attributeName?: string;
}

type ModalView = 'urlInput' | 'promptInput' | 'scraperConfig';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName:string;
  initialUrl?: string;
  onConfirmManualUrl?: (companyId: string, manualUrl: string, config?: ScraperConfig) => Promise<void>;
}

// Helper to normalize URLs
function normalizeUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

// Main Component
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
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const PROMPT_SUGGESTIONS = [
      "Extract all contact information like emails and phone numbers...",
      "List all products or services mentioned on the homepage.",
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [generatedSummary, isGeneratingConfig]);

  useEffect(() => {
    if (isOpen) {
      const urlToUse = normalizeUrl(companyDiscoveryState?.website || initialUrl || '');
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
      setScraperConfig(existingConfig || null);
    } else {
      // Reset state on close
      setManualUrl('');
      setPreviewUrl('');
      setConfirmedUrl(null);
      setPreviewError(null);
      setCurrentView('urlInput');
      setScraperConfig(null);
      setPrompt('');
      setGeneratedSummary(null);
      setAiGeneratedConfig(null);
    }
  }, [isOpen, initialUrl, companyId, companyDiscoveryState]);

  const isValidHttpUrl = (string: string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

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
    const normalized = normalizeUrl(manualUrl);
    setConfirmedUrl(normalized);
    setGeneratedSummary(null);
    setPrompt('');
    setAiGeneratedConfig(null);

    const existingConfig = companyDiscoveryState?.scraperConfig;
    if (existingConfig && existingConfig.websiteUrl === normalized) {
      setScraperConfig(existingConfig);
    } else {
      setScraperConfig({
        id: `temp-${Date.now()}`,
        websiteUrl: normalized,
        selectors: [],
        version: 1,
        lastModified: new Date().toISOString()
      });
    }
    setCurrentView('promptInput');
  };

  const handleGenerateConfig = async () => {
    if (!confirmedUrl || !prompt.trim()) return;
    setIsGeneratingConfig(true);
    setGeneratedSummary(null);
    setAiGeneratedConfig(null);

    // Simulate API call
    setTimeout(() => {
      try {
        if (prompt.includes("fail")) {
             throw new Error("The AI model failed to generate a valid configuration. Please try rephrasing your request.");
        }
        const mockResponse = {
            config: {
                id: `generated-${Date.now()}`,
                websiteUrl: confirmedUrl,
                selectors: [
                    { fieldName: 'email', cssSelector: 'a[href^="mailto:"]', type: 'attribute' as const, attributeName: 'href' },
                    { fieldName: 'main_heading', cssSelector: 'h1', type: 'text' as const },
                    { fieldName: 'primary_phone', cssSelector: '.phone, .tel', type: 'text' as const },
                ],
                version: 1,
                lastModified: new Date().toISOString()
            },
            summary: [
                "Identified selectors for email addresses.",
                "Set up a rule to capture the main H1 heading.",
                "Added selectors for common phone number classes.",
                "Configuration is ready for review or use."
            ]
        };
        setAiGeneratedConfig(mockResponse.config);
        setScraperConfig(mockResponse.config);
        setGeneratedSummary(mockResponse.summary);
        toast({
            title: "AI Configuration Generated!",
            description: "The AI has proposed a configuration. You can now start discovery or edit it.",
            className: "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700",
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ title: "Generation Failed", description: errorMessage, variant: "destructive" });
        setGeneratedSummary([`Error: ${errorMessage}`]);
      } finally {
        setIsGeneratingConfig(false);
      }
    }, 1500);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
      setPrompt(suggestion);
      // Focues the textarea after setting prompt
      promptInputRef.current?.focus();
  }

  const handleStartDiscoveryWithConfig = async () => {
    if (!confirmedUrl || !scraperConfig) return;
    if (onConfirmManualUrl) {
      setIsLoading(true);
      try {
        await onConfirmManualUrl(companyId, confirmedUrl, scraperConfig);
        toast({ title: "Discovery Started!", description: `The process has successfully begun for ${confirmedUrl}.`, icon: <RocketIcon className="h-5 w-5 text-blue-500" /> });
        onClose();
      } catch (error) {
        toast({ title: "Error Starting Discovery", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const renderUrlInputView = () => (
    <>
      <DialogHeader className="p-4 border-b dark:border-slate-800">
        <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Website Discovery for <span className="text-blue-600 dark:text-blue-400">{companyName}</span>
        </DialogTitle>
        <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
          Enter or verify the website URL. A live preview will load below.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 p-6">
        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
          <Input
            id="manualUrl"
            placeholder="https://www.example.com"
            value={manualUrl}
            onChange={handleManualUrlChange}
            className="w-full pl-12 h-12 text-lg text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 rounded-lg shadow-sm"
          />
        </div>

        <div className="min-h-[450px] border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-900/50 overflow-hidden relative shadow-inner">
          {previewUrl && isValidHttpUrl(previewUrl) ? (
            <>
              {(isPreviewLoading || previewError) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/90 dark:bg-slate-900/90 z-10 p-4 backdrop-blur-sm">
                  {isPreviewLoading ? <Loader2 className="h-10 w-10 animate-spin text-blue-500" /> : <AlertTriangle className="h-10 w-10 text-amber-500" />}
                  <p className="mt-4 text-center font-medium text-slate-600 dark:text-slate-400">{isPreviewLoading ? 'Loading Preview...' : previewError}</p>
                </div>
              )}
              <iframe
                src={previewUrl}
                title="Website Preview"
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-same-origin"
                onLoadStart={() => setIsPreviewLoading(true)}
                onLoad={() => setIsPreviewLoading(false)}
                onError={() => { setIsPreviewLoading(false); if (!previewError) setPreviewError('Could not load preview. The site may block embedding.'); }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <LinkIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
              <p className="mt-4 text-lg font-semibold text-slate-500 dark:text-slate-400">
                {previewError || "Enter a valid URL to see a preview"}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">The website will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

 const renderPromptInputView = () => (
    <>
        {/* Header Section with Gradient */}
        <div className="text-center py-2 mr-3 ml-3 rounded-t-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 ">
       
            <DialogTitle className="text-3xl font-extrabold text-white tracking-tight">
                AI-Powered Scraper
            </DialogTitle>
             <DialogDescription className="mt-2 text-slate-400 text-md max-w-2xl mx-auto">
                Describe the data you need from <strong className="text-blue-300 font-medium">{confirmedUrl}</strong>, and our AI will build the scraper for you.
            </DialogDescription>
        </div>

        {/* Chat & Prompt Area */}
        <div className="flex flex-col min-h-[450px] bg-slate-100 dark:bg-slate-900/70 border-y dark:border-slate-800">
            <div className="flex-grow overflow-y-auto p-6 space-y-6 scroll-smooth" ref={chatContainerRef}>
                {/* Initial State: AI Welcome & Suggestions */}
                {!generatedSummary && !isGeneratingConfig && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start gap-3 max-w-xl mb-6">
                            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-900">
                                <SparklesIcon className="w-6 h-6" />
                            </span>
                            <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    I'm ready to get started! What data should I extract? You can either type your request or choose one of the suggestions below.
                                    <br />
                                    <em className="text-red-800 dark:text-slate-800">If you don't specify anything, I'll look for default data like phone numbers and emails.</em>
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 max-w-xl ml-12">
                            {PROMPT_SUGGESTIONS.map(s => <PromptSuggestionCard key={s} suggestion={s} onClick={handleSuggestionClick} />)}
                        </div>
                    </div>
                )}
                
                {/* AI Generated Summary Message */}
                {generatedSummary && (
                    <div className="flex items-start gap-3 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-900">
                           <SparklesIcon className="w-6 h-6" />
                        </span>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Here's my plan:</p>
                            <ul className="space-y-1.5">
                                {generatedSummary.map((item, index) => (
                                    <li key={index} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                      <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                {/* Loading Indicator */}
                {isGeneratingConfig && (
                    <div className="flex items-start gap-3 max-w-md animate-in fade-in">
                         <span className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-900">
                           <SparklesIcon className="w-6 h-6 animate-pulse" />
                        </span>
                        <div className="p-4 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin"/>
                                <span className="font-medium">Generating configuration...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Prompt Input Area */}
            <div className="flex-shrink-0 p-4 sm:p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-t dark:border-slate-800">
                <div className="relative">
                    <Textarea
                        ref={promptInputRef}
                        id="aiPrompt"
                        placeholder="e.g., 'Get all phone numbers and addresses'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerateConfig(); }}}
                        rows={1}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-full w-full resize-none p-3 pl-5 pr-28 sm:pr-36 text-md focus-visible:ring-2 focus-visible:ring-blue-500/80 dark:focus-visible:ring-blue-500/60 shadow-sm"
                        disabled={isGeneratingConfig}
                    />
                    <Button
                        size="sm"
                        onClick={handleGenerateConfig}
                        disabled={isGeneratingConfig || !prompt.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                    >
                        {isGeneratingConfig ? <Loader2 className="h-5 w-5 animate-spin"/> : <ArrowRightIcon className="h-5 w-5" />}
                        <span className="ml-1.5 hidden sm:inline">Generate</span>
                    </Button>
                </div>
            </div>
        </div>
    </>
  );

  const renderScraperConfigView = () => {
    if (!confirmedUrl) return null;
    const configToEdit = aiGeneratedConfig || scraperConfig;

    return (
      <>
        <DialogHeader className="p-6 border-b dark:border-slate-800">
          <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <SettingsIcon className="w-7 h-7 mr-3 text-blue-500"/>
            Manual Scraper Configuration
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
            Review or edit data extraction rules for <span className="font-medium text-blue-500 dark:text-blue-400">{confirmedUrl}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
          {configToEdit ? (
            <ScraperConfigEditor
              key={confirmedUrl}
              initialConfig={configToEdit}
              onSaveConfig={async (newConfig) => {
                 setAiGeneratedConfig(newConfig);
                 setScraperConfig(newConfig);
                 toast({ title: "Configuration Updated", description: "Your manual changes have been saved." });
              }}
              isLoading={isLoading}
            />
          ) : (
             <div className="flex flex-col items-center justify-center h-40 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="mt-4 font-medium">Loading configuration...</p>
            </div>
          )}
        </div>
      </>
    );
  };

  if (!isOpen) return null;

  // Sticky header component with grouped buttons
  const renderStickyHeader = () => (
    <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {currentView === 'urlInput' ? '' : currentView === 'promptInput' ? 'AI Configuration' : 'Scraper Config'}
        </h2>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={currentView === 'urlInput' ? onClose : () => setCurrentView(prev => {
              if (prev === 'scraperConfig') return 'promptInput';
              if (prev === 'promptInput') return 'urlInput';
              return prev;
            })}
            className="px-4 py-2"
          >
            {currentView === 'urlInput' ? 'Cancel' : 'Back'}
          </Button>
          
          {currentView === 'urlInput' ? (
            <Button
              onClick={handleConfirmAndProceedToConfig}
              disabled={isLoading || !manualUrl || !isValidHttpUrl(manualUrl) || isPreviewLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow-md px-6 py-2"
            >
              Confirm & Configure Scraper <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStartDiscoveryWithConfig}
              disabled={isLoading || !scraperConfig}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow-md px-6 py-2"
            >
              {currentView === 'promptInput' ? 'Continue to Scraper' : 'Start Discovery'}
              <RocketIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className=" text-sm text-slate-500 dark:text-slate-400">
        
        {currentView === 'promptInput' && 'Describe what data you want to extract'}
        {currentView === 'scraperConfig' && 'Review and edit the scraper configuration'}
      </div>
    </div>
  );

  // Enhanced footer component with progress indicators
  const renderEnhancedFooter = () => (
    <div className="sticky  z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium">
            {currentView === 'urlInput' ? 1 : currentView === 'promptInput' ? 2 : 3}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentView === 'urlInput' ? 'Enter Website URL' : 
             currentView === 'promptInput' ? 'Configure with AI' : 
             'Review & Start Discovery'}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
            <span>Step</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {currentView === 'urlInput' ? '1' : currentView === 'promptInput' ? '2' : '3'}
            </span>
            <span>of</span>
            <span>3</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  (currentView === 'urlInput' && step === 1) ||
                  (currentView === 'promptInput' && step === 2) ||
                  (currentView === 'scraperConfig' && step === 3)
                    ? 'bg-blue-600 w-4'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 rounded-xl shadow-2xl border-0 w-[90vw] max-w-none sm:max-w-5xl lg:max-w-7xl dark:bg-slate-900 h-[85vh] flex flex-col">
        <div className="flex flex-col h-full">
          {renderStickyHeader()}
          <div className="flex-1 overflow-y-auto">
            {currentView === 'urlInput' && renderUrlInputView()}
            {currentView === 'promptInput' && renderPromptInputView()}
            {currentView === 'scraperConfig' && renderScraperConfigView()}
          </div>
          {renderEnhancedFooter()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DiscoveryModal;