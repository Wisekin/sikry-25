import React, { useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Card, CardHeader, CardContent, CardFooter } from "@/src/components/ui/card";
import { Company } from "@/src/lib/types";
import { Users, MapPin, Mail, Phone, ExternalLink, Briefcase, Tag, SearchIcon, AlertTriangleIcon, CheckCircle2Icon, SparklesIcon, LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon, LinkIcon as LucideLinkIcon } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { DiscoveryButton } from './DiscoveryButton';
import { ScrapingProgress } from './ScrapingProgress';
import { useSearchStore, CompanyDiscoveryState, ScrapedData } from '@/stores/searchStore';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useToast } from '@/hooks/use-toast'; // Added useToast

// Patch: extend Company type to include employee_count for linter
// Also, ensure 'id' is available as per src/lib/types.ts for discovery state mapping.
type CompanyWithEmployeeCount = Company & { employee_count?: string; id: string };


const socialIconMap: Record<string, React.ElementType> = {
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  default: LucideLinkIcon,
};

// Utility to truncate long domains for display
function truncateDomain(domain: string, maxLength = 24) {
  if (!domain) return '';
  return domain.length > maxLength ? domain.slice(0, maxLength - 3) + '...' : domain;
}

interface CompanyCardProps {
  company: CompanyWithEmployeeCount; // Ensured id is part of this type via definition
  layout?: 'grid' | 'list';
}

