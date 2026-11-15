// Run: node tests/side-scroll-twilight-scenery.test.cjs
// Tests source integration; visual fidelity and hardware playback require separate review.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/pawcade-side-scroll-no-badges-v2.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'pawcade-side-scroll.html'), 'utf8');
const slots = [
  {
    "path": "assets/scenes/sunset-wind-sail/stage-02-tree-village-glide.svg",
    "game": "sunset-wind-sail",
    "stage": 1,
    "x": 554,
    "y": 126,
    "w": 150,
    "h": 135,
    "top": 261
  },
  {
    "path": "assets/scenes/sunset-wind-sail/stage-03-sunken-palace-ring.svg",
    "game": "sunset-wind-sail",
    "stage": 2,
    "x": 434,
    "y": 100,
    "w": 150,
    "h": 135,
    "top": 235
  },
  {
    "path": "assets/scenes/cloud-city/stage-02-dream-passage-dash.svg",
    "game": "cloud-city",
    "stage": 1,
    "x": 545,
    "y": 134,
    "w": 150,
    "h": 135,
    "top": 269
  },
  {
    "path": "assets/scenes/cloud-city/stage-03-storm-lodge-traps.svg",
    "game": "cloud-city",
    "stage": 2,
    "x": 587,
    "y": 141,
    "w": 150,
    "h": 135,
    "top": 276
  },
  {
    "path": "assets/scenes/thunder-harbor/stage-02-sunken-treasure-bridge.svg",
    "game": "thunder-harbor",
    "stage": 1,
    "x": 636,
    "y": 107,
    "w": 150,
    "h": 135,
    "top": 242
  },
  {
    "path": "assets/scenes/thunder-harbor/stage-03-lava-yard-pogo.svg",
    "game": "thunder-harbor",
    "stage": 2,
    "x": 484,
    "y": 153,
    "w": 150,
    "h": 135,
    "top": 288
  },
  {
    "path": "assets/scenes/autumn-trail/stage-02-falling-rock-ravine-traps.svg",
    "game": "autumn-trail",
    "stage": 1,
    "x": 560,
    "y": 157,
    "w": 150,
    "h": 135,
    "top": 292
  },
  {
    "path": "assets/scenes/autumn-trail/stage-03-roundstone-cave-steps.svg",
    "game": "autumn-trail",
    "stage": 2,
    "x": 614,
    "y": 99,
    "w": 150,
    "h": 135,
    "top": 234
  },
  {
    "path": "assets/scenes/inverted-observatory/stage-02-burrow-network-crawl.svg",
    "game": "inverted-observatory",
    "stage": 1,
    "x": 634,
    "y": 115,
    "w": 150,
    "h": 135,
    "top": 250
  },
  {
    "path": "assets/scenes/inverted-observatory/stage-03-thermal-galleries-traps.svg",
    "game": "inverted-observatory",
    "stage": 2,
    "x": 814,
    "y": 191,
    "w": 150,
    "h": 135,
    "top": 326
  }
];
assert.equal(slots.length,10);
assert.equal(new Set(slots.map(s=>s.path)).size,10, 'Each scene must be original');
assert.equal(new Set(slots.map(s=>s.game)).size,5, 'Cover five distinct games');
for (const slot of slots) {
  const image = fs.readFileSync(path.join(root,slot.path), 'utf8');
  assert(image.includes('viewBox="0 0 '+slot.w+' '+slot.h+'"'), 'Artwork dimensions: '+slot.path);
  assert(image.includes('linearGradient') && image.includes('radialGradient'), 'Dimensional lighting: '+slot.path);
  assert(!/<script\b|<image\b|<foreignObject\b|<filter\b|(?:xlink:)?href=/i.test(image), 'Disallow external or active SVG: '+slot.path);
  assert.equal(slot.y+slot.h,slot.top,'Prop must align with stage's documented floor: '+slot.path);
  assert(source.includes("'"+slot.path+"', "+slot.stage+", "+slot.x+", "+slot.y+", "+slot.w+", "+slot.h+"]"),'Source slot mapping: '+slot.path);
  assert(sw.includes("'"+slot.path+"'"),'Offline cache: '+slot.path);
}
assert(source.includes('twilightStageSetpieces[index - 10]'),'Game-specific art selection');
assert(source.includes('stageStarts[slot.stage] + slot.x'),'Local-to-world positioning');
assert(source.includes('if (sections <= slot.stage || !slot.image.naturalWidth) continue;'),'Image load and stage guard');
assert(source.includes('if (artX + slot.w >= camera && artX <= camera + width)'),'Camera culling');
const assetVersion = html.split('pawcade-side-scroll-no-badges-v2.js?v=')[1]?.split('"')[0];
assert(assetVersion && sw.includes('pawcade-side-scroll-no-badges-v2.js?v='+assetVersion), 'Cache buster parity');
console.log('PASS: ten separate original 2.5D depth landmarks mapped to games 11-15, stages 2-3');
