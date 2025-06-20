"use client"

import { useState, useEffect, Suspense, forwardRef } from "react"
import { createClient } from '@/src/utils/supabase/client'
import { useSearchParams } from "next/navigation"
import { useTranslation } from 'react-i18next'
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Slider } from "@/src/components/ui/slider"
import {
  Filter, Download, Grid, Map as MapIcon, List, Loader2, X, ChevronDown, Globe, Linkedin, Database,
  Building2, Users, MapPin, BarChart3, Mail, Phone, Clock, RefreshCw, Star, ExternalLink, Briefcase, Tag
} from "lucide-react"

// Custom hook to debounce input
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

// --- MOCK DATA & TYPES ---
interface Company {
  id: string;
  name: string;
  domain: string;
  location: string;
  industry: string;
  employees: string;
  description: string;
  logo?: string;
  confidenceScore: number;
  extractedData: {
    emails: string[];
    phones: string[];
    technologies: string[];
  };
  lastScraped: string;
}

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Geneva Watch Group",
    domain: "genevawatchgroup.com",
    logo: `https://logo.clearbit.com/geneva.com`,
    location: "Geneva, Switzerland",
    industry: "Luxury Goods & Jewelry",
    employees: "50-100",
    description: "Crafting exquisite timepieces with Swiss precision and timeless design since 1974.",
    confidenceScore: 95,
    extractedData: {
      emails: ["contact@genevawg.com", "sales@genevawg.com"],
      phones: ["+41 22 345 6789"],
      technologies: ["Salesforce", "SAP", "Adobe Experience Manager"],
    },
    lastScraped: "2024-02-10T14:30:00Z",
  },
  {
    id: "2",
    name: "Alpine Marketing Group",
    domain: "alpinemarketing.com",
    logo: `https://logo.clearbit.com/alpinemarketing.com`,
    location: "Zurich, Switzerland",
    industry: "Marketing & Advertising",
    employees: "10-25",
    description: "Full-service marketing agency helping B2B companies scale their digital presence.",
    confidenceScore: 88,
    extractedData: {
      emails: ["info@alpinemarketing.com"],
      phones: ["+41 44 987 6543"],
      technologies: ["HubSpot", "Google Analytics", "WordPress"],
    },
    lastScraped: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    name: "SwissFintech Innovations",
    domain: "swissfintech.io",
    logo: `https://logo.clearbit.com/swissfintech.io`,
    location: "Basel, Switzerland",
    industry: "Financial Technology",
    employees: "50-100",
    description: "Pioneering blockchain and AI solutions for the financial services industry.",
    confidenceScore: 92,
    extractedData: {
      emails: ["contact@swissfintech.io"],
      phones: ["+41 61 555 0123"],
      technologies: ["Blockchain", "AI/ML", "Python", "Kubernetes"],
    },
    lastScraped: "2024-01-15T11:45:00Z",
  },
    {
    id: "4",
    name: "Matterhorn Data Analytics",
    domain: "matterhorn.ai",
    logo: `https://logo.clearbit.com/mattermost.com`,
    location: "Bern, Switzerland",
    industry: "Data & Analytics",
    employees: "25-50",
    description: "Unlocking business potential through advanced data science and machine learning models.",
    confidenceScore: 78,
    extractedData: {
      emails: ["hello@matterhorn.ai"],
      phones: [],
      technologies: ["Tableau", "Snowflake", "dbt", "Python"],
    },
    lastScraped: "2024-03-01T10:00:00Z",
  }
];


// --- REUSABLE COMPONENTS ---

// --- REUSABLE COMPONENTS: TYPES ---
interface CompanyCardProps {
  company: Company;
  layout?: 'grid' | 'list';
}

interface ResultsGridProps {
  companies: Company[];
  layout?: 'grid' | 'list';
}

