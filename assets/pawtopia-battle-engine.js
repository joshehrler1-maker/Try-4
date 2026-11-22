/* Pawtopia Battle Arena: offline, turn-based, zero-cost combat engine.
   Existing companions retain their identity, portraits and training data. */
(() => {
  'use strict';
  const data = window.PawtopiaBattleData;
  const MAX_LEVEL = 200;
  const safe = (x, fallback = 0) => Number.isSafeInteger(x) && x >= 0 ? x : fallback;
  const clamp = (x, min, max) => Math.min(max, Math.max(min, x));
  const fighters = progress => [progress?.companion, ...(Array.isArray(progress?.otherCompanions) ? progress.otherCompanions : [])].filter(Boolean).slice(0, 6);
  const level = cat => clamp(safe(cat?.stats?.level, 1), 1, MAX_LEVEL);
  const training = cat => ({
    strength: safe(cat?.stats?.strength,2),
    defence: safe(cat?.stats?.defence,2),
    movement: safe(cat?.stats?.movement,2),
    endurance: safe(cat?.stats?.endurance,2),
    intelligence: safe(cat?.stats?.intelligence,2)
  });
  const maxHp = cat => {
    const s = training(cat);
    return clamp(14 + s.endurance * 3 + level(cat) * 2, 18, 2000);
  };
  const guardBlock=(stats,gear)=>clamp(2+Math.floor(stats.defence/2),2,50)+safe(gear.guard)+safe(gear.marketCurl);
  const openingInitiative=(cat,stats,gear)=>stats.movement+level(cat)/4+safe(gear.initiative)+safe(gear.marketSpeed)+safe(gear.styleSpeed);
  const equippedMaxHp=(cat,gear)=>maxHp(cat)+safe(gear.health)+safe(gear.marketHealth)+safe(gear.styleHealth);
  function rawPower(move,cat,stats){
    return move==='swipe'?3+stats.strength+Math.floor(level(cat)/3):
      move==='signature'?5+stats.strength+stats.intelligence+Math.floor(level(cat)/2):
      10+stats.strength*2+stats.intelligence+level(cat);
  }
  function loadoutProfile(cat,gear={}){
    const stats=training(cat);
    return {
      health:clamp(equippedMaxHp(cat,gear),18,2040),
      swipe:rawPower('swipe',cat,stats),
      signature:rawPower('signature',cat,stats)+safe(gear.signature)+safe(gear.marketSignature),
      ultimate:rawPower('ultimate',cat,stats)+safe(gear.ultimate)+safe(gear.marketFinisher),
      guard:guardBlock(stats,gear),
      initiative:openingInitiative(cat,stats,gear)
    };
  }
  function profile(cat) {
    const a = cat?.battle || {};
    return { level:level(cat), xp:safe(a.xp), nextXp:12+level(cat)*6, wins:safe(a.wins),
      losses:safe(a.losses), bestRank:safe(a.bestRank), trophies:Array.isArray(a.trophies)?a.trophies.filter(x=>typeof x==='string').slice(0,16):[] };
  }
  function ensure(cat) {
    if (!cat.battleId) cat.battleId='pet-'+Date.now().toString(36)+'-'+Math.floor(Math.random()*1e9).toString(36);
    if (!cat.battle || typeof cat.battle!=='object' || Array.isArray(cat.battle)) cat.battle={};
    cat.battle.xp=safe(cat.battle.xp);
    cat.battle.wins=safe(cat.battle.wins);
    cat.battle.losses=safe(cat.battle.losses);
    cat.battle.bestRank=safe(cat.battle.bestRank);
    if (!Array.isArray(cat.battle.trophies)) cat.battle.trophies=[];
    return cat;
  }
  const unlocked = progress => clamp(safe(progress?.battleUnlocked,1),1,data.bossRank || data.foes.length);
  const foeById = id => data.foes.find(foe=>foe.id===id);
  function opponent(progress){
    const match=progress?.battleMatch,foe=foeById(match?.foeId);
    if(!foe)return null;
    const recorded=match.foeCombat;
    if(recorded)return {...foe,hp:safe(recorded.hp,foe.hp),attack:safe(recorded.attack,foe.attack)};
    return {...foe,hp:foe.legacyHp??foe.hp,attack:foe.legacyAttack??foe.attack};
  }
  const battlingCat = progress => fighters(progress).find(cat=>cat.battleId && cat.battleId===progress?.battleMatch?.petId);
  function matchInfo(progress) {
    const match=progress?.battleMatch,foe=opponent(progress),cat=battlingCat(progress);
    if (!match || !foe || !cat) return null;
    const petMaxHp=clamp(safe(match.gearMaxHp,maxHp(cat)),18,2040);
    const hp=clamp(safe(match.hp),0,petMaxHp);
    const foeHp=clamp(safe(match.foeHp),0,foe.hp);
    return { cat,foe,match,petHp:hp,petMaxHp,foeHp,foeMaxHp:foe.hp };
  }
  function moveList(cat, match) {
    const lv=level(cat);
    return data.movesFor(cat).map(move=>({
      ...move,unlocked:lv>=move.level,
      ready:lv>=move.level &&
        !(match && (move.id==='ultimate' && match.ultimateUsed ||
          move.id==='signature' && safe(match.signatureReadyAt)>safe(match.round))),
      note:lv<move.level?'Level '+move.level+' to unlock' :
        move.id==='ultimate'&&match?.ultimateUsed?'Used this battle':
        move.id==='signature'&&safe(match?.signatureReadyAt)>safe(match?.round)?'Recharging':'Ready'
    }));
  }
  function start(progress, catIndex, foeIndex) {
    const cats=fighters(progress),cat=cats[catIndex],foe=data.foes[foeIndex];
    if (!cat || !foe || !Number.isInteger(catIndex) || !Number.isInteger(foeIndex))
      return {ok:false,message:'Adopt a cat and choose a challenger.'};
    if (foe.rank>unlocked(progress))return {ok:false,message:'Defeat the previous challenger to unlock this match.'};
    if (matchInfo(progress) && !progress.battleMatch.finished)
      return {ok:false,message:'Finish or forfeit your current match before starting another.'};
    ensure(cat);
    const market=window.PawtopiaItems;
    const gear=market?.arena(progress,cat) || {};
    const gearArt=['weapon','armor','relic','wearable'].map(slot=>market?.worn?.(progress,cat,slot)?.id).filter(Boolean);
    const gearMaxHp=equippedMaxHp(cat,gear);
    progress.battleMatch={
      petId:cat.battleId,foeId:foe.id,hp:gearMaxHp,foeHp:foe.hp,gear,gearMaxHp,gearArt,foeCombat:{hp:foe.hp,attack:foe.attack},
      round:1,guard:0,dodge:0,foeSlow:0,ultimateUsed:false,
      signatureReadyAt:0,finished:false,result:'',lastMove:'',history:['A new battle begins!']
    };
    return {ok:true,message:cat.name+' challenges '+foe.name+'! Choose a move and watch the fight.'};
  }
  function grantVictory(progress,cat,foe) {
    const a=ensure(cat).battle;
    a.wins++;
    a.bestRank=Math.max(safe(a.bestRank),foe.rank);
    const previousLevel=level(cat),xpAward=foe.xp*3;
    a.xp+=xpAward;
    if (!cat.stats || typeof cat.stats!=='object') cat.stats={};
    cat.stats.level=previousLevel;
    while (cat.stats.level<MAX_LEVEL && a.xp>=12+cat.stats.level*6) {
      a.xp-=12+cat.stats.level*6;
      cat.stats.level++;
    }
    if (cat.stats.level>=MAX_LEVEL) a.xp=0;
    progress.battleUnlocked=Math.max(unlocked(progress),Math.min(data.bossRank || data.foes.length,foe.rank+1));
    progress.coins=Math.min(Number.MAX_SAFE_INTEGER,safe(progress.coins)+foe.coins);
    const rewards=['+'+foe.coins+' Paw Coins','+'+xpAward+' XP'];
    if (foe.rank===1 || foe.rank===2 || foe.rank===3) {
      if (a.wins%2===0){ progress.food=safe(progress.food)+1;rewards.push('1 snack'); }
    } else {
      const shardAmount=1+Math.floor((foe.rank-4)/3);
      progress.shards=safe(progress.shards)+shardAmount;
      rewards.push(shardAmount+' crystal shard'+(shardAmount===1?'':'s'));
    }
    if (foe.rank>=7 && !progress.toy){ progress.toy=true;rewards.push('Crystal toy'); }
    if (foe.rank>=4 && [4,8,12].includes(foe.rank)) {
      const trophy=foe.rank===4?'Bronze Paw Medal':foe.rank===8?'Silver Paw Medal':'Golden Paw Crown';
      if (!a.trophies.includes(trophy)){ a.trophies.push(trophy);rewards.push(trophy); }
    }
    const gearCoins=safe(progress.battleMatch.gear?.winCoin)+safe(progress.battleMatch.gear?.marketReward);
    if (gearCoins) {
      progress.coins=Math.min(Number.MAX_SAFE_INTEGER,progress.coins+gearCoins);
      rewards.push('+'+gearCoins+' gear bonus Paw Coin');
    }
    const collectible=window.PawtopiaItems?.arenaReward(progress,foe.rank);
    if (collectible) rewards.push(collectible);
    if (cat.stats.level>previousLevel) rewards.push('Level up! '+previousLevel+' → '+cat.stats.level);
    return rewards;
  }
  function forfeit(progress) {
    const view=matchInfo(progress);
    if (!view || view.match.finished)return {ok:false,message:'There is no active match to forfeit.'};
    ensure(view.cat).battle.losses++;
    view.match.finished=true;view.match.result='forfeit';
    view.match.history=[...(Array.isArray(view.match.history)?view.match.history:[]),'Match forfeited without a penalty.'].slice(-24);
    return {ok:true,message:'Match ended. No coins or XP were lost.'};
  }
  function takeTurn(progress,moveId,random=Math.random) {
    const view=matchInfo(progress);
    if (!view || view.match.finished)return {ok:false,message:'Choose a cat and challenger to begin.',events:[]};
    const {cat,foe,match,petMaxHp}=view;
    const gear=match.gear||{};
    const moves=moveList(cat,match),move=moves.find(item=>item.id===moveId);
    if (!move || !move.ready)return {ok:false,message:move?.note||'This move is unavailable.',events:[]};
    const rng=typeof random==='function'?random:Math.random;
    const rand=()=>clamp(Number(rng())||0,0,0.999999);
    const s=training(cat),kit=data.kitFor(cat.breed),events=[];
    const makeEvent=(who,name,target,damage,remaining,fx,detail)=>events.push({
      who,name,target,damage:Math.max(0,damage),remaining,fx,detail:detail||''
    });
    const petAttack=()=>{
      if (moveId==='guard') {
        match.guard=guardBlock(s,gear);
        const firstCurl = !match.marketCurlUsed ? safe(gear.marketMend) : 0;
        match.marketCurlUsed=true;
        match.armoryCounterReady=!match.armoryCounterUsed && Boolean(gear.armoryRiposte);
        const restored=Math.min(petMaxHp-match.hp,safe(gear.guardHeal)+firstCurl);
        match.hp+=restored;
        makeEvent('pet','Guard Curl','pet',0,match.hp,'guard',restored?'Blocks the next blow · restored '+restored+' HP':'Blocks the next blow');
        return;
      }
      let damage=rawPower(moveId,cat,s);
      damage=clamp(damage-Math.floor(foe.defence/2)-Math.max(0,safe(match.foeGuard)-safe(gear.pierce)),1,450);
      if(moveId==='swipe' && !match.firstSwipeUsed) {
        damage+=safe(gear.firstSwipe);
        match.firstSwipeUsed=true;
      }
      if(match.round%3===0)damage+=safe(gear.thirdHit);
      if(match.hp*2<petMaxHp)damage+=safe(gear.lowHp);
      if(!match.marketAttackUsed){
        damage+=safe(gear.marketOpening);
        match.marketAttackUsed=true;
      }
      if(moveId==='signature')damage+=safe(gear.signature)+safe(gear.marketSignature);
      if(moveId==='ultimate')damage+=safe(gear.ultimate)+safe(gear.marketFinisher);
      if(moveId==='swipe' && match.lastMove==='guard')damage+=safe(gear.armoryFollowup);
      if(match.foeGuard)damage+=safe(gear.armoryBreak);
      match.foeGuard=0;
      let detail='';
      if(moveId==='signature'||moveId==='ultimate'){
        const bonus=kit.theme.bonus;
        if(bonus==='crit'){damage+=Math.max(2,Math.floor(damage/3));detail='Spark critical!';}
        else if(bonus==='slow'){match.foeSlow=2;detail='Foe slowed';}
        else if(bonus==='guard'){match.guard=3+Math.floor(s.defence/2);detail='Guard aura';}
        else if(bonus==='heal'){const heal=Math.min(petMaxHp-match.hp,3+Math.floor(s.intelligence/2));match.hp+=heal;detail='Restored '+heal+' HP';}
        else if(bonus==='dodge'){match.dodge=1;detail='Evasion prepared';}
        else if(bonus==='extra'){damage+=2+Math.floor(s.movement/2);detail='Extra gear strike';}
        else if(bonus==='pierce'){damage+=2+Math.floor(foe.defence/2);detail='Piercing strike';}
        if(moveId==='ultimate'){
          match.ultimateUsed=true;
          const recovery=Math.min(petMaxHp-match.hp,safe(gear.armoryVigor));
          match.hp+=recovery;
          detail+=(detail?' · ':'')+'Ultimate!'+(recovery?' Restored '+recovery+' HP from gear.':'');
        }
        if(moveId==='signature'){
          match.signatureReadyAt=match.round+2;
          if(gear.firstSlow && !match.gearSlowUsed){
            match.foeSlow=2;
            match.gearSlowUsed=true;
            detail+=(detail?' · ':'')+'Hush Coil slowed the foe';
          }
        }
      }
      if(rand()<Math.min(.17,.03+s.movement/400)){damage+=Math.max(1,Math.floor(damage/3))+safe(gear.armoryCritical);detail+=(detail?' · ':'')+'Critical!';}
      match.foeHp=Math.max(0,match.foeHp-damage);
      makeEvent('pet',move.name,'foe',damage,match.foeHp,
        moveId==='swipe'?'swipe':kit.theme.type,detail);
    };
    const enemyAttack=()=>{
      if(match.foeHp<=0)return;
      const isHeavy=match.round%3===0;
      if(foe.rank>=4&&match.round%5===0){
        match.foeGuard=2+Math.floor(foe.rank/4);
        makeEvent('foe',foe.isBoss?'Iron Guard':'Brace','foe',0,match.foeHp,'guard',foe.isBoss?'Armor powered up':'Braced for the next hit');
        return;
      }
      let damage=foe.attack+(isHeavy?2+Math.floor(foe.rank/4):0)-Math.floor(s.defence/2);
      damage=Math.max(1,damage);
      if(match.foeSlow){damage=Math.max(1,damage-2);match.foeSlow=0;}
      if(match.dodge){match.dodge=0;damage=0;}
      const blockedByCurl=match.armoryCounterReady && match.guard>0 && damage>0;
      if(match.guard){damage=Math.max(0,damage-match.guard);match.guard=0;}
      match.armoryCounterReady=false;
      if(rand()<Math.min(.12,.03+foe.rank/180))damage+=Math.max(0,2-safe(gear.critBlock));
      if(isHeavy)damage=Math.max(0,damage-safe(gear.heavyBlock)-safe(gear.marketHeavy));
      if(damage>0 && !match.firstBlocked){
        damage=Math.max(0,damage-safe(gear.firstBlock)-safe(gear.styleGuard));
        match.firstBlocked=true;
      }
      if(match.round<=2)damage=Math.max(0,damage-safe(gear.armoryOpening));
      if(match.hp*2<petMaxHp)damage=Math.max(0,damage-safe(gear.armoryRepeat));
      match.hp=Math.max(0,match.hp-damage);
      makeEvent('foe',isHeavy?(foe.isBoss?'Gear Fang Charge':'Rushing Charge'):(foe.isBoss?'Metal Paw Strike':'Paw Strike'),'pet',damage,match.hp,
        isHeavy?'impact':'swipe',damage===0?'Dodged or blocked!':'');
      if(damage>0 && !match.armoryRecovered){
        match.armoryRecovered=true;
        const amount=match.hp>0 ? Math.min(petMaxHp-match.hp,safe(gear.armoryRecovery)) : 0;
        if(amount){
          match.hp+=amount;
          makeEvent('pet','Armor Recovery','pet',0,match.hp,'guard','Restored '+amount+' HP');
        }
      }
      if(blockedByCurl && match.hp>0){
        match.armoryCounterUsed=true;
        const counter=safe(gear.armoryRiposte);
        match.foeHp=Math.max(0,match.foeHp-counter);
        makeEvent('pet','Relic Counter','foe',counter,match.foeHp,'impact');
      }
    };
    // Defensive curls must activate before the foe moves. Other moves use speed for initiative.
    const petFirst=moveId==='guard'||(match.round===1?openingInitiative(cat,s,gear):s.movement+level(cat)/4+safe(gear.armorySecond))+rand()*3 >= foe.speed+foe.level/4+rand()*3;
    if(petFirst){petAttack();enemyAttack();}else{enemyAttack();if(match.hp>0)petAttack();}
    match.lastMove=moveId;
    match.history=[...(Array.isArray(match.history)?match.history:[]),...events.map(e=>e.name+(e.damage?' dealt '+e.damage+' damage':'')+(e.detail?' · '+e.detail:''))].slice(-24);
    match.round++;
    let rewards=[];
    if(match.foeHp<=0){
      match.finished=true;match.result='win';
      rewards=grantVictory(progress,cat,foe);
      events.push({who:'system',name:'Victory!',target:'none',damage:0,remaining:0,fx:'victory',detail:rewards.join(' · ')});
      match.history.push('Victory! '+rewards.join(' · '));match.history=match.history.slice(-24);
    } else if(match.hp<=0){
      match.finished=true;match.result='loss';
      ensure(cat).battle.losses++;
      events.push({who:'system',name:'Practice Complete',target:'none',damage:0,remaining:0,fx:'defeat',detail:'Try training or challenging a weaker foe. No coins lost.'});
      match.history.push('Defeat. Try training or a weaker foe; no coins lost.');match.history=match.history.slice(-24);
    }
    return {ok:true,message:match.finished
      ?(match.result==='win'?'Victory! '+rewards.join(' · '):'The challenger won. Your cat is safe and can try again.')
      :cat.name+' used '+move.name+'. Round '+match.round+'.',events,rewards};
  }
  window.PawtopiaBattleEngine=Object.freeze({
    fighters,level,training,maxHp,loadoutProfile,profile,unlocked,matchInfo,moveList,start,takeTurn,forfeit
  });
})();