/* Free Battle Art Gallery for all 56 canon adopted-cat breeds.
   All interactions are in-memory previews; no pet-save or network API. */
(() => {
  'use strict';
  const data=window.PawtopiaBattleData,art=window.PawtopiaBattleCharacterArt;
  const el=id=>document.getElementById(id);
  if(!data||!art||!el('gallery-fighter'))return;
  const breedSelect=el('gallery-breed'),speedSelect=el('gallery-speed');
  const fighter=el('gallery-fighter'),moves=el('gallery-moves'),roster=el('gallery-roster');
  let chosen=data.breeds[0],currentPose='idle',active=0,busy=false;
  const reduced=()=>Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const snooze=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const status=text=>{el('gallery-status').textContent=text;};
  function applyBreed(breed) {
    if(!data.breeds.includes(breed))return;
    active++;
    chosen=breed;
    currentPose='idle';
    const profile=art.getArt(chosen),kit=data.kitFor(chosen);
    art.paint(fighter,chosen,'idle',3);
    fighter.setAttribute('aria-label','Animated '+chosen+' battle fighter');
    breedSelect.value=chosen;
    el('gallery-name').textContent=chosen;
    el('gallery-skill').textContent='Signature: '+kit.signature;
    el('gallery-ultimate').textContent='Ultimate: '+kit.ultimate;
    el('gallery-markings').textContent='Style: '+profile.fightingStyle.label+
      ' · '+profile.fightingStyle.technique+' technique · '+profile.fightingStyle.lead+'-paw lead'+
      ' · '+profile.pattern+' coat';
    for(const button of roster.querySelectorAll('button[data-breed]'))
      button.setAttribute('aria-pressed',String(button.dataset.breed===chosen));
    for(const button of moves.querySelectorAll('button[data-pose]'))
      button.setAttribute('aria-pressed',String(button.dataset.pose==='idle'));
    status(chosen+' uses '+profile.fightingStyle.label+'. Choose a move to watch its own fighting style.');
  }
  async function play(pose) {
    if(!art.poseKeys.includes(pose))return;
    const token=++active,breed=chosen;
    currentPose=pose;busy=true;
    for(const button of moves.querySelectorAll('button[data-pose]'))
      button.setAttribute('aria-pressed',String(button.dataset.pose===pose));
    status(breed+' · '+(pose==='signature'?data.kitFor(breed).signature:pose==='ultimate'?data.kitFor(breed).ultimate:pose)+' animation');
    const frames=reduced()?[3]:Array.from(art.flowFrames||art.smoothFrames||art.animationFrames);
    const multiplier=speedSelect.value==='1.7'?1.7:1;
    const duration=art.timingFor(breed,pose)*multiplier;
    try{
      if(pose==='idle'){
        // CSS breathing/ear/tail loops stay mounted rather than restarting
        // with every frame, so an idle cat visibly settles and stays alive.
        art.paint(fighter,breed,'idle',3);
        await snooze(reduced()?25:Math.max(1350,duration));
      }else for(const frame of frames) {
        if(token!==active)return;
        if(pose==='recover')art.paint(fighter,breed,pose,frame,'signature');
        else art.paint(fighter,breed,pose,frame);
        await snooze(reduced()?25:Math.max(18,Math.round(duration/frames.length)));
      }
      if(token===active) {
        await snooze(reduced()?25:260);
        if(token===active){
          art.paint(fighter,breed,'idle',3);
          for(const button of moves.querySelectorAll('button[data-pose]'))
            button.setAttribute('aria-pressed',String(button.dataset.pose==='idle'));
        }
      }
    }finally{if(token===active)busy=false;}
  }
  const options=data.breeds.map(breed=>{
    const option=document.createElement('option');
    option.value=breed;option.textContent=breed;
    return option;
  });
  breedSelect.replaceChildren(...options);
  const cards=data.kits.map(kit=>{
    const button=document.createElement('button');
    button.type='button';button.dataset.breed=kit.breed;button.setAttribute('aria-pressed','false');
    const img=document.createElement('span');
    img.className='roster-preview';img.setAttribute('aria-hidden','true');
    img.style.backgroundImage='url("'+kit.sprite.src+'")';
    img.style.backgroundSize=kit.sprite.backgroundSize;
    img.style.backgroundPosition=kit.sprite.backgroundPosition;
    const name=document.createElement('span');name.textContent=kit.breed;
    button.append(img,name);
    return button;
  });
  roster.replaceChildren(...cards);
  el('gallery-count').textContent=String(data.breeds.length)+' unique breed illustrations and signature attacks';
  breedSelect.addEventListener('change',()=>applyBreed(breedSelect.value));
  roster.addEventListener('click',event=>{
    const button=event.target.closest('button[data-breed]');
    if(!button)return;
    applyBreed(button.dataset.breed);
    el('gallery-title').scrollIntoView?.({behavior:reduced()?'auto':'smooth',block:'start'});
  });
  moves.addEventListener('click',event=>{
    const button=event.target.closest('button[data-pose]');
    if(!button)return;
    play(button.dataset.pose);
  });
  window.addEventListener('pageshow',()=>{if(!busy)applyBreed(chosen);});
  applyBreed(chosen);
})();