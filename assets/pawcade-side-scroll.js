(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const scenery = 'assets/scenes/side-scroll-worlds.webp';
  const courses = window.pawtopiaCourses;
  const catalog = byId('side-catalog');
  if (!catalog) return;
  catalog.replaceChildren(...courses.map(([name], index) => {
    const link = document.createElement('a');
    link.className = 'side-card';
    link.href = 'pawcade-side-scroll.html?game=' + index;
    const art = document.createElement('div');
    art.className = 'side-card-art';
    art.style.backgroundImage = 'url(' + scenery + ')';
    art.style.backgroundPosition = (index % 5 * 25) + '% ' + (Math.floor(index / 5) * 25) + '%';
    const title = document.createElement('span');
    title.textContent = name;
    link.append(art, title);
    return link;
  }));

  const canvas = byId('side-canvas');
  if (!canvas) return;
  const selection = new URLSearchParams(location.search).get('game');
  if (selection === null || !/^\d+$/.test(selection) || !courses[Number(selection)]) return;
  const index = Number(selection);
  const [name, hero, opening, ending, power, terrain, enemy] = courses[index];
  const descriptions = {
    stomp:'Bounce off enemies', slide:'Hold Action to slide under low shelves', swim:'Hold Jump to swim upward',
    dash:'Press Action to dash', vine:'Press Action to climb into a high route', glide:'Hold Jump to glide',
    throw:'Press Action to throw a crystal', flip:'Press Action to reverse gravity',
    pulse:'Press Action to release a shockwave', grapple:'Press Action to pull toward overhead rails',
    double:'Jump again in midair', shield:'Hold Action to deflect hazards',
    photo:'Press Action to stun enemies with a flash', bubble:'Hold Action to float'
  };
  const ctx = canvas.getContext('2d');
  const backdrop = new Image();
  backdrop.src = scenery;
  const sprites = new Image();
  sprites.src = 'assets/scenes/platform-sprites.webp';
  const poster = new Image();
  poster.src = 'assets/whisker-luna-master.webp';
  const mobile = new Set();
  const keys = new Set();
  const held = key => mobile.has(key) || keys.has(key);
  const width = 800;
  const height = 380;
  const sections = 6;
  const sectionSize = 2200;
  const finish = sections * sectionSize;
  const finale = ['guardian','switch','sprint','guardian','summit'][index%5];
  const exitX = finish+720;
  const ground = 326;
  const checkpoint = x => Math.floor(x / sectionSize) * sectionSize;
  const status = message => { byId('side-status').textContent = message; };
  const powerButton = document.querySelector('[data-control="action"]');
  powerButton.hidden = power === 'stomp' || power === 'double' || power === 'swim' || power === 'glide';
  byId('side-player').hidden = false;
  byId('side-title').textContent = hero + ' · ' + name;
  byId('side-rules').textContent = descriptions[power] + '. Reach the end of all six stages.';
  const platforms = [];
  const enemies = [];
  const crystals = [];
  let player, boss, phase, camera, frame, last, clock, chapter, taken, attacks;
  for (let stage = 0; stage < sections; stage++) {
    const start = stage * sectionSize;
    platforms.push({x:start,y:ground,w:350,kind:'floor'});
    for (let chunk = 0; chunk < 5; chunk++) {
      const layout = (index * 7 + stage * 3 + chunk * (index + 1)) % 11;
      const x = start + 350 + chunk * 350;
      const gap = 46 + (layout * 7 + stage * 4) % 67;
      platforms.push({x:x+gap,y:ground,w:350-gap,kind:'floor'});
      platforms.push({x:x+gap+20,y:ground-55-layout%4*16,w:74+layout*5,kind:terrain});
      crystals.push({x:x+gap+53,y:ground-92-layout%4*16});
      enemies.push({x:x+gap+133,y:ground-23,type:enemy,offset:layout});
    }
    platforms.push({x:start+2100,y:ground,w:100,kind:'floor'});
  }
  platforms.push({x:finish,y:ground,w:850,kind:'floor'});
  if (finale === 'summit') {
    for (let i=0;i<4;i++) platforms.push({x:finish+310+i*110,y:ground-38-i*31,w:119,kind:'shelf'});
  }
  const resetPlayer = (x = 100) => ({
    x,y:ground-22,vx:0,vy:0,facing:1,on:false,jumps:0,gravity:1,health:3,grace:0,power:0
  });
  function reset() {
    player = resetPlayer();
    boss = {x:finish+465,y:ground-41,health:finale==='guardian'?5:0,grace:0};
    enemies.forEach(e => {e.dead = false;});
    crystals.forEach(c => {c.taken = false;});
    camera = chapter = taken = clock = 0;
    attacks = [];
    phase = 'ready';
    status(opening + '.');
    hud();
    draw();
  }
  function hud() {
    byId('side-progress').textContent = 'Stage ' + Math.min(sections,chapter+1) + ' / ' + sections + ' · Hearts ' + player.health + ' · Crystals ' + taken;
  }
  function jump() {
    if (phase !== 'playing') return;
    if (player.on || power === 'swim' || (power === 'double' && player.jumps < 2)) {
      player.vy = -500 * player.gravity;
      player.on = false;
      player.jumps++;
    }
  }
  function action() {
    if (phase !== 'playing' || player.power > 0) return;
    player.power = .48;
    if (power === 'dash') player.vx = player.facing * 660;
    if (power === 'flip') {player.gravity *= -1; player.on = false;}
    if (power === 'vine' || power === 'grapple') player.vy = -590;
    if (power === 'throw' || power === 'pulse' || power === 'photo') {
      attacks.push({x:player.x,y:player.y,v:player.facing*(power==='throw'?700:400),life:power==='throw'?.8:.36});
    }
  }
  function hit() {
    if (player.grace > 0 || (power === 'shield' && held('action'))) return;
    player.health--;
    player.grace = 1.25;
    if (player.health <= 0) respawn();
    hud();
  }
  function respawn() {
    player = resetPlayer(chapter * sectionSize + 100);
    player.grace = 1.1;
    attacks = [];
    status('Back at the stage checkpoint.');
    hud();
  }
  const close = (a,b,x,y) => Math.abs(a.x-b.x)<x && Math.abs(a.y-b.y)<y;
  function step(dt) {
    clock += dt;
    const p = player;
    p.grace = Math.max(0,p.grace-dt);
    p.power = Math.max(0,p.power-dt);
    const steer = Number(held('right')) - Number(held('left'));
    if (steer) p.facing = steer;
    const topSpeed = power === 'dash' ? 390 : 245;
    if (!(power === 'dash' && p.power > .22)) p.vx += (steer * topSpeed - p.vx) * Math.min(1,dt*10);
    p.x = Math.max(30,Math.min(finish+770,p.x+p.vx*dt));
    const oldY = p.y;
    const body = power === 'slide' && held('action') ? 12 : 22;
    if (power === 'swim' && held('jump')) p.vy = Math.max(-225,p.vy-dt*1850);
    const floating = (power === 'glide' && held('jump')) || (power === 'bubble' && held('action'));
    p.vy = floating ? Math.min(p.vy,65) + dt*90 : p.vy+dt*1050*p.gravity;
    p.y += p.vy*dt;
    p.on = false;
    if (p.gravity < 0 && p.y < 48) {p.y=48;p.vy=0;p.on=true;p.jumps=0;}
    for (const ledge of platforms) {
      if (p.x < ledge.x-8 || p.x > ledge.x+ledge.w+8) continue;
      if (ledge.kind === 'shelf' && p.y+body > ledge.y+20 && p.y-body < ledge.y+20 && p.vy < 0) {
        p.y=ledge.y+20+body;p.vy=0;
      }
      if (p.vy >= 0 && oldY+body <= ledge.y && p.y+body >= ledge.y) {
        p.y = ledge.y-body;p.vy = 0;p.on = true;p.jumps = 0;
        if (ledge.kind === 'spring') p.vy = -565;
        if (ledge.kind === 'belt') p.x += 75*dt;
        if (ledge.kind === 'current') p.x -= 65*dt;
        if (ledge.kind === 'lift' && held('jump')) p.vy = -560;
      }
    }
    if (p.y > height+65) {respawn();return;}
    const stage = Math.min(sections-1,Math.floor(checkpoint(p.x)/sectionSize));
    if (oldY <= height && p.x>=finish && p.x-p.vx*dt<finish) {
      status(({guardian:'Defeat the guardian, then reach the exit.',switch:'Reach the marker and press Jump or Action.',sprint:'Cross the finish at full speed.',summit:'Climb the ledges to reach the exit.'})[finale]);
    }
    if (stage > chapter) {chapter=stage;status('Checkpoint reached.');hud();}
    for (const c of crystals) {
      if (!c.taken && close(p,c,24,29)) {c.taken=true;taken++;hud();}
    }
    for (const attack of attacks) {attack.x+=attack.v*dt;attack.life-=dt;}
    attacks = attacks.filter(a => a.life>0);
    for (const foe of enemies) {
      if (foe.dead || Math.abs(foe.x-p.x)>180) continue;
      const position = foePosition(foe);
      if (attacks.some(a => close(a,position,28,28))) foe.dead=true;
      if (!foe.dead && close(p,position,29,34)) {
        if ((p.vy>65 && oldY<position.y-17) || (power==='dash' && p.power>.22)) {
          foe.dead=true;p.vy=-320;
        } else hit();
      }
    }
    if (p.x > finish) {
      boss.grace = Math.max(0,boss.grace-dt);
      boss.x = finish+465+Math.sin(clock*(1.25+index%4*.25))*138;
      boss.y = ground-41-Math.max(0,Math.sin(clock*2.3))* (24+index%5*11);
      if (boss.health > 0 && !boss.grace && (attacks.some(a=>close(a,boss,49,42)) ||
          (close(p,boss,47,52) && ((p.vy>70 && oldY<boss.y-18) || (power==='dash' && p.power>.22))))) {
        boss.health--;boss.grace=.65;p.vy=-375;
        status(boss.health ? 'Guardian · '+boss.health+' hits left.' : 'Guardian cleared. Reach the exit.');
      } else if (boss.health>0 && close(p,boss,44,42)) hit();
      const exitReady = !boss.health && (
        finale === 'switch' ? held('action') || held('jump') :
        finale === 'sprint' ? Math.abs(p.vx)>185 :
        finale === 'summit' ? p.y<230 : true
      );
      if (p.x>exitX-20 && exitReady) {phase='won';status(ending+'!');}
    }
    camera = Math.max(0,Math.min(finish+70,p.x-238));
  }
  function foePosition(foe) {
    const t = clock + foe.offset;
    return {x:foe.x+Math.sin(t*1.6)*(foe.type==='vent'?0:34),y:foe.y-(foe.type==='drone'||foe.type==='eel'?24+Math.sin(t*3)*21:0)};
  }
  function sprite(cell,x,y,w,h,reverse=false) {
    if (!sprites.naturalWidth) return false;
    const size = sprites.naturalWidth/4;
    ctx.save();
    ctx.translate(x,y);
    if (reverse) ctx.scale(-1,1);
    ctx.drawImage(sprites,cell%4*size,Math.floor(cell/4)*size,size,size,-w/2,-h/2,w,h);
    ctx.restore();
    return true;
  }
  function draw() {
    ctx.fillStyle='#211332';
    ctx.fillRect(0,0,width,height);
    if (backdrop.naturalWidth) {
      const tile=backdrop.naturalWidth/5;
      const offset=(camera*.27)%width;
      for(const x of [-offset,width-offset])ctx.drawImage(backdrop,index%5*tile,Math.floor(index/5)*tile,tile,tile,x,0,width,height);
    }
    ctx.save();
    ctx.translate(-camera,0);
    const ledgeColors={floor:'#25364a',shelf:'#71648d',spring:'#579578',belt:'#a56b4b',current:'#387d9b',lift:'#547d9c'};
    for (const ledge of platforms) {
      if (ledge.x+ledge.w<camera || ledge.x>camera+width) continue;
      const gradient=ctx.createLinearGradient(0,ledge.y,0,ledge.y+54);
      gradient.addColorStop(0,ledgeColors[ledge.kind]);gradient.addColorStop(1,'#0c1220');
      ctx.fillStyle=gradient;
      ctx.fillRect(ledge.x,ledge.y,ledge.w,ledge.kind==='floor'?65:18);
      ctx.fillStyle='#ffffff73';
      ctx.fillRect(ledge.x,ledge.y,ledge.w,3);
    }
    for (const c of crystals) if (!c.taken && c.x>=camera && c.x<camera+width) {
      if(!sprite(15,c.x,c.y,38,38)){ctx.fillStyle='#ffd967';ctx.fillRect(c.x-5,c.y-5,10,10);}
    }
    for (const foe of enemies) if(!foe.dead && foe.x>=camera-80 && foe.x<camera+width+80) {
      const at=foePosition(foe);
      const cell=({sentry:8,drone:9,beetle:10,vent:11,eel:9})[foe.type];
      if(!sprite(cell,at.x,at.y,66,66,true)){ctx.fillStyle='#bd664e';ctx.fillRect(at.x-18,at.y-17,36,34);}
    }
    if (boss.health && camera+width>finish) {
      if(!sprite(12,boss.x,boss.y,116,116,true)){ctx.fillStyle='#ad505c';ctx.fillRect(boss.x-34,boss.y-38,68,76);}
      ctx.fillStyle='#f77c8b';ctx.fillRect(boss.x-36,boss.y-54,boss.health*14,5);
    }
    ctx.fillStyle=boss.health?'#78487c':'#e0bd64';
    const markerY = finale==='summit' ? ground-225 : ground-104;
    ctx.fillRect(exitX,markerY,11,104);
    ctx.fillRect(exitX+11,markerY,45,25);
    for (const a of attacks) {
      ctx.fillStyle='#ffe9a9';ctx.beginPath();ctx.arc(a.x,a.y,9,0,Math.PI*2);ctx.fill();
    }
    const p=player;
    const light=['Luna','Ivy','Frost','Melody','Spark'].includes(hero);
    const pose=!p.on?3:Math.abs(p.vx)>15?1+Math.floor(clock*10)%2:0;
    const cell = power==='slide' && held('action') ? 13 :
      light && !p.on && (power==='double' || power==='vine') ? 14 : (light?4:0)+pose;
    ctx.globalAlpha=p.grace && Math.floor(clock*12)%2?.55:1;
    if(!sprite(cell,p.x,p.y-12,81,81,p.facing<0) && poster.naturalWidth) {
      const sw=poster.naturalWidth/2;
      ctx.drawImage(poster,light?sw:0,0,sw,poster.naturalHeight,p.x-24,p.y-35,48,57);
    }
    ctx.restore();
    if (phase!=='playing') {
      ctx.fillStyle='#100c27c9';ctx.fillRect(0,0,width,height);
      ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 32px system-ui';
      ctx.fillText(phase==='won'?ending:name,width/2,165);
      ctx.font='18px system-ui';ctx.fillText(phase==='won'?'Adventure complete · '+taken+' crystals':opening,width/2,206);
    }
  }
  function loop(now) {
    step(Math.min(.025,(now-last)/1000));
    last=now;
    draw();
    if(phase==='playing') frame=requestAnimationFrame(loop);
  }
  byId('side-start').onclick=()=>{
    cancelAnimationFrame(frame);
    reset();
    phase='playing';
    byId('side-start').textContent='Restart';
    canvas.focus({preventScroll:true});
    last=performance.now();
    frame=requestAnimationFrame(loop);
  };
  const codes={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',KeyX:'action'};
  addEventListener('keydown',event=>{
    const control=codes[event.code];
    if(!control || phase!=='playing' || event.target.closest('button,a,input,select')) return;
    event.preventDefault();
    keys.add(control);
    if(!event.repeat) {
      if(control==='jump') jump();
      if(control==='action') action();
    }
  });
  addEventListener('keyup',event=>keys.delete(codes[event.code]));
  addEventListener('blur',()=>{keys.clear();mobile.clear();});
  bindTouchJoystick(byId('touch-stick'),direction=>{
    mobile.delete('left');mobile.delete('right');
    if(direction==='left'||direction==='right') mobile.add(direction);
  },{horizontal:true});
  document.querySelectorAll('[data-control]').forEach(button=>{
    const control=button.dataset.control;
    const activate=()=>{if(control==='jump')jump();else action();};
    button.onpointerdown=event=>{
      event.preventDefault();button.setPointerCapture(event.pointerId);mobile.add(control);activate();
    };
    for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>mobile.delete(control));
    button.onclick=event=>{if(event.detail===0)activate();};
  });
  for (const image of [sprites,poster,backdrop]) image.onload=()=>{if(phase!=='playing') draw();};
  reset();
})();
