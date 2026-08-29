import { expect, test } from '@playwright/test';

const invoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-104,Northstar Studio,2026-08-01,850.00,USD\nINV-105,Atlas Works,2026-08-03,425.50,USD';
const payments = 'date,amount,description,currency\n2026-08-08,850.00,Payment INV-104 Northstar,USD\n2026-08-11,425.50,Transfer INV-105 Atlas,USD';

test('imports both files, confirms a match, and exports a report', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Match payments to invoices');

  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  await expect(page.getByRole('heading', { name: 'invoices.csv' })).toBeVisible();
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('2 rows loaded locally').first()).toBeVisible();

  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'payments.csv', mimeType: 'text/csv', buffer: Buffer.from(payments) });
  await page.getByRole('button', { name: 'Import payments' }).click();
  await expect(page.getByText('Strong suggestion').first()).toBeVisible();

  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  await expect(page.getByRole('heading', { name: 'Confirmed matches' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  expect((await download).suggestedFilename()).toMatch(/^matchbox-report-.*\.csv$/);
});

test('requires an audit note for a manual match and survives an offline reload', async ({ page, context }) => {
  await page.goto('/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('2 rows loaded locally').first()).toBeVisible();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'payments.csv', mimeType: 'text/csv', buffer: Buffer.from(payments) });
  await page.getByRole('button', { name: 'Import payments' }).click();
  await expect(page.getByText('2 rows loaded locally').nth(1)).toBeVisible();

  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await expect(dialog.getByRole('button', { name: 'Save manual match' })).toBeVisible();
  await dialog.getByLabel('Why this is the right match').fill('Verified against the client remittance note');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  await expect(page.getByText('Verified against the client remittance note')).toBeVisible();

  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('You are offline — matching still works')).toBeVisible();
  await expect(page.getByText('Verified against the client remittance note')).toBeVisible();
});

test('legal pages and mobile layout retain landmarks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/privacy/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('How Matchbox Ledger stores your data');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use.');
});

test('rejects an impossible payment date without a page error and keeps the import recoverable', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoice.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice_id,amount\nINV-9,100') });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'invalid-date.csv', mimeType: 'text/csv', buffer: Buffer.from('date,amount,description\n2026-99-99,100,test') });

  const dialogs: string[] = [];
  page.once('dialog', (dialog) => { dialogs.push(dialog.message()); void dialog.dismiss(); });
  await page.getByRole('button', { name: 'Import payments' }).click();

  expect(dialogs).toEqual(['Payment row 2 needs a valid date and amount.']);
  await expect(page.getByRole('heading', { name: 'invalid-date.csv' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('blocks quick confirmation when two invoices compete for one payment', async ({ page }) => {
  const competingInvoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-201,Alpha,2026-08-01,100.00,USD\nINV-202,Beta,2026-08-01,100.00,USD';
  const sharedPayment = 'date,amount,description,currency\n2026-08-08,100.00,Payment received,USD';
  await page.goto('/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'competing.csv', mimeType: 'text/csv', buffer: Buffer.from(competingInvoices) });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'shared.csv', mimeType: 'text/csv', buffer: Buffer.from(sharedPayment) });
  await page.getByRole('button', { name: 'Import payments' }).click();

  await expect(page.getByText('Needs a closer look')).toHaveCount(2);
  await expect(page.getByText('payment also fits another open invoice')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Confirm match' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Review payment manually' })).toHaveCount(2);
});

test('rejects a malformed backup, retains the current workspace, and reports no page error', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoice.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice_id,amount\nINV-SAFE,100') });
  await page.getByRole('button', { name: 'Import invoices' }).click();

  const dialogPromise = page.waitForEvent('dialog');
  await page.locator('#backup-input').setInputFiles({ name: 'malformed.json', mimeType: 'application/json', buffer: Buffer.from('{"invoices":[null],"transactions":[],"matches":[]}') });
  const dialog = await dialogPromise;

  expect(dialog.message()).toMatch(/invoice 1.*current workspace was not changed/i);
  await dialog.dismiss();
  await expect(page.getByText('1 row loaded locally').first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('all footer controls meet the 44px touch target at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const sizes = await page.locator('footer a, footer button').evaluateAll((controls) => controls.map((control) => {
    const box = control.getBoundingClientRect();
    return { label: control.textContent?.trim(), width: box.width, height: box.height };
  }));
  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) {
    expect(size.width, `${size.label} width`).toBeGreaterThanOrEqual(44);
    expect(size.height, `${size.label} height`).toBeGreaterThanOrEqual(44);
  }
});

test('pre-caches the hashed welcome artwork for a fresh offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.locator('.hero-art img')).toHaveJSProperty('complete', true);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Match payments to invoices');
  await expect(page.locator('.hero-art img')).toHaveJSProperty('naturalWidth', 1200);
});

test('makes only same-origin requests in the default private workflow', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/', { waitUntil: 'networkidle' });
  expect([...origins]).toEqual([new URL(page.url()).origin]);
});

test('@claim:daily-license-check rechecks only after the full 86,400,000 millisecond cache window', async ({ page }) => {
  let verifies = 0;
  await page.addInitScript(() => {
    const originalNow = Date.now;
    Date.now = () => Number(localStorage.getItem('qa-license-now') ?? originalNow());
  });
  await page.route('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?**', async (route) => {
    verifies += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid', expires_at: null }) });
  });
  await page.goto('/?demo=1');
  await page.evaluate(() => localStorage.setItem('qa-license-now', '1000'));
  await page.reload();
  await page.getByRole('button', { name: 'View Plus features' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Matchbox Plus' });
  await dialog.getByLabel('Have a license? Paste it here').fill('qa-invalid-license-regression');
  await dialog.getByRole('button', { name: 'Restore purchase' }).click();

  const notice = dialog.getByRole('status');
  await expect(dialog).toBeVisible();
  await expect(notice).toHaveText('This license is no longer active.');
  await expect(notice).toBeFocused();
  expect(verifies).toBe(1);

  await page.evaluate(() => localStorage.setItem('qa-license-now', String(1000 + 86_400_000 - 1)));
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(verifies).toBe(1);
  await page.evaluate(() => localStorage.setItem('qa-license-now', String(1000 + 86_400_000 + 1)));
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(verifies).toBe(2);
});
