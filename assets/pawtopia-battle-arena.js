/* Visible Pawtopia pet battles: real animated actors, synced impact VFX and
   accessible turn buttons. No network requests, accounts or paid assets. */
(() => {
  'use strict';
  const save=window.PawtopiaSave,data=window.PawtopiaBattleData,engine=window.PawtopiaBattleEngine;
  const characterArt=window.PawtopiaBattleCharacterArt;
  const foeArt=window.PawtopiaBattleFoeArt;
  const watcher=window.PawtopiaBattleWatch;
  const el=id=>document.getElementById(id);
  if(!save||!data||!engine||!el('battle-stage'))return;
  let selectedPet=0,selectedFoe=0,busy=false,soundOn=false,audio=null;
  let watchMode=false,watchPaused=false,watchLoopRunning=false,waitForResume=null,playbackSpeed=1;
  const select=el('battle-pet-select');
  const stage=el('battle-stage');
  const petSprite=el('battle-pet-sprite'),foeSprite=el('battle-foe-sprite');
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduced()?Math.min(ms,25):Math.max(0,Math.round(ms/playbackSpeed))));
  const addText=(parent,tag,text,className)=>{
    const item=document.createElement(tag);item.textContent=text;
    if(className)item.className=className;
    parent.append(item);return item;
  };
  function noise(frequency,seconds=.09) {
    if(!soundOn)return;
    try {
      const Context=window.AudioContext||window.webkitAudioContext;
      if(!Context)return;
      audio=audio||new Context();
      const osc=audio.createOscillator(),gain=audio.createGain();
      osc.type='triangle';osc.frequency.value=frequency;
      gain.gain.value=.035;
      gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+seconds);
      osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+seconds);
    } catch {}
  }
  function spriteArt(cat) {
    const kit=data.kitFor(cat?.breed);
    const art=el('battle-cat-art');
    if (characterArt && art.dataset.breed !== kit.breed) {
      characterArt.paint(art,kit.breed,'idle');
      art.dataset.breed=kit.breed;
    } else if (!characterArt) {
      art.style.backgroundImage='url("'+kit.sprite.src+'")';
      art.style.backgroundSize=kit.sprite.backgroundSize;
      art.style.backgroundPosition=kit.sprite.backgroundPosition;
    }
    art.setAttribute('aria-label',(cat?.name||'Your cat')+' · '+kit.breed+' original adoption portrait');
    petSprite.dataset.motion=kit.movement;
    petSprite.style.setProperty('--cat-skill-color',kit.theme.color);
    el('battle-cat-tag').textContent=kit.breed;
    return kit;
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
    const pet=cats[selectedPet],foe=data.foes[selectedFoe];
    const currentView=view&&view.cat===pet?view:null;
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
    select.disabled=busy||Boolean(fighting)||!cats.length;
    const stats=pet?engine.profile(pet):null;
    el('battle-pet-detail').textContent=pet
      ?pet.breed+' · Strength '+engine.training(pet).strength+' · Defence '+engine.training(pet).defence+
        ' · Movement '+engine.training(pet).movement+' · Endurance '+engine.training(pet).endurance+
        ' · Intelligence '+engine.training(pet).intelligence
      :'Visit Companion Cottage to adopt one of 56 cats.';
    el('battle-xp').max=stats?stats.nextXp:18;
    el('battle-xp').value=stats?stats.xp:0;
    el('battle-xp-text').textContent=stats?(stats.level>=200?'Maximum level':stats.xp+' / '+stats.nextXp+' XP'):'0 / 18 XP';
    el('battle-record').textContent=stats?stats.wins+' wins · '+stats.losses+' losses · Highest rank '+stats.bestRank:'No battles yet';
    el('battle-trophies').textContent=stats&&stats.trophies.length?stats.trophies.join(' · '):'No trophies yet. Defeat ranked opponents to earn them.';
    el('next-challenge').textContent='Unlocked: rank '+engine.unlocked(progress)+' · '+data.foes[engine.unlocked(progress)-1].name;
    const choices=data.foes.map((enemy,index)=>{
      const locked=enemy.rank>engine.unlocked(progress);
      const button=document.createElement('button');button.type='button';button.className='foe-choice'+(locked?' locked':'');
      button.dataset.foe=String(index);
      button.disabled=locked||busy||Boolean(fighting)||watchMode;
      button.setAttribute('aria-pressed',String(selectedFoe===index));
      addText(button,'strong',(locked?'🔒 ':'')+enemy.glyph+' #'+enemy.rank+' '+enemy.name);
      addText(button,'small','Lv '+enemy.level+' · '+enemy.coins+' Paw Coins · '+(enemy.xp*3)+' XP');
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
    el('battle-start').textContent=currentView?.match.finished?'Start a New Battle':'Enter Arena';
    el('battle-forfeit').disabled=busy||watchMode||!fighting;
    const activeCat=currentView?currentView.cat:pet,activeFoe=currentView?currentView.foe:foe;
    const kit=spriteArt(activeCat);
    stage.style.setProperty('--foe-color',activeFoe.color);
    el('battle-foe-emblem').textContent=activeFoe.glyph;
    if(foeArt&&el('battle-foe-art')){
      foeArt.paint(el('battle-foe-art'),activeFoe,currentView?.match.finished?
        (currentView.match.result==='win'?'defeat':currentView.match.result==='loss'?'victory':'idle'):'idle');
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
      addText(button,'small',move.description);
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
        characterArt.paint(el('battle-cat-art'),activeCat.breed,result==='win'?'victory':result==='loss'?'defeat':'idle');
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
        characterArt.paint(el('battle-cat-art'),activeCat.breed,'idle');
      }
      el('battle-outcome').textContent='';
    }
    if(!fighting&&busy)el('battle-moves').querySelectorAll('button').forEach(button=>button.disabled=true);
    void kit;
  }
  function status(message) {
    if(typeof message==='string'&&message)el('battle-status').textContent=message;
  }
  function burst(evt,color) {
    const box=el('battle-vfx');
    const target=evt.target==='pet'?'30%':'70%';
    const glyph=evt.fx==='frost'?'❄':evt.fx==='leaf'?'❧':
      evt.fx==='water'?'◈':evt.fx==='gear'?'⚙':evt.fx==='wind'?'➶':
      evt.fx==='shadow'?'✧':evt.fx==='star'?'★':evt.fx==='guard'?'◈':'✦';
    const count=evt.fx==='guard'?6:evt.fx==='swipe'?8:16;
    for(let n=0;n<count;n++){
      const particle=document.createElement('span');particle.className='burst-particle';particle.textContent=glyph;
      particle.style.setProperty('--hit-x',target);particle.style.setProperty('--hit-y','65%');
      particle.style.setProperty('--effect-color',color);
      const angle=Math.PI*2*n/count;
      particle.style.setProperty('--dx',Math.round(Math.cos(angle)*(50+n%3*18))+'px');
      particle.style.setProperty('--dy',Math.round(Math.sin(angle)*(40+n%3*13))+'px');
      particle.style.setProperty('--spin',(n%2?80:-80)+'deg');
      box.append(particle);setTimeout(()=>particle.remove(),900);
    }
    if(evt.damage>0) {
      const label=document.createElement('span');label.className='damage-popup';
      label.textContent='−'+evt.damage;
      label.style.setProperty('--hit-x',target);label.style.setProperty('--hit-y','57%');
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
  async function playArtFrames(cat,state,duration){
    if(!characterArt||!cat)return;
    const frames=characterArt.animationFrames||[3];
    if(reduced()){
      characterArt.paint(el('battle-cat-art'),cat.breed,state,3);
      await wait(25);
      return;
    }
    const interval=Math.max(35,Math.floor((duration||characterArt.timingFor(cat.breed,state))/frames.length));
    for(const frame of frames){
      characterArt.paint(el('battle-cat-art'),cat.breed,state,frame);
      await wait(interval);
    }
  }
  async function playFoeFrames(foe,state,duration=440){
    if(!foeArt||!foe||!el('battle-foe-art'))return;
    const frames=reduced()?[3]:foeArt.frameIds;
    for(const frame of frames){
      foeArt.paint(el('battle-foe-art'),foe,state,frame);
      await wait(reduced()?25:Math.max(35,Math.floor(duration/frames.length)));
    }
  }
  async function showEvents(events,cat){
    const kit=data.kitFor(cat?.breed);
    const currentFoe=engine.matchInfo(save.read())?.foe || data.foes[selectedFoe];
    const pose=state=>{if(characterArt&&cat)characterArt.paint(el('battle-cat-art'),cat.breed,state);};
    const foePose=state=>{if(foeArt&&currentFoe)foeArt.paint(el('battle-foe-art'),currentFoe,state);};
    for(const evt of events){
      if(evt.who==='system'){
        if(evt.fx==='victory'){petSprite.classList.add('state-victory');await Promise.all([playArtFrames(cat,'victory',360),playFoeFrames(currentFoe,'defeat',360)]);pose('victory');foePose('defeat');}
        if(evt.fx==='defeat'){petSprite.classList.add('state-defeat');await Promise.all([playArtFrames(cat,'defeat',360),playFoeFrames(currentFoe,'victory',360)]);pose('defeat');foePose('victory');}
        noise(evt.fx==='victory'?620:180,.22);
        await wait(450);continue;
      }
      const actor=evt.who==='pet'?petSprite:foeSprite;
      const defender=evt.who==='pet'?foeSprite:petSprite;
      const guard=evt.fx==='guard';
      const cast=!guard&&!['swipe','impact'].includes(evt.fx);
      const effect=guard?'state-guard':cast?'state-cast':'state-approach';
      let motion=Promise.resolve();
      let hitMotion=Promise.resolve();
      let foeMotion=Promise.resolve();
      if(evt.who==='pet'){
        const action=guard?'guard':cast?(evt.name.includes('Finale')?'ultimate':'signature'):'approach';
        motion=playArtFrames(cat,action,guard?490:cast?characterArt?.timingFor(cat.breed,action):240);
      }else{
        foeMotion=playFoeFrames(currentFoe,guard?'guard':'approach',guard?380:240);
      }
      actor.classList.remove('state-approach','state-swipe','state-cast','state-guard');
      void actor.offsetWidth;actor.classList.add(effect);
      if(!guard&&!cast){
        await wait(245);
        await Promise.all([motion,foeMotion]);
        actor.classList.remove(effect);
        actor.classList.add('state-swipe');
        if(evt.who==='pet')motion=playArtFrames(cat,'swipe',characterArt?.timingFor(cat.breed,'swipe'));
        else foeMotion=playFoeFrames(currentFoe,'swipe',470);
      }
      await wait(cast?340:guard?230:190);
      if(!guard){
        defender.classList.add('state-impact');
        if(evt.who==='foe')hitMotion=playArtFrames(cat,'impact',310);
        else hitMotion=playFoeFrames(currentFoe,'impact',320);
        burst(evt,evt.who==='pet'?kit.theme.color:stage.style.getPropertyValue('--foe-color'));
        noise(evt.who==='pet'?520:210,.10);
      }else{burst(evt,'#84e4d8');noise(380,.08);}
      barAfter(evt);
      await wait(cast?440:350);
      await Promise.all([motion,foeMotion,hitMotion]);
      actor.classList.remove(effect,'state-swipe');
      defender.classList.remove('state-impact');
      pose('idle');
      foePose('idle');
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
      if(result)status(result.message);
    }catch{status('The battle could not be started safely.');}
    finally{busy=false;render();}
  });
  el('battle-forfeit').addEventListener('click',async()=>{
    if(busy)return;busy=true;
    try{const result=await saveAction(progress=>engine.forfeit(progress));if(result)status(result.message);}
    catch{status('Could not finish this match safely.');}
    finally{busy=false;render();}
  });
  el('battle-moves').addEventListener('click',async event=>{
    const button=event.target.closest('button[data-move]');
    if(!button||button.disabled||busy)return;
    busy=true;
    const progress=save.read(),view=engine.matchInfo(progress);
    const cat=view?.cat;
    el('battle-moves').querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
      const result=await saveAction(progress=>engine.takeTurn(progress,button.dataset.move));
      if(result){
        await showEvents(result.events||[],cat);
        status(result.message);
      }
    }catch{status('This round could not be completed safely.');}
    finally{busy=false;render();}
  });
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
      idle:'',approach:'state-approach',swipe:'state-swipe',
      guard:'state-guard',signature:'state-cast',ultimate:'state-cast',
      impact:'state-impact',victory:'state-victory',defeat:'state-defeat'
    }[pose];
    try{
      previewBox.querySelectorAll('button').forEach(item=>item.disabled=true);
      petSprite.classList.remove('state-approach','state-swipe','state-cast','state-guard','state-impact','state-victory','state-defeat');
      if(actionClass)petSprite.classList.add(actionClass);
      status(cat.name+' performs '+pose+'. Art preview only — no battle move or reward used.');
      await playArtFrames(cat,pose,characterArt.timingFor(cat.breed,pose));
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
    soundOn=!soundOn;
    el('battle-sound').setAttribute('aria-pressed',String(soundOn));
    el('battle-sound').textContent='Sound: '+(soundOn?'On':'Off');
    if(soundOn)noise(470,.08);
  });
  window.addEventListener('pageshow',()=>{if(!busy)render();});
  window.addEventListener('storage',()=>{if(!busy)render();});
  render();
})();
