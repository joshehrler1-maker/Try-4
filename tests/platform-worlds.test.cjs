'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/platform-worlds.js'), 'utf8');
const context = {window:{}};
vm.runInNewContext(source, context, {filename:'platform-worlds.js',timeout:5000});
const w = context.window;
const count = 25;
const tables = ['pawtopiaCourses','pawtopiaStyles','pawtopiaVariants','pawtopiaTechniques','pawtopiaChapters','pawtopiaRoomPlans','pawtopiaSetPieces'];

test('all 25 game definitions have matching per-game records', () => {
  for (const name of tables) {
    assert.ok(Array.isArray(w[name]), name + ' is missing');
    assert.equal(w[name].length,count,name + ' must cover all games');
  }
  assert.equal(new Set(w.pawtopiaCourses.map(row=>row[0])).size,count,'game titles must be distinct');
});

test('every adventure has a distinct opening and ending and a valid route', () => {
  for (let i=0;i<count;i++) {
    const course=w.pawtopiaCourses[i], plan=w.pawtopiaRoomPlans[i];
    assert.ok(course.length>=6,'incomplete course '+i);
    assert.ok(String(course[2]).trim() && String(course[3]).trim(),'missing story objectives '+i);
    assert.notEqual(course[2],course[3],'opening equals ending '+i);
    const rooms=plan.trim().split(/\s+/);
    assert.ok(rooms.length>=5,'route is too short for '+course[0]);
    for(const room of rooms) assert.ok(Array.isArray(w.pawtopiaRooms[room]),'unknown room '+room+' in '+course[0]);
  }
});

test('all authored platforms have valid positive sizes and bounded coordinates', () => {
  for(const [name,platforms] of Object.entries(w.pawtopiaRooms)) {
    assert.ok(platforms.length>0,'empty room '+name);
    for(const [n,platform] of platforms.entries()){
      assert.ok(Array.isArray(platform)&&platform.length>=3,name+' platform '+n+' malformed');
      const [x,y,width]=platform;
      assert.ok([x,y,width].every(Number.isFinite),name+' platform '+n+' has non-finite geometry');
      assert.ok(x>=0 && x<=10000,name+' platform '+n+' invalid x');
      assert.ok(y>=-1000 && y<=2000,name+' platform '+n+' invalid y');
      assert.ok(width>0 && width<=10000,name+' platform '+n+' invalid width');
    }
  }
});

test('movement and technique tuning is finite across all 25 games',()=>{
  for(let i=0;i<count;i++){
    const variant=w.pawtopiaVariants[i],technique=w.pawtopiaTechniques[i];
    assert.ok(variant.length>=4,'missing movement values for '+i);
    assert.ok(variant.every(Number.isFinite),'invalid movement value for '+i);
    assert.ok(variant[0]>0 && variant[2]>0,'invalid speed or jump tuning for '+i);
    assert.ok(String(technique[0]).trim() && String(technique[1]).trim(),'missing technique for '+i);
  }
});


test('all 25 counterpart references and enemy patterns are explicitly defined', () => {
  const references = w.pawtopiaStyles.map(row => row[0]);
  assert.equal(new Set(references).size, count, 'each adventure needs its own reference');
  for (let i = 0; i < count; i++) {
    const style = w.pawtopiaStyles[i];
    assert.ok(style.length >= 3, 'missing reference or enemy behavior in game ' + i);
    assert.ok(String(style[1]).trim(), 'missing movement style in game ' + i);
    assert.ok(String(style[2]).trim(), 'missing enemy pattern in game ' + i);
  }
});

test('enemy encounter caps progress safely across all 25 worlds', () => {
  const runtime = fs.readFileSync(path.join(__dirname, '../assets/pawcade-side-scroll-no-badges-v2.js'), 'utf8');
  const match = runtime.match(/const worldEncounterCaps\s*=\s*(\[[\s\S]*?\]);/);
  assert.ok(match, 'missing world-specific enemy encounter budgets');
  const caps = vm.runInNewContext(match[1], {}, {timeout:1000});
  assert.equal(caps.length, count, 'enemy encounter budgets must cover all 25 games');
  for (let i = 0; i < count; i++) {
    const stages = caps[i];
    assert.equal(stages.length, 6, 'expected six stage budgets for ' + w.pawtopiaCourses[i][0]);
    assert.ok(stages.every(n => Number.isInteger(n) && n >= 0 && n <= 8), 'unsafe encounter count in game ' + i);
    assert.ok(stages.every((n, j) => j === 0 || n >= stages[j-1]), 'enemy pressure must not decline in game ' + i);
  }
});


test('all 25 games provide bounded enemy reaction distance', () => {
  const runtime = fs.readFileSync(path.join(__dirname, '../assets/pawcade-side-scroll-no-badges-v2.js'), 'utf8');
  const match = runtime.match(/const worldReactionDistances\s*=\s*(\[[\s\S]*?\]);/);
  assert.ok(match, 'missing world-specific enemy reaction distances');
  const distances = vm.runInNewContext(match[1], {}, {timeout:1000});
  assert.equal(distances.length, count, 'reaction distances must cover every game');
  assert.ok(distances.every(n => Number.isFinite(n) && n >= 100 && n <= 500),
    'reaction distances must provide a safe, bounded approach corridor');
  assert.ok(new Set(distances).size >= 8, 'enemy spacing must reflect different counterpart mechanics');
});


