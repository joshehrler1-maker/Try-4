/* Static public content only. Never cache accounts, money, or private operations. */
'use strict';
const CACHE = 'try4-public-v4-shared-hero-models';
const FILES = ['assets/super-paw-rig.js','assets/whisker-luna-master.webp','assets/heroes-master.json','hero-models.html','approved-voices.js','voice-test.html','index.html','studio.html','studio.css','studio.js','core.js','3d-games.html','super-paw-3d.html','cross-platform.css','cross-platform.js','app.js','manifest.webmanifest','app-icon.svg','offline.html','readiness.html','readiness.js','release-policy.json','super-paw-heroes.png','super-paw-wallpaper.png'];
const allowed = new Set(FILES.map(file => new URL(file, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
// Activate on the next visit, so an active game is never reloaded mid-session.
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('try4-public-') && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !allowed.has(event.request.url)) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(event.request);
    if (saved) return saved;
    if (event.request.mode === 'navigate') return cache.match('offline.html');
    return Response.error();
  }));
});

