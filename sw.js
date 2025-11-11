const CACHE_NAME = 'korean-trainer-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  // If you host icons locally
  './icons/icon-192.png',
  './icons/icon-512.png',
  // External assets you want cached after first load:
  'https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.5.2/flowbite.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@600;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(res => {
          // Clone and store in cache for future offline use
          const resClone = res.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(req, resClone))
            .catch(() => {});
          return res;
        })
        .catch(() => {
          // Fallback: if offline and no cache
          if (req.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
