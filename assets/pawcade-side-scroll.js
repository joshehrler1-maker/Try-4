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
  const wallMoves = movement==='buster' || movement==='airdash';
  const [techniqueName, technique, strength] = window.pawtopiaTechniques[index];
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
    buster:'Tap Fire to shoot, or hold and release to charge. Jump again while sliding against a wall to kick off.', roll:'Roll through enemies with Action.',
    float:'Hold Action to float.', beat:'You run automatically. Jump over the beat barriers and use Action to pulse.',
    airdash:'Press Dash in midair. Steer up or down to aim it, and jump against walls to kick off.',
    pogo:'Hold Jump while stomping to bounce higher.',
    precision:'Jump from ledge edges to clear wider gaps.',
    whip:'Press Action to strike nearby enemies with your whip.',
    momentum:index===3?'Hold down and tap Jump to charge a spin dash. Release down to roll.':'Hold a direction to build speed. Press Action to burst forward.'
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
  const guardian = {
    0:{name:'Furnace Crab',pattern:'hop',hint:'Jump over the charge and land on its back.'},
    12:{name:'Storm Claw',pattern:'charge',hint:'Use Shovel Drop when it stops charging.'},
    16:{name:'Boiler Breaker',pattern:'volley',hint:'Fire between volleys. Parry a pink shot to bounce away.'},
    19:{name:'Dock Sentinel',pattern:'sweep',hint:'Switch weapons to cover its low and high positions.'},
    21:{name:'Moon Gargoyle',pattern:'dive',hint:'Use the whip or returning cross when it dives.'},
    24:{name:'Cargo Turret',pattern:'barrage',hint:'Jump over low shots and lob grenades from a distance.'}
  }[index];
  const exitX = finish+720;
  const ground = 326;
  const checkpoint = x => Math.floor(x / sectionSize) * sectionSize;
  const status = message => { byId('side-status').textContent = message; };
  const powerButton = document.querySelector('[data-control="action"]');
  if (index===3) powerButton.style.display='none';
  if (movement==='buster') powerButton.textContent='Fire';
  if (movement==='airdash') powerButton.textContent='Dash';
  const techniqueButton = document.querySelector('[data-control=technique]');
  if (techniqueButton) techniqueButton.textContent = techniqueName;
  if(index===2) powerButton.textContent='Charge';
  powerButton.hidden = power === 'stomp' || power === 'double' || (power === 'swim' && index!==2) || power === 'glide';
  byId('side-player').hidden = false;
  if (power==='swim') byId('touch-stick').setAttribute('aria-label','Drag in four directions to swim');
  byId('side-title').textContent = hero + ' · ' + name;
  byId('side-rules').textContent = (movementGuide[movement] || descriptions[power] + '.') + ' ' + prologue;
  const platforms = [];
  const enemies = [];
  const crystals = [];
  let player, boss, phase, camera, frame, last, clock, chapter, taken, attacks, hazards, escape;
  const saveKey='pawcade-platform-checkpoint-v1-'+index;
  const resumeButton=byId('side-resume');
  function readCheckpoint() {
    try {
      const data=JSON.parse(localStorage.getItem(saveKey));
      if (!data || !Number.isInteger(data.stage) || data.stage<1 || data.stage>=sections ||
          !Array.isArray(data.crystals) || !Array.isArray(data.enemies)) return null;
      return data;
    } catch {return null;}
  }
  function saveCheckpoint() {
    try {
      localStorage.setItem(saveKey,JSON.stringify({
        stage:chapter,
        crystals:crystals.flatMap((c,i)=>c.taken?[i]:[]),
        enemies:enemies.flatMap((e,i)=>e.dead?[i]:[])
      }));
    } catch { /* The game remains playable without storage. */ }
    resumeButton.hidden=!readCheckpoint();
  }
  const plan = window.pawtopiaRoomPlans[index].split(' ');
  const setPieces = window.pawtopiaSetPieces[index].split(' ');
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
    const feature=setPieces[stage];
    const anchor=start+1050;
    const add=(x,y,w,kind)=>platforms.push({x:anchor+x,y,w,kind});
    switch(feature) {
      case 'blocks': case 'steps': case 'eggs':
        add(30,261,85,'floor');add(170,226,105,'floor');add(325,193,95,'floor');
        break;
      case 'barrels':
        add(30,292,90,'barrel');add(270,227,150,'barrel');add(515,178,165,'floor');
        break;
      case 'pogo':
        add(30,292,90,'pogo');add(270,227,150,'pogo');add(515,178,165,'floor');
        break;
      case 'spring':
        add(30,292,90,'spring');add(270,227,150,'spring');add(515,178,165,'floor');
        break;
      case 'tower': case 'dash': case 'vines': case 'bash':
        for(let n=0;n<4;n++) add(40+n*152,277-n*37,118,n===2?'lift':'floor');
        break;
      case 'bridge': case 'yarn': case 'ring':
        add(80,252,140,'floor');add(255,230,130,'floor');add(415,250,165,'floor');
        break;
      case 'turrets': case 'dodge':
        for(let n=0;n<3;n++) enemies.push({x:anchor+105+n*215,y:ground-23,offset:stage+n,turret:true});
        break;
      case 'kelp': case 'current': case 'reef':
        add(30,192,160,'current');add(315,245,210,'current');
        crystals.push({x:anchor+230,y:105},{x:anchor+580,y:171});
        break;
      case 'ice':
        add(30,202,180,'ice');add(270,249,175,'ice');add(520,284,165,'ice');
        break;
      case 'glide': case 'float':
        add(30,202,180,'floor');add(270,249,175,'floor');add(520,284,165,'floor');
        break;
      case 'speed':
        add(10,283,390,'belt');add(400,271,230,'belt');break;
      case 'ceiling':
        add(40,105,160,'ceiling');add(295,122,190,'ceiling');break;
      case 'cable':
        add(5,123,130,'rail');add(300,101,130,'rail');add(550,124,120,'rail');break;
      case 'lifts':
        add(45,275,115,'lift');add(230,218,145,'lift');add(455,175,140,'floor');break;
      case 'crawl':
        add(65,262,185,'floor');add(310,225,175,'floor');break;
      case 'spikes': case 'traps':
        add(135,285,50,'hazard');add(450,285,70,'hazard');break;
    }
    if (index===11) {
      crystals.push({x:start+690,y:226,refill:true},{x:start+1295,y:173,refill:true});
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
  const walls = wallMoves ? plan.map((room,stage)=>({
    x:stage*sectionSize+(movement==='buster'?700:800),top:movement==='buster'?200:163
  })) : [];
  for(const wall of walls) {
    platforms.push({x:wall.x,y:wall.top,w:20,kind:'floor'});
    platforms.push({x:wall.x-225,y:wall.top+126,w:105,kind:'floor'});
    platforms.push({x:wall.x-160,y:wall.top+62,w:145,kind:'floor'});
    platforms.push({x:wall.x+24,y:wall.top+49,w:106,kind:'floor'});
  }
  const tunnels = index===14 ? plan.map((room,stage)=>({x:stage*sectionSize+480,w:130,y:ground-33})) : [];
  const resetPlayer = (x = 100) => ({
    x,y:ground-22,vx:0,vy:0,facing:1,on:false,jumps:0,gravity:1,health:3,grace:0,power:0,spin:0,dashUsed:false,chargeStart:null,jumpBuffer:0,coyote:0,jumpCut:false
  });
  function reset() {
    player = resetPlayer();
    boss = {x:finish+465,y:ground-41,health:finale==='guardian'?5:0,grace:0,time:0,nextShot:1};
    enemies.forEach(e => {e.dead = false;e.shotAt=0;});
    platforms.forEach(ledge=>{ledge.dropAt=undefined;});
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
  function jump(buffer = true) {
    if (phase !== 'playing') return;
    if (power==='flip') return;
    if (buffer) player.jumpBuffer=.11;
    if (index===3 && held('down') && player.on) {player.spin=Math.min(5,player.spin+1);player.jumpBuffer=0;return;}
    if (index===10 && player.carry && !player.on) {
      player.carry=false;player.vy=-jumpSpeed;player.jumpBuffer=0;
      player.jumpCut=true;player.jumpAge=0;
      return;
    }
    if (wallMoves && player.wall && !player.on) {
      player.jumpAge=0;
      player.vy=-jumpSpeed;
      player.vx=-player.wall*295;
      player.wallLock=.16;
      player.wall=0;
      player.jumpBuffer=0;
      player.jumpCut=true;
      return;
    }
    if (player.on || player.coyote>0 || power === 'swim' || (power === 'double' && player.jumps < 2)) {
      player.vy = -jumpSpeed * player.gravity;
      player.on = false;
      player.jumps++;
      player.coyote=0;
      player.jumpBuffer=0;
      player.jumpCut=power!=='swim';
      player.jumpAge=0;
    }
  }
  function action() {
    if (phase==='playing' && movement==='buster') {player.chargeStart ??= clock;return;}
    if (index===3) return;
    if (index===2 && phase==='playing' && player.power<=0) {
      player.vx=player.facing*530;player.grapple=.25;player.power=.4;
      player.grace=Math.max(player.grace,.25);
      return;
    }
    if (movement==='airdash' && player.dashUsed) return;
    if (phase !== 'playing' || player.power > 0 || (movement==='airdash' && player.on)) return;
    player.power = movement==='buster' || movement==='shooter' ? .24 : .48;
    if (power === 'dash') {
      player.vx = player.facing * (movement==='roll'?460:660);
      if (movement==='airdash') {
        player.dashUsed=true;
        player.vy=held('up')?-440:held('down')?440:0;
      }
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
      if(player.altWeapon) for(const vy of [-105,105]) attacks.push({x:player.x,y:player.y,v:player.facing*speed,vy,life});
    }
  }
  function releaseAction(fire) {
    if (movement!=='buster' || player.chargeStart===null || held('action')) return;
    const charged=clock-player.chargeStart>=.65;
    player.chargeStart=null;
    if (fire && phase==='playing') attacks.push({
      x:player.x,y:player.y,v:player.facing*(charged?850:680),life:.85,radius:charged?22:8,damage:charged?2:1
    });
  }
  function useTechnique() {
    if (phase!=='playing' || player.techCooldown>0) return;
    const p=player;
    p.techCooldown=.32;
    const nearby=range=>enemies.find(foe=>!foe.dead && close(p,foePosition(foe),range,65));
    const shot=extra=>attacks.push({x:p.x,y:p.y,v:p.facing*330,life:.55,...extra});
    switch(technique) {
      case 'sweep': shot({v:0,radius:strength-20,life:.13}); break;
      case 'burst':
      case 'roll': p.vx=p.facing*strength;p.grapple=.25;p.grace=Math.max(p.grace,.25);break;
      case 'reveal': p.sonar=2;break;
      case 'launch': if(p.on){p.vy=-strength;p.vx=p.facing*350;p.grapple=.26;}break;
      case 'pull':
      case 'capture': {
        if(p.carry){shot({v:p.facing*550,damage:2});p.carry=false;break;}
        const foe=nearby(strength);
        if(foe){foe.dead=true;p.carry=true;status('Enemy caught. Press '+techniqueName+' again to throw.');}
        break;
      }
      case 'flip': action();break;
      case 'retry': respawn();break;
      case 'release': if(p.grapple){p.grapple=0;p.vy-=160;}break;
      case 'climb': if(p.wall){p.vy=-strength;p.wallLock=.08;}break;
      case 'drop': if(!p.on){p.vy=strength;p.pogo=true;}break;
      case 'lob': shot({v:p.facing*strength,vy:-260,gravity:700,life:.9,radius:13,damage:2});break;
      case 'morph': {
        const nextBody=p.morphed?22:12;
        if(nextBody===22 && tunnels.some(t=>p.x>t.x-12 && p.x<t.x+t.w+12)) break;
        if(p.on) p.y+=p.morphed?-10:10;
        p.morphed=!p.morphed;
        break;
      }
      case 'bash': if(nearby(125)){p.vy=-strength;p.vx=-p.facing*strength*.7;p.grapple=.22;}break;
      case 'parry': {
        const target=hazards.find(h=>h.life>0 && close(p,h,55,55));
        if(target && !p.on){target.life=0;p.vy=-470;p.grace=.35;}
        break;
      }
      case 'grab': {
        const edge=platforms.find(l=>l.kind==='floor' && Math.min(Math.abs(l.x-p.x),Math.abs(l.x+l.w-p.x))<31 && p.y>l.y && p.y<l.y+48);
        if(edge && !p.on){p.y=edge.y-22;p.x=Math.max(edge.x+10,Math.min(p.x,edge.x+edge.w-10));p.vy=0;}
        break;
      }
      case 'swap': p.altWeapon=!p.altWeapon;status(p.altWeapon?'Spread fire equipped.':'Straight fire equipped.');break;
      case 'taunt': if(p.crystalCombo>=3){shot({v:0,radius:strength,life:.2,damage:2});p.crystalCombo=0;}break;
      case 'return': shot({v:p.facing*strength,returning:true,life:1.1,damage:2});break;
    }
  }
  function hit() {
    if (player.grace > 0 || (power === 'shield' && held('action'))) return;
    player.health--;
    player.grace = 1.25;
    if (player.health <= 0) {respawn();return true;}
    hud();
  }
  function respawn() {
    for(const ledge of platforms) if(ledge.kind==='drop') ledge.dropAt=undefined;
    player = resetPlayer(escape ? finish+635 : chapter * sectionSize + 100);
    if (escape) escape=95;
    player.grace = 1.1;
    attacks = [];
    hazards = [];
    camera=Math.max(0,Math.min(finish+70,player.x-238));
    status('Back at the stage checkpoint.');
    hud();
  }
  const close = (a,b,x,y) => Math.abs(a.x-b.x)<x && Math.abs(a.y-b.y)<y;
  function step(dt) {
    clock += dt;
    if (escape) {
      escape-=dt;
      if (escape<=0) {escape=95;respawn();return;}
      if (player.x<115) {phase='won';status(ending+'!');return;}
      if (Math.floor(escape)!==Math.floor(escape+dt)) status('Escape back to the entrance · '+Math.ceil(escape)+'s');
    }
    const p = player;
    p.coyote=p.on ? .085 : Math.max(0,p.coyote-dt);
    p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
    if (p.jumpBuffer && (p.on || p.coyote>0)) jump(false);
    p.jumpAge=(p.jumpAge||0)+dt;
    if (p.jumpCut && !held('jump') && p.jumpAge>=.035) {
      if (p.vy < -jumpSpeed*.45) p.vy=-jumpSpeed*.45;
      p.jumpCut=false;
    }
    p.techCooldown=Math.max(0,(p.techCooldown||0)-dt);
    p.sonar=Math.max(0,(p.sonar||0)-dt);
    p.grace = Math.max(0,p.grace-dt);
    p.power = Math.max(0,p.power-dt);
    const steer = movement==='beat' ? 1 : Number(held('right')) - Number(held('left'));
    const vertical = Number(held('down'))-Number(held('up') || held('jump'));
    if (steer) p.facing = steer;
    const topSpeed = runSpeed;
    const reversing = steer && Math.sign(p.vx) !== steer;
    const acceleration = p.onIce ? handling*.28 : steer
      ? handling * (p.on ? (reversing ? 1.35 : 1) : .72)
      : Math.max(1.6,handling*(p.on ? .95 : .45));
    if (index===3 && p.spin && !held('down')) {
      p.vx=p.facing*(520+p.spin*50);p.power=.65;p.spin=0;
    }
    p.wallLock=Math.max(0,(p.wallLock||0)-dt);
    const oldX=p.x;
    p.grapple=Math.max(0,(p.grapple||0)-dt);
    if (!(power === 'dash' && p.power > .22) && !p.grapple && !p.wallLock) p.vx += (steer * topSpeed - p.vx) * Math.min(1,dt*acceleration);
    p.x = Math.max(30,Math.min(finish+770,p.x+p.vx*dt));
    if(index===14 && !p.morphed) for(const t of tunnels) {
      if(p.y+22<t.y) continue;
      if(oldX<=t.x-14 && p.x>t.x-14){p.x=t.x-14;p.vx=0;}
      if(oldX>=t.x+t.w+14 && p.x<t.x+t.w+14){p.x=t.x+t.w+14;p.vx=0;}
    }
    const oldY = p.y;
    p.wall=0;
    for (const wall of walls) {
      if (p.y+18<=wall.top || p.y>=ground) continue;
      if (oldX<=wall.x-14 && p.x>=wall.x-14) {p.x=wall.x-14;p.wall=1;}
      else if (oldX>=wall.x+34 && p.x<=wall.x+34) {p.x=wall.x+34;p.wall=-1;}
      if (p.wall) {p.vx=0;p.vy=Math.min(78,p.vy);break;}
    }
    const body = p.morphed || (power === 'slide' && held('action')) ? 12 : 22;

    const floating = power === 'glide' && held('jump');
    if (power==='swim') p.vy += (vertical*230-p.vy)*Math.min(1,dt*5);
    else if (power==='bubble' && held('action') && p.y>55) p.vy += (-160-p.vy)*Math.min(1,dt*5);
    else if (floating && p.vy>0) p.vy=Math.min(72,p.vy+dt*90);
    else p.vy+=dt*(movement==='precision'?1210:1050)*p.gravity;
    p.y += p.vy*dt;
    p.on = false;
    p.onIce=false;
    if ((p.gravity < 0 || power==='swim') && p.y < 48) {p.y=48;p.vy=0;p.on=true;p.jumps=0;}
    let landed = false;
    for (const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if (p.x < ledge.x-8 || p.x > ledge.x+ledge.w+8) continue;
      if (ledge.kind==='hazard') {
        if (p.y+body>ledge.y && p.y-body<ground) {
          if(movement==='beat'){respawn();return;}
          if (hit()) return;
        }
        continue;
      }
      if (ledge.kind==='rail' || (ledge.dropAt!==undefined && clock>=ledge.dropAt)) continue;
      if (ledge.kind==='ceiling') {
        if (p.gravity<0 && p.vy<=0 && oldY-body>=ledge.y && p.y-body<=ledge.y) {
          p.y=ledge.y+body;p.vy=0;p.on=true;
        }
        continue;
      }
      if (ledge.kind === 'shelf' && p.y+body > ledge.y+20 && p.y-body < ledge.y+20 && p.vy < 0) {
        p.y=ledge.y+20+body;p.vy=0;
      }
      if (!landed && p.vy >= 0 && oldY+body <= ledge.y && p.y+body >= ledge.y) {
        p.y = ledge.y-body;p.vy = 0;p.on = true;p.jumps = 0;p.dashUsed=false;
        if(p.pogo){p.vy=-410;p.pogo=false;p.on=false;}
        p.jumpCut=false;
        landed = true;
        if(ledge.kind==='drop') ledge.dropAt ??= clock+.38;
        p.onIce=ledge.kind==='ice';
        if(ledge.kind==='barrel' && held('technique')) {p.vx=p.facing*440;p.vy=-610;p.grapple=.35;p.on=false;}
        if(ledge.kind==='pogo' && (held('technique') || held('jump'))) {p.vy=-590;p.on=false;}
        if (ledge.kind === 'spring') {p.vy=-565;p.on=false;}
        if (ledge.kind === 'belt') p.x += 75*dt;
        if (ledge.kind === 'current') p.x -= 65*dt;
        if (ledge.kind === 'lift' && held('jump')) {p.vy=-560;p.on=false;}
      }
    }
    if (power==='bubble' && p.y<48) {p.y=48;p.vy=0;}
    if (p.y > height+65) {respawn();return;}
    const stage = Math.min(sections-1,Math.floor(checkpoint(p.x)/sectionSize));
    if (oldY <= height && p.x>=finish && p.x-p.vx*dt<finish) {
      status(({guardian:guardian?.hint,switch:'Reach the marker and press Jump or Action.',crystals:'Collect three crystals, then reach the exit.',sprint:'Cross the finish at full speed.',summit:'Climb the ledges to reach the exit.'})[finale]);
    }
    if (stage > chapter && p.on) {
      chapter=stage;
      saveCheckpoint();
      status(chapters[stage] + ' · ' + (stage===sections-1 ? ending : 'Checkpoint reached.'));
      hud();
    }
    for (const c of crystals) {
      if (!c.taken && close(p,c,24,29)) {if(c.refill){p.dashUsed=false;p.power=0;}c.taken=true;taken++;p.crystalCombo=(p.crystalCombo||0)+1;hud();}
    }
    for (const attack of attacks) {
      if(attack.returning && attack.life<.55) attack.v=Math.sign(p.x-attack.x)*420;
      attack.x+=attack.v*dt;
      if(attack.vy!==undefined){attack.y+=attack.vy*dt;attack.vy+=(attack.gravity||0)*dt;}
      attack.life-=dt;
    }
    attacks = attacks.filter(a => a.life>0);
    for (const shot of hazards) {
      shot.x+=shot.v*dt;
      shot.life-=dt;
      if (shot.life>0 && close(p,shot,18,22)) {shot.life=0;if (hit()) return;}
    }
    hazards = hazards.filter(shot=>shot.life>0);
    for (const foe of enemies) {
      if (foe.dead || Math.abs(foe.x-p.x)>360) continue;
      if ((foe.turret || enemyPattern==='turret' || index===16) && clock>=foe.shotAt) {
        hazards.push({x:foe.x,y:foe.y,v:Math.sign(p.x-foe.x)*180,life:2});
        foe.shotAt=clock+cadence;
      }
      const position = foePosition(foe);
      if (attacks.some(a => a.life>0 && close(a,position,20+(a.radius||8),20+(a.radius||8)))) foe.dead=true;
      if (!foe.dead && close(p,position,29,34)) {
        if ((p.vy>65 && oldY<position.y-17) || (power==='dash' && p.power>.22)) {
          foe.dead=true;p.vy=p.pogo || (movement==='pogo' && held('jump')) ? -560 : -320;p.pogo=false;p.on=false;
        } else if (hit()) return;
      }
    }
    if (p.x > finish) {
      boss.grace = Math.max(0,boss.grace-dt);
      if (boss.health) updateGuardian(dt,p,oldY);
      if (p !== player) return;
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
    const targetCamera=Math.max(0,Math.min(finish+70,p.x-238+Math.max(-72,Math.min(90,p.vx*.18))));
    camera+=(targetCamera-camera)*Math.min(1,dt*10);
  }
  function updateGuardian(dt,p,oldY) {
    boss.time+=dt;
    const t=boss.time;
    const cycle=t%3.2;
    const center=finish+465;
    boss.x=center;
    boss.y=ground-40;
    switch(guardian.pattern) {
      case 'hop':
        boss.x+=Math.sin(t*1.5)*120;
        boss.y-=Math.max(0,Math.sin(t*2.9))*68;
        break;
      case 'charge':
        boss.x+=cycle<1 ? -100 : cycle<2 ? -100+(cycle-1)*245 : 145;
        break;
      case 'volley': boss.x+=Math.sin(t*1.2)*65;break;
      case 'sweep':
        boss.x+=Math.sin(t*1.5)*100;
        boss.y-=Math.max(0,Math.sin(t*1.7))*120;
        break;
      case 'dive':
        boss.x+=Math.sin(t*1.5)*135;
        boss.y-=Math.max(0,Math.cos(t*1.8))*130;
        break;
      case 'barrage': boss.x+=95;break;
    }
    if (['volley','sweep','barrage'].includes(guardian.pattern) && t>=boss.nextShot) {
      const aim=Math.sign(p.x-boss.x) || -1;
      hazards.push({x:boss.x+aim*44,y:boss.y+12,v:aim*235,life:2.6});
      if (guardian.pattern==='barrage') hazards.push({x:boss.x+aim*44,y:boss.y-55,v:aim*200,life:2.6});
      boss.nextShot=t+(guardian.pattern==='volley'?.9:1.55);
    }
    const shielded=guardian.pattern==='charge' && cycle>=1 && cycle<2;
    const attack=attacks.find(a=>a.life>0 && close(a,boss,49+(a.radius||0),42));
    const stomp=close(p,boss,47,52) && p.vy>70 && (oldY<boss.y-18 || p.pogo);
    if (!shielded && !boss.grace && (attack || stomp)) {
      boss.health=Math.max(0,boss.health-(attack?.damage||1));
      boss.grace=.65;
      if (attack) attack.life=0;
      if (stomp) {p.vy=p.pogo?-510:-375;p.pogo=false;p.on=false;}
      status(boss.health ? guardian.name+' · '+boss.health+' hits left.' : guardian.name+' cleared. Reach the exit.');
    } else if (close(p,boss,44,42)) hit();
  }
  function foePosition(foe) {
    if (foe.turret) return {x:foe.x,y:foe.y};
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
      for (let panel=0;panel<2;panel++) {
        ctx.save();
        const flipped=(Math.floor(camera*.27/width)+panel)%2;
        ctx.translate(panel*width-offset+(flipped?width:0),0);
        if(flipped) ctx.scale(-1,1);
        ctx.drawImage(backdrop,index%5*tile,Math.floor(index/5)*tile,tile,tile,0,0,width,height);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.translate(-camera,0);
    for (const wall of walls) {
      if (wall.x<camera-20 || wall.x>camera+width) continue;
      ctx.fillStyle='#3f5d80';ctx.fillRect(wall.x,wall.top,20,ground-wall.top);
      ctx.fillStyle='#a6d3f6';ctx.fillRect(wall.x,wall.top,3,ground-wall.top);
    }
    for(const t of tunnels) {
      ctx.fillStyle='#50678a';ctx.fillRect(t.x,t.y-13,t.w,13);
      ctx.fillStyle='#92e4ef';ctx.fillRect(t.x,t.y-13,t.w,2);
    }
    const ledgeColors={drop:'#d59155',barrel:'#a76c40',pogo:'#9e76c5',ice:'#8edaf3',rail:'#d6b87f',ceiling:'#7258a8',hazard:'#e64562',floor:'#25364a',shelf:'#71648d',spring:'#579578',belt:'#a56b4b',current:'#387d9b',lift:'#547d9c'};
    for (const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if (ledge.dropAt!==undefined && clock>=ledge.dropAt) continue;
      if (ledge.x+ledge.w<camera || ledge.x>camera+width) continue;
      if (ledge.kind==='hazard') {
        const count=Math.max(1,Math.round(ledge.w/16));
        const spacing=ledge.w/count;
        ctx.fillStyle='#ff617c';
        ctx.beginPath();
        for(let i=0;i<count;i++){
          const x=ledge.x+i*spacing;
          ctx.moveTo(x,ground);ctx.lineTo(x+spacing*.5,ledge.y);ctx.lineTo(x+spacing,ground);
        }
        ctx.fill();
        continue;
      }
      const gradient=ctx.createLinearGradient(0,ledge.y,0,ledge.y+54);
      gradient.addColorStop(0,ledgeColors[ledge.kind]);gradient.addColorStop(1,'#0c1220');
      ctx.fillStyle=gradient;
      ctx.fillRect(ledge.x,ledge.y,ledge.w,ledge.kind==='hazard'?43:ledge.kind==='floor'?65:18);
      ctx.fillStyle='#ffffff73';
      ctx.fillRect(ledge.x,ledge.y,ledge.w,3);
      if (ledge.kind==='belt' || ledge.kind==='spring' || ledge.kind==='lift') {
        ctx.fillStyle='#ffffff4d';
        for(let x=ledge.x+9;x<ledge.x+ledge.w-7;x+=20) ctx.fillRect(x,ledge.y+8,7,3);
      }
    }
    for (const c of crystals) if (!c.taken && c.x>=camera && c.x<camera+width) {
      if(player.sonar && close(player,c,310,300)){ctx.strokeStyle='#9bf4ff';ctx.strokeRect(c.x-18,c.y-18,36,36);}
      if(c.refill){ctx.strokeStyle='#66ffe0';ctx.strokeRect(c.x-15,c.y-15,30,30);}
      if(!sprite(15,c.x,c.y,38,38)){ctx.fillStyle='#ffd967';ctx.fillRect(c.x-5,c.y-5,10,10);}
    }
    for (const foe of enemies) if(!foe.dead && foe.x>=camera-80 && foe.x<camera+width+80) {
      const at=foePosition(foe);
      const cell = index;
      if(!atlasSprite(enemyArt,5,cell,at.x,at.y,73,73)){ctx.fillStyle='#bd664e';ctx.fillRect(at.x-18,at.y-17,36,34);}
    }
    if (boss.health && camera+width>finish) {
      if(!atlasSprite(enemyArt,5,index,boss.x,boss.y,126,126) && !sprite(12,boss.x,boss.y,116,116,true)){ctx.fillStyle='#ad505c';ctx.fillRect(boss.x-34,boss.y-38,68,76);}
      ctx.fillStyle='#f77c8b';ctx.fillRect(boss.x-36,boss.y-54,boss.health*14,5);
    }
    ctx.fillStyle=boss.health?'#78487c':'#e0bd64';
    const markerY = finale==='summit' ? ground-225 : ground-104;
    ctx.fillRect(exitX,markerY,11,104);
    ctx.fillRect(exitX+11,markerY,45,25);
    for (const a of attacks) {
      ctx.fillStyle='#ffe9a9';ctx.beginPath();ctx.arc(a.x,a.y,a.radius||9,0,Math.PI*2);ctx.fill();
    }
    for(const shot of hazards) {
      ctx.fillStyle=index===16?'#ff86dc':'#ff8479';ctx.beginPath();ctx.arc(shot.x,shot.y,7,0,Math.PI*2);ctx.fill();
    }
    const p=player;
    if(p.on){
      ctx.fillStyle='#070a186e';ctx.beginPath();ctx.ellipse(p.x,p.y+22,23,5,0,0,Math.PI*2);ctx.fill();
    }
    if(p.grapple || p.power>.22 && power==='dash'){
      ctx.fillStyle='#9be8ff60';
      for(let i=1;i<=3;i++) ctx.fillRect(p.x-p.facing*(22+i*12),p.y-9+i*4,12,2);
    }
    const light=['Luna','Ivy','Frost','Melody','Spark'].includes(hero);
    const pose=!p.on?3:Math.abs(p.vx)>15?1+Math.floor(clock*10)%2:0;
    const cell = power==='slide' && held('action') ? 13 :
      light && !p.on && (power==='double' || power==='vine') ? 14 : (light?4:0)+pose;
    if(p.morphed){
      ctx.translate(p.x,p.y);ctx.scale(1,.55);ctx.translate(-p.x,-p.y);
    }
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
  const tick = 1/120;
  let accumulator = 0;
  function loop(now) {
    accumulator += Math.min(.075,Math.max(0,(now-last)/1000));
    while (accumulator >= tick && phase==='playing') {
      step(tick);
      accumulator-=tick;
    }
    last=now;
    draw();
    if(phase==='playing') frame=requestAnimationFrame(loop);
  }
  function startRun(saved) {
    cancelAnimationFrame(frame);
    keys.clear();
    mobile.clear();
    reset();
    if (saved) {
      chapter=saved.stage;
      for(const i of saved.crystals) if(crystals[i]) crystals[i].taken=true;
      for(const i of saved.enemies) if(enemies[i]) enemies[i].dead=true;
      taken=crystals.filter(c=>c.taken).length;
      player=resetPlayer(chapter*sectionSize+100);
      camera=Math.max(0,player.x-238);
      status(chapters[chapter]+' · Checkpoint resumed.');
      hud();
    }
    phase='playing';
    byId('side-start').textContent='Restart';
    canvas.focus({preventScroll:true});
    accumulator=0;
    last=performance.now();
    frame=requestAnimationFrame(loop);
  }
  byId('side-start').onclick=()=>startRun(null);
  resumeButton.hidden=!readCheckpoint();
  resumeButton.onclick=()=>{const saved=readCheckpoint();if(saved)startRun(saved);};
  const codes={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:power==='swim'||movement==='airdash'?'up':'jump',KeyW:power==='swim'||movement==='airdash'?'up':'jump',ArrowDown:'down',KeyS:'down',Space:'jump',KeyX:'action',KeyC:'technique'};
  addEventListener('keydown',event=>{
    const control=codes[event.code];
    if(!control || phase!=='playing' || event.target.closest('button,a,input,select')) return;
    event.preventDefault();
    keys.add(control);
    if(!event.repeat) {
      if(control==='jump') jump();
      if(control==='action') action();
      if(control==='technique') useTechnique();
    }
  });
  addEventListener('keyup',event=>{const control=codes[event.code];keys.delete(control);if(control==='action')releaseAction(true);});
  addEventListener('blur',()=>{keys.clear();mobile.clear();releaseAction(false);});
  bindTouchJoystick(byId('touch-stick'),direction=>{
    for (const axis of ['left','right','up','down']) mobile.delete(axis);
    if(direction) mobile.add(direction);
  },{horizontal:power!=='swim' && index!==3 && movement!=='airdash'});
  document.querySelectorAll('[data-control]').forEach(button=>{
    const control=button.dataset.control;
    const activate=()=>{if(control==='jump')jump();else if(control==='technique')useTechnique();else action();};
    button.onpointerdown=event=>{
      event.preventDefault();button.setPointerCapture(event.pointerId);mobile.add(control);activate();
    };
    for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,()=>{mobile.delete(control);if(control==='action')releaseAction(event==='pointerup');});
    button.onclick=event=>{if(event.detail===0){activate();if(control==='action')releaseAction(true);}};
  });
  for (const image of [sprites,poster,backdrop,enemyArt,heroArt]) image.onload=()=>{if(phase!=='playing') draw();};
  reset();
})();
