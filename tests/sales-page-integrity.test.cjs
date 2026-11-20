'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = filename => fs.readFileSync(path.join(root, filename), 'utf8');
const home = read('index.html');
const crystal = read('coloring-book.html');
const surreal = read('surreal-worlds-coloring-book.html');
const sitemap = read('sitemap.xml');
const registry = JSON.parse(read('assets/heroes-master.json'));
const publicRoot = 'https://joshehrler1-maker.github.io/Try-4/';
const approvedArt = publicRoot + 'assets/whisker-luna-master.png';

test('canon art stays original and present', () => {
  assert.equal(registry.master_reference, 'assets/whisker-luna-master.png');
  assert.match(registry.source_status, /original retained/i);
  assert.ok(fs.existsSync(path.join(root, registry.master_reference)));
  assert.ok(fs.existsSync(path.join(root, 'assets/baron-brasswhirl-master.webp')));
});

test('home invites parents to a free sample and offers the real book', () => {
  assert.ok(home.includes('For parents &amp; caregivers: try 3 free printable coloring pages'));
  assert.ok(home.includes('href="coloring-book.html"'));
  assert.ok(home.includes('href="https://payhip.com/b/rk4E5"'));
  assert.ok(home.includes('Full Book on Payhip · $7.99'));
  assert.ok(home.includes('<meta property="og:image" content="' + approvedArt + '">'));
});

test('Crystal Catacombs retains sample, purchase, honest description and original art', () => {
  assert.ok(crystal.includes('https://payhip.com/preview/rk4E5'));
  assert.ok(crystal.includes('https://payhip.com/b/rk4E5'));
  assert.ok(crystal.includes('Digital download. No physical book'));
  assert.ok(crystal.includes('100 activity pages'));
  assert.ok(crystal.includes('<meta property="og:image" content="' + approvedArt + '">'));
  assert.ok(crystal.includes("this.src='assets/whisker-luna-master.png'"));
});

test('Surreal Worlds checkout remains independent and does not invent a price', () => {
  assert.ok(surreal.includes('href="https://payhip.com/b/Kv9kA"'));
  assert.ok(surreal.includes('Digital download; no printed book'));
  assert.ok(surreal.includes('the current price'));
  assert.ok(surreal.includes('href="coloring-book.html"'));
  assert.doesNotMatch(surreal, /Buy Now.*\$[0-9]/);
});

test('public sitemap lists actual sales landing pages', () => {
  for (const page of ['', 'coloring-book.html', 'surreal-worlds-coloring-book.html']) {
    assert.ok(sitemap.includes('<loc>' + publicRoot + page + '</loc>'), 'Sitemap missing ' + page);
  }
});
