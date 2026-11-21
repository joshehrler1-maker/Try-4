'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const scripts=[
  'assets/pawtopia-battle-data.js','assets/pawtopia-battle-engine.js',
  'assets/pawtopia-battle-character-art.js','assets/pawtopia-battle-foe-art.js',
  'assets/pawtopia-battle-watch.js','assets/pawtopia-battle-cinematics.js',
  'assets/pawtopia-battle-arena.js'
].map(read);
const copy=obj=>JSON.parse(JSON.stringify(obj));

function world(){
  const window={};
  vm.runInNewContext(scripts[0],{window});
  vm.runInNewContext(scripts[5],{window});
  return {data:window.PawtopiaBattleData,cine:window.PawtopiaBattleCinematics};
}

test('all 56 cats generate specific, typed skill effects and safe move announcements',()=>{
  const {data,cine}=world(),signatureAssets=new Set,ultimateAssets=new Set;
  for(const kit of data.kits){
    const signature=cine.presentation({who:'pet',name:'Mochi’s '+kit.signature,damage:13,fx:kit.theme.type},kit,data.foes[5]);
    const ultimate=cine.presentation({who:'pet',name:'Mochi’s '+kit.ultimate,damage:43,fx:kit.theme.type},kit,data.foes[5]);
    assert.equal(signature.skill,'signature',kit.breed);
    assert.equal(ultimate.skill,'ultimate',kit.breed);
    assert.equal(signature.power,'strong');
    assert.equal(ultimate.power,'ultimate');
    assert.equal(signature.color,kit.theme.color);
    assert.ok(cine.symbols[kit.theme.type]);
    assert.equal(signature.skillAssetId,kit.id);
    assert.equal(ultimate.skillAssetId,kit.id);
    assert.equal(signature.side,'pet');
    assert.ok(signature.title.includes(kit.signature));
    signatureAssets.add(signature.skillAssetId);
    ultimateAssets.add(ultimate.skillAssetId);
    assert.equal(cine.skillId({who:'pet',name:'Paw Swipe'},kit),null);
    assert.equal(cine.skillId({who:'pet',name:'Guard Curl'},kit),null);
    assert.equal(cine.skillId({who:'foe',name:kit.signature},kit),null);
  }
  assert.equal(signatureAssets.size,56);
  assert.equal(ultimateAssets.size,56);
  assert.equal(cine.presentation({who:'foe',name:'Gear Fang Charge',damage:19},data.kits[0],data.foes[8]).side,'foe');
  assert.equal(cine.presentation({who:'system',name:'Victory!',detail:'Three Paw Coins'},data.kits[0]).side,'system');
});

class Element{
  constructor(tag='div'){
    this.tag=tag;this.children=[];this.events={};this.dataset={};this.attributes={};this.styles={};
    this.disabled=false;this.value='';this.max=100;this._text='';this._html='';
    this.textHistory=[];
    this.style={backgroundImage:'',backgroundSize:'',backgroundPosition:'',
      setProperty:(k,v)=>{this.styles[k]=v;},getPropertyValue:k=>this.styles[k]||''};
    const classes=new Set;
    this.classList={
      add:(...xs)=>xs.forEach(x=>classes.add(x)),
      remove:(...xs)=>xs.forEach(x=>classes.delete(x)),
      toggle:(x,on)=>on?classes.add(x):classes.delete(x),
      contains:x=>classes.has(x)
    };
  }
  set textContent(t){this._text=String(t);this.textHistory.push(this._text);}
  get textContent(){return this._text;}
  set innerHTML(h){this._html=h;}
  get innerHTML(){return this._html;}
  addEventListener(type,callback){this.events[type]=callback;}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=items;}
  setAttribute(name,value){this.attributes[name]=String(value);}
  querySelectorAll(query){return this.children.filter(x=>query==='button'?x.tag==='button':true);}
  closest(query){return query.startsWith('button')&&this.tag==='button'?this:null;}
  remove(){this.removed=true;}
  get offsetWidth(){return 110;}
}
function app(reduced=false){
  const nodes=new Map,document={hidden:false,getElementById(id){
    if(!nodes.has(id))nodes.set(id,new Element);
    return nodes.get(id);
  },createElement:tag=>new Element(tag),addEventListener(){}};
  const el=id=>document.getElementById(id);
  let saved={coins:11,shards:2,food:1,toy:false,battleUnlocked:12,
    companion:{name:'Mochi',breed:'Maine Coon',
      stats:{level:10,strength:6,defence:4,movement:3,endurance:12,intelligence:5}},
    otherCompanions:[]};
  const window={matchMedia:()=>({matches:reduced}),addEventListener(){},
    PawtopiaSave:{read:()=>copy(saved),update:async fn=>{
      const working=copy(saved),message=fn(working);
      if(message)saved=working;
      return message;
    }}};
  const setTimeout=fn=>{Promise.resolve().then(fn);return 1;};
  for(const source of scripts)vm.runInNewContext(source,{window,document,setTimeout});
  return {el,window,getSaved:()=>copy(saved)};
}