// New Company Card Component
const CompanyCard = ({ company, layout = 'grid' }: CompanyCardProps) => {
  const getConfidenceColor = (score: number) => {
    if (score > 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (score > 80) return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    if (score > 70) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  };

  const confidenceStyle = getConfidenceColor(company.confidenceScore);
  const cardClasses = `group bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl hover:bg-[#2A3050]`;

  if (layout === 'list') {
      return (
          <div className={`${cardClasses} p-4 flex items-center gap-4`}>
              <img src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`} alt={`${company.name} logo`} className="w-12 h-12 rounded-md object-contain flex-shrink-0" />
              <div className="flex-grow grid grid-cols-4 gap-4 items-center">
                  <div>
                      <h3 className="font-bold text-base text-[#1B1F3B] group-hover:text-white">{company.name}</h3>
                      <a href={`http://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 group-hover:text-gray-300 hover:underline">{company.domain}</a>
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400 group-hover:text-sky-300" /> {company.industry}</div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 group-hover:text-sky-300" /> {company.location}</div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400 group-hover:text-sky-300" /> {company.employees} Employees</div>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} group-hover:bg-opacity-20 group-hover:text-white group-hover:border-white/50`}>
                  {company.confidenceScore}%
              </div>
          </div>
      )
  }

  return (
    <div className={`${cardClasses} flex flex-col`}>
      <CardHeader className="p-4 border-b border-gray-100 group-hover:border-gray-600">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`} alt={`${company.name} logo`} className="w-12 h-12 rounded-md object-contain" />
            <div>
              <h3 className="font-bold text-base text-[#1B1F3B] group-hover:text-white">{company.name}</h3>
              <a href={`http://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 group-hover:text-gray-300 hover:underline flex items-center gap-1">
                {company.domain} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} group-hover:bg-opacity-20 group-hover:text-white group-hover:border-white/50`}>
            {company.confidenceScore}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-grow">
        <p className="text-sm text-gray-600 group-hover:text-gray-200">{company.description}</p>
        <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400 group-hover:text-sky-300"/> {company.industry}</div>
        <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 group-hover:text-sky-300"/> {company.location}</div>
        <div className="text-sm text-gray-600 group-hover:text-gray-200 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400 group-hover:text-sky-300"/> {company.employees} Employees</div>
      </CardContent>
      <div className="p-4 border-t border-gray-100 group-hover:border-gray-600">
        <h4 className="text-xs font-semibold text-gray-500 group-hover:text-gray-300 mb-2">EXTRACTED DATA</h4>
        <div className="flex flex-wrap gap-2">
            {company.extractedData.emails.length > 0 && <div className="flex items-center gap-1.5 text-xs bg-gray-100 group-hover:bg-gray-700 text-gray-700 group-hover:text-gray-200 rounded-full px-2 py-1"><Mail className="w-3 h-3"/> {company.extractedData.emails.length} Email(s)</div>}
            {company.extractedData.phones.length > 0 && <div className="flex items-center gap-1.5 text-xs bg-gray-100 group-hover:bg-gray-700 text-gray-700 group-hover:text-gray-200 rounded-full px-2 py-1"><Phone className="w-3 h-3"/> {company.extractedData.phones.length} Phone(s)</div>}
            {company.extractedData.technologies.slice(0, 2).map((tech, index) => (
                <div key={`${tech}-${index}`} className="flex items-center gap-1.5 text-xs bg-gray-100 group-hover:bg-gray-700 text-gray-700 group-hover:text-gray-200 rounded-full px-2 py-1"><Tag className="w-3 h-3"/> {tech}</div>
            ))}
        </div>
      </div>
    </div>
  );
};


const ResultsGrid = ({ companies, layout = 'grid' }: ResultsGridProps) => {
    if (layout === 'list') {
        return (
            <div className="space-y-3">
                {companies.map(company => (
                    <CompanyCard key={company.id} company={company} layout="list" />
                ))}
            </div>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {companies.map(company => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
    );
};


// Main Search Page Content
function SearchContent() {
  const { t } = useTranslation(['searchPage', 'commsPage']);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 500);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedSources, setSelectedSources] = useState<string[]>(["google", "linkedin"]);
  const [filters, setFilters] = useState({
    industry: t('filters.allIndustries'),
    location: "",
    employeeCount: "All Sizes",
    confidenceScore: 70,
    hasEmail: false,
    hasPhone: false,
  });

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source) 
        : [...prev, source]
    );
  };

  const handleClearFilters = () => {
    setFilters({
      industry: t('filters.allIndustries'),
      location: "",
      employeeCount: "All Sizes",
      confidenceScore: 70,
      hasEmail: false,
      hasPhone: false,
    });
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!debouncedQuery) {
        setCompanies([]);
        setNoResults(false);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setNoResults(false);

      try {
        const params = new URLSearchParams();
        params.set('q', debouncedQuery);
        params.set('scope', 'companies');
        if (user) {
          params.set('user', user.id);
        }
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Failed to fetch results' }));
            throw new Error(errorData.message || 'Failed to fetch results');
        }
        const data = await res.json();
        
        const results = data.data || [];
        if (results.length === 0) {
          setNoResults(true);
        }

        setCompanies(results.map((item: any, idx: number) => ({
          id: item.id || `api-${idx}`,
          name: item.name || '',
          domain: item.domain || item.url || '',
          logo: item.logo || '',
          location: item.location || '',
          industry: item.industry || '',
          employees: item.size || '',
          description: item.description || '',
          confidenceScore: item.confidence || 75,
          extractedData: {
            emails: item.emails || [],
            phones: item.phones || [],
            technologies: item.technologies || [],
          },
          lastScraped: item.lastScraped || '',
        })));
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCompanies();
    }
  }, [debouncedQuery, user]);

  const filteredCompanies = companies.filter(company => {
    if (filters.industry !== "All Industries" && company.industry !== filters.industry) return false;
    if (filters.location && !company.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.employeeCount !== "All Sizes" && company.employees !== filters.employeeCount) return false;
    if (filters.confidenceScore && company.confidenceScore < filters.confidenceScore) return false;
    if (filters.hasEmail && company.extractedData.emails.length === 0) return false;
    if (filters.hasPhone && company.extractedData.phones.length === 0) return false;
    return true;
  });


  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1B1F3B]">
            {t('companySearch.title', { ns: 'searchPage' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {loading && t('searching', { ns: 'searchPage' })}
            {!loading && !error && !noResults && `${filteredCompanies.length} ${t('results.found', { ns: 'searchPage' })}`}
          </p>
          {noResults && !loading && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
              {t('noResults', { ns: 'commsPage' })}
            </div>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {t('error', { ns: 'searchPage' })} {error}
            </div>
          )}
        </div>
        <Button size="lg" className="bg-[#1B1F3B] text-white hover:bg-[#2A3050] flex items-center gap-2">
          <Download className="w-5 h-5" /> {t('exportButton', { ns: 'searchPage' })}
        </Button>
      </div>
      
      {/* Search and Source Filters */}
      <Card className="bg-white p-4 shadow-sm">
        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2">
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={t('searchPlaceholder', { ns: 'searchPage' })} 
              className="p-6 text-base border-gray-300 focus:ring-2 focus:ring-[#2A3050]" 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {t('sources.title', { ns: 'searchPage' })}
            </span>
            {["google", "linkedin", "crunchbase"].map(source => (
              <button key={source} onClick={() => toggleSource(source)} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${selectedSources.includes(source) ? 'bg-[#1B1F3B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {source === "google" && <Globe className="w-4 h-4" />}
                {source === "linkedin" && <Linkedin className="w-4 h-4" />}
                {source === "crunchbase" && <Database className="w-4 h-4" />}
                <span className="capitalize">{source}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Advanced Filters Sidebar */}
        <aside className="lg:col-span-3 lg:sticky lg:top-8 h-fit">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#1B1F3B]" /> 
                {t('advancedFilters.title', { ns: 'searchPage' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {/* Industry */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-700"><Briefcase className="w-4 h-4 mr-2" /> {t('industry.title', 'Secteur d\'activité')}</h3>
                <Select value={filters.industry} onValueChange={value => setFilters(prev => ({ ...prev, industry: value }))}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200"><SelectValue placeholder={t('industry.select', 'Sélectionner un secteur')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Industries">{t('industry.all', 'Tous les secteurs')}</SelectItem>
                    <SelectItem value="Luxury Goods & Jewelry">{t('industry.luxuryGoods', 'Articles de luxe & Joaillerie')}</SelectItem>
                    <SelectItem value="Marketing & Advertising">{t('industry.marketing', 'Marketing & Publicité')}</SelectItem>
                    <SelectItem value="Financial Technology">{t('industry.fintech', 'Technologie Financière')}</SelectItem>
                    <SelectItem value="Data & Analytics">{t('industry.dataAnalytics', 'Données & Analyse')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-700"><MapPin className="w-4 h-4 mr-2" /> {t('location.title', 'Location')}</h3>
                <Input placeholder={t('location.placeholder', 'e.g., Geneva, Switzerland')} value={filters.location} onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))} className="bg-gray-50 border-gray-200" />
              </div>
              {/* Confidence Score */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-700"><Star className="w-4 h-4 mr-2" /> {t('confidenceScore.title', 'Minimum Confidence')}</h3>
                <div className="flex items-center gap-4">
                  <Slider value={[filters.confidenceScore]} min={0} max={100} step={1} onValueChange={value => setFilters(prev => ({ ...prev, confidenceScore: value[0] }))} />
                  <span className="px-3 py-1 text-sm font-semibold rounded-md bg-gray-100 text-[#1B1F3B] w-20 text-center">{filters.confidenceScore}%</span>
                </div>
              </div>
              <Button variant="outline" onClick={handleClearFilters} className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-[#1B1F3B]">
                <RefreshCw className="w-4 h-4 mr-2" /> {t('clearFilters', 'Clear All Filters')}
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <Tabs value={viewMode} onValueChange={value => setViewMode(value as "grid" | "list" | "map")}>
              <TabsList className="bg-white shadow-sm border">
                <TabsTrigger value="grid"><Grid className="w-4 h-4 mr-1" /> {t('gridView')}</TabsTrigger>
                <TabsTrigger value="list"><List className="w-4 h-4 mr-1" /> {t('listView')}</TabsTrigger>
                <TabsTrigger value="map"><MapIcon className="w-4 h-4 mr-1" /> {t('mapView')}</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select>
              <SelectTrigger className="w-full md:w-[200px] bg-white shadow-sm border"><SelectValue placeholder={t('sortPlaceholder')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t('sortRelevance')}</SelectItem>
                <SelectItem value="confidence">{t('sortConfidence')}</SelectItem>
                <SelectItem value="newest">{t('sortNewest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#1B1F3B] mb-4" />
              <h2 className="text-xl font-semibold text-[#1B1F3B]">{t('loading', 'Searching The Web...')}</h2>
              <p className="text-muted-foreground">{t('loadingDescription', 'Please wait while we gather and enrich the results.')}</p>
            </div>
          ) : (
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="grid"><ResultsGrid companies={filteredCompanies} /></TabsContent>
              <TabsContent value="list"><ResultsGrid companies={filteredCompanies} layout="list" /></TabsContent>
              <TabsContent value="map">{/* MapView would go here */} <div className="text-center p-10 bg-white rounded-xl shadow-sm">{t('mapPlaceholder', 'Map View Placeholder')}</div> </TabsContent>
            </Tabs>
          )}

          {!loading && filteredCompanies.length === 0 && (
            <div className="text-center py-24 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-[#1B1F3B] mb-2">{t('noResults.title', 'No Results Found')}</h3>
              <p className="text-muted-foreground mb-4">{t('noResults.suggestion', 'Try adjusting your filters or search terms for a better match.')}</p>
              {error && <p className="text-red-500">{error}</p>}
              <Button variant="outline" onClick={handleClearFilters}>{t('clearFilters', 'Clear All Filters')}</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="bg-gray-50/50">
        <div className="container mx-auto p-6 md:p-8">
            <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1B1F3B]" />
                </div>
            }
            >
            <SearchContent />
            </Suspense>
        </div>
    </div>
  )
}