const VERSION = 'matchbox-v5';
const PAGES = ['/', '/privacy/', '/terms/'];
const SHELL = ['/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/assets/matchbox-trays.webp', '/assets/app.js', '/assets/app.css', '/assets/legal.css'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const cacheFresh = async (path) => {
      const response = await fetch(new Request(path, { cache: 'reload' }));
      if (!response.ok) throw new Error(`Could not cache ${path}`);
      await cache.put(path, response.clone());
      return response;
    };
    for (const path of SHELL) await cacheFresh(path);
    const assets = new Set();
    for (const path of PAGES) {
      const response = await cacheFresh(path);
      const source = await response.text();
      for (const match of source.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) assets.add(match[1]);
    }
    for (const path of assets) await cacheFresh(path);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('matchbox-') && key !== VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request, { ignoreVary: true })) || (await caches.match('/', { ignoreVary: true })) || caches.match('/offline.html', { ignoreVary: true })));
    return;
  }
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(VERSION).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
