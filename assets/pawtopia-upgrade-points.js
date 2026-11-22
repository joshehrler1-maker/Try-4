/* Cross-game Pawtopia pet upgrade points. Browser-local and zero cost.
   First-party checkpoints/wins are milestone rewards. Publisher-hosted games
   offer only a capped launch bonus because iframe scores cannot be inspected. */
(() => {
  'use strict';
  const save=window.PawtopiaSave;
  if(!save)return;
  const kinds=Object.freeze({
    'stage':1,'clear':3,'mini':1,'3d-win':3,'scout':1,
    'battle-win':2,'guest-launch':1,'guest3d-launch':1
  });
  const maxDaily=30,guestDaily=4,maxBalance=9999;
  const stats=Object.freeze(['level','strength','defence','movement','endurance','intelligence']);
  const isWhole=n=>Number.isSafeInteger(n)&&n>=0;
  const today=()=>new Date().toISOString().slice(0,10);
  const keyPart=x=>typeof x==='string'&&/^[a-z0-9-]{1,80}$/.test(x);
  function ledger(progress) {
    const raw=progress?.petUpgrades;
    const date=today();
    return {
      day:date,
      balance:isWhole(raw?.balance)?Math.min(maxBalance,raw.balance):0,
      earned:isWhole(raw?.earned)?raw.earned:0,
      spent:isWhole(raw?.spent)?raw.spent:0,
      daily:raw?.day===date&&isWhole(raw.daily)?Math.min(maxDaily,raw.daily):0,
      guest:raw?.day===date&&isWhole(raw.guest)?Math.min(guestDaily,raw.guest):0,
      keys:raw?.day===date&&Array.isArray(raw.keys)?
        raw.keys.filter(key=>typeof key==='string'&&key.startsWith(date+'|')).slice(-150):[]
    };
  }
  function state(){return ledger(save.read())}
  async function claim(kind,game,milestone='complete'){
    if(!Object.hasOwn(kinds,kind)||!keyPart(game)||!keyPart(milestone))
      return {granted:0,balance:state().balance,message:'Invalid game milestone.'};
    // Only first-party games may issue milestone awards. External frames get
    // a capped launch bonus, not an invented completion or score.
    if(kind==='stage'&&!/^game-(?:[0-9]|1[0-9]|2[0-4])$/.test(game))
      return {granted:0,balance:state().balance,message:'Unknown Pawcade game.'};
    if(kind==='clear'&&milestone!=='complete')
      return {granted:0,balance:state().balance,message:'Invalid game clear.'};
    if(kind==='clear'&&!/^game-(?:[0-9]|1[0-9]|2[0-4])$/.test(game))
      return {granted:0,balance:state().balance,message:'Unknown Pawcade game.'};
    if(kind==='stage'&&!/^stage-[1-6]$/.test(milestone))
      return {granted:0,balance:state().balance,message:'Invalid stage.'};
    if(kind==='3d-win'&&(!['maze-0','maze-1','maze-2'].includes(game)||milestone!=='escape'))
      return {granted:0,balance:state().balance,message:'Unknown 3D game.'};
    if(kind==='mini'&&(!['courier','forge','beacons','lantern','crystal','defense'].includes(game)||!/^score-(1|3|6)$/.test(milestone)))
      return {granted:0,balance:state().balance,message:'Invalid arcade milestone.'};
    if(kind==='scout'&&(!['meadow','grotto','garden','frost'].includes(game)||milestone!=='solved'))
      return {granted:0,balance:state().balance,message:'Unknown scout trail.'};
    const roster=window.PawtopiaBattleData;
    const challenger=kind==='battle-win'?roster?.foes?.find(foe=>foe.id===game):null;
    if(kind==='battle-win'&&(!challenger||milestone!=='victory'))
      return {granted:0,balance:state().balance,message:'Invalid challenger victory.'};
    if((kind==='guest-launch'||kind==='guest3d-launch')&&milestone!=='launch')
      return {granted:0,balance:state().balance,message:'Guest launches cannot claim win rewards.'};
    // All breeds in one tier share the same daily award. Keep existing
    // rank-based claim keys so an update cannot grant today's award twice.
    const awardKey=challenger?'foe-'+challenger.rank:game;
    const k=today()+'|'+kind+'|'+awardKey+'|'+milestone;
    const amount=challenger?(roster.battlePoints?.(challenger.rank)??kinds[kind]):kinds[kind];
    const guestKind=kind==='guest-launch'||kind==='guest3d-launch';
    let changed=false;
    await save.update(progress=>{
      if(challenger){
        const match=progress.battleMatch;
        if(match?.foeId!==game||!match.finished||match.result!=='win')return '';
      }
      const item=ledger(progress);
      if(item.keys.includes(k)||item.daily+amount>maxDaily||item.balance+amount>maxBalance||
         (guestKind&&item.guest+amount>guestDaily))return '';
      item.balance+=amount;
      item.earned=Math.min(Number.MAX_SAFE_INTEGER,item.earned+amount);
      item.daily+=amount;
      if(guestKind)item.guest+=amount;
      item.keys.push(k);
      progress.petUpgrades=item;
      changed=true;
      return '+'+amount+' pet upgrade '+(amount===1?'point':'points');
    });
    // Confirm the same-origin save actually contains the award; never claim
    // successful persistence based on a thrown/failed localStorage write.
    const current=state();
    const granted=changed&&current.keys.includes(k)?amount:0;
    if(granted&&typeof window.dispatchEvent==='function'&&typeof window.CustomEvent==='function')
      window.dispatchEvent(new CustomEvent('pawtopia-upgrade-points',{detail:{kind,game,granted,balance:current.balance}}));
    return {granted,balance:current.balance,
      message:granted?'+'+granted+' pet upgrade '+(granted===1?'point':'points')+'. Train at Companion Cottage.':
        'Already claimed or daily points limit reached.'};
  }
  function canSpend(progress,stat){
    if(!stats.includes(stat)||!progress?.companion||ledger(progress).balance<1)return false;
    const values=save.battleStats(progress.companion);
    const level=isWhole(values.level)?Math.max(1,values.level):1;
    if(stat==='level')return level<200;
    const max=stat==='endurance'?level*3:level*2;
    return isWhole(values[stat])&&values[stat]<max;
  }
  async function train(stat) {
    if(!stats.includes(stat))return {ok:false,message:'Choose a valid pet stat.'};
    let changed=false;
    const message=await save.update(progress=>{
      if(!canSpend(progress,stat))return '';
      const book=ledger(progress);
      if(book.balance<1)return '';
      const values=save.battleStats(progress.companion);
      values[stat]=Math.min(stat==='level'?200:600,values[stat]+1);
      progress.companion.stats=values;
      book.balance--;
      book.spent=Math.min(Number.MAX_SAFE_INTEGER,book.spent+1);
      progress.petUpgrades=book;
      changed=true;
      return progress.companion.name+' gained +1 '+stat+' using 1 pet upgrade point.';
    });
    return {ok:changed&&typeof message==='string'&&message.includes('gained +1'),
      message:changed&&typeof message==='string'&&message.includes('gained +1')?
        message:'No points available, no active pet, or this stat has reached its current cap.',
      balance:state().balance};
  }
  window.PawtopiaUpgradePoints=Object.freeze({claim,train,state,canSpend,kinds,stats,maxDaily,guestDaily});
})();