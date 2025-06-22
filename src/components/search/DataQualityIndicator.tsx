import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react'; // Example icons

// Define more specific quality aspects if needed
export interface DataQualityScore {
  completeness: number; // 0-100%
  accuracy?: number; // 0-100% (if available)
  freshness?: number; // 0-100% (if available)
  overall: number; // Calculated overall score 0-100%
}

interface DataQualityIndicatorProps {
  qualityScore?: DataQualityScore | null; // Score object
  size?: 'sm' | 'md' | 'lg';
  displayMode?: 'compact' | 'detailed' | 'bar'; // compact: icon + overall score, detailed: multiple aspects, bar: just overall bar
  className?: string;
}

const QualityAspect: React.FC<{label: string, score: number, icon?: React.ElementType}> = ({ label, score, icon: Icon }) => {
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  return (
    <div className="flex items-center text-xs">
      {Icon && <Icon className={cn("w-3.5 h-3.5 mr-1.5", scoreColor)} />}
      <span className="text-gray-600">{label}:</span>
      <span className={cn("font-semibold ml-1", scoreColor)}>{score}%</span>
    </div>
  );
};


export function DataQualityIndicator({
  qualityScore,
  size = 'md',
  displayMode = 'compact',
  className,
}: DataQualityIndicatorProps) {
  if (!qualityScore) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center text-gray-400', className, size === 'sm' ? 'text-xs' : 'text-sm')}>
              <Info className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
              Data Quality N/A
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Data quality score is not available for this item.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const { overall, completeness, accuracy, freshness } = qualityScore;
  const overallScoreColor = overall >= 80 ? 'text-green-700 bg-green-100 border-green-300' :
                            overall >= 50 ? 'text-yellow-700 bg-yellow-100 border-yellow-300' :
                            'text-red-700 bg-red-100 border-red-300';

  const overallIcon = overall >= 80 ? CheckCircle : overall >= 50 ? AlertTriangle : AlertTriangle; // Could use different icons

  const barHeightClass = size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2';
  const barColor = overall >= 80 ? 'bg-green-500' : overall >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  const renderCompact = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center p-1 rounded-full border', overallScoreColor, className, size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1')}>
            <overallIcon className={cn('mr-1 flex-shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
            <span className="font-medium">Quality: {overall}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-2">
          <p className="font-semibold mb-1">Data Quality Details:</p>
          <QualityAspect label="Overall" score={overall} icon={TrendingUp} />
          <QualityAspect label="Completeness" score={completeness} />
          {accuracy !== undefined && <QualityAspect label="Accuracy" score={accuracy} />}
          {freshness !== undefined && <QualityAspect label="Freshness" score={freshness} />}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderDetailed = () => (
     <Card className={cn("p-3", className)}>
        <CardHeader className="p-0 mb-2">
            <CardTitle className={cn("text-base flex items-center", overallScoreColor.split(' ')[0])}> {/* Use only text color for title */}
                <overallIcon className={cn('mr-2', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
                Data Quality: {overall}%
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-1">
            <QualityAspect label="Completeness" score={completeness} icon={CheckCircle} />
            {accuracy !== undefined && <QualityAspect label="Accuracy" score={accuracy} icon={CheckCircle} />}
            {freshness !== undefined && <QualityAspect label="Freshness" score={freshness} icon={TrendingUp} />}
        </CardContent>
     </Card>
  );

  const renderBar = () => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn('w-full', className)}>
                    <div className={cn('bg-gray-200 rounded-full overflow-hidden', barHeightClass)}>
                        <div
                            className={cn('h-full rounded-full transition-all duration-500 ease-out', barColor)}
                            style={{ width: `${overall}%` }}
                            aria-valuenow={overall}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            role="progressbar"
                            aria-label={`Data quality score: ${overall}%`}
                        />
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Overall Data Quality: {overall}%</p>
                {/* Optionally add more details here too */}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );


  switch(displayMode) {
    case 'detailed':
      return renderDetailed();
    case 'bar':
      return renderBar();
    case 'compact':
    default:
      return renderCompact();
  }
}

// Dummy Card components if not globally available or for local structure
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>
      {children}
    </div>
  );
const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
<div className={cn("flex flex-col space-y-1.5", className)} {...props}>
    {children}
</div>
);
const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
<h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
</h3>
);
const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
<div className={cn("", className)} {...props}> {/* Removed p-6 default for more flexibility */}
    {children}
</div>
);


export default DataQualityIndicator;
