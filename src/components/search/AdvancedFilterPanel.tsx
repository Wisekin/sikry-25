import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Slider } from '@/src/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Calendar } from '@/src/components/ui/calendar';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchStore } from '@/stores/searchStore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';

// Mock industry list - in a real app, this would come from an API or constants
// TODO: These should ideally be translatable if they are not just for developers/testing
const MOCK_INDUSTRIES = ["Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education", "Real Estate", "Entertainment"];
const EMPLOYEE_COUNT_STEPS = [0, 50, 200, 1000, 5000, 20000, 100000]; // For slider labels

export function AdvancedFilterPanel() {
  const { t } = useTranslation('searchPage');
  const { filters, setFilters, clearFilters } = useSearchStore(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
  }));

  const [localIndustries, setLocalIndustries] = useState<string[]>(filters.industry);
  const [localEmployeeRange, setLocalEmployeeRange] = useState<[number, number]>([
    filters.employeeCount.min ?? EMPLOYEE_COUNT_STEPS[0],
    filters.employeeCount.max ?? EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1]
  ]);
  const [localLocation, setLocalLocation] = useState(filters.location);
  const [localConfidence, setLocalConfidence] = useState(filters.confidenceScore);
  const [localHasEmail, setLocalHasEmail] = useState(filters.hasEmail);
  const [localHasPhone, setLocalHasPhone] = useState(filters.hasPhone);
  const [localScrapedFrom, setLocalScrapedFrom] = useState<Date | undefined>(
    filters.lastScrapedDateRange?.from ? new Date(filters.lastScrapedDateRange.from) : undefined
  );
  const [localScrapedTo, setLocalScrapedTo] = useState<Date | undefined>(
    filters.lastScrapedDateRange?.to ? new Date(filters.lastScrapedDateRange.to) : undefined
  );

  const handleApplyFilters = () => {
    setFilters({
      industry: localIndustries,
      employeeCount: {
        min: localEmployeeRange[0] === EMPLOYEE_COUNT_STEPS[0] && localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? null : localEmployeeRange[0],
        max: localEmployeeRange[0] === EMPLOYEE_COUNT_STEPS[0] && localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? null : localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? null : localEmployeeRange[1]
      },
      location: localLocation,
      confidenceScore: localConfidence,
      hasEmail: localHasEmail,
      hasPhone: localHasPhone,
      lastScrapedDateRange: {
        from: localScrapedFrom ? format(localScrapedFrom, 'yyyy-MM-dd') : null,
        to: localScrapedTo ? format(localScrapedTo, 'yyyy-MM-dd') : null,
      }
    });
  };

  const handleClearFilters = () => {
    clearFilters();
    setLocalIndustries(useSearchStore.getState().filters.industry);
    setLocalEmployeeRange([
        useSearchStore.getState().filters.employeeCount.min ?? EMPLOYEE_COUNT_STEPS[0],
        useSearchStore.getState().filters.employeeCount.max ?? EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1]
    ]);
    setLocalLocation(useSearchStore.getState().filters.location);
    setLocalConfidence(useSearchStore.getState().filters.confidenceScore);
    setLocalHasEmail(useSearchStore.getState().filters.hasEmail);
    setLocalHasPhone(useSearchStore.getState().filters.hasPhone);
    setLocalScrapedFrom(undefined);
    setLocalScrapedTo(undefined);
  };

  const handleIndustryToggle = (industry: string) => {
    setLocalIndustries(prev =>
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    );
  };

  const handleEmployeeRangeChange = (value: number[]) => {
    if (value.length === 2) {
      setLocalEmployeeRange([value[0], value[1]]);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center"><FilterIcon className="mr-2 h-5 w-5"/> {t('advancedFilterPanel.title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
        <Accordion type="multiple" defaultValue={['industry', 'employeeCount', 'location', 'contact', 'dateRange']} className="w-full">

          <AccordionItem value="industry">
            <AccordionTrigger>{t('advancedFilterPanel.industry')}</AccordionTrigger>
            <AccordionContent className="space-y-2 max-h-40 overflow-y-auto">
              {MOCK_INDUSTRIES.map(industry => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={localIndustries.includes(industry)}
                    onCheckedChange={() => handleIndustryToggle(industry)}
                  />
                  {/* Assuming MOCK_INDUSTRIES are keys or need a mapping to translation keys */}
                  <Label htmlFor={`industry-${industry}`} className="font-normal text-sm">{t(`industry.${industry.toLowerCase().replace(/\s+/g, '')}`, industry)}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="employeeCount">
            <AccordionTrigger>{t('advancedFilterPanel.employeeCount')}</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Slider
                min={EMPLOYEE_COUNT_STEPS[0]}
                max={EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length - 1]}
                step={EMPLOYEE_COUNT_STEPS.length > 1 ? EMPLOYEE_COUNT_STEPS[1] - EMPLOYEE_COUNT_STEPS[0] : 10}
                value={localEmployeeRange}
                onValueChange={handleEmployeeRangeChange}
                minStepsBetweenThumbs={0}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{localEmployeeRange[0].toLocaleString()}</span>
                <span>{localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? `${localEmployeeRange[1].toLocaleString()}+` : localEmployeeRange[1].toLocaleString()}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger>{t('advancedFilterPanel.location')}</AccordionTrigger>
            <AccordionContent>
              <Input
                placeholder={t('advancedFilterPanel.locationPlaceholder')}
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="confidenceScore">
            <AccordionTrigger>{t('advancedFilterPanel.minConfidenceScore')}</AccordionTrigger>
            <AccordionContent className="pt-2">
               <Slider
                min={0}
                max={100}
                step={5}
                value={[localConfidence]}
                onValueChange={(val) => setLocalConfidence(val[0])}
                className="my-4"
              />
              <div className="text-center text-sm text-muted-foreground">{t('advancedFilterPanel.confidenceValue', { value: localConfidence })}</div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact">
            <AccordionTrigger>{t('advancedFilterPanel.contactInfo')}</AccordionTrigger>
            <AccordionContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hasEmail" checked={localHasEmail} onCheckedChange={(checked) => setLocalHasEmail(!!checked)} />
                  <Label htmlFor="hasEmail" className="font-normal text-sm">{t('advancedFilterPanel.hasEmail')}</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasPhone" checked={localHasPhone} onCheckedChange={(checked) => setLocalHasPhone(!!checked)} />
                  <Label htmlFor="hasPhone" className="font-normal text-sm">{t('advancedFilterPanel.hasPhone')}</Label>
                </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="dateRange">
            <AccordionTrigger>{t('advancedFilterPanel.lastScrapedDate')}</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div>
                <Label htmlFor="scrapedFromDate" className="text-xs">{t('advancedFilterPanel.from')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="scrapedFromDate"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !localScrapedFrom && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localScrapedFrom ? format(localScrapedFrom, "PPP") : <span>{t('advancedFilterPanel.pickDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={localScrapedFrom} onSelect={setLocalScrapedFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="scrapedToDate" className="text-xs">{t('advancedFilterPanel.to')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="scrapedToDate"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !localScrapedTo && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localScrapedTo ? format(localScrapedTo, "PPP") : <span>{t('advancedFilterPanel.pickDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={localScrapedTo} onSelect={setLocalScrapedTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
      <CardFooter className="border-t p-4 flex justify-between">
        <Button variant="ghost" onClick={handleClearFilters} className="text-xs">
            <XIcon className="mr-1 h-4 w-4"/> {t('advancedFilterPanel.clearAllButton')}
        </Button>
        <Button onClick={handleApplyFilters}>{t('advancedFilterPanel.applyButton')}</Button>
      </CardFooter>
    </Card>
  );
}

export default AdvancedFilterPanel;
