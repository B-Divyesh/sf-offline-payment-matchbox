import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const live = 'https://offline-payment-matchbox.sociobot.in';
const browser = await chromium.launch({ headless: true });
const result = {};

const monitor = (page) => {
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => requests.push(request.url()));
  return { consoleErrors, pageErrors, requests };
};

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const events = monitor(page);
  await page.goto(`${live}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence/verification-4-cold-desktop.png', fullPage: true });
  result.cold = await page.evaluate(() => {
    const visibleInFirstScreen = (element) => {
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.top < innerHeight && box.bottom > 0 && box.width > 0 && box.height > 0
        && style.visibility !== 'hidden' && style.display !== 'none';
    };
    return {
      title: document.title,
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll('h1').length,
      h1: document.querySelector('h1')?.textContent?.trim(),
      lede: document.querySelector('.lede')?.textContent?.trim(),
      mainCount: document.querySelectorAll('main').length,
      firstScreenActions: [...document.querySelectorAll('a,button,label.file-button')].filter(visibleInFirstScreen).map((element) => element.textContent?.trim()).filter(Boolean),
      trySampleCount: [...document.querySelectorAll('a,button')].filter((element) => /try it with sample data/i.test(element.textContent ?? '')).length,
      sampleControls: [...document.querySelectorAll('[data-sample]')].map((element) => element.textContent?.trim()),
      facts: [...document.querySelectorAll('.privacy-stamp')].map((element) => element.textContent?.replace(/\s+/g, ' ').trim()),
    };
  });
  result.cold.consoleErrors = events.consoleErrors;
  result.cold.pageErrors = events.pageErrors;
  result.cold.origins = [...new Set(events.requests.map((url) => new URL(url).origin))];
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const events = monitor(page);
  const response = await page.goto(`${live}/demo`, { waitUntil: 'networkidle' });
  result.demo = await page.evaluate(async () => ({
    url: location.href,
    statusText: document.body.innerText.slice(0, 300),
    h1: document.querySelector('h1')?.textContent?.trim(),
    demoBannerCount: [...document.querySelectorAll('body *')].filter((element) => /Demo — sample data, nothing is saved/i.test(element.textContent ?? '')).length,
    resetDemoCount: [...document.querySelectorAll('button,a')].filter((element) => /Reset demo/i.test(element.textContent ?? '')).length,
    startRealCount: [...document.querySelectorAll('button,a')].filter((element) => /Start for real/i.test(element.textContent ?? '')).length,
    loadedInvoiceRows: [...document.querySelectorAll('.import-tray')].map((element) => element.textContent?.replace(/\s+/g, ' ').trim()),
    databases: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((database) => database.name) : [],
  }));
  result.demo.httpStatus = response?.status();
  result.demo.consoleErrors = events.consoleErrors;
  result.demo.pageErrors = events.pageErrors;
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const events = monitor(page);
  await page.goto(`${live}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '.factory/evidence/verification-4-mobile.png', fullPage: true });
  result.mobile = await page.evaluate(() => {
    const failures = [...document.querySelectorAll('a, button, input, select, textarea, label.file-button')]
      .filter((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0 && !element.closest('[hidden]');
      })
      .map((element) => {
        const box = element.getBoundingClientRect();
        return { label: element.getAttribute('aria-label') || element.textContent?.trim() || element.getAttribute('name') || element.tagName, width: box.width, height: box.height };
      })
      .filter((box) => box.width < 44 || box.height < 44);
    return {
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyFontSize: getComputedStyle(document.body).fontSize,
      touchTargetFailures: failures,
    };
  });
  result.mobile.consoleErrors = events.consoleErrors;
  result.mobile.pageErrors = events.pageErrors;
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const events = monitor(page);
  await page.goto(`${live}/`, { waitUntil: 'networkidle' });
  const invoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-104,Northstar Studio,2026-08-01,850.00,USD\nINV-105,Atlas Works,2026-08-03,425.50,USD\nINV-106,Cedar Design,2026-08-05,99.00,USD';
  const payments = 'date,amount,description,currency\n2026-08-08,850.00,Payment INV-104 Northstar,USD\n2026-08-11,425.50,Transfer INV-105 Atlas,USD\n2026-08-12,73.25,Unrelated deposit,USD';
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'august-invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'august-payments.csv', mimeType: 'text/csv', buffer: Buffer.from(payments) });
  await page.getByRole('button', { name: 'Import payments' }).click();
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-105/ });
  const manualPaymentValue = await dialog.locator('select[name="transactionId"] option').filter({ hasText: 'INV-105 Atlas' }).getAttribute('value');
  await dialog.getByLabel('Payment').selectOption(manualPaymentValue ?? '');
  await dialog.getByLabel('Why this is the right match').fill('Checked against the client remittance email');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  const reportEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  const report = await reportEvent;
  const reportPath = await report.path();
  const reportText = reportPath ? await readFile(reportPath, 'utf8') : '';
  const stored = await page.evaluate(async () => new Promise((resolve, reject) => {
    const open = indexedDB.open('matchbox-ledger', 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const request = open.result.transaction('workspace', 'readonly').objectStore('workspace').get('current');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    };
  }));
  await page.reload({ waitUntil: 'networkidle' });
  const persistedNote = await page.getByText('Checked against the client remittance email').isVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const pwaOnline = await page.evaluate(async () => ({
    controller: navigator.serviceWorker.controller?.scriptURL,
    caches: await caches.keys(),
    registrationScope: (await navigator.serviceWorker.getRegistration())?.scope,
  }));
  await context.setOffline(true);
  await page.reload();
  const offline = {
    banner: await page.getByText('You are offline — matching still works').isVisible(),
    persistedNote: await page.getByText('Checked against the client remittance email').isVisible(),
  };
  result.workflow = {
    reportName: report.suggestedFilename(),
    reportLines: reportText.trim().split('\n'),
    storedCounts: {
      invoices: stored.invoices.length,
      payments: stored.transactions.length,
      matches: stored.matches.length,
      retainedSources: stored.sourceFiles?.length ?? 0,
    },
    persistedNote,
    pwaOnline,
    offline,
    consoleErrors: events.consoleErrors,
    pageErrors: events.pageErrors,
    origins: [...new Set(events.requests.map((url) => new URL(url).origin))],
  };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  const events = monitor(page);
  await page.goto(`${live}/`);
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoice.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice_id,amount\nINV-9,100') });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from('date,amount,description\n2026-99-99,100,test') });
  let invalidMessage = '';
  page.once('dialog', async (dialog) => {
    invalidMessage = dialog.message();
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: 'Import payments' }).click();
  const mappingStillVisible = await page.getByRole('heading', { name: 'invalid.csv' }).isVisible();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'recovered.csv', mimeType: 'text/csv', buffer: Buffer.from('date,amount,description\n2026-08-09,100,INV-9 transfer') });
  await page.getByRole('button', { name: 'Import payments' }).click();
  const recovered = await page.getByText('Strong suggestion', { exact: true }).isVisible();

  let largeMessage = '';
  page.once('dialog', async (dialog) => {
    largeMessage = dialog.message();
    await dialog.dismiss();
  });
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'too-large.csv', mimeType: 'text/csv', buffer: Buffer.alloc(5_000_001, 65) });
  result.invalidRecovery = { invalidMessage, mappingStillVisible, recovered, largeMessage, consoleErrors: events.consoleErrors, pageErrors: events.pageErrors };
  await context.close();
}

