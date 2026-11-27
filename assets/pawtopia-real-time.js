(() => {
  'use strict';
  const get=id=>document.getElementById(id);
  const field=get('rush-field'), start=get('rush-start'), status=get('rush-status');
  const art=window.PawtopiaBattleCharacterArt, dogs=window.PawtopiaBattleFoeArt;
  const data=window.PawtopiaBattleData;
  let scene,cat,foe,state,clock=0,loop=0,last=0,charging=false,origin=null;
  const moves=Array.from(document.querySelectorAll('[data-rush]'));
  function pose(side,name,duration,end='idle'){
    if(scene?.active())scene.pose(side,name,duration,end);
    else if(side==='pet')art.paintFighter(get('rush-cat'),cat.breed,name,3);
    else dogs.paint(get('rush-dog'),foe,name,3);
  }
  function message(value){if(status.textContent!==value)status.textContent=value;}
  function refresh(){
    get('rush-life').value=state.hp;
    get('rush-enemy-life').value=state.enemy;
    get('rush-energy').value=state.energy;
    get('rush-range').textContent=range();
    get('rush-evade').value=clamp(1-(state.evadeReady-clock)/1.65,0,1);
    get('rush-meter').value=state.meter;
    get('rush-swap').textContent=state.reserve[0]?'Tag '+state.reserve[0].cat.breed:'Tag ally';
    for(const button of moves){
      const move=button.dataset.rush;
      if(move==='burst')button.textContent=state.meter>=100?'Finisher':'Signature';
      button.disabled=!state.live || (move==='swap'&&(!state.reserve.length||clock<state.swapReady)) || (move==='burst'&&state.energy<35&&state.meter<100) || (move==='dodge'&&clock<state.evadeReady);
    }
  }
  function end(won){
    state.live=false;charging=false;field.dataset.warning='';
    pose('pet',won?'victory':'defeat',650,won?'victory':'defeat');
    pose('foe',won?'defeat':'victory',650,won?'defeat':'victory');
    message(won?'Victory!':'Defeat · Try another round');
    start.textContent='Fight again';refresh();
  }
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function range(){
    return state.gap<1.65?'Close':state.gap<2.65?'Mid':'Far';
  }
  function shift(amount){
    state.targetGap=clamp(state.gap+amount,1.15,3.8);
  }
  function effect(kind){
    const node=document.createElement('i');node.className='rush-fx rush-'+kind;
    node.style.setProperty('--tint',cat.color);field.append(node);setTimeout(()=>node.remove(),550);
  }
  function swap(){
    if(!state.reserve.length||clock<state.swapReady)return;
    const ally=state.reserve.shift();
    state.reserve.push({cat,hp:state.hp});cat=ally.cat;state.hp=ally.hp;
    state.swapReady=clock+8;state.safeUntil=clock+.8;state.pending=null;state.combo=0;
    scene?.roster(cat,dogs.profile(foe),data.kitFor(cat.breed),{efficient:true});
    get('rush-pet-name').textContent=cat.breed;pose('pet','guard',480);message(cat.breed+' covers!');
  }
  function act(move,side=1){
    if(!state?.live||state.paused)return;
    if(state.clash){
      if(move==='strike'){
        const good=Math.abs(clock-state.clash)<.25;
        state.clash=0;state.next=clock+1.8;
        if(good){state.enemy=Math.max(0,state.enemy-15);state.meter=Math.min(100,state.meter+25);pose('foe','impact',350);}
        else state.hp=Math.max(0,state.hp-7);
        message(good?'Clash won!':'Clash lost');
        if(!state.enemy||!state.hp)end(!state.enemy);
      }
      return;
    }
    if(move==='advance'||move==='retreat'){shift(move==='advance'?-1.15:1.15);return;}
    if(move==='swap'){swap();return;}
    if(move==='dodge'){
      if(clock<state.evadeReady)return;
      state.safeUntil=clock+.78;state.evadeReady=clock+1.65;
      pose('pet',side<0?'slipLeft':'slipRight',620);message('Sidestep');return;
    }
    const ultimate=move==='burst'&&state.meter>=100;
    const burst=move==='burst',cost=ultimate?0:burst?35:0;
    if(clock<state.ready||state.energy<cost||state.pending)return;
    if(ultimate)state.meter=0;
    const band=range(),form=cat.fightingStyle;
    const counter=clock<state.counterUntil;state.counterUntil=0;
    if(burst&&form.footwork==='root'&&!ultimate){state.safeUntil=clock+.85;}
    const projectile=(!burst&&band==='Far')||(burst&&['coil','sway'].includes(form.footwork));
    const pounce=!projectile&&(band==='Mid'||(burst&&form.footwork==='kick'));
    if(pounce)shift(-1.35);
    if(ultimate)state.targetGap=1.15;
    state.energy-=cost;
    state.combo=!burst&&band==='Close'&&clock-state.previous<1.2?state.combo%3+1:1;
    state.previous=clock;
    const finisher=state.combo===3;
    const delay=ultimate?.46:projectile?.33:pounce?.32:.17;
    state.ready=clock+delay+(finisher||burst?.4:.16);
    state.pending={at:clock+delay,reach:projectile?4:1.82,damage:ultimate?35:burst?16+Math.round(form.amplitude*.45):projectile?5:finisher?13:8,
      knock:ultimate||finisher||(burst&&form.footwork==='kick'),counter,pounce};
    pose('pet',ultimate?'ultimate':burst||projectile?'signature':pounce||finisher?'charge':'swipe',(delay+.25)*1000);
    if(projectile||ultimate||burst)effect(ultimate?'finish':projectile?'shot':'arc');
    message(ultimate?'Team finisher':burst?form.form:projectile?'Ranged shot':pounce?'Pounce':counter?'Counter':state.combo+' hit combo');
  }
  function tick(time){
    if(!state.live||state.paused)return;
    const dt=Math.min(.08,(time-last)/1000);last=time;clock+=dt;
    state.gap+=(state.targetGap-state.gap)*(1-Math.exp(-dt*9));
    scene?.spacing?.(state.gap);
    field.style.setProperty('--spread',Math.round((state.gap-2)*14)+'px');
    state.energy=Math.min(100,state.energy+dt*(charging?30:7));
    if(state.clash){
      if(clock>state.clash+.3){state.clash=0;state.hp=Math.max(0,state.hp-7);message('Clash lost');if(!state.hp){end(false);return;}}
      else if(clock>=state.clash-.2)message('Clash · tap Strike now!');
    }else{
      const hit=state.pending;
      if(hit&&clock>=hit.at){
        state.pending=null;
        if(state.warning&&hit.pounce&&state.next-clock<.38&&state.gap<=hit.reach){
          state.clash=clock+.45;state.next=clock+2.3;state.warning=false;field.dataset.warning='';message('Clash · get ready');
        }else if(state.gap<=hit.reach){
          state.enemy=Math.max(0,state.enemy-hit.damage-(hit.counter?6:0));
          state.meter=Math.min(100,state.meter+(hit.counter?24:10));
          pose('foe','impact',300);scene?.hit('foe',cat.color,hit.knock);
          if(hit.knock){shift(1.45);state.combo=0;}
          if(state.warning){state.warning=false;field.dataset.warning='';state.next=clock+1.05;}
          if(!state.enemy){end(true);return;}
        }else{state.combo=0;message('Out of reach');}
      }
      if(!state.clash&&clock>=state.next-.72&&!state.warning){
        state.warning=true;field.dataset.warning='on';state.turn++;
        const pattern=state.heavy?'heavy':(state.turn+state.foeIndex)%3===0?'shot':(state.turn+state.foeIndex)%3===1?'feint':'pounce';
        state.enemyReach=pattern==='shot'?4:pattern==='heavy'?1.8:2.15;
        state.targetGap=pattern==='shot'?3.1:pattern==='feint'?1.9:1.35;
        const tell={heavy:'Heavy charge',shot:'Ranged shot',feint:'Feint',pounce:'Quick pounce'};
        message(tell[pattern]+' · dodge');
        pose('foe',pattern==='shot'?'signature':pattern==='feint'?'slipLeft':'approach',690);
      }
      if(!state.clash&&clock>=state.next){
        pose('foe','charge',450);
        if(clock<=state.safeUntil||state.gap>state.enemyReach){state.counterUntil=clock+.95;message('Missed you · counter!');state.meter=Math.min(100,state.meter+12);}
        else{state.hp=Math.max(0,state.hp-state.foeDamage);state.combo=0;state.pending=null;state.ready=clock+.28;
          pose('pet','impact',300);scene?.hit('pet','#ffbc73',state.heavy);message('Hit · −'+state.foeDamage+' HP');}
        state.next=clock+state.cadence+Math.random()*.55;state.warning=false;field.dataset.warning='';
        if(!state.hp){end(false);return;}
      }
    }
    refresh();loop=requestAnimationFrame(tick);
  }
  function pause(){
    cancelAnimationFrame(loop);state.paused=true;charging=false;origin=null;
    start.textContent='Resume';message('Paused');moves.forEach(b=>b.disabled=true);
  }
  start.onclick=()=>{
    if(state?.live){
      if(!state.paused){pause();return;}
      state.paused=false;start.textContent='Pause';message(state.warning?'Incoming · Dodge':'Fight');last=performance.now();loop=requestAnimationFrame(tick);return;
    }
    const breed=get('battle-cat-tag').textContent;
    cat=art.getArt(breed);
    const selected=document.querySelector('#battle-foe-list [aria-pressed="true"]');
    foe=data.foes[Number(selected?.dataset.foe)||0];
    if(scene===undefined)scene=window.PawtopiaBattle3D?.create(get('rush-canvas'),field,{chase:true})||null;
    field.dataset.painted=String(!scene?.active());
    scene?.roster(cat,dogs.profile(foe),data.kitFor(cat.breed),{efficient:true});
    pose('pet','idle',1);pose('foe','idle',1);
    get('rush-pet-name').textContent=cat.breed;get('rush-foe-name').textContent=foe.name;
    state={live:true,hp:100,enemy:100,energy:70,combo:0,previous:-5,ready:0,safeUntil:-1,evadeReady:0,next:2.4};
    const choices=Array.from(get('battle-pet-select').options);
    const reserve=choices.filter(o=>!o.selected).slice(0,2).map(o=>{
      const breed=data.breeds.find(b=>o.textContent.split(' · ').includes(b));
      return breed?{cat:art.getArt(breed),hp:100}:null;
    }).filter(Boolean);
    // A solo owner can also practice a cover with a guest training partner.
    if(!reserve.length)reserve.push({cat:art.getArt(cat.breed==='Bengal'?'Siamese':'Bengal'),hp:100});
    const index=data.foes.indexOf(foe);
    Object.assign(state,{reserve,swapReady:0,gap:2.25,targetGap:2.25,meter:0,clash:0,counterUntil:0,
      turn:0,foeIndex:index,enemyReach:2.15,heavy:foe.rank>=6,foeDamage:8+foe.rank+(index%3),cadence:1.45+foe.rank*.09+(index%4)*.1});
    clock=0;last=performance.now();start.textContent='Pause';message('Fight');refresh();loop=requestAnimationFrame(tick);
  };
  for(const b of moves)b.onclick=()=>act(b.dataset.rush);
  field.onpointerdown=e=>{
    if(!state?.live||state.paused)return;
    origin={x:e.clientX,y:e.clientY,time:performance.now()};field.setPointerCapture(e.pointerId);charging=true;
  };
  field.onpointerup=e=>{
    charging=false;if(!origin)return;
    const dx=e.clientX-origin.x,dy=e.clientY-origin.y,elapsed=performance.now()-origin.time;origin=null;
    if(Math.abs(dx)>28&&Math.abs(dx)>Math.abs(dy))act('dodge',Math.sign(dx));
    else if(Math.abs(dy)>28)act(dy<0?'advance':'retreat');
    else if(elapsed<280&&Math.abs(dy)<24)act('strike');
  };
  field.onpointercancel=()=>{charging=false;origin=null;};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state?.live&&!state.paused)pause();});
})();