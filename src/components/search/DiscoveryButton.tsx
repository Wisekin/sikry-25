import React from 'react';
import { Button, ButtonProps } from '@/src/components/ui/button';
import { SearchIcon } from 'lucide-react'; // Or any relevant icon

interface DiscoveryButtonProps extends ButtonProps {
  onClick: () => void;
  loading?: boolean;
  companyName?: string; // Optional, for more specific button text
}

export function DiscoveryButton({ onClick, loading, companyName, children, ...props }: DiscoveryButtonProps) {
  return (
    <Button onClick={onClick} disabled={loading} {...props}>
      <SearchIcon className="mr-2 h-4 w-4" />
      {children || (companyName ? `Discover for ${companyName}` : 'Discover Website')}
      {loading && <span className="ml-2">...</span>}
    </Button>
  );
}

export default DiscoveryButton;
