// Run: node tests/side-scroll-latemid-scenery.test.cjs
// Static staging checks; rendered/phone performance must be tested separately.
'use strict';
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(root,'assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const html=fs.readFileSync(path.join(root,'pawcade-side-scroll.html'),'utf8');
const slots=[
  {
    "path": "assets/scenes/bamboo-village/stage-02-water-vein-bash.svg",
    "game": "bamboo-village",
    "st": 2,
    "stage": 1,
    "x": 388,
    "y": 117,
    "w": 150,
    "h": 135,
    "top": 252
  },
  {
    "path": "assets/scenes/bamboo-village/stage-03-flood-escape-tower.svg",
    "game": "bamboo-village",
    "st": 3,
    "stage": 2,
    "x": 463,
    "y": 136,
    "w": 150,
    "h": 135,
    "top": 271
  },
  {
    "path": "assets/scenes/steamworks/stage-02-boiler-frogs-dodge.svg",
    "game": "steamworks",
    "st": 2,
    "stage": 1,
    "x": 352,
    "y": 143,
    "w": 150,
    "h": 135,
    "top": 278
  },
  {
    "path": "assets/scenes/steamworks/stage-03-garden-machinery-dodge.svg",
    "game": "steamworks",
    "st": 3,
    "stage": 2,
    "x": 380,
    "y": 114,
    "w": 135,
    "h": 135,
    "top": 249
  },
  {
    "path": "assets/scenes/snow-village/stage-02-palace-dungeon-traps.svg",
    "game": "snow-village",
    "st": 2,
    "stage": 1,
    "x": 764,
    "y": 111,
    "w": 150,
    "h": 135,
    "top": 246
  },
  {
    "path": "assets/scenes/snow-village/stage-03-cave-approach-bridge.svg",
    "game": "snow-village",
    "st": 3,
    "stage": 2,
    "x": 517,
    "y": 135,
    "w": 150,
    "h": 135,
    "top": 270
  },
  {
    "path": "assets/scenes/canyon-crossing/stage-02-guard-corridor-steps.svg",
    "game": "canyon-crossing",
    "st": 2,
    "stage": 1,
    "x": 392,
    "y": 120,
    "w": 150,
    "h": 135,
    "top": 255
  },
  {
    "path": "assets/scenes/canyon-crossing/stage-03-collapsing-hall-bridge.svg",
    "game": "canyon-crossing",
    "st": 3,
    "stage": 2,
    "x": 503,
    "y": 155,
    "w": 150,
    "h": 135,
    "top": 290
  },
  {
    "path": "assets/scenes/submarine-dock/stage-02-perimeter-sweep-dodge.svg",
    "game": "submarine-dock",
    "st": 2,
    "stage": 1,
    "x": 510,
    "y": 115,
    "w": 150,
    "h": 135,
    "top": 250
  },
  {
    "path": "assets/scenes/submarine-dock/stage-03-carrier-climb-tower.svg",
    "game": "submarine-dock",
    "st": 3,
    "stage": 2,
    "x": 563,
    "y": 148,
    "w": 150,
    "h": 135,
    "top": 283
  }
];
assert.equal(slots.length,10);
assert.equal(new Set(slots.map(x=>x.path)).size,10);
assert.equal(new Set(slots.map(x=>x.game)).size,5);
for(const p of slots){
  const svg=fs.readFileSync(path.join(root,p.path),'utf8');
  assert(svg.startsWith('<svg xmlns=') && svg.includes('viewBox="0 0 '+p.w+' '+p.h+'"'),p.path+' viewbox');
  assert(svg.includes('linearGradient')&&svg.includes('radialGradient'),p.path+' shaded depth');
  assert(!/<script\b|<foreignObject\b|<image\b|<filter\b|(?:xlink:)?href=/i.test(svg),'No remote or active SVG content');
  assert.equal(p.y+p.h,p.top,'Exact stage floor support: '+p.path);
  assert(src.includes("'"+p.path+"', "+p.stage+", "+p.x+", "+p.y+", "+p.w+", "+p.h+"]"),p.path+' renderer placement');
  assert(sw.includes("'"+p.path+"'"),p.path+' offline cache');
}
assert(src.includes('lateMiddleStageSetpieces[index - 15]'),'Per-game art isolation');
assert(src.includes('stageStarts[slot.stage] + slot.x'),'Stage-local offsets');
assert(src.includes('if (sections <= slot.stage || !slot.image.naturalWidth) continue;'),'Image guard');
assert(src.includes('if (artX + slot.w >= camera && artX <= camera + width)'),'Culling');
const version=html.split('pawcade-side-scroll-no-badges-v2.js?v=')[1]?.split('"')[0];
assert(version&&sw.includes('pawcade-side-scroll-no-badges-v2.js?v='+version),'Cache version parity');
console.log('PASS: original stage 2/3 illustrative art in five independently designed games (16–20)');
