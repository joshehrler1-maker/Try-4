'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const dataSource = read('assets/pawtopia-battle-data.js');
const foeSource = read('assets/pawtopia-battle-foe-art.js');
const arenaSource = read('assets/pawtopia-battle-arena.js');
const arenaHtml = read('pawtopia-battle-arena.html');
const css = read('assets/pawtopia-battle-arena.css');
function setup() {
  const window = {};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(foeSource,{window});
  return {data:window.PawtopiaBattleData,art:window.PawtopiaBattleFoeArt};
}

test('all 12 ladder enemies map to twelve distinct and correctly named original canine models', () => {
  const {data,art} = setup();
  assert.equal(data.foes.length, 12);
  assert.equal(art.models.length, 12);
  assert.equal(new Set(Array.from(art.models,p=>p.id)).size,12);
  assert.equal(new Set(Array.from(art.models,p=>p.kind)).size,12);
  const bodies = new Set;
  for (const foe of data.foes) {
    const model = art.profile(foe);
    assert.equal(model.id,foe.id);
    assert.equal(model.name,foe.name);
    assert.equal(model.rank,foe.rank);
    assert.equal(model.color,foe.color);
    assert.ok(model.armor > 0);
    const body = art.drawing(model,'idle',3);
    assert.match(body,/class="foe-body-illustration"/);
    assert.ok(body.includes('data-foe-id="'+foe.id+'"'));
    assert.ok(body.includes('class="foe-head"'));
    assert.ok(body.includes('class="foe-arm foe-left-arm"'));
    assert.ok(body.includes('class="foe-arm foe-right-arm"'));
    if (foe.isBoss) assert.ok(body.includes('class="foe-gear-frame"'));
    else assert.ok(body.includes('data-dog-breed="'+foe.breed+'"'));
    bodies.add(body);
  }
  assert.equal(bodies.size,12,'All opponents must be visually different');
  assert.ok(art.drawing(art.profile('foe-12'),'idle').includes('class="foe-boss"'),'Final construct must have a distinctive crown/halo');
  assert.ok(!art.drawing(art.profile('foe-1'),'idle').includes('class="foe-boss"'),'Starter enemy must look simple');
});

test('all eight motion states contain six actual animated drawings per opponent', () => {
  const {art} = setup();
  assert.deepEqual(Array.from(art.states),['idle','approach','swipe','charge','guard','impact','victory','defeat']);
  assert.deepEqual(Array.from(art.frameIds),[0,1,2,3,4,5]);
  let states = 0, renderCount = 0;
  for(const foe of art.models) {
    const stateDrawings = new Set;
    for(const pose of art.states) {
      const frames = new Set;
      for(const n of art.frameIds) {
        const drawing = art.drawing(foe,pose,n);
        assert.ok(drawing.includes('data-pose="'+pose+'"'));
        assert.ok(drawing.includes('data-frame="'+n+'"'));
        assert.ok(drawing.endsWith('</svg>'));
        assert.ok(drawing.includes('class="foe-head"'));
        frames.add(drawing);
        renderCount++;
      }
      assert.equal(frames.size,6,foe.name+' '+pose+' should have six distinct frames');
      stateDrawings.add(art.drawing(foe,pose,3));
      states++;
    }
    assert.equal(stateDrawings.size,8,foe.name+' requires all eight different action states');
  }
  assert.equal(states,12*8);
  assert.equal(renderCount,12*8*6);
});

test('foe attack, guarding, boss and victory shapes are meaningful, not only label changes', () => {
  const {art} = setup();
  for(const foe of art.models) {
    const swipe = art.drawing(foe,'swipe',3);
    const guard = art.drawing(foe,'guard',3);
    const charge = art.drawing(foe,'charge',3);
    assert.ok(charge.includes('class="foe-charge-streak"'),foe.name+' heavy-charge streak');
    assert.notEqual(charge,swipe,'Heavy charge must not repeat the simple swipe');
    const hit = art.drawing(foe,'impact',3);
    assert.ok(swipe.includes('class="foe-slash"'),foe.name+' attack arc');
    assert.ok(guard.includes('class="foe-guard"'),foe.name+' shield pose');
    assert.ok(hit.includes('class="foe-impact-mark"'),foe.name+' impact drawing');
    assert.notEqual(swipe,guard);
    assert.notEqual(guard,hit);
  }
  const {data}=setup();
  const dogs=data.foes.slice(0,-1),boss=data.foes.at(-1);
  assert.equal(new Set(dogs.map(dog=>dog.breed)).size,11);
  assert.equal(dogs[0].breed,'Chihuahua');
  assert.equal(dogs.at(-1).breed,'English Mastiff');
  assert.equal(boss.name,'Baron Brasswhirl');
  assert.equal(boss.isBoss,true);
  for(let i=1;i<data.foes.length;i++){
    const previous=data.foes[i-1],next=data.foes[i];
    assert.ok(next.hp>previous.hp && next.attack>previous.attack && next.defence>=previous.defence);
    assert.ok(art.profile(next).size>art.profile(previous).size);
  }
  assert.ok(art.drawing(art.profile('foe-12'),'idle').includes('class="foe-boss"'));
});

test('displaying different opponents never writes to the player save', () => {
  const {data,art} = setup();
  const saved={coins:44,battleUnlocked:7,companion:{name:'Mochi',breed:'Bengal',battle:{wins:3}}};
  const before=JSON.stringify(saved);
  const container={
    innerHTML:'',dataset:{},attributes:{},
    setAttribute(k,v){this.attributes[k]=v;}
  };
  for(const foe of data.foes){
    for(const pose of ['idle','approach','swipe','charge','guard','impact','victory','defeat']){
      assert.equal(art.paint(container,foe,pose,3),true);
      assert.equal(container.dataset.foe,foe.id);
      assert.equal(container.dataset.pose,pose);
      assert.match(container.innerHTML,/foe-body-illustration/);
    }
  }
  assert.equal(JSON.stringify(saved),before);
});

test('arena loads and animates the actual selected rank, while keeping fallback art', () => {
  assert.match(arenaHtml, /src="assets\/pawtopia-battle-foe-art\.js(?:\?[^"]*)?"/);
  assert.ok(arenaHtml.indexOf('pawtopia-battle-foe-art.js')<arenaHtml.indexOf('pawtopia-battle-arena.js'));
  assert.ok(arenaHtml.includes('id="battle-foe-art"'));
  assert.ok(arenaHtml.includes('class="foe-illustration"'));
  assert.ok(arenaSource.includes("foeArt.paint(el('battle-foe-art'),activeFoe"));
  assert.match(arenaSource,/async function playFoeFrames\(foe,state,duration=440\)/);
  assert.ok(arenaSource.includes("foeMotion=playFoeFrames(currentFoe,combat?.foeMove||'swipe',combat?.charge?590:470)"));
  assert.ok(arenaSource.includes("hitMotion=playFoeFrames(currentFoe,reaction,320)"));
  assert.ok(arenaSource.includes("playFoeFrames(currentFoe,'defeat',360)"));
  assert.ok(arenaSource.includes("playFoeFrames(currentFoe,'victory',360)"));
  assert.ok(css.includes('.has-foe-art .foe-avatar'));
  assert.match(read('sw.js'),/assets\/pawtopia-battle-foe-art\.js/);
  assert.doesNotMatch(foeSource, /\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sendBeacon/);
});
