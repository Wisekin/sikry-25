import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSearchStore } from '@/stores/searchStore'; // To trigger discovery actions
import { Loader2, UploadCloud } from 'lucide-react';

interface CompanyInput {
  id: string; // A unique ID for this input item, e.g., line number or generated hash
  nameOrDomain: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

export function BulkDiscovery() {
  const [inputText, setInputText] = useState('');
  const [companyInputs, setCompanyInputs] = useState<CompanyInput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { initiateWebsiteDiscovery } = useSearchStore(state => ({
    initiateWebsiteDiscovery: state.initiateWebsiteDiscovery,
  }));

  const handleParseInput = () => {
    const lines = inputText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      toast({ title: "Input Required", description: "Please enter company names or domains, one per line.", variant: "destructive" });
      return;
    }
    const newInputs: CompanyInput[] = lines.map((line, index) => ({
      id: `item-${Date.now()}-${index}`, // Simple unique ID
      nameOrDomain: line.trim(),
      status: 'pending',
    }));
    setCompanyInputs(newInputs);
  };

  const handleProcessBulkDiscovery = async () => {
    if (companyInputs.length === 0) {
      toast({ title: "No Companies", description: "Please parse some company inputs first.", variant: "default" });
      return;
    }

    setIsProcessing(true);
    toast({ title: "Bulk Discovery Started", description: `Processing ${companyInputs.length} items...` });

    for (const input of companyInputs) {
      if (input.status !== 'pending') continue; // Skip already processed or processing

      setCompanyInputs(prev => prev.map(item => item.id === input.id ? { ...item, status: 'loading' } : item));

      try {
        // Assuming company ID and name are derived or the same for this mock
        // In a real scenario, you might need to pre-validate or look up company IDs if possible
        // For simplicity, we'll use the input itself as a "name" and a generated ID for store interaction
        // The store action might need adjustment if it strictly requires a pre-existing company ID from results.
        // For this placeholder, let's assume the store action can handle new discoveries based on name/domain.
        await initiateWebsiteDiscovery(input.id, input.nameOrDomain, input.nameOrDomain); // Using input.id as companyId for store state

        setCompanyInputs(prev => prev.map(item => item.id === input.id ? { ...item, status: 'success', message: 'Discovery initiated.' } : item));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setCompanyInputs(prev => prev.map(item => item.id === input.id ? { ...item, status: 'error', message: errorMessage } : item));
      }
      // Optional: Add a small delay between requests if hitting an API rapidly
      // await new Promise(resolve => setTimeout(resolve, 200));
    }

    setIsProcessing(false);
    toast({ title: "Bulk Discovery Complete", description: "All items processed." });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Bulk Website Discovery</CardTitle>
        <CardDescription>
          Enter a list of company names or domains (one per line) to discover and scrape their websites.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bulk-input-textarea" className="mb-1 block text-sm font-medium">Company Names/Domains:</Label>
          <Textarea
            id="bulk-input-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Acme Corp\nbeta.com\nGamma Inc (gamma.co)"
            rows={8}
            disabled={isProcessing || companyInputs.length > 0 && !isProcessing } // Disable if parsed and not yet cleared
          />
           <div className="mt-2 flex gap-2">
            <Button onClick={handleParseInput} disabled={isProcessing || companyInputs.length > 0 && !isProcessing || !inputText.trim()}>
                <UploadCloud className="mr-2 h-4 w-4" /> Parse Input
            </Button>
            {companyInputs.length > 0 && !isProcessing && (
                <Button variant="outline" onClick={() => { setCompanyInputs([]); setInputText(''); }}>Clear Parsed List</Button>
            )}
           </div>
        </div>

        {companyInputs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-semibold">Parsed Companies ({companyInputs.length})</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-1">
              {companyInputs.map(input => (
                <div key={input.id} className="flex justify-between items-center p-1.5 bg-gray-50 rounded text-sm">
                  <span className="truncate flex-1" title={input.nameOrDomain}>{input.nameOrDomain}</span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    input.status === 'pending' ? 'bg-gray-200 text-gray-700' :
                    input.status === 'loading' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                    input.status === 'success' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {input.status}
                    {input.status === 'loading' && <Loader2 className="inline ml-1 h-3 w-3 animate-spin"/>}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={handleProcessBulkDiscovery} disabled={isProcessing || companyInputs.every(c => c.status !== 'pending')}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Start Bulk Discovery
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Basic Label component if not globally available or for local structure
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({className, ...props}) => (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
);


export default BulkDiscovery;
