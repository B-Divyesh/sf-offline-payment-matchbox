import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const live = 'https://offline-payment-matchbox.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = {};

function monitor(page) {
  const requests = [];
  const consoleIssues = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url(), type: request.resourceType() }));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') consoleIssues.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => consoleIssues.push(`pageerror: ${error.message}`));
  return { requests, consoleIssues };
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const events = monitor(page);
  const response = await page.goto(`${live}/demo/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence/verification-5-demo-desktop.png', fullPage: true });
  const initial = {
    status: response?.status(),
    banner: await page.getByText('Demo — sample data, nothing is saved to your workspace').isVisible(),
    reset: await page.getByRole('button', { name: 'Reset demo' }).isVisible(),
    startReal: await page.getByRole('button', { name: 'Start for real' }).isVisible(),
    heading: await page.getByRole('heading', { level: 1 }).innerText(),
    tallies: await page.locator('.tally strong').allInnerTexts(),
  };

  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await dialog.getByLabel('Why this is the right match').fill('No');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  const twoCharBlocked = await dialog.isVisible();
  await dialog.getByLabel('Why this is the right match').fill('Q5?');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  const manualSaved = await page.getByText('Q5?', { exact: true }).isVisible();

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  const downloaded = await downloadEvent;
  const downloadPath = await downloaded.path();
  const report = downloadPath ? await readFile(downloadPath, 'utf8') : '';
  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.getByText('Q5?', { exact: true }).isVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const onlinePwa = await page.evaluate(async () => ({
    controller: navigator.serviceWorker.controller?.scriptURL,
    caches: await caches.keys(),
    databases: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((database) => database.name) : [],
  }));
  await context.setOffline(true);
  await page.reload();
  const offline = {
    status: await page.getByText('You are offline — matching still works').isVisible(),
    persisted: await page.getByText('Q5?', { exact: true }).isVisible(),
  };
  result.demoWorkflow = {
    initial,
    twoCharBlocked,
    manualSaved,
    downloadName: downloaded.suggestedFilename(),
    reportLines: report.trim().split('\n'),
    persisted,
    onlinePwa,
    offline,
    origins: [...new Set(events.requests.map((request) => new URL(request.url).origin))],
    requestCount: events.requests.length,
    consoleIssues: events.consoleIssues,
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const events = monitor(page);
  await page.goto(`${live}/`, { waitUntil: 'networkidle' });
  const alerts = [];
  page.on('dialog', async (dialog) => {
    alerts.push(dialog.message());
    await dialog.dismiss();
  });

  await page.locator('input[data-file-kind="invoice"]').setInputFiles({
    name: 'boundary-invoices.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('invoice_id,customer,invoice_date,amount,currency\nEDGE-1,"Acme, Ltd",2024-02-29,"€1.250,50",EUR'),
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  const boundaryImported = await page.getByText('1 row loaded locally').first().isVisible();

  await page.locator('input[data-file-kind="transaction"]').setInputFiles({
    name: 'invalid-date.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('date,amount,description,currency\n2024-02-30,"1.250,50",EDGE-1,EUR'),
  });
  await page.getByRole('button', { name: 'Import payments' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({
    name: 'recovered.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('date,amount,description,currency\n2024-03-01,"1.250,50",Payment EDGE-1,EUR'),
  });
  await page.getByRole('button', { name: 'Import payments' }).click();
  const recovered = await page.getByText('Strong suggestion', { exact: true }).isVisible();

  await page.locator('input[data-file-kind="invoice"]').setInputFiles({
    name: 'unclosed.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('invoice_id,amount\nEDGE-2,"100'),
  });
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({
    name: 'too-large.csv',
    mimeType: 'text/csv',
    buffer: Buffer.alloc(5_000_001, 65),
  });
  await page.waitForTimeout(150);
  result.invalidRecovery = { boundaryImported, recovered, alerts, consoleIssues: events.consoleIssues };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const events = monitor(page);
  await page.goto(`${live}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence/verification-5-mobile.png', fullPage: true });
  const home = await page.evaluate(() => {
    const visible = (element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.top < innerHeight && box.bottom > 0 && box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    return {
      viewport: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      h1: document.querySelector('h1')?.textContent?.trim(),
      lede: document.querySelector('.lede')?.textContent?.trim(),
      firstScreenActions: [...document.querySelectorAll('a,button')].filter(visible).map((element) => element.textContent?.trim()).filter(Boolean),
      bodyFont: getComputedStyle(document.body).fontSize,
    };
  });
  await page.goto(`${live}/demo/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence/verification-5-demo-mobile.png', fullPage: true });
  const populated = await page.evaluate(() => ({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth }));
  const targetFailures = await page.locator('a:visible, button:visible, label.file-button:visible').evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { label: element.getAttribute('aria-label') || element.textContent?.trim(), width: box.width, height: box.height };
  }).filter((box) => box.width < 44 || box.height < 44));
  result.mobile = { home, populated, targetFailures, consoleIssues: events.consoleIssues };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const events = monitor(page);
  await page.goto(`${live}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    outline: getComputedStyle(document.activeElement).outline,
  }));
  await page.keyboard.press('Enter');
  const afterSkip = await page.evaluate(() => ({ hash: location.hash, active: document.activeElement?.id }));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  let reachedPlus = false;
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    if ((await page.evaluate(() => document.activeElement?.textContent?.trim())) === 'Get Plus') { reachedPlus = true; break; }
  }
  if (reachedPlus) await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Matchbox Plus' });
  const dialogOpen = await dialog.isVisible();
  const focusInside = await page.evaluate(() => document.querySelector('#license-dialog')?.contains(document.activeElement));
  await page.keyboard.press('Escape');
  const dialogClosed = await dialog.isHidden();
  const reducedMotion = await page.locator('.primary-button').first().evaluate((element) => ({
    transition: getComputedStyle(element).transitionDuration,
    animation: getComputedStyle(element).animationDuration,
  }));
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  result.keyboardA11y = {
    skip,
    afterSkip,
    reachedPlus,
    dialogOpen,
    focusInside,
    dialogClosed,
    reducedMotion,
    axeViolations: axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact })),
    seriousCritical: axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')).length,
    consoleIssues: events.consoleIssues,
  };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(result, null, 2));