test('counterpart-inspired enemy motion profiles cover all games without invalid physics', () => {
  const runtime = fs.readFileSync(path.join(__dirname, '../assets/pawcade-side-scroll-no-badges-v2.js'), 'utf8');
  const match = runtime.match(/const enemyProfiles\s*=\s*(\[[\s\S]*?\]);/);
  assert.ok(match, 'missing per-game enemy motion profiles');
  const profiles = vm.runInNewContext(match[1], {}, {timeout:1000});
  assert.equal(profiles.length, count, 'enemy motion must be configured for all games');
  for (let i = 0; i < count; i++) {
    const [tempo, reach, rise] = profiles[i];
    assert.equal(profiles[i].length, 3, 'malformed enemy profile in game ' + i);
    assert.ok(Number.isFinite(tempo) && tempo > 0 && tempo <= 2, 'invalid enemy tempo in game ' + i);
    assert.ok(Number.isFinite(reach) && reach >= 0 && reach <= 200, 'invalid enemy reach in game ' + i);
    assert.ok(Number.isFinite(rise) && rise >= 0 && rise <= 100, 'invalid enemy rise in game ' + i);
  }
  assert.ok(new Set(profiles.map(row => row.join(','))).size >= 20,
    'enemy movement profiles must retain substantial game-to-game variety');
});


test('first-stage scenic art stays tied to its own stage surface, file and offline cache', () => {
  const runtime = fs.readFileSync(path.join(__dirname, '../assets/pawcade-side-scroll-no-badges-v2.js'), 'utf8');
  const html = fs.readFileSync(path.join(__dirname, '../pawcade-side-scroll.html'), 'utf8');
  const worker = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  const literal = name => {
    const match = runtime.match(new RegExp('const ' + name + '\\s*=\\s*(\\[[\\s\\S]*?\\]);'));
    assert.ok(match, 'missing ' + name);
    return vm.runInNewContext(match[1], {}, {timeout: 1000});
  };
  const files = literal('firstStageLandmarkPaths');
  const positions = literal('firstStageLandmarkPositions');
  assert.equal(files.length, 25, 'all 25 adventures require game-specific Stage 1 artwork');
  assert.equal(positions.length, files.length, 'each active art file must have a location');
  assert.equal(new Set(files).size, files.length, 'no art may be reused across games');
  assert.match(runtime, /drawImage\(firstStageLandmark, artX, artY, artW, artH\)/);
  for (let i=0; i<files.length; i++) {
    const asset = files[i];
    assert.ok(asset.startsWith('assets/scenes/') && asset.endsWith('.svg'), 'invalid asset path for ' + i);
    const absolute = path.join(__dirname,'..',asset);
    assert.ok(fs.existsSync(absolute), 'missing scene art ' + asset);
    const svg = fs.readFileSync(absolute,'utf8');
    assert.ok(svg.startsWith('<svg') && svg.trimEnd().endsWith('</svg>'), 'invalid art wrapper ' + asset);
    assert.ok(worker.includes("'" + asset + "'"), 'art missing from offline precache: ' + asset);
    const [x,y,width,height] = positions[i];
    assert.ok([x,y,width,height].every(Number.isFinite) && width > 0 && height > 0,
      'invalid prop dimensions in ' + w.pawtopiaCourses[i][0]);
    const center = x + width / 2, bottom = y + height;
    const stage1Room = w.pawtopiaRoomPlans[i].split(/\s+/)[0];
    const geometry = w.pawtopiaRooms[stage1Room];
    const grounded = geometry.some(([sx,sy,span,kind]) =>
      sx <= center && center < sx + span && sy === bottom &&
      !['hazard','ceiling','ceilingSpikes','rail','current'].includes(kind));
    assert.ok(grounded, w.pawtopiaCourses[i][0] + ' scene prop is not aligned to Stage 1 support');
  }

  const stage2Files = literal('secondStageLandmarkPaths');
  const stage2Positions = literal('secondStageLandmarkPositions');
  assert.equal(stage2Files.length, 5, 'games 21–25 need distinct second-stage art');
  assert.equal(stage2Positions.length, 5, 'second-stage placement data must be complete');
  assert.equal(new Set([...files,...stage2Files]).size, 30,
    'all integrated scene artworks must have unique asset paths');
  assert.match(runtime, /stageStarts\[1\] \+ localX/,
    'second-stage props must use stage-local-to-world offset');
  assert.match(runtime, /drawImage\(secondStageLandmark, artX, artY, artW, artH\)/);
  for (let j=0; j<5; j++) {
    const i=j+20;
    const asset=stage2Files[j], [x,y,width,height]=stage2Positions[j];
    assert.ok(asset.startsWith('assets/scenes/') && asset.endsWith('.svg'), 'incorrect stage2 path ' + asset);
    assert.ok(fs.existsSync(path.join(__dirname,'..',asset)), 'missing stage2 art '+asset);
    assert.ok(worker.includes("'" + asset + "'"), 'offline stage2 asset missing '+asset);
    const source=fs.readFileSync(path.join(__dirname,'..',asset),'utf8');
    assert.ok(source.startsWith('<svg') && source.trimEnd().endsWith('</svg>'),
      'invalid SVG container for stage2 '+asset);
    assert.ok([x,y,width,height].every(Number.isFinite) && width>0 && height>0,
      'stage2 position or size invalid for ' + w.pawtopiaCourses[i][0]);
    const mid=x+width/2, bottom=y+height;
    const secondRoomName=w.pawtopiaRoomPlans[i].split(/\s+/)[1];
    const secondRoom=w.pawtopiaRooms[secondRoomName];
    assert.ok(secondRoom.some(([start,top,span,kind]) =>
      start<=mid && mid<start+span && top===bottom &&
      !['hazard','ceiling','ceilingSpikes','rail','current'].includes(kind)),
      'second-stage prop is not grounded on its own game platform: ' + w.pawtopiaCourses[i][0]);
  }
  for (const [,url] of html.matchAll(/(?:href|src)="(assets\/[^"]+\?[^"]+)"/g)) {
    assert.ok(worker.includes("'" + url + "'"), 'offline game runtime mismatch: ' + url);
  }
});

