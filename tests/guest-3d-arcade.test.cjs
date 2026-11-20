'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const page=read('guest-3d-arcade.html');
const logic=read('assets/guest-3d-arcade.js');
const catalog=JSON.parse(read('assets/guest-3d-catalog.json'));
test('checked independent 3D publisher catalog has hundreds of distinct valid entries',()=>{
  assert.ok(Array.isArray(catalog.games));
  assert.ok(catalog.games.length>=200, 'Need at least 200 screened listings');
  assert.equal(catalog.count,catalog.games.length);
  assert.equal(catalog.publisher,'GameMonetize');
  assert.equal(new Set(catalog.games.map(g=>g.id)).size,catalog.games.length);
  for(const game of catalog.games){
    assert.match(game.id,/^\d{1,10}$/);
    assert.ok(game.title.length>0 && game.title.length<100);
    assert.match(game.url,/^https:\/\/html5\.gamemonetize\.co\/[a-z0-9-]{8,}\/?$/);
    assert.equal(game.category,'3D');
    assert.equal(game.publisher,'GameMonetize');
  }
});
test('3D guest page credits publisher and preserves original Super Paw Heroes art',()=>{
  assert.ok(page.includes('src="assets/whisker-luna-master.png"'));
  assert.ok(page.includes('href="3d-games.html"'));
  assert.ok(page.includes('href="pawtopia-arcade.html"'));
  assert.ok(page.includes('src="assets/guest-3d-arcade.js"'));
  assert.ok(page.includes('publisher'));
  assert.ok(page.includes('third-party advertising') || page.includes('third-party'));
  assert.ok(page.includes('GameMonetize'));
  assert.ok(!/<iframe\b/i.test(page), 'External frames must not be included before user action');
});
test('client requires explicit launch and restricts iframe origins',()=>{
  new vm.Script(logic,{filename:'guest-3d-arcade.js'});
  assert.ok(logic.includes("fetch('assets/guest-3d-catalog.json'"));
  assert.ok(logic.includes('allowedUrl'));
  assert.ok(logic.includes("byId('load').addEventListener('click'"));
  assert.ok(logic.includes("iframe.src=url"));
  assert.ok(logic.includes("iframe.setAttribute('sandbox'"));
  assert.ok(logic.includes('No popup permission'));
  assert.ok(logic.includes('textContent'));
  assert.ok(!logic.includes('innerHTML'));
});
test('homepage and both arcades link to 3D guest Galaxy without replacing existing games',()=>{
  for(const filename of ['index.html','pawtopia-arcade.html','guest-arcade.html']){
    assert.ok(read(filename).includes('href="guest-3d-arcade.html"'),filename+' missing link');
  }
  assert.ok(read('index.html').includes('href="3d-games.html"'));
  assert.ok(read('pawtopia-arcade.html').includes('id="featured-games"'));
  const sw=read('sw.js');
  assert.ok(sw.includes('guest-3d-arcade.html'));
  assert.ok(sw.includes('assets/guest-3d-arcade.js'));
  assert.ok(sw.includes('assets/guest-3d-catalog.json'));
});
