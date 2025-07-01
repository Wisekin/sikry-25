import React from 'react';
import { Switch } from '@/src/components/ui/switch';
import { Label } from '@/src/components/ui/label';
import { ShieldCheck, LinkIcon } from 'lucide-react'; // Using ShieldCheck for "valid https"
import { useTranslation } from 'react-i18next';

interface WebsiteFilterProps {
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  className?: string;
}

export const WebsiteFilter = ({ isActive, onToggle, className }: WebsiteFilterProps) => {
  const { t } = useTranslation('searchPage'); // Assuming translations might be needed

  const handleToggle = () => {
    onToggle(!isActive);
  };

  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg border border-transparent hover:border-gray-200 transition-colors duration-150 ${className}`}>
      <ShieldCheck className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
      <Label 
        htmlFor="website-filter-switch" 
        className="font-medium text-sm text-gray-700 cursor-pointer select-none"
        onClick={handleToggle} // Allow clicking label to toggle
      >
        {t('websiteFilter.label', 'Only show companies with a valid website (HTTPS)')}
      </Label>
      <Switch
        id="website-filter-switch"
        checked={isActive}
        onCheckedChange={onToggle}
        aria-label={t('websiteFilter.ariaLabel', 'Filter companies by valid HTTPS website')}
      />
    </div>
  );
};
