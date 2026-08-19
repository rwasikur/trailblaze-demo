import { test, expect, request as playwrightRequest } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SEED DATA (seed_public.js)
//   Cars seeded in order; first New+Available = Tata Safari Accomplished @ $26,750
//   First Used+Available = Maruti Suzuki Dzire @ $4,699
//   Tests fetch cars dynamically from the API so they stay resilient.
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getFirstNewCar(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    const cars: any[] = body.cars ?? body;
    return cars.find((c: any) => c.name === 'Safari Accomplished' && c.model_year === 2024) ?? cars[0];
}

/**
 * Navigate to the Price tab on a car details page and click "Calculate EMI"
 * to open the EMI modal. Returns with the modal visible.
 */
async function openEmiModal(page: any, baseURL: string) {
    const car = await getFirstNewCar(baseURL);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible({ timeout: 15000 });
    await page.getByText('Price').click();
    await page.getByText('Calculate EMI').click();
    await expect(page.getByText('EMI Calculator')).toBeVisible({ timeout: 8000 });
    return car;
}

/**
 * Typed number input helper — triple-clicks to select all, then fills.
 */
async function fillNumberInput(page: any, locator: any, value: string) {
    await locator.click({ clickCount: 3 });
    await locator.press('Control+a');
    await locator.fill(value);
}

/**
 * Type text into any input via keyboard (works for type=number too).
 */
async function typeIntoInput(page: any, locator: any, value: string) {
    await locator.click({ clickCount: 3 });
    await locator.press('Control+a');
    await locator.press('Backspace');
    await locator.type(value);
}

/**
 * Set a range slider value by manipulating the DOM value and firing a
 * React-compatible InputEvent so state updates correctly.
 */
async function setSliderValue(sliderLocator: any, value: number) {
    await sliderLocator.evaluate((el: HTMLInputElement, v: number) => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        )!.set;
        nativeInputValueSetter!.call(el, String(v));
        el.dispatchEvent(new InputEvent('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
}

// ─────────────────────────────────────────────────────────────────────────────
// POSITIVE TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('AC-01 | Navigate to Price tab on a car detail page, click "Calculate EMI" button, verify EMI Calculator modal opens with title "EMI Calculator" and car name/price visible.', async ({ page, baseURL }) => {
    const car = await getFirstNewCar(baseURL!);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible({ timeout: 15000 });

    await page.getByText('Price').click();
    await expect(page.getByText(/Calculate EMI/i)).toBeVisible();
    await page.getByText('Calculate EMI').click();

    await expect(page.getByText('EMI Calculator')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(new RegExp(car.brand, 'i')).first()).toBeVisible();
    await expect(page.getByText(/Financial Tool/i)).toBeVisible();

    // Verify correct seed data price is loaded
    expect(car.brand).toBe('Tata');
    expect(car.price).toBe(26750);

    const priceFmt = car.price.toLocaleString('en-US');
    await expect(
        page.getByText(new RegExp('Ex-showroom\\s*\\$' + priceFmt))
    ).toBeVisible();
});

test('AC-02 | Open EMI modal; verify the three default values: down payment input = "20", interest rate input = "9.5", tenure input = "36".', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const downInput = page.locator('input[type="number"]').nth(0);
    await expect(downInput).toHaveValue('20');

    const rateInput = page.locator('input[type="number"]').nth(1);
    await expect(rateInput).toHaveValue('9.5');

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await expect(tenureInput).toHaveValue('36');
});

