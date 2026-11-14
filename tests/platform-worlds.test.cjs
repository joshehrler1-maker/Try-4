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
      const stageRoomName=w.pawtopiaRoomPlans[i].split(/\\s+/)[ordinal];
      const geom=w.pawtopiaRooms[stageRoomName];
      const mid=x+wide/2, bottom=y+tall;
      assert.ok(geom.some(([sx,top,span,kind])=> sx<=mid && mid<sx+span && top===bottom &&
        !['hazard','ceiling','ceilingSpikes','rail','current'].includes(kind)),
        'scenery base does not match authored surface: '+asset);
    }
  }
  assert.equal(seen.size,50,'all 50 individual game-and-stage scenic asset paths must be unique');
});
