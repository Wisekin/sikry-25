import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils'; // Assuming cn utility for classnames

interface ScrapingProgressProps {
  progress: number; // Percentage value from 0 to 100
  statusText?: string;
  className?: string;
  error?: string | null;
}

export function ScrapingProgress({ progress, statusText, className, error }: ScrapingProgressProps) {
  if (error) {
    return (
      <div className={cn("text-red-600", className)}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {statusText && <p className="text-sm text-muted-foreground">{statusText}</p>}
      <Progress value={progress} className="w-full" />
      <p className="text-sm font-medium">{progress}% complete</p>
    </div>
  );
}

export default ScrapingProgress;
