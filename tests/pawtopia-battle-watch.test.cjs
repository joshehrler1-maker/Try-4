'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sources=[
  'assets/pawtopia-battle-data.js','assets/pawtopia-battle-engine.js',
  'assets/pawtopia-battle-character-art.js','assets/pawtopia-battle-foe-art.js',
  'assets/pawtopia-battle-watch.js','assets/pawtopia-battle-motion.js','assets/pawtopia-battle-arena.js'
].map(read);
const html=read('pawtopia-battle-arena.html');
const clone=value=>JSON.parse(JSON.stringify(value));
function fresh(level=1,strength=2){
  return {hero:'Whisker',coins:0,food:0,toy:false,shards:0,
    battleUnlocked:1,companion:{name:'Mochi',breed:'Maine Coon',stats:{
      level,strength,defence:2,movement:2,endurance:8,intelligence:3
    }},otherCompanions:[]};
}
class MockElement {
  constructor(tag='div'){
    this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attributes={};
    this.disabled=false;this.value='';this.max=100;this.textContent='';this.innerHTML='';
    this.styles={};this.style={backgroundImage:'',backgroundSize:'',backgroundPosition:'',
      setProperty:(k,v)=>{this.styles[k]=v;},getPropertyValue:k=>this.styles[k]||''};
    const classes=new Set();
    this.classList={add:(...xs)=>xs.forEach(x=>classes.add(x)),
      remove:(...xs)=>xs.forEach(x=>classes.delete(x)),
      toggle:(x,enabled)=>enabled?classes.add(x):classes.delete(x),
      contains:x=>classes.has(x)};
  }
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(key,value){this.attributes[key]=String(value);}
  querySelectorAll(selector){return this.children.filter(node=>
    selector==='button'?node.tag==='button':
    selector==='button[data-battle-pose]'?Boolean(node.dataset.battlePose):true);}
  closest(selector){return selector.startsWith('button')&&this.tag==='button'?this:null;}
  remove(){this.removed=true;}
  get offsetWidth(){return 150;}
  get clientWidth(){return 440;}
  getBoundingClientRect(){return {left: 0, top: 0, width: this.offsetWidth, height: 200};}
}
function startPage(initial=fresh(),options={}){
  let state=clone(initial),saves=0,ignoredSaved=0;
  const nodes=new Map,handlers={};
  const el=id=>{if(!nodes.has(id))nodes.set(id,new MockElement);return nodes.get(id);};
  const document={hidden:Boolean(options.hidden),getElementById:el,
    createElement:tag=>new MockElement(tag),addEventListener:(type,fn)=>{handlers[type]=fn;}};
  const window={matchMedia:()=>({matches:Boolean(options.reduced??true)}),
    addEventListener:()=>{},PawtopiaSave:{
      read:()=>clone(state),
      update:async fn=>{
        const progress=clone(state),message=fn(progress);
        if(message){state=progress;saves++;}
        else ignoredSaved++;
        if(options.onSave)options.onSave({state,el,saves,document});
        return message;
      }
    }};
  // No timers are left running after unit tests. Each wait resolves on a microtask.
  let clock=0;
  window.performance={now:()=>clock};
  const fakeSetTimeout=(fn,delay=0)=>{Promise.resolve().then(()=>{clock+=delay;fn();});return 1;};
  for(const source of sources)vm.runInNewContext(source,{window,document,setTimeout:fakeSetTimeout});
  return {window,document,el,handlers,getState:()=>clone(state),
    getSaves:()=>saves,getIgnored:()=>ignoredSaved};
}
async function flushMicrotasks(times=60){
  for(let i=0;i<times;i++)await Promise.resolve();
}

test('Watch Battle tactics only choose unlocked and ready moves for all 56 breeds',()=>{
  const window={};
  vm.runInNewContext(sources[0],{window});
  vm.runInNewContext(sources[1],{window});
  vm.runInNewContext(sources[4],{window});
  const {PawtopiaBattleData:data,PawtopiaBattleEngine:engine,PawtopiaBattleWatch:watch}=window;
  assert.equal(data.breeds.length,56);
  for(const breed of data.breeds){
    for(const level of [1,3,6,10,200]){
      const state=fresh(level);state.companion.breed=breed;
      engine.start(state,0,0);
      const view=engine.matchInfo(state);
      const moves=engine.moveList(view.cat,view.match);
      const selected=watch.chooseMove(view,moves);
      const available=moves.find(move=>move.id===selected);
      assert.equal(available.ready,true,breed+' level '+level);
      assert.equal(available.unlocked,true,breed+' level '+level);
      assert.equal(selected,level>=10?'ultimate':level>=6?'signature':'swipe');
    }
  }
  assert.equal(watch.maxTurns,75);
  assert.equal(watch.speed(1.5),1.5);
  assert.equal(watch.speed('2'),2);
  assert.equal(watch.speed('100'),1);
  assert.equal(watch.speed('not valid'),1);
});