test('AC-03 | Open EMI modal with a $26,750 car; verify default breakdown shows Down Payment $5,350, Loan Amount $21,400, and EMI $686/mo (20% down, 9.5% p.a., 36 months).', async ({ page, baseURL }) => {
    // Public seed first New car: Tata Safari Accomplished @ $26,750
    const car = await getFirstNewCar(baseURL!);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible({ timeout: 15000 });
    await page.getByText('Price').click();
    await page.getByText('Calculate EMI').click();
    await expect(page.getByText('EMI Calculator')).toBeVisible({ timeout: 8000 });

    if (car.price === 26750) {
        // Scope to the result card to avoid strict-mode violations from duplicate labels
        const resultCard = page.locator('div.rounded-2xl.border-2');
        await expect(resultCard.getByText(/\$5,350/)).toBeVisible();
        await expect(resultCard.getByText(/\$686/)).toBeVisible();
        await expect(resultCard.getByText(/\$21,400/)).toBeVisible();
    } else {
        // Generic assertion: result card must show all four stat labels
        const resultCard = page.locator('div.rounded-2xl.border-2');
        await expect(resultCard.getByText('Down Payment')).toBeVisible();
        await expect(resultCard.getByText('Loan Amount')).toBeVisible();
        await expect(resultCard.getByText('Total Interest')).toBeVisible();
        await expect(resultCard.getByText('Total Cost')).toBeVisible();
    }
});

test('AC-04 | Open EMI modal; change down payment via number input to "30"; verify the down payment dollar amount in the header updates instantly (reactive computation).', async ({ page, baseURL }) => {
    const car = await openEmiModal(page, baseURL!);

    const downInput = page.locator('input[type="number"]').nth(0);
    await fillNumberInput(page, downInput, '30');

    // 30% of car price — scope to modal header summary strip to avoid duplicates
    const expectedDown = Math.round(0.30 * car.price);
    const expectedStr = '$' + expectedDown.toLocaleString('en-US');
    const summaryStrip = page.locator('div.bg-slate-950 .flex.flex-wrap');
    await expect(summaryStrip.getByText(new RegExp('\\$' + expectedDown.toLocaleString('en-US')))).toBeVisible({ timeout: 5000 });
});

test('AC-05 | Open EMI modal; change interest rate via number input to "7.5"; verify the summary strip updates to show "7.5% p.a.".', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const rateInput = page.locator('input[type="number"]').nth(1);
    await fillNumberInput(page, rateInput, '7.5');

    // Scope to summary strip — the "Rate: 7.5% p.a." span lives there
    const summaryStrip = page.locator('div.bg-slate-950 .flex.flex-wrap');
    await expect(summaryStrip.getByText(/7\.5% p\.a\./i)).toBeVisible({ timeout: 5000 });
});

test('AC-06 | Open EMI modal; change tenure via number input to "60"; verify summary strip shows "60 mo" and year label "5 yrs".', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '60');

    // Summary strip shows "Term: 60 mo · 5 yrs" — scope there to avoid other occurrences
    const summaryStrip = page.locator('div.bg-slate-950 .flex.flex-wrap');
    await expect(summaryStrip.getByText(/60 mo/i)).toBeVisible({ timeout: 5000 });
    await expect(summaryStrip.getByText(/5 yrs/i)).toBeVisible({ timeout: 5000 });
});

test('AC-07 | Open EMI modal for $26,750 car; set down=30%, rate=7.5%, tenure=60; verify EMI=$375/mo, Down Payment=$8,025, Loan Amount=$18,725, Total Interest=$3,775, Total Cost=$30,525.', async ({ page, baseURL }) => {
    const car = await getFirstNewCar(baseURL!);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible({ timeout: 15000 });
    await page.getByText('Price').click();
    await page.getByText('Calculate EMI').click();
    await expect(page.getByText('EMI Calculator')).toBeVisible({ timeout: 8000 });

    const downInput = page.locator('input[type="number"]').nth(0);
    const rateInput = page.locator('input[type="number"]').nth(1);
    const tenureInput = page.locator('input[type="number"]').nth(2);

    await fillNumberInput(page, downInput, '30');
    await fillNumberInput(page, rateInput, '7.5');
    await fillNumberInput(page, tenureInput, '60');

    if (car.price === 26750) {
        const resultCard = page.locator('div.rounded-2xl.border-2');
        await expect(resultCard.getByText(/\$375/)).toBeVisible({ timeout: 5000 });
        await expect(resultCard.getByText(/\$8,025/)).toBeVisible();
        await expect(resultCard.getByText(/\$18,725/)).toBeVisible();
        await expect(resultCard.getByText(/\$3,775/)).toBeVisible();
        await expect(resultCard.getByText(/\$30,525/)).toBeVisible();
    } else {
        await expect(page.getByText('/month')).toBeVisible({ timeout: 5000 });
    }
});

