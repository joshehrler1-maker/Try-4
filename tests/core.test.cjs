const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),Core=require('../core.js');
const unlock=()=>Core.transition(Core.initial(),{type:'unlock'});
const queued=(kind='story',title='A Kind Heart')=>Core.transition(unlock(),{type:'add',kind,title});
const draft=(kind='story')=>Core.transition(Core.transition(queued(kind),{type:'start'}),{type:'tick'});
test('locked queue fails without mutating input',()=>{const s=Core.initial();assert.throws(()=>Core.transition(s,{type:'add',kind:'story',title:'A'}));assert.equal(s.jobs.length,0);assert.throws(()=>Core.transition(s,{type:'start'}));});
test('manual mode drafts once; completion always requires review',()=>{let s=queued();s=Core.transition(s,{type:'mode',value:'manual'});s=Core.transition(s,{type:'start'});s=Core.transition(s,{type:'tick'});assert.equal(s.running,false);assert.equal(s.jobs[0].status,'review');assert.throws(()=>Core.transition(s,{type:'approve',id:1}));});
test('approval requires all checks; changing one revokes approval',()=>{let s=draft();for(const key of Core.REVIEWS)s=Core.transition(s,{type:'review',id:1,key,value:true});s=Core.transition(s,{type:'approve',id:1});assert.equal(s.jobs[0].status,'approved');s=Core.transition(s,{type:'review',id:1,key:'rights',value:false});assert.equal(s.jobs[0].status,'review');assert.throws(()=>Core.transition(s,{type:'approve',id:1}));});
test('emergency lock blocks drafting, approval, retry, removal',()=>{let s=Core.transition(draft(),{type:'lock'});for(const a of [{type:'tick'},{type:'approve',id:1},{type:'retry',id:1},{type:'remove',id:1}])assert.throws(()=>Core.transition(s,a));assert.equal(s.running,false);});
test('backup roundtrip preserves artifacts; always locks and pauses',()=>{let s=draft('coloring');assert.equal(s.jobs[0].artifacts.length,20);const restored=Core.restore(Core.backup(s));assert.equal(restored.locked,true);assert.equal(restored.running,false);assert.deepEqual(restored.jobs,s.jobs);});
test('invalid and oversized backups rejected',()=>{assert.throws(()=>Core.restore('x'.repeat(1801001)));assert.throws(()=>Core.restore('{}'));let s=draft();s.jobs[0].status='published';assert.throws(()=>Core.backup(s));s=draft();s.jobs[0].id=0;assert.throws(()=>Core.backup(s));});
test('queue caps and invalid titles/types fail closed',()=>{let s=unlock();for(let i=0;i<60;i++)s=Core.transition(s,{type:'add',title:'Draft '+i,kind:'story'});assert.throws(()=>Core.transition(s,{type:'add',title:'Overflow',kind:'story'}));for(const title of ['', '\n','x'.repeat(101)])assert.throws(()=>queued('story',title));assert.throws(()=>queued('paid-ai','Title'));assert.throws(()=>Core.transition(unlock(),{type:'publish'}));});
test('all local generators return usable artifacts and no network scripts',()=>{for(const kind of Core.TYPES){const s=draft(kind),files=s.jobs[0].artifacts;assert.ok(files.length);for(const file of files){assert.ok(file.content.length>100);assert.ok(!/fetch\(|XMLHttpRequest|<script[^>]+src=/.test(file.content));if(file.mime==='text/html'){for(const match of file.content.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);assert.ok(file.content.includes('Rescue Quest'));}if(file.mime==='image/svg+xml')assert.ok(file.content.endsWith('</svg>'));}}});
test('HTML and SVG titles are escaped',()=>{const job={title:'<img src=x onerror=alert(1)>',type:'game'};assert.ok(!Core.generate(job)[0].content.includes('<img src=x'));job.type='coloring';assert.ok(Core.generate(job)[0].content.includes('&lt;img'));});
test('bookkeeping uses integer cents, rejects duplicate IDs and invalid dates',()=>{let s=Core.initial();const row={id:'provider_1',date:'2026-11-02',source:'Store',cents:1099,currency:'USD',status:'received'};s=Core.transition(s,{type:'ledger',row});assert.equal(Core.totals(s).received,1099);assert.equal(Core.totals(s).verified,false);assert.throws(()=>Core.transition(s,{type:'ledger',row}));for(const patch of [{cents:1.5},{date:'2026-02-30'},{currency:'EUR'},{status:'refund'},{cents:-1}])assert.throws(()=>Core.transition(Core.initial(),{type:'ledger',row:{...row,...patch}}));});
test('pending and refunds total separately; CSV prevents spreadsheet formula execution',()=>{let s=Core.initial();for(const row of [{id:'a',source:'=HYPERLINK("bad")',cents:1000,status:'received'},{id:'b',source:'Other',cents:500,status:'pending'},{id:'c',source:'Refund',cents:-200,status:'refund'}])s=Core.transition(s,{type:'ledger',row:{date:'2026-11-02',currency:'USD',...row}});assert.deepEqual(Core.totals(s),{received:800,pending:500,spend:0,verified:false});assert.ok(Core.csv(s).includes("'=HYPERLINK"));});
test('corrupt review and ledger records cannot be restored',()=>{const s=draft();s.jobs[0].status='approved';assert.throws(()=>Core.backup(s));s.jobs[0].status='review';s.ledger=[{cents:999}];assert.throws(()=>Core.backup(s));});

test('game artifacts require WebGL and remain self-contained',()=>{const a=Core.generate({type:'game',title:'Quest'})[0];assert.equal(a.name,'super-paw-3d-quest.html');assert.ok(a.content.includes("getContext('webgl'"));assert.ok(!a.content.includes("getContext('2d'"));assert.ok(!/<script[^>]+src=|<link/.test(a.content));});

test('joystick supports analog movement, clamps speed, tracks one finger, and resets on cancel',()=>{
const html=Core.generate({type:'game',title:'Quest'})[0].content;
const code=html.slice(html.indexOf("const stick=$('joystick')"),html.indexOf("document.addEventListener('keydown'"));
const handlers={},knob={style:{}},stick={getBoundingClientRect:()=>({left:0,top:0,width:140,height:140}),setPointerCapture:()=>{},addEventListener:(name,fn)=>handlers[name]=fn};
const context={$:id=>id==='joystick'?stick:knob,playing:true,paused:false};vm.createContext(context);
vm.runInContext(code+";this.read=()=>({x:stickX,y:stickY,p:stickPointer});",context);
const event=(id,x,y)=>({pointerId:id,clientX:x,clientY:y,preventDefault(){}});
handlers.pointerdown(event(1,70,70));assert.equal(context.read().x,0);
handlers.pointermove(event(1,90,70));assert.ok(context.read().x>0&&context.read().x<1);
handlers.pointermove(event(1,500,70));assert.equal(context.read().x,1);
handlers.pointerdown(event(2,0,0));assert.equal(context.read().p,1);
handlers.pointerup(event(2,0,0));assert.equal(context.read().p,1);
handlers.pointercancel(event(1,0,0));assert.equal(context.read().x,0);assert.equal(context.read().p,null);
});


test('approved recorded voices replace device speech and cancel cleanly',()=>{
const html=Core.generate({type:'game',title:'Quest'})[0].content;
assert.ok(!html.includes('SpeechSynthesisUtterance'));assert.ok(html.includes('id="joystick"'));
const source=html.slice(html.indexOf('function setupCharacterVoices(){'),html.indexOf('const vs='));
const fields={},played=[];const $=id=>fields[id]||(fields[id]={addEventListener(t,f){this[t]=f;}});
const context={$,Audio:function(src){this.src=src;this.play=()=>{played.push(this);return Promise.resolve();};this.pause=()=>this.paused=true;},hero:{mode:'whisker'},voiceOn:true,document:{hidden:false}};
vm.createContext(context);vm.runInContext(source+';this.api=characterSpeech;',context);
context.api.say('Super paw power!','whisker');assert.ok(played[0].src.startsWith('data:audio/mpeg;base64,'));
context.api.say('Moon blast!','luna');assert.equal(played.length,1);played[0].onended();assert.equal(played.length,2);
context.api.cancel();assert.equal(played[1].paused,true);
fields['sample-narrator'].click();assert.equal(played.length,3);assert.ok(fields['speech-caption'].textContent.startsWith('Narrator:'));
});

test('fullscreen enters, exits and falls back when browser denies it',async()=>{
const html=Core.generate({type:'game',title:'Quest'})[0].content;
const code=html.match(/<script>\(function installGameFullscreen\(\)\{[\s\S]*?<\/script>/)[0].slice(8,-9);
async function run(denied){const events={},nodes=[];const make=()=>{const x={style:{},classList:{add(){},remove(){}},append(){},prepend(){},setAttribute(){},addEventListener(n,f){this[n]=f;}};nodes.push(x);return x;};
const stage=make(),doc={body:{style:{overflow:'auto'}},head:{append(){}},fullscreenElement:null,createElement:make,getElementById:()=>stage,addEventListener(n,f){events[n]=f;},async exitFullscreen(){this.fullscreenElement=null;}};
stage.requestFullscreen=async()=>{if(denied)throw Error('denied');doc.fullscreenElement=stage;};
const c={document:doc};vm.createContext(c);vm.runInContext(code,c);const button=nodes.find(x=>x.textContent==='⛶ Full Screen');
await button.click();assert.equal(button.textContent,'✕ Exit Full Screen');await button.click();assert.equal(button.textContent,'⛶ Full Screen');assert.equal(doc.body.style.overflow,'auto');
}await run(false);await run(true);
});

test('RPG district requires crystals, defeated bots and reaching the rescue beacon',()=>{
const html=Core.generate({type:'game',title:'Quest'})[0].content;
const source=html.match(/function step\(dt\)\{[\s\S]*?(?=function loop)/)[0];
const c={dashTime:0,dashCooldown:0,strikeCooldown:0,energy:100,comboTime:0,combo:0,burstEffect:0,stickX:0,stickY:0,keys:new Set(),hero:{x:0,z:0,hp:5,mode:'whisker'},crystals:[],bots:[],hitEffect:0,chapter:1,CHAPTERS:6,rescueBeacon:{x:0,z:-12},updateHud(){},notify(){},distance:(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),completed:0,finished:0,nextChapter(){this.completed++;},finish(){this.finished++;}};
c.nextChapter=()=>c.completed++;c.finish=()=>c.finished++;vm.createContext(c);vm.runInContext(source,c);
vm.runInContext('step(.016)',c);assert.equal(c.completed,0);
c.hero.z=-12;c.crystals=[{x:8,z:8}];vm.runInContext('step(.016)',c);assert.equal(c.completed,0);
c.crystals=[];c.bots=[{x:12,z:12,cool:1,hp:1}];vm.runInContext('step(.016)',c);assert.equal(c.completed,0);
c.bots=[];vm.runInContext('step(.016)',c);assert.equal(c.completed,1);
c.chapter=6;vm.runInContext('step(.016)',c);assert.equal(c.finished,1);
});
