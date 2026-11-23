'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const battleData=read('assets/pawtopia-battle-data.js');
const engineData=read('assets/pawtopia-battle-engine.js');
const ui=read('assets/pawtopia-battle-arena.js');
const css=read('assets/pawtopia-battle-arena.css');
const page=read('pawtopia-battle-arena.html');
const clone=object=>JSON.parse(JSON.stringify(object));
function createWorld(){
  const window={};
  vm.runInNewContext(battleData,{window});
  vm.runInNewContext(engineData,{window,Date,Math});
  return {data:window.PawtopiaBattleData,engine:window.PawtopiaBattleEngine};
}
function cat(name='Mochi',breed='Maine Coon',level=1){
  return {name,breed,fullness:65,happiness:65,updatedAt:1234,stats:{
    level,strength:2,defence:2,movement:2,endurance:2,intelligence:2
  }};
}
const fresh=()=>({hero:'Whisker',coins:0,food:0,toy:false,shards:0,bankCoins:10,
  townCollection:{},companion:cat(),otherCompanions:[],lastClaim:'Today'});
const guaranteed=()=>.9; // Engine accepts RNG functions; a bare number falls back to Math.random.

test('all 56 approved breeds map to distinct current art cells and move identities',()=>{
  const {data}=createWorld();
  const cottage=read('assets/companion-cottage.js');
  const original=JSON.parse(cottage.match(/const originalBreeds = (\[[^\n]+\]);/)[1].replace(/'/g,'"'));
  const catalog=JSON.parse(cottage.match(/const catalogBreeds = (\[[^\n]+\]);/)[1]);
  assert.equal(original.length,6);
  assert.equal(catalog.length,50);
  assert.equal(data.kits.length,56);
  assert.equal(data.breeds.length,56);
  assert.deepEqual(Array.from(data.breeds),[...original,...catalog]);
  assert.equal(new Set(Array.from(data.kits,x=>x.id)).size,56);
  assert.equal(new Set(Array.from(data.kits,x=>x.signature)).size,56);
  assert.equal(new Set(Array.from(data.kits,x=>x.ultimate)).size,56);
  const artCells=Array.from(data.kits,x=>x.sprite.src+'|'+x.sprite.backgroundPosition);
  assert.equal(new Set(artCells).size,56);
  const worker=read('sw.js');
  for(const kit of data.kits){
    assert.equal(kit.animations.length,8,kit.breed);
    assert.ok(kit.movement,kit.breed);
    assert.ok(kit.theme.color.startsWith('#'));
    assert.ok(fs.existsSync(path.join(root,kit.sprite.src)),'Missing approved source image for '+kit.breed);
    assert.equal(data.kitFor(kit.breed).breed,kit.breed);
  }
  assert.equal(data.kits[6].sprite.src,'assets/scenes/adopt-catalog-1.webp');
  assert.equal(data.kits[30].sprite.backgroundPosition,'100% 100%');
  assert.equal(data.kits[31].sprite.src,'assets/scenes/adopt-catalog-2.webp');
});

test('each cat has four moves and unlocks at levels 1, 3, 6, 10',()=>{
  const {data,engine}=createWorld();
  const pet=cat('Mochi','Russian Blue',1);
  const names=data.movesFor(pet);
  assert.deepEqual(Array.from(names,x=>x.id),['swipe','guard','signature','ultimate']);
  assert.deepEqual(Array.from(names,x=>x.level),[1,3,6,10]);
  assert.match(names[2].name,/Mochi/);
  assert.match(names[2].name,/Azure Arc/);
  assert.deepEqual(Array.from(engine.moveList(pet),x=>x.unlocked),[true,false,false,false]);
  pet.stats.level=3;
  assert.deepEqual(Array.from(engine.moveList(pet),x=>x.unlocked),[true,true,false,false]);
  pet.stats.level=6;
  assert.deepEqual(Array.from(engine.moveList(pet),x=>x.unlocked),[true,true,true,false]);
  pet.stats.level=10;
  assert.deepEqual(Array.from(engine.moveList(pet),x=>x.unlocked),[true,true,true,true]);
});

test('real match plays through multiple turns and pays one verified fictional reward',()=>{
  const {data,engine}=createWorld(),p=fresh();
  const before=clone(p);
  assert.equal(engine.start(p,0,data.foes.findIndex(foe=>foe.rank===2)).ok,false,'Tier two is locked');
  assert.deepEqual(p,before,'Invalid challenge does not corrupt save');
  assert.equal(engine.start(p,0,0).ok,true);
  assert.equal(engine.matchInfo(p).foe.name,data.foes[0].name);
  assert.equal(engine.start(p,0,0).ok,false,'Cannot overwrite active fight');
  let turns=0,last;
  while(!p.battleMatch.finished&&turns++<20){
    last=engine.takeTurn(p,'swipe',guaranteed);
    assert.equal(last.ok,true);
    assert.ok(last.events.length>=1);
    assert.ok(last.events.some(evt=>evt.who==='pet'));
  }
  assert.equal(p.battleMatch.result,'win');
  assert.equal(turns,4);
  assert.equal(p.coins,data.foes[0].coins);
  assert.equal(p.companion.battle.wins,1);
  assert.equal(engine.unlocked(p),2);
  assert.equal(last.events.at(-1).fx,'victory');
  assert.ok(p.battleMatch.history.includes('Victory! '+last.rewards.join(' · ')));
  const after=clone(p);
  assert.equal(engine.takeTurn(p,'swipe',guaranteed).ok,false,'Finished fight cannot pay again');
  assert.equal(JSON.stringify(p),JSON.stringify(after),'Repeated win never adds more coins');
  assert.equal(before.bankCoins,p.bankCoins,'Never touches owner bank or external payouts');
  assert.equal(before.hero,p.hero,'Preserve user hero and adoption state');
});

test('pet records and IDs stay independent, even if cats share a breed',()=>{
  const {engine}=createWorld(),p=fresh();
  p.otherCompanions=[cat('Snowflake','Maine Coon',10)];
  assert.equal(engine.start(p,0,0).ok,true);
  while(!p.battleMatch.finished)engine.takeTurn(p,'swipe',guaranteed);
  assert.equal(engine.profile(p.companion).wins,1);
  assert.equal(engine.profile(p.otherCompanions[0]).wins,0);
  assert.notEqual(p.companion.battleId,p.otherCompanions[0].battleId);
  assert.equal(engine.start(p,1,0).ok,true);
  assert.ok(p.battleMatch.petId===p.otherCompanions[0].battleId);
  assert.equal(engine.forfeit(p).ok,true);
  assert.equal(engine.profile(p.otherCompanions[0]).losses,1);
  assert.equal(engine.profile(p.companion).losses,0);
  assert.equal(engine.profile(p.companion).wins,1);
  assert.equal(p.otherCompanions[0].stats.level,10);
});

test('signature cooldown and once-per-battle ultimate are enforced',()=>{
  const {engine}=createWorld(),p=fresh();
  p.companion.stats.level=10;
  p.companion.stats.endurance=20;
  assert.equal(engine.start(p,0,0).ok,true);
  assert.equal(engine.moveList(p.companion,p.battleMatch)[2].ready,true);
  const signature=engine.takeTurn(p,'signature',guaranteed);
  assert.equal(signature.ok,true);
  assert.equal(engine.moveList(p.companion,p.battleMatch)[2].ready,false);
  const snapshot=clone(p);
  assert.equal(engine.takeTurn(p,'signature',guaranteed).ok,false);
  assert.equal(JSON.stringify(p),JSON.stringify(snapshot));
  if(!p.battleMatch.finished)engine.takeTurn(p,'swipe',guaranteed);
  assert.equal(engine.moveList(p.companion,p.battleMatch)[2].ready,true);
  const another=fresh();another.companion.stats.level=10;another.companion.stats.endurance=20;
  engine.start(another,0,11); // locked; must unlock to test
  another.battleUnlocked=12;
  engine.start(another,0,11);
  assert.equal(engine.moveList(another.companion,another.battleMatch)[3].ready,true);
  engine.takeTurn(another,'ultimate',guaranteed);
  assert.equal(engine.moveList(another.companion,another.battleMatch)[3].ready,false);
});

test('stronger enemies offer strictly increasing coins and XP, guaranteed shards and trophies',()=>{
  const {engine,data}=createWorld(),p=fresh();
  for(let i=1;i<data.foes.length;i++){
    assert.ok(data.foes[i].coins>=data.foes[i-1].coins);
    assert.ok(data.foes[i].xp>=data.foes[i-1].xp);
    assert.ok(data.foes[i].hp>=data.foes[i-1].hp);
  }
  p.battleUnlocked=12;
  p.companion.stats={level:50,strength:150,defence:70,movement:80,endurance:55,intelligence:60};
  assert.equal(engine.start(p,0,data.foes.length-1).ok,true);
  const result=engine.takeTurn(p,'ultimate',guaranteed);
  assert.equal(result.ok,true);
  assert.equal(p.battleMatch.result,'win');
  assert.equal(p.coins,data.foes.at(-1).coins);
  assert.ok(p.shards>=3);
  assert.equal(p.toy,true);
  assert.ok(p.companion.battle.trophies.includes('Golden Paw Crown'));
  assert.equal(engine.profile(p.companion).bestRank,12);
  assert.equal(result.events.at(-1).fx,'victory');
  assert.ok(engine.level(p.companion)>=50);
});

test('failed fights do not remove existing coins, adopted cat, or owned items',()=>{
  const {engine,data}=createWorld(),p=fresh();
  p.coins=42;p.food=3;p.shards=4;p.toy=true;p.battleUnlocked=12;
  assert.equal(engine.start(p,0,data.foes.length-1).ok,true);
  let turns=0;
  while(!p.battleMatch.finished&&turns++<20)engine.takeTurn(p,'swipe',guaranteed);
  assert.equal(p.battleMatch.result,'loss');
  assert.equal(engine.profile(p.companion).losses,1);
  assert.equal(p.coins,42);
  assert.equal(p.food,3);
  assert.equal(p.shards,4);
  assert.equal(p.toy,true);
  assert.equal(p.companion.name,'Mochi');
  assert.equal(engine.start(p,0,0).ok,true,'Can try again after loss');
});

test('battle saves reload as serializable profiles with limited logs',()=>{
  const {engine}=createWorld(),p=fresh();
  engine.start(p,0,0);
  engine.takeTurn(p,'swipe',guaranteed);
  const loaded=clone(p);
  assert.equal(engine.matchInfo(loaded).foe.rank,1);
  assert.equal(engine.matchInfo(loaded).cat.name,'Mochi');
  assert.ok(engine.matchInfo(loaded).match.history.length>1);
  assert.ok(engine.matchInfo(loaded).match.history.length<=24);
  assert.ok(engine.profile(loaded.companion).xp>=0);
});

test('actual UI displays moving fighters and has no account or paid APIs',()=>{
  for(const file of ['index.html','pawtopia-companions.html','pawtopia-town.html','pawtopia-arcade.html']){
    assert.match(read(file),/href="pawtopia-battle-arena\.html"/,file);
  }
  for(const id of ['battle-stage','battle-pet-sprite','battle-foe-sprite','battle-cat-art','battle-vfx',
    'battle-moves','battle-start','battle-pet-select','battle-foe-list','battle-log','battle-outcome']){
    assert.ok(page.includes('id="'+id+'"'),id);
  }
  for(const name of ['pet-lunge','foe-lunge','pet-swipe','foe-swipe','kit-powercast',
    'pet-impact','foe-impact','victory-bounce','defeat-fall','particle-flight']){
    assert.ok(css.includes('@keyframes '+name),name);
  }
  for(const movement of ['bounce','dash','sway','spring','glide','spin','float','sprint']){
    assert.ok(css.includes('[data-motion="'+movement+'"]'),movement);
  }
  assert.match(ui,/async function showEvents\(events,cat,preview=false\)/);
  assert.match(ui,/async function saveAction/);
  assert.match(ui,/progress\.value=evt\.remaining/);
  assert.match(read('sw.js'),/pawtopia-battle-arena\.html/);
  assert.match(read('sitemap.xml'),/pawtopia-battle-arena\.html/);
  assert.doesNotMatch(battleData+engineData+ui,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
});

test('starter wins advance training promptly and revised variants retain saved combat stats',()=>{
  const {data,engine}=createWorld(), p=fresh();
  assert.equal(engine.start(p,0,0).ok,true);
  for(let i=0;i<20&&!p.battleMatch.finished;i++)engine.takeTurn(p,'swipe',()=>.5);
  assert.equal(p.battleMatch.result,'win');
  assert.equal(engine.level(p.companion),2);
  assert.equal(engine.unlocked(p),2);
  const variantIndex=data.foes.findIndex(foe=>foe.rank===1&&foe.hp>foe.legacyHp);
  assert.ok(variantIndex>0);
  assert.equal(engine.start(p,0,variantIndex).ok,true);
  const variant=data.foes[variantIndex];
  assert.equal(engine.matchInfo(p).foeMaxHp,variant.hp);
  delete p.battleMatch.foeCombat;
  assert.equal(engine.matchInfo(p).foeMaxHp,variant.legacyHp);
});

test('solo cues match the actual strike, charge and brace for the current turn',()=>{
  const {data,engine}=createWorld();
  for(const [round,kind,name] of [[2,'strike','Paw Strike'],[3,'charge','Rushing Charge'],[15,'brace','Brace']]){
    const progress=fresh();
    progress.companion=cat('Mochi','Maine Coon',10);
    progress.battleUnlocked=4;
    const index=data.foes.findIndex(foe=>foe.rank===4);
    assert.ok(engine.start(progress,0,index).ok);
    const view=engine.matchInfo(progress);
    view.match.round=round;
    assert.equal(engine.foeIntent(view.foe,view.match).id,kind);
    const turn=engine.takeTurn(progress,'guard',guaranteed);
    assert.ok(turn.events.some(event=>event.who==='foe' && event.name===name));
  }
});

test('visual events report actual dodge, healing and guard state',()=>{
  const {engine}=createWorld();
  const progress=fresh();
  progress.companion=cat('Mochi','Maine Coon',6);
  assert.ok(engine.start(progress,0,0).ok);
  const match=engine.matchInfo(progress).match;
  match.hp-=7;
  match.gear.guardHeal=3;
  match.dodge=1;
  const result=engine.takeTurn(progress,'guard',()=>0);
  const guard=result.events.find(event=>event.name==='Guard Curl');
  assert.equal(guard.restored,3);
  assert.ok(guard.effects.guard>0);
  assert.equal(guard.effects.dodge,1);
  const incoming=result.events.find(event=>event.who==='foe');
  assert.equal(incoming.reaction,'dodge');
  assert.equal(incoming.damage,0,'A dodge must stay damage-free even when the opponent rolls a critical');
  assert.equal(incoming.effects.dodge,0);
  assert.equal(incoming.petHp,guard.petHp);
});
