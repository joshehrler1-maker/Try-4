'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname,'..');
const get = file => fs.readFileSync(path.join(root,file),'utf8');
const html=get('guest-arcade.html'), script=get('assets/guest-arcade.js');
const home=get('index.html'), arcade=get('pawtopia-arcade.html');
test('Guest Arcade uses original hero art, publisher credit, no paywall, and dedicated page',()=>{
  assert.ok(html.includes('src="assets/whisker-luna-master.png"'));
  assert.ok(html.includes('src="assets/guest-arcade.js"'));
  assert.ok(html.includes('Guest games are') || html.includes('Guest titles are owned'));
  assert.ok(html.includes('GameZipper') && html.includes('PlayKovo'));
  assert.ok(html.includes('id="player"')&&html.includes('id="frame-wrap"'));
  assert.ok(html.includes('href="pawtopia-arcade.html"'));
  assert.ok(html.includes('publishers may') || html.includes('Publishers may'));
  assert.ok(home.includes('href="guest-arcade.html"'));
  assert.ok(arcade.includes('href="guest-arcade.html"'));
  assert.ok(get('sw.js').includes('guest-arcade.html') && get('sw.js').includes('assets/guest-arcade.js'));
  assert.ok(get('sw.js').includes('assets/guest-arcade-catalog.json'));

});
test('100 actual starter entries are unique publisher-listed embed slugs',()=>{
  const block=script.match(/const sourceGroups = \{([\s\S]*?)\n  \};/);
  assert.ok(block,'Starter game groups missing');
  const groups=[...block[1].matchAll(/^\s*(Arcade|Puzzle|Board|Action|Casual): '([^']+)'[,]?$/gm)];
  assert.equal(groups.length,5,'Exactly five curated categories');
  const all=groups.flatMap(([,category,value])=>value.split(';').map(entry=>({category,slug:entry.split('|')[0],name:entry.split('|')[1]})));
  assert.equal(all.length,100,'100 authored real entries, no invented placeholders');
  assert.equal(new Set(all.map(entry=>entry.slug)).size,100,'No duplicated provider slugs');
  for (const game of all){
    assert.match(game.slug,/^[a-z0-9-]{2,100}$/);
    assert.ok(game.name&&game.name.length<86);
  }
  for(const slug of ['snake','2048','tetris','sudoku','color-by-number','memory-match','minesweeper','basketball-shoot']){
    assert.ok(all.some(game=>game.slug===slug),slug+' must be present');
  }
});
test('Remote catalogs are allowlisted and click-to-play, not copied into the site',()=>{
  assert.ok(script.includes('https://gamezipper.com/api/games.json'));
  assert.ok(script.includes('assets/guest-arcade-catalog.json'), 'The verified local catalog must load first');
  const snapshot = JSON.parse(get('assets/guest-arcade-catalog.json'));
  assert.ok(snapshot.games.length >= 600, 'Hundreds of verified publisher listings must be present');
  assert.equal(snapshot.count,snapshot.games.length);
  assert.equal(new Set(snapshot.games.map(game=>game.publisher+':'+game.slug)).size,snapshot.games.length);
  for(const game of snapshot.games){
    assert.ok(['GameZipper','PlayKovo'].includes(game.publisher));
    assert.ok(/^[a-z0-9-]{2,100}$/.test(game.slug));
    const prefix=game.publisher==='GameZipper' ? 'https://gamezipper.com/' : 'https://playkovo.com/embed/';
    assert.ok(game.url.startsWith(prefix), 'Only approved publisher hosts may be embedded');
  }
  assert.ok(script.includes("GameZipper:'gamezipper.com',PlayKovo:'playkovo.com'"));
  assert.ok(script.includes('function safeLink('));
  assert.ok(script.includes('iframe.src=url.toString()'));
  assert.ok(script.includes("iframe.loading='eager'"));
  assert.ok(script.includes("game.publisher==='GameZipper'"));
  assert.ok(!html.includes('<iframe'), 'No third-party iframe should load before Play');
  assert.ok(!/fetch\(['"]https:\/\/[^'"]+\/api\/v1\/paid/.test(script));
  assert.ok(script.includes('games.length') && script.includes('currently available'), 'Counts must be verified actual loaded games');
});
test('Guest Arcade source has valid JS syntax',()=>{
  new vm.Script(script,{filename:'guest-arcade.js'});
});
