const CACHE_NAME = 'my-pwa-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts/index.js',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate immediately after install
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activate');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Control all pages
});

// Fetch requests
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
