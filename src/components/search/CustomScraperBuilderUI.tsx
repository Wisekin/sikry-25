import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Trash2Icon, PlusCircleIcon, EyeIcon, CodeIcon, SaveIcon, FolderOpenIcon, HelpCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';

// Matches ScraperConfig in ScraperConfigEditor.tsx for potential compatibility
export interface ScraperFieldConfig {
  id: string; // Unique ID for the field for list rendering
  fieldName: string;
  cssSelector: string;
  type: 'text' | 'attribute' | 'html' | 'link';
  attributeName?: string; // if type is 'attribute'
}

export interface FullScraperConfig {
  id?: string; // Config ID if saved/loaded
  name: string;
  targetUrl: string;
  fields: ScraperFieldConfig[];
  // Advanced settings: pagination selectors, delay settings, etc.
  description?: string;
}

const initialField: Omit<ScraperFieldConfig, 'id'> = {
  fieldName: '', cssSelector: '', type: 'text', attributeName: ''
};

export function CustomScraperBuilderUI() {
  const [config, setConfig] = useState<FullScraperConfig>({
    name: 'New Scraper',
    targetUrl: '',
    fields: [{...initialField, id: crypto.randomUUID()}],
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const updateField = (index: number, updatedField: Partial<ScraperFieldConfig>) => {
    const newFields = [...config.fields];
    newFields[index] = { ...newFields[index], ...updatedField };
    setConfig(prev => ({ ...prev, fields: newFields }));
  };

  const addField = () => {
    setConfig(prev => ({
      ...prev,
      fields: [...prev.fields, {...initialField, id: crypto.randomUUID()}],
    }));
  };

  const removeField = (index: number) => {
    const newFields = config.fields.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, fields: newFields }));
  };

  const handleLoadUrlPreview = () => {
    if (config.targetUrl && (config.targetUrl.startsWith('http://') || config.targetUrl.startsWith('https://'))) {
        setIsLoadingPreview(true);
        setPreviewUrl(config.targetUrl);
        // setIsLoadingPreview will be set to false by iframe's onLoad or onError
    } else {
        toast({ title: "Invalid URL", description: "Please enter a valid URL starting with http:// or https://", variant: "destructive"});
        setPreviewUrl('');
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    console.log("Saving config:", config);
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    toast({ title: "Configuration Saved", description: `${config.name} has been saved (mocked).` });
  };

  const handleLoadConfig = () => {
    // Mock load operation
    const mockLoadedConfig: FullScraperConfig = {
        id: 'loaded-config-123',
        name: 'Loaded Example Scraper',
        targetUrl: 'https://example.com/products',
        fields: [
            { id: crypto.randomUUID(), fieldName: 'productName', cssSelector: 'h1.product-title', type: 'text'},
            { id: crypto.randomUUID(), fieldName: 'price', cssSelector: '.price-tag', type: 'text'},
            { id: crypto.randomUUID(), fieldName: 'imageUrl', cssSelector: 'img.product-image', type: 'attribute', attributeName: 'src'},
        ],
        description: "This is a loaded example."
    };
    setConfig(mockLoadedConfig);
    setPreviewUrl(mockLoadedConfig.targetUrl); // Optionally load preview
    toast({ title: "Configuration Loaded", description: `${mockLoadedConfig.name} loaded (mocked).` });
  }

  return (
    <TooltipProvider>
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-100px)] max-h-full">
      {/* Left Panel: Configuration */}
      <Card className="w-full lg:w-1/3 flex flex-col max-h-full">
        <CardHeader>
          <CardTitle>Scraper Configuration</CardTitle>
          <CardDescription>Define the target and fields for your custom scraper.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow overflow-y-auto">
          <div>
            <Label htmlFor="scraperName">Scraper Name</Label>
            <Input id="scraperName" value={config.name} onChange={e => setConfig(p => ({...p, name: e.target.value}))} placeholder="e.g., Product Details Scraper" />
          </div>
          <div>
            <Label htmlFor="targetUrl">Target URL</Label>
            <div className="flex gap-2">
              <Input id="targetUrl" value={config.targetUrl} onChange={e => setConfig(p => ({...p, targetUrl: e.target.value}))} placeholder="https://example.com/data" />
              <Button variant="outline" size="icon" onClick={handleLoadUrlPreview} aria-label="Load URL in preview">
                <EyeIcon className="h-4 w-4"/>
              </Button>
            </div>
          </div>
          <div>
            <Label>Fields to Extract</Label>
            <div className="space-y-3 max-h-96 overflow-y-auto border p-2 rounded-md">
              {config.fields.map((field, index) => (
                <Card key={field.id} className="p-3 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Field #{index + 1}</Label>
                    <Button variant="ghost" size="icon" onClick={() => removeField(index)} className="text-red-500 hover:text-red-700">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`fieldName-${index}`} className="text-xs">Field Name</Label>
                      <Input id={`fieldName-${index}`} value={field.fieldName} onChange={e => updateField(index, { fieldName: e.target.value })} placeholder="e.g., title" />
                    </div>
                    <div>
                      <Label htmlFor={`fieldType-${index}`} className="text-xs">Type</Label>
                      <Select value={field.type} onValueChange={(value: ScraperFieldConfig['type']) => updateField(index, { type: value })}>
                        <SelectTrigger id={`fieldType-${index}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="attribute">Attribute</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="link">Link (href)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label htmlFor={`cssSelector-${index}`} className="text-xs">CSS Selector</Label>
                    <Input id={`cssSelector-${index}`} value={field.cssSelector} onChange={e => updateField(index, { cssSelector: e.target.value })} placeholder="e.g., h1.main-title" />
                  </div>
                  {field.type === 'attribute' && (
                    <div className="mt-2">
                      <Label htmlFor={`attributeName-${index}`} className="text-xs">Attribute Name</Label>
                      <Input id={`attributeName-${index}`} value={field.attributeName || ''} onChange={e => updateField(index, { attributeName: e.target.value })} placeholder="e.g., data-id, src" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
            <Button variant="outline" onClick={addField} className="mt-2 w-full">
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </div>
           <div>
                <Label htmlFor="scraperDescription">Description (Optional)</Label>
                <Textarea id="scraperDescription" value={config.description || ''} onChange={e => setConfig(p => ({...p, description: e.target.value}))} placeholder="Briefly describe what this scraper does."/>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex-col sm:flex-row gap-2">
            <Button onClick={handleLoadConfig} variant="outline" className="w-full sm:w-auto">
                <FolderOpenIcon className="mr-2 h-4 w-4"/> Load (Mock)
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSaving} className="w-full sm:w-auto sm:ml-auto">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SaveIcon className="mr-2 h-4 w-4" />}
                Save Config (Mock)
            </Button>
        </CardFooter>
      </Card>

      {/* Right Panel: Preview & Inspector */}
      <Card className="w-full lg:w-2/3 flex flex-col max-h-full">
        <CardHeader className="flex-row justify-between items-center">
            <div>
                <CardTitle>Website Preview / Inspector</CardTitle>
                <CardDescription>View the target URL. Future: Element inspector and selector helper.</CardDescription>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                        <CodeIcon className="h-5 w-5"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent><p>Selector Helper (Coming Soon)</p></TooltipContent>
            </Tooltip>
        </CardHeader>
        <CardContent className="flex-grow p-0 relative bg-gray-100">
          {previewUrl ? (
            <>
            {isLoadingPreview && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="mt-2">Loading preview...</p>
                </div>
            )}
            <iframe
              src={previewUrl}
              title="Website Preview for Scraper"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms" // More permissive for interaction, but be cautious
              onLoad={() => setIsLoadingPreview(false)}
              onError={() => {
                setIsLoadingPreview(false);
                toast({title: "Preview Error", description: "Could not load website preview. The site may block embedding or is unavailable.", variant: "destructive"});
              }}
            />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <EyeIcon className="w-16 h-16 mb-4" />
              <p>Enter a Target URL and click the eye icon to load a preview.</p>
              <p className="text-xs mt-2">Note: Some websites may not load in an iframe due to security policies (X-Frame-Options).</p>
            </div>
          )}
           {/* Placeholder for Drag-and-Drop instructions or selector helper tool */}
           <div className="absolute bottom-2 right-2 p-2 bg-black/50 text-white text-xs rounded shadow-lg">
              Future: Drag to select elements or use inspector tool.
            </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}

export default CustomScraperBuilderUI;
