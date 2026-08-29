import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const origin = 'https://offline-payment-matchbox.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = {};

function watch(page) {
  const requests = [];
  const errors = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url(), type: request.resourceType() }));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return { requests, errors };
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const events = watch(page);
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence/verification-7-demo-desktop.png', fullPage: true });
  const initial = {
    heading: await page.locator('h1').innerText(),
    banner: await page.getByText('Demo — sample data, nothing is saved to your workspace').isVisible(),
    reset: await page.getByRole('button', { name: 'Reset demo' }).isVisible(),
    startReal: await page.getByRole('button', { name: 'Start for real' }).isVisible(),
    samplePair: await page.getByText('INV-105 · Atlas Works', { exact: true }).isVisible(),
  };

  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await dialog.getByLabel('Why this is the right match').fill('No');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  const shortNoteBlocked = await dialog.isVisible();
  await dialog.getByLabel('Why this is the right match').fill('Verified from remittance email');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  const manualSaved = await page.getByText('Verified from remittance email', { exact: true }).isVisible();

  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  const download = await pending;
  const downloadPath = await download.path();
  const report = downloadPath ? await readFile(downloadPath, 'utf8') : '';
  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.getByText('Verified from remittance email', { exact: true }).isVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const online = await page.evaluate(async () => ({ controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() }));
  await context.setOffline(true);
  await page.reload();
  const offline = {
    notice: await page.getByText('You are offline — matching still works').isVisible(),
    persisted: await page.getByText('Verified from remittance email', { exact: true }).isVisible(),
  };
  result.workflow = {
    initial,
    shortNoteBlocked,
    manualSaved,
    reportName: download.suggestedFilename(),
    reportRows: report.trim().split('\n').length,
    reportHasNote: report.includes('Verified from remittance email'),
    persisted,
    online,
    offline,
    origins: [...new Set(events.requests.map((request) => new URL(request.url).origin))],
    cookies: await context.cookies(),
    errors: events.errors,
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const events = watch(page);
  const alerts = [];
  page.on('dialog', async (dialog) => { alerts.push(dialog.message()); await dialog.dismiss(); });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({
    name: 'boundary.csv', mimeType: 'text/csv',
    buffer: Buffer.from('invoice_id,customer,invoice_date,amount,currency\nEDGE-1,"Acme, Ltd",2024-02-29,"€1.250,50",EUR'),
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  const boundaryImported = await page.getByText('1 row loaded locally').first().isVisible();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({
    name: 'invalid-date.csv', mimeType: 'text/csv', buffer: Buffer.from('date,amount,description,currency\n2024-02-30,"1.250,50",EDGE-1,EUR'),
  });
  await page.getByRole('button', { name: 'Import payments' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({
    name: 'recovered.csv', mimeType: 'text/csv', buffer: Buffer.from('date,amount,description,currency\n2024-03-01,"1.250,50",Payment EDGE-1,EUR'),
  });
  await page.getByRole('button', { name: 'Import payments' }).click();
  const recovered = await page.getByText('Strong suggestion', { exact: true }).isVisible();
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'unclosed.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice_id,amount\nEDGE-2,"100') });
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'too-large.csv', mimeType: 'text/csv', buffer: Buffer.alloc(5_000_001, 65) });
  await page.waitForTimeout(100);
  result.boundaries = { boundaryImported, recovered, alerts, errors: events.errors };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const events = watch(page);
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence/verification-7-demo-mobile.png', fullPage: true });
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  const targetFailures = await page.locator('button:visible, a:visible, label.file-button:visible').evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { label: element.textContent?.trim() || element.getAttribute('aria-label'), width: box.width, height: box.height };
  }).filter((target) => target.width < 44 || target.height < 44));
  const transition = await page.locator('.primary-button').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  result.mobile = { dimensions, targetFailures, transition, errors: events.errors };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(result, null, 2));
const ok = result.workflow.shortNoteBlocked && result.workflow.manualSaved && result.workflow.reportHasNote && result.workflow.persisted
  && result.workflow.offline.notice && result.workflow.offline.persisted && result.workflow.origins.length === 1 && result.workflow.cookies.length === 0
  && result.workflow.errors.length === 0 && result.boundaries.boundaryImported && result.boundaries.recovered && result.boundaries.alerts.length === 3
  && result.boundaries.errors.length === 0 && result.mobile.dimensions.viewport === result.mobile.dimensions.page
  && result.mobile.targetFailures.length === 0 && Number.parseFloat(result.mobile.transition) <= 0.00001 && result.mobile.errors.length === 0;
if (!ok) process.exitCode = 1;
