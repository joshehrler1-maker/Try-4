'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const dataScript = read('assets/pawtopia-battle-data.js');
const artScript = read('assets/pawtopia-battle-character-art.js');
const uiScript = read('assets/pawtopia-battle-arena.js');
const css = read('assets/pawtopia-battle-arena.css');
const html = read('pawtopia-battle-arena.html');
function setup() {
  const window={};
  vm.runInNewContext(dataScript,{window});
  vm.runInNewContext(artScript,{window});
  return {data:window.PawtopiaBattleData,art:window.PawtopiaBattleCharacterArt};
}

test('every approved cat has a distinct full-body art identity and original photo face',()=>{
  const {data,art}=setup();
  const breeds=Array.from(data.breeds);
  assert.equal(art.collection.length,56);
  assert.equal(new Set(art.collection.map(item=>item.breed)).size,56);
  assert.deepEqual(Array.from(art.collection,profile=>profile.breed),breeds);
  for(const breed of breeds) {
    const kit=data.kitFor(breed),profile=art.getArt(breed);
    assert.ok(profile.fur.startsWith('#'));
    assert.ok(profile.shade.startsWith('#'));
    assert.ok(profile.eyes.startsWith('#'));
    assert.equal(profile.kit,kit.id);
    const markup=art.svgForBreed(breed);
    assert.match(markup,/<svg[^>]+class="paw-battle-full-body"/);
    assert.ok(markup.includes('href="'+kit.sprite.src+'"'),breed+' must use original selected picture');
    assert.ok(markup.includes('<image'),breed+' must display detailed original face texture');
    assert.ok(markup.includes('art-paw-left')&&markup.includes('art-paw-right'),'Drawn paws for '+breed);
    assert.ok(markup.includes('art-body'),'Drawn body for '+breed);
    assert.ok(!markup.includes('<foreignObject'));
    assert.ok(fs.existsSync(path.join(root,kit.sprite.src)),'Source picture missing: '+breed);
  }
});

test('all 504 pose variants contain distinct attack/guard/ultimate limb drawings',()=>{
  const {data,art}=setup();
  assert.deepEqual(Array.from(art.poseKeys),[
    'idle','approach','swipe','guard','signature','ultimate','impact','victory','defeat'
  ]);
  let variants=0;
  const keys=new Set();
  for(const breed of data.breeds){
    const variantsForBreed=[];
    for(const pose of art.poseKeys){
      const drawing=art.svgForBreed(breed,pose);
      assert.ok(drawing.includes('data-pose="'+pose+'"'));
      assert.ok(drawing.includes('data-breed-index='));
      assert.ok(drawing.endsWith('</svg>'));
      const key=breed+'/'+pose;assert.ok(!keys.has(key));keys.add(key);
      assert.equal((drawing.match(/class="art-paw art-paw-/g)||[]).length,2);
      if(['signature','ultimate'].includes(pose)){
        assert.ok(drawing.includes('class="art-ability"'),'Unique ability art for '+breed+' '+pose);
        assert.ok(drawing.includes('text-anchor="middle"'),'Unique glyph for '+breed);
      }
      variantsForBreed.push(drawing.replace(/data-pose="[^"]+"/,'').replace(/<desc>.*?<\/desc>/,''));
      variants++;
    }
    assert.equal(new Set(variantsForBreed).size,9,'Distinct geometry for all 9 '+breed+' poses');
  }
  assert.equal(variants,504);
});

test('individual geometry varies by coat pattern, ears, body colors, and tail types',()=>{
  const {art}=setup();
  const sphynx=art.svgForBreed('Sphynx','swipe');
  const coon=art.svgForBreed('Maine Coon','swipe');
  const bengal=art.svgForBreed('Bengal','swipe');
  const bombay=art.svgForBreed('Bombay','swipe');
  const manx=art.svgForBreed('Manx','swipe');
  assert.notEqual(sphynx,coon);
  assert.notEqual(bengal,bombay);
  assert.notEqual(bombay,manx);
  assert.ok(coon.includes('stroke-width="25"'),'Long-haired cat should have thick tail');
  assert.ok(sphynx.includes('q18 6 32 -1'),'Hairless cat gets skin wrinkles');
  assert.ok(bengal.includes('opacity=".7"'),'Bengal receives spot markings');
  assert.ok(!manx.includes('Q192 205'),'Manx naturally lacks a long tail');
});

test('paint uses a generated full-body SVG, not only a moving square picture',()=>{
  const {art}=setup();
  const classes = new Set();
  const target={
    innerHTML:'',dataset:{},style:{backgroundImage:'keep'},
    classList:{add:name=>classes.add(name)}
  };
  assert.equal(art.paint(target,'Siamese','swipe'),true);
  assert.equal(classes.has('has-body-art'),true);
  assert.equal(target.dataset.pose,'swipe');
  assert.equal(target.style.backgroundImage,'none');
  assert.ok(target.innerHTML.includes('adopt-siamese.webp'));
  assert.ok(target.innerHTML.includes('art-paw-right'));
  const swipe=target.innerHTML;
  art.paint(target,'Siamese','guard');
  assert.notEqual(target.innerHTML,swipe);
  assert.equal(target.dataset.pose,'guard');
  art.paint(target,'Siamese','ultimate');
  assert.match(target.innerHTML,/class="art-ability"/);
});

test('arena uses posed characters during live attacks, and provides 9 free previews',()=>{
  assert.match(html,/assets\/pawtopia-battle-character-art\.js/);
  assert.ok(html.indexOf('pawtopia-battle-character-art.js')<html.indexOf('pawtopia-battle-arena.js'));
  assert.match(html,/id="battle-art-preview-actions"/);
  for(const pose of ['idle','approach','swipe','guard','signature','ultimate','impact','victory','defeat']) {
    assert.ok(html.includes('data-battle-pose="'+pose+'"'),pose);
    assert.ok(css.includes('data-pose="'+pose+'"')||pose==='idle'||pose==='approach'||pose==='swipe'||pose==='victory'||pose==='defeat',pose);
  }
  for(const action of ["playArtFrames(cat,'swipe'","playArtFrames(cat,'impact'","playArtFrames(cat,'victory'","playArtFrames(cat,'defeat'","guard?'guard'"]) {
    assert.ok(uiScript.includes(action),'Missing live action sequence '+action);
  }
  assert.ok(uiScript.includes("characterArt.paint(el('battle-cat-art'),cat.breed,state,frame)"));
  assert.ok(uiScript.includes("await playArtFrames(cat,pose,characterArt.timingFor(cat.breed,pose))"));
  assert.match(read('sw.js'),/assets\/pawtopia-battle-character-art\.js/);
  assert.match(read('.github/workflows/verify.yml'),/tests\/pawtopia-individual-cat-art\.test\.cjs/);
  assert.doesNotMatch(artScript,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
});
