import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from "@/src/components/ui/card";
import { Company } from "@/src/lib/types";
import { Users, MapPin, Mail, Phone, ExternalLink, Briefcase, Tag, SearchIcon, AlertTriangleIcon, CheckCircle2Icon, SparklesIcon, LinkedinIcon, TwitterIcon, FacebookIcon, InstagramIcon, LinkIcon as LucideLinkIcon, Settings2Icon, EyeIcon, FileTextIcon } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { DiscoveryButton } from './DiscoveryButton';
import { ScrapingProgress } from './ScrapingProgress';
import { useSearchStore, CompanyDiscoveryState, ScrapedData } from '@/stores/searchStore';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DiscoveryModal } from './DiscoveryModal';
import { DataPreview } from './DataPreview';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';

type CompanyWithEmployeeCount = Company & { employee_count?: string; id: string };

const socialIconMap: Record<string, React.ElementType> = {
  linkedin: LinkedinIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  default: LucideLinkIcon,
};

function truncateDomain(domain: string, maxLength = 24) {
  if (!domain) return '';
  return domain.length > maxLength ? domain.slice(0, maxLength - 3) + '...' : domain;
}

interface CompanyCardProps {
  company: CompanyWithEmployeeCount;
  layout?: 'grid' | 'list';
}