test('third through sixth stage scenery is unique, cacheable, stage-scoped and platform-aligned', () => {
  const runtime = fs.readFileSync(path.join(__dirname,'../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const worker = fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  const literal = name => {
    const match=runtime.match(new RegExp('const '+name+'\\s*=\\s*(\\[[\\s\\S]*?\\]);'));
    assert.ok(match, name + ' missing');
    return vm.runInNewContext(match[1], {}, {timeout:1000});
  };
  const seen = new Set([...literal('firstStageLandmarkPaths'),...literal('secondStageLandmarkPaths')]);
  for(const [chapter,ordinal] of [['third',2],['fourth',3],['fifth',4],['sixth',5]]) {
    const files=literal(chapter+'StageLandmarkPaths');
    const positions=literal(chapter+'StageLandmarkPositions');
    assert.equal(files.length,5,chapter+' stage needs 5 separate artworks');
    assert.equal(positions.length,5,chapter+' stage needs 5 placement tuples');
    assert.ok(runtime.includes('stageStarts['+ordinal+'] + localX'),chapter+' stage lacks world offset');
    assert.ok(runtime.includes('ctx.drawImage('+chapter+'StageLandmark, artX, artY, artW, artH)'),
      chapter+' stage artwork is not drawn into the game');
    for(let j=0;j<5;j++){
      const i=j+20,asset=files[j],[x,y,wide,tall]=positions[j];
      assert.ok(!seen.has(asset),'reused scenic art across stages: '+asset);
      seen.add(asset);
      assert.ok(asset.startsWith('assets/scenes/') && asset.endsWith('.svg'),'invalid path: '+asset);
      assert.ok(fs.existsSync(path.join(__dirname,'..',asset)),'missing scene image: '+asset);
      const svg=fs.readFileSync(path.join(__dirname,'..',asset),'utf8');
      assert.ok(svg.startsWith('<svg') && svg.trimEnd().endsWith('</svg>'),'bad SVG wrapper: '+asset);
      assert.ok(worker.includes("'" + asset + "'"),'offline asset missing: '+asset);
      assert.ok([x,y,wide,tall].every(Number.isFinite) && wide>0 && tall>0,'bad scenery dimensions: '+asset);
      const stageRoomName=w.pawtopiaRoomPlans[i].trim().split(' ')[ordinal];
      const geom=w.pawtopiaRooms[stageRoomName];
      assert.ok(geom, 'missing stage room: '+stageRoomName);
      const mid=x+wide/2, bottom=y+tall;
      assert.ok(geom.some(([sx,top,span,kind])=> sx<=mid && mid<sx+span && top===bottom &&
        !['hazard','ceiling','ceilingSpikes','rail','current'].includes(kind)),
        'scenery base does not match authored surface: '+asset);
    }
  }
  assert.equal(seen.size,50,'all 50 individual game-and-stage scenic asset paths must be unique');
});

test('five late-game enemy rigs render distinct simulation-driven poses safely', () => {
  const rigPath=path.join(__dirname,'../assets/animation/late-world-enemy-rigs-v1.js');
  const runtime=fs.readFileSync(path.join(__dirname,'../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const html=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  const worker=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  assert.ok(fs.existsSync(rigPath), 'missing late-world rig script');
  const script=fs.readFileSync(rigPath,'utf8');
  const sandbox={window:{}};
  vm.runInNewContext(script,sandbox,{filename:'late-world-enemy-rigs-v1.js',timeout:1000});
  const rig=sandbox.window.pawtopiaLateEnemyRigs;
  assert.equal(typeof rig?.draw,'function','rig drawing API missing');
  assert.equal(new Set(Object.values(rig.families)).size,5,'each enemy must have a distinct family');
  assert.ok(html.includes('assets/animation/late-world-enemy-rigs-v1.js?'),
    'motion rig script is not loaded in playable game HTML');
  assert.ok(html.indexOf('src="assets/animation/late-world-enemy-rigs-v1.js') <
            html.indexOf('src="assets/pawcade-side-scroll-no-badges-v2.js'),
            'enemy rigs must be loaded before main gameplay');
  assert.ok(worker.includes("'assets/animation/late-world-enemy-rigs-v1.js?"),
    'enemy rigs need offline cache');
  assert.match(runtime,/const lateWorldRig = index>=20 && index<=24/,
    'gameplay renderer must bind only the assigned five games');
  assert.match(runtime,/pawtopiaLateEnemyRigs\.draw\(/,
    'playable enemy renderer never calls animation art module');

  for(let index=20;index<25;index++){
    const counters={};
    let saveDepth=0;
    const context=new Proxy({},{
      get(target,prop){
        if(Object.hasOwn(target,prop))return target[prop];
        return (...args)=>{
          counters[prop]=(counters[prop]||0)+1;
          if(prop==='save')saveDepth++;
          if(prop==='restore')saveDepth--;
          assert.ok(args.every(value=>typeof value!=='number'||Number.isFinite(value)),
            'nonfinite rendering argument in '+String(prop)+' game '+index);
        };
      },
      set(target,prop,value){target[prop]=value;return true;}
    });
    const poses=[
      {stride:0,attack:0,recoil:0,landing:0,clock:0,reduced:true},
      {stride:1,attack:0,recoil:0,landing:0,clock:1.1,reduced:false},
      {stride:.35,attack:.7,recoil:0,landing:0,clock:2.2,reduced:false},
      {stride:0,attack:1,recoil:1,landing:.4,clock:3.3,reduced:false,faceLeft:true}
    ];
    for(const pose of poses) {
      assert.equal(rig.draw(context,index,{x:260,y:290},{_gait:2.6,offset:index},pose),true);
      assert.equal(saveDepth,0,'canvas transform not restored in game '+index);
    }
    assert.ok((counters.fill||0)>12 && (counters.stroke||0)>8,
      'insufficient body-part rendering in '+rig.families[index]);
    assert.ok((counters.translate||0)>=4,'rig lacks world-position alignment');
  }
  assert.equal(rig.draw({},19,{x:0,y:0},{},{}),false,
    'outside game 21–25 must keep its existing enemy art');
});

test('defeated mid- and late-world enemies retain only a short visual after hitboxes vanish', () => {
  const runtime=fs.readFileSync(path.join(__dirname,
    '../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const helper=runtime.match(/  function markFoeDefeated\(foe\) \{[\s\S]*?\n  \}/)?.[0];
  assert.ok(helper,'missing visual-only defeat helper');
  const registry=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../assets/enemy-art-motion-registry.json'),'utf8'));
  for(let game=15;game<25;game++){
    const enemyFamily=registry.games[game];
    assert.match(enemyFamily.implementationStatus,/partial/i,
      'do not label incomplete 3D enemy clips finished');
    const context={index:game,reducedMotion:false,clock:12.25,
      usesOriginRig:()=>false,
      window:{
        pawtopiaMidEnemyRigs:{draw:()=>true},
        pawtopiaLateEnemyRigs:{draw:()=>true}
      },
      foePosition:foe=>({x:foe.x+11,y:foe.y+5}),foe:{x:200,y:275,dead:false}};
    vm.runInNewContext(helper+'\nmarkFoeDefeated(foe);',context,{timeout:1000});
    assert.equal(context.foe.dead,true,'defeated enemy must lose hitbox immediately');
    assert.equal(context.foe._defeatAt,12.25);
    assert.equal(context.foe._defeatX,211);
    assert.equal(context.foe._defeatY,280);
    assert.match(runtime,/age>=\.42/,'defeat visuals must expire');
  }
  const contexts=[
    {index:14,reducedMotion:false,clock:10,foePosition:()=>({x:1,y:2}),foe:{dead:false}},
    {index:19,reducedMotion:true,clock:10,foePosition:()=>({x:1,y:2}),foe:{dead:false}},
    {index:21,reducedMotion:true,clock:10,foePosition:()=>({x:1,y:2}),foe:{dead:false}}
  ];
  for(const context of contexts)context.usesOriginRig=()=>false;
  for(const context of contexts)context.window={
    pawtopiaMidEnemyRigs:{draw:()=>true},
    pawtopiaLateEnemyRigs:{draw:()=>true}
  };
  for(const context of contexts){
    vm.runInNewContext(helper+'\nmarkFoeDefeated(foe);',context,{timeout:1000});
    assert.equal(context.foe.dead,true);
    assert.equal(context.foe._defeatAt,undefined,
      'other games and reduced-motion players must not get late death animation');
  }
  assert.ok(runtime.includes('e._defeatAt=undefined'),
    'restart must reset defeated enemy visual state');
});

test('five mid-world enemy rigs preserve game-specific silhouettes and safe render state', () => {
  const artFile=path.join(__dirname,'../assets/animation/mid-world-enemy-rigs-v1.js');
  const html=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  const runtime=fs.readFileSync(path.join(__dirname,'../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const worker=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  const registry=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/enemy-art-motion-registry.json'),'utf8'));
  assert.ok(fs.existsSync(artFile),'missing actual 2.5D art source for games 16–20');
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(artFile,'utf8'),sandbox,{timeout:1000});
  const art=sandbox.window.pawtopiaMidEnemyRigs;
  assert.equal(typeof art?.draw,'function');
  const kinds=Object.values(art.families);
  assert.equal(kinds.length,5);
  assert.equal(new Set(kinds).size,5,'each adventure requires unique enemy art');
  assert.ok(html.includes('src="assets/animation/mid-world-enemy-rigs-v1.js?'));
  assert.ok(html.indexOf('src="assets/animation/mid-world-enemy-rigs-v1.js') <
            html.indexOf('src="assets/pawcade-side-scroll-no-badges-v2.js'),
    'the enemy rig module must initialize before the playable game');
  assert.ok(worker.includes("'assets/animation/mid-world-enemy-rigs-v1.js?"),
    'offline cache must contain new enemy rig art module');
  assert.ok(runtime.includes("index>=15 && index<=19"),
    'the playable game must select only the correct five enemies');
  assert.ok(runtime.includes('window.pawtopiaMidEnemyRigs.draw('),
    'the enemy render path must actually draw the new artwork');
  assert.ok(runtime.includes('foe._defeatAt=clock'),
    'defeat must bind to actual gameplay collision removal');

  for(let i=15;i<=19;i++){
    assert.equal(kinds[i-15],registry.games[i].enemyFamily);
    let saved=0,draws=0,scales=0;
    const context=new Proxy({},{
      get(target,method){
        if(Object.hasOwn(target,method))return target[method];
        return(...args)=>{
          if(method==='save')saved++;
          if(method==='restore')saved--;
          if(method==='scale')scales++;
          if(method==='fill')draws++;
          assert.ok(args.every(x=>typeof x!=='number'||Number.isFinite(x)),
            'non-finite canvas coordinate in game '+(i+1)+': '+String(method));
        };
      },set(target,key,value){target[key]=value;return true;}
    });
    for(const pose of [
      {stride:0,attack:0,recoil:0,landing:0,clock:0,reduced:true},
      {stride:1,attack:0,recoil:0,landing:0,clock:1.3,reduced:false},
      {stride:.4,attack:.6,recoil:0,landing:.1,clock:2.4,reduced:false},
      {stride:0,attack:1,recoil:1,landing:.5,clock:3.2,
        reduced:false,faceLeft:true,hit:1,airborne:i===15||i===19}
    ]){
      assert.equal(art.draw(context,i,{x:280,y:270},
        {offset:i+1,_gait:2.8,turret:i===16},pose),true);
      assert.equal(saved,0,'unrestored canvas state in game '+(i+1));
    }
    assert.ok(draws>20,'rig must render multiple distinct parts');
    assert.ok(scales>=1,'rig must support facing reversal');
    assert.match(registry.games[i].implementationStatus,/partial/,
      'do not mislabel unfinished 3D enemy art as finished');
  }
  assert.equal(art.draw({},20,{x:0,y:0},{},{}),false,
    'other adventure enemies must retain their own designs');
});

test('cloud-trail rigs for games 11–15 have independent silhouettes and safe stage-aware motion', () => {
  const artPath=path.join(__dirname,'../assets/animation/cloud-trail-enemy-rigs-v1.js');
  const html=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  const runtime=fs.readFileSync(path.join(__dirname,
    '../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const worker=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  const registry=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../assets/enemy-art-motion-registry.json'),'utf8'));
  assert.ok(fs.existsSync(artPath),'missing original rig art');
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(artPath,'utf8'),sandbox,
    {filename:'cloud-trail-enemy-rigs-v1.js',timeout:1000});
  const art=sandbox.window.pawtopiaCloudEnemyRigs;
  assert.equal(typeof art?.draw,'function');
  assert.equal(Object.keys(art.families).length,5);
  assert.equal(new Set(Object.values(art.families)).size,5,
    'the five games cannot reuse the same enemy body design');
  assert.ok(html.includes('src="assets/animation/cloud-trail-enemy-rigs-v1.js?'));
  assert.ok(html.indexOf('src="assets/animation/cloud-trail-enemy-rigs-v1.js') <
    html.indexOf('src="assets/pawcade-side-scroll-no-badges-v2.js'),
    'enemy body module must load before gameplay runtime');
  assert.ok(worker.includes("'assets/animation/cloud-trail-enemy-rigs-v1.js?"),
    'new enemy motion module should work offline');
  assert.ok(runtime.includes('cloudWorldRig = index>=10 && index<=14'),
    'individual artwork must be bound only to games 11–15');
  assert.ok(runtime.includes('window.pawtopiaCloudEnemyRigs.draw('),
    'gameplay draw must use original enemy artwork');
  assert.ok(runtime.includes('window.pawtopiaCloudEnemyRigs?.draw'),
    'defeat must use original enemy art for visual-only fade');
  for(let index=10;index<15;index++){
    assert.equal(art.families[index],registry.games[index].enemyFamily);
    assert.match(registry.games[index].implementationStatus,/partial/i,
      'the art must not be recorded as fully 3D and film-quality');
    let saveDepth=0, drawCalls=0, fillCalls=0;
    const ctx=new Proxy({globalAlpha:1},{
      get(target,method){
        if(Object.hasOwn(target,method))return target[method];
        return(...args)=>{
          drawCalls++;
          if(method==='save')saveDepth++;
          if(method==='restore')saveDepth--;
          if(method==='fill')fillCalls++;
          assert.ok(args.every(x=>typeof x!=='number'||Number.isFinite(x)),
            'bad coordinate in game '+index+' method '+String(method));
        };
      },
      set(target,key,value){target[key]=value;return true;}
    });
    const isAirborne=index===10;
    for(const pose of [
      {stride:0,attack:0,recoil:0,landing:0,clock:0,reduced:true,airborne:isAirborne},
      {stride:1,attack:0,recoil:0,landing:0,clock:1.7,reduced:false,airborne:isAirborne},
      {stride:.45,attack:.65,recoil:.25,landing:.15,clock:2.2,reduced:false,airborne:isAirborne},
      {stride:0,attack:1,recoil:1,landing:.6,clock:3.6,reduced:false,airborne:isAirborne,faceLeft:true,hit:1}
    ]){
      assert.equal(art.draw(ctx,index,{x:250,y:286},
        {_gait:2.4,offset:index+.5},pose),true);
      assert.equal(saveDepth,0,'canvas state leaked in game '+index);
    }
    assert.ok(drawCalls>70 && fillCalls>15,
      'body part animation too sparse for game '+index);
  }
  assert.equal(art.draw({},9,{x:0,y:0},{},{}),false,
    'other games must keep their own body silhouettes');
  assert.equal(art.draw({},15,{x:0,y:0},{},{}),false,
    'new artwork must not overwrite games 16–25');
});

test('five distinctive games 6–10 enemy rigs render safely without changing gameplay physics', () => {
  const runtime=fs.readFileSync(path.join(__dirname,'../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const html=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  const worker=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  const registry=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../assets/enemy-art-motion-registry.json'),'utf8'));
  const pathToArt=path.join(__dirname,'../assets/animation/five-world-enemy-rigs-v1.js');
  assert.ok(fs.existsSync(pathToArt),'original five-world enemy motion source missing');
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(pathToArt,'utf8'),sandbox,{timeout:1000});
  const rigs=sandbox.window.pawtopiaFiveEnemyRigs;
  assert.equal(typeof rigs?.draw,'function');
  assert.equal(Object.keys(rigs.families).length,5);
  assert.equal(new Set(Object.values(rigs.families)).size,5,
    'no duplicated enemy family in the five distinct adventures');
  assert.ok(html.includes('src="assets/animation/five-world-enemy-rigs-v1.js?'));
  assert.ok(html.indexOf('src="assets/animation/five-world-enemy-rigs-v1.js') <
    html.indexOf('src="assets/pawcade-side-scroll-no-badges-v2.js'),
    'enemy rigs must load before the playable runtime');
  assert.ok(worker.includes("'assets/animation/five-world-enemy-rigs-v1.js?"),
    'new five-world animated bodies must work in the offline cache');
  assert.ok(runtime.includes('fiveWorldRig = index>=5 && index<=9'));
  assert.ok(runtime.includes('window.pawtopiaFiveEnemyRigs.draw('));
  assert.ok(runtime.includes('if(!rendered3D && !authoredEnemyArt) drawWorldSpecificEnemyMotion'),
    'generic motion accents must never overlap any of the 25 bespoke silhouettes');
  assert.ok(runtime.includes('window.pawtopiaFiveEnemyRigs?.draw'),
    'visual-only defeat transition must use the same enemy body');
  for(let i=5;i<10;i++){
    assert.equal(rigs.families[i],registry.games[i].enemyFamily);
    assert.match(registry.games[i].implementationStatus,/partial/i);
    let depth=0,ops=0,fill=0;
    const ctx=new Proxy({globalAlpha:1},{
      get(target,prop){
        if(Object.hasOwn(target,prop))return target[prop];
        return(...args)=>{
          ops++;
          if(prop==='save')depth++;
          if(prop==='restore')depth--;
          if(prop==='fill')fill++;
          assert.ok(args.every(v=>typeof v!=='number'||Number.isFinite(v)),
            'nonfinite canvas parameter '+String(prop)+' in game '+i);
        };
      },set(target,k,v){target[k]=v;return true;}
    });
    for(const pose of [
      {stride:0,attack:0,recoil:0,landing:0,clock:0,reduced:true},
      {stride:1,attack:0,recoil:0,landing:0,clock:1.5,reduced:false},
      {stride:.4,attack:.65,recoil:.2,landing:.1,clock:2.6,reduced:false},
      {stride:0,attack:1,recoil:1,landing:.5,clock:3.9,reduced:false,faceLeft:true,hit:1}
    ]){
      assert.equal(rigs.draw(ctx,i,{x:200,y:285},{_gait:2.2,offset:i},pose),true);
      assert.equal(depth,0,'unbalanced canvas transform on '+i);
    }
    assert.ok(fill>15 && ops>85,'body motion art incomplete for '+i);
  }
  assert.equal(rigs.draw({},4,{x:0,y:0},{},{}),false);
  assert.equal(rigs.draw({},10,{x:0,y:0},{},{}),false);
});

