const CACHE_NAME = 'basma-cache-v2.2';
const ASSETS_TO_CACHE = [
  'index.html',
  'app.css',
  'app.js',
  'icon.svg',
  'manifest.json'
];

// Install Event - Caching basic local files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Cleaning old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve cached assets when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests and skip Supabase/API calls
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Fetch dynamic updates in the background (Stale-While-Revalidate)
          fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* Ignore network update errors when offline */});
          
          return cachedResponse;
        }

        // Fallback to network
        return fetch(event.request).then(networkResponse => {
          // Cache newly requested assets on the fly if they are static resources
          if (networkResponse && networkResponse.status === 200 && (
              event.request.url.includes('fonts.googleapis.com') ||
              event.request.url.includes('fonts.gstatic.com') ||
              event.request.url.includes('cdnjs.cloudflare.com')
          )) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        });
      }).catch(() => {
        // Offline fallback for html pages
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('index.html');
        }
      })
  );
});