test('one tap starts and watches one complete battle, with a single legitimate reward',async()=>{
  const p=startPage(fresh(10,40));
  const watch=p.el('battle-watch');
  assert.equal(watch.disabled,false);
  await watch.listeners.click();
  const state=p.getState();
  assert.equal(state.battleMatch.finished,true);
  assert.equal(state.battleMatch.result,'win');
  assert.equal(state.companion.battle.wins,1);
  assert.equal(state.coins,p.window.PawtopiaBattleData.foes[0].coins);
  assert.equal(p.el('battle-watch').disabled,false,'Player may intentionally start another match');
  assert.equal(p.el('battle-stop-watch').disabled,true,'Viewer exits after one match');
  assert.equal(p.el('battle-pause').disabled,true);
  assert.match(p.el('battle-outcome').textContent,/Victory/);
  assert.ok(state.battleMatch.history.length>1);
  assert.ok(p.getSaves()<=4,'Watch mode should not run extra rewarded battles');
});

test('pause, resume and stop never duplicate a turn or forfeit the match',async()=>{
  let pausedOnce=false;
  const p=startPage(fresh(1,2),{onSave:({state,el})=>{
    if(state.battleMatch?.round===2&&!pausedOnce){
      pausedOnce=true;
      el('battle-pause').listeners.click();
    }
  }});
  const watchPromise=p.el('battle-watch').listeners.click();
  await flushMicrotasks();
  const paused=p.getState();
  assert.equal(pausedOnce,true);
  assert.equal(paused.battleMatch.round,2);
  assert.equal(p.el('battle-pause').attributes['aria-pressed'],'true');
  assert.equal(p.el('battle-moves').children[0].disabled,true,
    'Manual move is unavailable while watch mode holds the match');
  await flushMicrotasks();
  assert.equal(p.getState().battleMatch.round,2,'No automatic turn during pause');
  p.el('battle-pause').listeners.click();
  await watchPromise;
  assert.equal(p.getState().battleMatch.finished,true);
  assert.equal(p.getState().companion.battle.wins,1);
  assert.equal(p.getState().coins,p.window.PawtopiaBattleData.foes[0].coins);

  let stopped=false;
  const second=startPage(fresh(1,2),{onSave:({state,el})=>{
    if(state.battleMatch?.round===2&&!stopped){
      stopped=true;
      el('battle-stop-watch').listeners.click();
    }
  }});
  await second.el('battle-watch').listeners.click();
  const end=second.getState();
  assert.equal(stopped,true);
  assert.equal(end.battleMatch.round,2);
  assert.equal(end.battleMatch.finished,false,'Stopping watch must not end the actual match');
  assert.equal(end.coins,0);
  assert.equal(end.companion.battle?.losses||0,0);
  const manual=second.el('battle-moves').children.find(btn=>btn.dataset.move==='swipe');
  assert.equal(manual.disabled,false);
  await second.el('battle-moves').listeners.click({target:manual});
  assert.equal(second.getState().battleMatch.round,3,'Manual battle resumes from saved round');
});

test('backgrounding a watch pauses it, and stop releases it without extra turns',async()=>{
  const page=startPage(fresh(1,2),{hidden:true});
  const pending=page.el('battle-watch').listeners.click();
  await flushMicrotasks();
  const state=page.getState();
  assert.equal(state.battleMatch.round,1,'Hidden page never spends a battle turn');
  assert.equal(page.el('battle-pause').attributes['aria-pressed'],'true');
  page.el('battle-stop-watch').listeners.click();
  await pending;
  assert.equal(page.getState().battleMatch.round,1);
  assert.equal(page.getState().coins,0);
  assert.equal(page.el('battle-forfeit').disabled,false,'Match remains available after stop');
});

test('watch controls and offline script are present, but user data and network calls are untouched',()=>{
  const watchScript=sources[4],ui=sources.at(-1);
  for(const id of ['battle-watch','battle-pause','battle-stop-watch','battle-speed'])
    assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(html.indexOf('pawtopia-battle-watch.js')<html.indexOf('pawtopia-battle-arena.js'));
  assert.match(ui,/async function runWatchMode\(\)/);
  assert.match(ui,/async function performTurn\(moveId,fromWatch=false\)/);
  assert.ok(ui.includes("document.addEventListener?.('visibilitychange'"));
  assert.ok(ui.includes('await performTurn(move,true)'));
  assert.ok(ui.includes('watcher.maxTurns'));
  assert.ok(read('sw.js').includes('"assets/pawtopia-battle-watch.js"'));
  assert.ok(read('.github/workflows/verify.yml').includes('tests/pawtopia-battle-watch.test.cjs'));
  assert.doesNotMatch(watchScript,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|Cash\s*App/);
  assert.doesNotMatch(ui,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
});