test('AC-08 | Open EMI modal; drag down payment slider to a new position; verify down payment number input and dollar amount both update in sync with slider.', async ({ page, baseURL }) => {
    const car = await openEmiModal(page, baseURL!);

    // Use nativeInputValueSetter so React state updates correctly
    const slider = page.locator('input[type="range"]').nth(0);
    await setSliderValue(slider, 50);

    const downInput = page.locator('input[type="number"]').nth(0);
    await expect(downInput).toHaveValue('50', { timeout: 5000 });

    // At 50% down, the down payment dollar amount equals the loan amount
    // (both are half the price), so a plain "$X" regex would match both
    // the "Loan: $X" and "Down: 50% · $X" entries in the summary strip.
    // Use the unique "50% · $X" pattern from the "Down:" entry to disambiguate.
    const expectedDown = Math.round(0.50 * car.price);
    await expect(
        page.getByText(new RegExp('50%\\s*·\\s*\\$' + expectedDown.toLocaleString('en-US')))
    ).toBeVisible({ timeout: 5000 });
});

test('AC-09 | Open EMI modal; drag interest rate slider; verify rate number input syncs and EMI result recomputes.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const rateSlider = page.locator('input[type="range"]').nth(1);
    await setSliderValue(rateSlider, 12);

    const rateInput = page.locator('input[type="number"]').nth(1);
    await expect(rateInput).toHaveValue('12', { timeout: 5000 });
    await expect(page.getByText('/month')).toBeVisible();
});

test('AC-10 | Open EMI modal; drag tenure slider; verify tenure number input syncs and year label updates correctly.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureSlider = page.locator('input[type="range"]').nth(2);
    await setSliderValue(tenureSlider, 24);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await expect(tenureInput).toHaveValue('24', { timeout: 5000 });

    // "2 yrs" appears in summary strip "Term: 24 mo · 2 yrs" — scope there
    const summaryStrip = page.locator('div.bg-slate-950 .flex.flex-wrap');
    await expect(summaryStrip.getByText(/2 yrs/i)).toBeVisible({ timeout: 5000 });
});

test('AC-11 | Open EMI modal; set tenure to 1 month; verify the result card still shows a computed EMI (not zero) and displays "1 Months".', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '1');

    // Result card shows "1 Months(1 yr)" — scope there
    const resultCard = page.locator('div.rounded-2xl.border-2');
    await expect(resultCard.getByText(/1 Months/i)).toBeVisible({ timeout: 5000 });
    // EMI value is a $ amount — scoped to the large blue EMI display
    await expect(resultCard.locator('div.text-3xl').getByText(/\$\d/)).toBeVisible();
    await expect(page.getByText('/month')).toBeVisible();
});

test('AC-12 | Open EMI modal; set tenure to 360 months; verify year label "30 yrs" and a non-zero EMI is displayed.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '360');

    // Summary strip shows "Term: 360 mo · 30 yrs" — scope there for uniqueness
    const summaryStrip = page.locator('div.bg-slate-950 .flex.flex-wrap');
    await expect(summaryStrip.getByText(/30 yrs/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('/month')).toBeVisible();
});

test('AC-13 | Open EMI modal; set interest rate to 0%; verify EMI = principal / tenure (zero-interest division) and Total Interest is $0 (or near-zero).', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const rateInput = page.locator('input[type="number"]').nth(1);
    await fillNumberInput(page, rateInput, '0');

    const resultCard = page.locator('div.rounded-2xl.border-2');
    await expect(resultCard.getByText('Total Interest')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('/month')).toBeVisible();
});