test('visible unique-skill projectile and active cue are played during a saved turn',async()=>{
  const a=app(false);
  const target=a.el('battle-foe-list').children[11];
  await a.el('battle-foe-list').events.click({target});
  await a.el('battle-start').events.click();
  const base=a.getSaved();
  assert.equal(base.battleMatch.foeId,'foe-12');
  assert.equal(base.coins,11);
  const signature=a.el('battle-moves').children.find(x=>x.dataset.move==='signature');
  assert.equal(signature.disabled,false);
  await a.el('battle-moves').events.click({target:signature});
  const after=a.getSaved();
  assert.equal(after.battleMatch.round,2);
  assert.equal(after.coins,11);
  assert.ok(after.battleMatch.history.some(s=>s.includes('Timber Claw')));
  assert.ok(a.el('battle-cue-title').textHistory.some(s=>s.includes('Timber Claw')));
  const projectile=a.el('battle-vfx').children.find(x=>x.className==='battle-projectile');
  assert.ok(projectile,'A visible moving skill graphic must be created');
  assert.equal(projectile.dataset.skillId,'cat-kit-01');
  assert.equal(projectile.dataset.type,'signature');
  assert.ok(projectile.styles['--travel-time'].endsWith('ms'));
  assert.ok(a.el('battle-vfx').children.some(x=>x.className==='battle-impact-ring'));
  assert.equal(a.el('battle-cue').classList.contains('is-visible'),false);
  assert.ok(a.el('battle-cat-art').innerHTML.includes('paw-battle-full-body'));
  assert.ok(a.el('battle-foe-art').innerHTML.includes('foe-body-illustration'));
});

test('reduced motion still shows move names without generating moving projectiles',async()=>{
  const a=app(true);
  await a.el('battle-start').events.click();
  const swipe=a.el('battle-moves').children.find(x=>x.dataset.move==='swipe');
  await a.el('battle-moves').events.click({target:swipe});
  assert.ok(a.el('battle-cue-title').textHistory.includes('Paw Swipe'));
  assert.equal(a.el('battle-vfx').children.filter(x=>x.className==='battle-projectile').length,0);
  assert.equal(a.el('battle-vfx').children.filter(x=>x.className==='battle-impact-ring').length,0);
});

test('cinematic changes cannot affect battle saves, payments or free-only behavior',()=>{
  const ui=scripts[6],cine=scripts[5],html=read('pawtopia-battle-arena.html');
  const sw=read('sw.js'),css=read('assets/pawtopia-battle-arena.css');
  assert.ok(html.includes('id="battle-cue"'));
  assert.ok(html.includes('id="battle-cue-title"'));
  assert.ok(/src="assets\/pawtopia-battle-cinematics\.js(?:\?[^"]*)?"/.test(html));
  assert.ok(html.indexOf('pawtopia-battle-cinematics.js')<html.indexOf('pawtopia-battle-arena.js'));
  for(const name of ['battle-projectile','battle-impact-ring','arena-camera-shiver','arena-skill-shot'])
    assert.ok(css.includes(name),name);
  assert.ok(ui.includes('await projectile;'));
  assert.ok(ui.includes('stage.scrollIntoView?.'), 'Start/watch should reveal the fight stage on mobile');
  assert.ok(ui.includes('cameraContact(evt,visual,color)'));
  assert.ok(sw.includes('"assets/pawtopia-battle-cinematics.js"'));
  assert.ok(read('.github/workflows/verify.yml').includes('tests/pawtopia-battle-cinematics.test.cjs'));
  assert.doesNotMatch(cine,/\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sendBeacon/);
  assert.doesNotMatch(ui,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
});
