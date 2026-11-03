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

test('character speech excludes remote voices, assigns profiles, and cancels queued speech',()=>{
const html=Core.generate({type:'game',title:'Quest'})[0].content;
const source=html.slice(html.indexOf('function setupCharacterVoices(){'),html.indexOf('\nconst vs='));
const fields={};const $=id=>fields[id]||(fields[id]={value:'',style:{},children:[],replaceChildren(){this.children=[];this.value='';},append(o){this.children.push(o);if(!this.value)this.value=o.value;},addEventListener(t,f){this[t]=f;}});
const spoken=[];let cancelled=0;
const engine={getVoices:()=>[{name:'Remote',voiceURI:'remote',lang:'en-US',localService:false},{name:'Local A',voiceURI:'a',lang:'en-US',localService:true},{name:'Local B',voiceURI:'b',lang:'en-US',localService:true}],addEventListener(){},speak:u=>spoken.push(u),cancel:()=>cancelled++};
const context={$,window:{speechSynthesis:engine},SpeechSynthesisUtterance:function(t){this.text=t;},localStorage:{getItem:()=>null,setItem(){}},document:{hidden:false,createElement:()=>({})},hero:{mode:'whisker'},voiceOn:true};
vm.createContext(context);vm.runInContext(source+';this.api=characterSpeech;',context);
assert.equal(fields['whisker-voice'].children.length,2);assert.equal(fields['luna-voice'].value,'b');
context.api.say('Hello','luna');assert.equal(spoken[0].voice.voiceURI,'b');assert.equal(spoken[0].pitch,1.08);
context.api.say('Second','whisker');assert.equal(spoken.length,1);spoken[0].onend();assert.equal(spoken.length,2);
assert.equal(spoken[1].voice.voiceURI,'a');context.api.cancel();assert.ok(cancelled>0);
});
