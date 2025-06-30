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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { ScrapedData } from '@/stores/searchStore';
import { Company } from '@/src/lib/types';
import { SparklesIcon, AlertTriangle } from 'lucide-react';

interface DataComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
  originalData: Partial<Company>;
  enrichedData: ScrapedData | null | undefined;
  companyName?: string;
}

type ComparisonFieldKey = keyof ScrapedData | keyof Company['extractedData'] | 'domain' | 'location_text' | 'name' | 'description' | 'socialMedia';

type ComparisonField = {
  key: ComparisonFieldKey;
  label: string; // This will be the translated label
  originalValue?: any;
  enrichedValue?: any;
  isDifferent: boolean;
  isEnrichedOnly: boolean;
};

export function DataComparisonView({
  isOpen,
  onClose,
  originalData,
  enrichedData,
  companyName,
}: DataComparisonViewProps) {
  const { t } = useTranslation('searchPage');

  const generateComparisonFields = (): ComparisonField[] => {
    if (!originalData && !enrichedData) return [];

    const fields: ComparisonField[] = [];
    const allKeys = new Set<string>();

    const fieldMappings: Record<string, { labelKey: string, originalKey?: keyof Company | (keyof Company['extractedData']), enrichedKey: keyof ScrapedData }> = {
        name: { labelKey: 'dataComparison.labelCompanyName', originalKey: 'name', enrichedKey: 'companyName'},
        website: { labelKey: 'dataComparison.labelWebsite', originalKey: 'domain', enrichedKey: 'website' },
        emails: { labelKey: 'dataComparison.labelEmails', originalKey: 'emails', enrichedKey: 'emails' },
        phones: { labelKey: 'dataComparison.labelPhones', originalKey: 'phones', enrichedKey: 'phones' },
        address: { labelKey: 'dataComparison.labelAddress', originalKey: 'location_text', enrichedKey: 'address' },
    };

    Object.keys(fieldMappings).forEach(key => allKeys.add(key));

    if (enrichedData) {
        Object.keys(enrichedData).forEach(key => {
            if (!fieldMappings[key as keyof ScrapedData] && key !== 'socialMedia') {
                 allKeys.add(key);
            }
        });
    }

    allKeys.forEach(key => {
      const mapping = fieldMappings[key as keyof ScrapedData];
      const label = t(mapping?.labelKey || `dataComparison.label${key.charAt(0).toUpperCase() + key.slice(1)}`, key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()));

      let originalValue: any = undefined;
      if (mapping?.originalKey) {
        if (['emails', 'phones'].includes(mapping.originalKey as string)) {
          originalValue = originalData?.extractedData?.[mapping.originalKey as keyof Company['extractedData']];
        } else {
          originalValue = originalData?.[mapping.originalKey as keyof Company];
        }
      } else if (originalData && key in originalData) {
         originalValue = (originalData as Record<string, any>)[key];
      }

      const enrichedValue = enrichedData ? (enrichedData as Record<string, any>)[mapping?.enrichedKey || key] : undefined;
      const normOrig = (Array.isArray(originalValue) && originalValue.length === 0) || originalValue === '' || originalValue === null ? undefined : originalValue;
      const normEnr = (Array.isArray(enrichedValue) && enrichedValue.length === 0) || enrichedValue === '' || enrichedValue === null ? undefined : enrichedValue;
      const isDifferent = JSON.stringify(normOrig) !== JSON.stringify(normEnr) && (normOrig !== undefined || normEnr !== undefined);
      const isEnrichedOnly = normOrig === undefined && normEnr !== undefined;

      if (normOrig !== undefined || normEnr !== undefined) {
        fields.push({
          key: key as ComparisonFieldKey,
          label,
          originalValue: normOrig,
          enrichedValue: normEnr,
          isDifferent,
          isEnrichedOnly,
        });
      }
    });

    if (enrichedData?.socialMedia && Object.keys(enrichedData.socialMedia).length > 0) {
        fields.push({
            key: 'socialMedia',
            label: t('dataComparison.labelSocialMedia'),
            originalValue: undefined,
            enrichedValue: enrichedData.socialMedia,
            isDifferent: true,
            isEnrichedOnly: true,
        });
    }
    return fields;
  };

  const comparisonFields = generateComparisonFields();

  const renderValue = (value: any) => {
    if (value === undefined || value === null) return <span className="text-gray-400 italic">{t('dataComparison.valueNA')}</span>;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{companyName ? t('dataComparison.titleForCompany', { companyName }) : t('dataComparison.title')}</DialogTitle>
          <DialogDescription>
            {t('dataComparison.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 max-h-[70vh] overflow-y-auto">
          {comparisonFields.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">{t('dataComparison.headerField')}</TableHead>
                  <TableHead>{t('dataComparison.headerOriginal')}</TableHead>
                  <TableHead>{t('dataComparison.headerEnriched')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFields.map((field) => (
                  <TableRow
                    key={String(field.key)}
                    className={field.isDifferent ? (field.isEnrichedOnly ? 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/30' : 'bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-800/30') : ''}
                  >
                    <TableCell className="font-medium py-2">{field.label}</TableCell>
                    <TableCell className="py-2">{renderValue(field.originalValue)}</TableCell>
                    <TableCell className="py-2 relative">
                      {renderValue(field.enrichedValue)}
                      {field.isDifferent && field.enrichedValue !== undefined && (
                        <SparklesIcon className="w-4 h-4 text-green-500 absolute top-2 right-2" aria-label={t('dataComparison.labelEnrichedOrChanged')}/>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="flex flex-col items-center justify-center h-40 text-center">
                <AlertTriangle className="h-10 w-10 text-orange-400" />
                <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">{t('dataComparison.noData')}</p>
             </div>
          )}
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

export default DataComparisonView;
