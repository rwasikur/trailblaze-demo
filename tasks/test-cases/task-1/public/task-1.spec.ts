import { test, expect, Page } from '@playwright/test';

test.describe('Trailblaze Auto - Vehicle Catalogue Filters', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.goto('/browse');
        // Wait for cars to load
        await expect(page.locator('.car-card').first()).toBeVisible({ timeout: 10000 });
    });

    // AC-1
    test('Search functionality should be visible and work for brands/models', async ({ page }: { page: Page }) => {
        const searchInput = page.getByTestId('search-input');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute('placeholder', 'Discover...');
        
        await searchInput.fill('Hyundai');
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText('Hyundai');
        }
    });

    // AC-2
    test('Filtering by Condition (New) should only show brand new cars', async ({ page }: { page: Page }) => {
        await page.click('button:has-text("All")'); 
        await page.getByTestId('condition-filter-New').click();
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        await expect(page.locator('.car-card').filter({ hasText: 'Safari' }).first()).toBeVisible();
    });

    // AC-3
    test('Dropdown filter for Brand should work correctly', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Tata');
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText('Tata');
        }
    });

    // AC-4
    test('Dropdown filter for Body Style should work correctly', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('body-type-filter').selectOption('SUV');
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/SUV/i);
        }
    });

    // AC-5
    test('Fuel Type and Transmission toggle pills should filter results', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('fuel-filter-Electric').click();
        await page.getByTestId('transmission-filter-Automatic').click();
        await page.waitForTimeout(500);
        
        // Nexon EV is Electric and Automatic
        await expect(page.locator('.car-card').filter({ hasText: 'Nexon EV' }).first()).toBeVisible();
    });

    // AC-6
    test('Budget Range filter (10L - 20L) should work', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('price-filter-10L - 20L').click();
        await page.waitForTimeout(500);
        
        // Elevate is 1,630,000 and Available
        await expect(page.locator('.car-card').filter({ hasText: 'Elevate' }).first()).toBeVisible();
    });

    // AC-7
    test('Clear All Filters should reset everything', async ({ page }: { page: Page }) => {
        const searchInput = page.getByTestId('search-input');
        await searchInput.fill('Maruti');
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('reset-filters').click();
        
        await expect(searchInput).toHaveValue('');
        await expect(page.getByTestId('brand-filter')).toBeHidden();
        await expect(page.locator('.car-card').filter({ hasText: 'Hyundai' }).first()).toBeVisible();
    });

    // AC-8
    test('Negative: Searching for non-matching strings should show no matches', async ({ page }: { page: Page }) => {
        const searchInput = page.getByTestId('search-input');
        await searchInput.fill('NonExistentCarBrandXYZ');
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible();
    });

    // AC-9
    test('Negative: Searching with special characters should return no matches', async ({ page }: { page: Page }) => {
        const searchInput = page.getByTestId('search-input');
        await searchInput.fill('!@#$%^&*()');
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible({ timeout: 7000 });
    });

    // AC-10
    test('Negative: Sold vehicles must not be visible in search results', async ({ page }: { page: Page }) => {
        const searchInput = page.getByTestId('search-input');
        await searchInput.fill('Dzire');
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible({ timeout: 7000 });
        
        await searchInput.fill('Thar LX');
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible({ timeout: 7000 });
    });

    // AC-11
    test('Negative: Conflicting filters should show empty state', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Volkswagen');
        await page.getByTestId('body-type-filter').selectOption('SUV');
        
        await page.waitForTimeout(1000);
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible({ timeout: 7000 });
    });
});
