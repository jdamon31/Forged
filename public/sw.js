// Minimal service worker — required for PWA installability on iOS.
// Caching and offline support can be community-requested features.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)))
