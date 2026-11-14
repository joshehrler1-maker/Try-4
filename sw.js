/* Static public content only. Never cache accounts, money, or private operations. */
'use strict';
const CACHE = 'try4-public-v75-first-real-3d-enemy-prototypes';
const FILES = ['crystal-professional.js','crystal-professional.css','face-review.js','assets/super-paw-rig.js','assets/whisker-luna-master.webp','assets/heroes-master.json','hero-models.html','approved-voices.js','voice-test.html','index.html','studio.html','studio.css','studio.js','core.js','3d-games.html','super-paw-3d.html','cross-platform.css','cross-platform.js','app.js','manifest.webmanifest','app-icon.svg','offline.html','readiness.html','readiness.js','release-policy.json','super-paw-heroes.png','super-paw-wallpaper.png'];
FILES.push("pawtopia-companions.html","pawtopia-arcade.html","crystal-regions/blue-tech-mines.html","crystal-regions/brown-earth-quarries.html","crystal-regions/cyan-frost-caverns.html","crystal-regions/green-life-groves.html","crystal-regions/indigo-shadow-tunnels.html","crystal-regions/orange-volcanic-depths.html","crystal-regions/pink-harmony-grotto.html","crystal-regions/purple-mystic-halls.html","crystal-regions/red-flame-caves.html","crystal-regions/yellow-light-ruins.html","assets/pawtopia-scenes.css","assets/scenes/pawtopia.webp","assets/scenes/cottage.webp","assets/scenes/arcade.webp","assets/scenes/catacombs.webp","assets/scenes/red-flame-caves.webp","assets/scenes/purple-mystic-halls.webp","assets/scenes/blue-tech-mines.webp","assets/scenes/green-life-groves.webp","assets/scenes/orange-volcanic-depths.webp","assets/scenes/cyan-frost-caverns.webp","assets/scenes/indigo-shadow-tunnels.webp","assets/scenes/yellow-light-ruins.webp","assets/scenes/pink-harmony-grotto.webp","assets/scenes/brown-earth-quarries.webp","assets/whisker-luna-master.png","assets/pawtopia-atlas.css","assets/crystal-regions.css","assets/pawtopia-save.js","assets/companion-cottage.css","assets/companion-cottage.js");
FILES.push('enemy-3d-prototype.html','assets/animation/enemy-3d-prototype-v1.js?v=3d-mesh-dc52ddc','enemy-motion-lab.html');
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
  'assets/platform-worlds.js?v=harbor-finale-e803531',
  'assets/animation/late-world-enemy-rigs-v1.js?v=enemy-rigs-fbe47754',
  'assets/animation/mid-world-enemy-rigs-v1.js?v=mid-rigs-6bc18e4',
  'assets/animation/cloud-trail-enemy-rigs-v1.js?v=cloud-rigs-c646b96',
  'assets/animation/five-world-enemy-rigs-v1.js?v=five-rigs-a1c28cd',
  'assets/animation/origin-world-enemy-rigs-v1.js?v=origin-rigs-6e49e50',
  'assets/pawcade-side-scroll-no-badges-v2.js?v=origin-enemies-eb233b2',
  'assets/pawcade-side-scroll.css?v=landscape-controls-68386cd',
  'assets/platform-worlds.js', 'assets/game-fullscreen.css', 'assets/game-fullscreen.js',
  'assets/touch-joystick.css', 'assets/touch-joystick.js', 'assets/touch-joystick.js?v=pointer-stability-v1', 'assets/whisker-luna-master.webp',
  ...['levels','sprites','enemies','heroes','terrain','stage-props','combat','landmarks','guardians']
    .map(name => 'assets/scenes/platform-' + name + '.webp')
);
// Game-specific Stage 1 illustrated landmarks. Keep each path separate so
// a player returning offline sees the same scene instead of a missing asset.
FILES.push(
  'assets/scenes/ember-foundry/cold-intake-beacon.svg',
  'assets/scenes/moonlit-library/atlas-lectern.svg',
  'assets/scenes/coral-courier/pearl-vent.svg',
  'assets/scenes/clocktower-relay/sunrise-gear.svg',
  'assets/scenes/seed-garden/seed-lantern.svg',
  'assets/scenes/waterfall-climb/spray-bridge-icefall.svg',
  'assets/scenes/lantern-festival/parade-gate-lantern.svg',
  'assets/scenes/crystal-polarity/inverted-intake-core.svg',
  'assets/scenes/stage-beat/sound-check-resonator.svg',
  'assets/scenes/quarry-rescue/lift-house-winch.svg',
  'assets/scenes/sunset-wind-sail/sunset-pier-wind-sock.svg',
  'assets/scenes/cloud-city/cloud-ferry-beacon.svg',
  'assets/scenes/thunder-harbor/breakwater-lightning-rod.svg',
  'assets/scenes/autumn-trail/feather-trail-marker.svg',
  'assets/scenes/inverted-observatory/lower-dome-star-lens.svg',
  'assets/scenes/bamboo-village/bamboo-gate-lantern.svg',
  'assets/scenes/steamworks/intake-valve-pressure-console.svg',
  'assets/scenes/snow-village/hearth-trail-ember-marker.svg',
  'assets/scenes/canyon-crossing/rope-bridge-winch.svg',
  'assets/scenes/submarine-dock/street-insertion-comms-post.svg',
  'assets/scenes/neon-circuit/lobby-sprint-photofinish-gate.svg',
  'assets/scenes/marble-temple/ruined-village-moon-seal.svg',
  'assets/scenes/swamp-ferry/jungle-relics-firefly-ferry-post.svg',
  'assets/scenes/sunflower-flight/grass-patch-pollen-vane.svg',
  'assets/scenes/starship-cargo/outpost-landing-rescue-pod-panel.svg',
  'assets/scenes/neon-circuit/dungeon-heat-overdrive-coil.svg',
  'assets/scenes/marble-temple/moon-gate-key-relief.svg',
  'assets/scenes/swamp-ferry/haunted-manor-ghost-ferry-lamp.svg',
  'assets/scenes/sunflower-flight/stitched-desert-thread-spool.svg',
  'assets/scenes/starship-cargo/mountain-convoy-supply-uplink.svg',
  'assets/scenes/neon-circuit/western-run-turbo-road-sign.svg',
  'assets/scenes/marble-temple/marble-chapel-moon-window.svg',
  'assets/scenes/swamp-ferry/gem-mines-crystal-winch.svg',
  'assets/scenes/sunflower-flight/threaded-treats-ribbon-wheel.svg',
  'assets/scenes/starship-cargo/river-crossing-coolant-valve.svg',
  'assets/scenes/neon-circuit/haunted-circuit-ghost-mirror.svg',
  'assets/scenes/marble-temple/inner-halls-balance-pendulum.svg',
  'assets/scenes/swamp-ferry/snowbound-pass-ice-ferry-marker.svg',
  'assets/scenes/sunflower-flight/felt-ocean-petal-buoy.svg',
  'assets/scenes/starship-cargo/city-siege-defense-repeater.svg',
  'assets/scenes/neon-circuit/factory-dash-power-lane-meter.svg',
  'assets/scenes/marble-temple/phantom-ship-moon-lantern.svg',
  'assets/scenes/swamp-ferry/moon-outpost-firefly-signal.svg',
  'assets/scenes/sunflower-flight/snowy-seams-warmth-stitch.svg',
  'assets/scenes/starship-cargo/factory-assault-safety-keypad.svg',
  'assets/scenes/neon-circuit/tower-reset-finish-clock.svg',
  'assets/scenes/marble-temple/silver-gallery-moon-key-throne.svg',
  'assets/scenes/swamp-ferry/return-to-manor-ferry-lighthouse.svg',
  'assets/scenes/sunflower-flight/patchwork-orbit-final-bloom.svg',
  'assets/scenes/starship-cargo/cargo-stronghold-rescue-pod-launch.svg'
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

