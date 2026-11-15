// Run: node tests/side-scroll-midgame-scenery.test.cjs
// Structural check only: this does not prove a rendered mobile frame.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const html=fs.readFileSync(path.join(root,'pawcade-side-scroll.html'),'utf8');
const slots=[
  {
    "url": "assets/scenes/waterfall-climb/stage-02-castle-banquet-lifts.svg",
    "stage": 1,
    "x": 654,
    "y": 61,
    "w": 150,
    "h": 135,
    "groundTop": 196
  },
  {
    "url": "assets/scenes/waterfall-climb/stage-03-ocean-laboratory-current.svg",
    "stage": 2,
    "x": 729,
    "y": 73,
    "w": 150,
    "h": 135,
    "groundTop": 208
  },
  {
    "url": "assets/scenes/lantern-festival/stage-02-footrace-ridge-speed.svg",
    "stage": 1,
    "x": 752,
    "y": 83,
    "w": 150,
    "h": 135,
    "groundTop": 218
  },
  {
    "url": "assets/scenes/lantern-festival/stage-03-cavern-treasure-blocks.svg",
    "stage": 2,
    "x": 639,
    "y": 58,
    "w": 150,
    "h": 135,
    "groundTop": 193
  },
  {
    "url": "assets/scenes/crystal-polarity/stage-02-laboratory-shaft-ceiling.svg",
    "stage": 1,
    "x": 694,
    "y": 191,
    "w": 150,
    "h": 135,
    "groundTop": 326
  },
  {
    "url": "assets/scenes/crystal-polarity/stage-03-warp-grid-bridge.svg",
    "stage": 2,
    "x": 764,
    "y": 191,
    "w": 150,
    "h": 135,
    "groundTop": 326
  },
  {
    "url": "assets/scenes/stage-beat/stage-02-backbeat-blocks-steps.svg",
    "stage": 1,
    "x": 1185,
    "y": 130,
    "w": 142,
    "h": 135,
    "groundTop": 265
  },
  {
    "url": "assets/scenes/stage-beat/stage-03-polarity-pulse-spikes.svg",
    "stage": 2,
    "x": 24,
    "y": 191,
    "w": 150,
    "h": 135,
    "groundTop": 326
  },
  {
    "url": "assets/scenes/quarry-rescue/stage-02-industrial-base-turrets.svg",
    "stage": 1,
    "x": 434,
    "y": 117,
    "w": 150,
    "h": 135,
    "groundTop": 252
  },
  {
    "url": "assets/scenes/quarry-rescue/stage-03-canopy-wires-cable.svg",
    "stage": 2,
    "x": 554,
    "y": 141,
    "w": 150,
    "h": 135,
    "groundTop": 276
  }
];
assert.equal(slots.length,10);
assert.equal(new Set(slots.map(s=>s.url)).size,10);
assert.equal(new Set(slots.map(s=>s.url.split('/')[2])).size,5);
for(const slot of slots){
  const art=fs.readFileSync(path.join(root,slot.url),'utf8');
  assert(art.startsWith('<svg '),'File needs actual SVG artwork '+slot.url);
  assert(art.includes('viewBox="0 0 '+slot.w+' '+slot.h+'"'),slot.url+' viewbox mismatch');
  assert(!/<script\b|<foreignObject\b|<image\b|<filter\b|(?:xlink:)?href=/i.test(art),'Unexpected SVG external/active element');
  assert(slot.y+slot.h===slot.groundTop,'Prop must sit on stage support '+slot.url);
  assert(src.includes("'"+slot.url+"', "+slot.stage+", "+slot.x+", "+slot.y+", "+slot.w+", "+slot.h+"]"),'Runtime position/path mismatch '+slot.url);
  assert(sw.includes("'"+slot.url+"'"),'Not in offline cache: '+slot.url);
}
assert(src.includes('middleStageSetpieces[index - 5]'),'No cross-game setpiece sharing');
assert(src.includes('stageStarts[slot.stage] + slot.x'),'Stage-local art offset lost');
assert(src.includes('if (sections <= slot.stage || !slot.image.naturalWidth) continue;'),'Missing asset guard lost');
assert(src.includes('if (artX + slot.w >= camera && artX <= camera + width)'),'Culling lost');
const assetVersion = html.split('pawcade-side-scroll-no-badges-v2.js?v=')[1]?.split('"')[0];
assert(assetVersion && sw.includes('pawcade-side-scroll-no-badges-v2.js?v='+assetVersion),'Cache-buster mismatch');
console.log('PASS: five distinct games, ten original stage 2/3 illustrated landmarks with correct art placements');
