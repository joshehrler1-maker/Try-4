'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'assets/pawtopia-pet-bond.js'), 'utf8');
const cottage = fs.readFileSync(path.join(root, 'assets/companion-cottage.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'pawtopia-companions.html'), 'utf8');
const today = 'Fri Nov 20 2026';
const tomorrow = 'Sat Nov 21 2026';
function api() {
  const window = {};
  vm.runInNewContext(script, { window }, { filename: 'pawtopia-pet-bond.js' });
  return window.PawtopiaPetBond;
}
function cat() { return { name: 'Cloud', breed: 'Maine Coon', fullness: 65, happiness: 65, updatedAt: 123 }; }

test('existing adopted cats read safely without migration or save mutation', () => {
  const pet = cat(), before = JSON.stringify(pet);
  const game = api(), state = game.read(pet, today);
  assert.equal(state.points, 0);
  assert.equal(state.title, 'New Friend');
  assert.equal(state.available.length, 3);
  assert.equal(state.memories.length, 0);
  assert.equal(JSON.stringify(pet), before);
  assert.equal(typeof state.temperament.description, 'string');
});

test('grooming, story and exploration count once daily; journal persists per cat', () => {
  const game = api(), pet = cat();
  for (const action of ['brush','story','explore']) {
    assert.equal(game.perform(pet,action,today).ok, true);
    assert.equal(game.perform(pet,action,today).ok, false);
  }
  const state = game.read(pet,today);
  assert.equal(state.available.length, 0);
  assert.equal(state.memories.length, 3);
  assert.ok(state.points >= 3 && state.points <= 6);
  assert.equal(game.read(pet,tomorrow).available.length, 3);
  assert.equal(game.perform(pet,'brush',tomorrow).ok, true);
  assert.equal(game.read(pet,tomorrow).memories.length, 4);
  assert.equal(pet.fullness,65);
  assert.equal(pet.happiness,65);
});

test('cat profiles remain independent; invalid activity and missing cat cannot change state', () => {
  const game = api(), a = cat(), b = {...cat(),name:'Luna'};
  assert.equal(game.perform(a,'story',today).ok,true);
  assert.equal(game.read(b,today).points,0);
  const snapshot=JSON.stringify(a);
  assert.equal(game.perform(a,'bad',today).ok,false);
  assert.equal(game.perform(null,'brush',today).ok,false);
  assert.equal(JSON.stringify(a),snapshot);
  assert.equal(game.read(a,today).available.length,2);
});

test('favourite activities earn an extra point, and points never exceed cap', () => {
  const game=api(), pet=cat(), fav=game.personality(pet).favorite;
  assert.equal(game.perform(pet,fav,today).ok,true);
  assert.equal(game.read(pet,today).points,2);
  pet.bondPoints=99;
  assert.equal(game.perform(pet,fav,tomorrow).ok,true);
  assert.equal(pet.bondPoints,100);
  assert.equal(game.read(pet,tomorrow).title,'Forever Friend');
  assert.ok(game.read(pet,tomorrow).badges.includes('Forever Friend'));
});

test('only last eight safe memories displayed and corrupt old optional data ignored', () => {
  const game=api(), pet=cat();
  pet.bondPoints=-100;
  pet.bondMemories=[null,{activity:'unknown',day:today},{activity:'brush',day:today}];
  pet.bondCare={day:today,done:['unknown']};
  assert.equal(game.read(pet,today).points,0);
  assert.equal(game.read(pet,today).memories.length,1);
  for(let i=0;i<12;i++) assert.equal(game.perform(pet,'story','Day '+i).ok,true);
  assert.equal(game.read(pet,'Day 11').memories.length,8);
  assert.equal(pet.bondMemories.length,8);
});

test('Companion Cottage integrates the journal with existing local save and accessible controls', () => {
  for(const id of ['pet-bond-panel','pet-bond-progress','pet-bond-value','pet-personality','pet-bond-memories','pet-bond-badges']) {
    assert.ok(html.includes('id="'+id+'"'),id);
  }
  assert.ok(html.includes('src="assets/pawtopia-pet-bond.js"'));
  assert.ok(html.indexOf('assets/pawtopia-pet-bond.js') < html.indexOf('assets/companion-cottage.js'));
  for(const action of ['brush','story','explore']) assert.ok(html.includes('data-pet-bond="'+action+'"'));
  assert.ok(cottage.includes('petBond.perform(progress.companion'));
  assert.ok(cottage.includes('save.update(change)'));
  assert.ok(cottage.includes('bondPanel.hidden = !companion'));
  assert.ok(!/fetch\(|WebSocket|XMLHttpRequest/.test(script),'No network API in pet bonding');
});
