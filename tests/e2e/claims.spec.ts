import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const replacementInvoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-201,Harbor Type,2026-08-20,300.00,USD';

test('@claim:offline-reload keeps the sample ledger usable without a network', async ({ page, context }) => {
  await page.goto('/demo/');
  await expect(page.getByText('Demo — sample data, nothing is saved to your workspace')).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Review a ready-made sample ledger' })).toBeVisible();
  await expect(page.getByText('2 invoices to review')).toBeVisible();
});

test('@claim:csv-report exports every sample invoice and unused payment', async ({ page }) => {
  await page.goto('/demo/');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export current report' }).click();
  const path = await (await pending).path();
  expect(path).not.toBeNull();
  const csv = await readFile(path!, 'utf8');
  const lines = csv.trim().split('\n');
  expect(lines).toHaveLength(6);
  expect(lines.filter((line) => line.startsWith('matched,'))).toHaveLength(1);
  expect(lines.filter((line) => line.startsWith('open,'))).toHaveLength(2);
  expect(lines.filter((line) => line.startsWith('unused_payment,'))).toHaveLength(2);
});

test('@claim:private-workflow sends no ledger data to another origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo/', { waitUntil: 'networkidle' });
  const productOrigin = new URL(page.url()).origin;
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  await pending;
  expect([...origins]).toEqual([productOrigin]);
});

test('@claim:demo-isolation never writes sample changes into the real workspace', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.getByText(/rows loaded locally/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Confirmed matches' })).toHaveCount(0);
});

test('@claim:local-persistence keeps a confirmed sample match after reload', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Confirmed matches' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'INV-105 Atlas Works' })).toBeVisible();
});

test('@claim:source-opt-in excludes CSV text by default and includes it after consent', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'replacement.csv', mimeType: 'text/csv', buffer: Buffer.from(replacementInvoices) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  let pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  let path = await (await pending).path();
  let backup = JSON.parse(await readFile(path!, 'utf8')) as { sourceFiles?: unknown[] };
  expect(backup.sourceFiles ?? []).toEqual([]);

  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'replacement.csv', mimeType: 'text/csv', buffer: Buffer.from(replacementInvoices) });
  await page.getByRole('checkbox', { name: /Keep a copy/ }).check();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  path = await (await pending).path();
  backup = JSON.parse(await readFile(path!, 'utf8')) as { sourceFiles?: Array<{ name: string; text: string }> };
  expect(backup.sourceFiles).toEqual([expect.objectContaining({ name: 'replacement.csv', text: replacementInvoices })]);
});

test('@claim:deterministic-review flags competing equal matches instead of confirming them', async ({ page }) => {
  const invoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-301,Alpha,2026-08-01,100.00,USD\nINV-302,Beta,2026-08-01,100.00,USD';
  const payment = 'date,amount,description,currency\n2026-08-08,100.00,Payment received,USD';
  await page.goto('/demo/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'competing.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'shared.csv', mimeType: 'text/csv', buffer: Buffer.from(payment) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import payments' }).click();
  await expect(page.getByText('Needs a closer look')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Confirm match' })).toHaveCount(0);
});

test('@claim:json-backup exports every sample record and decision', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const path = await (await pending).path();
  const backup = JSON.parse(await readFile(path!, 'utf8')) as { invoices: unknown[]; transactions: unknown[]; matches: unknown[] };
  expect(backup.invoices).toHaveLength(3);
  expect(backup.transactions).toHaveLength(3);
  expect(backup.matches).toHaveLength(2);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('row')).toHaveCount(2);
  await page.locator('#backup-input').setInputFiles(path!);
  await expect(page.getByRole('row')).toHaveCount(3);
});

