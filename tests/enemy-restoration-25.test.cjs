// Source-based verification of every stage's restored 2026-11-14 enemy
// appearance. Does not claim device testing or cinematic animation completion.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const read=filename=>fs.readFileSync(path.join(root,filename),'utf8');
const source=read('assets/pawcade-side-scroll-no-badges-v2.js');
const manifest=JSON.parse(read('assets/enemy-restoration-baseline-25.json'));
const prototypeRegistry=JSON.parse(read('assets/enemy-art-motion-registry.json'));
const platformSource=read('assets/platform-worlds.js');
const html=read('pawcade-side-scroll.html');
const offline=read('sw.js');
const world={};
new Function('window',platformSource)(world);
const stageCount=world.pawtopiaChapters.reduce((n,ch)=>n+ch.length,0);
assert.equal(manifest.games.length,25);
assert.equal(prototypeRegistry.games.length,25);
assert.equal(stageCount,162);
const names=new Set(),seenRooms=new Set();
for(let i=0;i<25;i++){
  const game=manifest.games[i],reg=prototypeRegistry.games[i];
  assert.equal(game.index,i);
  assert.equal(game.game,world.pawtopiaCourses[i][0]);
  assert.equal(game.hero,world.pawtopiaCourses[i][1]);
  assert.equal(game.counterpart,world.pawtopiaStyles[i][0]);
  assert.equal(game.movement,world.pawtopiaStyles[i][1]);
  assert.equal(game.encounterPattern,world.pawtopiaStyles[i][2]);
  assert.equal(game.supersededUnapprovedRig,reg.enemyFamily);
  assert.equal(reg.prototypeBlockedFromPlayable,true);
  assert.equal(reg.approvedAppearanceCommit,'9768ec86ad');
  assert.equal(game.stages.length,world.pawtopiaChapters[i].length);
  assert.equal(game.stages.length,world.pawtopiaRoomPlans[i].split(' ').length);
  assert.equal(game.stages.length,world.pawtopiaSetPieces[i].split(' ').length);
  assert(!names.has(game.game),'reused game name');
  names.add(game.game);
  for(let s=0;s<game.stages.length;s++){
    const stage=game.stages[s];
    assert.equal(stage.stage,s+1);
    assert.equal(stage.name,world.pawtopiaChapters[i][s]);
    assert.equal(stage.room,world.pawtopiaRoomPlans[i].split(' ')[s]);
    assert.equal(stage.gameplaySetpiece,world.pawtopiaSetPieces[i].split(' ')[s]);
    assert(Array.isArray(world.pawtopiaRooms[stage.room]),
      'missing actual playable stage room '+stage.room);
    assert(world.pawtopiaRooms[stage.room].length>=1,
      'stage has no collision platforms '+stage.room);
    assert(!seenRooms.has(stage.room),'two stages sharing a room ID '+stage.room);
    seenRooms.add(stage.room);
    assert.equal(stage.integration,'source-gated-legacy-art');
    assert.equal(stage.imageReview,'PENDING_ANDROID_REVIEW');
  }
}
assert.equal(seenRooms.size,162);
// The five distinct newer prototype families must be gated OFF for all
// twenty-five playable indices; old atlas and specialist art stay dispatched.
assert(source.includes('const useCrabEraArt = index>=0 && index<25;'));
for(const part of ['Origin','Five','Cloud','Mid','Late']){
  assert(source.includes('typeof window.pawtopia'+part+
    'EnemyRigs?.draw === \'function\' && !useCrabEraArt;'),
    'new prototype '+part+' accidentally enabled in gameplay');
}
assert(source.includes('const rendered3D=!useCrabEraArt && drawEnemy3d('),
  'WebGL mesh can overwrite the old creatures');
assert(source.includes('if(useCrabEraArt){') &&
  source.includes('else ctx.rotate(enemyLean+attackTilt+verticalLean);') &&
  source.includes('ctx.scale((1+recoil*.09+motion*.025)+bodyStretch+chargeCompression+squash+landingPose+strideCompression*.5,'),
  'historical crab-era proportions not selected');
assert(source.includes('else if(usesFoundryCrab(foe)) drawFoundryEnemy(at,0,faceLeft,'),
  'the Furnace Crab must use the same approved creature artwork');
for(const fn of [
  'function drawFoundryEnemy(',
  'function drawLibraryEnemy(',
  'function drawReefEnemy(',
  'function drawClockEnemy(',
  'function drawSteamworksEnemy(',
  'function drawEnemyArticulatedLimbs(',
  'function drawEnemySecondaryMotion('
])assert(source.includes(fn),'lost original enemy species/art motion '+fn);
assert(source.includes('atlasSprite(enemyArt,5,cell,at.x,at.y-12,73,73,faceLeft,5)'),
  'lost per-game atlas cell render');
assert(fs.existsSync(path.join(root,'assets/scenes/platform-enemies.webp')));
const build='pawcade-side-scroll-no-badges-v2.js?v=creature-era-shapes-all25-20261114';
assert(html.includes(build)&&offline.includes(build),'live HTML and worker script versions disagree');
const checklist=read('docs/ENEMY-RESTORATION-CHECKLIST-25.md');
for(const g of manifest.games){
  assert(checklist.includes('## '+(g.index+1)+'. '+g.game+' — '+g.hero),
    'missing per-game restoration checklist '+g.game);
}
console.log('PASS: 25 original game-specific enemy looks, 162 exact stage mappings, historical proportions, source selectors and offline parity; device review pending.');
