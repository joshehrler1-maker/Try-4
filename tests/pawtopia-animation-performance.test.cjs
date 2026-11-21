'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const dataSource=read('assets/pawtopia-battle-data.js');
const artSource=read('assets/pawtopia-battle-character-art.js');
const uiSource=read('assets/pawtopia-battle-arena.js');
function load() {
  const window={};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(artSource,{window});
  return window;
}
test('all 56 tail designs stay inside the 220px SVG right edge throughout every motion',()=>{
  const w=load(),art=w.PawtopiaBattleCharacterArt;
  let inspected=0;const tailKinds=new Set;let greatest=-Infinity;
  for(const cat of art.collection) {
    for(const pose of art.poseKeys) {
      for(const frame of art.flowFrames) {
        const svg=art.svgForBreed(cat.breed,pose,frame);
        const tail=svg.match(/<g class="art-tail-flex">([\s\S]*?)<\/g>/);
        if(!tail)continue;
        const first=tail[1].match(/<path d="([^"]+)"/)?.[1];
        assert.ok(first,cat.breed+' '+pose+' '+frame+' missing tail path');
        const coords=[...first.matchAll(/-?\d+(?:\.\d+)?/g)].map(x=>Number(x[0]));
        const maxX=Math.max(...coords.filter((_,i)=>i%2===0));
        assert.ok(maxX<=205,cat.breed+' '+pose+' '+frame+' tail clips at x='+maxX);
        assert.ok(maxX>=142,'Tail control points must remain correctly attached');
        greatest=Math.max(greatest,maxX);
        inspected++;
      }
    }
    if(cat.tail!=='none')tailKinds.add(cat.tail);
  }
  assert.ok(inspected>10000,'Full choreography must be checked, not one idle pose');
  assert.ok(tailKinds.size>=4,'Do not flatten unique breeds into one tail type');
  assert.ok(greatest<=205);
});
test('rendered SVG markup is bounded to 96 frames even when switching all 56 cats',()=>{
  const art=load().PawtopiaBattleCharacterArt;
  for(const cat of art.collection){
    for(const pose of ['idle','walk','run','swipe','signature','ultimate','recover']){
      for(const frame of art.flowFrames){
        const svg=art.svgForBreed(cat.breed,pose,frame,'signature');
        assert.ok(svg.includes('paw-battle-full-body'));
        assert.ok(art.cacheSize()<=96,'Do not grow an unbounded SVG cache on Android');
      }
    }
  }
  assert.equal(art.cacheSize(),96);
  assert.equal(art.svgForBreed('Bengal','signature',3),
    art.svgForBreed('Bengal','signature',3),
    'Cached and regenerated art must have identical original identity');
});
test('painting an identical pose does not remount the original face texture or restart idle',()=>{
  const art=load().PawtopiaBattleCharacterArt;
  let writes=0;
  const container={
    dataset:{},style:{backgroundImage:''},classList:{add(){}},
    firstElementChild:null,
    set innerHTML(value){
      writes++;
      this.markup=value;
      this.firstElementChild={classList:{contains:name=>name==='paw-battle-full-body'}};
    },
    get innerHTML(){return this.markup||'';}
  };
  art.paint(container,'Maine Coon','idle',3);
  assert.equal(writes,1);
  assert.ok(container.innerHTML.includes('adopt-maine-coon.webp'));
  art.paint(container,'Maine Coon','idle',3);
  assert.equal(writes,1,'Idle CSS breathing must not reset due to redundant writes');
  art.paint(container,'Maine Coon','swipe',2.75);
  assert.equal(writes,2);
  art.paint(container,'Maine Coon','swipe',2.75);
  assert.equal(writes,2);
  art.paint(container,'Bengal','swipe',2.75);
  assert.equal(writes,3,'Different adopted breeds must never share one mounted portrait');
  assert.ok(container.innerHTML.includes('adopt-bengal.webp'));
});
test('slow-frame simulation skips stale drawings but still reaches final attack pose',async()=>{
  class Element{
    constructor(tag='div'){
      this.tag=tag;this.children=[];this.listeners={};this.attributes={};
      this.disabled=false;this.value='';this.max=100;this.textContent='';this.innerHTML='';
      this.style={backgroundImage:'',backgroundSize:'',backgroundPosition:'',
        setProperty(){},getPropertyValue(){return ''}};
      const classes=new Set;
      this.classList={add:(...a)=>a.forEach(x=>classes.add(x)),
        remove:(...a)=>a.forEach(x=>classes.delete(x)),
        toggle:(x,on)=>on?classes.add(x):classes.delete(x),
        contains:x=>classes.has(x)};
      const self=this;
      this.trace=[];
      this.dataset=new Proxy({}, {set(target,k,value){
        target[k]=value;
        if(k==='frame')self.trace.push(String(value));
        return true;
      }});
    }
    addEventListener(k,fn){this.listeners[k]=fn;}
    append(...x){this.children.push(...x);}
    replaceChildren(...x){this.children=x;}
    setAttribute(k,v){this.attributes[k]=v;}
    querySelectorAll(q){return this.children.filter(x=>q==='button'?x.tag==='button':true);}
    closest(q){return q.startsWith('button')&&this.tag==='button'?this:null;}
    scrollIntoView(){}
    remove(){}
    get offsetWidth(){return 140;}
  }
  const nodes=new Map;
  const el=id=>{if(!nodes.has(id))nodes.set(id,new Element);return nodes.get(id);};
  const document={getElementById:el,createElement:tag=>new Element(tag),
    addEventListener(){},hidden:false};
  let time=0;
  const window={performance:{now:()=>time},addEventListener(){},
    matchMedia:()=>({matches:false})};
  const saved={coins:17,food:0,shards:0,battleUnlocked:12,
    companion:{name:'Mochi',breed:'Bengal',stats:{
      level:10,strength:2,defence:3,movement:4,endurance:14,intelligence:4
    }},otherCompanions:[]};
  window.PawtopiaSave={read:()=>JSON.parse(JSON.stringify(saved)),update:async()=>{throw Error('Preview must not save')}};
  const schedule=fn=>{time+=110;Promise.resolve().then(fn);return 1;};
  for(const source of [dataSource,read('assets/pawtopia-battle-engine.js'),artSource,
    read('assets/pawtopia-battle-foe-art.js'),read('assets/pawtopia-battle-watch.js'),
    read('assets/pawtopia-battle-cinematics.js'),uiSource]){
    vm.runInNewContext(source,{window,document,setTimeout:schedule});
  }
  const art=el('battle-cat-art');
  const before=art.trace.length;
  const button=new Element('button');button.dataset.battlePose='swipe';
  await el('battle-art-preview-actions').listeners.click({target:button});
  const played=art.trace.slice(before);
  assert.ok(played.length>=2,'A real attack needs at least first and final drawings');
  assert.ok(played.length<21,'Slow frames should be dropped instead of forcing stale artwork');
  assert.equal(played.at(-1),'5','Skipped frames must never drop the final contact/recovery drawing');
  assert.equal(saved.coins,17);
});
test('rendering optimizations preserve original cat art and create no paid/network dependencies',()=>{
  const page=read('pawtopia-battle-arena.html');
  assert.ok(page.includes('pawtopia-cat-flow.css'));
  assert.ok(artSource.includes('svgCacheLimit=96'));
  assert.ok(artSource.includes("container.firstElementChild?.classList?.contains('paw-battle-full-body')"));
  assert.ok(uiSource.includes('window.performance?.now?.()??Date.now()'));
  assert.ok(uiSource.includes('index=Math.max(index,due)'));
  assert.ok(read('.github/workflows/verify.yml').includes('tests/pawtopia-animation-performance.test.cjs'));
  assert.doesNotMatch(artSource+uiSource,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
});