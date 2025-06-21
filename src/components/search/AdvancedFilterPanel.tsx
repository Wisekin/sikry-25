import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // For simple text inputs like location
import { Checkbox } from '@/components/ui/checkbox'; // For boolean flags and potentially multi-select items
import { Slider } from '@/components/ui/slider'; // For range slider
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchStore } from '@/stores/searchStore';
import { cn } from '@/lib/utils';

// Mock industry list - in a real app, this would come from an API or constants
const MOCK_INDUSTRIES = ["Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Education", "Real Estate", "Entertainment"];
const EMPLOYEE_COUNT_STEPS = [0, 50, 200, 1000, 5000, 20000, 100000]; // For slider labels

export function AdvancedFilterPanel() {
  const { filters, setFilters, clearFilters } = useSearchStore(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
  }));

  // Local state for UI interaction before committing to store, helps avoid rapid store updates on every little change.
  // Or, update store directly if components are simple enough. For complex filters, local state is better.
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
        min: localEmployeeRange[0] === EMPLOYEE_COUNT_STEPS[0] && localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? null : localEmployeeRange[0], // null if default full range
        max: localEmployeeRange[0] === EMPLOYEE_COUNT_STEPS[0] && localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? null : localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? null : localEmployeeRange[1] // null if max is the highest step
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
    // Potentially trigger search here or expect parent component to do so
  };

  const handleClearFilters = () => {
    clearFilters(); // Resets store to initial
    // Reset local state too
    setLocalIndustries(useSearchStore.getState().filters.industry); // Get fresh initial state
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

  // For employee range slider, assuming it gives an array [min, max]
  const handleEmployeeRangeChange = (value: number[]) => {
    if (value.length === 2) {
      setLocalEmployeeRange([value[0], value[1]]);
    }
  };


  return (
    <Card className="w-full max-w-sm"> {/* Adjust width as needed */}
      <CardHeader className="border-b">
        <CardTitle className="flex items-center"><FilterIcon className="mr-2 h-5 w-5"/> Advanced Filters</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
        <Accordion type="multiple" defaultValue={['industry', 'employeeCount', 'location', 'contact', 'dateRange']} className="w-full">

          {/* Industry Filter (Multi-select Checkbox Group) */}
          <AccordionItem value="industry">
            <AccordionTrigger>Industry</AccordionTrigger>
            <AccordionContent className="space-y-2 max-h-40 overflow-y-auto">
              {MOCK_INDUSTRIES.map(industry => (
                <div key={industry} className="flex items-center space-x-2">
                  <Checkbox
                    id={`industry-${industry}`}
                    checked={localIndustries.includes(industry)}
                    onCheckedChange={() => handleIndustryToggle(industry)}
                  />
                  <Label htmlFor={`industry-${industry}`} className="font-normal text-sm">{industry}</Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Employee Count Filter (Range Slider) */}
          <AccordionItem value="employeeCount">
            <AccordionTrigger>Employee Count</AccordionTrigger>
            <AccordionContent className="pt-2">
              <Slider
                min={EMPLOYEE_COUNT_STEPS[0]}
                max={EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length - 1]}
                step={EMPLOYEE_COUNT_STEPS.length > 1 ? EMPLOYEE_COUNT_STEPS[1] - EMPLOYEE_COUNT_STEPS[0] : 10} // Approximate step
                value={localEmployeeRange}
                onValueChange={handleEmployeeRangeChange}
                minStepsBetweenThumbs={0} // Allow thumbs to be at the same step
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{localEmployeeRange[0].toLocaleString()}</span>
                <span>{localEmployeeRange[1] === EMPLOYEE_COUNT_STEPS[EMPLOYEE_COUNT_STEPS.length -1] ? `${localEmployeeRange[1].toLocaleString()}+` : localEmployeeRange[1].toLocaleString()}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Location Filter */}
          <AccordionItem value="location">
            <AccordionTrigger>Location</AccordionTrigger>
            <AccordionContent>
              <Input
                placeholder="e.g., City, State, Country"
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Confidence Score Filter */}
          <AccordionItem value="confidenceScore">
            <AccordionTrigger>Min. Confidence Score</AccordionTrigger>
            <AccordionContent className="pt-2">
               <Slider
                min={0}
                max={100}
                step={5}
                value={[localConfidence]}
                onValueChange={(val) => setLocalConfidence(val[0])}
                className="my-4"
              />
              <div className="text-center text-sm text-muted-foreground">{localConfidence}%</div>
            </AccordionContent>
          </AccordionItem>

          {/* Contact Availability */}
          <AccordionItem value="contact">
            <AccordionTrigger>Contact Info</AccordionTrigger>
            <AccordionContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hasEmail" checked={localHasEmail} onCheckedChange={(checked) => setLocalHasEmail(!!checked)} />
                  <Label htmlFor="hasEmail" className="font-normal text-sm">Has Email</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <Checkbox id="hasPhone" checked={localHasPhone} onCheckedChange={(checked) => setLocalHasPhone(!!checked)} />
                  <Label htmlFor="hasPhone" className="font-normal text-sm">Has Phone</Label>
                </div>
            </AccordionContent>
          </AccordionItem>

          {/* Last Scraped Date Range */}
          <AccordionItem value="dateRange">
            <AccordionTrigger>Last Scraped Date</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div>
                <Label htmlFor="scrapedFromDate" className="text-xs">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="scrapedFromDate"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !localScrapedFrom && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localScrapedFrom ? format(localScrapedFrom, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={localScrapedFrom} onSelect={setLocalScrapedFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="scrapedToDate" className="text-xs">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="scrapedToDate"
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !localScrapedTo && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localScrapedTo ? format(localScrapedTo, "PPP") : <span>Pick a date</span>}
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
            <XIcon className="mr-1 h-4 w-4"/> Clear All
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </CardFooter>
    </Card>
  );
}

export default AdvancedFilterPanel;
