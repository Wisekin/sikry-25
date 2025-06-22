import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { ExternalLinkIcon, CheckCircleIcon } from 'lucide-react';

// This type would ideally come from a shared types file, e.g., src/types/integration.ts
export interface WebsiteSuggestion {
  url: string;
  source?: string; // e.g., "Google Search", "Manual Input", "API"
  confidence?: number; // 0-100
  title?: string; // Page title, if available
  snippet?: string; // Short description or snippet from search result
}

interface DiscoveryResultsProps {
  suggestions: WebsiteSuggestion[];
  onSelectSuggestion: (suggestion: WebsiteSuggestion) => void;
  isLoading?: boolean;
  error?: string | null;
  companyName?: string; // For context
}

export function DiscoveryResults({
  suggestions,
  onSelectSuggestion,
  isLoading,
  error,
  companyName,
}: DiscoveryResultsProps) {

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Website Suggestions {companyName ? `for ${companyName}` : ''}</CardTitle>
          <CardDescription>Loading discovered websites...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Website Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading website suggestions: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Website Suggestions {companyName ? `for ${companyName}` : ''}</CardTitle>
          <CardDescription>No websites found automatically. You might need to provide one manually.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Suggestions {companyName ? `for ${companyName}` : ''}</CardTitle>
        <CardDescription>
          Select a website to proceed with scraping, or provide one manually if the correct site isn't listed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full h-auto p-3 border rounded-lg hover:shadow-md transition-shadow justify-start items-center text-left"
            onClick={() => onSelectSuggestion(suggestion)}
            aria-label={`Select website: ${suggestion.title || suggestion.url}`}
          >
            <div className="flex-grow space-y-1">
              <div className="flex items-center">
                {/* The link is still useful for users who want to open it directly */}
                <a
                  href={suggestion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium break-all"
                  onClick={(e) => e.stopPropagation()} // Prevent button click when only clicking the link
                  aria-label={`Open ${suggestion.url} in new tab`}
                >
                  {suggestion.title || suggestion.url}
                  <ExternalLinkIcon className="inline-block ml-1 h-3 w-3" />
                </a>
              </div>
              {suggestion.snippet && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 font-normal">{suggestion.snippet}</p>
              )}
              <div className="text-xs text-gray-400 mt-1 font-normal">
                {suggestion.source && <span>Source: {suggestion.source}</span>}
                {suggestion.confidence && (
                  <span className="ml-2">Confidence: {suggestion.confidence}%</span>
                )}
              </div>
            </div>
            {/* The button itself implies selection, but an icon can reinforce this */}
            <CheckCircleIcon className="h-5 w-5 text-green-500 ml-4 flex-shrink-0" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export default DiscoveryResults;
