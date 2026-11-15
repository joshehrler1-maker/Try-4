// Source-only QA for Batch 19, not a substitute for Android gameplay/visual FPS.
// Run with node tests/side-scroll-stage45-batch19.test.cjs
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const registry=JSON.parse(read('assets/scenes/stage-4-5-placements-games-6-10.json'));
const runtime=read('assets/pawcade-side-scroll-no-badges-v2.js');
const html=read('pawcade-side-scroll.html');
const offline=read('sw.js');
const source=read('assets/platform-worlds.js');
const globals={window:{}};
vm.runInNewContext(source,globals,{timeout:2000});
const rooms=globals.window.pawtopiaRooms,style=globals.window.pawtopiaStyles;
assert.equal(registry.assets.length,10);
assert.equal(new Set(registry.assets.map(item=>item.path)).size,10);
assert.equal(new Set(registry.assets.map(item=>item.idx)).size,5);
const allowed=new Set([5,6,7,8,9]);
for(const item of registry.assets){
  assert(allowed.has(item.idx),'invalid game index '+item.idx);
  assert(item.st===4||item.st===5,'only stage 4/5 allowed in this batch');
  assert.equal(item.st-1,Math.floor(item.worldX/2200),
    'expected world x in stage window: '+item.game);
  assert.equal(item.worldX,(item.st-1)*2200+item.x,
    'world x should include actual stage offset');
  assert.equal(item.worldY,item.y);
  assert.equal(item.y+item.h,item.floor);
  assert.equal(item.pivotWorldX,item.worldX+item.w/2);
  assert.equal(item.pivotWorldY,item.floor);
  assert.equal(item.w>0&&item.h>0,true);
  assert.equal(style[item.idx][0],item.ref,'wrong counterpart assignment');
  const pieces=rooms[item.room];
  assert(Array.isArray(pieces),'missing gameplay stage '+item.room);
  const supports=pieces.filter(segment=>
    segment[1]===item.floor && segment[0]<=item.x &&
    segment[0]+segment[2]>=item.x+item.w);
  assert(supports.length>0,'visual pivot has no actual platform support '+item.path);
  assert(supports.some(piece=>(piece[3]||'floor')===item.surface),
    'wrong platform type or collider for '+item.path);
  const svg=read(item.path);
  assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert(svg.includes('viewBox="0 0 '+item.w+' '+item.h+'"'),item.path+' viewBox');
  assert(svg.includes('linearGradient')&&svg.includes('radialGradient'),
    item.path+' depth shading');
  assert(svg.length<11000,item.path+' unbounded mobile SVG payload');
  assert(!/<script\b|<filter\b|<foreignObject\b|<image\b|(?:xlink:)?href=/i.test(svg),
    item.path+' remote, active, or heavyweight SVG component');
  assert(svg.trimEnd().endsWith('</svg>'),item.path+' incomplete art');
  const expected="'"+item.path+"', "+(item.st-1)+", "+item.x+", "+item.y+
    ", "+item.w+", "+item.h+"]";
  assert(runtime.includes(expected),'stage-art draw placement missing '+item.path);
  assert(offline.includes("'"+item.path+"'"),'offline cache missing '+item.path);
}
for(let i=5;i<=9;i++){
  const owned=registry.assets.filter(item=>item.idx===i);
  assert.equal(owned.length,2,'each middle-five adventure should own two original props');
  assert.deepEqual(owned.map(x=>x.st),[4,5]);
  assert.notEqual(owned[0].path,owned[1].path);
}
assert(runtime.includes('middleLateStageSetpieces[index - 5]'),
  'game should load only its own stage props');
assert(runtime.includes('for (const slot of middleLateStageArt)'),
  'new stage art must draw in the actual playable canvas');
assert(runtime.includes('const artX = stageStarts[slot.stage] + slot.x'),
  'stage-local world position must be honored');
assert(runtime.includes('if (sections <= slot.stage || !slot.image.naturalWidth) continue;'),
  'load/final-stage visibility guard missing');
assert(runtime.includes('if (artX + slot.w >= camera && artX <= camera + width)'),
  'must camera-cull decorative art');
const build=html.split('pawcade-side-scroll-no-badges-v2.js?v=')[1]?.split('"')[0];
assert(build&&offline.includes('pawcade-side-scroll-no-badges-v2.js?v='+build),
  'game JS and offline worker must use the same version');
console.log('PASS: 10 stage-4/5 original assets grounded in five independently referenced games (6–10); online/Android playback still unverified.');
