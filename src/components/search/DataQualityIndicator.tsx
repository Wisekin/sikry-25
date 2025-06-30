import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react';

export interface DataQualityScore {
  completeness: number;
  accuracy?: number;
  freshness?: number;
  overall: number;
}

interface DataQualityIndicatorProps {
  qualityScore?: DataQualityScore | null;
  size?: 'sm' | 'md' | 'lg';
  displayMode?: 'compact' | 'detailed' | 'bar';
  className?: string;
}

const QualityAspect: React.FC<{labelKey: string, score: number, icon?: React.ElementType}> = ({ labelKey, score, icon: Icon }) => {
  const { t } = useTranslation('searchPage');
  const scoreColor = score >= 80 ? 'text-green-600 dark:text-green-400' : score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  return (
    <div className="flex items-center text-xs">
      {Icon && <Icon className={cn("w-3.5 h-3.5 mr-1.5", scoreColor)} />}
      <span className="text-gray-600 dark:text-slate-400">{t(labelKey)}:</span>
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
  const { t } = useTranslation('searchPage');

  if (!qualityScore) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center text-gray-400 dark:text-slate-500', className, size === 'sm' ? 'text-xs' : 'text-sm')}>
              <Info className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
              {t('dataQualityIndicator.textNotAvailable')}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('dataQualityIndicator.tooltipNotAvailable')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const { overall, completeness, accuracy, freshness } = qualityScore;
  const overallScoreColorClasses = overall >= 80 ? 'text-green-700 bg-green-100 border-green-300 dark:text-green-300 dark:bg-green-900/50 dark:border-green-700' :
                            overall >= 50 ? 'text-yellow-700 bg-yellow-100 border-yellow-300 dark:text-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700' :
                            'text-red-700 bg-red-100 border-red-300 dark:text-red-300 dark:bg-red-900/50 dark:border-red-700';
  
  const overallTextColor = overall >= 80 ? 'dark:text-green-400' : overall >= 50 ? 'dark:text-yellow-400' : 'dark:text-red-400';


  const overallIcon = overall >= 80 ? CheckCircle : overall >= 50 ? AlertTriangle : AlertTriangle;

  const barHeightClass = size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2';
  const barColor = overall >= 80 ? 'bg-green-500' : overall >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  const renderCompact = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center p-1 rounded-full border', overallScoreColorClasses, className, size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1')}>
            {React.createElement(overallIcon, { className: cn('mr-1 flex-shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4') })}
            <span className="font-medium">{t('dataQualityIndicator.cardTitle', { overall: overall })}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-2">
          <p className="font-semibold mb-1">{t('dataQualityIndicator.tooltipDetailsTitle')}</p>
          <QualityAspect labelKey="dataQualityIndicator.labelOverall" score={overall} icon={TrendingUp} />
          <QualityAspect labelKey="dataQualityIndicator.labelCompleteness" score={completeness} />
          {accuracy !== undefined && <QualityAspect labelKey="dataQualityIndicator.labelAccuracy" score={accuracy} />}
          {freshness !== undefined && <QualityAspect labelKey="dataQualityIndicator.labelFreshness" score={freshness} />}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderDetailed = () => (
     <Card className={cn("p-3", className)}>
        <CardHeader className="p-0 mb-2">
            <CardTitle className={cn("text-base flex items-center", overallScoreColorClasses.split(' ')[0], overallTextColor)}>
                {React.createElement(overallIcon, { className: cn('mr-2', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5') })}
                {t('dataQualityIndicator.cardTitle', { overall: overall })}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-1">
            <QualityAspect labelKey="dataQualityIndicator.labelCompleteness" score={completeness} icon={CheckCircle} />
            {accuracy !== undefined && <QualityAspect labelKey="dataQualityIndicator.labelAccuracy" score={accuracy} icon={CheckCircle} />}
            {freshness !== undefined && <QualityAspect labelKey="dataQualityIndicator.labelFreshness" score={freshness} icon={TrendingUp} />}
        </CardContent>
     </Card>
  );

  const renderBar = () => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn('w-full', className)}>
                    <div className={cn('bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden', barHeightClass)}>
                        <div
                            className={cn('h-full rounded-full transition-all duration-500 ease-out', barColor)}
                            style={{ width: `${overall}%` }}
                            aria-valuenow={overall}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            role="progressbar"
                            aria-label={t('dataQualityIndicator.progressBarLabel', { overall: overall })}
                        />
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{t('dataQualityIndicator.tooltipDetailsTitle')} {t('dataQualityIndicator.labelOverall')}: {overall}%</p>
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

// Assuming Card components are globally available from ui/card. If not, these local stubs would be used.
// These local stubs do not need translation as they are structural.
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm dark:border-slate-700 dark:bg-slate-900", className)} {...props}>
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
<div className={cn("", className)} {...props}>
    {children}
</div>
);

export default DataQualityIndicator;
