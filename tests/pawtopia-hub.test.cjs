'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'assets/pawtopia-hub.js'), 'utf8');

test('Explore hub references original owned art and playable locations', () => {
  assert.match(html, /id="paw-hub"/);
  assert.match(html, /src="assets\/whisker-luna-master\.png"/);
  assert.match(html, /href="pawtopia-companions\.html"/);
  assert.match(html, /href="pawtopia-arcade\.html"/);
  assert.match(html, /href="pawtopia-town\.html#quests"/);
  assert.match(html, /href="pawtopia-town\.html#card-album"/);
  assert.match(html, /href="pawgrove\.html"/);
  assert.match(html, /href="coloring-book\.html"/);
  assert.match(html, /assets\/pawtopia-hub\.css/);
  assert.match(html, /assets\/pawtopia-hub\.js/);
  assert.ok(fs.existsSync(path.join(root, 'assets/scenes/cottage.webp')));
  assert.ok(fs.existsSync(path.join(root, 'assets/scenes/arcade.webp')));
  assert.ok(fs.existsSync(path.join(root, 'assets/scenes/town-market.webp')));
});

function createWorld() {
  const nodes = new Map();
  function node(id) {
    if (nodes.has(id)) return nodes.get(id);
    const n = {
      id, style: {}, dataset: {}, hidden: false, disabled: false, value: 0,
      textContent: '', attributes: {}, listeners: {}, child: { textContent: '' },
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(key, cb) { this.listeners[key] = cb; },
      querySelector(query) { assert.equal(query, 'span'); return this.child; }
    };
    nodes.set(id, n); return n;
  }
  const heroes = ['Whisker', 'Luna'].map(name => {
    const n = node('hero-' + name); n.dataset.hubHero = name; return n;
  });
  const chests = ['1', '2', '3'].map(choice => {
    const n = node('chest-' + choice); n.dataset.hubChest = choice; return n;
  });
  const date = 'Fri Nov 20 2026';
  let saved = {hero:'',coins:0,lastClaim:'',badge:false,companion:null,otherCompanions:[],food:0,toy:false};
  const events = {};
  const window = {
    PawtopiaSave: {
      read: () => structuredClone(saved),
      today: () => date,
      update: async change => {
        const fresh = structuredClone(saved);
        const message = change(fresh);
        if (message) saved = fresh;
        return message;
      }
    },
    addEventListener(key, fn) { events[key] = fn; },
    dispatchEvent(e) { if (events[e.type]) events[e.type](); }
  };
  const document = {
    getElementById: node,
    querySelectorAll(query) { if (query === '[data-hub-hero]') return heroes; if (query === '[data-hub-chest]') return chests; throw Error(query); }
  };
  vm.runInNewContext(script, {window,document,Event:class Event { constructor(type) {this.type = type;} },Date,Number,String,Math,Object,Boolean,Array}, {filename:'pawtopia-hub.js'});
  return {node,heroes,chests,window,getSaved:()=>saved,setSaved:s=>{saved=s;window.dispatchEvent({type:'storage'});}};
}

test('hero choice, daily claim and free chest persist once per day', async () => {
  const w = createWorld();
  assert.equal(w.node('paw-hub-coins').textContent, '0');
  assert.equal(w.node('paw-hub-daily').disabled, true);
  await w.heroes[0].listeners.click();
  assert.equal(w.getSaved().hero, 'Whisker');
  await w.node('paw-hub-daily').listeners.click();
  assert.equal(w.getSaved().coins, 10);
  await w.node('paw-hub-daily').listeners.click();
  assert.equal(w.getSaved().coins, 10);
  await w.chests[1].listeners.click();
  assert.equal(w.getSaved().coins, 13);
  assert.equal(w.getSaved().lastHubChoice, '2');
  assert.equal(w.node('paw-hub-coins').textContent, '13');
  await w.chests[0].listeners.click();
  assert.equal(w.getSaved().coins, 13);
  assert.equal(w.node('paw-hub-steps').value, 3);
});

