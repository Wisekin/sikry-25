import React, { useState } from 'react';
import { Button, ButtonProps } from '@/src/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, FileCsv, Loader2 } from 'lucide-react'; // Example icons
import { useToast } from '@/hooks/use-toast';

type ExportFormat = 'csv' | 'json' | 'xlsx'; // Example formats

interface ExportButtonProps extends Omit<ButtonProps, 'onClick'> {
  onExport: (format: ExportFormat) => Promise<boolean | { error: string }>; // Returns true on success, false or error object on failure
  fileName?: string; // Suggested filename without extension
  disabled?: boolean;
}

export function ExportButton({
  onExport,
  fileName = 'exported_data',
  disabled = false,
  children,
  ...props
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const { toast } = useToast();

  const handleExportClick = async (format: ExportFormat) => {
    setIsExporting(format);
    try {
      const result = await onExport(format);
      if (result === true) {
        toast({
          title: 'Export Started',
          description: `Your data is being exported as ${format.toUpperCase()}. This may take a few moments.`,
        });
      } else if (typeof result === 'object' && result.error) {
         toast({
          title: 'Export Failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
         toast({
          title: 'Export Failed',
          description: 'An unexpected error occurred during export.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'Could not initiate export.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || !!isExporting} {...props}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {children || (isExporting ? `Exporting ${isExporting.toUpperCase()}...` : 'Export Data')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExportClick('csv')}
          disabled={!!isExporting}
        >
          <FileCsv className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExportClick('json')}
          disabled={!!isExporting}
        >
          <FileText className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        {/* Add XLSX or other formats as needed */}
        {/* <DropdownMenuItem onClick={() => handleExportClick('xlsx')} disabled={!!isExporting}>
          <SheetIcon className="mr-2 h-4 w-4" /> {}
          Export as XLSX
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;
