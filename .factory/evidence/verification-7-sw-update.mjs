import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
let serveUpdate = false;
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp' };
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    let target = normalize(join(root, pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')));
    if (!target.startsWith(root)) throw new Error('invalid path');
    if ((await stat(target).catch(() => null))?.isDirectory()) target = join(target, 'index.html');
    let body = await readFile(target);
    if (pathname === '/sw.js' && serveUpdate) body = Buffer.from(body.toString().replaceAll('matchbox-v9', 'matchbox-v10'));
    response.writeHead(200, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream', 'Cache-Control': pathname === '/sw.js' ? 'no-cache' : 'public, max-age=0' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('server did not start');
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(origin, { waitUntil: 'networkidle' });
await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
const before = await page.evaluate(async () => ({ controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() }));
serveUpdate = true;
await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
await page.locator('#update-toast').waitFor({ state: 'visible' });
await page.waitForFunction(async () => (await caches.keys()).includes('matchbox-v10'));
const prompt = await page.locator('#update-toast').innerText();
await page.getByRole('button', { name: 'Reload' }).click();
await page.waitForFunction(async () => {
  const keys = await caches.keys();
  return keys.includes('matchbox-v10') && !keys.includes('matchbox-v9');
});
const after = await page.evaluate(async () => ({
  h1: document.querySelector('h1')?.textContent?.trim(),
  caches: await caches.keys(),
  controller: navigator.serviceWorker.controller?.scriptURL,
}));
console.log(JSON.stringify({ before, prompt, after, errors }, null, 2));
if (errors.length || !after.caches.includes('matchbox-v10') || after.caches.includes('matchbox-v9')) process.exitCode = 1;
await browser.close();
await new Promise((resolve) => server.close(resolve));
