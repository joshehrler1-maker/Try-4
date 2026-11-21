'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const artSource=read('assets/pawtopia-battle-character-art.js');
const dataSource=read('assets/pawtopia-battle-data.js');
const uiSource=read('assets/pawtopia-battle-arena.js');
const gallerySource=read('assets/pawtopia-battle-art-gallery.js');
function load(){
  const window={};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(artSource,{window});
  return {kit:window.PawtopiaBattleData,art:window.PawtopiaBattleCharacterArt};
}

test('all 56 cats render eleven distinct smooth attack frames for each of four moves',()=>{
  const {art,kit}=load();
  assert.equal(art.collection.length,56);
  assert.deepEqual(Array.from(art.animationFrames),[0,1,2,3,4,5]);
  assert.deepEqual(Array.from(art.smoothFrames),[0,.5,1,1.5,2,2.5,3,3.5,4,4.5,5]);
  let total=0;
  for(const cat of kit.kits){
    for(const pose of ['swipe','guard','signature','ultimate']){
      const frames=art.smoothFrames.map(frame=>art.svgForBreed(cat.breed,pose,frame));
      assert.equal(new Set(frames).size,11,cat.breed+' '+pose+' must have 11 different drawings');
      for(const svg of frames){
        assert.match(svg,/<g class="art-torso-weight"/);
        assert.match(svg,/<g class="art-head-weight"/);
        assert.match(svg,/<g class="art-cape-weight"/);
        assert.ok(svg.includes('<image href="'+cat.sprite.src+'"'),'Never replace approved adoption portrait');
        assert.ok(svg.includes('class="art-paw art-paw-left"'));
        assert.ok(svg.includes('class="art-paw art-paw-right"'));
        assert.ok(!/(?:NaN|undefined|Infinity)/.test(svg),'Invalid numeric SVG coordinate');
        if(['signature','ultimate'].includes(pose))
          assert.ok(svg.includes('class="art-skill-sigil"'),'Individual skill artwork survives interpolation');
        total++;
      }
    }
  }
  assert.equal(total,56*4*11);
});

test('old six key poses are exact samples inside the new in-between system',()=>{
  const {art}=load();
  for(const cat of art.collection){
    for(const pose of ['swipe','guard','signature','ultimate','approach','impact']){
      for(const key of art.animationFrames){
        const old=art.svgForBreed(cat.breed,pose,key);
        const newValue=art.svgForBreed(cat.breed,pose,art.smoothFrames[key*2]);
        assert.equal(old,newValue,cat.breed+' '+pose+' keyframe '+key);
      }
    }
  }
  assert.equal(art.keyframeValue([10,20,40,80,160,320],1.5),30);
  assert.equal(art.keyframeValue([10,20,40,80,160,320],3),80);
});

test('weight shift and leading paw animate individually while feet stay planted',()=>{
  const {art}=load();
  let changed=0;
  for(const cat of art.collection){
    const start=art.choreograph(cat,'swipe',0);
    const impact=art.choreograph(cat,'swipe',3);
    const mid=art.choreograph(cat,'swipe',2.5);
    const recovery=art.choreograph(cat,'swipe',5);
    assert.equal(start[0].length,4);
    assert.equal(start[1].length,4);
    assert.notEqual(start[1][2],impact[1][2],cat.breed+' right paw must reach forward');
    assert.notEqual(mid[1][2],start[1][2],cat.breed+' must interpolate the front paw');
    assert.ok(Math.abs(start[2][0]-impact[2][0])<=6,'Keep hind paw grounded');
    assert.ok(Math.abs(start[3][1]-impact[3][1])<=6,'Keep back foot grounded');
    assert.notEqual(impact[1][2],recovery[1][2],cat.breed+' must recover after the strike');
    const weight=art.torsoWeight(cat,'swipe',3);
    assert.ok(Number.isFinite(weight.shift)&&Number.isFinite(weight.tilt));
    if(weight.shift>0)changed++;
  }
  assert.equal(changed,56);
});

test('arena and gallery use eleven drawings, with battery-save and reduced-motion fallback',()=>{
  const page=read('pawtopia-battle-arena.html');
  assert.ok(page.includes('id="battle-quality"'));
  assert.ok(page.includes('value="smooth"'));
  assert.ok(page.includes('value="efficient"'));
  assert.ok(uiSource.includes("frameQuality==='efficient'"));
  assert.ok(uiSource.includes('characterArt.smoothFrames'));
  assert.ok(uiSource.includes('characterArt.animationFrames||[3]'));
  assert.ok(uiSource.includes('if(reduced())'));
  assert.ok(uiSource.includes("window.navigator?.connection?.saveData"));
  assert.ok(gallerySource.includes('art.smoothFrames||art.animationFrames'));
  assert.doesNotMatch(artSource,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage/);
  assert.doesNotMatch(uiSource,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
  assert.match(read('sw.js'),/pawtopia-battle-character-art\.js/);
  assert.match(read('.github/workflows/verify.yml'),/pawtopia-smooth-articulated-cats\.test\.cjs/);
});