test('pet care uses existing snacks and save state, not parallel currency', async () => {
  const w = createWorld();
  await w.heroes[1].listeners.click();
  w.setSaved({...w.getSaved(),companion:{name:'Mittens',breed:'Maine Coon',fullness:60,happiness:60,updatedAt:Date.now()},food:1});
  assert.equal(w.node('paw-hub-pet-care').hidden, false);
  await w.node('paw-hub-feed').listeners.click();
  assert.equal(w.getSaved().food, 0);
  assert.equal(w.getSaved().companion.fullness, 85);
  await w.node('paw-hub-play').listeners.click();
  assert.equal(w.getSaved().companion.happiness, 70);
  assert.equal(w.getSaved().coins, 0);
  assert.equal(w.node('paw-hub-pet-name').textContent, 'Mittens');
  assert.equal(w.node('paw-hub-cat-count').textContent, '1');
});


test('storybook Explore provides one original illustrated interactive map and mobile design', () => {
  const start = html.indexOf('<section class="content" id="pawtopia"');
  const end = html.indexOf('<section class="content" id="crystal-regions"', start);
  assert.ok(start >= 0 && end > start, 'Explore section must exist');
  const explore = html.slice(start, end);
  const stylesheet = fs.readFileSync(path.join(root,'assets/pawtopia-storybook.css'),'utf8');
  const art = fs.readFileSync(path.join(root,'assets/pawtopia-adventure-map.svg'),'utf8');
  assert.ok(explore.includes('class="paw-hub-map-layout"'));
  assert.equal((explore.match(/class="pawtopia-atlas"/g) || []).length, 1, 'Only one world atlas');
  assert.equal((explore.match(/class="atlas-sign"/g) || []).length, 8, 'Eight real destinations');
  assert.ok(explore.indexOf('class="paw-hub-map-layout"') < explore.indexOf('id="paw-hub-pet-heading"'), 'World first');
  assert.ok(explore.includes('class="paw-hub-classic"'), 'Classic controls still available');
  assert.ok(explore.includes('id="world-save"') && explore.includes('id="world-buy"'));
  assert.ok(html.includes('href="assets/pawtopia-storybook.css"'));
  assert.ok(stylesheet.includes('url("pawtopia-adventure-map.svg")'));
  assert.ok(stylesheet.includes('@media(max-width:510px)'), 'Small-phone layout is defined');
  assert.ok(art.startsWith('<svg') && art.trimEnd().endsWith('</svg>'));
  assert.ok(!/<script\b/i.test(art), 'No embedded scripts in art');
  assert.ok(!/(?:href|src)\s*=\s*["']https?:/i.test(art), 'No third-party images');
  const serviceWorker = fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.ok(serviceWorker.includes('assets/pawtopia-storybook.css'));
  assert.ok(serviceWorker.includes('assets/pawtopia-adventure-map.svg'));
});


test('storybook theme is consistent across linked pet-world destinations', () => {
  const shell = fs.readFileSync(path.join(root, 'assets/pawtopia-world-shell.css'), 'utf8');
  assert.ok(shell.includes('body.cottage-art'));
  assert.ok(shell.includes('body.arcade-art'));
  assert.ok(shell.includes('body.pawtopia-town-world'));
  for (const page of ['pawtopia-companions.html', 'pawtopia-town.html', 'pawtopia-arcade.html']) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.ok(html.includes('href="assets/pawtopia-world-shell.css"'), page + ' missing shared style');
    assert.ok(html.includes('href="index.html#pawtopia"'), page + ' needs Explore navigation');
  }
  const town = fs.readFileSync(path.join(root, 'pawtopia-town.html'), 'utf8');
  assert.ok(town.includes('<body class="pawtopia-town-world">'));
  assert.ok(town.includes('id="shops"') && town.includes('id="quests"'));
  const cottage = fs.readFileSync(path.join(root, 'pawtopia-companions.html'), 'utf8');
  assert.ok(cottage.includes('id="adopt"') && cottage.includes('id="feed"'));
  const arcade = fs.readFileSync(path.join(root, 'pawtopia-arcade.html'), 'utf8');
  assert.ok(arcade.includes('id="game-search"') && arcade.includes('id="game-panel"'));
  const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  assert.ok(worker.includes('assets/pawtopia-world-shell.css'));
});
