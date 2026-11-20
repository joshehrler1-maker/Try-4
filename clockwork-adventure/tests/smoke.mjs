import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const els=new Map(),storage=new Map();
const noop=()=>{};
const ctx=new Proxy({}, {get:(t,k)=>t[k]??noop,set:(t,k,v)=>(t[k]=v,true)});
const element=()=>({style:{},classList:{add:noop,remove:noop,toggle:noop},getContext:()=>ctx,addEventListener:noop,click:noop,setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0,width:120,height:120}),value:'',textContent:'',innerHTML:''});
globalThis.document={getElementById:id=>{if(!els.has(id))els.set(id,element());return els.get(id)},createElement:element,addEventListener:noop,documentElement:{}};
globalThis.window={addEventListener:noop};globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};globalThis.requestAnimationFrame=noop;globalThis.innerWidth=900;globalThis.innerHeight=500;globalThis.devicePixelRatio=1;
globalThis.TestRenderer=class{setPixelRatio(){}setSize(){}setClearColor(){}render(){}};
let source=await fs.readFile(new URL('../dist/game.js',import.meta.url),'utf8');
source=source.replace("'./assets/three.module.js'",JSON.stringify(pathToFileURL(process.cwd()+'/dist/assets/three.module.js').href)).replace("'./software-renderer.js'",JSON.stringify(pathToFileURL(process.cwd()+'/dist/software-renderer.js').href)).replace('new T.WebGLRenderer(', 'new globalThis.TestRenderer(');
source+='\nexport { start,closeModal,buildZone,canMove,ringBell,validSave,attack,frame,save,travel,chapterComplete,showShop }; export const inspect=()=>({data,player,portals,collectibles,enemies,keys,paused,attackCooldown});';
const g=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
g.start();g.closeModal();let s=g.inspect();assert.equal(s.data.zone,'village');assert.equal(s.collectibles.filter(c=>c.type==='gear').length,3);assert(g.validSave(s.data));
let time=0;const tick=n=>{for(let i=0;i<n;i++)g.frame(time+=16.667)};
s.keys.add('KeyW');tick(60);s.keys.delete('KeyW');assert(s.player.position.z<10,'movement should advance in depth');tick(20);
// Explore the collision grid: every required gear must have a traversable approach.
function reachable(start,target,radius=.8){const step=.5,key=(x,z)=>x+','+z,queue=[[Math.round(start.x*2)/2,Math.round(start.z*2)/2]],seen=new Set();for(let qi=0;qi<queue.length;qi++){let [x,z]=queue[qi];if(Math.hypot(x-target.x,z-target.z)<radius)return true;for(let [dx,dz]of [[step,0],[-step,0],[0,step],[0,-step]]){let a=x+dx,b=z+dz,k=key(a,b);if(!seen.has(k)&&g.canMove(a,b)){seen.add(k);queue.push([a,b])}}}return false}
for(let c of s.collectibles.filter(c=>c.type==='gear'))assert(reachable({x:0,z:13},c),`unreachable ${c.id}`);
for(let c of [...s.collectibles.filter(c=>c.type==='gear')]){s.player.position.set(c.x,0,c.z);tick(1)}assert.equal(s.data.gears.length,3);g.save();assert.equal(JSON.parse(storage.get('sph-clockwork-v1')).gears.length,3);
const bad={...s.data,coins:-1};assert.equal(g.validSave(bad),false);assert.equal(g.validSave({...s.data,x:Infinity}),false);assert.equal(g.validSave({...s.data,zone:'unknown'}),false);
g.travel('forest',{x:0,z:22});s=g.inspect();assert(!g.canMove(0,-6),'closed bridge gate blocks center');assert(!g.canMove(5,-8),'river cannot be walked across');let lever=s.portals.find(p=>p.name==='Repair bridge mechanism');assert(reachable({x:0,z:22},lever,2));lever.action();assert(s.data.bridge);assert(g.canMove(0,-6));assert(reachable({x:0,z:22},{x:0,z:-23},1.8));
g.travel('temple',{x:0,z:17});s=g.inspect();assert(!g.canMove(0,-8),'guardian gate initially blocks');for(let p of s.portals.filter(p=>p.name.startsWith('Ring bell')))assert(reachable({x:0,z:17},p,2));g.ringBell(0);assert(!s.data.tune);g.ringBell(1);g.ringBell(0);g.ringBell(2);assert(s.data.tune);assert(g.canMove(0,-8));assert(reachable({x:0,z:17},{x:0,z:-21},2));
let boss=s.enemies.find(e=>e.boss);s.data.power=2;s.player.position.set(boss.x,0,boss.z+1);s.data.hp=5;for(let i=0;i<6;i++){boss.mode='recover';boss.timer=10;g.attack();tick(31)}assert.equal(boss.hp,0);assert(s.data.boss);assert(!s.data.bellAwake,'defeating guardian alone does not finish chapter');g.chapterComplete();assert(s.data.bellAwake);g.closeModal();
g.travel('village',{x:0,z:13});s=g.inspect();s.data.coins=20;s.data.hp=2;g.showShop();document.getElementById('buyHeal').onclick();assert.equal(s.data.hp,5);assert.equal(s.data.coins,14);g.closeModal();g.save();const final=JSON.parse(storage.get('sph-clockwork-v1'));assert(g.validSave(final));assert(final.bellAwake);
console.log('PASS: world movement, gear reachability/collection, save validation, bridge repair and river collision, dungeon access, bell sequence reset/success, guardian combat, chapter completion, shop purchase, persisted progress.');
