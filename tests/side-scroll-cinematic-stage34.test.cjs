// Standalone: node tests/side-scroll-cinematic-stage34.test.cjs
// Source-level safety only; not visual playback or Android FPS certification.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const src = fs.readFileSync(path.join(root,'assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
const sw = fs.readFileSync(path.join(root,'sw.js'),'utf8');
const html = fs.readFileSync(path.join(root,'pawcade-side-scroll.html'),'utf8');
const scenes = [
  {
    "path": "assets/scenes/ember-foundry/stage-03-cinder-hills-spring.svg",
    "stage": 3,
    "x": 714,
    "y": 154,
    "w": 150,
    "h": 135
  },
  {
    "path": "assets/scenes/ember-foundry/stage-04-suspended-bridges-bridge.svg",
    "stage": 4,
    "x": 426,
    "y": 147,
    "w": 138,
    "h": 135
  },
  {
    "path": "assets/scenes/moonlit-library/stage-03-airship-platforms-lifts.svg",
    "stage": 3,
    "x": 423,
    "y": 147,
    "w": 150,
    "h": 135
  },
  {
    "path": "assets/scenes/moonlit-library/stage-04-generator-blackout-dodge.svg",
    "stage": 4,
    "x": 709,
    "y": 191,
    "w": 150,
    "h": 135
  },
  {
    "path": "assets/scenes/coral-courier/stage-03-undercaves-kelp.svg",
    "stage": 3,
    "x": 649,
    "y": 95,
    "w": 150,
    "h": 135
  },
  {
    "path": "assets/scenes/coral-courier/stage-04-thermal-vents-dodge.svg",
    "stage": 4,
    "x": 24,
    "y": 191,
    "w": 150,
    "h": 135
  },
  {
    "path": "assets/scenes/clocktower-relay/stage-03-sunken-ruins-bridge.svg",
    "stage": 3,
    "x": 599,
    "y": 83,
    "w": 150,
    "h": 135
  },
  {
    "path": "assets/scenes/clocktower-relay/stage-04-pinball-hall-spring.svg",
    "stage": 4,
    "x": 785,
    "y": 39,
    "w": 145,
    "h": 135
  },
  {
    "path": "assets/scenes/seed-garden/stage-03-sunset-galley-barrels.svg",
    "stage": 3,
    "x": 584,
    "y": 140,
    "w": 150,
    "h": 135
  },
  {
    "path": "assets/scenes/seed-garden/stage-04-flooded-locker-current.svg",
    "stage": 4,
    "x": 651,
    "y": 104,
    "w": 150,
    "h": 135
  }
];
assert.equal(scenes.length,10);
assert.equal(new Set(scenes.map(s=>s.path)).size,10,'No cross-game art reuse');
for (const scene of scenes) {
  const data=fs.readFileSync(path.join(root,scene.path),'utf8');
  assert(data.startsWith('<svg '),scene.path+' should be an SVG');
  assert(data.includes('viewBox="0 0 '+scene.w+' '+scene.h+'"'),scene.path+' exact dimensions');
  assert(!/<script\\b|<foreignObject\\b|<image\\b|<filter\\b|(?:xlink:)?href=/i.test(data),'No active/remote/heavy SVG elements');
  assert(src.includes("'"+scene.path+"'"),scene.path+' linked into renderer');
  assert(sw.includes("'"+scene.path+"'"),scene.path+' cached for offline');
  assert(src.includes("'"+scene.path+"', "+scene.x+", "+scene.y+", "+scene.w+", "+scene.h+"]"),'Placement missing '+scene.path);
}
assert(src.includes('stage:offset + 2'),'Use stages 3/4 only');
assert(src.includes('stageStarts[slot.stage] + slot.x'),'Stage-local offsets');
assert(src.includes('if (sections <= slot.stage || !slot.image.naturalWidth) continue;'),'Avoid drawing unloaded images');
assert(!src.includes('slot.image.getImageData'),'No new expensive pixel readback');
assert(html.includes('v=live-3d-10-cinematic-34-20261114') && sw.includes('v=live-3d-10-cinematic-34-20261114'),'Version parity');
console.log('PASS: 10 original non-interactive scenic assets integrated across stages 3/4, games 1-5');
