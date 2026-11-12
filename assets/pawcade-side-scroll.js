(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const games = [
    ['Whisker’s Forge Leap','Jump over molten vents. Clear six vents.','▲','#ff9066', (s,t) => s.y > 58],
    ['Luna’s Library Slide','Hold ↓ under the moving shelves. Slide under six.','▰','#bca8ff', s => s.down && s.y < 16],
    ['Coral Courier','Hold ↑ to swim upward and ↓ to dive. Match six delivery depths.','✉','#66f5dc', (s,t) => Math.abs(s.y-t.height)<38, 'swim'],
    ['Bolt’s Clocktower Relay','Press Action as each clock hand passes the gold line. Hit six timing windows.','◷','#ffcb70', (s,t) => t.hit, 'timing'],
    ['Ivy’s Seed Garden','Press Action to plant seeds in the passing soil beds while grounded. Plant six.','❀','#97eb81', (s,t) => t.hit, 'ground'],
    ['Frost’s Waterfall Climb','Hold ↑ to glide beside the upper ledges, then release for the lower ones. Reach six ledges.','❄','#a8ecff', (s,t) => Math.abs(s.y-t.height)<48, 'glide'],
    ['Lantern Festival Juggle','Press Action to toss your lantern. It must still be in the air at each arch.','◇','#ffb38e', s => s.lantern>30,'juggle'],
    ['Crystal Mine Polarity','Action switches crystal polarity. Match the colour of six passing crystals.','◆','#d9a6ff', (s,t) => s.polarity===t.index%2,'polarity'],
    ['Melody’s Stage Beat','Each marker is a beat: ↑, ↓, or Action. Press the displayed input inside the timing ring.','♫','#ff9ed3', (s,t) => t.hit,'beat'],
    ['Stone’s Quarry Crane','Hold Action to lift the crate; release to lower it. Deliver six crates at the marked heights.','■','#e7bc83', (s,t) => Math.abs(s.y-t.height)<37,'crane'],
    ['Sunset Wind Sail','Press Action to switch sail direction. Hold ↑ or ↓ to change altitude. Match wind and lane.','➤','#ffd27b', (s,t) => s.polarity===t.index%2 && Math.abs(s.y-t.height)<52,'sail'],
    ['Cloud City Double Jump','Tap ↑ twice before landing. Reach six high cloud gates.','☁','#b2ffe1', s => s.y>114,'double'],
    ['Thunder Harbor Shield','Press Action to raise a brief shield against lightning. Block six strikes.','ϟ','#a9c8ff', s => s.shield>0,'shield'],
    ['Autumn Trail Photographer','Frame the birds at their height with ↑ or ↓, then press Action near each bird to take its photo.','✧','#ffb479', (s,t) => t.hit,'photo'],
    ['Observatory Gravity Flip','Action flips gravity. Alternate ceiling and floor to reach the marked star gates.','★','#c6b0ff', (s,t) => Math.abs(s.y-t.height)<50,'gravity'],
    ['Bamboo Village Lantern Count','Count the small lanterns on each sign. Press Action when the count is odd.','▦','#a4eda8', (s,t) => t.hit === Boolean(t.count%2),'count'],
    ['Steamworks Valve Rush','Tap Action repeatedly before a valve reaches you. Each valve needs the displayed number of turns.','⚙','#ff9e9d', (s,t) => t.taps>=t.count,'valve'],
    ['Snow Village Warmth Run','Collect warm mugs on the ground. Jump over ice patches. Finish with warmth remaining.','☕','#d9cbff', (s,t) => t.index%2 ? s.y>50 : s.y<22,'warmth'],
    ['Canyon Bridge Balance','Hold ↑ or ↓ to move the balance marker toward the wind arrow. Stay inside the safe band at each checkpoint.','↔','#ffbb84', (s,t) => Math.abs(s.y-t.height)<35,'balance'],
    ['Submarine Dock Sonar','Press Action once to reveal each gate’s depth, then steer through its opening.','◎','#7cf4df', (s,t) => t.revealed && Math.abs(s.y-t.height)<45,'sonar'],
    ['Neon Arcade Dash','Action starts a brief dash. Time it to pass through six neon barriers.','»','#ff8bde', s => s.dash>0,'dash'],
    ['Marble Temple Switches','Jump into the upper switch or crouch at the lower switch, then press Action to open the gate.','⊞','#fff1c5', (s,t) => t.hit,'switch'],
    ['Swamp Bubble Ferry','Hold Action to inflate a bubble and float. Release it to sink beneath low branches. Alternate heights.','◉','#a5d482', (s,t) => Math.abs(s.y-t.height)<44,'bubble'],
    ['Sunflower Field Pollinator','Collect pollen from a tall flower, then carry it to the next low bloom. Repeat three deliveries.','✿','#ffe577', (s,t) => t.index%2 ? s.pollen && s.y<30 : s.y>52,'pollen'],
    ['Starship Cargo Orbit','Press Action to reverse the orbiting cargo. Align it with each dock as you pass.','✦','#8dcbff', (s,t) => Math.abs(90+Math.sin(s.orbit)*70-t.height)<40,'orbit']
  ].map(([name,rules,icon,color,check,mode='jump'],id)=>({name,rules,icon,color,check,mode,id}));
  const player=byId('side-player');
  const canvas=byId('side-canvas');
  const atlasUrl='assets/scenes/side-scroll-worlds.webp';
  function artStyle(element,id) {
    element.style.backgroundImage='url('+atlasUrl+')';
    element.style.backgroundPosition=(id%5*25)+'% '+(Math.floor(id/5)*25)+'%';
  }
  const catalog=byId('side-catalog');
  const inRoom=!player;
  catalog.replaceChildren(...games.map(game=>{
    const link=document.createElement('a');
    link.className='side-card';
    link.href='pawcade-side-scroll.html?game='+game.id;
    const art=document.createElement('div');
    art.className='side-card-art';
    artStyle(art,game.id);
    const title=document.createElement('span');
    title.textContent=game.name;
    link.append(art,title);
    return link;
  }));
  if(inRoom)return;
  const key=new URLSearchParams(location.search).get('game');
  if(key===null || !/^\d+$/.test(key) || !games[Number(key)])return;
  const game=games[Number(key)];
  const ctx=canvas.getContext('2d');
  const art=new Image();
  art.src=atlasUrl;
  const active=new Set();
  const floor=302;
  const heroX=145;
  const goal=6;
  let state, raf, last;
  const targets=Array.from({length:goal},(_,index)=>({
    index,x:470+index*390,height:index%2 ? 35 : 136,count:2+index%3,hit:false,taps:0,revealed:false
  }));
  function reset() {
    state={distance:0,y:0,vy:0,jumps:0,shield:0,dash:0,lantern:0,orbit:0,orbitDirection:1,
      polarity:0,gravity:-1,pollen:false,warmth:3,cleared:0,misses:0,running:false};
    targets.forEach(target=>{target.hit=false;target.taps=0;target.revealed=false;});
    active.clear();
    hud();
  }
  function hud() {
    byId('side-progress').textContent=state.cleared+' / '+goal+' cleared · '+state.misses+' missed';
  }
  function nextTarget() {return targets[state.cleared+state.misses];}
  function input(control) {
    if(!state.running || active.has(control))return;
    active.add(control);
    const t=nextTarget();
    const distance=t ? t.x-state.distance-heroX : Infinity;
    const near=distance>=-8 && distance<85;
    const mode=game.mode;
    if(control==='up' && !['swim','glide','crane','sail','photo','gravity','balance','sonar','bubble'].includes(mode)) {
      const limit=mode==='double'?2:1;
      if(state.jumps<limit){state.vy=mode==='double'?420:370;state.jumps++;}
    }
    if(control==='action') {
      if(mode==='juggle')state.lantern=115;
      if(mode==='polarity'||mode==='sail')state.polarity^=1;
      if(mode==='shield')state.shield=.72;
      if(mode==='gravity')state.gravity*=-1;
      if(mode==='sonar' && t)t.revealed=true;
      if(mode==='dash')state.dash=.6;
      if(mode==='orbit')state.orbitDirection*=-1;
      if(mode==='valve' && near)t.taps++;
      if(mode==='timing' && near && distance<45)t.hit=true;
      if(mode==='ground' && near && state.y<16)t.hit=true;
      if(mode==='photo' && near && Math.abs(state.y-t.height)<40)t.hit=true;
      if(mode==='count' && near)t.hit=true;
      if(mode==='switch' && near && (t.index%2 ? state.down : state.y>50))t.hit=true;
    }
    if(mode==='beat' && near && distance<55 && control===['up','down','action'][t.index%3])t.hit=true;
  }
  function advance(dt) {
    const s=state;
    s.down=active.has('down');
    const up=active.has('up'), action=active.has('action');
    const mode=game.mode;
    const clamp=value=>Math.min(170,Math.max(0,value));
    if(['swim','sail','photo','balance','sonar'].includes(mode)) {
      s.y=clamp(s.y+((up?1:0)-(s.down?1:0))*190*dt);
    } else if(['crane','bubble','glide'].includes(mode)) {
      const lift=mode==='glide'?up:action;
      s.y=clamp(s.y+(lift?215:-140)*dt);
    } else if(mode==='gravity') {
      s.y=clamp(s.y+s.gravity*240*dt);
    } else {
      s.vy-=1050*dt;
      s.y=Math.max(0,s.y+s.vy*dt);
      if(!s.y){s.vy=0;s.jumps=0;}
    }
    s.shield=Math.max(0,s.shield-dt);
    s.dash=Math.max(0,s.dash-dt);
    s.lantern=Math.max(0,s.lantern-120*dt);
    s.orbit+=dt*3*s.orbitDirection;
    s.distance+=(mode==='dash' && s.dash ? 265 : 155)*dt;
    const t=nextTarget();
    if(t && t.x-s.distance<=heroX) {
      const success=game.check(s,t);
      if(success)s.cleared++;
      else s.misses++;
      if(mode==='pollen')s.pollen=success && t.index%2===0;
      if(mode==='warmth')s.warmth+=success?(t.index%2?0:1):-1;
      byId('side-status').textContent=success?'Checkpoint cleared!':'Checkpoint missed.';
      hud();
    }
    if(!nextTarget()) {
      s.running=false;
      byId('side-status').textContent=(mode==='warmth' && s.warmth<=0?'You ran out of warmth.':s.cleared===goal?'Perfect run!':'Run complete.')+' '+s.cleared+' of '+goal+' cleared.';
      if(mode==='warmth')byId('side-status').textContent+=' Warmth remaining: '+Math.max(0,s.warmth)+'.';
    }
  }
  function draw() {
    const s=state;
    ctx.fillStyle='#211332';
    ctx.fillRect(0,0,800,380);
    if(art.complete && art.naturalWidth) {
      const size=art.naturalWidth/5;
      const offset=(s.distance*.25)%800;
      for(const x of [-offset,800-offset])ctx.drawImage(art,game.id%5*size,Math.floor(game.id/5)*size,size,size,x,0,800,380);
    }
    const shade=ctx.createLinearGradient(0,0,0,380);
    shade.addColorStop(0,'#14102222');shade.addColorStop(1,'#130c25c9');
    ctx.fillStyle=shade;ctx.fillRect(0,0,800,380);
    ctx.strokeStyle=game.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,floor+4);ctx.lineTo(800,floor+4);ctx.stroke();
    for(const t of targets.slice(s.cleared+s.misses)) {
      const x=t.x-s.distance;
      if(x>825)break;
      const altitude=['swim','glide','crane','sail','photo','gravity','balance','sonar','bubble','orbit'].includes(game.mode);
      const y=floor-(altitude?t.height:game.mode==='jump' && game.id===1?40:29);
      ctx.fillStyle=game.mode==='polarity'||game.mode==='sail'?(t.index%2?'#59e6ed':'#ffac74'):game.color;
      ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=14;
      ctx.font='bold 32px system-ui';ctx.textAlign='center';
      const label=game.mode==='beat'?['↑','↓','A'][t.index%3]:game.mode==='valve'?String(t.count):game.mode==='count'?'•'.repeat(t.count):game.mode==='sonar'&&!t.revealed?'?':game.icon;
      ctx.fillText(label,x,game.mode==='sonar'&&!t.revealed?floor-30:y);
      ctx.shadowBlur=0;
      if(game.mode==='warmth')ctx.fillText(t.index%2?'❄':'☕',x,y);
      if(game.mode==='switch')ctx.fillText(t.index%2?'↓':'↑',x,y-34);
      if(game.mode==='valve' && t.taps){ctx.font='bold 14px system-ui';ctx.fillText(t.taps+'/'+t.count,x,y+18);}
      if(x-heroX<85 && x>=heroX){ctx.strokeStyle=game.color;ctx.strokeRect(x-24,y-31,48,39);}
    }
    const y=floor-s.y-(s.down?10:24);
    ctx.save();ctx.translate(heroX,y);
    if(s.shield>0 || s.dash>0){ctx.strokeStyle=game.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,30,0,Math.PI*2);ctx.stroke();}
    ctx.fillStyle=s.polarity?'#59e6ed':game.color;
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;
    ctx.beginPath();ctx.moveTo(-18,-3);ctx.lineTo(-17,-23);ctx.lineTo(-5,-13);ctx.lineTo(5,-13);ctx.lineTo(17,-23);ctx.lineTo(18,-3);ctx.quadraticCurveTo(19,16,0,16);ctx.quadraticCurveTo(-19,16,-18,-3);ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle='#241638';ctx.fillRect(-10,-4,6,5);ctx.fillRect(4,-4,6,5);ctx.fillRect(-2,4,4,3);ctx.restore();
    if(game.mode==='juggle' && s.lantern>0){ctx.fillStyle='#ffdf7c';ctx.fillText('◇',heroX,floor-35-s.lantern);}
    if(game.mode==='orbit'){ctx.fillStyle=game.color;ctx.fillText('✦',heroX+Math.cos(s.orbit)*25,floor-90-Math.sin(s.orbit)*70);}
  }
  function frame(now) {
    const dt=Math.min(.05,(now-last)/1000);
    last=now;
    advance(dt);draw();
    if(state.running)raf=requestAnimationFrame(frame);
  }
  byId('side-title').textContent=game.name;
  byId('side-rules').textContent=game.rules;
  player.hidden=false;
  reset();draw();
  art.addEventListener('load',()=>{if(!state.running)draw();});
  byId('side-start').addEventListener('click',()=>{
    cancelAnimationFrame(raf);
    reset();state.running=true;last=performance.now();
    byId('side-status').textContent='Run started.';
    byId('side-start').textContent='Restart';
    canvas.focus({preventScroll:true});
    raf=requestAnimationFrame(frame);
  });
  const keys={ArrowUp:'up',ArrowDown:'down',Space:'action'};
  addEventListener('keydown',event=>{
    if(state.running && keys[event.code] && !event.target.closest('button,a,input,select')){event.preventDefault();input(keys[event.code]);}
  });
  addEventListener('keyup',event=>active.delete(keys[event.code]));
  addEventListener('blur',()=>active.clear());
  document.querySelectorAll('[data-control]').forEach(button=>{
    const control=button.dataset.control;
    button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);input(control);});
    for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>active.delete(control));
    button.addEventListener('click',event=>{if(event.detail===0){input(control);active.delete(control);}});
  });
})();
