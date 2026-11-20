'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname,'..');
const readFile = file => fs.readFileSync(path.join(root,file),'utf8');
const script = readFile('assets/pawtopia-scout.js');
const page = readFile('pawtopia-scout-trails.html');
const ui = readFile('assets/pawtopia-scout-trails.js');
const cottage = readFile('assets/companion-cottage.js');
const day = 'Fri Nov 20 2026';
const tomorrow = 'Sat Nov 21 2026';
function createScout() {
  const window = {};
  vm.runInNewContext(script,{window,Object,Array,Number,String,Math});
  return window.PawtopiaScout;
}
const state = () => ({
  coins: 0,food: 0,toy: false,
  companion: {name: 'Mochi',breed: 'Maine Coon',bondPoints: 0,fullness: 60,happiness: 60},
  otherCompanions: []
});

test('four original zones offer three clue variants and safe choices', () => {
  const scout = createScout();
  assert.deepEqual(Array.from(scout.areas.map(area => area.id)),['meadow','grotto','garden','frost']);
  const prizes = new Set();
  for (const area of scout.areas) {
    assert.equal(area.riddles.length,3);
    assert.ok(area.accessory.name && area.stamp);
    prizes.add(area.accessory.id);
    for (const riddle of area.riddles) {
      assert.equal(riddle.choices.length,3);
      assert.ok(riddle.choices.includes(riddle.answer));
      assert.equal(new Set(riddle.choices).size,3);
    }
  }
  assert.equal(prizes.size,4);
});

test('wrong guesses do not cost coins, friendship or lose a trail', () => {
  const scout=createScout(),progress=state();
  const quest=scout.read(progress,day).areas[0];
  const wrong=quest.riddle.choices.find(choice=>choice!==quest.riddle.answer);
  const before=JSON.stringify(progress);
  const outcome=scout.solve(progress,quest.id,wrong,day);
  assert.equal(outcome.ok,false);
  assert.equal(JSON.stringify(progress),before);
  assert.equal(scout.read(progress,day).completed.length,0);
  assert.equal(scout.solve(progress,'invalid',wrong,day).ok,false);
  assert.equal(scout.solve(progress,'toString',wrong,day).ok,false);
});

test('solving all four trails awards at most eight coins and four bond points per day', () => {
  const scout=createScout(),progress=state();
  for (const quest of scout.read(progress,day).areas) {
    assert.equal(scout.solve(progress,quest.id,quest.riddle.answer,day).ok,true);
    assert.equal(scout.solve(progress,quest.id,quest.riddle.answer,day).ok,false);
  }
  assert.equal(progress.coins,8);
  assert.equal(progress.companion.bondPoints,4);
  assert.equal(scout.read(progress,day).completed.length,4);
  assert.equal(scout.read(progress,day).stamps.length,4);
  assert.equal(scout.read(progress,day).journal.length,4);
  assert.equal(scout.read(progress,tomorrow).completed.length,0);
  assert.equal(scout.read(progress,tomorrow).stamps.length,4);
  assert.equal(scout.read(progress,tomorrow).journal.length,4);
  assert.equal(progress.companion.fullness,60);
});

test('different cats keep independent keepsakes; switching cannot double-claim daily currency', () => {
  const scout=createScout(),progress=state();
  const trail=scout.read(progress,day).areas[0];
  assert.equal(scout.solve(progress,trail.id,trail.riddle.answer,day).ok,true);
  const first=progress.companion;
  const other={name:'Snowflake',breed:'Siamese',bondPoints:0};
  progress.companion=other;
  progress.otherCompanions=[first];
  assert.equal(scout.solve(progress,trail.id,trail.riddle.answer,day).ok,false);
  assert.equal(progress.coins,2);
  assert.equal(scout.read(progress,day).stamps.length,0);
  assert.equal(scout.read({...progress,companion:first},day).stamps.length,1);
  assert.equal(scout.solve(progress,trail.id,scout.read(progress,tomorrow).areas[0].riddle.answer,tomorrow).ok,true);
  assert.equal(progress.coins,4);
  assert.equal(scout.read(progress,tomorrow).stamps.length,1);
});

test('souvenir wardrobe requires a stamped area and cannot grant unearned outfits', () => {
  const scout=createScout(),progress=state();
  assert.equal(scout.equip(progress,'clockwork').ok,false);
  assert.equal(progress.companion.scoutAccessory,undefined);
  const task=scout.read(progress,day).areas.find(area=>area.id==='garden');
  assert.equal(scout.solve(progress,task.id,task.riddle.answer,day).ok,true);
  assert.equal(scout.equip(progress,'clockwork').ok,true);
  assert.equal(scout.accessoryFor(progress.companion).name,'Clockwork Bow');
  assert.equal(scout.equip(progress,'none').ok,true);
  assert.equal(scout.accessoryFor(progress.companion),null);
  assert.equal(scout.equip({companion:null},'none').ok,false);
});

test('milestones cap correctly and journal remains bounded for old saves', () => {
  const scout=createScout(),progress=state();
  progress.companion.bondPoints=100;
  progress.scoutJournal=Array.from({length:20},()=>({area:'meadow',day:'Old Day',cat:'Mochi'}));
  const task=scout.read(progress,day).areas[0];
  scout.solve(progress,task.id,task.riddle.answer,day);
  assert.equal(progress.companion.bondPoints,100);
  assert.equal(progress.scoutJournal.length,12);
  assert.equal(scout.read(progress,day).journal.length,12);
  assert.equal(scout.read({},day).hasCompanion,false);
  assert.equal(scout.solve({coins:0,companion:null},'meadow','Leaf',day).ok,false);
});

test('new area is linked through existing Pawtopia without remote APIs or borrowed art', () => {
  for (const part of ['meadow','grotto','garden','frost']) {
    assert.match(page,new RegExp('id="trail-'+part+'"'));
    assert.match(page,new RegExp('id="answers-'+part+'"'));
  }
  for (const file of ['index.html','pawtopia-companions.html','pawtopia-town.html','pawtopia-arcade.html']) {
    assert.ok(readFile(file).includes('href="pawtopia-scout-trails.html"'),file);
  }
  assert.match(page,/assets\/pawtopia-scout\.js/);
  assert.match(cottage,/scout\.equip\(progress, chosen\)/);
  assert.match(readFile('sw.js'),/assets\/pawtopia-scout-trails\.js/);
  assert.match(readFile('sitemap.xml'),/pawtopia-scout-trails\.html/);
  assert.ok(!/\bfetch\s*\(|WebSocket|XMLHttpRequest/.test(script+ui));
});
