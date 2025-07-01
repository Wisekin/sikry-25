import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';

interface ConfidenceIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  displayType?: 'bar' | 'text' | 'icon' | 'full';
  className?: string;
  tooltipTextKey?: string; // Changed to key for translation
}

export function ConfidenceIndicator({
  score,
  size = 'md',
  displayType = 'full',
  className,
  tooltipTextKey = "confidenceIndicator.tooltipText" // Default key
}: ConfidenceIndicatorProps) {
  const { t } = useTranslation('searchPage');
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  const getColorClasses = () => {
    if (normalizedScore >= 90) return { bar: 'bg-green-500', text: 'text-green-700 dark:text-green-400', iconRing: 'ring-green-500' };
    if (normalizedScore >= 75) return { bar: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', iconRing: 'ring-sky-500' };
    if (normalizedScore >= 50) return { bar: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', iconRing: 'ring-yellow-500' };
    return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', iconRing: 'ring-red-500' };
  };

  const colorClasses = getColorClasses();

  const barHeightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-2.5';
  const textSizeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  const renderBar = () => (
    <div className={cn('w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden', barHeightClass)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', colorClasses.bar)}
        style={{ width: `${normalizedScore}%` }}
      />
    </div>
  );

  const renderText = () => (
    <span className={cn('font-semibold', textSizeClass, colorClasses.text)}>
      {normalizedScore}%
    </span>
  );

  const renderIcon = () => (
    <div className={cn('rounded-full ring-1 ring-offset-1 dark:ring-offset-slate-900', iconSizeClass, colorClasses.iconRing, colorClasses.bar)} />
  );

  let content;

  switch (displayType) {
    case 'bar':
      content = renderBar();
      break;
    case 'text':
      content = renderText();
      break;
    case 'icon':
      content = renderIcon();
      break;
    case 'full':
    default:
      content = (
        <div className="flex items-center space-x-2 w-full">
          {renderText()}
          {renderBar()}
        </div>
      );
      break;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center', className)}>
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('confidenceIndicator.tooltipContent', { text: t(tooltipTextKey), score: normalizedScore })}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ConfidenceIndicator;
