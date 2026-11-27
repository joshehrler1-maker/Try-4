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
    for(const button of moves){
      const move=button.dataset.rush;
      button.disabled=!state.live || (move==='burst'&&state.energy<35) ||
        (move==='strike'&&state.energy<8) || (move==='dodge'&&clock<state.evadeReady);
    }
  }
  function end(won){
    state.live=false;charging=false;field.dataset.warning='';
    pose('pet',won?'victory':'defeat',650,won?'victory':'defeat');
    pose('foe',won?'defeat':'victory',650,won?'defeat':'victory');
    message(won?'Victory!':'Defeat · Try another round');
    start.textContent='Fight again';refresh();
  }
  function act(move,side=1){
    if(!state?.live || state.paused)return;
    if(move==='dodge'){
      if(clock<state.evadeReady)return;
      state.safeUntil=clock+.62;state.evadeReady=clock+1.65;
      pose('pet',side<0?'slipLeft':'slipRight',620);
      message('Sidestep');refresh();return;
    }
    const burst=move==='burst',cost=burst?35:8;
    if(clock<state.ready || state.energy<cost)return;
    state.combo=clock-state.previous<1.35&&!burst?Math.min(3,state.combo+1):1;
    state.previous=clock;state.ready=clock+(burst?.72:.38);state.energy-=cost;
    pose('pet',burst?'signature':state.combo===3?'charge':'swipe',burst?680:380);
    state.hitAt=clock+(burst?.32:.17);state.damage=burst?22:6+state.combo*2;
    message(burst?cat.fightingStyle.form:state.combo+' hit combo');refresh();
  }
  function tick(time){
    if(!state.live||state.paused)return;
    const dt=Math.min(.08,(time-last)/1000);last=time;clock+=dt;
    state.energy=Math.min(100,state.energy+dt*(charging?30:7));
    if(state.hitAt && clock>=state.hitAt){
      state.hitAt=0;state.enemy=Math.max(0,state.enemy-state.damage);
      pose('foe','impact',240);scene?.hit('foe',cat.color,state.damage>15);
      if(!state.enemy){end(true);return;}
    }
    if(clock>=state.next-.72&&!state.warning){
      state.warning=true;field.dataset.warning='on';message('Incoming · swipe or tap Dodge');pose('foe','guard',520);
    }
    if(clock>=state.next){
      pose('foe','charge',470);
      if(clock<=state.safeUntil)message('Evaded!');
      else {state.hp=Math.max(0,state.hp-12);state.combo=0;pose('pet','impact',300);scene?.hit('pet','#ffbc73',false);message('Hit · −12 HP');}
      state.next=clock+1.9+Math.random()*.9;state.warning=false;field.dataset.warning='';
      if(!state.hp){end(false);return;}
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
    else if(elapsed<280&&Math.abs(dy)<24)act('strike');
  };
  field.onpointercancel=()=>{charging=false;origin=null;};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state?.live&&!state.paused)pause();});
})();