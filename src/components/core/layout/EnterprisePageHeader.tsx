import React from 'react';

interface EnterprisePageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // For breadcrumbs or action buttons
}

const EnterprisePageHeader: React.FC<EnterprisePageHeaderProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-6 md:p-8 mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B1F3B]">{title}</h1>
      {subtitle && <p className="text-sm md:text-base text-gray-500 mt-1">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EnterprisePageHeader;
