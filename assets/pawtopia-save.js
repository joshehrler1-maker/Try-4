(() => {
  const key = 'pawtopia-home-progress-v1';
  function read() {
    const defaults = { hero: '', coins: 0, lastClaim: '', badge: false, companion: null, otherCompanions: [], food: 0, toy: false, arcadeBests: {}, townCollection: {}, bankCoins: 0, shards: 0, storageBox: { food: 0, shards: 0 }, lastWish: "", lastSoup: "", lastInterest: "", lastArena: "" };
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!saved || typeof saved !== 'object') return defaults;
      const progress = { ...defaults, ...saved };
      progress.arcadeBests = { ...saved.arcadeBests };
      progress.townCollection = { ...saved.townCollection };
      progress.storageBox = { ...defaults.storageBox, ...saved.storageBox };
      return progress;
    } catch {
      return defaults;
    }
  }
  const utcDay = () => new Date().toISOString().slice(0, 10);
  const utcWeek = () => {
    const date = new Date();
    const monday = new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
    return monday.toISOString().slice(0,10);
  };
  const questDefs = Object.freeze({
    daily: Object.freeze([
      {id:'care',title:'Care for your companion twice',target:2,coins:5,href:'pawtopia-companions.html'},
      {id:'game',title:'Reach an original-game milestone',target:1,coins:8,href:'pawtopia-arcade.html'},
      {id:'battle',title:'Win a pet battle',target:1,coins:10,href:'pawtopia-battle-arena.html'},
      {id:'scout',title:'Solve a Scout Trail clue',target:1,coins:5,href:'pawtopia-scout-trails.html'},
      {id:'town',title:'Complete a town delivery quest',target:1,coins:6,href:'pawtopia-town.html#quests'}
    ]),
    weekly: Object.freeze([
      {id:'care',title:'Share six care moments',target:6,coins:20,href:'pawtopia-companions.html'},
      {id:'game',title:'Reach five original-game milestones',target:5,coins:25,href:'pawtopia-arcade.html'},
      {id:'battle',title:'Win five pet battles',target:5,coins:25,href:'pawtopia-battle-arena.html'},
      {id:'scout',title:'Solve three Scout Trail clues',target:3,coins:20,href:'pawtopia-scout-trails.html'}
    ])
  });
  const counters=()=>({care:0,game:0,battle:0,scout:0,town:0});
  const count=n=>Number.isSafeInteger(n)&&n>=0?Math.min(n,100000):0;
  function questJournal(progress=read()) {
    const raw=progress?.questJournal||{},day=utcDay(),week=utcWeek();
    const currentDaily=raw.day===day&&raw.daily&&typeof raw.daily==='object'?raw.daily:{};
    const currentWeekly=raw.week===week&&raw.weekly&&typeof raw.weekly==='object'?raw.weekly:{};
    const cleaned=source=>Object.fromEntries(Object.keys(counters()).map(k=>[k,count(source[k])]));
    const claimed=(items,valid)=>Array.isArray(items)?items.filter(id=>valid.some(q=>q.id===id)).slice(0,10):[];
    return {day,week,daily:cleaned(currentDaily),weekly:cleaned(currentWeekly),
      claimedDaily:raw.day===day?claimed(raw.claimedDaily,questDefs.daily):[],
      claimedWeekly:raw.week===week?claimed(raw.claimedWeekly,questDefs.weekly):[]};
  }
  const totalWins=progress=>[progress?.companion,...(Array.isArray(progress?.otherCompanions)?progress.otherCompanions:[])]
    .reduce((sum,cat)=>sum+count(cat?.battle?.wins),0);
  function trackJournal(before,after) {
    const changes=counters(),day=utcDay(),a=before?.companion,b=after?.companion;
    if(a&&b&&a.name===b.name&&a.breed===b.breed&&
      (count(b.fullness)>count(a.fullness)||count(b.happiness)>count(a.happiness))) changes.care=1;
    changes.battle=Math.min(20,Math.max(0,totalWins(after)-totalWins(before)));
    const previous=new Set(Array.isArray(before?.petUpgrades?.keys)?before.petUpgrades.keys:[]);
    const now=Array.isArray(after?.petUpgrades?.keys)?after.petUpgrades.keys:[];
    for(const entry of now) {
      if(typeof entry!=='string'||previous.has(entry)||!entry.startsWith(day+'|'))continue;
      const kind=entry.split('|')[1];
      if(['stage','clear','mini','3d-win'].includes(kind))changes.game++;
      if(kind==='scout')changes.scout++;
    }
    if(before?.questDelivered!==day&&after?.questDelivered===day) changes.town=1;
    if(!Object.values(changes).some(Boolean))return;
    const journal=questJournal(before);
    for(const id of Object.keys(changes)){
      journal.daily[id]=Math.min(100000,journal.daily[id]+changes[id]);
      journal.weekly[id]=Math.min(100000,journal.weekly[id]+changes[id]);
    }
    after.questJournal=journal;
    after.adventureTotals={...before.adventureTotals};
    const season=day.slice(0,4)+'-'+Math.ceil(Number(day.slice(5,7))/3);
    after.festival={season,points:before.festival?.season===season?count(before.festival.points):0};
    for(const [id,amount] of Object.entries(changes)){
      after.adventureTotals[id]=Math.min(100000,count(after.adventureTotals[id])+amount);
      if(amount && journal.daily[id]-amount<2){
        after.festival.points=Math.min(1000,after.festival.points+Math.min(amount,2-(journal.daily[id]-amount)));
      }
    }
  }
  async function update(change,options={}) {
    function write() {
      const progress=read(),before=read();
      const message=change(progress);
      if(message){
        if(options.track!==false)trackJournal(before,progress);
        const serialized = JSON.stringify(progress);
        localStorage.setItem(key,serialized);
        if (serialized !== JSON.stringify(before) && typeof window.Event === 'function' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new window.Event('pawtopia-save-changed'));
        }
      }
      return message;
    }
    try {
      return navigator.locks ? await navigator.locks.request(key,write) : write();
    } catch {
      return 'Progress could not be saved in this browser.';
    }
  }
  async function claimQuest(period,id){
    const list=questDefs[period],task=list?.find(item=>item.id===id);
    if(!task)return {ok:false,message:'Unknown quest.'};
    const claimedKey=period==='daily'?'claimedDaily':'claimedWeekly';
    let awarded=false;
    const message=await update(progress=>{
      if(!progress.companion)return 'Adopt a companion to claim quest rewards.';
      const journal=questJournal(progress);
      if(journal[claimedKey].includes(id))return 'This reward has already been collected.';
      if(journal[period][id]<task.target)return 'Finish the quest before claiming its reward.';
      journal[claimedKey].push(id);
      progress.questJournal=journal;
      progress.coins=Math.min(Number.MAX_SAFE_INTEGER,(Number.isSafeInteger(progress.coins)&&progress.coins>=0?progress.coins:0)+task.coins);
      awarded=true;
      return 'Claimed '+task.coins+' Paw Coins for '+task.title+'.';
    });
    const saved=questJournal().day===utcDay()&&questJournal()[claimedKey].includes(id);
    return {ok:awarded&&saved,message:awarded&&!saved?'Your browser could not save that reward.':message};
  }
  function safeBackupValue(value,depth=0,budget={remaining:20000},maxKeys=500){
    if(depth>18||--budget.remaining<0)throw Error('Backup contains too much data.');
    if(value===null||typeof value==='boolean')return;
    if(typeof value==='string'){if(value.length>10000)throw Error('Backup has an oversized text field.');return;}
    if(typeof value==='number'){if(!Number.isSafeInteger(value)||Math.abs(value)>Number.MAX_SAFE_INTEGER)throw Error('Backup contains an invalid number.');return;}
    if(Array.isArray(value)){
      if(value.length>1000)throw Error('Backup has an oversized list.');
      for(const item of value)safeBackupValue(item,depth+1,budget);
      return;
    }
    if(!value||typeof value!=='object'||Object.keys(value).length>maxKeys)throw Error('Backup has an invalid object.');
    for(const [name,item] of Object.entries(value)){
      if(['__proto__','constructor','prototype'].includes(name)||name.length>150)throw Error('Backup has an unsafe field.');
      const isCatalog = depth===0 && ['catalogItems','catalogDaily','catalogClaims'].includes(name);
      safeBackupValue(item,depth+1,budget,isCatalog?1400:500);
    }
  }
  function validateBackup(backup) {
    if(!backup||backup.format!=='pawtopia-progress-backup'||backup.version!==1||!backup.progress||
      typeof backup.progress!=='object'||Array.isArray(backup.progress))throw Error('Not a supported Pawtopia backup.');
    safeBackupValue(backup.progress);
    const p=backup.progress;
    if(typeof p.hero!=='string'||p.hero.length>100||
      !Number.isSafeInteger(p.coins)||p.coins<0||
      (p.companion!==null&&(!p.companion||typeof p.companion.name!=='string'||typeof p.companion.breed!=='string'))||
      (p.otherCompanions!==undefined&&(!Array.isArray(p.otherCompanions)||p.otherCompanions.length>24)))
      throw Error('Backup has invalid pet or coin information.');
    return p;
  }
  function exportBackup() {
    return {format:'pawtopia-progress-backup',version:1,exportedAt:new Date().toISOString(),progress:read()};
  }
  async function restoreBackup(backup){
    const incoming=validateBackup(backup);
    const message=await update(progress=>{
      for(const name of Object.keys(progress))delete progress[name];
      Object.assign(progress,incoming);
      return 'Progress restored from your backup.';
    },{track:false});
    const current=read(),ok=JSON.stringify(current.companion)===JSON.stringify(incoming.companion)&&
      current.coins===incoming.coins;
    return {ok,message:ok?message:'Restore could not be verified in this browser.'};
  }
  async function applyCloudBackup(backup, expected, stillConnected) {
    const incoming = validateBackup(backup);
    let applied = false;
    await update(progress => {
      if (!stillConnected() || JSON.stringify(progress) !== expected) return;
      for (const name of Object.keys(progress)) delete progress[name];
      Object.assign(progress, incoming);
      applied = true;
      return 'Online progress restored.';
    }, {track:false});
    return applied && JSON.stringify(read()) === JSON.stringify(incoming);
  }
  const baseStats = { level: 1, strength: 2, defence: 2, movement: 2, endurance: 2, intelligence: 2 };
  function battleStats(cat) {
    return { ...baseStats, ...cat?.stats };
  }
  function maxHealth(stats) {
    return 8 + stats.endurance * 2;
  }
  window.PawtopiaSave = { read, update, battleStats, maxHealth, today: () => new Date().toDateString(), questDefs, questJournal, claimQuest, exportBackup, restoreBackup, applyCloudBackup };
  // The public site stays usable if online features are disabled or the service is down.
  const source = typeof document !== 'undefined' && document.currentScript;
  if (source && !document.querySelector('script[src$="pawtopia-cloud-save.js"]')) {
    const config = document.createElement('script');
    config.src = new URL('pawtopia-online-config.js', source.src).href;
    config.onload = () => {
      if (!window.PawtopiaOnlineConfig?.endpoint) return;
      for (const link of document.querySelectorAll('[data-pawtopia-online]')) link.hidden = false;
      try {
        if (!localStorage.getItem('pawtopia-online-key')) return;
      } catch { return; }
      const sync = document.createElement('script');
      sync.src = new URL('pawtopia-cloud-save.js', source.src).href;
      document.head.append(sync);
    };
    // Wait for navigation links below the script to exist, including on arcade pages.
    const mount = () => document.head.append(config);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
    else mount();
  }
})();
