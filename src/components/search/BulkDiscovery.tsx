import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSearchStore } from '@/stores/searchStore';
import { Loader2, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyInput {
  id: string;
  nameOrDomain: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

export function BulkDiscovery() {
  const { t } = useTranslation('searchPage');
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
      toast({ title: t('bulkDiscovery.toastRequired'), description: t('bulkDiscovery.toastRequiredDescription'), variant: "destructive" });
      return;
    }
    const newInputs: CompanyInput[] = lines.map((line, index) => ({
      id: `item-${Date.now()}-${index}`,
      nameOrDomain: line.trim(),
      status: 'pending',
    }));
    setCompanyInputs(newInputs);
  };

  const handleProcessBulkDiscovery = async () => {
    if (companyInputs.length === 0) {
      toast({ title: t('bulkDiscovery.toastNoCompanies'), description: t('bulkDiscovery.toastNoCompaniesDescription'), variant: "default" });
      return;
    }

    setIsProcessing(true);
    toast({ title: t('bulkDiscovery.toastDiscoveryStarted'), description: t('bulkDiscovery.toastProcessingItems', { count: companyInputs.length }) });

    for (const input of companyInputs) {
      if (input.status !== 'pending') continue;

      setCompanyInputs(prev => prev.map(item => item.id === input.id ? { ...item, status: 'loading' } : item));

      try {
        await initiateWebsiteDiscovery(input.id, input.nameOrDomain, input.nameOrDomain);
        setCompanyInputs(prev => prev.map(item => item.id === input.id ? { ...item, status: 'success', message: t('bulkDiscovery.messageInitiated') } : item));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('companyCard.discovery.status.unknownError'); // Using a common error key
        setCompanyInputs(prev => prev.map(item => item.id === input.id ? { ...item, status: 'error', message: errorMessage } : item));
      }
    }

    setIsProcessing(false);
    toast({ title: t('bulkDiscovery.toastDiscoveryComplete'), description: t('bulkDiscovery.toastAllProcessed') });
  };

  const getStatusText = (status: CompanyInput['status']) => {
    switch (status) {
      case 'pending': return t('bulkDiscovery.statusPending');
      case 'loading': return t('bulkDiscovery.statusLoading');
      case 'success': return t('bulkDiscovery.statusSuccess');
      case 'error': return t('bulkDiscovery.statusError');
      default: return status;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('bulkDiscovery.title')}</CardTitle>
        <CardDescription>
          {t('bulkDiscovery.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bulk-input-textarea" className="mb-1 block text-sm font-medium">{t('bulkDiscovery.inputLabel')}</Label>
          <Textarea
            id="bulk-input-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('bulkDiscovery.inputPlaceholder')}
            rows={8}
            disabled={isProcessing || (companyInputs.length > 0 && !isProcessing)}
          />
           <div className="mt-2 flex gap-2">
            <Button onClick={handleParseInput} disabled={isProcessing || (companyInputs.length > 0 && !isProcessing) || !inputText.trim()}>
                <UploadCloud className="mr-2 h-4 w-4" /> {t('bulkDiscovery.parseButton')}
            </Button>
            {companyInputs.length > 0 && !isProcessing && (
                <Button variant="outline" onClick={() => { setCompanyInputs([]); setInputText(''); }}>{t('bulkDiscovery.clearButton')}</Button>
            )}
           </div>
        </div>

        {companyInputs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-semibold">{t('bulkDiscovery.parsedCompaniesTitle', { count: companyInputs.length })}</h3>
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
                    {getStatusText(input.status)}
                    {input.status === 'loading' && <Loader2 className="inline ml-1 h-3 w-3 animate-spin"/>}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={handleProcessBulkDiscovery} disabled={isProcessing || companyInputs.every(c => c.status !== 'pending')}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('bulkDiscovery.startButton')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Basic Label component if not globally available or for local structure
// Assuming Label is imported from ui/label, so this local one might not be needed if that's the case.
// If it is used, it should also be translated if it had text content.
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({className, ...props}) => (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
);

export default BulkDiscovery;