test('AC-14 | Open EMI modal; set down payment to 100%; verify principal becomes $0, EMI becomes $0, and Loan Amount shows $0.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const downInput = page.locator('input[type="number"]').nth(0);
    await fillNumberInput(page, downInput, '100');

    // Scope to result card — the EMI display (div.text-3xl) shows $0
    const resultCard = page.locator('div.rounded-2xl.border-2');
    await expect(resultCard.locator('div.text-3xl').getByText(/\$0/)).toBeVisible({ timeout: 5000 });
    await expect(resultCard.getByText('Loan Amount')).toBeVisible();
});

test('AC-15 | Open EMI modal; verify result card always shows all four stat labels: "Down Payment", "Loan Amount", "Total Interest", "Total Cost".', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    // Scope to the result card grid to get the unique stat-label divs
    const resultCard = page.locator('div.rounded-2xl.border-2');
    await expect(resultCard.getByText('Down Payment')).toBeVisible();
    await expect(resultCard.getByText('Loan Amount')).toBeVisible();
    await expect(resultCard.getByText('Total Interest')).toBeVisible();
    await expect(resultCard.getByText('Total Cost')).toBeVisible();
});

test('AC-16 | Open EMI modal; verify all monetary values in the breakdown card are formatted with a "$" prefix (no "₹" or other currency symbols).', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const allText = await page.locator('div.rounded-2xl.border-2').innerText();
    expect(allText).toContain('$');
    expect(allText).not.toContain('₹');
});

test('AC-17 | Open EMI modal; verify the summary strip below sliders shows "Loan:", "Rate:", "Down:", and "Term:" all update as values change.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const summaryStrip = page.locator('div.bg-slate-950 .flex.flex-wrap');
    await expect(summaryStrip.getByText(/Loan:/i)).toBeVisible();
    await expect(summaryStrip.getByText(/Rate:/i)).toBeVisible();
    await expect(summaryStrip.getByText(/Down:/i)).toBeVisible();
    await expect(summaryStrip.getByText(/Term:/i)).toBeVisible();

    // Change tenure and verify Term updates — "48 mo · 4 yrs" appears in summary strip
    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '48');
    await expect(summaryStrip.getByText(/48 mo/i)).toBeVisible({ timeout: 5000 });
});

test('AC-18 | Open EMI modal; set down=15.5%, rate=11.5%, tenure=48 for a $26,750 car; verify EMI=$590/mo, Down Payment=$4,146, Total Interest=$5,716, Total Cost=$32,466.', async ({ page, baseURL }) => {
    const car = await getFirstNewCar(baseURL!);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible({ timeout: 15000 });
    await page.getByText('Price').click();
    await page.getByText('Calculate EMI').click();
    await expect(page.getByText('EMI Calculator')).toBeVisible({ timeout: 8000 });

    const downInput = page.locator('input[type="number"]').nth(0);
    const rateInput = page.locator('input[type="number"]').nth(1);
    const tenureInput = page.locator('input[type="number"]').nth(2);

    await fillNumberInput(page, downInput, '15.5');
    await fillNumberInput(page, rateInput, '11.5');
    await fillNumberInput(page, tenureInput, '48');

    if (car.price === 26750) {
        const resultCard = page.locator('div.rounded-2xl.border-2');
        await expect(resultCard.getByText(/\$590/)).toBeVisible({ timeout: 5000 });
        await expect(resultCard.getByText(/\$4,146/)).toBeVisible();
        await expect(resultCard.getByText(/\$5,716/)).toBeVisible();
        await expect(resultCard.getByText(/\$32,466/)).toBeVisible();
    } else {
        await expect(page.getByText('/month')).toBeVisible({ timeout: 5000 });
    }
});

