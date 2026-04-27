const CACHE_NAME = 'admin-cache-v1';
const STATIC_CACHE_NAME = 'static-cache-v1';
const API_CACHE_NAME = 'api-cache-v1';

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/admin/collaborators',
  '/api/admin/services',
  '/api/admin/media',
  '/api/admin/external-profiles',
  '/api/admin/seo',
  '/api/admin/hero',
  '/api/admin/statistics',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests - Network First with Cache Fallback (stale-while-revalidate)
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        try {
          // Try network first with credentials
          const networkResponse = await fetch(event.request, {
            credentials: 'include'
          });

          // Clone the response before caching
          const responseToCache = networkResponse.clone();

          // Cache the response
          cache.put(event.request, responseToCache);

          console.log('[Service Worker] Cached API response:', event.request.url);
          return networkResponse;
        } catch (error) {
          // If network fails, try cache
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache (API):', event.request.url);
            return cachedResponse;
          }
          throw error;
        }
      })
    );
    return;
  }

  // For other requests, just fetch from network
  event.respondWith(fetch(event.request));
});

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Clearing all caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data && event.data.type === 'INVALIDATE_CACHE') {
    const urlToInvalidate = event.data.url;
    console.log('[Service Worker] Invalidating cache for:', urlToInvalidate);
    event.waitUntil(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.delete(urlToInvalidate);
      })
    );
  }

  if (event.data && event.data.type === 'SYNC_NOW') {
    console.log('[Service Worker] Syncing caches');
    event.waitUntil(
      Promise.all([
        caches.open(API_CACHE_NAME).then((cache) => {
          return API_ENDPOINTS.map((endpoint) => {
            // Construct full URL for the endpoint
            const url = new URL(endpoint, self.location.origin);
            return fetch(url, {
              credentials: 'include',
              headers: {
                'X-Caching-Enabled': 'true'
              }
            }).then((response) => {
              if (response.ok) {
                console.log('[Service Worker] Synced:', endpoint);
                return cache.put(url.toString(), response.clone());
              } else {
                console.error('[Service Worker] Sync failed for:', endpoint, 'Status:', response.status);
              }
            }).catch((error) => {
              console.error('[Service Worker] Sync failed for:', endpoint, error);
            });
          });
        })
      ])
    );
  }
});
