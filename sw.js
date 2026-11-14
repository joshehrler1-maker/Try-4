/* Static public content only. Never cache accounts, money, or private operations. */
'use strict';
const CACHE = 'try4-public-v59-audio-mix';
const FILES = ['crystal-professional.js','crystal-professional.css','face-review.js','assets/super-paw-rig.js','assets/whisker-luna-master.webp','assets/heroes-master.json','hero-models.html','approved-voices.js','voice-test.html','index.html','studio.html','studio.css','studio.js','core.js','3d-games.html','super-paw-3d.html','cross-platform.css','cross-platform.js','app.js','manifest.webmanifest','app-icon.svg','offline.html','readiness.html','readiness.js','release-policy.json','super-paw-heroes.png','super-paw-wallpaper.png'];
FILES.push("pawtopia-companions.html","pawtopia-arcade.html","crystal-regions/blue-tech-mines.html","crystal-regions/brown-earth-quarries.html","crystal-regions/cyan-frost-caverns.html","crystal-regions/green-life-groves.html","crystal-regions/indigo-shadow-tunnels.html","crystal-regions/orange-volcanic-depths.html","crystal-regions/pink-harmony-grotto.html","crystal-regions/purple-mystic-halls.html","crystal-regions/red-flame-caves.html","crystal-regions/yellow-light-ruins.html","assets/pawtopia-scenes.css","assets/scenes/pawtopia.webp","assets/scenes/cottage.webp","assets/scenes/arcade.webp","assets/scenes/catacombs.webp","assets/scenes/red-flame-caves.webp","assets/scenes/purple-mystic-halls.webp","assets/scenes/blue-tech-mines.webp","assets/scenes/green-life-groves.webp","assets/scenes/orange-volcanic-depths.webp","assets/scenes/cyan-frost-caverns.webp","assets/scenes/indigo-shadow-tunnels.webp","assets/scenes/yellow-light-ruins.webp","assets/scenes/pink-harmony-grotto.webp","assets/scenes/brown-earth-quarries.webp","assets/whisker-luna-master.png","assets/pawtopia-atlas.css","assets/crystal-regions.css","assets/pawtopia-save.js","assets/companion-cottage.css","assets/companion-cottage.js");
FILES.push("pawtopia-town.html","assets/pawtopia-town.js","assets/pawtopia-town.css");
FILES.push("assets/scenes/town-market.webp","assets/scenes/town-bank.webp","assets/scenes/town-well.webp","assets/scenes/town-trading.webp","assets/scenes/town-arena.webp","assets/scenes/town-gazette.webp");
FILES.push("assets/pawcade-visuals.css","assets/scenes/pawcade-flame.webp","assets/scenes/pawcade-mystic.webp");
FILES.push("assets/scenes/town-shop-map.webp");
FILES.push("assets/pawtopia-explore.css","assets/scenes/games-world-map.webp","assets/scenes/cottage-world-map.webp","assets/scenes/crystal-world-map.webp");
FILES.push(...['maine-coon','siamese','bengal','british-shorthair','ragdoll','sphynx'].map(breed => 'assets/scenes/adopt-' + breed + '.webp'));
FILES.push("assets/scenes/adopt-catalog-1.webp","assets/scenes/adopt-catalog-2.webp");
FILES.push("assets/pawtopia-home.css");
FILES.push("pawcade-collection.html","assets/pawcade-collection.js","assets/pawcade-collection.css");
FILES.push("assets/pawcade-directory.css");
FILES.push("pawcade-side-scroll.html","assets/pawcade-side-scroll.js","assets/pawcade-side-scroll.js?v=landing-edges","assets/pawcade-side-scroll.css","assets/pawcade-side-directory.css","assets/scenes/side-scroll-worlds.webp");
FILES.push(
  'assets/platform-worlds.js?v=opening-traversal-25',
  'assets/pawcade-side-scroll-no-badges-v2.js?v=audio-mix-v1',
  'assets/pawcade-side-scroll.css?v=gameplay-controls-v3',
  'assets/platform-worlds.js', 'assets/game-fullscreen.css', 'assets/game-fullscreen.js',
  'assets/touch-joystick.css', 'assets/touch-joystick.js', 'assets/touch-joystick.js?v=pointer-stability-v1', 'assets/whisker-luna-master.webp',
  ...['levels','sprites','enemies','heroes','terrain','stage-props','combat','landmarks','guardians']
    .map(name => 'assets/scenes/platform-' + name + '.webp')
);
const gamePage = new URL('pawcade-side-scroll.html', self.registration.scope);
const allowed = new Set(FILES.map(file => new URL(file, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
// Activate on the next visit, so an active game is never reloaded mid-session.
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('try4-public-') && key !== CACHE).map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const game = url.searchParams.get('game');
  const isGame = event.request.mode === 'navigate' &&
    url.origin === gamePage.origin && url.pathname === gamePage.pathname &&
    /^(?:[0-9]|1[0-9]|2[0-4])$/.test(game);
  const cacheKey = isGame ? gamePage.href : event.request.url;
  if (!allowed.has(cacheKey)) return;
  event.respondWith(fetch(event.request).catch(async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(cacheKey);
    if (saved) return saved;
    if (event.request.mode === 'navigate') return cache.match('offline.html');
    return Response.error();
  }));
});