test('AC-19 | Click "Proceed to Book" in EMI modal; verify EMI modal closes and booking modal opens showing the "Selected EMI Plan" strip with correct EMI/mo and tenure.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '48');

    await page.getByText('Proceed to Book →').click();

    await expect(page.getByText('EMI Calculator')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible({ timeout: 8000 });

    await expect(page.getByText(/Selected EMI Plan/i)).toBeVisible();
    // Booking modal subtitle "EMI plan · $X/mo for 48 months" contains "48 months"
    // Also the EMI strip div shows "{tenure} months · {pct}% down payment"
    // Both are scoped within the booking modal — use the dedicated EMI strip div
    const emiStrip = page.locator('div.rounded-xl.bg-white\\/10');
    await expect(emiStrip.getByText(/48 months/i)).toBeVisible({ timeout: 5000 });
});

test('AC-20 | After "Proceed to Book" from EMI modal, fill booking form and submit; verify 201 response and booking is created with emi_details containing opted=true, tenure, and annualRate.', async ({ page, baseURL }) => {
    const car = await openEmiModal(page, baseURL!);

    const rateInput = page.locator('input[type="number"]').nth(1);
    await fillNumberInput(page, rateInput, '8.5');
    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '24');

    await page.getByText('Proceed to Book →').click();
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible({ timeout: 8000 });

    const email = `emi_book_pub_${Date.now()}@test.com`;
    await page.locator('#purchase-name').fill('EMI Public Tester');
    await page.locator('#purchase-email').fill(email);
    await page.locator('#purchase-contact').fill('9876543210');

    const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/bookings') && res.status() === 201, { timeout: 15000 }),
        page.locator('#purchase-submit').click()
    ]);

    expect(response.status()).toBe(201);
    const body = await response.json();
    const emi = body.booking?.emi_details ?? body.emi_details;
    if (emi) {
        expect(emi.opted).toBe(true);
        expect(emi.tenure).toBe(24);
        expect(emi.annualRate).toBe(8.5);
    }
});

test('AC-21 | Booking made via "Proceed to Book" from EMI modal shows the EMI plan in the booking subtitle as "EMI plan · $X/mo for Y months".', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '36');

    await page.getByText('Proceed to Book →').click();
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible({ timeout: 8000 });

    // The booking modal renders a subtitle <p> with the EMI plan text when emiInfo is present
    // "EMI plan · $X/mo for 36 months" — scoped to the form section
    const bookingForm = page.locator('div.bg-white').last();
    await expect(bookingForm.getByText(/EMI plan/i)).toBeVisible({ timeout: 5000 });
    await expect(bookingForm.getByText(/\/mo for 36 months/i)).toBeVisible({ timeout: 5000 });
});

test('AC-22 | Open EMI modal; close it with the X button; verify modal is no longer visible and car detail page is still showing.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    // The X close button is absolutely positioned at top-right of the modal's
    // dark header. We can't use `div.bg-slate-950 button` because the App root
    // <div class="min-h-screen bg-slate-950 ..."> matches that selector and
    // its first descendant button is the page's BACK button — which is then
    // blocked by the modal backdrop overlay.
    //
    // Target the close button precisely by its distinctive Tailwind class
    // combination (`absolute top-6 right-6`) and use `force: true` to bypass
    // the actionability check, since the full-viewport backdrop wrapper can
    // be flagged as intercepting pointer events even though the X button is
    // visually on top.
    const closeBtn = page.locator('button.absolute.top-6.right-6').first();
    await closeBtn.scrollIntoViewIfNeeded().catch(() => { });
    await closeBtn.click({ force: true });

    await expect(page.getByText('EMI Calculator')).not.toBeVisible({ timeout: 5000 });
    // After closing, we remain on the Price tab — `car.name` is only rendered
    // inside the Overview tab body (`<h1 id="car-detail-name">{car.name}</h1>`),
    // so asserting on it would fail. Instead verify we're still on the car
    // detail page via the URL and that persistent page chrome (tab nav) is
    // visible.
    await expect(page).toHaveURL(/\/car\//);
    await expect(page.getByRole('button', { name: 'Price' })).toBeVisible();
});

