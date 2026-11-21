'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const dataSource=read('assets/pawtopia-battle-data.js');
const artSource=read('assets/pawtopia-battle-character-art.js');
function load(){
  const window={};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(artSource,{window});
  return {data:window.PawtopiaBattleData,art:window.PawtopiaBattleCharacterArt};
}

test('all 56 specific breed/skill names map to hand-authored fighting identities',()=>{
  const {data,art}=load();
  assert.equal(data.kits.length,56);
  assert.equal(art.fightingStyles.length,56);
  const labels=new Set,indices=new Set,techniques=new Set;
  for(let i=0;i<data.kits.length;i++){
    const kit=data.kits[i],style=art.fightingStyles[i],profile=art.getArt(kit.breed);
    assert.equal(style.breed,kit.breed);
    assert.equal(style.signature,kit.signature);
    assert.equal(profile.fightingStyle,style);
    assert.equal(art.identityFor(kit.breed),style);
    assert.ok(['left','right'].includes(style.lead));
    assert.ok(style.label.length>5);
    assert.ok(style.reach>=18&&style.reach<=42);
    assert.ok(style.arc>=8&&style.arc<=42);
    assert.ok(style.tempo>0);
    labels.add(style.label);indices.add(style.serial);techniques.add(style.technique);
  }
  assert.equal(labels.size,56);
  assert.equal(indices.size,56);
  assert.ok(techniques.size>=11,'More than eight genuinely different attack techniques');
  assert.equal(art.identityFor('Siamese').label,'Twin Moon Cross');
  assert.equal(art.identityFor('Bengal').label,'Sunstripe Dash');
  assert.equal(art.identityFor('British Shorthair').label,'Royal Counter');
  assert.equal(art.identityFor('Sphynx').label,'Phantom Feint');
});

test('56 different signature movement trajectories, offhand reactions and skill arcs',()=>{
  const {art,data}=load();
  const traces=new Set,guards=new Set,finales=new Set;
  let total=0;
  for(const kit of data.kits){
    const profile=art.getArt(kit.breed),style=profile.fightingStyle;
    const signature=art.smoothFrames.map(frame=>art.choreograph(profile,'signature',frame));
    const ultimate=art.smoothFrames.map(frame=>art.choreograph(profile,'ultimate',frame));
    const guard=art.smoothFrames.map(frame=>art.choreograph(profile,'guard',frame));
    traces.add(JSON.stringify(signature));
    finales.add(JSON.stringify(ultimate));
    guards.add(JSON.stringify(guard));
    const lead=art.personalMotion(profile,'signature',3);
    assert.equal(lead.leadIndex,style.lead==='left'?0:1);
    assert.equal(lead.label,style.label);
    assert.equal(lead.technique,style.technique);
    for(const pose of ['swipe','signature','ultimate']){
      const frames=new Set;
      for(const frame of art.smoothFrames){
        const svg=art.svgForBreed(kit.breed,pose,frame);
        assert.ok(svg.includes('data-style="'+style.serial+'"'));
        assert.ok(svg.includes('data-technique="'+style.technique+'"'));
        assert.ok(svg.includes('class="art-fighting-style-trail"'));
        assert.ok(svg.includes('<image href="'+kit.sprite.src+'"'));
        assert.ok(!/(NaN|undefined|Infinity)/.test(svg));
        frames.add(svg);total++;
      }
      assert.equal(frames.size,11,kit.breed+' '+pose+' should stay animated');
    }
  }
  assert.equal(traces.size,56);
  assert.equal(finales.size,56);
  assert.equal(guards.size,56);
  assert.equal(total,56*3*11);
});

test('heavy, feint, counter and dash attacks use visibly different limb and torso trajectories',()=>{
  const {art}=load();
  const breeds=['Maine Coon','Sphynx','British Shorthair','Bengal'];
  const motions=breeds.map(breed=>{
    const profile=art.getArt(breed);
    return art.smoothFrames.map(frame=>art.choreograph(profile,'signature',frame));
  });
  assert.equal(new Set(motions.map(JSON.stringify)).size,4);
  for(let i=0;i<breeds.length;i++){
    const profile=art.getArt(breeds[i]);
    assert.notDeepEqual(
      JSON.parse(JSON.stringify(art.choreograph(profile,'signature',1))),
      JSON.parse(JSON.stringify(art.choreograph(profile,'signature',3)))
    );
    const weight=art.torsoWeight(profile,'signature',3);
    assert.ok(Number.isFinite(weight.shift)&&Number.isFinite(weight.tilt));
    const stance=art.choreograph(profile,'signature',3);
    assert.ok(Math.abs(stance[2][0]-art.choreograph(profile,'signature',0)[2][0])<=10);
  }
});

test('fight style is visible in Arena and Gallery, without touching battle stats',()=>{
  const arena=read('assets/pawtopia-battle-arena.js');
  const gallery=read('assets/pawtopia-battle-art-gallery.js');
  const html=read('pawtopia-battle-art-gallery.html');
  assert.ok(arena.includes('Fighting style: '));
  assert.ok(arena.includes('characterArt?.identityFor(pet.breed)?.label'));
  assert.ok(gallery.includes('profile.fightingStyle.label'));
  assert.ok(gallery.includes('profile.fightingStyle.lead'));
  assert.match(html,/Individual fighting style/);
  assert.doesNotMatch(artSource,/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|PawtopiaSave|sendBeacon/);
  assert.match(read('.github/workflows/verify.yml'),/pawtopia-personal-fighting-styles\.test\.cjs/);
});
