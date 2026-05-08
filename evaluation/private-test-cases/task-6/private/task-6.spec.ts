import { test, expect, Page } from '@playwright/test';

test.describe('Catalogue Search Bar - Task 6 Suite (Private)', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/browse');
        await page.waitForLoadState('networkidle');
    });

    test("Catalogue page must feature a search input with id 'search-input'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute('placeholder', 'Search by make, model, or details...');
    });

    test("Search input must filter the car list in real-time by car name 'Baleno'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Baleno');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Baleno');
    });

    test("Search must match the car's brand 'Maruti Suzuki'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Maruti Suzuki');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Maruti Suzuki|Swift|Baleno|Fronx/i);
        }
    });

    test("Search must match the car's body_type 'MUV'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('MUV');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        // Carens and Triber are MUVs in private seed
    });

    test("Search must match the car's fuel_type 'Diesel'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Diesel');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Diesel/i);
        }
    });

    test("Search must be case-insensitive (searching 'skoda' should show Skoda cars).", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('skoda');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Skoda/i);
        }
    });

    test("Search must match the car's description text fragment 'Big Daddy'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Big Daddy');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Scorpio-N');
    });

    test("Search must work in combination with condition filters (Search 'Altroz' + 'Pre-Owned' condition).", async ({ page }: { page: Page }) => {
        await page.locator('#filter-pre-owned').click();
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Altroz');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Altroz');
    });

    test("Clearing the search input must restore the full list of available cars.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Baleno');
        await expect(page.locator('#car-grid article')).toHaveCount(1);
        
        await searchInput.fill('');
        const count = await page.locator('#car-grid article').count();
        expect(count).toBeGreaterThan(5); 
    });

    // Negative Cases (30% of 12-14 cases is ~4-5)

    test("Negative: Search for a non-existent brand 'Lamborghini' should show no results.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Lamborghini');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search for 'Kushaq' when 'Pre-Owned' filter is selected should show no results.", async ({ page }: { page: Page }) => {
        await page.locator('#filter-pre-owned').click();
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Kushaq');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search with random special characters '!!!!' should show no results.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('!!!!');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search for a sold car model 'Venue' should not display it.", async ({ page }: { page: Page }) => {
        // Venue is Sold in private seed
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Venue');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Search should match the car's registration_city 'Ghaziabad'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Ghaziabad');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Scorpio-N/i); // Scorpio-N is in Ghaziabad
        }
    });

});