test('enemy motion lab previews real gameplay rigs without mislabeling them 3D', () => {
  const lab=fs.readFileSync(path.join(__dirname,'../enemy-motion-lab.html'),'utf8');
  const game=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  assert.match(lab,/id="render-mode"/,'lab must offer the real rendered rig option');
  assert.match(lab,/Show playable rig/);
  assert.match(lab,/not<\/strong> final 3D models|not<\/strong> final 3D/i,
    'concept preview must not call vector rigs film-level 3D');
  for(const moduleName of [
    'origin-world-enemy-rigs-v1.js',
    'five-world-enemy-rigs-v1.js',
    'cloud-trail-enemy-rigs-v1.js',
    'mid-world-enemy-rigs-v1.js',
    'late-world-enemy-rigs-v1.js'
  ]){
    const pattern='src="assets/animation/'+moduleName+'?';
    assert.ok(game.includes(pattern),'playable games do not load '+moduleName);
    assert.ok(lab.includes(pattern),'preview is not using live game rig '+moduleName);
  }
  const inline=lab.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(inline,'missing lab interface script');
  assert.doesNotThrow(()=>new Function(inline),'lab script must parse');
  assert.match(inline,/rig\.draw\(ctx,index,/,
    'preview must draw the same registered enemy body as gameplay');
});

test('original base enemy rigs for games 1–5 preserve authored specialists and draw safely', () => {
  const rigPath=path.join(__dirname,'../assets/animation/origin-world-enemy-rigs-v1.js');
  const runtime=fs.readFileSync(path.join(__dirname,'../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const html=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  const worker=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  const registry=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/enemy-art-motion-registry.json'),'utf8'));
  assert.ok(fs.existsSync(rigPath));
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(rigPath,'utf8'),sandbox,{timeout:1000});
  const rigs=sandbox.window.pawtopiaOriginEnemyRigs;
  assert.equal(typeof rigs?.draw,'function');
  assert.equal(Object.keys(rigs.families).length,5);
  assert.equal(new Set(Object.values(rigs.families)).size,5);
  assert.ok(html.includes('src="assets/animation/origin-world-enemy-rigs-v1.js?'));
  assert.ok(html.indexOf('src="assets/animation/origin-world-enemy-rigs-v1.js') <
    html.indexOf('src="assets/pawcade-side-scroll-no-badges-v2.js'));
  assert.ok(worker.includes("'assets/animation/origin-world-enemy-rigs-v1.js?"));
  assert.ok(runtime.includes('originWorldRig = usesOriginRig(foe)'));
  assert.ok(runtime.includes('window.pawtopiaOriginEnemyRigs.draw('));
  assert.ok(runtime.includes('if(!rendered3D && !authoredEnemyArt) drawWorldSpecificEnemyMotion'),
    'prevent duplicated seed-garden accessory art');
  assert.ok(runtime.includes('const dyingEnemyArt = index<=4 ? window.pawtopiaOriginEnemyRigs'),
    'the base enemy needs visual-only defeat pose');
  const start=runtime.indexOf('  function usesOriginRig(foe) {');
  const end=runtime.indexOf('\n  }',start);
  assert.ok(start>=0 && end>start,'missing specialist art guard');
  const allow=runtime.slice(start,end+4);
  for(let i=0;i<5;i++){
    const bare={index:i,foe:{}};
    vm.runInNewContext(allow+'\nresult=usesOriginRig(foe);',bare,{timeout:1000});
    assert.equal(bare.result,true,'no base enemy art for game '+(i+1));
    for(const variant of ['foundryEnemy','libraryEnemy','reefEnemy','clockEnemy']){
      const scope={index:i,foe:{[variant]:0}};
      vm.runInNewContext(allow+'\nresult=usesOriginRig(foe);',scope,{timeout:1000});
      assert.equal(scope.result,false,'existing specialist '+variant+' must retain its art');
    }
    assert.equal(registry.games[i].enemyFamily,rigs.families[i]);
    assert.ok(registry.games[i].implementationStatus.includes('partial'));
    let depth=0,draws=0,strokes=0;
    const ctx=new Proxy({globalAlpha:1},{
      get(target,k){
        if(Object.hasOwn(target,k))return target[k];
        return (...args)=>{
          if(k==='save')depth++;
          if(k==='restore')depth--;
          if(k==='fill')draws++;
          if(k==='stroke')strokes++;
          assert.ok(args.every(v=>typeof v!=='number'||Number.isFinite(v)),
            'nonfinite canvas coordinate in game '+i);
        };
      },
      set(target,key,value){target[key]=value;return true;}
    });
    for(const pose of [
      {stride:0,attack:0,recoil:0,landing:0,reduced:true,clock:0},
      {stride:1,attack:0,recoil:0,landing:0,reduced:false,clock:1.2},
      {stride:.35,attack:.7,recoil:.1,landing:.3,reduced:false,clock:2.4},
      {stride:0,attack:1,recoil:1,landing:.45,reduced:false,clock:3.5,faceLeft:true,hit:1}
    ]){
      assert.equal(rigs.draw(ctx,i,{x:210,y:275},
        {_gait:2.4,offset:i,spawnChapter:4},pose),true);
      assert.equal(depth,0,'unbalanced canvas transforms in game '+i);
    }
    assert.ok(draws>16&&strokes>20,'enemy body drawing is incomplete: '+i);
  }
  assert.equal(rigs.draw({},5,{x:0,y:0},{},{}),false);
});

