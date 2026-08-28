import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
let updateVersion = false;
const types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
};

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    let relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    let target = normalize(join(root, relative));
    if (!target.startsWith(root)) throw new Error('invalid path');
    if ((await stat(target).catch(() => null))?.isDirectory()) target = join(target, 'index.html');
    let body = await readFile(target);
    if (pathname === '/sw.js' && updateVersion) body = Buffer.from(body.toString().replaceAll('matchbox-v6', 'matchbox-v7'));
    response.writeHead(200, {
      'Content-Type': types[extname(target)] ?? 'application/octet-stream',
      'Cache-Control': pathname === '/sw.js' ? 'no-cache' : 'public, max-age=0',
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(origin, { waitUntil: 'networkidle' });
await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
const before = await page.evaluate(async () => ({
  controller: navigator.serviceWorker.controller?.scriptURL,
  caches: await caches.keys(),
}));

updateVersion = true;
await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
await page.locator('#update-toast').waitFor({ state: 'visible' });
await page.waitForFunction(async () => (await caches.keys()).includes('matchbox-v7'));
const after = await page.evaluate(async () => ({
  toast: document.querySelector('#update-toast')?.textContent?.replace(/\s+/g, ' ').trim(),
  caches: await caches.keys(),
}));
await page.getByRole('button', { name: 'Reload' }).click();
await page.waitForLoadState('networkidle');
await page.waitForFunction(async () => {
  const keys = await caches.keys();
  return keys.includes('matchbox-v7') && !keys.includes('matchbox-v6');
});
const reloaded = await page.evaluate(async () => ({
  controller: navigator.serviceWorker.controller?.scriptURL,
  caches: await caches.keys(),
  h1: document.querySelector('h1')?.textContent?.trim(),
}));

console.log(JSON.stringify({ before, after, reloaded, errors }, null, 2));
await context.close();
await browser.close();
await new Promise((resolve) => server.close(resolve));