export const CompanyCard = ({ company, layout = 'grid' }: CompanyCardProps) => {
  const { t } = useTranslation('searchPage');
  const { toast } = useToast();
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [isDataPreviewModalOpen, setIsDataPreviewModalOpen] = useState(false);
  const [showDefaultScrapeWarning, setShowDefaultScrapeWarning] = useState(false);

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
        duration: 7000,
      });
    }
    prevStatusRef.current = companyDiscoveryState?.status;
  }, [companyDiscoveryState, company.name, toast]);

  const scrapedData: ScrapedData | undefined = companyDiscoveryState?.scrapedData;
  const isEnriched = companyDiscoveryState?.status === 'completed' && !!scrapedData;

  const handleDiscoverClick = (manualUrl?: string) => {
    if (companyDiscoveryState?.status === 'error') {
      setDiscoveryStateForCompany(company.id, { ...companyDiscoveryState, status: 'idle', error: undefined, progress: 0 });
      setTimeout(() => {
        if (company.id && company.name) {
          initiateWebsiteDiscovery(company.id, company.name, manualUrl || company.domain);
        }
      }, 50);
    } else if (company.id && company.name) {
      initiateWebsiteDiscovery(company.id, company.name, manualUrl || company.domain);
    }
    setIsDiscoveryModalOpen(false);
  };

  const handleConfirmManualUrl = async (companyId: string, manualUrl: string) => {
    if (company.id && company.name) {
      await initiateWebsiteDiscovery(company.id, company.name, manualUrl);
    }
    setIsDiscoveryModalOpen(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score > 90) return { bg: 'bg-emerald-100/80', text: 'text-emerald-800', border: 'border-emerald-300' };
    if (score > 80) return { bg: 'bg-blue-100/80', text: 'text-blue-800', border: 'border-blue-300' };
    if (score > 70) return { bg: 'bg-amber-100/80', text: 'text-amber-800', border: 'border-amber-300' };
    return { bg: 'bg-gray-100/80', text: 'text-gray-600', border: 'border-gray-200' };
  };

  const confidenceScore = company.confidenceScore || 0;
  const confidenceStyle = getConfidenceColor(confidenceScore);
  const cardClasses = `group bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300/50`;
  const employeeDisplay = company.employee_count || 'N/A';

  const handleDefaultScrape = () => {
    handleDiscoverClick();
    setShowDefaultScrapeWarning(false);
  };

  const handleShowDiscoveryModal = () => {
    setIsDiscoveryModalOpen(true);
    setShowDefaultScrapeWarning(false);
  };

  const renderDiscoverySection = () => {
    if (!companyDiscoveryState || companyDiscoveryState.status === 'idle') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DiscoveryButton
                onClick={() => handleDiscoverClick()}
                loading={false}
                companyName={company.name}
                variant="default"
                size="sm"
                // START: Color change for the blue discovery button
                className="w-full bg-[#1B3B6D] hover:bg-[#1B3B6D]/90 text-white shadow-sm hover:shadow-md transition-all"
                // END: Color change for the blue discovery button
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tooltip.startDiscovery', "Start automatic website discovery and data scraping.")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    switch (companyDiscoveryState.status) {
      case 'discovering':
        return <ScrapingProgress progress={companyDiscoveryState.progress || 30} statusText={t('discovery.status.discovering', "Discovering website...")} />;
      case 'scraping':
        return <ScrapingProgress progress={companyDiscoveryState.progress || 0} statusText={t('discovery.status.scraping', "Scraping {{website}}...", { website: companyDiscoveryState.website })} />;
      case 'completed':
        return (
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center text-emerald-600">
              <CheckCircle2Icon className="w-5 h-5 mr-2"/>
              <p className="font-medium">{t('discovery.status.completed', "Data enriched!")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 mt-1.5 w-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs flex-1 border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-gray-700"
                      onClick={() => setIsDiscoveryModalOpen(true)}
                    >
                      <Settings2Icon className="w-3.5 h-3.5 mr-1.5" /> {t('discovery.customizeScraping', "Re-Scrape")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('tooltip.customizeScraping', "Manually set website URL or customize scraping configuration.")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {scrapedData && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="default"
                        className="text-xs flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-sm"
                        onClick={() => setIsDataPreviewModalOpen(true)}
                      >
                        <FileTextIcon className="w-3.5 h-3.5 mr-1.5" /> {t('discovery.viewScrapedData', "View Data")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('tooltip.viewScrapedData', "View the data that has been scraped and enriched for this company.")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="text-center p-2 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-center justify-center text-red-700 mb-1.5">
              <AlertTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0"/>
              <p className="text-sm font-medium">{t('discovery.status.errorTitle', "Discovery Failed")}</p>
            </div>
            <p className="text-xs text-red-600 mb-2 break-words">
              {companyDiscoveryState.error || t('discovery.status.unknownError', "An unknown error occurred.")}
            </p>
            <Button
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
      <div className={`${cardClasses} p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 max-w-full hover:bg-blue-50/50`}>
        <img
          src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`}
          alt={`${company.name} logo`}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-contain flex-shrink-0 border border-gray-200"
        />

        <div className="flex-grow space-y-1 min-w-0">
          <div className="truncate min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-gray-800 group-hover:text-gray-900 truncate" title={company.name}>
                {company.name}
              </h3>
              {isEnriched && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-xs px-1.5 py-0.5">
                        <SparklesIcon className="w-3 h-3 mr-1" /> Enriched
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('tooltip.enrichedData', "This company's data has been successfully enriched through web scraping.")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {company.domain && (
              <a
                href={`http://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate block"
                title={company.domain}
              >
                {company.domain}
              </a>
            )}
          </div>
          <div className="text-xs text-gray-600 space-y-0.5 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1">
            {company.industry && <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" /> {company.industry}</span>}
            {company.location_text && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" /> {company.location_text}</span>}
            {employeeDisplay !== 'N/A' && <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1 text-gray-500 flex-shrink-0" /> {employeeDisplay} {t('company.employees', 'Employees')}</span>}
          </div>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[170px] sm:ml-auto mt-2 sm:mt-0 flex flex-col items-stretch gap-2">
          {renderDiscoverySection()}
        </div>

        <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} mt-2 sm:mt-0 sm:ml-2 self-center sm:self-auto`}>
          {confidenceScore}%
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <>
      <div className={`${cardClasses} flex flex-col h-[calc(384px+80px)]`}>
        <CardHeader className="p-4 border-b border-gray-200 group-hover:border-blue-200 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={company.logo || `https://ui-avatars.com/api/?name=${company.name.replace(/\s/g, '+')}&background=EBF4FF&color=1D4ED8`}
                alt={`${company.name} logo`}
                className="w-12 h-12 rounded-md object-contain flex-shrink-0 border border-gray-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-800 group-hover:text-gray-900 truncate" title={company.name}>{company.name}</h3>
                  {isEnriched && (
                        <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-xs px-1.5 py-0.5 flex-shrink-0">
                              <SparklesIcon className="w-3 h-3 mr-1" /> Enriched
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('tooltip.enrichedData', "This company's data has been successfully enriched through web scraping.")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                  )}
                </div>
                {company.domain && (
                  <a
                    href={`http://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                    title={company.domain}
                  >
                    {truncateDomain(company.domain)} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className={`text-xs font-bold px-2 py-1 rounded-full border ${confidenceStyle.bg} ${confidenceStyle.text} ${confidenceStyle.border} flex-shrink-0`}>
                {confidenceScore}%
              </div>
              {/* TOP: Discover for {companyName} (search icon) button */}
              {(!companyDiscoveryState || companyDiscoveryState.status === 'idle' || companyDiscoveryState.status === 'completed' || companyDiscoveryState.status === 'error') && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-3 text-sm bg-[#1B3B6D] hover:bg-[#1B3B6D]/90 text-white shadow-sm"
                        onClick={() => setShowDefaultScrapeWarning(true)}
                        title={t('discovery.startDiscovery', `Discover for ${company.name}`)}
                      >
                        <SearchIcon className="w-4 h-4 mr-1.5" /> 
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('tooltip.startDiscovery', "Start automatic website discovery and data scraping.")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3 flex-grow min-h-0 overflow-y-auto">
          {preferences.showCompanyDescription && (
            <p className="text-sm text-gray-600 line-clamp-2" title={company.description}>
              {company.description || t('company.noDescription', 'No description available.')}
            </p>
          )}

          <div className="space-y-3 text-sm text-gray-700">
            {company.industry && (
              <div className="flex items-center gap-2 truncate">
                <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0"/>
                <span className="truncate">{company.industry}</span>
              </div>
            )}

            {(scrapedData?.address || company.location_text) && (
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0"/>
                <span className="truncate">{scrapedData?.address || company.location_text}</span>
                {scrapedData?.address && <SparklesIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 ml-1" aria-label="Enriched Address"/>}
              </div>
            )}

            {employeeDisplay !== 'N/A' && (
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-gray-500 flex-shrink-0"/>
                <span className="truncate">{employeeDisplay} {t('company.employees', 'Employees')}</span>
              </div>
            )}
          </div>

          {(company.domain || scrapedData?.website || company.extractedData?.emails?.[0] || scrapedData?.emails?.[0] || company.extractedData?.phones?.[0] || scrapedData?.phones?.[0] || scrapedData?.socialMedia) && (
            <div className="space-y-2 pt-3 border-t border-gray-200 group-hover:border-blue-200 text-sm">
              {(scrapedData?.website || company.domain) && (
                <div className="flex items-center gap-2 truncate text-blue-600">
                  <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <a
                    href={`http://${scrapedData?.website || company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline"
                    title={scrapedData?.website || company.domain}
                  >
                    {scrapedData?.website || company.domain}
                  </a>
                  {scrapedData?.website && <SparklesIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 ml-1" aria-label="Enriched Website"/>}
                </div>
              )}

              {(scrapedData?.emails?.length || company.extractedData?.emails?.[0]) && (
                (scrapedData?.emails || company.extractedData.emails).slice(0,1).map((email: string, idx: number) => (
                  <div key={`email-${idx}`} className="flex items-center gap-2 truncate text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <a href={`mailto:${email}`} className="truncate hover:underline" title={email}>{email}</a>
                    {scrapedData?.emails?.includes(email) && <SparklesIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 ml-1" aria-label="Enriched Email"/>}
                  </div>
                ))
              )}

              {(scrapedData?.phones?.length || company.extractedData?.phones?.[0]) && (
                (scrapedData?.phones || company.extractedData.phones).slice(0,1).map((phone: string, idx: number) => (
                  <div key={`phone-${idx}`} className="flex items-center gap-2 truncate text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate" title={phone}>{phone}</span>
                    {scrapedData?.phones?.includes(phone) && <SparklesIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 ml-1" aria-label="Enriched Phone"/>}
                  </div>
                ))
              )}

              {scrapedData?.socialMedia && Object.entries(scrapedData.socialMedia).map(([platform, link]) => {
                const SocialIcon = socialIconMap[platform.toLowerCase()] || socialIconMap.default;
                return (
                  <div key={platform} className="flex items-center gap-2 truncate text-blue-600">
                    <SocialIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <a href={link} target="_blank" rel="noopener noreferrer" className="truncate hover:underline" title={`${platform} profile`}>{link}</a>
                    <SparklesIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 ml-1" aria-label={`Enriched ${platform}`}/>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {/* Technologies Section */}
        {company.extractedData?.technologies?.[0] && (
          <div className="p-4 border-t border-gray-200 group-hover:border-blue-200 flex-shrink-0">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">{t('company.technologies', 'TECHNOLOGIES')}</h4>
            <div className="flex flex-wrap gap-2">
              {company.extractedData.technologies?.slice(0, 3).map((tech: string, index: number) => (
                <div key={`${tech}-${index}`} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1">
                  <Tag className="w-3 h-3 text-gray-500"/> {tech}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discovery Action Footer */}
        <CardFooter className="p-4 border-t border-gray-200 group-hover:border-blue-200 flex-shrink-0 mt-auto">
          {/* BOTTOM: Website Discovery for {companyName} (custom/AI flow) button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-blue-400 text-blue-700 hover:bg-blue-50 hover:border-blue-500"
            onClick={handleShowDiscoveryModal}
            title={t('discovery.customizeScraping', `Website Discovery for ${company.name}`)}
          >
            <EyeIcon className="w-4 h-4 mr-1.5" /> Website Discovery for {company.name}
          </Button>
        </CardFooter>
      </div>

      {/* Default Scrape Warning Modal */}
      <Dialog open={showDefaultScrapeWarning} onOpenChange={setShowDefaultScrapeWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Default Website Scraping</DialogTitle>
            <DialogDescription>
              The following details will be scraped and saved to the database (if available): <br/>
              <span className="font-semibold">Phone number, email, address, company name</span>.<br/>
              <span className="text-xs text-gray-500">You can customize what to extract instead.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button variant="default" onClick={handleDefaultScrape} className="w-full sm:w-auto">Okay</Button>
            <Button variant="outline" onClick={handleShowDiscoveryModal} className="w-full sm:w-auto">Customize what to extract</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {company.id && company.name && (
        <DiscoveryModal
          isOpen={isDiscoveryModalOpen}
          onClose={() => setIsDiscoveryModalOpen(false)}
          companyId={company.id}
          companyName={company.name}
          initialUrl={companyDiscoveryState?.website || company.domain}
          onConfirmManualUrl={handleConfirmManualUrl}
        />
      )}

      {company.id && company.name && scrapedData && (
        <DataPreview
          isOpen={isDataPreviewModalOpen}
          onClose={() => setIsDataPreviewModalOpen(false)}
          companyName={company.name}
          scrapedData={scrapedData}
          isLoading={companyDiscoveryState?.status === 'scraping' || companyDiscoveryState?.status === 'discovering'}
          error={companyDiscoveryState?.status === 'error' ? companyDiscoveryState.error : null}
        />
      )}
    </>
  );
};