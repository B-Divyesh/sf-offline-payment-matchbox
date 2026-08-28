import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const requests = [];
const errors = [];
page.on('request', (request) => requests.push(request.url()));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto('https://offline-payment-matchbox.sociobot.in/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Get Plus' }).click();
const dialog = page.getByRole('dialog', { name: 'Matchbox Plus' });
const checkoutHref = await dialog.getByRole('link', { name: 'Buy Matchbox Plus' }).getAttribute('href');
await dialog.getByLabel('Have a license? Paste it here').fill('qa-invalid-license-verification-4');
const verifyResponsePromise = page.waitForResponse((response) => response.url().includes('/verify?license='));
await dialog.getByRole('button', { name: 'Restore purchase' }).click();
const verifyResponse = await verifyResponsePromise;
const verifyBody = await verifyResponse.json();
await page.waitForTimeout(100);
const afterRestore = await page.evaluate(() => ({
  dialogOpen: document.querySelector('#license-dialog')?.hasAttribute('open'),
  noticeText: document.querySelector('#license-dialog .notice')?.textContent?.trim(),
  noticeVisible: Boolean(document.querySelector('#license-dialog .notice')?.getClientRects().length),
  activeText: document.activeElement?.textContent?.trim(),
}));
const storage = await page.evaluate(() => ({
  token: localStorage.getItem('sb_license:offline-payment-matchbox'),
  verdict: localStorage.getItem('sb_license:offline-payment-matchbox:verdict'),
}));
const verifyRequestsBeforeReload = requests.filter((url) => url.includes('/verify?license=')).length;
await page.reload({ waitUntil: 'networkidle' });
const verifyRequestsAfterReload = requests.filter((url) => url.includes('/verify?license=')).length;

console.log(JSON.stringify({
  checkoutHref,
  verifyStatus: verifyResponse.status(),
  verifyBody,
  verifyRequest: requests.find((url) => url.includes('/verify?license=')),
  verifyRequestsBeforeReload,
  verifyRequestsAfterReload,
  storage,
  afterRestore,
  errors,
}, null, 2));

await context.close();
await browser.close();
