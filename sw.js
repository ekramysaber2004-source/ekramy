const CACHE_NAME = 'basma-cache-v2.4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.css',
  '/app.js',
  '/icon.svg',
  '/manifest.json'
];

// Install Event - Cache all assets
self.addEventListener('install', event => {
  // Force immediate activation (skip waiting)
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell assets v2.4');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => console.warn('[SW] Cache addAll failed (some assets may not be cached):', err))
  );
});

// Activate Event - Clean up old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activated v2.4, claiming all clients');
      return self.clients.claim();
    })
  );
});

// Fetch Event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip Supabase API calls (always go to network)
  if (event.request.url.includes('supabase.co') ||
      event.request.url.includes('supabase.io') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('cdnjs.cloudflare.com') ||
      event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  // For navigation requests (opening the app), use network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache a fresh copy
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline: serve cached index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // For other static assets: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});
