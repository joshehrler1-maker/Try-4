'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const assets=[
'assets/pawtopia-battle-data.js',
'assets/pawtopia-battle-engine.js',
'assets/pawtopia-battle-character-art.js',
'assets/pawtopia-battle-foe-art.js',
'assets/pawtopia-battle-watch.js',
'assets/pawtopia-battle-cinematics.js',
'assets/pawtopia-battle-arena.js',
'assets/pawtopia-battle-motion.js'
].map(read);
const clone=obj=>JSON.parse(JSON.stringify(obj));
function loadPure(){
 const window={};
 for(const script of [assets[0],assets[1],assets[3],assets[5]])vm.runInNewContext(script,{window});
 return window;
}
test('defensive moves and zero-damage blows never trigger damaging impact or camera shake',()=>{
 const w=loadPure(),visual=w.PawtopiaBattleCinematics.combatVisual;
 const guard=visual({who:'pet',name:'Guard Curl',fx:'guard',damage:0});
 const foeGuard=visual({who:'foe',name:'Iron Guard',fx:'guard',damage:0});
 const blocked=visual({who:'foe',name:'Metal Paw Strike',fx:'swipe',damage:0,detail:'Dodged or blocked!'});
 const charge=visual({who:'foe',name:'Gear Fang Charge',fx:'impact',damage:9});
 const hit=visual({who:'pet',name:'Paw Swipe',fx:'swipe',damage:5});
 for(const item of [guard,foeGuard,blocked]){
  assert.equal(item.contact,false);
  assert.equal(item.defense,true);
  assert.equal(item.cameraShake,false);
  assert.equal(item.defenderPose,'guard');
  assert.ok(item.label.length>0);
 }
 assert.equal(blocked.label,'BLOCKED');
 const dodge=visual({who:'foe',fx:'swipe',damage:0,reaction:'dodge'});
 assert.equal(dodge.label,'DODGED');
 assert.equal(dodge.cameraShake,false);
 assert.equal(charge.charge,true);
 assert.equal(charge.foeMove,'charge');
 assert.equal(charge.contact,true);
 assert.equal(hit.cameraShake,true);
 assert.equal(hit.label,'');
});
test('all arena challengers have distinct charge frames, not regular swipes',()=>{
 const w=loadPure(),art=w.PawtopiaBattleFoeArt;
 assert.equal(art.models.length,208);
 assert.ok(art.states.includes('charge'));
 const chargeShapes=new Set;
 let total=0;
 for(const foe of art.models){
   const frames=art.frameIds.map(frame=>art.drawing(foe,'charge',frame));
   assert.equal(new Set(frames).size,6,foe.name);
   for(const svg of frames){
     assert.ok(svg.includes('class="foe-charge-streak"'),foe.name);
     assert.ok(svg.includes('data-pose="charge"'),foe.name);
     assert.ok(svg.includes('data-foe-id="'+foe.id+'"'),foe.name);
     assert.ok(!/(NaN|Infinity|undefined)/.test(svg),foe.name);
     total++;
   }
   assert.notEqual(art.drawing(foe,'swipe',3),frames[3]);
   chargeShapes.add(frames[3]);
 }
 assert.equal(chargeShapes.size,art.models.length);
 assert.equal(total,art.models.length*6);
});
class MockElement{
 constructor(tag='div'){
  this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attributes={};
  this.disabled=false;this.hidden=false;this.value='';this.max=100;this.textContent='';this.paints=[];
  this._html='';this.styleVals={};
  this.style={setProperty:(k,v)=>{this.styleVals[k]=v;},getPropertyValue:k=>this.styleVals[k]||'',
    backgroundImage:'',backgroundSize:'',backgroundPosition:''};
  this.classes=new Set;this.added=[];
  this.classList={add:(...classes)=>{classes.forEach(x=>{this.added.push(x);this.classes.add(x);});},
   remove:(...classes)=>classes.forEach(x=>this.classes.delete(x)),
   toggle:(c,value)=>value?this.classes.add(c):this.classes.delete(c),
   contains:c=>this.classes.has(c)};
 }
 set innerHTML(value){this._html=value;if(value.includes('foe-body-illustration'))this.paints.push(value);}
 get innerHTML(){return this._html;}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 addEventListener(type,callback){this.listeners[type]=callback;}
 setAttribute(name,value){this.attributes[name]=value;}
 querySelectorAll(name){return this.children.filter(x=>name==='button'?x.tag==='button':true);}
 closest(name){return name.startsWith('button')&&this.tag==='button'?this:null;}
 remove(){this.removed=true;}
 get offsetWidth(){return 120;}
 get clientWidth(){return 440;}
 getBoundingClientRect(){return {left:this.left||0,top:0,width:this.clientWidth,height:260};}
}
function arena(cat,foeIndex=0){
 const nodes=new Map;
 const el=id=>{if(!nodes.has(id))nodes.set(id,new MockElement);return nodes.get(id);};
 const document={getElementById:el,createElement:tag=>new MockElement(tag),hidden:false,addEventListener(){}};
 let progress={coins:13,food:0,shards:0,battleUnlocked:12,companion:cat,otherCompanions:[]};
 const window={matchMedia:()=>({matches:false}),addEventListener(){},
  PawtopiaSave:{read:()=>clone(progress),update:async fn=>{
   const current=clone(progress),result=fn(current);
   if(result)progress=current;
   return result;
  }}};
 el('battle-pet-sprite').left=35;
 el('battle-foe-sprite').left=265;
 let clock=0;
 window.performance={now:()=>clock};
 const setTimeout=(fn,delay=0)=>{Promise.resolve().then(()=>{clock+=delay;fn();});return 1;};
 const deterministicMath=Object.create(Math);
 deterministicMath.random=()=>.5;
 for(const asset of assets)vm.runInNewContext(asset,{window,document,setTimeout,Math:deterministicMath});
 const foes=window.PawtopiaBattleData.foes;
 const index=foes.findIndex(foe=>foe.id==='foe-'+(foeIndex+1));
 if(foeIndex)el('battle-foe-tier').listeners.change({target:{value:String(foes[index].rank)}});
 const choose=el('battle-foe-list').children.find(button=>Number(button.dataset.foe)===index);
 return {window,el,choose,getSave:()=>clone(progress)};
}
test('zero-damage defense animations show guard and a label without a fake hit',async()=>{
 const a=arena({name:'Mochi',breed:'Maine Coon',stats:{
  level:3,strength:2,defence:50,movement:2,endurance:10,intelligence:2
 }});
 await a.el('battle-start').listeners.click();
 const guard=a.el('battle-moves').children.find(b=>b.dataset.move==='guard');
 assert.equal(guard.disabled,false);
 await a.el('battle-moves').listeners.click({target:guard});
 const progress=a.getSave();
 assert.equal(progress.battleMatch.round,2);
 assert.equal(progress.battleMatch.hp,a.window.PawtopiaBattleEngine.maxHp(progress.companion));
 assert.equal(progress.battleMatch.foeHp,a.window.PawtopiaBattleData.foes[0].hp);
 assert.equal(progress.coins,13);
 assert.equal(a.el('battle-pet-sprite').added.includes('state-impact'),false,
  'A fully blocked foe blow must not hit-flinch the cat');
 assert.equal(a.el('battle-foe-sprite').added.includes('state-impact'),false);
 assert.equal(a.el('battle-vfx').children.filter(x=>x.className==='battle-impact-ring').length,0);
 const defense=a.el('battle-vfx').children.filter(x=>x.className==='defense-popup');
 assert.ok(defense.length>=2,'Both guard action and blocked attack should have defense labels');
 assert.equal(a.el('battle-cat-art').innerHTML.includes('paw-battle-full-body'),true);
});
test('real foe heavy attack plays charge frames with real contact while keeping game values',async()=>{
 const a=arena({name:'Mochi',breed:'Bengal',stats:{
  level:3,strength:2,defence:1,movement:2,endurance:24,intelligence:2
 }},3);
 await a.el('battle-foe-list').listeners.click({target:a.choose});
 await a.el('battle-start').listeners.click();
 for(let i=0;i<3;i++){
  const swipe=a.el('battle-moves').children.find(b=>b.dataset.move==='swipe');
  await a.el('battle-moves').listeners.click({target:swipe});
 }
 const progress=a.getSave();
 assert.equal(progress.battleMatch.round,4);
 assert.equal(progress.battleMatch.finished,false);
 assert.equal(progress.coins,13);
 const drawings=a.el('battle-foe-art').paints;
 assert.ok(drawings.some(svg=>svg.includes('data-pose="charge"')),'Round 3 heavy attack must use actual charge drawings');
 assert.ok(drawings.some(svg=>svg.includes('data-pose="swipe"')),'Normal rounds still use swipe');
 assert.ok(a.el('battle-vfx').children.some(e=>e.className==='battle-impact-ring'),
  'Positive damage still produces a real impact ring');
});
test('no adopted cat no longer displays the default Maine Coon as if owned',()=>{
 const a=arena(null);
 const portrait=a.el('battle-cat-art');
 assert.equal(portrait.dataset.breed,'');
 assert.equal(portrait.innerHTML,'');
 assert.equal(portrait.style.backgroundImage,'none');
 assert.ok(a.el('battle-pet-sprite').classList.contains('needs-adoption'));
 assert.equal(a.el('battle-cat-tag').textContent,'ADOPT A CAT');
 assert.equal(a.el('battle-start').disabled,true);
 assert.equal(a.el('battle-watch').disabled,true);
});
test('new UI preserves zero-cost engine and makes visual guard vs hit explicit',()=>{
 const css=read('assets/pawtopia-battle-arena.css'),ui=assets[6];
 assert.ok(css.includes('.defense-popup'));
 assert.ok(css.includes('.needs-adoption .cat-avatar'));
 assert.ok(css.includes('data-pose="charge"'));
 assert.ok(ui.includes('motion.reaction(clip,t,defenderWidth'));
 assert.ok(ui.includes('if(combat?.cameraShake)cameraContact(evt,visual,color,point)'));
 assert.ok(ui.includes('await playExchange(evt,visual,kit,cat,foe,equipped,stance'));
 assert.ok(read('.github/workflows/verify.yml').includes('tests/pawtopia-battle-visual-truth.test.cjs'));
 assert.doesNotMatch(assets[5]+assets[6],/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
});
