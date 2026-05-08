import { test, expect, Page } from '@playwright/test';

test.describe('Trailblaze Auto - Vehicle Catalogue Filters (Private)', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.goto('/browse');
        // Wait for cars to load
        await expect(page.locator('.car-card').first()).toBeVisible({ timeout: 10000 });
    });

    // AC-2: Positive - Condition (New)
    test('Filtering by Condition (New) should only show brand new cars', async ({ page }: { page: Page }) => {
        await page.click('button:has-text("All")'); 
        await page.getByTestId('condition-filter-New').click();
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Brand New/i);
        }
    });

    // AC-3: Positive - Condition (Pre-Owned)
    test('Filtering by Condition (Pre-Owned) should only show used cars', async ({ page }: { page: Page }) => {
        await page.click('button:has-text("All")'); 
        await page.getByTestId('condition-filter-Pre-Owned').click();
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Pre-Owned/i);
        }
    });

    // AC-4: Positive - Brand Dropdown
    test('Dropdown filter for Brand should work correctly', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Tata');
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText('Tata');
        }
    });

    // AC-5: Positive - Body Style
    test('Dropdown filter for Body Style should work correctly', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('body-type-filter').selectOption('SUV');
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/SUV/i);
        }
    });

    // AC-6: Positive - Fuel Type
    test('Fuel Type toggle pills should filter results', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('fuel-filter-Electric').click();
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Electric/i);
        }
    });

    // AC-7: Positive - Transmission
    test('Transmission toggle pills should filter results', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('transmission-filter-Automatic').click();
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Automatic/i);
        }
    });

    // AC-8: Positive - Budget Range
    test('Budget Range filter (Under 5L) should work', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('price-filter-Under 5L').click();
        await page.waitForTimeout(500);
        
        // Swift exists in both seeds within this range
        await expect(page.locator('.car-card').filter({ hasText: 'Swift' }).first()).toBeVisible();
    });

    // AC-9: Positive - Combined Filters
    test('Combining Brand and Fuel Type should narrow results correctly', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Tata');
        await page.getByTestId('fuel-filter-Diesel').click();
        await page.waitForTimeout(500);
        
        const carCards = page.locator('.car-card');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText('Tata');
            await expect(carCards.nth(i)).toContainText('Diesel');
        }
    });

    // AC-10: Negative - Conflicting Filters
    test('Negative: Conflicting filters (Brand mismatch Transmission) should show empty state', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Volkswagen');
        // Volkswagen Taigun is Automatic in seeds
        await page.getByTestId('transmission-filter-Manual').click(); 
        
        await page.waitForTimeout(1000);
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible({ timeout: 7000 });
    });

    // AC-11: Negative - Brand with no inventory
    test('Negative: Selecting a brand with no available cars for current body style should show empty state', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Mahindra');
        // Mahindra only has SUVs in seeds
        await page.getByTestId('body-type-filter').selectOption('Sedan'); 
        
        await page.waitForTimeout(500);
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible();
    });

    // AC-12: Negative - Price Range with no inventory
    test('Negative: Selecting a price range with no vehicles should show empty state', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Mahindra');
        await page.getByTestId('price-filter-Above 40L').click(); 
        
        await page.waitForTimeout(500);
        await expect(page.getByRole('heading', { name: 'No matches found' })).toBeVisible();
    });

    // AC-13: Negative - Verify Sold vehicles exclusion
    test('Negative: Sold vehicles should not appear even when matching filter criteria', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Tata');
        await page.waitForTimeout(500);
        
        // Harrier is 'Sold' in private seed
        await expect(page.locator('.car-card').filter({ hasText: 'Harrier' })).not.toBeVisible();
        // Verify other available Tata cars are visible
        await expect(page.locator('.car-card').filter({ hasText: 'Altroz' }).first()).toBeVisible();
    });

    // AC-14: Reset - Clear All Filters
    test('Clear All Filters should reset all selections and show full inventory', async ({ page }: { page: Page }) => {
        await page.getByTestId('filter-toggle').click();
        await page.getByTestId('brand-filter').selectOption('Tata');
        await page.getByTestId('reset-filters').click();
        await page.waitForTimeout(500);
        
        await expect(page.getByTestId('brand-filter')).toBeHidden();
        await expect(page.locator('.car-card').filter({ hasText: 'Hyundai' }).first()).toBeVisible();
    });
});
