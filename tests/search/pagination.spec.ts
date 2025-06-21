import { test, expect } from '@playwright/test';

const mockCompaniesPage1 = [
  { id: '1', name: 'Company A', description: 'Description for A' },
  { id: '2', name: 'Company B', description: 'Description for B' },
];

const mockCompaniesPage2 = [
  { id: '3', name: 'Company C', description: 'Description for C' },
  { id: '4', name: 'Company D', description: 'Description for D' },
];

test.describe('Search Pagination', () => {
  test('should allow user to navigate between pages of search results', async ({ page }) => {
    // Mock the API responses for both pages
    await page.route('/api/search**', async (route, request) => {
      const url = new URL(request.url());
      const pageNum = url.searchParams.get('page') || '1';
      const data = pageNum === '1' ? mockCompaniesPage1 : mockCompaniesPage2;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          success: true,
          data: data,
          metadata: {
            totalCount: 20, // 2 pages of 10
            page: parseInt(pageNum, 10),
            limit: 10,
            cacheKey: 'test-pagination-key',
          },
        },
      });
    });

    // 1. Navigate to the search page and perform a search
    await page.goto('/search');
    await page.fill('input[type="search"]', 'test query');
    await page.waitForResponse('/api/search**');

    // 2. Verify first page results
    await expect(page.getByText('Company A')).toBeVisible();
    await expect(page.getByText('Company B')).toBeVisible();
    await expect(page.getByText('Company C')).not.toBeVisible();

    // 3. Click "Next" and verify second page results
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForResponse('/api/search**');

    await expect(page.getByText('Company C')).toBeVisible();
    await expect(page.getByText('Company D')).toBeVisible();
    await expect(page.getByText('Company A')).not.toBeVisible();

    // 4. Click "Previous" and verify first page results
    await page.getByRole('button', { name: 'Previous' }).click();
    await page.waitForResponse('/api/search**');

    await expect(page.getByText('Company A')).toBeVisible();
    await expect(page.getByText('Company B')).toBeVisible();
    await expect(page.getByText('Company D')).not.toBeVisible();
  });
});
