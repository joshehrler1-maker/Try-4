(()=>{'use strict';
const Core=Try4Core,KEY='try4-core-v2',$=id=>document.getElementById(id);let state=Core.initial(),artifact=null,storageAvailable=true;
function notice(text){$('notice').textContent=text;}
try{const raw=localStorage.getItem(KEY);if(raw){state=Core.restore(raw);}}catch{notice('Saved workspace could not be loaded. It has not been overwritten. Restore a valid backup or erase it.');storageAvailable=false;}
function persist(next){if(!storageAvailable)throw Error('Storage unavailable or saved data invalid. Export or restore before continuing.');localStorage.setItem(KEY,Core.backup(next));state=next;}
function dispatch(action){try{const next=Core.transition(state,action);persist(next);render();notice(action.type==='lock'?'Emergency lock on. Local work stopped.':'Saved on this device.');}catch(e){notice(e.message);}}
function el(tag,text){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x;}
function button(label,fn,disabled=false){const b=el('button',label);b.type='button';b.disabled=disabled;b.addEventListener('click',fn);return b;}
const currency=cents=>(cents/100).toLocaleString('en-US',{style:'currency',currency:'USD'});
function render(){
 $('run-state').textContent=state.locked?'LOCKED':state.running?'DRAFTING':'PAUSED';$('mode').value=state.mode;$('start').disabled=state.locked||state.running;$('unlock').disabled=!state.locked;$('pause').disabled=!state.running;
 $('queue-count').textContent=state.jobs.length+' / 60';const list=$('jobs');list.replaceChildren();if(!state.jobs.length)list.append(el('p','Your drafts will appear here. Unlock local drafting, add a project, then tap Start.'));
 for(const j of state.jobs){const card=el('article');card.className='job';card.append(el('h3',j.title),el('small',j.type+' · '+j.status+' · attempts '+j.attempts+'/3'));if(j.error)card.append(el('p',j.error));
  if(j.artifacts.length){const row=el('div');const select=el('select');select.setAttribute('aria-label','File for '+j.title);j.artifacts.forEach((a,i)=>{const option=el('option',a.name);option.value=String(i);select.append(option);});row.append(select,button('Preview selected file',()=>preview(j.artifacts[Number(select.value)])));card.append(row);
   for(const key of Core.REVIEWS){const label=el('label');const box=el('input');box.type='checkbox';box.checked=j.reviews[key];box.disabled=state.locked;box.addEventListener('change',()=>dispatch({type:'review',id:j.id,key,value:box.checked}));label.append(box,document.createTextNode(({canon:'Canonical cats, costumes & continuity',originality:'Originality reviewed',childSafety:'Child safety reviewed',quality:'Quality and accessibility reviewed',rights:'Asset and publication rights reviewed'})[key]));card.append(label);}
   card.append(button(j.status==='approved'?'Approved — not published':'Approve draft',()=>dispatch({type:'approve',id:j.id}),state.locked||j.status==='approved'||!Core.REVIEWS.every(k=>j.reviews[k])));
  }if(j.status==='failed')card.append(button('Retry',()=>dispatch({type:'retry',id:j.id}),state.locked||j.attempts>=3));card.append(button('Remove',()=>{if(confirm('Remove this draft and its files?'))dispatch({type:'remove',id:j.id});},state.locked));list.append(card);
 }
 const money=Core.totals(state);$('received').textContent=currency(money.received);$('pending').textContent=currency(money.pending);$('transactions').replaceChildren();for(const r of state.ledger){const row=el('div',r.date+' · '+r.source+' · '+currency(r.cents)+' · '+r.status);row.append(button('Remove record',()=>{if(confirm('Remove this transaction record?'))dispatch({type:'deleteLedger',id:r.id});}));$('transactions').append(row);}
 $('platforms').replaceChildren();for(const [key,value] of Object.entries(state.platforms)){const label=el('label');const box=el('input');box.type='checkbox';box.checked=value;box.addEventListener('change',()=>dispatch({type:'platform',key,value:box.checked}));label.append(box,document.createTextNode(key+' — not connected'));$('platforms').append(label);}
 $('activity').replaceChildren();for(const row of state.activity){$('activity').append(el('li',new Date(row.at).toLocaleString()+' — '+row.message));}
}
function preview(a){artifact=a;$('preview-section').hidden=false;$('preview-title').textContent=a.name;const isVisual=['text/html','image/svg+xml'].includes(a.mime);$('preview').hidden=!isVisual;$('text-preview').hidden=isVisual;if(isVisual){$('preview').srcdoc=a.content;$('text-preview').textContent='';}else{$('preview').srcdoc='';$('text-preview').textContent=a.content;}$('preview-section').scrollIntoView({behavior:'auto'});}
function download(name,mime,content){const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('create-form').addEventListener('submit',e=>{e.preventDefault();const before=state.nextId;dispatch({type:'add',title:$('title').value,kind:$('kind').value});if(state.nextId!==before)$('title').value='';});
$('lock').onclick=()=>dispatch({type:'lock'});$('stop').onclick=()=>dispatch({type:'lock'});$('unlock').onclick=()=>dispatch({type:'unlock'});$('pause').onclick=()=>dispatch({type:'pause'});$('start').onclick=()=>dispatch({type:'start'});$('mode').onchange=()=>dispatch({type:'mode',value:$('mode').value});
$('download').onclick=()=>{if(artifact)download(artifact.name,artifact.mime,artifact.content);};$('close-preview').onclick=()=>{$('preview').srcdoc='';$('preview-section').hidden=true;artifact=null;};
$('export').onclick=()=>download('try4-workspace.json','application/json',Core.backup(state));$('tax-export').onclick=()=>download('try4-owner-records.csv','text/csv',Core.csv(state));
$('ledger-form').onsubmit=e=>{e.preventDefault();const before=state.ledger.length;dispatch({type:'ledger',row:{id:$('tx-id').value,date:$('tx-date').value,source:$('tx-source').value,cents:Number($('tx-cents').value),currency:'USD',status:$('tx-status').value}});if(state.ledger.length>before)$('ledger-form').reset();};
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1801000)throw Error('Backup is too large.');const next=Core.restore(await file.text());if(!confirm('Replace this workspace with the backup? Export your current workspace first if needed.'))return;localStorage.setItem(KEY,Core.backup(next));storageAvailable=true;state=next;render();notice('Backup restored. Emergency lock on.');}catch(err){notice('Restore rejected: '+err.message);}finally{e.target.value='';}};
$('erase').onclick=()=>{if(!confirm('Erase all Try 4 Creator Studio drafts and transaction records on this device? Other game saves are separate.'))return;try{localStorage.removeItem(KEY);state=Core.initial();storageAvailable=true;render();notice('Workspace erased. Emergency lock on.');}catch{notice('Browser storage cannot be changed.');}};
// Native host exposes no JavaScript bridge. These functions only exchange local text through evaluateJavascript.
window.try4Pause=()=>{if(state.running)dispatch({type:'pause'});};
window.try4Export=()=>Core.backup(state);
window.try4Import=raw=>{const next=Core.restore(raw);localStorage.setItem(KEY,Core.backup(next));state=next;storageAvailable=true;render();notice('Backup restored. Emergency lock on.');};
function pauseWhenHidden(){if(document.hidden&&state.running)dispatch({type:'pause'});}
document.addEventListener('visibilitychange',pauseWhenHidden);
window.addEventListener('storage',e=>{if(e.key===KEY){state.running=false;storageAvailable=false;notice('Workspace changed in another tab. Reload before making changes.');render();}});
setInterval(()=>{if(!document.hidden&&state.running&&!state.locked)dispatch({type:'tick'});},1200);
render();if(storageAvailable)notice('Workspace ready. Unlock to create local drafts. Nothing is published automatically.');
})();
