'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const dataSource=read('assets/pawtopia-battle-data.js');
const artSource=read('assets/pawtopia-battle-character-art.js');
const gallerySource=read('assets/pawtopia-battle-art-gallery.js');
const arenaSource=read('assets/pawtopia-battle-arena.js');
const css=read('assets/pawtopia-cat-flow.css');
const copy=x=>JSON.parse(JSON.stringify(x));

function loadArt() {
  const window={};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(artSource,{window});
  return window.PawtopiaBattleCharacterArt;
}

test('all 56 idle rigs carry Android-compatible independent head and stance periods',()=>{
  const art=loadArt();
  assert.equal(art.collection.length,56);
  assert.ok(css.includes('var(--head-period,5.4s)'));
  assert.ok(css.includes('var(--stance-period,4.5s)'));
  assert.doesNotMatch(css,/calc\(/,'Do not require CSS duration multiplication on older WebViews');
  for(const cat of art.collection){
    const flow=art.flowSignature(cat);
    const breath=Number.parseFloat(flow.breathDuration);
    const head=Number.parseFloat(flow.headDuration);
    const stance=Number.parseFloat(flow.stanceDuration);
    assert.ok(Math.abs(head-breath*1.8)<=.02,cat.breed+' head cadence');
    assert.ok(Math.abs(stance-breath*1.5)<=.02,cat.breed+' paw cadence');
    const markup=art.svgForBreed(cat.breed,'idle',3);
    assert.ok(markup.includes('--head-period:'+flow.headDuration));
    assert.ok(markup.includes('--stance-period:'+flow.stanceDuration));
    assert.ok(markup.includes('art-tail-flex'));
    assert.ok(markup.includes('art-ear-flex'));
  }
});

test('all 56 cat victory and defeat recovery paths start precisely at their final stance',()=>{
  const art=loadArt();
  for(const cat of art.collection){
    for(const pose of ['swipe','signature','ultimate','guard','impact','walk','run','victory','defeat']){
      const last=art.choreograph(cat,pose,5);
      const first=art.recoveryPose(cat,pose,0);
      const idle=art.choreograph(cat,'idle',3);
      assert.deepEqual(copy(first),copy(last),cat.breed+' '+pose+' should not jump');
      assert.deepEqual(copy(art.recoveryPose(cat,pose,5)),copy(idle));
      const frame=art.svgForBreed(cat.breed,'recover',2.5,pose);
      assert.ok(frame.includes('data-source-pose="'+pose+'"'));
      assert.ok(!/(NaN|undefined|Infinity)/.test(frame));
    }
  }
});

function galleryWorld(){
  class Element {
    constructor(tag='div'){
      this.tag=tag;this.listeners={};this.children=[];this.dataset={};
      this.attributes={};this._html='';this.paints=[];
      this.value='';this.textContent='';
      this.style={backgroundImage:'',backgroundSize:'',backgroundPosition:''};
      this.classList={add(){}};
      this.firstElementChild=null;
    }
    set innerHTML(value){
      this._html=value;
      if(value.includes('paw-battle-full-body')){
        this.paints.push(value);
        this.firstElementChild={classList:{contains:x=>x==='paw-battle-full-body'}};
      }
    }
    get innerHTML(){return this._html;}
    append(...nodes){this.children.push(...nodes)}
    replaceChildren(...nodes){this.children=nodes}
    addEventListener(kind,callback){this.listeners[kind]=callback}
    setAttribute(key,val){this.attributes[key]=String(val)}
    querySelectorAll(selector){
      if(selector==='button[data-breed]')return this.children.filter(e=>e.dataset?.breed);
      if(selector==='button[data-pose]')return this.children.filter(e=>e.dataset?.pose);
      return [];
    }
    closest(sel){return sel.startsWith('button')&&this.tag==='button'?this:null}
    scrollIntoView(){}
  }
  const nodes=new Map;
  const el=id=>{if(!nodes.has(id))nodes.set(id,new Element);return nodes.get(id)};
  const document={getElementById:el,createElement:tag=>new Element(tag)};
  const window={matchMedia:()=>({matches:false}),addEventListener(){}};
  vm.runInNewContext(dataSource,{window});
  vm.runInNewContext(artSource,{window});
  for(const pose of window.PawtopiaBattleCharacterArt.poseKeys){
    const b=new Element('button');
    b.dataset.pose=pose;
    el('gallery-moves').append(b);
  }
  el('gallery-speed').value='1';
  const waiting=[];
  const setTimeout=fn=>{waiting.push(fn);return waiting.length};
  vm.runInNewContext(gallerySource,{window,document,setTimeout});
  async function tick(){
    const fn=waiting.shift();
    if(fn)fn();
    for(let i=0;i<5;i++)await Promise.resolve();
  }
  async function drain(max=150) {
    for(let i=0;i<max;i++){
      if(!waiting.length){for(let j=0;j<5;j++)await Promise.resolve();if(!waiting.length)break;}
      await tick();
    }
    assert.equal(waiting.length,0,'All preview timers should settle');
  }
  function clickPose(pose){
    const btn=el('gallery-moves').children.find(x=>x.dataset.pose===pose);
    el('gallery-moves').listeners.click({target:btn});
  }
  return {el,window,clickPose,tick,drain,waiting};
}

test('a 56-cat gallery attack plays its own recovery before returning to idle',async()=>{
  const g=galleryWorld(),holder=g.el('gallery-fighter');
  g.clickPose('signature');
  await g.drain();
  const poses=holder.paints.map(svg=>(svg.match(/data-pose="([^"]+)"/)||[])[1]).filter(Boolean);
  assert.ok(poses.includes('signature'),'Personal skill motion must animate');
  assert.ok(poses.includes('recover'),'Preview must display articulated follow-through, not snap idle');
  const recovered=holder.paints.filter(svg=>svg.includes('data-pose="recover"'));
  assert.equal(recovered.length,11,'Gallery should use 11 smooth recovery drawings');
  assert.equal(poses.at(-1),'idle','Preview should settle in breathing idle');
  assert.ok(g.el('gallery-status').textContent.includes('preview complete'));
});

test('rapidly switching breeds cancels old playback without stale redraw or stuck busy',async()=>{
  const g=galleryWorld(),holder=g.el('gallery-fighter');
  g.clickPose('ultimate');
  await g.tick();
  g.el('gallery-breed').value='Bengal';
  g.el('gallery-breed').listeners.change();
  const switchAt=holder.paints.length;
  assert.ok(holder.innerHTML.includes('adopt-bengal.webp'));
  await g.drain();
  assert.ok(holder.paints.slice(switchAt).every(svg=>svg.includes('adopt-bengal.webp')),
    'Previous cat must not be redrawn after switching to Bengal');
  // After switching during a slow animation, the new breed must remain usable.
  g.clickPose('swipe');
  await g.drain();
  const after=holder.paints.slice(switchAt);
  assert.ok(after.some(svg=>svg.includes('data-pose="swipe"')));
  assert.ok(after.some(svg=>svg.includes('data-pose="recover"')));
  assert.ok(after.at(-1).includes('data-pose="idle"'));
  assert.ok(g.el('gallery-status').textContent.includes('Bengal preview complete'));
});

test('free Arena previews and gallery never write rewards or fetch assets dynamically',()=>{
  assert.ok(arenaSource.includes("if(pose==='recover'){"));
  assert.ok(arenaSource.includes("await playArtFrames(cat,'signature',characterArt.timingFor(cat.breed,'signature'))"));
  assert.ok(arenaSource.includes("await playArtFrames(cat,'recover',240,pose)"));
  assert.ok(gallerySource.includes("art.paint(fighter,breed,'recover',frame,pose)"));
  assert.ok(gallerySource.includes("busy=false;"));
  assert.ok(read('sw.js').includes('assets/pawtopia-cat-flow.css'));
  assert.ok(read('.github/workflows/verify.yml').includes('pawtopia-gallery-animation-recovery.test.cjs'));
  assert.doesNotMatch(gallerySource+arenaSource,/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
});