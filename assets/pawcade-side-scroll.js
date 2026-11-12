(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const scenery = 'assets/scenes/platform-levels.webp';
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
  const [name, hero, opening, ending, coursePower, terrain] = courses[index];
  const [reference, movement, enemyPattern, prologue, epilogue] = window.pawtopiaStyles[index];
  const [runSpeed, handling, jumpSpeed, cadence, , goalType] = window.pawtopiaVariants[index];
  const chapters = window.pawtopiaChapters[index];
  const special = {buster:'throw',roll:'dash',float:'bubble',beat:'pulse',airlift:'vine',
    airdash:'dash',pogo:'stomp',blaster:'throw',shooter:'throw',whip:'pulse',momentum:'dash'};
  const power = special[movement] || (movement in {stomp:1,swim:1,glide:1,flip:1,grapple:1,throw:1} ? movement : coursePower);
  const descriptions = {
    stomp:'Bounce off enemies', slide:'Hold Action to slide under low shelves', swim:'Steer in four directions to swim',
    dash:'Press Action to dash', vine:'Press Action to climb into a high route', glide:'Hold Jump to glide',
    throw:'Press Action to throw a crystal', flip:'Press Action to reverse gravity',
    pulse:'Press Action to release a shockwave', grapple:'Press Action to pull toward overhead rails',
    double:'Jump again in midair', shield:'Hold Action to deflect hazards',
    photo:'Press Action to stun enemies with a flash', bubble:'Hold Action to float'
  };
  const movementGuide = {
    buster:'Fire your arm cannon with Action.', roll:'Roll through enemies with Action.',
    float:'Hold Action to float.', beat:'You run automatically. Jump over the beat barriers and use Action to pulse.',
    airdash:'Press Action to dash forward or upward while airborne.',
    pogo:'Hold Jump while stomping to bounce higher.',
    precision:'Jump from ledge edges to clear wider gaps.',
    whip:'Press Action to strike nearby enemies with your whip.',
    momentum:'Hold a direction to build speed. Press Action to burst forward.'
  };
  const ctx = canvas.getContext('2d');
  const backdrop = new Image();
  backdrop.src = scenery;
  const sprites = new Image();
  sprites.src = 'assets/scenes/platform-sprites.webp';
  const enemyArt = new Image();
  enemyArt.src = 'assets/scenes/platform-enemies.webp';
  const heroArt = new Image();
  heroArt.src = 'assets/scenes/platform-heroes.webp';
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
  const finale = ['guardian','sprint','switch','crystals','summit'][goalType];
  const exitX = finish+720;
  const ground = 326;
  const checkpoint = x => Math.floor(x / sectionSize) * sectionSize;
  const status = message => { byId('side-status').textContent = message; };
  const powerButton = document.querySelector('[data-control="action"]');
  powerButton.hidden = power === 'stomp' || power === 'double' || power === 'swim' || power === 'glide';
  byId('side-player').hidden = false;
  if (power==='swim') byId('touch-stick').setAttribute('aria-label','Drag in four directions to swim');
  byId('side-title').textContent = hero + ' · ' + name;
  byId('side-rules').textContent = (movementGuide[movement] || descriptions[power] + '.') + ' ' + prologue;
  const platforms = [];
  const enemies = [];
  const crystals = [];
  let player, boss, phase, camera, frame, last, clock, chapter, taken, attacks, hazards, escape;
  const plan = window.pawtopiaRoomPlans[index].split(' ');
  for (const [stage, room] of plan.entries()) {
    const start = stage * sectionSize;
    const pieces = window.pawtopiaRooms[room];
    for (const [slot, [x, y, w, kind = 'floor']] of pieces.entries()) {
      platforms.push({x:start+x,y,w,kind});
      if (['hazard','rail','ceiling'].includes(kind)) continue;
      if (x>150 || w>850) {
        const count = Math.max(1, Math.floor(w / (room==='arena' ? 420 : 540)));
        for(let encounter=0;encounter<count;encounter++) {
          const offset = Math.round(w*(encounter+1)/(count+1));
          enemies.push({x:start+x+offset,y:y-23,offset:slot+stage+encounter});
        }
      }
      if(x>0) crystals.push({x:start+x+w*.58,y:y-35});
    }
    if (room==='rhythm') {
      for (let beat=0;beat<4;beat++) crystals.push({x:start+375+beat*415,y:225});
    }
  }
  platforms.push({x:finish,y:ground,w:850,kind:'floor'});
  const returnFloor={x:0,y:ground,w:finish,kind:'floor'};
  if (finale === 'summit') {
    for (let i=0;i<4;i++) platforms.push({x:finish+310+i*110,y:ground-38-i*31,w:119,kind:'lift'});
  }
  if (finale === 'crystals') {
    for(let i=0;i<3;i++) crystals.push({x:finish+140+i*160,y:ground-24});
  }
  const resetPlayer = (x = 100) => ({
    x,y:ground-22,vx:0,vy:0,facing:1,on:false,jumps:0,gravity:1,health:3,grace:0,power:0
  });
  function reset() {
    player = resetPlayer();
    boss = {x:finish+465,y:ground-41,health:finale==='guardian'?5:0,grace:0};
    enemies.forEach(e => {e.dead = false;e.shotAt=0;});
    crystals.forEach(c => {c.taken = false;});
    camera = chapter = taken = clock = 0;
    escape = null;
    attacks = [];
    hazards = [];
    phase = 'ready';
    status(opening + '. Gameplay reference: ' + reference + '.');
    hud();
    draw();
  }
  function hud() {
    byId('side-progress').textContent = 'Stage ' + Math.min(sections,chapter+1) + ' / ' + sections + ' · ' + chapters[chapter] + ' · Hearts ' + player.health + ' · Crystals ' + taken;
  }
  function jump() {
    if (phase !== 'playing') return;
    if (power==='flip') return;
    if (player.on || power === 'swim' || (power === 'double' && player.jumps < 2)) {
      player.vy = -jumpSpeed * player.gravity;
      player.on = false;
      player.jumps++;
    }
  }
  function action() {
    if (phase !== 'playing' || player.power > 0 || (movement==='airdash' && player.on)) return;
    player.power = movement==='buster' || movement==='shooter' ? .24 : .48;
    if (power === 'dash') {
      player.vx = player.facing * (movement==='roll'?460:660);
      if (movement==='airdash' && !player.on && held('jump')) player.vy=-420;
    }
    if (power === 'flip' && player.on) {player.gravity *= -1; player.on = false;}
    if (power === 'vine') player.vy = -590;
    if (power === 'grapple') {
      const anchor = platforms.find(ledge => ledge.kind==='rail' && Math.abs(ledge.x+ledge.w/2-player.x)<230);
      if (anchor) {
        player.vy=-610;
        player.vx=Math.sign(anchor.x+anchor.w/2-player.x)*400;
        player.grapple=.35;
      }
    }
    if (power === 'throw' || power === 'pulse' || power === 'photo') {
      const onBeat = clock % .65 < .2 || clock % .65 > .52;
      const speed = movement==='whip' ? 240 : power==='throw' ? 700 : 400;
      const life = movement==='whip' ? .24 : movement==='beat' && onBeat ? .72 : power==='throw' ? .8 : .36;
      attacks.push({x:player.x,y:player.y,v:player.facing*speed,life});
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
    player = resetPlayer(escape ? finish+635 : chapter * sectionSize + 100);
    if (escape) escape=95;
    player.grace = 1.1;
    attacks = [];
    hazards = [];
    status('Back at the stage checkpoint.');
    hud();
  }
  const close = (a,b,x,y) => Math.abs(a.x-b.x)<x && Math.abs(a.y-b.y)<y;
  function step(dt) {
    clock += dt;
    if (escape) {
      escape-=dt;
      if (escape<=0) {respawn();return;}
      if (player.x<115) {phase='won';status(ending+'!');return;}
      if (Math.floor(escape)!==Math.floor(escape+dt)) status('Escape back to the entrance · '+Math.ceil(escape)+'s');
    }
    const p = player;
    p.grace = Math.max(0,p.grace-dt);
    p.power = Math.max(0,p.power-dt);
    const steer = movement==='beat' ? 1 : Number(held('right')) - Number(held('left'));
    const vertical = Number(held('down'))-Number(held('up') || held('jump'));
    if (steer) p.facing = steer;
    const topSpeed = runSpeed;
    const acceleration = steer ? handling : Math.max(1.6,handling*.8);
    p.grapple=Math.max(0,(p.grapple||0)-dt);
    if (!(power === 'dash' && p.power > .22) && !p.grapple) p.vx += (steer * topSpeed - p.vx) * Math.min(1,dt*acceleration);
    p.x = Math.max(30,Math.min(finish+770,p.x+p.vx*dt));
    const oldY = p.y;
    const body = power === 'slide' && held('action') ? 12 : 22;

    const floating = (power === 'glide' && held('jump')) || (power === 'bubble' && held('action'));
    if (power==='swim') p.vy += (vertical*230-p.vy)*Math.min(1,dt*5);
    else if (power==='bubble' && held('action')) p.vy += (-160-p.vy)*Math.min(1,dt*5);
    else if (floating && p.vy>0) p.vy=Math.min(72,p.vy+dt*90);
    else p.vy+=dt*(movement==='precision'?1210:1050)*p.gravity;
    p.y += p.vy*dt;
    p.on = false;
    if ((p.gravity < 0 || power==='swim') && p.y < 48) {p.y=48;p.vy=0;p.on=true;p.jumps=0;}
    for (const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if (p.x < ledge.x-8 || p.x > ledge.x+ledge.w+8) continue;
      if (ledge.kind==='hazard') {
        if (p.y+body>ledge.y && p.y-body<ground) hit();
        continue;
      }
      if (ledge.kind==='rail') continue;
      if (ledge.kind==='ceiling') {
        if (p.gravity<0 && p.vy<=0 && oldY-body>=ledge.y && p.y-body<=ledge.y) {
          p.y=ledge.y+body;p.vy=0;p.on=true;
        }
        continue;
      }
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
      status(({guardian:'Defeat the guardian, then reach the exit.',switch:'Reach the marker and press Jump or Action.',crystals:'Collect three crystals, then reach the exit.',sprint:'Cross the finish at full speed.',summit:'Climb the ledges to reach the exit.'})[finale]);
    }
    if (stage > chapter) {
      chapter=stage;
      status(chapters[stage] + ' · ' + (stage===sections-1 ? ending : 'Checkpoint reached.'));
      hud();
    }
    for (const c of crystals) {
      if (!c.taken && close(p,c,24,29)) {c.taken=true;taken++;hud();}
    }
    for (const attack of attacks) {attack.x+=attack.v*dt;attack.life-=dt;}
    attacks = attacks.filter(a => a.life>0);
    for (const shot of hazards) {shot.x+=shot.v*dt;shot.life-=dt;if(close(p,shot,18,22)){shot.life=0;hit();}}
    hazards = hazards.filter(shot=>shot.life>0);
    for (const foe of enemies) {
      if (foe.dead || Math.abs(foe.x-p.x)>360) continue;
      if (enemyPattern==='turret' && clock>=foe.shotAt) {
        hazards.push({x:foe.x,y:foe.y,v:Math.sign(p.x-foe.x)*180,life:2});
        foe.shotAt=clock+cadence;
      }
      const position = foePosition(foe);
      if (attacks.some(a => close(a,position,28,28))) foe.dead=true;
      if (!foe.dead && close(p,position,29,34)) {
        if ((p.vy>65 && oldY<position.y-17) || (power==='dash' && p.power>.22)) {
          foe.dead=true;p.vy=movement==='pogo' && held('jump') ? -560 : -320;
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
        finale === 'crystals' ? taken>=3 :
        finale === 'summit' ? p.y<230 : true
      );
      if (p.x>exitX-20 && exitReady) {
        if (index===20 && escape===null) {
          escape=95;
          status('Reset triggered. Race back to the entrance!');
        } else if (index!==20) {phase='won';status(ending+'!');}
      }
    }
    camera = Math.max(0,Math.min(finish+70,p.x-238));
  }
  function foePosition(foe) {
    const t = clock * (2 / cadence) + foe.offset;
    const chase = Math.sign(player.x-foe.x);
    const wave = Math.sin(t*2.1);
    switch (enemyPattern) {
      case 'turret': return {x:foe.x,y:foe.y};
      case 'charge': return {x:foe.x+chase*Math.max(0,wave)*96,y:foe.y};
      case 'hopper': return {x:foe.x+wave*24,y:foe.y-Math.max(0,Math.sin(t*3.5))*63};
      case 'swoop': return {x:foe.x+wave*78,y:foe.y-50-Math.cos(t*2.1)*42};
      case 'school': return {x:foe.x+wave*55,y:foe.y-33-Math.sin(t*3)*27};
      case 'pursuit': return {x:foe.x+chase*(32+wave*36),y:foe.y-12};
      case 'rhythm': return {x:foe.x+Math.round(wave)*34,y:foe.y-Math.max(0,wave)*30};
      default: return {x:foe.x+wave*34,y:foe.y};
    }
  }
  function atlasSprite(image,columns,cell,x,y,w,h,reverse=false,rows=columns) {
    if (!image.naturalWidth) return false;
    const sw = image.naturalWidth/columns;
    const sh = image.naturalHeight/rows;
    ctx.save();
    ctx.translate(x,y);
    if (reverse) ctx.scale(-1,1);
    ctx.drawImage(image,cell%columns*sw,Math.floor(cell/columns)*sh,sw,sh,-w/2,-h/2,w,h);
    ctx.restore();
    return true;
  }
  const sprite = (...args) => atlasSprite(sprites,4,...args);
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
    const ledgeColors={rail:'#d6b87f',ceiling:'#7258a8',hazard:'#e64562',floor:'#25364a',shelf:'#71648d',spring:'#579578',belt:'#a56b4b',current:'#387d9b',lift:'#547d9c'};
    for (const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if (ledge.x+ledge.w<camera || ledge.x>camera+width) continue;
      const gradient=ctx.createLinearGradient(0,ledge.y,0,ledge.y+54);
      gradient.addColorStop(0,ledgeColors[ledge.kind]);gradient.addColorStop(1,'#0c1220');
      ctx.fillStyle=gradient;
      ctx.fillRect(ledge.x,ledge.y,ledge.w,ledge.kind==='hazard'?43:ledge.kind==='floor'?65:18);
      ctx.fillStyle='#ffffff73';
      ctx.fillRect(ledge.x,ledge.y,ledge.w,3);
    }
    for (const c of crystals) if (!c.taken && c.x>=camera && c.x<camera+width) {
      if(!sprite(15,c.x,c.y,38,38)){ctx.fillStyle='#ffd967';ctx.fillRect(c.x-5,c.y-5,10,10);}
    }
    for (const foe of enemies) if(!foe.dead && foe.x>=camera-80 && foe.x<camera+width+80) {
      const at=foePosition(foe);
      const cell = index;
      if(!atlasSprite(enemyArt,5,cell,at.x,at.y,73,73)){ctx.fillStyle='#bd664e';ctx.fillRect(at.x-18,at.y-17,36,34);}
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
    for(const shot of hazards) {
      ctx.fillStyle='#ff8479';ctx.beginPath();ctx.arc(shot.x,shot.y,7,0,Math.PI*2);ctx.fill();
    }
    const p=player;
    const light=['Luna','Ivy','Frost','Melody','Spark'].includes(hero);
    const pose=!p.on?3:Math.abs(p.vx)>15?1+Math.floor(clock*10)%2:0;
    const cell = power==='slide' && held('action') ? 13 :
      light && !p.on && (power==='double' || power==='vine') ? 14 : (light?4:0)+pose;
    ctx.globalAlpha=p.grace && Math.floor(clock*12)%2?.55:1;
    const roster = ['Bolt','Ivy','Frost','Melody','Stone','Spark','Shadow'];
    const rosterIndex = roster.indexOf(hero);
    const companionDrawn = rosterIndex>=0 && atlasSprite(heroArt,8,rosterIndex*4+pose,p.x,p.y-12,81,81,p.facing<0,4);
    if(!companionDrawn && !sprite(cell,p.x,p.y-12,81,81,p.facing<0) && poster.naturalWidth) {
      const sw=poster.naturalWidth/2;
      ctx.drawImage(poster,light?sw:0,0,sw,poster.naturalHeight,p.x-24,p.y-35,48,57);
    }
    ctx.restore();
    if (phase==='won') {
      ctx.fillStyle='#100c27c9';ctx.fillRect(0,0,width,height);
      ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 27px system-ui';
      ctx.fillText(ending,width/2,155,740);
      ctx.font='18px system-ui';ctx.fillText(epilogue,width/2,195,740);
      ctx.fillText(taken+' crystals collected',width/2,232);
      return;
    }
    if (phase!=='playing') {
      ctx.fillStyle='#100c27c9';ctx.fillRect(0,0,width,height);
      ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 32px system-ui';
      ctx.fillText(name,width/2,165);
      ctx.font='18px system-ui';ctx.fillText(opening,width/2,206);
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
  const codes={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:power==='swim'?'up':'jump',KeyW:power==='swim'?'up':'jump',ArrowDown:'down',KeyS:'down',Space:'jump',KeyX:'action'};
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
    for (const axis of ['left','right','up','down']) mobile.delete(axis);
    if(direction) mobile.add(direction);
  },{horizontal:power!=='swim'});
  document.querySelectorAll('[data-control]').forEach(button=>{
    const control=button.dataset.control;
    const activate=()=>{if(control==='jump')jump();else action();};
    button.onpointerdown=event=>{
      event.preventDefault();button.setPointerCapture(event.pointerId);mobile.add(control);activate();
    };
    for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>mobile.delete(control));
    button.onclick=event=>{if(event.detail===0)activate();};
  });
  for (const image of [sprites,poster,backdrop,enemyArt,heroArt]) image.onload=()=>{if(phase!=='playing') draw();};
  reset();
})();