test('first-ten real WebGL mesh prototypes have unique 3D parts and safe lifecycle', () => {
  const lab=fs.readFileSync(path.join(__dirname,'../enemy-3d-prototype.html'),'utf8');
  const game=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  const worker=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  const source=fs.readFileSync(path.join(__dirname,'../assets/animation/enemy-3d-prototype-v1.js'),'utf8');
  const registry=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../assets/enemy-art-motion-registry.json'),'utf8'));
  assert.ok(lab.includes('<script src="assets/animation/enemy-3d-prototype-v1.js?'),
    'preview must initialize its WebGL renderer before the inline UI code');
  assert.ok(lab.includes('Experimental low-detail models'),
    'experimental 3D models must be labeled honestly');
  assert.ok(game.includes('href="enemy-3d-prototype.html"'),
    'prototype should be discoverable from Games Room');
  for(const file of ['enemy-3d-prototype.html',
    'assets/animation/enemy-3d-prototype-v1.js?v=3d-ten-79f7903']){
    assert.ok(worker.includes(file), 'new WebGL source not precached: '+file);
  }
  const ctx={window:{devicePixelRatio:2}};
  vm.runInNewContext(source,ctx,{timeout:2000});
  const art=ctx.window.SuperPawEnemy3D;
  assert.equal(art.models.length,10);
  assert.equal(new Set(art.models.map(m=>m.enemy)).size,10);
  for(const [kind,m] of Object.entries(art.meshes)){
    assert.equal(m.p.length,m.n.length,'normals must match 3D vertices: '+kind);
    assert.equal(m.p.length%3,0);
    assert.equal(m.idx.length%3,0,'triangles need 3 vertices: '+kind);
    assert.ok(m.idx.every(i=>i>=0&&i<m.p.length/3),'invalid index in '+kind);
    assert.ok(m.p.every(Number.isFinite)&&m.n.every(Number.isFinite),'invalid mesh geometry: '+kind);
  }
  for(let i=0;i<10;i++){
    assert.equal(art.models[i].enemy,registry.games[i].enemyFamily);
    assert.ok(registry.games[i].implementationStatus.includes('partial'));
    for(const mode of ['idle','move','attack','hit','defeat']){
      const sample=art.build(i,mode,1.2,false);
      assert.ok(sample.parts.length>=8,'model missing body pieces: '+sample.enemy);
      for(const part of sample.parts){
        assert.ok(art.meshes[part.type],'unknown 3D primitive '+part.type);
        assert.ok([...part.position,...part.scale,part.tilt].every(Number.isFinite),
          'nonfinite 3D pose in '+sample.game);
      }
    }
  }
  let drawCalls=0,buffers=0,deletes=0;
  const gl=new Proxy({}, {get(target,name){
    if(name==='getShaderParameter'||name==='getProgramParameter')return()=>true;
    if(name==='getAttribLocation')return()=>0;
    if(name==='getUniformLocation'||name==='createShader'||name==='createProgram')return()=>({});
    if(name==='createBuffer')return()=>{buffers++;return{};};
    if(name==='deleteBuffer')return()=>{deletes++;};
    if(name==='getShaderInfoLog'||name==='getProgramInfoLog')return()=>'';
    if(typeof name==='string'&&name.toUpperCase()===name)return 1;
    return (...args)=>{
      if(name==='drawElements')drawCalls++;
      assert.ok(args.every(v=>typeof v!=='number'||Number.isFinite(v)),
        'invalid WebGL numeric argument: '+name);
    };
  }});
  const canvas={clientWidth:500,width:0,height:0,getContext:()=>gl};
  const stage=art.init(canvas);
  for(let i=0;i<10;i++)for(const mode of ['idle','move','attack','hit','defeat'])
    assert.ok(stage.render(i,mode,1.2,.25,false).meshes>=8);
  assert.ok(drawCalls>200,'no 3D triangle mesh draw calls');
  assert.ok(buffers>=12,'four mesh types require dedicated GPU vertex/index buffers');
  assert.ok(canvas.width>=1&&canvas.width<=1200,'Android preview must cap drawing resolution');
  stage.dispose();
  assert.equal(deletes,buffers,'WebGL buffers should be disposed on page exit');
});

