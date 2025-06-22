import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CompanyCard } from './CompanyCard'; // Assuming CompanyWithEmployeeCount is exported or defined here
import { useSearchStore, ScrapedData } from '@/stores/searchStore';
import { Company } from '@/src/lib/types';
import { TooltipProvider } from '@/src/components/ui/tooltip'; // Required by ConfidenceIndicator
import { I18nextProvider } from 'react-i18next';
import i18n from '@/src/i18n/config.client'; // Adjust path to your i18n instance for tests

// Type for CompanyCard props
type CompanyWithEmployeeCount = Company & { employee_count?: string; id: string };

const mockCompany: CompanyWithEmployeeCount = {
  id: 'test-company-1',
  name: 'TestCo',
  domain: 'testco.com', // Initial domain, might be used as manualUrl
  location_text: 'Testville',
  industry: 'Testing',
  employees: '10-50',
  description: 'A company for testing.',
  confidenceScore: 85,
  extractedData: { emails: [], phones: [], technologies: [] },
  lastScraped: new Date().toISOString(),
  employee_count: '10-50',
};

// Mock a basic i18n setup
const i18nTestInstance = i18n; // your actual i18n instance
// You might need to initialize it if it's not done automatically
if (!i18nTestInstance.isInitialized) {
    i18nTestInstance.init({
        lng: 'en',
        fallbackLng: 'en',
        debug: false,
        resources: {
            en: {
                searchPage: { // namespace
                    'discovery.status.discovering': 'Discovering website...',
                    'discovery.status.scraping': 'Scraping {{website}}...',
                    'discovery.status.completed': 'Data enriched!',
                    'discovery.status.errorTitle': 'Discovery Failed',
                    'discovery.status.unknownError': "An unknown error occurred.",
                    'discovery.tryAgain': "Try Again",
                    'company.employees': 'Employees',
                    'company.noDescription': 'No description available.',
                }
            }
        }
    });
}


// Helper to wrap component with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18nTestInstance}>
        <TooltipProvider>
            {component}
        </TooltipProvider>
    </I18nextProvider>
  );
};