export const CompanyCard = ({ company, layout = 'grid' }: CompanyCardProps) => {
  const { t } = useTranslation('searchPage');
  const { toast } = useToast(); // Initialize toast

  const initiateWebsiteDiscovery = useSearchStore(state => state.initiateWebsiteDiscovery);
  const discoveryStates = useSearchStore(state => state.discoveryStates);
  const preferences = useSearchStore(state => state.preferences);
  const setDiscoveryStateForCompany = useSearchStore(state => state.setDiscoveryStateForCompany);

  const companyDiscoveryState: CompanyDiscoveryState | undefined = discoveryStates[company.id];
  const prevStatusRef = useRef<CompanyDiscoveryState['status'] | undefined>(undefined);

  useEffect(() => {
    if (companyDiscoveryState && companyDiscoveryState.status === 'error' && prevStatusRef.current !== 'error' && companyDiscoveryState.error) {
      toast({
        title: `Discovery Error: ${company.name}`,
        description: companyDiscoveryState.error,
        variant: "destructive",
        duration: 7000, // Keep error toast a bit longer
      });
    }
    prevStatusRef.current = companyDiscoveryState?.status;
  }, [companyDiscoveryState, company.name, toast]);


  const scrapedData: ScrapedData | undefined = companyDiscoveryState?.scrapedData;
  const isEnriched = companyDiscoveryState?.status === 'completed' && !!scrapedData;

  const handleDiscoverClick = () => {
    // If retrying from an error state, good to reset the specific error message before new attempt
    if (companyDiscoveryState?.status === 'error') {
        setDiscoveryStateForCompany(company.id, { ...companyDiscoveryState, status: 'idle', error: undefined, progress: 0 });
        // Short delay to allow state to update before initiating, preventing potential race if not using await properly in store
        setTimeout(() => {
            if (company.id && company.name) {
                initiateWebsiteDiscovery(company.id, company.name, company.domain);
            }
        }, 50);
    } else if (company.id && company.name) {
      initiateWebsiteDiscovery(company.id, company.name, company.domain);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score > 90) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (score > 80) return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    if (score > 70) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };
  };

  const confidenceScore = company.confidenceScore || 0;
  const confidenceStyle = getConfidenceColor(confidenceScore);
  const cardClasses = `group bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg`; // Adjusted hover for better visibility with new elements
  const employeeDisplay = company.employee_count || 'N/A';

  const renderDiscoverySection = () => {
    if (!companyDiscoveryState || companyDiscoveryState.status === 'idle') {
      return (
        <DiscoveryButton
          onClick={handleDiscoverClick}
          loading={false}
          companyName={company.name}
          variant="outline"
          size="sm"
          className="w-full group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500"
        />
      );
    }

    switch (companyDiscoveryState.status) {
      case 'discovering':
        return <ScrapingProgress progress={companyDiscoveryState.progress || 30} statusText={t('discovery.status.discovering', "Discovering website...")} className="group-hover:text-gray-100" />;
      case 'scraping':
        return <ScrapingProgress progress={companyDiscoveryState.progress || 0} statusText={t('discovery.status.scraping', "Scraping {{website}}...", { website: companyDiscoveryState.website })} className="group-hover:text-gray-100"/>;
      case 'completed':
        return (
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-300">
              <CheckCircle2Icon className="w-5 h-5 mr-2"/>
              <p>{t('discovery.status.completed', "Data enriched!")}</p>
            </div>
            {/* Placeholder for a "View Enriched Data" button or similar */}
            {/* <Button size="sm" variant="ghost" className="text-xs">View Data</Button> */}
          </div>
        );
      case 'error':
        return (
          <div className="text-center p-2 border border-red-200 rounded-md bg-red-50 group-hover:bg-red-100">
            <div className="flex items-center justify-center text-red-700 group-hover:text-red-800 mb-1.5">
              <AlertTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0"/>
              <p className="text-sm font-medium">{t('discovery.status.errorTitle', "Discovery Failed")}</p>
            </div>
             <p className="text-xs text-red-600 group-hover:text-red-700 mb-2 break-words">
                {companyDiscoveryState.error || t('discovery.status.unknownError', "An unknown error occurred.")}
             </p>
            <Button // Changed DiscoveryButton to a regular Button for more control here
              onClick={handleDiscoverClick}
              variant="destructive"
              size="sm"
              className="text-xs w-full"
            >
              {t('discovery.tryAgain', "Try Again")}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (layout === 'list') {
    return (
      <div className={`${cardClasses} p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 max-w-full hover:bg-[#2A3050]`}>
        <img
          src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`}
          alt={`${company.name} logo`}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-contain flex-shrink-0"
        />

        <div className="flex-grow space-y-1 min-w-0">
          <div className="truncate min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#1B1F3B] group-hover:text-white truncate" title={company.name}>
                {company.name}
              </h3>
              {isEnriched && (
                <Badge variant="outline" className="border-green-500 text-green-600 group-hover:bg-green-500 group-hover:text-white text-xs px-1.5 py-0.5">
                  <SparklesIcon className="w-3 h-3 mr-1" /> Enriched
                </Badge>
              )}
            </div>
            {company.domain && (
              <a
                href={`http://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 group-hover:text-gray-300 hover:underline truncate block"
                title={company.domain}
              >
                {company.domain}
              </a>
            )}
          </div>
          <div className="text-xs text-gray-500 group-hover:text-gray-300 space-y-0.5 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1">
            {company.industry && <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1 text-gray-400 group-hover:text-sky-300 flex-shrink-0" /> {company.industry}</span>}
            {company.location_text && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 group-hover:text-sky-300 flex-shrink-0" /> {company.location_text}</span>}
            {employeeDisplay !== 'N/A' && <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1 text-gray-400 group-hover:text-sky-300 flex-shrink-0" /> {employeeDisplay} {t('company.employees', 'Employees')}</span>}
          </div>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[170px] sm:ml-auto mt-2 sm:mt-0 flex flex-col items-stretch gap-2">
          {renderDiscoverySection()}
        </div>

        <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} group-hover:bg-opacity-20 group-hover:text-white group-hover:border-white/50 mt-2 sm:mt-0 sm:ml-2 self-center sm:self-auto`}>
          {confidenceScore}%
        </div>
      </div>
    );
  }

  // Grid Layout (remains mostly the same, height was already adjusted)
  return (
    <div className={`${cardClasses} flex flex-col h-[calc(384px+80px)] hover:bg-[#2A3050]`}> {/* Increased height for discovery section */}
      <CardHeader className="p-4 border-b border-gray-100 group-hover:border-gray-600 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`} alt={`${company.name} logo`} className="w-12 h-12 rounded-md object-contain flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1B1F3B] group-hover:text-white truncate" title={company.name}>{company.name}</h3>
                {isEnriched && (
                  <Badge variant="outline" className="border-green-500 text-green-600 group-hover:bg-green-500 group-hover:text-white text-xs px-1.5 py-0.5 flex-shrink-0">
                    <SparklesIcon className="w-3 h-3 mr-1" /> Enriched
                  </Badge>
                )}
              </div>
              {company.domain && (
                <a href={`http://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 group-hover:text-gray-300 hover:underline flex items-center gap-1 truncate" title={company.domain}>
                  {truncateDomain(company.domain)} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} group-hover:bg-opacity-20 group-hover:text-white group-hover:border-white/50 flex-shrink-0`}>
            {confidenceScore}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2 flex-grow min-h-0 overflow-y-auto">
        {preferences.showCompanyDescription && (
          <p className="text-sm text-gray-600 group-hover:text-gray-200 line-clamp-2" title={company.description}>
            {company.description || t('company.noDescription', 'No description available.')}
          </p>
        )}
        
        <div className="space-y-1.5 text-sm text-gray-600 group-hover:text-gray-200">
            {company.industry && <div className="flex items-center gap-2 truncate"><Briefcase className="w-4 h-4 text-gray-400 group-hover:text-sky-300 flex-shrink-0"/> <span className="truncate">{company.industry}</span></div>}

            {(scrapedData?.address || company.location_text) && (
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-sky-300 flex-shrink-0"/>
                <span className="truncate">{scrapedData?.address || company.location_text}</span>
                {scrapedData?.address && <SparklesIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-1" aria-label="Enriched Address"/>}
              </div>
            )}
            {employeeDisplay !== 'N/A' && <div className="flex items-center gap-2 truncate"><Users className="w-4 h-4 text-gray-400 group-hover:text-sky-300 flex-shrink-0"/> <span className="truncate">{employeeDisplay} {t('company.employees', 'Employees')}</span></div>}
        </div>
        
        {(company.domain || scrapedData?.website || company.extractedData?.emails?.[0] || scrapedData?.emails?.[0] || company.extractedData?.phones?.[0] || scrapedData?.phones?.[0] || scrapedData?.socialMedia) && (
          <div className="space-y-1.5 pt-2 border-t border-gray-100 group-hover:border-gray-600 text-sm">
              {(scrapedData?.website || company.domain) && (
                <div className="flex items-center gap-2 truncate text-gray-600 group-hover:text-gray-200">
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-sky-300 flex-shrink-0" />
                    <a href={`http://${scrapedData?.website || company.domain}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline" title={scrapedData?.website || company.domain}>
                      {scrapedData?.website || company.domain}
                    </a>
                    {scrapedData?.website && <SparklesIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-1" aria-label="Enriched Website"/>}
                </div>
              )}
              {(scrapedData?.emails?.length || company.extractedData?.emails?.[0]) && (
                (scrapedData?.emails || company.extractedData.emails).slice(0,1).map((email: string, idx: number) => (
                  <div key={`email-${idx}`} className="flex items-center gap-2 truncate text-gray-600 group-hover:text-gray-200">
                      <Mail className="w-4 h-4 text-gray-400 group-hover:text-sky-300 flex-shrink-0" />
                      <a href={`mailto:${email}`} className="truncate hover:underline" title={email}>{email}</a>
                      {scrapedData?.emails?.includes(email) && <SparklesIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-1" aria-label="Enriched Email"/>}
                  </div>
                ))
              )}
              {(scrapedData?.phones?.length || company.extractedData?.phones?.[0]) && (
                 (scrapedData?.phones || company.extractedData.phones).slice(0,1).map((phone: string, idx: number) => (
                  <div key={`phone-${idx}`} className="flex items-center gap-2 truncate text-gray-600 group-hover:text-gray-200">
                      <Phone className="w-4 h-4 text-gray-400 group-hover:text-sky-300 flex-shrink-0" />
                      <span className="truncate" title={phone}>{phone}</span>
                      {scrapedData?.phones?.includes(phone) && <SparklesIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-1" aria-label="Enriched Phone"/>}
                  </div>
                 ))
              )}
              {scrapedData?.socialMedia && Object.entries(scrapedData.socialMedia).map(([platform, link]) => {
                const SocialIcon = socialIconMap[platform.toLowerCase()] || socialIconMap.default;
                return (
                  <div key={platform} className="flex items-center gap-2 truncate text-gray-600 group-hover:text-gray-200">
                    <SocialIcon className="w-4 h-4 text-gray-400 group-hover:text-sky-300 flex-shrink-0" />
                    <a href={link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline" title={`${platform} profile`}>{link}</a>
                    <SparklesIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 ml-1" aria-label={`Enriched ${platform}`}/>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>

      {/* Technologies Section */}
      {company.extractedData?.technologies?.[0] && (
        <div className="p-4 border-t border-gray-100 group-hover:border-gray-600 flex-shrink-0"> {/* This part might get cut off if CardContent doesn't leave enough space */}
          <h4 className="text-xs font-semibold text-gray-500 group-hover:text-gray-300 mb-2">{t('company.technologies', 'TECHNOLOGIES')}</h4>
          <div className="flex flex-wrap gap-2">
              {company.extractedData.technologies?.slice(0, 3).map((tech: string, index: number) => ( // Unchanged
                  <div key={`${tech}-${index}`} className="flex items-center gap-1.5 text-xs bg-gray-100 group-hover:bg-gray-700 text-gray-700 group-hover:text-gray-200 rounded-full px-2 py-1"><Tag className="w-3 h-3"/> {tech}</div>
              ))}
          </div>
        </div>
      )}

      {/* Discovery Action Footer */}
      <CardFooter className="p-4 border-t border-gray-100 group-hover:border-gray-600 flex-shrink-0 mt-auto">
        {renderDiscoverySection()}
      </CardFooter>
    </div>
  );
};