test('@claim:plus-batch confirms all clear sample suggestions together', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:offline-payment-matchbox', 'demo-license');
    localStorage.setItem('sb_license:offline-payment-matchbox:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto('/demo/');
  await expect(page.getByRole('heading', { name: 'Matchbox Plus costs $19 once' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm all strong matches' }).click();
  await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Every invoice has a match' })).toBeVisible();
});

test('@claim:plus-column-mappings restores every saved selection for repeat headings', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:offline-payment-matchbox', 'mapping-fixture-license');
    localStorage.setItem('sb_license:offline-payment-matchbox:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  const customInvoices = 'record,total,client,issued\nCUSTOM-1,125.00,Paper Kite Studio,2026-08-24';
  await page.goto('/demo/');
  const invoiceInput = page.locator('input[data-file-kind="invoice"]');
  await invoiceInput.setInputFiles({ name: 'custom-invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(customInvoices) });
  const mapping = page.locator('#mapping-form');
  await mapping.locator('select[name="id"]').selectOption('record');
  await mapping.locator('select[name="amount"]').selectOption('total');
  await mapping.locator('select[name="customer"]').selectOption('client');
  await mapping.locator('select[name="date"]').selectOption('issued');
  page.once('dialog', (dialog) => void dialog.accept());
  await mapping.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('1 row loaded locally').first()).toBeVisible();

  await invoiceInput.setInputFiles({ name: 'next-month.csv', mimeType: 'text/csv', buffer: Buffer.from(customInvoices.replace('CUSTOM-1', 'CUSTOM-2')) });
  await expect(mapping.locator('select[name="id"]')).toHaveValue('record');
  await expect(mapping.locator('select[name="amount"]')).toHaveValue('total');
  await expect(mapping.locator('select[name="customer"]')).toHaveValue('client');
  await expect(mapping.locator('select[name="date"]')).toHaveValue('issued');
});

test('@claim:manual-note blocks a manual match until its audit note is present', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Why this is the right match').fill('Checked against the client remittance email');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  await expect(page.getByText('Checked against the client remittance email')).toBeVisible();
});

test('@claim:workspace-clearing removes the current record from demo IndexedDB', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('3 rows loaded locally').first()).toBeVisible();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Clear local workspace' }).click();
  await expect(page.getByText(/rows loaded locally/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Confirmed matches' })).toHaveCount(0);

  const stored = await page.evaluate(async () => new Promise<unknown>((resolve, reject) => {
    const open = indexedDB.open('demo:matchbox-ledger', 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const request = open.result.transaction('workspace', 'readonly').objectStore('workspace').get('current');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    };
  }));
  expect(stored).toBeUndefined();
});

test('@claim:tracking-free uses no cookies, analytics requests, remote fonts, or tracking scripts', async ({ page, context }) => {
  const requests: Array<{ method: string; origin: string; resourceType: string }> = [];
  page.on('request', (request) => requests.push({
    method: request.method(),
    origin: new URL(request.url()).origin,
    resourceType: request.resourceType(),
  }));
  await page.goto('/demo/', { waitUntil: 'networkidle' });
  const productOrigin = new URL(page.url()).origin;
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  await pending;

  const resources = await page.evaluate(() => ({
    fonts: performance.getEntriesByType('resource')
      .filter((entry) => (entry as PerformanceResourceTiming).initiatorType === 'font')
      .map((entry) => entry.name),
    scripts: [...document.scripts].map((script) => script.src),
  }));
  expect(await context.cookies()).toEqual([]);
  expect(new Set(requests.map((request) => request.origin))).toEqual(new Set([productOrigin]));
  expect(requests.filter((request) => ['fetch', 'xhr', 'eventsource'].includes(request.resourceType))).toEqual([]);
  expect(requests.every((request) => request.method === 'GET')).toBe(true);
  expect(resources.fonts).toEqual([]);
  expect(resources.scripts).toHaveLength(1);
  expect(new URL(resources.scripts[0]!).origin).toBe(productOrigin);
  expect(new URL(resources.scripts[0]!).pathname).toMatch(/^\/assets\/main-[\w-]+\.js$/);
});

test('@claim:license-restore activates Plus from a valid license in a clean browser', async ({ page }) => {
  let verifiedToken = '';
  await page.route('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?**', async (route) => {
    verifiedToken = new URL(route.request().url()).searchParams.get('license') ?? '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Get Plus' }).click();
  const dialog = page.getByRole('dialog', { name: 'Matchbox Plus' });
  await dialog.getByLabel('Have a license? Paste it here').fill('valid-license-from-another-device');
  await dialog.getByRole('button', { name: 'Restore purchase' }).click();

  await expect(dialog.getByText('Plus is active', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Matchbox Plus is active on this device.')).toBeVisible();
  expect(verifiedToken).toBe('valid-license-from-another-device');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:offline-payment-matchbox'))).toBe('valid-license-from-another-device');
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Confirm all strong matches' }).click();
  await expect(page.getByRole('heading', { name: 'Every invoice has a match' })).toBeVisible();
});
