// CHANGE THIS every deployment
const CACHE_VERSION = "v7.1.1";

// Final cache name
const CACHE_NAME = `kotrainer-${CACHE_VERSION}`;

// Assets to precache
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.ico',

  // External assets (cached after 1st load)
  'https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.5.2/flowbite.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@600;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
];

// INSTALL → save latest cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
  );
  // NO auto skipWaiting here
});

self.addEventListener('message', event => {
  if (event.data?.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// ACTIVATE → delete ALL old caches
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
  self.clients.claim();
});

// FETCH → cache-first with network fallback
self.addEventListener('fetch', event => {
  const req = event.request;

  // Ignore POST, PUT, etc.
  if (req.method !== 'GET') return;

  if (req.url.endsWith('/updates.json')) {
    // always fetch fresh
    event.respondWith(fetch(req));
    return;
  }
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone);
          });
          return res;
        })
        .catch(() => {
          // If offline and missing
          if (req.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