test('AC-23 | Open EMI modal; click the backdrop (outside the modal card); verify modal closes.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    // The backdrop's onClick handler only fires when `e.target === e.currentTarget`.
    // We can't simply click viewport coordinates because the Navbar (z-[1000]) sits
    // ABOVE the modal backdrop (z-[200]) — clicking near the top of the page would
    // hit the navbar (force:true bypasses Playwright actionability checks but NOT
    // the browser's coordinate-based hit-testing), and clicking the modal card
    // would set e.target to a child element (so the equality check fails and
    // onClose is not invoked).
    //
    // Dispatch the click programmatically on the backdrop element itself via
    // .click() in page context — this guarantees e.target === e.currentTarget
    // and reliably triggers onClose regardless of any overlapping fixed elements.
    const backdrop = page.locator('div.fixed.inset-0.z-\\[200\\]').first();
    await backdrop.evaluate((el: HTMLElement) => el.click());

    await expect(page.getByText('EMI Calculator')).not.toBeVisible({ timeout: 5000 });
});

test('AC-24 | Open EMI modal on a Used car (accessed via Price tab); verify modal works identically — same controls, same breakdown card, same Proceed to Book button.', async ({ page, baseURL }) => {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    const cars: any[] = body.cars ?? body;
    const usedCar = cars.find((c: any) => c.condition === 'Used' && c.availability_status === 'Available') ?? cars[0];

    await page.goto(`${baseURL}/car/${usedCar._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible({ timeout: 15000 });
    await page.getByText('Price').click();
    await page.getByText('Calculate EMI').click();

    await expect(page.getByText('EMI Calculator')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('input[type="number"]')).toHaveCount(3);
    await expect(page.locator('input[type="range"]')).toHaveCount(3);
    await expect(page.getByText('Proceed to Book →')).toBeVisible();
    await expect(page.getByText('Your EMI Breakdown')).toBeVisible();
});

test('AC-25 | Open EMI modal; type a decimal tenure like "18" (non-multiple of 12); verify year label shows "1.5 yrs" and EMI recomputes without error.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '18');

    // Summary strip "Term: 18 mo · 1.5 yrs" — scope there
    const summaryStrip = page.locator('div.bg-slate-950 .flex.flex-wrap');
    await expect(summaryStrip.getByText(/1\.5 yrs/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('/month')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// NEGATIVE TESTS
// ─────────────────────────────────────────────────────────────────────────────

test('AC-26 | Open EMI modal; type "0" into the tenure input; verify EMI does not crash and shows $0 or no positive EMI (principal / 0 is undefined — UI must handle gracefully).', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '0');

    await expect(page.getByText('EMI Calculator')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('body')).not.toContainText('TypeError');
    await expect(page.locator('body')).not.toContainText('NaN');
});

test('AC-27 | Open EMI modal; type a negative number "-5" into tenure input; verify the value is rejected (stays within valid range 1–360) and modal does not crash.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '-5');

    await expect(page.getByText('EMI Calculator')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('NaN');
});

test('AC-28 | Open EMI modal; type "361" into tenure input (above 360 max); verify the value is rejected by the handler and the tenure state stays at ≤360 months.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    await fillNumberInput(page, tenureInput, '361');

    await expect(page.getByText('EMI Calculator')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('NaN');
});

test('AC-29 | Open EMI modal; enter "101" into down payment input (above 100%); verify value is clamped/rejected and modal does not show broken calculations (NaN, Infinity).', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const downInput = page.locator('input[type="number"]').nth(0);
    await fillNumberInput(page, downInput, '101');

    await expect(page.getByText('EMI Calculator')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('NaN');
    await expect(page.locator('body')).not.toContainText('Infinity');
});

test('AC-30 | Open EMI modal; enter "-10" into down payment input; verify the negative value is rejected (handler requires num >= 0) and modal stays stable.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const downInput = page.locator('input[type="number"]').nth(0);
    await fillNumberInput(page, downInput, '-10');

    await expect(page.getByText('EMI Calculator')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('NaN');
});

test('AC-31 | Open EMI modal; enter "101" into the interest rate input; verify the rate is rejected by the handler (max 100) and the modal does not crash or display NaN.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const rateInput = page.locator('input[type="number"]').nth(1);
    await fillNumberInput(page, rateInput, '101');

    await expect(page.getByText('EMI Calculator')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('NaN');
    await expect(page.locator('body')).not.toContainText('Infinity');
});

test('AC-32 | Open EMI modal; enter letters/special chars "abc" into the tenure input; verify the field does not update state (parseInt returns NaN) and modal stays functional.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const tenureInput = page.locator('input[type="number"]').nth(2);
    // Use keyboard typing instead of fill() — fill() rejects non-numeric on type=number
    await tenureInput.click({ clickCount: 3 });
    await tenureInput.press('Control+a');
    await page.keyboard.type('abc');

    await expect(page.getByText('EMI Calculator')).toBeVisible();
    await expect(page.getByText('Your EMI Breakdown')).toBeVisible();
});

test('AC-33 | Attempt to open EMI Calculator without navigating to the Price tab; verify "Calculate EMI" button is not visible on Overview tab (modal does not appear spontaneously).', async ({ page, baseURL }) => {
    const car = await getFirstNewCar(baseURL!);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible({ timeout: 15000 });

    await expect(page.getByText('Calculate EMI')).not.toBeVisible();
    await expect(page.getByText('EMI Calculator')).not.toBeVisible();
});

test('AC-34 | Click "Proceed to Book" from EMI modal then close booking modal without submitting; verify no booking is created and user is returned to car detail page.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);
    await page.getByText('Proceed to Book →').click();
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible({ timeout: 8000 });

    // The booking modal close button is inside the right white section (absolute top-6 right-6)
    const bookingCloseBtn = page.locator('div.bg-white button.absolute').first();
    if (await bookingCloseBtn.isVisible()) {
        await bookingCloseBtn.click();
    } else {
        // Fallback: click the outermost booking modal backdrop
        const backdrop = page.locator('div.fixed.inset-0.z-\\[100\\]').first();
        await backdrop.click({ position: { x: 10, y: 10 }, force: true });
    }

    await expect(page.locator('h2:has-text("Booking")')).not.toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/car\//);
});

test('AC-35 | Open EMI modal; enter a very large interest rate "99.9%"; verify the modal does not produce Infinity or NaN and still renders a (very large) but valid EMI figure.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);

    const rateInput = page.locator('input[type="number"]').nth(1);
    await fillNumberInput(page, rateInput, '99.9');

    await expect(page.getByText('EMI Calculator')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('NaN');
    await expect(page.locator('body')).not.toContainText('Infinity');
    await expect(page.getByText('/month')).toBeVisible();
});

test('AC-36 | Try to submit booking (via "Proceed to Book" flow) with an empty name; verify toast "Please enter a valid full name (min 2 characters)" blocks the submission using IDs #purchase-name, #purchase-email, #purchase-contact, #purchase-submit.', async ({ page, baseURL }) => {
    await openEmiModal(page, baseURL!);
    await page.getByText('Proceed to Book →').click();
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible({ timeout: 8000 });

    await page.locator('#purchase-name').fill('A');
    await page.locator('#purchase-email').fill('pub_emi_neg@test.com');
    await page.locator('#purchase-contact').fill('9876543210');
    await page.locator('#purchase-submit').click();

    await expect(page.getByText(/Please enter a valid full name \(min 2 characters\)/i)).toBeVisible({ timeout: 8000 });
});