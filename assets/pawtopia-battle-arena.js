/* Visible Pawtopia pet battles: real animated actors, synced impact VFX and
   accessible turn buttons. No network requests, accounts or paid assets. */
(() => {
  'use strict';
  const save=window.PawtopiaSave,data=window.PawtopiaBattleData,engine=window.PawtopiaBattleEngine;
  const characterArt=window.PawtopiaBattleCharacterArt;
  const paintCat=(...args)=>characterArt?.paintFighter?characterArt.paintFighter(...args):characterArt?.paint(...args);
  const foeArt=window.PawtopiaBattleFoeArt;
  const cinematics=window.PawtopiaBattleCinematics;
  const watcher=window.PawtopiaBattleWatch;
  const sound=window.PawtopiaBattleSound;
  const itemArt=window.PawtopiaItemArt;
  const el=id=>document.getElementById(id);
  if(!save||!data||!engine||!el('battle-stage'))return;
  let challengerTier=0;
  const requestedPet=window.location?.search?new URLSearchParams(window.location.search).get('pet'):null;
  let selectedPet=/^[0-5]$/.test(requestedPet||'')?Number(requestedPet):0,selectedFoe=0,busy=false,soundOn=false;
  let watchMode=false,watchPaused=false,watchLoopRunning=false,waitForResume=null,playbackSpeed=1;
  let frameQuality=window.navigator?.connection?.saveData?'efficient':'smooth';
  const select=el('battle-pet-select');
  const stage=el('battle-stage');
  const playArea=el('arena-play-area');
  function showBattleStage(){
    if(document.fullscreenElement===playArea || playArea?.classList.contains('game-fullscreen-expanded'))return;
    (playArea||stage).scrollIntoView?.({behavior:reduced()?'auto':'smooth',block:'start'});
  }
  window.PawtopiaBattle3D?.create(el('battle-3d'),stage,{floorOnly:true});
  const petSprite=el('battle-pet-sprite'),foeSprite=el('battle-foe-sprite');
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduced()?Math.min(ms,25):Math.max(0,Math.round(ms/playbackSpeed))));
  const addText=(parent,tag,text,className)=>{
    const item=document.createElement(tag);item.textContent=text;
    if(className)item.className=className;
    parent.append(item);return item;
  };
  function cueSound(cue,options={}){
    sound?.play(cue,{...options,speed:playbackSpeed});
  }
  function spriteArt(cat) {
    const kit=data.kitFor(cat?.breed);
    const art=el('battle-cat-art');
    if(!cat){
      // Do not display Maine Coon's portrait as a pretend adopted cat.
      art.innerHTML='';
      art.dataset.breed='';
      art.classList.remove('has-body-art');
      art.style.backgroundImage='none';
      art.setAttribute('aria-label','Adopt a cat to show your fighter here');
      petSprite.classList.add('needs-adoption');
      el('battle-cat-tag').textContent='ADOPT A CAT';
      return kit;
    }
    petSprite.classList.remove('needs-adoption');
    if (characterArt && art.dataset.breed !== kit.breed) {
      paintCat(art,kit.breed,'idle');
      art.dataset.breed=kit.breed;
    } else if (!characterArt) {
      art.style.backgroundImage='url("'+kit.sprite.src+'")';
      art.style.backgroundSize=kit.sprite.backgroundSize;
      art.style.backgroundPosition=kit.sprite.backgroundPosition;
    }
    art.setAttribute('aria-label',(cat?.name||'Your cat')+' · '+kit.breed+
      ' illustrated breed model · '+(characterArt?.identityFor(kit.breed)?.label||'Battle fighter'));
    petSprite.dataset.motion=kit.movement;
    petSprite.style.setProperty('--cat-skill-color',kit.theme.color);
    el('battle-cat-tag').textContent=kit.breed;
    return kit;
  }
  const gearFor=(progress,cat,match)=>itemArt?.equipped(window.PawtopiaItems,progress,cat,match)||[];
  function gearAura(items){
    const holder=el('battle-gear-aura');
    if(!holder||!itemArt)return;
    const weapon=items.find(item=>itemArt.design(item).aura);
    if(holder.dataset.itemArt===(weapon?.id||''))return;
    holder.dataset.itemArt=weapon?.id||'';
    holder.innerHTML=weapon?itemArt.aura(weapon):'';
    holder.hidden=!weapon;
  }
  function renderGear(progress,cat,match){
    const list=el('battle-gear-items');
    if(!list||!itemArt)return;
    const items=gearFor(progress,cat,match);
    list.replaceChildren();
    for(const item of items){
      const chip=addText(list,'li','','battle-gear-chip');
      itemArt.mount(addText(chip,'span','','item-mini-portrait'),item);
      addText(chip,'span',item.name);
    }
    gearAura(items);
  }
  function showGearEffects(evt,items){
    if(!itemArt||evt.who==='system')return;
    const attacking=evt.who==='pet'&&evt.target==='foe'&&evt.damage>0;
    const defending=evt.who==='foe'&&evt.target==='pet'||evt.who==='pet'&&evt.fx==='guard';
    const spell=attacking&&!['swipe','impact','guard'].includes(evt.fx);
    let order=0;
    for(const item of items){
      const style=itemArt.design(item);
      if(!style.tier)continue;
      if(item.slot==='weapon'&&!attacking)continue;
      if((item.slot==='armor'||item.slot==='wearable')&&!defending)continue;
      if(item.slot==='relic'&&!spell&&!defending&&evt.name!=='Relic Counter')continue;
      const effect=addText(el('battle-vfx'),'span','','battle-item-effect');
      effect.dataset.finish=String(style.finish);
      effect.dataset.side=attacking?'foe':'pet';
      effect.dataset.travel=String(style.n%3);
      effect.style.setProperty('--gear-offset',((order++-1)*2.2)+'rem');
      effect.innerHTML=itemArt.effect(item);
      const image=addText(effect,'span','','battle-item-sigil');
      itemArt.mount(image,item);
      setTimeout(()=>effect.remove(),reduced()?500:720/playbackSpeed);
    }
  }
  function renderRecommendation(progress,stats,unlockedTier,blocked) {
    const heading=el('next-challenge'), reward=el('arena-recommendation-rewards'), pick=el('arena-select-recommended');
    if(!reward||!pick)return;
    if(!stats) {
      heading.textContent='Adopt a cat to get a recommendation.';
      reward.textContent='';
      pick.hidden=true;
      return;
    }
    const targetTier=Math.min(unlockedTier,stats.bestRank+1);
    const candidates=data.foes.filter(foe=>foe.rank<=targetTier && foe.level<=stats.level+2);
    const recommendation=candidates.reduce((best,foe)=>!best||foe.rank>best.rank||
      (foe.rank===best.rank&&Math.abs(foe.level-stats.level)<Math.abs(best.level-stats.level))?foe:best,null)
      || data.foes.find(foe=>foe.rank===1);
    heading.textContent=recommendation.name+' · Tier '+recommendation.rank+' · Suggested Lv '+recommendation.level;
    const medal=['Bronze Paw Medal','Silver Paw Medal','Golden Paw Crown'][[4,8,12].indexOf(recommendation.rank)];
    const extras=[];
    if(recommendation.rank<=3 && (stats.wins+1)%2===0)extras.push('1 snack');
    if(recommendation.rank>=4) {
      const shards=1+Math.floor((recommendation.rank-4)/3);
      extras.push(shards+' crystal shard'+(shards===1?'':'s'));
    }
    if(recommendation.rank>=7 && !progress.toy)extras.push('first Crystal Toy');
    if(medal&&!stats.trophies.includes(medal))extras.push('first-win '+medal);
    const daily=data.battlePoints?.(recommendation.rank)||2;
    reward.textContent=[recommendation.coins+' Paw Coins',recommendation.xp*3+' XP',...extras,
      daily+' upgrade points on the first win in this tier today'].join(' · ');
    pick.hidden=false;
    pick.disabled=blocked;
    pick.dataset.foe=String(data.foes.indexOf(recommendation));
  }
  function render() {
    const progress=save.read(),cats=engine.fighters(progress),view=engine.matchInfo(progress);
    const fighting=view&&!view.match.finished;
    if(fighting){
      const index=cats.findIndex(cat=>cat.battleId===view.cat.battleId);
      if(index>=0)selectedPet=index;
      const foeIndex=data.foes.findIndex(foe=>foe.id===view.foe.id);
      if(foeIndex>=0)selectedFoe=foeIndex;
    }
    selectedPet=Math.min(Math.max(selectedPet,0),Math.max(0,cats.length-1));
    selectedFoe=Math.min(Math.max(selectedFoe,0),data.foes.length-1);
    const unlockedTier=engine.unlocked(progress);
    if(!fighting && data.foes[selectedFoe].rank>unlockedTier)
      selectedFoe=data.foes.findIndex(enemy=>enemy.rank===unlockedTier);
    const pet=cats[selectedPet],foe=data.foes[selectedFoe];
    const currentView=view&&view.cat===pet&&view.foe.id===foe.id?view:null;
    select.replaceChildren(...cats.map((cat,index)=>{
      const option=document.createElement('option');
      option.value=String(index);
      option.textContent=(cat.name||'Cat')+' · '+cat.breed+' · Lv '+engine.level(cat);
      return option;
    }));
    if(!cats.length){
      const option=document.createElement('option');option.textContent='Adopt a cat first';
      option.value='';select.append(option);
    }
    select.value=pet?String(selectedPet):'';
    const equipment=el('battle-pet-equipment');
    if(equipment)equipment.href='pawtopia-pet-equipment.html'+(pet?'?pet='+selectedPet:'');
    select.disabled=busy||Boolean(fighting)||!cats.length;
    const stats=pet?engine.profile(pet):null;
    const gearSummary=el('arena-loadout');
    if (gearSummary) {
      const gear=['weapon','armor','relic'].map(slot=>window.PawtopiaItems?.worn(progress,pet,slot)?.name).filter(Boolean);
      gearSummary.textContent=gear.length?'Gear for next match: '+gear.join(' · '):'Equip gear in Pets Equipment before your next match.';
    }
    renderGear(progress,pet,currentView?.match.finished?null:currentView?.match);
    el('battle-pet-detail').textContent=pet
      ?pet.breed+' · Fighting style: '+(characterArt?.identityFor(pet.breed)?.label||'Balanced Claw')+
        ' · Strength '+engine.training(pet).strength+' · Defence '+engine.training(pet).defence+
        ' · Movement '+engine.training(pet).movement+' · Endurance '+engine.training(pet).endurance+
        ' · Intelligence '+engine.training(pet).intelligence
      :'Visit Companion Cottage to adopt one of 56 cats.';
    el('battle-xp').max=stats?stats.nextXp:18;
    el('battle-xp').value=stats?stats.xp:0;
    el('battle-xp-text').textContent=stats?(stats.level>=200?'Maximum level':stats.xp+' / '+stats.nextXp+' XP'):'0 / 18 XP';
    el('battle-record').textContent=stats?stats.wins+' wins · '+stats.losses+' losses · Highest rank '+stats.bestRank:'No battles yet';
    el('battle-trophies').textContent=stats&&stats.trophies.length?stats.trophies.join(' · '):'No trophies yet. Defeat ranked opponents to earn them.';
    const tier=challengerTier||foe.rank;
    const filter=el('battle-foe-tier');
    if(filter) {
      filter.value=String(tier);
      filter.disabled=busy||Boolean(fighting)||watchMode;
    }
    el('battle-tier-status').textContent=tier>unlockedTier
      ?'Tier '+tier+' is locked. Win in Tier '+(tier-1)+' to unlock it. Selected match: '+foe.name+' (Tier '+foe.rank+').'
      :'Selected challenger: '+foe.name+' (Tier '+foe.rank+').';
    const target=Math.max(2,foe.level);
    el('battle-preparation').textContent='Suggested preparation for '+foe.name+
      ': level '+foe.level+' and about '+target+' in each combat stat. Gear can help make up the difference.';
    renderRecommendation(progress,stats,unlockedTier,busy||Boolean(fighting)||watchMode);
    const choices=data.foes.flatMap((enemy,index)=>{
      if(enemy.rank!==tier)return [];
      const locked=enemy.rank>engine.unlocked(progress);
      const button=document.createElement('button');button.type='button';button.className='foe-choice'+(locked?' locked':'');
      button.dataset.foe=String(index);
      button.disabled=locked||busy||Boolean(fighting)||watchMode;
      button.setAttribute('aria-pressed',String(selectedFoe===index));
      addText(button,'strong',(locked?'🔒 ':'')+enemy.glyph+' '+enemy.name);
      addText(button,'small',enemy.sizeLabel+' · Recommended Lv '+enemy.level);
      addText(button,'small',enemy.coins+' Paw Coins · '+(enemy.xp*3)+' XP · '+(data.battlePoints?.(enemy.rank)||2)+' daily upgrade points / tier');
      addText(button,'small',enemy.loot);
      return button;
    });
    el('battle-foe-list').replaceChildren(...choices);
    el('battle-start').disabled=busy||Boolean(fighting)||watchMode||!pet||foe.rank>engine.unlocked(progress);
    el('battle-watch').disabled=busy||watchMode||!watcher||!pet||foe.rank>engine.unlocked(progress);
    el('battle-watch').textContent=fighting?'▶ Watch Remaining Battle':'▶ Start & Watch Battle';
    el('battle-pause').disabled=!watchMode;
    el('battle-pause').textContent=watchPaused?'Resume Watching':'Pause after this turn';
    el('battle-pause').setAttribute('aria-pressed',String(watchPaused));
    el('battle-stop-watch').disabled=!watchMode;
    el('battle-speed').value=String(playbackSpeed);
    el('battle-quality').value=frameQuality;
    el('battle-start').textContent=currentView?.match.finished?'Start a New Battle':'Enter Arena';
    el('battle-forfeit').disabled=busy||watchMode||!fighting;
    const activeCat=currentView?currentView.cat:pet,activeFoe=currentView?currentView.foe:foe;
    const kit=spriteArt(activeCat);
    const petModel=activeCat?characterArt?.getArt(activeCat.breed):null, houndModel=foeArt?.profile(activeFoe);
    const stances=el('arena-3d-stances');
    if(stances && window.PawtopiaBattle3D?.profileFor && houndModel){
      const names=[petModel && window.PawtopiaBattle3D.profileFor(petModel).label,
        window.PawtopiaBattle3D.profileFor(houndModel,true).label].filter(Boolean);
      stances.textContent=names.join(' · ');
      stances.hidden=false;
    }
    stage.style.setProperty('--foe-color',activeFoe.color);
    el('battle-foe-emblem').textContent=activeFoe.glyph;
    const intent=engine.foeIntent?.(activeFoe,currentView?.match);
    stage.dataset.foeIntent=intent && !busy ? intent.id : '';
    const intentLabel=el('battle-foe-intent');
    if(intentLabel){
      intentLabel.hidden=!intent || busy;
      if(intent && !busy){
        intentLabel.dataset.intent=intent.id;
        intentLabel.textContent=intent.text+' '+intent.hint;
      }
    }
    if(foeArt&&el('battle-foe-art')){
      const finished=currentView?.match.finished;
      const pose=finished?(currentView.match.result==='win'?'defeat':currentView.match.result==='loss'?'victory':'idle'):intent?.pose||'idle';
      foeArt.paint(el('battle-foe-art'),activeFoe,pose,intent?.pose==='charge'?1:3);
      foeSprite.classList.add('has-foe-art');
    }
    el('stage-pet-name').textContent=activeCat?.name||'Your Cat';
    el('stage-pet-level').textContent='Lv '+(activeCat?engine.level(activeCat):1);
    el('stage-foe-name').textContent=activeFoe.name;
    el('stage-foe-level').textContent='Lv '+activeFoe.level;
    const petMax=currentView?currentView.petMaxHp:activeCat?engine.maxHp(activeCat):20;
    const petHP=currentView?currentView.petHp:petMax;
    const foeMax=activeFoe.hp,foeHP=currentView?currentView.foeHp:foeMax;
    el('stage-pet-hp').max=petMax;el('stage-pet-hp').value=petHP;
    el('stage-pet-hp-text').textContent=petHP+'/'+petMax+' HP';
    el('stage-foe-hp').max=foeMax;el('stage-foe-hp').value=foeHP;
    el('stage-foe-hp-text').textContent=foeHP+'/'+foeMax+' HP';
    const moves=activeCat?engine.moveList(activeCat,currentView?.match):data.movesFor({breed:'Maine Coon'});
    el('battle-moves').replaceChildren(...moves.map(move=>{
      const button=document.createElement('button');
      button.type='button';button.dataset.move=move.id;
      button.className='move-button'+(!move.unlocked?' locked':'');
      button.disabled=!fighting||busy||watchMode||!move.ready;
      addText(button,'strong',move.name);
      addText(button,'small',move.description,'move-description');
      addText(button,'small',move.note||(move.unlocked?'Ready':'Level '+move.level+' required'));
      return button;
    }));
    const history=currentView?.match.history;
    el('battle-log').replaceChildren(...(Array.isArray(history)&&history.length?history.slice(-24).reverse():['Adopt a cat and choose a challenger to begin.']).map(text=>{
      const li=document.createElement('li');li.textContent=text;return li;
    }));
    const finished=currentView?.match.finished;
    if(finished){
      const result=currentView.match.result;
      if(characterArt&&activeCat){
        paintCat(el('battle-cat-art'),activeCat.breed,result==='win'?'victory':result==='loss'?'defeat':'idle');
      }
      el('battle-outcome').textContent=result==='win'?'🏆 Victory! Rewards added to this cat and Pawtopia inventory.':
        result==='loss'?'💫 Defeat. Train and try again; no coins lost.':'Match forfeited without a penalty.';
      petSprite.classList.toggle('state-victory',result==='win');
      foeSprite.classList.toggle('state-defeat',result==='win');
      foeSprite.classList.toggle('state-victory',result==='loss');
    }else{
      petSprite.classList.remove('state-victory','state-defeat');
      foeSprite.classList.remove('state-victory','state-defeat');
      if(characterArt&&activeCat&&!busy){
        paintCat(el('battle-cat-art'),activeCat.breed,'idle');
      }
      el('battle-outcome').textContent='';
    }
    if(!fighting&&busy)el('battle-moves').querySelectorAll('button').forEach(button=>button.disabled=true);
    void kit;
  }
  function status(message) {
    if(typeof message==='string'&&message)el('battle-status').textContent=message;
  }
  function cueFor(evt,kit,foe) {
    return cinematics?.presentation(evt,kit,foe)||null;
  }
  function showCue(visual) {
    const cue=el('battle-cue');
    if(!cue||!visual)return;
    el('battle-cue-source').textContent=visual.source;
    el('battle-cue-title').textContent=visual.title;
    el('battle-cue-detail').textContent=visual.subtitle;
    cue.setAttribute('data-side',visual.side);
    cue.setAttribute('data-power',visual.power);
    cue.style.setProperty('--cue-color',visual.color);
    cue.classList.add('is-visible');
  }
  function hideCue() {
    el('battle-cue')?.classList.remove('is-visible');
  }
  function launchSkillProjectile(visual,kit,travelMs) {
    if(!visual?.skill||!kit||reduced())return;
    const bolt=document.createElement('span');
    const name=String(kit.signature||'Skill');
    const initials=name.split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0,2)
      .map(word=>word[0].toUpperCase()).join('');
    bolt.className='battle-projectile';
    bolt.dataset.skillId=visual.skillAssetId;
    bolt.dataset.type=visual.skill;
    bolt.dataset.fx=visual.fx;
    bolt.textContent=visual.skill==='ultimate'?visual.symbol:initials||visual.symbol;
    bolt.style.setProperty('--bolt-color',visual.color);
    bolt.style.setProperty('--travel-time',Math.max(1,Math.round(travelMs))+'ms');
    el('battle-vfx').append(bolt);
    setTimeout(()=>bolt.remove(),travelMs);
  }
  function cameraContact(evt,visual,color,point) {
    if(reduced())return;
    const ring=document.createElement('span');
    ring.className='battle-impact-ring';
    ring.dataset.strength=visual?.power||'normal';
    ring.style.setProperty('--hit-x',point.x);
    ring.style.setProperty('--hit-y',point.y);
    ring.style.setProperty('--effect-color',color);
    const backdropClass=visual?.power==='ultimate'?'stage-power-contact':
      /Charge/.test(evt.name)?'stage-contact-foe':null;
    stage.classList.remove('stage-power-contact','stage-contact-pet','stage-contact-foe');
    void stage.offsetWidth;
    if(backdropClass)stage.classList.add(backdropClass);
    el('battle-vfx').append(ring);
    setTimeout(()=>{
      ring.remove();
      if(backdropClass)stage.classList.remove(backdropClass);
    },500);
  }
  function burst(evt,color,visual,point) {
    const combat=cinematics?.combatVisual(evt);
    const box=el('battle-vfx');
    const target=point.x;
    const glyph=evt.fx==='frost'?'❄':evt.fx==='leaf'?'❧':
      evt.fx==='water'?'◈':evt.fx==='gear'?'⚙':evt.fx==='wind'?'➶':
      evt.fx==='shadow'?'✧':evt.fx==='star'?'★':evt.fx==='guard'?'◈':'✦';
    const count=reduced()||evt.reaction==='dodge'?0:evt.fx==='guard'?6:evt.fx==='swipe'?8:16;
    for(let n=0;n<count;n++){
      const particle=document.createElement('span');particle.className='burst-particle';particle.textContent=glyph;
      particle.style.setProperty('--hit-x',target);particle.style.setProperty('--hit-y',point.y);
      particle.style.setProperty('--effect-color',color);
      const angle=Math.PI*2*n/count;
      particle.style.setProperty('--dx',Math.round(Math.cos(angle)*(50+n%3*18))+'px');
      particle.style.setProperty('--dy',Math.round(Math.sin(angle)*(40+n%3*13))+'px');
      particle.style.setProperty('--spin',(n%2?80:-80)+'deg');
      box.append(particle);setTimeout(()=>particle.remove(),900);
    }
    if(combat?.cameraShake)cameraContact(evt,visual,color,point);
    if(combat?.defense){
      const label=document.createElement('span');
      label.className='defense-popup';
      label.textContent=combat.label;
      label.style.setProperty('--hit-x',target);
      label.style.setProperty('--hit-y',point.y);
      box.append(label);
      setTimeout(()=>label.remove(),900);
    }
    if(evt.damage>0) {
      const label=document.createElement('span');label.className='damage-popup';
      label.textContent='−'+evt.damage;
      label.style.setProperty('--hit-x',target);label.style.setProperty('--hit-y',point.y);
      box.append(label);setTimeout(()=>label.remove(),950);
    }
  }
  function barAfter(evt){
    if(evt.target==='pet'&&typeof evt.remaining==='number'){
      const progress=el('stage-pet-hp');
      progress.value=evt.remaining;
      el('stage-pet-hp-text').textContent=evt.remaining+'/'+progress.max+' HP';
    }
    if(evt.target==='foe'&&typeof evt.remaining==='number'){
      const progress=el('stage-foe-hp');
      progress.value=evt.remaining;
      el('stage-foe-hp-text').textContent=evt.remaining+'/'+progress.max+' HP';
    }
  }
  async function playArtFrames(cat,state,duration,fromPose='swipe'){
    if(!characterArt||!cat)return;
    const lightweight=frameQuality==='efficient'||window.navigator?.connection?.saveData;
    const quick=['approach','walk','run','guard','impact','recover'].includes(state);
    const smooth=(!lightweight&&(quick?characterArt.smoothFrames:characterArt.flowFrames))||null;
    const frames=smooth||(!lightweight&&characterArt.smoothFrames)||characterArt.animationFrames||[3];
    if(reduced()){
      paintCat(el('battle-cat-art'),cat.breed,state==='recover'?'idle':state,3);
      await wait(25);
      return;
    }
    if(state==='idle'){
      paintCat(el('battle-cat-art'),cat.breed,'idle',3);
      await wait(duration||characterArt.timingFor(cat.breed,state));
      return;
    }
    const totalMs=duration||characterArt.timingFor(cat.breed,state);
    const minimumInterval=lightweight?28:18;
    const clock=()=>window.performance?.now?.()??Date.now();
    const started=clock();
    // A slow phone should skip delayed in-betweens, not stretch a 650ms
    // attack into several seconds or delay the entire Watch Battle.
    const budget=Math.max(1,totalMs/playbackSpeed);
    for(let index=0;index<frames.length;index++){
      const elapsed=Math.max(0,clock()-started);
      const due=Math.min(frames.length-1,
        Math.floor(elapsed/budget*(frames.length-1)));
      index=Math.max(index,due);
      const frame=frames[index];
      if(state==='recover')paintCat(el('battle-cat-art'),cat.breed,state,frame,fromPose);
      else paintCat(el('battle-cat-art'),cat.breed,state,frame);
      if(index===frames.length-1)break;
      const nextFrameAt=(index+1)*budget/(frames.length-1);
      await wait(Math.max(minimumInterval,(nextFrameAt-(clock()-started))*playbackSpeed));
    }
  }
  async function playFoeFrames(foe,state,duration=440){
    if(!foeArt||!foe||!el('battle-foe-art'))return;
    const efficient=frameQuality==='efficient'||window.navigator?.connection?.saveData;
    const painted=el('battle-foe-art').dataset.dogPainting==='true';
    const frames=reduced()?[3]:painted&&!efficient?(foeArt.smoothFrames||foeArt.frameIds):foeArt.frameIds;
    for(const frame of frames){
      foeArt.paint(el('battle-foe-art'),foe,state,frame);
      await wait(reduced()?25:Math.max(18,Math.floor(duration/frames.length)));
    }
  }
  function fighterPosition(sprite,x=0,depth=0,weight=0){
    sprite.style.setProperty('--fighter-travel',x.toFixed(2)+'px');
    sprite.style.setProperty('--fighter-depth',depth.toFixed(2)+'px');
    sprite.style.setProperty('--fighter-weight',String(weight));
  }
  async function playExchange(evt,visual,kit,cat,foe,equipped,stance,keep){
    const motion=window.PawtopiaBattleMotion;
    const isPet=evt.who==='pet';
    const actor=isPet?petSprite:foeSprite, defender=isPet?foeSprite:petSprite;
    const catArt=cat?characterArt?.getArt(cat.breed):null;
    const clip=motion.plan(evt,visual,catArt,foe,
      visual?.skill&&cat?characterArt?.timingFor(cat.breed,visual.skill):null);
    const defenderProfile=motion.profile(catArt,foe,!isPet);
    const reaction=evt.damage>0?'impact':clip.outcome==='dodge'?'approach':'guard';
    const direction=isPet?1:-1;
    const actorWidth=(isPet?el('battle-cat-art'):el('battle-foe-art')).offsetWidth||actor.offsetWidth;
    const defenderWidth=(isPet?el('battle-foe-art'):el('battle-cat-art')).offsetWidth||defender.offsetWidth;
    const a=actor.getBoundingClientRect(), b=defender.getBoundingClientRect();
    const previousActor=stance[evt.who];
    const other=evt.who==='pet'?'foe':'pet';
    const previousDefender=stance[other];
    const distance=Math.abs(a.left+a.width/2-previousActor.x-(b.left+b.width/2-previousDefender.x));
    const reach=Math.min(stage.clientWidth*.38,Math.max(actorWidth*.06,
      distance-(actorWidth+defenderWidth)*clip.actor.reach));
    const steps=Math.max(1,Math.min(3,Math.round(reach/Math.max(1,actorWidth*clip.actor.step*clip.actor.stride))));
    const simple=reduced();
    const economical=frameQuality==='efficient'||window.navigator?.connection?.saveData;
    const speed=playbackSpeed;
    const duration=simple?130:clip.duration/speed;
    const skillAudio={theme:kit.theme.type,ultimate:clip.skill==='ultimate',side:evt.who};
    const previous=new Map();
    function paint(pet,pose,frame,from){
      const frameStep=economical?1:.5;
      const stepped=Math.round(frame/frameStep)*frameStep;
      const key=pose+'|'+stepped+'|'+(from||'');
      if(previous.get(pet)===key)return;
      previous.set(pet,key);
      if(pet&&cat)paintCat(el('battle-cat-art'),cat.breed,pose,stepped,from);
      else if(!pet&&foe)foeArt?.paint(el('battle-foe-art'),foe,pose,stepped,from);
    }
    function impact(){
      barAfter(evt);
      showGearEffects(evt,equipped);
      const at=evt.target===evt.who?actor:defender;
      const art=el(evt.target==='pet'?'battle-cat-art':'battle-foe-art');
      const bounds=art?.offsetWidth?art.getBoundingClientRect():at.getBoundingClientRect();
      const floor=stage.getBoundingClientRect();
      const x=((bounds.left-floor.left+bounds.width*(clip.guard||clip.skill ? .5 : isPet ? .34 : .66))/Math.max(1,floor.width))*100;
      const y=((bounds.top-floor.top+bounds.height*.61)/Math.max(1,floor.height))*100;
      const point={x:Math.max(7,Math.min(93,x))+'%',y:Math.max(20,Math.min(83,y))+'%'};
      burst(evt,clip.guard?'#84e4d8':isPet?kit.theme.color:foe.color,visual,point);
      if(!clip.guard)cueSound(evt.damage>0?(clip.skill?'spellHit':'hit'):clip.outcome==='dodge'?'step':'block',
        {...skillAudio,heavy:clip.charge||evt.damage>=22,side:evt.target});
    }
    const release=t=> {
      cueSound('cast',skillAudio);
      launchSkillProjectile(visual,kit,duration*(clip.contact-t));
    };
    const setFrame=t=>{
      const frame=motion.sample(clip,t,reach,steps);
      const response=motion.reaction(clip,t,defenderWidth,defenderProfile,keep);
      const carry=Math.max(0,1-t/.30);
      const x=direction*frame.x+previousActor.x*carry;
      const depth=previousActor.depth*carry;
      fighterPosition(actor,x,depth,Math.abs(frame.x)/Math.max(1,reach));
      fighterPosition(defender,previousDefender.x*carry+direction*(response?.x||0),
        previousDefender.depth*carry+(response?.depth||0),response?.x? .22 : 0);
      if(t<.14 && previousActor.pose!=='idle'){
        paint(isPet,previousActor.pose,previousActor.frame);
      }else if(keep&&clip.guard&&t>=.69)paint(isPet,'guard',3);
      else paint(isPet,frame.pose,frame.frame,frame.from);
      if(response)paint(!isPet,response.pose,response.frame,response.from);
      else if(t>=.28&&!clip.guard&&previousDefender.pose!=='guard')paint(!isPet,'idle',3);
      if(t===1){
        stance[evt.who]={x:0,depth:0,pose:keep&&clip.guard?'guard':'idle',frame:3};
        stance[other]={
          x:direction*(response?.x||0),depth:response?.depth||0,
          pose:keep&&clip.outcome==='dodge'?'approach':clip.guard?previousDefender.pose:'idle',
          frame:clip.guard?previousDefender.frame:keep&&clip.outcome==='dodge'?5:3
        };
      }
    };
    cueSound(clip.guard?'guard':clip.skill?'windup':clip.charge?'charge':'step',skillAudio);
    if(simple){
      paint(isPet,clip.action,3);
      if(!clip.guard)paint(!isPet,reaction,3);
      impact();
      await new Promise(resolve=>setTimeout(resolve,duration));
      return;
    }
    const now=()=>window.performance?.now?.()??Date.now();
    let start=now();
    let released=false,landed=false,footfall=false,t=0;
    for(;;){
      t=Math.max(t,Math.min(1,(now()-start)/duration));
      if(clip.release!==null&&!released&&t>=clip.release){
        released=true;
        if(t<clip.contact)release(t);
      }
      if(!footfall&&!clip.skill&&!clip.guard&&t>=Math.min(.35,clip.contact-.12)){
        footfall=true;
        const bounds=actor.getBoundingClientRect(), floor=stage.getBoundingClientRect();
        const dust=document.createElement('span');
        dust.className='battle-foot-dust';
        dust.style.left=(bounds.left-floor.left+bounds.width*.52)+'px';
        dust.style.top=(bounds.bottom-floor.top-bounds.height*.12)+'px';
        el('battle-vfx').append(dust);
        setTimeout(()=>dust.remove(),450);
      }
      if(!landed&&t>=clip.contact){
        landed=true;
        setFrame(clip.contact);
        if(!clip.skill&&!clip.guard)cueSound('swipe',skillAudio);
        impact();
        if(clip.pause){
          const pause=clip.pause/speed;
          await new Promise(resolve=>setTimeout(resolve,pause));
          start+=pause;
          t=clip.contact;
        }else if(t>clip.contact)setFrame(t);
      }else setFrame(t);
      if(t===1)break;
      const nextMark=!released&&clip.release!==null?clip.release:!landed?clip.contact:1;
      const delay=Math.min(economical?45:24,Math.max(1,duration*(nextMark-t)));
      await new Promise(resolve=>setTimeout(resolve,delay));
    }
  }
  async function showEvents(events,cat,preview=false){
    const kit=data.kitFor(cat?.breed);
    const progress=save.read(), current=preview?null:engine.matchInfo(progress);
    const foe=current?.foe||data.foes[selectedFoe];
    const equipped=gearFor(progress,cat,current?.match);
    gearAura(equipped);
    const idle=()=>({x:0,depth:0,pose:'idle',frame:3});
    const stance={pet:idle(),foe:idle()};
    stage.dataset.foeIntent='';
    stage.classList.add('has-fighter-timeline');
    try{
      for(const [index,evt] of events.entries()){
        const visual=cueFor(evt,kit,foe);
        showCue(visual);
        try{
          if(evt.who==='system'){
            fighterPosition(petSprite);
            fighterPosition(foeSprite);
            const won=evt.fx==='victory';
            cueSound(won?'victory':'defeat');
            await Promise.all([playArtFrames(cat,won?'victory':'defeat',430),
              playFoeFrames(foe,won?'defeat':'victory',430)]);
            if(cat)paintCat(el('battle-cat-art'),cat.breed,won?'victory':'defeat');
            foeArt?.paint(el('battle-foe-art'),foe,won?'defeat':'victory');
            await wait(320);
          }else await playExchange(evt,visual,kit,cat,foe,equipped,stance,
            Boolean(events[index+1]&&events[index+1].who!=='system'));
        }finally{hideCue();}
      }
    }finally{
      fighterPosition(petSprite);
      fighterPosition(foeSprite);
      stage.classList.remove('has-fighter-timeline');
    }
  }
  async function saveAction(callback) {
    let outcome;
    const saved=await save.update(progress=>{
      outcome=callback(progress);
      return outcome?.message||'';
    });
    if(!outcome||saved!==outcome.message){
      status(typeof saved==='string'&&saved?'Could not confirm saved progress: '+saved:'Progress could not be saved.');
      return null;
    }
    return outcome;
  }
  select.addEventListener('change',()=>{
    const num=Number(select.value);
    if(Number.isInteger(num)){selectedPet=num;render();}
  });
  el('arena-select-recommended')?.addEventListener('click',event=>{
    const index=Number(event.currentTarget.dataset.foe);
    if(!data.foes[index]||event.currentTarget.disabled)return;
    selectedFoe=index;
    challengerTier=data.foes[index].rank;
    render();
  });
  el('battle-foe-tier')?.addEventListener('change',event=>{
    const tier=Number(event.target.value);
    const index=data.foes.findIndex(enemy=>enemy.rank===tier);
    if(index<0||busy)return;
    challengerTier=tier;
    const progress=save.read(),match=engine.matchInfo(progress)?.match;
    if(tier<=engine.unlocked(progress) && (!match||match.finished) && data.foes[selectedFoe].rank!==tier)selectedFoe=index;
    render();
  });
  el('battle-foe-list').addEventListener('click',event=>{
    const choice=event.target.closest('button[data-foe]');
    if(!choice||choice.disabled||busy)return;
    selectedFoe=Number(choice.dataset.foe);render();
    status('Challenger selected: '+data.foes[selectedFoe].name+'. Start a battle when ready.');
  });
  el('battle-start').addEventListener('click',async()=>{
    if(busy)return;busy=true;
    try{
      const result=await saveAction(progress=>engine.start(progress,selectedPet,selectedFoe));
      if(result){
        status(result.message);
        if(result.ok)showBattleStage();
      }
    }catch{status('The battle could not be started safely.');}
    finally{busy=false;render();}
  });
  el('battle-forfeit').addEventListener('click',async()=>{
    if(busy)return;busy=true;
    try{const result=await saveAction(progress=>engine.forfeit(progress));if(result)status(result.message);}
    catch{status('Could not finish this match safely.');}
    finally{busy=false;render();}
  });
  async function performTurn(moveId,fromWatch=false) {
    if(busy||(watchMode&&!fromWatch))return false;
    busy=true;
    const progress=save.read(),view=engine.matchInfo(progress);
    const cat=view?.cat;
    el('battle-moves').querySelectorAll('button').forEach(button=>button.disabled=true);
    try {
      const result=await saveAction(progress=>engine.takeTurn(progress,moveId));
      if(!result)return false;
      if(!result.ok){status(result.message);return false;}
      try {
        await showEvents(result.events||[],cat);
        status(result.message);
      }catch{
        hideCue();
        for(const actor of [petSprite,foeSprite])
          actor.classList.remove('state-approach','state-swipe','state-cast','state-guard','state-impact','state-victory','state-defeat');
        status(result.message+' The animation could not be shown.');
      }
      return true;
    }catch{
      status('This round could not be completed safely.');
      return false;
    }finally{
      busy=false;
      render();
    }
  }
  function releaseWatchWait() {
    const resolve=waitForResume;
    waitForResume=null;
    if(resolve)resolve();
  }
  async function runWatchMode() {
    if(watchLoopRunning||!watcher)return;
    watchLoopRunning=true;
    let turns=0;
    try {
      while(watchMode&&turns<watcher.maxTurns) {
        if(document.hidden&&!watchPaused) {
          watchPaused=true;
          status('Watch mode paused because the tab is hidden. Resume when you return.');
          render();
        }
        if(watchPaused) {
          await new Promise(resolve=>{waitForResume=resolve;});
          continue;
        }
        const view=engine.matchInfo(save.read());
        if(!view||view.match.finished)break;
        const move=watcher.chooseMove(view,engine.moveList(view.cat,view.match));
        if(!move){status('No ready move. Stop watching and choose an available attack.');break;}
        const success=await performTurn(move,true);
        if(!success)break;
        turns++;
        if(!watchMode)break;
        await wait(310);
      }
      if(watchMode&&turns>=watcher.maxTurns)
        status('Watch mode stopped after 75 rounds. The match is saved; finish manually if needed.');
    }catch{
      status('Watch mode stopped safely. Your saved battle remains available.');
    }finally{
      watchMode=false;watchPaused=false;watchLoopRunning=false;
      releaseWatchWait();
      render();
    }
  }
  el('battle-moves').addEventListener('click',async event=>{
    const button=event.target.closest('button[data-move]');
    if(!button||button.disabled||busy||watchMode)return;
    await performTurn(button.dataset.move);
  });
  el('battle-watch').addEventListener('click',async()=>{
    if(watchMode||busy||!watcher)return;
    const current=engine.matchInfo(save.read());
    if(!current||current.match.finished) {
      busy=true;
      try{
        const result=await saveAction(progress=>engine.start(progress,selectedPet,selectedFoe));
        if(!result?.ok){if(result)status(result.message);return;}
        status(result.message);
      }catch{
        status('Could not start the match safely.');
        return;
      }finally{
        busy=false;render();
      }
    }
    watchMode=true;
    watchPaused=false;
    render();
    showBattleStage();
    await runWatchMode();
  });
  el('battle-pause').addEventListener('click',()=>{
    if(!watchMode)return;
    watchPaused=!watchPaused;
    if(!watchPaused)releaseWatchWait();
    render();
    status(watchPaused?'Watch will pause after the current turn. Resume whenever you want.':
      'Watching the current battle again.');
  });
  el('battle-stop-watch').addEventListener('click',()=>{
    if(!watchMode)return;
    watchMode=false;watchPaused=false;
    releaseWatchWait();
    render();
    status(busy?'Stopping after the current turn. You can continue manually.':
      'Watch mode stopped. Your match is still available to finish manually.');
  });
  el('battle-speed').addEventListener('change',()=>{
    playbackSpeed=watcher?.speed(el('battle-speed').value)||1;
    render();
    status('Battle animation speed: '+playbackSpeed+'×.');
  });
  el('battle-quality').addEventListener('change',()=>{
    const next=el('battle-quality').value;
    frameQuality=next==='efficient'?'efficient':'smooth';
    render();
    status(frameQuality==='efficient'?'Battery saver uses fewer drawings with the same hit timing.':
      'Cinematic mode uses more drawings for smoother steps and recovery.');
  });
  document.addEventListener?.('visibilitychange',()=>{
    if(document.hidden&&watchMode) {
      watchPaused=true;
      render();
      status('Watch mode paused while this tab is hidden to save battery.');
    }
  });
  const previewDuel=el('arena-3d-preview');
  if(previewDuel&&characterArt&&foeArt){
    previewDuel.hidden=false;
    previewDuel.addEventListener('click',async()=>{
      if(busy||watchMode)return;
      const progress=save.read(),current=engine.matchInfo(progress);
      if(current&&!current.match.finished){
        status('Finish your current fight before previewing a duel.');
        return;
      }
      const ownedCat=engine.fighters(progress)[selectedPet];
      const cat=ownedCat||{name:'Maine Coon (demo)',breed:'Maine Coon'};
      const enemy=data.foes[selectedFoe];
      busy=true;
      render();
      previewDuel.disabled=true;
      try{
        spriteArt(cat);
        el('stage-pet-name').textContent=cat.name;
        el('stage-foe-name').textContent=enemy.name;
        if(!ownedCat)el('battle-cat-tag').textContent='DEMO';
        paintCat(el('battle-cat-art'),cat.breed);
        foeArt.paint(el('battle-foe-art'),enemy);
        status('Preview duel. Your saved battle is untouched.');
        showBattleStage();
        await showEvents([
          {who:'pet',target:'foe',name:'Paw Swipe',damage:0,fx:'swipe',remaining:20,reaction:'dodge'},
          {who:'pet',target:'pet',name:'Guard Curl',damage:0,fx:'guard',remaining:20},
          {who:'foe',target:'pet',name:'Gear Fang Charge',damage:0,fx:'impact',remaining:20,reaction:'block'},
          {who:'pet',target:'foe',name:data.kitFor(cat.breed).ultimate,damage:20,fx:data.kitFor(cat.breed).theme.type,remaining:0},
          {who:'system',target:'none',name:'Victory!',damage:0,fx:'victory',remaining:0}
        ],cat,true);
        status('Preview duel complete.');
      }finally{
        busy=false;
        previewDuel.disabled=false;
        render();
        if(!ownedCat&&!engine.fighters(save.read()).length){
          spriteArt(cat);
          paintCat(el('battle-cat-art'),cat.breed);
          el('stage-pet-name').textContent=cat.name;
          el('battle-cat-tag').textContent='DEMO';
        }
      }
    });
  }
  const previewBox=el('battle-art-preview-actions');
  if(previewBox)previewBox.addEventListener('click',async event=>{
    const button=event.target.closest('button[data-battle-pose]');
    if(!button||busy||!characterArt)return;
    const cat=engine.fighters(save.read())[selectedPet];
    if(!cat){status('Adopt a cat first to preview battle art.');return;}
    const pose=button.dataset.battlePose;
    if(!characterArt.poseKeys.includes(pose))return;
    busy=true;
    const actionClass={
      idle:'',walk:'state-approach',run:'state-approach',
      approach:'state-approach',swipe:'state-swipe',
      guard:'state-guard',signature:'state-cast',ultimate:'state-cast',
      impact:'state-impact',recover:'',
      victory:'state-victory',defeat:'state-defeat'
    }[pose];
    try{
      previewBox.querySelectorAll('button').forEach(item=>item.disabled=true);
      petSprite.classList.remove('state-approach','state-swipe','state-cast','state-guard','state-impact','state-victory','state-defeat');
      if(actionClass)petSprite.classList.add(actionClass);
      status(cat.name+' performs '+pose+'. Art preview only — no battle move or reward used.');
      if(pose==='recover'){
        // Establish the source pose before displaying a standalone recovery.
        await playArtFrames(cat,'signature',characterArt.timingFor(cat.breed,'signature'));
      }
      await playArtFrames(cat,pose,pose==='idle'?1500:characterArt.timingFor(cat.breed,pose),
        pose==='recover'?'signature':'swipe');
      if(pose!=='idle'&&pose!=='recover'&&!reduced())
        await playArtFrames(cat,'recover',240,pose);
    }catch{
      status('This art preview could not be displayed.');
    }finally{
      petSprite.classList.remove('state-approach','state-swipe','state-cast','state-guard','state-impact','state-victory','state-defeat');
      busy=false;
      previewBox.querySelectorAll('button').forEach(item=>item.disabled=false);
      render();
    }
  });
  el('battle-sound').addEventListener('click',()=>{
    soundOn=Boolean(sound?.setEnabled(!soundOn));
    el('battle-sound').setAttribute('aria-pressed',String(soundOn));
    el('battle-sound').textContent='Sound: '+(soundOn?'On':'Off');
    if(soundOn)cueSound('enabled');
  });
  window.addEventListener('pageshow',()=>{if(!busy)render();});
  window.addEventListener('storage',()=>{if(!busy)render();});
  render();
})();
