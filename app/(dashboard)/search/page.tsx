'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';

import { useSearchStore } from '@/stores/searchStore';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Slider } from '@/src/components/ui/slider';
import { 
  Filter, Download, Grid, List, Loader2, X, ChevronDown, Globe, Linkedin, Database,
  Briefcase, MapPin, Users, Star, Mail, Phone, RefreshCw, ExternalLink, SlidersHorizontal, Frown,
} from 'lucide-react';

import { MapView } from '@/src/components/map/MapView';
import { ResultsGrid } from '@/src/components/search/ResultsGrid';

// Type for company data
interface Company {
  id: string;
  name: string;
  location?: string;
  location_text?: string;
  website?: string;
  employees?: number;
  industry?: string;
  confidenceScore?: number;
  [key: string]: any; // Allow additional properties
}

const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Education'];
const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'];

// Reusable debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function SearchPageContent() {
  const {
    query,
    setQuery,
    results,
    status,
    error,
    pagination,
    fetchSearchResults,
    goToNextPage,
    viewMode,
    setViewMode,
  } = useSearchStore();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const debouncedQuery = useDebounce(query, 500);
  
  const [filters, setFilters] = useState({
    industry: 'All Industries',
    location: "",
    employeeCount: "All Sizes",
    confidenceScore: 0,
    hasEmail: false,
    hasPhone: false,
  });

  const handleClearFilters = () => {
    setFilters({
      industry: 'All Industries',
      location: "",
      employeeCount: "All Sizes",
      confidenceScore: 70,
      hasEmail: false,
      hasPhone: false,
    });
  };

  // Apply filters to results
  const filteredCompanies = useMemo(() => {
    return results.filter(company => {
      // Industry
      if (filters.industry !== "All Industries" && company.industry !== filters.industry) return false;
      // Location (use location_text if present, fallback to location)
      const locationValue = (company.location_text || company.location || '').toLowerCase();
      if (filters.location && !locationValue.includes(filters.location.toLowerCase())) return false;
      // Employee Count (use employee_count string)
      if (filters.employeeCount !== "All Sizes" && company.employee_count !== filters.employeeCount) return false;
      // Confidence Score (ensure number)
      const score = typeof company.confidenceScore === 'number' ? company.confidenceScore : 0;
      if (filters.confidenceScore && score < filters.confidenceScore) return false;
      // Has Email
      if (filters.hasEmail && (!company.extractedData || !Array.isArray(company.extractedData.emails) || company.extractedData.emails.length === 0)) return false;
      // Has Phone
      if (filters.hasPhone && (!company.extractedData || !Array.isArray(company.extractedData.phones) || company.extractedData.phones.length === 0)) return false;
      return true;
    });
  }, [results, filters]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setQuery(debouncedQuery.trim());
      fetchSearchResults({ forceRefresh: true });
    }
  }, [debouncedQuery, fetchSearchResults, setQuery]);

  const totalPages = pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : 0;
  const isLoading = status === 'loading' && results.length === 0;
  const isFetchingMore = status === 'fetching' && results.length > 0;

  return (
    <div className="space-y-2 max-w-full bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">
            Company Search
          </h1>
          <p className="text-gray-500 mt-1">
            {isLoading && 'Searching...'}
            {!isLoading && !error && filteredCompanies.length > 0 && 
              `${filteredCompanies.length} results found`}
          </p>
          {status === 'success' && filteredCompanies.length === 0 && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
              No companies found matching your search criteria
            </div>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              Error: {error}
            </div>
          )}
        </div>
        {/* Export button removed, now in SecondaryMenuBar */}
      </div>
      
      {/* Search and Source Filters are now in SecondaryMenuBar */}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Advanced Filters Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-8 h-fit">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1B1F3B]" /> 
                Advanced Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {/* Industry */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-700"><Briefcase className="w-4 h-4 mr-2" /> Industry</h3>
                <Select value={filters.industry} onValueChange={value => setFilters(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Industries">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-700"><MapPin className="w-4 h-4 mr-2" /> Location</h3>
                <Input 
                  placeholder="e.g., Geneva, Switzerland" 
                  value={filters.location} 
                  onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))} 
                  className="bg-gray-50 border-gray-200" 
                />
              </div>
              
              {/* Company Size */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-700"><Users className="w-4 h-4 mr-2" /> Company Size</h3>
                <Select value={filters.employeeCount} onValueChange={value => setFilters(prev => ({ ...prev, employeeCount: value }))}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Sizes">All Sizes</SelectItem>
                    {companySizes.map(size => (
                      <SelectItem key={size} value={size}>{size} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Confidence Score */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-700"><Star className="w-4 h-4 mr-2" /> Minimum Confidence</h3>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[filters.confidenceScore]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([val]) => setFilters(prev => ({ ...prev, confidenceScore: val }))}
                  />
                  <span className="px-3 py-1 text-sm font-semibold rounded-md bg-gray-100 text-[#1B1F3B] w-20 text-center">
                    {filters.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Email/Phone Filters as Toggle Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, hasEmail: !prev.hasEmail }))}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 transition-colors duration-150 ${filters.hasEmail ? 'bg-[var(--scrollbar-thumb)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Mail className="w-4 h-4 mr-1 inline" /> Has Email
                </button>
                <button
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, hasPhone: !prev.hasPhone }))}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 transition-colors duration-150 ${filters.hasPhone ? 'bg-[var(--scrollbar-thumb)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Phone className="w-4 h-4 mr-1 inline" /> Has Phone
                </button>
              </div>
              
              <Button variant="outline" onClick={handleClearFilters} className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-[#1B1F3B]">
                <RefreshCw className="w-4 h-4 mr-2" /> Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9">
          {/* View mode and sort controls are now in SecondaryMenuBar */}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#1B1F3B] mb-4" />
              <h2 className="text-xl font-semibold text-[#1B1F3B]">Searching The Web...</h2>
              <p className="text-muted-foreground">Please wait while we gather and enrich the results.</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' && <ResultsGrid companies={filteredCompanies} />}
              {viewMode === 'list' && <ResultsGrid companies={filteredCompanies} layout="list" />}
              {viewMode === 'map' && (
                <div className="h-[600px] w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  {isClient ? (
                    filteredCompanies.length > 0 ? (
                      <MapView 
                        companies={filteredCompanies.map(company => ({
                          ...company,
                          location: company.location_text || company.location || 'Unknown location',
                          id: company.id || '',
                          name: company.name || 'Unnamed Company',
                          latitude: company.latitude,
                          longitude: company.longitude
                        }))}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                          <MapPin className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-[#1B1F3B] mb-2">
                          {query ? 'No results to show on map' : 'Enter a search to see map results'}
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                          {query 
                            ? 'Try adjusting your search or filters.'
                            : 'Enter a search query to find companies.'}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      <p className="text-gray-500 ml-4">Loading Map...</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!isLoading && filteredCompanies.length === 0 && status === 'success' && (
            <div className="text-center py-24 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-[#1B1F3B] mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms for a better match.</p>
              {error && <p className="text-red-500">{error}</p>}
              <Button variant="outline" onClick={handleClearFilters}>Clear All Filters</Button>
            </div>
          )}

          {/* Pagination */}
          {filteredCompanies.length > 0 && pagination && pagination.currentPage < totalPages && (
            <div className="mt-8 text-center">
              <Button 
                onClick={goToNextPage} 
                disabled={isFetchingMore}
                className="min-w-[200px]"
              >
                {isFetchingMore ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                ) : 'Load More Results'}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="bg-gray-50/50">
      <div className="container mx-auto p-6 md:p-8">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B1F3B]" />
          </div>
        }>
          <SearchPageContent />
        </Suspense>
      </div>
    </div>
  );
}