test('experimental WebGL enemy art stays studio-only while playable enemies remain original', () => {
  const html=fs.readFileSync(path.join(__dirname,'../pawcade-side-scroll.html'),'utf8');
  const runtime=fs.readFileSync(path.join(__dirname,'../assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  const sw=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
  const js=fs.readFileSync(path.join(__dirname,'../assets/animation/enemy-3d-prototype-v1.js'),'utf8');
  assert.ok(!html.includes('id="side-3d-enemies"'),
    'low-detail experimental models must not replace playable enemies');
  assert.ok(!html.includes('src="assets/animation/enemy-3d-prototype-v1.js'),
    'the playable page must not load low-poly WebGL prototypes');
  assert.ok(html.includes('href="enemy-3d-prototype.html"'),
    'experimental models remain available only in the separate preview lab');
  assert.ok(sw.includes('enemy-3d-prototype-v1.js?v=3d-ten-'));
  assert.ok(sw.includes('pawcade-side-scroll-no-badges-v2.js?v=enemy-silhouette-restore-'));
  assert.ok(runtime.includes('const authoredEnemyArt=originWorldRig || fiveWorldRig ||'));
  assert.ok(runtime.includes('if(!reducedMotion && !authoredEnemyArt)'));
  assert.ok(runtime.includes('if(!rendered3D && !authoredEnemyArt) drawEnemySecondaryMotion'));
  assert.ok(runtime.includes('ctx.translate(-at.x,-at.y-19-(authoredEnemyArt?0:footstep))'),
    'original joint motion must not be doubled by the legacy bobbing overlay');
  assert.ok(runtime.includes('enemy3dAvailable=index>=0 && index<=9'));
  assert.ok(runtime.includes('enemy3dDraws>=2'));
  assert.ok(runtime.includes('enemy3dSlowFrames>=12'));
  assert.ok(runtime.includes('!is3dPreviewFoe(foe)'));
  assert.ok(runtime.includes('else if(originWorldRig && window.pawtopiaOriginEnemyRigs.draw('));
  assert.ok(runtime.includes('finally{ctx.restore();}'));
  const sandbox={window:{devicePixelRatio:3}};
  vm.runInNewContext(js,sandbox,{timeout:2000});
  const art=sandbox.window.SuperPawEnemy3D;
  let alpha=null,drawn=0,buffers=0,deleted=0,settings=null;
  const gl=new Proxy({}, {get(target,k){
    if(k==='getShaderParameter'||k==='getProgramParameter')return()=>true;
    if(k==='getAttribLocation')return()=>0;
    if(k==='getUniformLocation'||k==='createShader'||k==='createProgram')return()=>({});
    if(k==='createBuffer')return()=>{buffers++;return{};};
    if(k==='deleteBuffer')return()=>{deleted++;};
    if(k==='getShaderInfoLog'||k==='getProgramInfoLog')return()=>'';
    if(k==='clearColor')return(...args)=>{alpha=args[3];};
    if(k==='drawElements')return()=>{drawn++;};
    if(typeof k==='string'&&k.toUpperCase()===k)return 1;
    return (...args)=>assert.ok(args.every(a=>typeof a!=='number'||Number.isFinite(a)),
      'non-finite WebGL numeric argument: '+k);
  }});
  const canvas={width:160,height:160,clientWidth:0,getContext:(kind,opts)=>{
    settings=opts;return gl;
  }};
  const view=art.init(canvas,{sprite:true});
  assert.equal(settings.alpha,true);
  assert.equal(settings.preserveDrawingBuffer,true);
  assert.equal(alpha,0);
  for(let i=0;i<10;i++){
    const before=drawn;
    const current=view.render(i,'move',1.5,.2,false);
    assert.equal(canvas.width,160);
    assert.equal(canvas.height,160);
    assert.equal(drawn-before,current.meshes,
      'transparent 3D sprites must omit preview-only floor and shadow meshes');
  }
  view.dispose();
  assert.equal(deleted,buffers);
});
