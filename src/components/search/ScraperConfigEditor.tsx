import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // For displaying JSON config
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// This would represent the structure of a scraper configuration
// It's a placeholder and would be defined more concretely based on the scraper system
export interface ScraperConfig {
  id?: string;
  websiteUrl: string;
  selectors: Array<{
    fieldName: string;
    cssSelector: string;
    type: 'text' | 'attribute' | 'html';
    attributeName?: string; // if type is 'attribute'
  }>;
  extractionRules?: Record<string, any>; // For more complex logic
  lastModified?: string;
  version?: number;
}

interface ScraperConfigEditorProps {
  companyId?: string; // To fetch/save config associated with a company
  initialConfig?: ScraperConfig | null;
  onSaveConfig: (config: ScraperConfig) => Promise<void>;
  isLoading?: boolean; // External loading state (e.g., fetching initial config)
  readOnly?: boolean; // If the editor should be non-editable
}

export function ScraperConfigEditor({
  initialConfig,
  onSaveConfig,
  isLoading: isExternallyLoading = false,
  readOnly = false,
}: ScraperConfigEditorProps) {
  const [config, setConfig] = useState<ScraperConfig | null>(initialConfig || null);
  const [editedJson, setEditedJson] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      setEditedJson(JSON.stringify(initialConfig, null, 2));
    } else {
      // Basic default structure if no initial config
      const defaultConfig: ScraperConfig = {
        websiteUrl: '',
        selectors: [{ fieldName: 'title', cssSelector: 'h1', type: 'text' }],
      };
      setConfig(defaultConfig);
      setEditedJson(JSON.stringify(defaultConfig, null, 2));
    }
  }, [initialConfig]);

  const handleJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedJson(event.target.value);
    try {
      const parsedConfig = JSON.parse(event.target.value);
      setConfig(parsedConfig);
      setError(null); // Clear error if JSON is valid
    } catch (e) {
      setError('Invalid JSON format.');
      // Keep the text area with invalid JSON, but don't update 'config' state
    }
  };

  const handleSave = async () => {
    if (error) {
      toast({ title: 'Error', description: 'Cannot save, JSON format is invalid.', variant: 'destructive' });
      return;
    }
    if (!config) {
      toast({ title: 'Error', description: 'No configuration to save.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      await onSaveConfig(config);
      toast({ title: 'Success', description: 'Scraper configuration saved.' });
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save configuration.';
      toast({ title: 'Save Error', description: message, variant: 'destructive' });
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isExternallyLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scraper Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="ml-2">Loading configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scraper Configuration Editor</CardTitle>
        <CardDescription>
          {readOnly ? "Viewing scraper configuration." : "Define or edit the selectors and rules for scraping data."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* For now, we'll use a simple JSON editor. A form-based UI would be a future enhancement. */}
        <div>
          <label htmlFor="configJson" className="block text-sm font-medium text-gray-700 mb-1">
            Configuration (JSON)
          </label>
          <Textarea
            id="configJson"
            value={editedJson}
            onChange={handleJsonChange}
            rows={15}
            className={`font-mono text-sm ${error ? 'border-red-500' : ''}`}
            readOnly={readOnly}
            placeholder="Enter scraper configuration in JSON format..."
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>

        {!readOnly && (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditedJson(JSON.stringify(initialConfig || {}, null, 2))}>
              Reset Changes
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !!error || !config}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ScraperConfigEditor;
