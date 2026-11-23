'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const dataSource=read('assets/pawtopia-battle-data.js');
const artSource=read('assets/pawtopia-battle-character-art.js');
const uiSource=read('assets/pawtopia-battle-arena.js');
const gallerySource=read('assets/pawtopia-battle-art-gallery.js');
const copy=x=>JSON.parse(JSON.stringify(x));
function load(){
 const window={};
 vm.runInNewContext(dataSource,{window});
 vm.runInNewContext(artSource,{window});
 return {data:window.PawtopiaBattleData,art:window.PawtopiaBattleCharacterArt};
}
test('all 56 cats have 12 original, flowing states and 21 drawing samples',()=>{
 const {data,art}=load();
 assert.equal(art.collection.length,56);
 assert.equal(art.poseKeys.length,12);
 assert.deepEqual(Array.from(art.flowFrames),Array.from({length:21},(_,i)=>i/4));
 assert.deepEqual(Array.from(art.animationFrames),[0,1,2,3,4,5]);
 assert.deepEqual(Array.from(art.smoothFrames),[0,.5,1,1.5,2,2.5,3,3.5,4,4.5,5]);
 let checks=0;
 for(const kit of data.kits){
   assert.ok(art.flowSignature(art.getArt(kit.breed)).breathDuration.endsWith('s'));
   for(const pose of art.poseKeys){
     for(const frame of [0,2.5,5]){
       const svg=art.svgForBreed(kit.breed,pose,frame);
       assert.ok(svg.includes('data-pose="'+pose+'"'));
       assert.ok(svg.includes('<image href="'+kit.sprite.src+'"'),kit.breed);
       assert.ok(svg.includes('class="art-head-inner"'));
       assert.ok(svg.includes('class="art-ear-flex"'));
       assert.ok(svg.includes('class="art-paw art-paw-left"'));
       assert.ok(svg.includes('class="art-paw art-paw-right"'));
       assert.ok(!/(NaN|undefined|Infinity)/.test(svg),kit.breed+' '+pose+' '+frame);
       checks++;
     }
   }
 }
 assert.equal(checks,56*12*3);
});
test('every cat has an actual synchronized walk and run gait, not sliding feet',()=>{
 const {art}=load();
 let checked=0;
 for(const cat of art.collection){
   for(const pose of ['walk','run','approach']){
     const drawings=art.flowFrames.map(frame=>art.choreograph(cat,pose,frame));
     const leftX=new Set(drawings.map(x=>x[2][0]));
     const rightX=new Set(drawings.map(x=>x[3][0]));
     const leftY=new Set(drawings.map(x=>x[2][1]));
     const frontPawX=new Set(drawings.map(x=>x[0][2]));
     assert.ok(leftX.size>=5,cat.breed+' '+pose+' left leg must move');
     assert.ok(rightX.size>=5,cat.breed+' '+pose+' right leg must move');
     assert.ok(leftY.size>=2,cat.breed+' '+pose+' paws must rise and land');
     assert.ok(frontPawX.size>=5,cat.breed+' '+pose+' shoulder must counterbalance gait');
     for(const d of drawings){
       assert.ok(d[2][0]>=50&&d[2][0]<=115);
       assert.ok(d[3][0]>=110&&d[3][0]<=180);
       assert.ok(d[2][1]<=224&&d[2][1]>=180);
       assert.ok(d[3][1]<=224&&d[3][1]>=180);
     }
     checked++;
   }
 }
 assert.equal(checked,56*3);
});
test('recover starts at exactly the last attack pose and ends at grounded idle',()=>{
 const {art}=load();
 let checks=0;
 for(const cat of art.collection){
   for(const source of ['swipe','guard','signature','ultimate','impact']){
     const endOfAction=art.choreograph(cat,source,5);
     const startRecovery=art.recoveryPose(cat,source,0);
     const idle=art.choreograph(cat,'idle',3);
     const endRecovery=art.recoveryPose(cat,source,5);
     assert.deepEqual(copy(startRecovery),copy(endOfAction),cat.breed+' '+source+' should not snap at recovery start');
     assert.deepEqual(copy(endRecovery),copy(idle),cat.breed+' '+source+' should settle back to idle');
     const middle=art.recoveryPose(cat,source,2.5);
     assert.notDeepEqual(copy(middle),copy(endOfAction));
     const drawing=art.svgForBreed(cat.breed,'recover',2.5,source);
     assert.ok(drawing.includes('data-source-pose="'+source+'"'));
     assert.ok(drawing.includes('art-body'));
     checks++;
   }
 }
 assert.equal(checks,56*5);
});
test('all 56 personalized signature and ultimate actions have 21 drawing frames',()=>{
 const {art,data}=load(),traces=new Set;
 let drawn=0;
 for(const kit of data.kits){
   for(const pose of ['swipe','signature','ultimate']){
     const frames=new Set;
     for(const sample of art.flowFrames){
       const svg=art.svgForBreed(kit.breed,pose,sample);
       assert.ok(svg.includes('class="art-fighting-style-trail"'));
       assert.ok(svg.includes('data-style="'+art.getArt(kit.breed).fightingStyle.serial+'"'));
       frames.add(svg);drawn++;
     }
     assert.equal(frames.size,21,kit.breed+' '+pose+' needs continuous distinct frames');
   }
   traces.add(JSON.stringify(art.flowFrames.map(frame=>art.choreograph(art.getArt(kit.breed),'signature',frame))));
 }
 assert.equal(traces.size,56,'Original per-breed signatures must remain distinct');
 assert.equal(drawn,56*3*21);
});
test('both arena and gallery display idle breathing and protect reduced-motion/mobile options',()=>{
 const flowCss=read('assets/pawtopia-cat-flow.css');
 const page=read('pawtopia-battle-arena.html');
 const gallery=read('pawtopia-battle-art-gallery.html');
 const worker=read('sw.js');
 for(const file of [page,gallery])assert.match(file,/assets\/pawtopia-cat-flow\.css/);
 for(const key of ['paw-flow-breathe','paw-flow-tail','paw-flow-look','paw-flow-ears','paw-flow-stance','prefers-reduced-motion:reduce'])
   assert.ok(flowCss.includes(key),key);
 for(const pose of ['walk','run','recover']){
   assert.ok(page.includes('data-battle-pose="'+pose+'"'));
   assert.ok(gallery.includes('data-pose="'+pose+'"'));
 }
 assert.ok(worker.includes('"assets/pawtopia-cat-flow.css"'));
 assert.ok(uiSource.includes('characterArt.flowFrames'));
 assert.match(uiSource, /playArtFrames\(cat,'recover',240,pose\)/);
 assert.ok(uiSource.includes("frameQuality==='efficient'"));
 assert.ok(uiSource.includes('if(reduced())'));
 assert.ok(gallerySource.includes('art.flowFrames||art.smoothFrames||art.animationFrames'));
 assert.ok(read('.github/workflows/verify.yml').includes('pawtopia-all-56-flowing-movement.test.cjs'));
 assert.doesNotMatch(artSource+uiSource+flowCss,/\bfetch\s*\(|WebSocket|XMLHttpRequest|sendBeacon/);
});
test('actual turn plays transition recovery after attack and previews cannot spend coins',async()=>{
 const assets=[
 dataSource,read('assets/pawtopia-battle-engine.js'),artSource,
 read('assets/pawtopia-battle-foe-art.js'),
 read('assets/pawtopia-battle-watch.js'),read('assets/pawtopia-battle-cinematics.js'),
 read('assets/pawtopia-battle-motion.js'),uiSource
 ];
 class Element {
   constructor(tag='div'){
     this.tag=tag;this.children=[];this.listeners={};this.dataset={};this.attributes={};
     this.disabled=false;this.hidden=false;this.value='';this.max=100;this.textContent='';this._html='';
     this.painted=[];this.styles={};
     this.style={backgroundImage:'',backgroundSize:'',backgroundPosition:'',
       setProperty:(k,v)=>{this.styles[k]=v},getPropertyValue:k=>this.styles[k]||''};
     const classes=new Set();
     this.classList={add:(...xs)=>xs.forEach(x=>classes.add(x)),
       remove:(...xs)=>xs.forEach(x=>classes.delete(x)),
       toggle:(x,on)=>on?classes.add(x):classes.delete(x),
       contains:x=>classes.has(x)};
   }
   set innerHTML(t){this._html=t;if(t.includes('paw-battle-full-body'))this.painted.push(t);}
   get innerHTML(){return this._html;}
   addEventListener(type,fn){this.listeners[type]=fn}
   append(...args){this.children.push(...args)}
   replaceChildren(...args){this.children=args}
   setAttribute(k,v){this.attributes[k]=v}
   querySelectorAll(q){return this.children.filter(x=>q==='button'?x.tag==='button':true)}
   closest(selector){return selector.startsWith('button')&&this.tag==='button'?this:null}
   remove(){this.removed=true}
   get offsetWidth(){return 120}
   get clientWidth(){return 440}
   getBoundingClientRect(){return {left: 0, top: 0, width: this.offsetWidth, height: 200};}
   scrollIntoView(){}
 }
 const nodes=new Map;
 const el=id=>{if(!nodes.has(id))nodes.set(id,new Element);return nodes.get(id)};
 const document={getElementById:el,createElement:tag=>new Element(tag),hidden:false,addEventListener(){}};
 let progress={hero:'Whisker',coins:14,food:0,shards:0,battleUnlocked:12,
   companion:{name:'Mochi',breed:'Bengal',stats:{level:10,strength:2,defence:2,movement:2,endurance:20,intelligence:3}},
   otherCompanions:[]};
 const window={addEventListener(){},matchMedia:()=>({matches:false}),
   PawtopiaSave:{read:()=>copy(progress),update:async f=>{const next=copy(progress),message=f(next);if(message)progress=next;return message;}}};
 let clock=0;
 window.performance={now:()=>clock};
 const fakeSetTimeout=(fn,delay=0)=>{Promise.resolve().then(()=>{clock+=delay;fn();});return 1;};
 for(const script of assets)vm.runInNewContext(script,{window,document,setTimeout:fakeSetTimeout});
 const before=progress.coins;
 for(const pose of ['walk','run','recover']){
   const btn=new Element('button');btn.dataset.battlePose=pose;
   await el('battle-art-preview-actions').listeners.click({target:btn});
   assert.ok(el('battle-cat-art').painted.some(svg=>svg.includes('data-pose="'+pose+'"')));
   assert.equal(progress.coins,before,'Free previews never change rewards');
 }
 await el('battle-start').listeners.click();
 const swipe=el('battle-moves').children.find(x=>x.dataset.move==='swipe');
 await el('battle-moves').listeners.click({target:swipe});
 const paintings=el('battle-cat-art').painted;
 assert.ok(paintings.some(x=>x.includes('data-pose="swipe"')));
 assert.ok(paintings.some(x=>x.includes('data-pose="recover"')));
 assert.ok(paintings.some(x=>x.includes('data-pose="idle"')));
 const recoveries=paintings.filter(x=>x.includes('data-pose="recover"'));
 assert.ok(recoveries.length>=11,'Smooth recovery has at least 11 transition drawings');
 assert.equal(progress.battleMatch.round,2);
 assert.equal(progress.coins,before);
});
