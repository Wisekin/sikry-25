import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrapedData } from '@/stores/searchStore'; // Assuming ScrapedData type is exported from store or a types file
import { Mail, Phone, Building, LinkIcon, Users, Globe } from 'lucide-react'; // Example icons

interface EnrichedDataDisplayProps {
  originalData?: Partial<ScrapedData>; // Optional: to show a diff or comparison
  enrichedData: ScrapedData | null | undefined;
  isLoading?: boolean;
  error?: string | null;
}

const DataRow: React.FC<{ icon: React.ElementType; label: string; value?: string | string[] | null; isLink?: boolean; linkPrefix?: string }> = ({ icon: Icon, label, value, isLink, linkPrefix }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return null; // Don't render if value is not present
  }

  const renderValue = (val: string) => {
    if (isLink) {
      return <a href={`${linkPrefix || ''}${val}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{val}</a>;
    }
    return <span className="break-all">{val}</span>;
  };

  return (
    <div className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
      <Icon className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {Array.isArray(value) ? (
          value.map((item, index) => (
            <p key={index} className="text-sm text-gray-900">{renderValue(item)}</p>
          ))
        ) : (
          <p className="text-sm text-gray-900">{renderValue(value)}</p>
        )}
      </div>
    </div>
  );
};


export function EnrichedDataDisplay({ enrichedData, isLoading, error }: EnrichedDataDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enriched Data</CardTitle>
          <CardDescription>Loading enriched information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enriched Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading enriched data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!enrichedData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enriched Data</CardTitle>
          <CardDescription>No enriched data available for this company yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Try initiating website discovery and scraping.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enriched Data</CardTitle>
        <CardDescription>
          Information gathered from website scraping and other sources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <DataRow icon={Building} label="Company Name" value={enrichedData.companyName} />
          <DataRow icon={Globe} label="Website" value={enrichedData.website} isLink linkPrefix="http://" />
          <DataRow icon={Mail} label="Emails" value={enrichedData.emails} isLink linkPrefix="mailto:" />
          <DataRow icon={Phone} label="Phone Numbers" value={enrichedData.phones} />
          <DataRow icon={Building} label="Address" value={enrichedData.address} />
          {enrichedData.socialMedia && Object.entries(enrichedData.socialMedia).map(([platform, link]) => (
            <DataRow
              key={platform}
              icon={LinkIcon}
              label={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Profile`}
              value={link}
              isLink
            />
          ))}
          {/* Add more fields as they become available in ScrapedData */}
        </div>
      </CardContent>
    </Card>
  );
}

export default EnrichedDataDisplay;
