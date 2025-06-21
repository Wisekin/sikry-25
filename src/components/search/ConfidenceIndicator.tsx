import React from 'react';
import { cn } from '@/lib/utils'; // For utility class merging
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Assuming tooltip exists

interface ConfidenceIndicatorProps {
  score: number; // Score from 0 to 100
  size?: 'sm' | 'md' | 'lg';
  displayType?: 'bar' | 'text' | 'icon' | 'full'; // 'full' combines text and bar
  className?: string;
  tooltipText?: string; // Optional text for tooltip
}

export function ConfidenceIndicator({
  score,
  size = 'md',
  displayType = 'full',
  className,
  tooltipText = "Confidence Score"
}: ConfidenceIndicatorProps) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score))); // Ensure score is 0-100 integer

  const getColorClasses = () => {
    if (normalizedScore >= 90) return { bar: 'bg-green-500', text: 'text-green-600', iconRing: 'ring-green-500' };
    if (normalizedScore >= 75) return { bar: 'bg-sky-500', text: 'text-sky-600', iconRing: 'ring-sky-500' };
    if (normalizedScore >= 50) return { bar: 'bg-yellow-500', text: 'text-yellow-600', iconRing: 'ring-yellow-500' };
    return { bar: 'bg-red-500', text: 'text-red-600', iconRing: 'ring-red-500' };
  };

  const colorClasses = getColorClasses();

  const barHeightClass = size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-2.5';
  const textSizeClass = size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
  const iconSizeClass = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';


  const renderBar = () => (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', barHeightClass)}>
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

  const renderIcon = () => ( // A simple dot icon for now
    <div className={cn('rounded-full ring-1 ring-offset-1', iconSizeClass, colorClasses.iconRing, colorClasses.bar)} />
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
          <p>{tooltipText}: {normalizedScore}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ConfidenceIndicator;