{
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${live}/`);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(20);
  const firstFocus = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    outline: getComputedStyle(document.activeElement).outline,
    outlineWidth: getComputedStyle(document.activeElement).outlineWidth,
    boxShadow: getComputedStyle(document.activeElement).boxShadow,
  }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(100);
  const afterSkip = await page.evaluate(() => ({ hash: location.hash, active: document.activeElement?.id || document.activeElement?.tagName }));
  await page.keyboard.press('Tab');
  const afterSkipNextFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
  const plus = page.getByRole('button', { name: 'Get Plus' });
  await plus.focus();
  await page.keyboard.press('Enter');
  const dialogFocused = await page.evaluate(() => document.querySelector('#license-dialog')?.contains(document.activeElement));
  await page.keyboard.press('Escape');
  const focusReturned = await plus.evaluate((element) => document.activeElement === element);
  const motion = await page.evaluate(() => {
    const values = [...document.querySelectorAll('*')].flatMap((element) => {
      const style = getComputedStyle(element);
      return [style.transitionDuration, style.animationDuration];
    });
    return [...new Set(values)];
  });
  result.keyboardMotion = { firstFocus, afterSkip, afterSkipNextFocus, dialogFocused, focusReturned, motion };
  await context.close();
}

{
  const checks = [];
  for (const viewport of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    for (const path of ['/', '/demo', '/privacy/', '/terms/']) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const events = monitor(page);
      const response = await page.goto(`${live}${path}`, { waitUntil: 'networkidle' });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      checks.push({
        viewport: viewport.name,
        path,
        status: response?.status(),
        h1Count: await page.locator('h1').count(),
        seriousCritical: axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')).map((violation) => ({ id: violation.id, impact: violation.impact })),
        allViolationCount: axe.violations.length,
        consoleErrors: events.consoleErrors,
        pageErrors: events.pageErrors,
      });
      await context.close();
    }
  }
  result.accessibility = checks;
}

await browser.close();
console.log(JSON.stringify(result, null, 2));
