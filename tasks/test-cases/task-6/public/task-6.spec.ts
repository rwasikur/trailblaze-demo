import { test, expect, Page } from '@playwright/test';

test.describe('Catalogue Search Bar - Task 6 Suite (Public)', () => {

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

    test("Search input must filter the car list in real-time by car name 'Dzire'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Dzire');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Dzire');
    });

    test("Search must match the car's brand 'Hyundai'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Hyundai');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Hyundai|i20|Creta/i);
        }
    });

    test("Search must match the car's body_type 'SUV'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('SUV');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        // Many cars are SUVs in public seed (Nexon EV, Safari, XUV700, Creta, Fortuner, etc.)
    });

    test("Search must match the car's fuel_type 'Hybrid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Hybrid');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Grand Vitara');
    });

    test("Search must be case-insensitive (searching 'tata' should show Tata cars).", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('tata');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Tata/i);
        }
    });

    test("Search must match the car's description text fragment 'authorized service center'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('authorized service center');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Dzire');
    });

    test("Search must work in combination with condition filters (Search 'Tata' + 'New' condition).", async ({ page }: { page: Page }) => {
        await page.locator('#filter-new').click();
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Tata');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Safari');
    });

    test("Clearing the search input must restore the full list of available cars.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Dzire');
        await expect(page.locator('#car-grid article')).toHaveCount(1);
        
        await searchInput.fill('');
        const count = await page.locator('#car-grid article').count();
        expect(count).toBeGreaterThan(5); // At least 5 available cars in public seed
    });

    // Negative Cases (30% of 12-14 cases is ~4-5)

    test("Negative: Search for a non-existent brand 'Ferrari' should show no results.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Ferrari');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search for 'Dzire' when 'New' filter is selected should show no results.", async ({ page }: { page: Page }) => {
        await page.locator('#filter-new').click();
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Dzire');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search with random special characters '@#$%' should show no results.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('@#$%');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search for a sold car model 'Thar' should not display it.", async ({ page }: { page: Page }) => {
        // Thar LX is Sold in public seed
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Thar');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Search should match the car's model_year '2024'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('2024');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/2024/i);
        }
    });

});
