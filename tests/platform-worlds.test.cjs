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