describe('CompanyCard Integration - Discovery Flow', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset store before each test
    useSearchStore.getState().reset();
    // Mock global fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Clean up mocks
  });

  it('Scenario 1: Successful Discovery & Scraping (with initial domain as manualUrl)', async () => {
    // Initial render
    renderWithProviders(<CompanyCard company={mockCompany} layout="grid" />);

    // Find and click the discovery button
    // The button text might change based on company name, ensure selector is robust
    const discoverButton = await screen.findByRole('button', { name: /Discover Website/i }); // Initial text
    expect(discoverButton).toBeInTheDocument();

    // --- Mock API responses ---
    // 1. Discovery call (skipped if manualUrl is provided, which company.domain acts as)
    // So, we directly mock the scraper call.
    // If company.domain was NOT provided, we'd mock /api/search/discover first.
    // Our current store logic: if manualUrl (company.domain) is passed, it uses that, then scrapes.

    const mockScrapedWebsite = mockCompany.domain; // Since it's passed as manualUrl
    const mockScrapedData: ScrapedData = {
      companyName: 'TestCo Scraped',
      emails: ['contact@testco-scraped.com'],
      phones: ['123-456-7890'],
      website: mockScrapedWebsite,
      address: '123 Scraped St',
    };

    fetchMock.mockResolvedValueOnce( // For /api/search/scraper/execute
      new Response(JSON.stringify({ success: true, data: mockScrapedData }), { status: 200 })
    );

    fireEvent.click(discoverButton);

    // Check for "discovering" state (briefly, then quickly to scraping due to manualUrl)
    // The store sets progress 20 (discovering), then 50 (website set), then 70 (scraping)
    expect(await screen.findByText(/Discovering website.../i, {}, {timeout: 2000})).toBeInTheDocument();

    // Check for "scraping" state
    // The text includes the website URL, ensure it matches
    expect(await screen.findByText(`Scraping ${mockScrapedWebsite}...`, {}, {timeout: 2000})).toBeInTheDocument();

    // Check for "completed" state
    expect(await screen.findByText(/Data enriched!/i, {}, {timeout: 4000})).toBeInTheDocument(); // Increased timeout for async operations

    // Verify enriched data is displayed (e.g., email)
    // The card updates to show new email/phone. Original extractedData is empty.
    // We need to wait for the DOM to update after the store updates.
    await waitFor(() => {
      expect(screen.getByText('contact@testco-scraped.com')).toBeInTheDocument();
    });
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    // Check for "Enriched" badge
    expect(screen.getAllByText('Enriched')[0]).toBeInTheDocument(); // Card header badge
  });

  it('Scenario 2: API Error during Discovery (when no initial domain/manualUrl)', async () => {
    const companyWithoutDomain = { ...mockCompany, domain: '', id: 'no-domain-co' };
    renderWithProviders(<CompanyCard company={companyWithoutDomain} layout="grid" />);

    const discoverButton = await screen.findByRole('button', { name: /Discover Website/i });

    // Mock failed response for /api/search/discover
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: "Discovery API Error" }), { status: 500 })
    );

    fireEvent.click(discoverButton);

    // Check for error state and message
    expect(await screen.findByText(/Discovery Failed/i, {}, {timeout: 2000})).toBeInTheDocument();
    expect(await screen.findByText(/Discovery API Error/i, {}, {timeout: 2000})).toBeInTheDocument();

    const tryAgainButton = await screen.findByRole('button', { name: /Try Again/i });
    expect(tryAgainButton).toBeInTheDocument();

    // --- Second attempt: Successful discovery and scraping ---
    const mockDiscoveredUrl = "discovered-testco.com";
    const mockScrapedDataSuccess: ScrapedData = { emails: ['success@discovered.com'] };

    fetchMock
      .mockResolvedValueOnce( // For /api/search/discover (retry)
        new Response(JSON.stringify({ success: true, website: mockDiscoveredUrl }), { status: 200 })
      )
      .mockResolvedValueOnce( // For /api/search/scraper/execute (retry)
        new Response(JSON.stringify({ success: true, data: mockScrapedDataSuccess }), { status: 200 })
      );

    fireEvent.click(tryAgainButton);

    expect(await screen.findByText(`Scraping ${mockDiscoveredUrl}...`, {}, {timeout: 2000})).toBeInTheDocument();
    expect(await screen.findByText(/Data enriched!/i, {}, {timeout: 4000})).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('success@discovered.com')).toBeInTheDocument();
    });
  });

  it('Scenario 3: API Error during Scraping', async () => {
    renderWithProviders(<CompanyCard company={mockCompany} layout="grid" />);
    const discoverButton = await screen.findByRole('button', { name: /Discover Website/i });

    // Discovery is skipped (manualUrl = company.domain)
    // Mock failed response for /api/search/scraper/execute
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: "Scraping API Error" }), { status: 500 })
    );

    fireEvent.click(discoverButton);

    expect(await screen.findByText(/Discovery Failed/i, {}, {timeout: 2000})).toBeInTheDocument();
    expect(await screen.findByText(/Scraping API Error/i, {}, {timeout: 2000})).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('Scenario 4: No Website Found by Discovery API (when no initial domain/manualUrl)', async () => {
    const companyWithoutDomain = { ...mockCompany, domain: '', id: 'no-website-co' };
    renderWithProviders(<CompanyCard company={companyWithoutDomain} layout="grid" />);
    const discoverButton = await screen.findByRole('button', { name: /Discover Website/i });

    fetchMock.mockResolvedValueOnce( // For /api/search/discover
      new Response(JSON.stringify({ success: true, website: null, message: "No website could be identified." }), { status: 200 })
    );
    // Note: The store logic currently throws an error if discoveryResult.website is null.
    // This will lead to the "error" state.

    fireEvent.click(discoverButton);

    expect(await screen.findByText(/Discovery Failed/i, {}, {timeout: 2000})).toBeInTheDocument();
    // The error message in store is "No website found by discovery API" if success but no website,
    // or the specific message if success:false
    expect(await screen.findByText(/No website found by discovery API/i, {}, {timeout: 2000})).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

});
