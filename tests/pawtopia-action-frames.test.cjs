'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
function load(){
  const window={};
  vm.runInNewContext(read('assets/pawtopia-battle-data.js'),{window});
  vm.runInNewContext(read('assets/pawtopia-battle-character-art.js'),{window});
  return {data:window.PawtopiaBattleData,artist:window.PawtopiaBattleCharacterArt};
}
const trace=frames=>JSON.stringify(frames); // Include paw tips, not only shoulder positions

test('all 56 adopted breeds have six progressive body drawings for all four unlockable moves',()=>{
  const {data,artist}=load(),steps=Array.from(artist.animationFrames);
  assert.deepEqual(steps,[0,1,2,3,4,5]);
  assert.equal(artist.collection.length,56);
  let checked=0;
  const uniqueByAction=new Map;
  for(const pose of ['swipe','guard','signature','ultimate']){
    const signatures=new Set;
    for(const kit of data.kits){
      const profile=artist.getArt(kit.breed);
      assert.ok(profile.choreography.reach>=8&&profile.choreography.reach<=40);
      const frames=steps.map(frame=>artist.svgForBreed(kit.breed,pose,frame));
      const bodyFrames=new Set(frames);
      assert.equal(bodyFrames.size,6,kit.breed+' '+pose+' frames must move');
      for(const drawing of frames){
        assert.ok(drawing.includes('<image href="'+kit.sprite.src+'"'));
        assert.ok(drawing.includes('art-paw-right'));
        assert.ok(drawing.includes('art-body'));
        assert.ok(drawing.endsWith('</svg>'));
        if(pose==='signature'||pose==='ultimate')assert.ok(drawing.includes('class="art-ability"'));
        checked++;
      }
      signatures.add(trace(steps.map(frame=>artist.choreograph(profile,pose,frame))));
    }
    uniqueByAction.set(pose,signatures.size);
    assert.equal(signatures.size,56,'Every breed should have a distinct '+pose+' choreography');
  }
  assert.equal(checked,56*4*6);
  assert.equal(uniqueByAction.get('ultimate'),56);
});

test('windup, contact and recoil positions differ for every cat and maintain correct basic pose',()=>{
  const {artist}=load();
  for(const cat of artist.collection){
    for(const action of ['swipe','signature','ultimate']){
      const a=artist.choreograph(cat,action,0);
      const b=artist.choreograph(cat,action,3);
      const c=artist.choreograph(cat,action,5);
      assert.notDeepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),cat.breed+' '+action);
      assert.notDeepEqual(JSON.parse(JSON.stringify(b)),JSON.parse(JSON.stringify(c)),cat.breed+' '+action);
    }
    assert.ok(artist.timingFor(cat.breed,'ultimate')>artist.timingFor(cat.breed,'swipe'));
    assert.ok(artist.timingFor(cat.breed,'signature')>artist.timingFor(cat.breed,'guard'));
  }
});

test('preview changes actual SVG drawings and stays independent of any stored battle progress',()=>{
  const {artist}=load();
  const elements=new Set,element={dataset:{},style:{backgroundImage:'legacy'},
    classList:{add:name=>elements.add(name)},innerHTML:''};
  const localSave={companion:{name:'Mochi',breed:'Bengal',stats:{level:1}},coins:18,battleUnlocked:2};
  const before=JSON.stringify(localSave);
  artist.paint(element,'Bengal','swipe',0);
  const first=element.innerHTML;
  assert.equal(element.dataset.frame,'0');
  artist.paint(element,'Bengal','swipe',3);
  assert.equal(element.dataset.frame,'3');
  assert.notEqual(element.innerHTML,first);
  assert.ok(elements.has('has-body-art'));
  assert.equal(element.dataset.pose,'swipe');
  assert.equal(element.style.backgroundImage,'none');
  artist.paint(element,'Bengal','ultimate',4);
  assert.ok(element.innerHTML.includes('class="art-ability"'));
  assert.equal(JSON.stringify(localSave),before);
});

test('source routes six-frame drawings through both combat events and the no-cost preview',()=>{
  const script=read('assets/pawtopia-battle-arena.js');
  const art=read('assets/pawtopia-battle-character-art.js');
  const page=read('pawtopia-battle-arena.html');
  assert.ok(script.includes('async function playArtFrames(cat,state,duration)'));
  assert.ok(script.includes('characterArt.smoothFrames)||characterArt.animationFrames||[3]'));
  assert.ok(script.includes("characterArt.paint(el('battle-cat-art'),cat.breed,state,frame)"));
  assert.ok(script.includes("motion=playArtFrames(cat,'swipe'"));
  assert.ok(script.includes("hitMotion=playArtFrames(cat,reaction,310)"));
  assert.ok(script.includes('await Promise.all([motion,foeMotion,hitMotion])'));
  assert.ok(script.includes('await playArtFrames(cat,pose,characterArt.timingFor(cat.breed,pose))'));
  assert.ok(script.includes('if(reduced())'));
  assert.match(page,/id="battle-art-preview-actions"/);
  assert.match(art,/function choreograph\(art,pose,frame=3\)/);
  assert.doesNotMatch(script+art,/\bfetch\s*\(|WebSocket|XMLHttpRequest|sendBeacon/);
});
