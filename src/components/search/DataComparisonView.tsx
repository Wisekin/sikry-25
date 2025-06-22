import React from 'react';
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
import { ScrapedData } from '@/stores/searchStore'; // Assuming ScrapedData is available
import { Company } from '@/src/lib/types'; // For original company data type
import { SparklesIcon, AlertTriangle } from 'lucide-react';

interface DataComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
  originalData: Partial<Company>; // Original company data from initial search/DB
  enrichedData: ScrapedData | null | undefined; // Data after scraping/enrichment
  companyName?: string;
}

type ComparisonField = {
  key: keyof ScrapedData | keyof Company['extractedData'] | 'domain' | 'location_text' | 'name' | 'description'; // Add more keys as needed
  label: string;
  originalValue?: any;
  enrichedValue?: any;
  isDifferent: boolean;
  isEnrichedOnly: boolean; // True if the field only exists in enriched data
};

export function DataComparisonView({
  isOpen,
  onClose,
  originalData,
  enrichedData,
  companyName,
}: DataComparisonViewProps) {

  const generateComparisonFields = (): ComparisonField[] => {
    if (!originalData && !enrichedData) return [];

    const fields: ComparisonField[] = [];
    const allKeys = new Set<string>();

    // Define a mapping for display labels and potentially how to access nested original data
    const fieldMappings: Record<string, { label: string, originalKey?: keyof Company | (keyof Company['extractedData']), enrichedKey: keyof ScrapedData }> = {
        name: { label: 'Company Name', originalKey: 'name', enrichedKey: 'companyName'},
        website: { label: 'Website', originalKey: 'domain', enrichedKey: 'website' },
        emails: { label: 'Emails', originalKey: 'emails', enrichedKey: 'emails' }, // Assuming original emails are in extractedData
        phones: { label: 'Phones', originalKey: 'phones', enrichedKey: 'phones' }, // Assuming original phones are in extractedData
        address: { label: 'Address', originalKey: 'location_text', enrichedKey: 'address' },
        // Add other direct ScrapedData fields
        // socialMedia needs special handling due to its object structure
    };

    // Add keys from fieldMappings (covers common fields)
    Object.keys(fieldMappings).forEach(key => allKeys.add(key));

    // Add any other keys present in enrichedData that are not in fieldMappings
    if (enrichedData) {
        Object.keys(enrichedData).forEach(key => {
            if (!fieldMappings[key as keyof ScrapedData] && key !== 'socialMedia') { // Exclude socialMedia for now from direct mapping
                 allKeys.add(key);
            }
        });
    }


    allKeys.forEach(key => {
      const mapping = fieldMappings[key as keyof ScrapedData];
      const label = mapping?.label || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

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

      // Normalize empty arrays/objects/strings for comparison
      const normOrig = (Array.isArray(originalValue) && originalValue.length === 0) || originalValue === '' || originalValue === null ? undefined : originalValue;
      const normEnr = (Array.isArray(enrichedValue) && enrichedValue.length === 0) || enrichedValue === '' || enrichedValue === null ? undefined : enrichedValue;

      const isDifferent = JSON.stringify(normOrig) !== JSON.stringify(normEnr) && (normOrig !== undefined || normEnr !== undefined);
      const isEnrichedOnly = normOrig === undefined && normEnr !== undefined;

      if (normOrig !== undefined || normEnr !== undefined) { // Only add if at least one value exists
        fields.push({
          key: key as ComparisonField['key'],
          label,
          originalValue: normOrig,
          enrichedValue: normEnr,
          isDifferent,
          isEnrichedOnly,
        });
      }
    });

    // Handle socialMedia separately
    if (enrichedData?.socialMedia && Object.keys(enrichedData.socialMedia).length > 0) {
        fields.push({
            key: 'socialMedia' as any, // Cast as key type might not fully cover this structure
            label: 'Social Media',
            originalValue: undefined, // Assuming original data doesn't have this structure
            enrichedValue: enrichedData.socialMedia,
            isDifferent: true,
            isEnrichedOnly: true,
        });
    }

    return fields;
  };

  const comparisonFields = generateComparisonFields();

  const renderValue = (value: any) => {
    if (value === undefined || value === null) return <span className="text-gray-400 italic">N/A</span>;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
    return String(value);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Data Comparison {companyName ? `for ${companyName}` : ''}</DialogTitle>
          <DialogDescription>
            Comparing original data with enriched data. Highlighted rows indicate differences or new information.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 max-h-[70vh] overflow-y-auto">
          {comparisonFields.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Field</TableHead>
                  <TableHead>Original Data</TableHead>
                  <TableHead>Enriched Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonFields.map((field) => (
                  <TableRow
                    key={String(field.key)}
                    className={field.isDifferent ? (field.isEnrichedOnly ? 'bg-green-50 hover:bg-green-100' : 'bg-yellow-50 hover:bg-yellow-100') : ''}
                  >
                    <TableCell className="font-medium py-2">{field.label}</TableCell>
                    <TableCell className="py-2">{renderValue(field.originalValue)}</TableCell>
                    <TableCell className="py-2 relative">
                      {renderValue(field.enrichedValue)}
                      {field.isDifferent && field.enrichedValue !== undefined && (
                        <SparklesIcon className="w-4 h-4 text-green-500 absolute top-2 right-2" title="Enriched or Changed"/>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="flex flex-col items-center justify-center h-40 text-center">
                <AlertTriangle className="h-10 w-10 text-orange-400" />
                <p className="mt-3 text-sm text-gray-600">No data available for comparison.</p>
             </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataComparisonView;
