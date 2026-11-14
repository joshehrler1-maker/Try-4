(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const scenery = 'assets/scenes/platform-levels.webp';
  const courses = window.pawtopiaCourses;
  const catalog = byId('side-catalog');
  if (!catalog) return;
  if (!Array.isArray(courses) || !Array.isArray(window.pawtopiaStyles) || !Array.isArray(window.pawtopiaVariants) || !Array.isArray(window.pawtopiaTechniques) || !Array.isArray(window.pawtopiaChapters)) {
    catalog.textContent = 'The games could not load. Please refresh the page.';
    return;
  }
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
  if (selection === null) return;
  if (!/^\d+$/.test(selection) || !courses[Number(selection)] || !window.pawtopiaStyles[Number(selection)] || !window.pawtopiaVariants[Number(selection)] || !window.pawtopiaTechniques[Number(selection)] || !window.pawtopiaChapters[Number(selection)]) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'alert');
    notice.textContent = 'This game is unavailable. Choose another adventure below.';
    catalog.before(notice);
    return;
  }
  const index = Number(selection);
  const [name, hero, opening, ending, coursePower, terrain] = courses[index];
  const [reference, movement, enemyPattern, prologue, epilogue] = window.pawtopiaStyles[index];
  const [runSpeed, handling, jumpSpeed, cadence, , goalType] = window.pawtopiaVariants[index];
  const wallMoves = movement==='buster' || movement==='airdash';
  const [techniqueName, technique, strength] = window.pawtopiaTechniques[index];
  const chapters = window.pawtopiaChapters[index];
  const controllerDeck = document.querySelector('#side-player .side-controls');
  let controllerStage = -1;
  function syncControllerArt(stage) {
    if (!controllerDeck || controllerStage === stage) return;
    controllerStage = stage;
    controllerDeck.dataset.stageTheme = String(stage % 6);
    controllerDeck.dataset.stageTitle = (chapters[stage] || 'Adventure').slice(0,48);
    controllerDeck.setAttribute('aria-label', name + ' — Stage ' + (stage+1) + ': ' + (chapters[stage] || 'Adventure') + ' touch controls');
  }
  syncControllerArt(0);

  const special = {buster:'throw',roll:'dash',float:'bubble',beat:'pulse',airlift:'vine',
    airdash:'dash',pogo:'stomp',blaster:'throw',shooter:'throw',whip:'pulse',momentum:'dash'};
  const power = special[movement] || (movement in {stomp:1,swim:1,glide:1,flip:1,grapple:1,throw:1} ? movement : coursePower);
  const descriptions = {
    stomp:'Bounce off enemies', slide:'Hold Action to slide under low shelves', swim:'Steer in four directions to swim. Surface or visit a bubbling vent for air',
    dash:'Press Action to dash', vine:'Press Action to climb into a high route', glide:'Hold Jump to glide',
    throw:'Press Action to throw a crystal', flip:'Press Action to reverse gravity',
    pulse:'Press Action to release a shockwave', grapple:'Press Action below an overhead rail to attach. Steer to swing, then press Release Cable to let go',
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
  const terrainArt=new Image();
  terrainArt.src='assets/scenes/platform-terrain.webp';
  const stagePropArt=new Image();
  stagePropArt.src='assets/scenes/platform-stage-props.webp';
  const energyFxArt=new Image();
  energyFxArt.src='assets/animation/super-paw-effects-v1.svg';
  const combatArt=new Image();
  combatArt.src='assets/scenes/platform-combat.webp';
  const propArt=new Image();
  propArt.src='assets/scenes/platform-landmarks.webp';
  const guardianArt=new Image();
  guardianArt.src='assets/scenes/platform-guardians.webp';
  const poster = new Image();
  poster.src = 'assets/whisker-luna-master.webp';
  const mobile = new Set();
  const keys = new Set();
  const pressedCodes = new Set();
  const held = key => mobile.has(key) || keys.has(key);
  const width = 800;
  const height = 380;
  // Per-game handling profiles inspired by the feel of each reference game.
  // Multipliers preserve existing abilities and collision rules.
  const motionProfiles = [
    [1,1,1,1],      // Ember: responsive classic jumping
    [1.08,1.12,1,1],// Library: precise action-platforming
    [.82,.8,.78,.62],// Coral: buoyant underwater steering
    [1.24,.58,1.02,1],// Clocktower: momentum and longer run-up
    [1.05,.8,.98,1],// Garden: weighty rolling
    [1,.95,.85,.82],// Waterfall: airy glide
    [.94,1.15,.9,.9],// Lantern: forgiving float
    [1,1.15,1,1],   // Crystal: precise gravity changes
    [1.1,1.2,1,1],  // Stage Beat: sharp rhythmic inputs
    [.96,1,1.06,1], // Quarry: weighty grapple
    [1.06,.96,.88,.85],// Sunset: wind-borne motion
    [1,1.1,1,1],    // Cloud: precise air dash
    [1.02,1.04,1.08,1],// Thunder: firm pogo landing
    [.95,1.06,.95,1],// Autumn: deliberate aiming
    [1.02,1.08,1,1],// Observatory: responsive exploration
    [1.06,1.04,.88,.9],// Bamboo: flowing movement
    [1.02,1.08,1.02,1],// Steamworks: snappy dodges
    [1,1.08,.96,1], // Snow: controlled platforming
    [.96,1.1,1.08,1],// Canyon: precision jumps
    [.96,1,.83,.7], // Submarine: swimming inertia
    [1.28,.62,1.03,1],// Neon: high-speed momentum
    [.96,1.08,1.04,1],// Marble: deliberate attacks
    [.94,.95,.84,.82],// Swamp: float and bounce
    [.96,.96,.82,.8],// Sunflower: airborne travel
    [1.04,1.1,1.02,1] // Starship: action run-and-gun
  ];
  const [speedFactor,controlFactor,gravityFactor,airFactor]=motionProfiles[index];
  // Game-by-game jump arcs: [jump impulse, held-jump gravity, released-jump
  // gravity, falling gravity]. No borrowed animation or copyrighted assets.
  const jumpProfiles=[
    [1,.76,1.42,1.12],[1.03,.91,1.2,1.14],[.85,.82,1, .78],
    [1.04,.88,1.18,1.06],[.98,.84,1.28,1.2],[1.06,.67,1.2,.86],
    [.98,.62,1.22,.82],[1,.95,1.05,1],[1,.96,1.04,1.02],
    [1.03,.9,1.12,1.07],[1.08,.74,1.19,.88],[1.03,.9,1.1,1.15],
    [1,.88,1.16,1.1],[1.02,.72,1.26,1.03],[1.02,.9,1.18,1.02],
    [1.06,.72,1.18,.86],[1.01,.89,1.2,1.12],[1,.81,1.22,1.04],
    [1.01,.92,1.12,1.15],[.9,.82,1,.8],[1.03,.84,1.22,1.1],
    [1,.9,1.18,1.12],[.98,.71,1.22,.9],[1.06,.65,1.18,.83],
    [1.01,.9,1.16,1.08]
  ];
  const [jumpFactor,holdGravity,releaseGravity,fallGravity]=jumpProfiles[index];
  const sections = 6;
  const sectionSize = index===0 ? 3020 : 2200;
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
  const landmarks=[];
  let player, boss, phase, camera, frame, last, clock, chapter, taken, attacks, hazards, escape;
  const particles=[];
  let rings=0;
  let amberSwitch=false;
  let reefCacheOpen=false;
  const airCapacity=18;
  const looseRings=[];
  let chapterReveal=0;
  const saveKey='pawcade-platform-checkpoint-'+(index===0?'v2-':'v1-')+index;
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
        stage:chapter,amberSwitch,reefCacheOpen,
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
    if(index===0){
      platforms.push({x:start+2170,y:326,w:300,kind:'floor'});
      platforms.push({x:start+2525,y:326,w:270,kind:'floor'});
      platforms.push({x:start+2840,y:326,w:180,kind:'floor'});
      platforms.push({x:start+2500+stage*30,y:245-stage%3*18,w:105,kind:'floor'});
      crystals.push({x:start+2570,y:212-stage%3*18});
      enemies.push({x:start+2660,y:303,offset:stage+8});
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
    // Optional upper routes make each chapter less linear without blocking
    // the main path. Each game's movement identity determines its route type.
    // Keep this outside the feature switch so all 25 adventures receive it.
    if(index!==7 && index!==14) { // gravity-flip games need clear ceiling lanes
      const routeKinds={
        momentum:['belt','floor','floor'],
        roll:['barrel','floor','floor'],
        pogo:['pogo','floor','pogo'],
        glide:['floor','lift','floor'],
        airlift:['lift','floor','lift'],
        airdash:['floor','floor','lift'],
        grapple:['floor','rail','floor'],
        swim:['current','current','floor'],
        float:['spring','floor','spring'],
        beat:['spring','floor','spring'],
        shooter:['floor','shelf','floor'],
        buster:['floor','shelf','floor'],
        precision:['floor','floor','shelf'],
        vine:['spring','floor','spring'],
        throw:['floor','floor','shelf'],
        pulse:['spring','floor','spring'],
        shield:['floor','ice','floor'],
        whip:['shelf','floor','shelf'],
        bubble:['current','floor','current'],
        photo:['shelf','floor','shelf']
      };
      const route=(routeKinds[movement]||['floor','floor','lift']);
      const seed=(index*13+stage*7)%5;
      const routeX=start+Math.min(sectionSize-660,1330+seed*45);
      const heights=[245,211,239,203,228];
      for(let branch=0;branch<3;branch++){
        const bx=routeX+branch*(155+seed*3);
        const by=heights[(branch+stage+index)%heights.length];
        const bw=92+(branch%2)*20;
        // Only add a short, optional elevated chain; never remove floor paths.
        platforms.push({x:bx,y:by,w:bw,kind:route[branch]});
        crystals.push({x:bx+bw/2,y:by-35});
      }
    }
    // Individually paced challenge pockets for all six chapters. These
    // supplement, rather than replace, the existing authored room geometry.
    const challengeSeed=(index*23+stage*17)%7;
    const challengeX=start+Math.min(sectionSize-570,450+challengeSeed*36);
    const challengeTypes={
      momentum:['belt','belt','floor'],
      roll:['barrel','floor','barrel'],
      pogo:['pogo','floor','pogo'],
      grapple:['floor','rail','floor'],
      swim:['current','current','current'],
      float:['spring','floor','spring'],
      glide:['lift','floor','lift'],
      airlift:['lift','floor','lift'],
      airdash:['floor','lift','floor'],
      flip:['floor','floor','floor'],
      beat:['spring','spring','floor'],
      precision:['floor','shelf','floor'],
      vine:['spring','floor','spring'],
      bubble:['current','floor','current']
    };
    const challengeKinds=challengeTypes[movement]||['floor','shelf','floor'];
    const challengeHeights=[277,249,223,258,234,267];
    for(let part=0;part<3;part++){
      const cx=challengeX+part*138;
      const cy=challengeHeights[(stage+part+index)%6];
      const cw=85+(part===1?19:0);
      platforms.push({x:cx,y:cy,w:cw,kind:challengeKinds[part]});
      if(part===1) crystals.push({x:cx+cw/2,y:cy-45});
    }
    // A guarded optional reward on the alternate route. Existing enemy AI
    // handles this encounter, so no new combat controls are required.
    if(index!==7 && index!==14){
      const guardX=challengeX+290;
      enemies.push({x:guardX,y:ground-23,offset:stage+index+31,turret:movement==='shooter'||movement==='buster'});
      crystals.push({x:challengeX+340,y:190});
    }
    // Each game's six chapters now carry a different collectible trail.
    // These are optional visual wayfinding rewards, not required jumps:
    // arcs reward aerial control, zigzags reward exploration, and straight
    // trails guide faster action games without altering existing terrain.
    const trailStyles=[
      'arc','zigzag','line','line','arc','arc','zigzag','zigzag','line',
      'arc','arc','zigzag','line','arc','zigzag','arc','line','arc',
      'zigzag','line','line','zigzag','arc','arc','line'
    ];
    const trailStyle=trailStyles[index];
    const trailBase=start+Math.min(sectionSize-490,630+((index*29+stage*41)%6)*44);
    const trailCount=stage>=4?6:4;
    for(let gem=0;gem<trailCount;gem++){
      const fraction=gem/(trailCount-1);
      const tx=trailBase+gem*57;
      const ty=trailStyle==='arc'
        ? 238-Math.sin(fraction*Math.PI)*(48+stage*4)
        : trailStyle==='zigzag'
          ? 208+((gem+stage)%2?32:-23)
          : 218-stage*5;
      crystals.push({x:tx,y:ty});
    }
    // Optional stage-specific traversal islands give collectible trails
    // actual landing points. Their layouts differ by game and chapter;
    // they never replace the primary floor route or introduce lethal gaps.
    // Gravity-flip and underwater games retain their authored navigation.
    if(index!==7 && index!==14 && movement!=='swim'){
      const islandKinds={
        momentum:['floor','belt','floor'],roll:['barrel','floor','barrel'],
        pogo:['pogo','floor','pogo'],glide:['floor','lift','floor'],
        airlift:['lift','floor','lift'],airdash:['floor','lift','floor'],
        grapple:['floor','floor','floor'],float:['spring','floor','spring'],
        beat:['spring','floor','spring'],precision:['floor','shelf','floor'],
        vine:['floor','spring','floor'],shooter:['shelf','floor','shelf'],
        buster:['shelf','floor','shelf'],shield:['floor','ice','floor'],
        whip:['shelf','floor','shelf'],throw:['floor','shelf','floor']
      };
      const islandKindsForGame=islandKinds[movement]||['floor','floor','lift'];
      const islandX=start+Math.min(sectionSize-470,780+((index*11+stage*19)%5)*38);
      const climb=stage%3;
      const islandHeights=[
        [282,251,226],[277,244,217],[285,256,231]
      ][climb];
      for(let island=0;island<3;island++){
        const iw=82+(island===1?16:0);
        const ix=islandX+island*124;
        const iy=islandHeights[island];
        // Avoid stacking duplicate solid platforms on the same position.
        const overlaps=platforms.some(ledge=>
          ledge.y===iy && ix<ledge.x+ledge.w && ix+iw>ledge.x);
        if(!overlaps){
          platforms.push({x:ix,y:iy,w:iw,kind:islandKindsForGame[(island+stage)%3]});
        }
      }
    }
    if(index===0 && stage===1){
      landmarks.push({cell:0,x:start+610,y:223,w:66,h:39});
      for(let i=0;i<4;i++) platforms.push({x:start+735+i*115,y:210-i*19,w:94,kind:'floor',switchBridge:true});
    }
    if(index===2 && stage===2){
      landmarks.push({cell:4,x:start+540,y:205,w:58,h:64});
      for(let i=0;i<5;i++) crystals.push({x:start+620+i*56,y:170-i*16,reefCache:true});
    }
    if(index===2) landmarks.push({cell:7,x:start+(stage===3?670:980),y:270,w:72,h:75});
    if(index===11 && stage===1) landmarks.push({cell:5,x:start+1010,y:169,w:76,h:70});
    if (index===11) {
      crystals.push({x:start+690,y:226,refill:true},{x:start+1295,y:173,refill:true});
    }
    if (room==='rhythm') {
      for (let beat=0;beat<4;beat++) crystals.push({x:start+375+beat*415,y:225});
    }
  }
  if(power==='flip'){
    for(let stage=0;stage<sections;stage++){
      const x=stage*sectionSize;
      platforms.push({x,y:32,w:sectionSize,kind:'ceiling'});
      for(const offset of [315,1010,1785]){
        platforms.push({x:x+offset+stage*11,y:68,w:50+stage*5,kind:'ceilingSpikes'});
      }
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
    x,y:ground-22,air:airCapacity,vx:0,vy:0,facing:1,on:false,jumps:0,gravity:1,health:3,grace:0,power:0,spin:0,dashUsed:false,chargeStart:null,jumpBuffer:0,coyote:0,jumpCut:false
  });
  function reset() {
    amberSwitch=false;
    reefCacheOpen=false;
    player = resetPlayer();
    boss = {x:finish+465,y:ground-41,health:finale==='guardian'?5:0,grace:0,time:0,nextShot:1};
    enemies.forEach(e => {e.dead = false;e.shotAt=0;e.bashed=null;});
    platforms.forEach(ledge=>{ledge.dropAt=undefined;});
    crystals.forEach(c => {c.taken = false;});
    camera = chapter = taken = clock = 0;
    escape = null;
    particles.length=0;
    looseRings.length=0;
    rings=0;
    amberSwitch=false;
    chapterReveal=0;
    attacks = [];
    hazards = [];
    phase = 'ready';
    status(opening + '. Gameplay reference: ' + reference + '.');
    hud();
    draw();
  }
  function hud() {
    byId('side-progress').textContent = 'Stage ' + Math.min(sections,chapter+1) + ' / ' + sections + ' · ' + chapters[chapter] + ' · Hearts ' + player.health + (index===3 ? ' · Rings '+rings : ' · Crystals '+taken) + (index===2?' · Air '+Math.ceil(player.air)+'s':'');
  }
  function jump(buffer = true) {
    if (phase !== 'playing') return;
    if (power==='flip') {if(buffer) action();return;}
    if (buffer) player.jumpBuffer=.11;
    if (index===3 && held('down') && player.on) {player.spin=Math.min(5,player.spin+1);player.jumpBuffer=0;return;}
    if (index===10 && player.carry && !player.on) {
      player.carry=false;player.vy=-jumpSpeed;player.jumpBuffer=0;
      player.jumpCut=true;player.jumpAge=0;
      return;
    }
    if(player.cable){player.cable=null;player.grapple=.18;player.jumpBuffer=0;return;}
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
      player.vy = -jumpSpeed * jumpFactor * player.gravity;
      player.on = false;
      player.jumps++;
      playCue(220,390,.09);
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
        const dx=Number(held('right'))-Number(held('left'));
        const dy=Number(held('down'))-Number(held('up'));
        const length=Math.hypot(dx,dy)||1;
        player.vx=(dx || (dy ? 0 : player.facing))*660/length;
        player.vy=dy*660/length;
      }
    }
    if (power === 'flip' && player.on) {player.gravity *= -1; player.on = false;}
    if (power === 'vine') player.vy = -590;
    if (power === 'grapple') {
      const anchor = platforms.reduce((nearest, ledge) => {
        if(ledge.kind!=='rail') return nearest;
        const x=ledge.x+ledge.w/2;
        const y=ledge.y+8;
        const distance=Math.hypot(player.x-x,player.y-y);
        if(player.y<=y+16 || Math.abs(player.x-x)>=230 || (nearest && distance>=nearest.distance)) return nearest;
        return {x,y,distance};
      },null);
      if (anchor && !player.cable) {
          player.cable={x:anchor.x,y:anchor.y,length:anchor.distance};
          player.vx+=player.facing*130;
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
      case 'reveal':
        p.sonar=2;p.sonarOrigin={x:p.x,y:p.y};
        if(!reefCacheOpen && landmarks.some(prop=>prop.cell===4 && Math.hypot(p.x-prop.x,p.y-prop.y)<=160)){
          reefCacheOpen=true;
          burst(p.x,p.y,'#82ffe6',12);
          status('Sonar revealed a hidden crystal trail. Follow it upward.');
        }
        break;
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
      case 'release': if(p.cable){p.cable=null;p.grapple=.18;}break;
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
      case 'bash': {
        const target=nearby(125);
        if(!target) break;
        const dx=Number(held('right'))-Number(held('left'));
        const dy=Number(held('down'))-Number(held('up'));
        const length=Math.hypot(dx,dy)||1;
        const position=foePosition(target);
        p.vx=(dx || (dy ? 0 : p.facing*.65))*strength/length;
        p.vy=(dy || (dx ? 0 : -1))*strength/length;
        p.grapple=.27;
        target.bashed={x:position.x,y:position.y,vx:-p.vx*.75,vy:-p.vy*.75,until:clock+.48};
        burst(position.x,position.y,'#a8ffd9',12);
        break;
      }
      case 'parry': {
        const target=hazards.find(h=>h.parry && h.life>0 && close(p,h,55,55));
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
  const pauseButton=byId('side-pause');
  const soundButton=byId('side-sound');
  let audio, sound=false;
  soundButton.onclick=()=>{
    const Audio=window.AudioContext || window.webkitAudioContext;
    if(!Audio) return;
    try {
      audio ??= new Audio();
      sound=!sound;
      if(sound) audio.resume().catch(()=>{});
      soundButton.setAttribute('aria-pressed',String(sound));
      soundButton.textContent=sound?'Sound on':'Sound off';
      playCue(440,660);
    } catch {sound=false;}
  };
  function playCue(from,to,length=.12) {
    if(!sound || audio?.state!=='running') return;
    const now=audio.currentTime;
    const tone=audio.createOscillator();
    const volume=audio.createGain();
    tone.frequency.setValueAtTime(from,now);
    tone.frequency.exponentialRampToValueAtTime(to,now+length);
    volume.gain.setValueAtTime(.045,now);
    volume.gain.exponentialRampToValueAtTime(.001,now+length);
    tone.connect(volume);volume.connect(audio.destination);
    tone.start(now);tone.stop(now+length);
  }
  const resetActionPointers=[];
  function clearInput() {
    keys.clear();
    pressedCodes.clear();
    mobile.clear();
    resetStick?.();
    for(const resetPointer of resetActionPointers) resetPointer();
    releaseAction(false);
  }
  function togglePause() {
    if (phase==='playing') {
      phase='paused';
      cancelAnimationFrame(frame);
      clearInput();
      pauseButton.textContent='Resume';
      status('Paused.');
      draw();
    } else if (phase==='paused') {
      phase='playing';
      pauseButton.textContent='Pause';
      canvas.focus({preventScroll:true});
      accumulator=0;
      last=performance.now();
      frame=requestAnimationFrame(loop);
    }
  }
  pauseButton.onclick=togglePause;
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden && phase==='playing') togglePause();
    else if(document.hidden) clearInput();
  });
  window.addEventListener('blur',()=>{
    if(phase==='playing') togglePause();
    else clearInput();
  });
  function burst(x,y,color,count) {
    for(let i=0;i<count && particles.length<96;i++){
      const angle=i/count*Math.PI*2;
      particles.push({x,y,vx:Math.cos(angle)*(55+i%3*22),vy:Math.sin(angle)*75-28,color,life:.38});
    }
  }
  function hit() {
    if (player.grace > 0 || (power === 'shield' && held('action'))) return;
    playCue(210,85,.18);
    burst(player.x,player.y,'#ff8e8e',10);
    if(index===3 && rings){
      for(let i=0;i<Math.min(rings,16);i++){
        const direction=i%2 ? -1 : 1;
        looseRings.push({x:player.x,y:player.y,vx:direction*(65+i*13),vy:-165-i%4*35,age:0});
      }
      rings=0;
      player.grace=1.45;
      hud();
      return;
    }
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
    looseRings.length=0;
    rings=0;
    camera=Math.max(0,Math.min(finish+70,player.x-238));
    status('Back at the stage checkpoint.');
    hud();
  }
  const close = (a,b,x,y) => Math.abs(a.x-b.x)<x && Math.abs(a.y-b.y)<y;
  function step(dt) {
    clock += dt;
    chapterReveal=Math.max(0,chapterReveal-dt);
    for(let i=particles.length-1;i>=0;i--){
      const spark=particles[i];
      spark.life-=dt;
      if(spark.life<=0){particles.splice(i,1);continue;}
      spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.vy+=160*dt;
    }
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
    const topSpeed = runSpeed * speedFactor;
    const reversing = steer && Math.sign(p.vx) !== steer;
    const acceleration = (p.onIce ? handling*.28 : steer
      ? handling * (p.on ? (reversing ? 1.35 : 1) : .72)
      : Math.max(1.6,handling*(p.on ? .95 : .45))) * controlFactor * (p.on ? 1 : airFactor);
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
    const wasGrounded=p.on;
    p.landingPose=Math.max(0,(p.landingPose||0)-dt);
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
    else if (!(movement==='airdash' && p.power>.22)) {
      const arcFactor=p.vy*p.gravity<0
        ? (held('jump') ? holdGravity : releaseGravity)
        : fallGravity;
      p.vy+=dt*(movement==='precision'?1210:1050)*gravityFactor*arcFactor*p.gravity;
    }
    p.y += p.vy*dt;
    if(index===11){
      const prism=landmarks.find(prop=>prop.cell===5);
      const inside=close(p,prism,prism.w/2+12,prism.h/2+body);
      if(inside && p.power>.22 && p.dashUsed && !p.inPrism){
        p.inPrism=true;
        burst(p.x,p.y,'#dda4ff',10);
        status('Dream prism: dash through to recharge.');
      } else if(!inside && p.inPrism){
        p.inPrism=false;
        p.dashUsed=false;
        p.power=0;
        burst(p.x,p.y,'#82ffe6',10);
        playCue(550,880);
      }
    }

    if(p.cable){
      const dx=p.x-p.cable.x,dy=p.y-p.cable.y;
      const distance=Math.hypot(dx,dy);
      if(distance>p.cable.length){
        const nx=dx/distance,ny=dy/distance;
        p.x=p.cable.x+nx*p.cable.length;
        p.y=p.cable.y+ny*p.cable.length;
        const outward=p.vx*nx+p.vy*ny;
        if(outward>0){p.vx-=outward*nx;p.vy-=outward*ny;}
      }
    }
    p.on = false;
    p.onIce=false;
    if (((p.gravity < 0 && power!=='flip') || power==='swim') && p.y < 48) {p.y=48;p.vy=0;p.on=true;p.jumps=0;}
    let landed = false;
    for (const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if(ledge.switchBridge && !amberSwitch) continue;
      if (p.x < ledge.x-8 || p.x > ledge.x+ledge.w+8) continue;
      if(ledge.kind==='ceilingSpikes'){
        if(p.y-body<ledge.y){respawn();return;}
        continue;
      }
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
        if(!wasGrounded && p.vy>190) p.landingPose=.13;
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
    if(index===2){
      const previous=Math.ceil(p.air);
      const breathing=p.y<=67 || landmarks.some(vent=>vent.cell===7 && close(p,vent,41,60));
      p.air=breathing ? airCapacity : Math.max(0,p.air-dt);
      if(p.air===0){respawn();status('Out of air. Swim to the surface or a bubbling vent.');return;}
      if(Math.ceil(p.air)!==previous) hud();
    }
    if(index===0 && !amberSwitch && p.on && landmarks.some(prop=>prop.cell===0 && close(p,prop,31,24))){
      amberSwitch=true;
      burst(p.x,p.y,'#ffce71',16);
      playCue(390,780);
      status('Amber switch activated. The upper bridge is open.');
    }
    const stage = Math.min(sections-1,Math.floor(checkpoint(p.x)/sectionSize));
    if (oldY <= height && p.x>=finish && p.x-p.vx*dt<finish) {
      status(({guardian:guardian?.hint,switch:'Reach the marker and press Jump or Action.',crystals:'Collect three crystals, then reach the exit.',sprint:'Cross the finish at full speed.',summit:'Climb the ledges to reach the exit.'})[finale]);
    }
    if (stage > chapter && p.on) {
      chapter=stage;
      syncControllerArt(chapter);
      chapterReveal=2;
      if(index===0)showFoundryStory(stage);
      saveCheckpoint();
      const nextBeat=stage===sections-1 ? ending : (stage%2===0 ? epilogue : prologue);
      status(chapters[stage] + ' · ' + nextBeat + ' · Checkpoint saved.');
      hud();
    }
    for (const c of crystals) {
      if (!c.taken && (!c.reefCache || reefCacheOpen) && close(p,c,24,29)) {if(c.refill){p.dashUsed=false;p.power=0;}c.taken=true;burst(c.x,c.y,c.refill?'#82ffe6':'#ffdb80',9);playCue(650,980);taken++;if(index===3)rings++;p.crystalCombo=(p.crystalCombo||0)+1;hud();}
    }
    for(let i=looseRings.length-1;i>=0;i--){
      const ring=looseRings[i];
      ring.age+=dt;
      ring.x+=ring.vx*dt;
      ring.y+=ring.vy*dt;
      ring.vy+=660*dt;
      if(ring.y>ground-8 && ring.vy>0){ring.y=ground-8;ring.vy*=-.55;}
      if(ring.age>3.2) looseRings.splice(i,1);
      else if(ring.age>.45 && close(p,ring,21,25)){
        looseRings.splice(i,1);rings++;playCue(650,980);hud();
      }
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
      const position = foePosition(foe);
      // Fire from the visible enemy position, not its original spawn point.
      // Do not shoot through walls or across different vertical lanes.
      const inLane=Math.abs(p.y-position.y)<105;
      const inRange=Math.abs(p.x-position.x)<320;
      const direction=Math.sign(p.x-position.x);
      const shotBlocked=platforms.some(ledge=>
        ['floor','shelf','ceiling'].includes(ledge.kind) &&
        ledge.x<Math.max(position.x,p.x) &&
        ledge.x+ledge.w>Math.min(position.x,p.x) &&
        ledge.y<Math.max(position.y,p.y)-6 &&
        ledge.y+17>Math.min(position.y,p.y)+6
      );
      if ((foe.turret || enemyPattern==='turret' || index===16) &&
          clock>=foe.shotAt && inLane && inRange && direction && !shotBlocked) {
        hazards.push({x:position.x+direction*12,y:position.y,v:direction*180,life:2,parry:index===16});
        foe.shotAt=clock+cadence;
      }
      if (attacks.some(a => a.life>0 && close(a,position,20+(a.radius||8),20+(a.radius||8)))) foe.dead=true;
      if (!foe.dead && !(foe.bashed && clock<foe.bashed.until) && close(p,position,29,34)) {
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
    // Distance-driven footfalls avoid the skating effect when movement is
    // blocked by a wall or platform. Update after collision resolution.
    if(p.on && !p.morphed){
      const traveled=Math.min(55,Math.abs(p.x-oldX));
      p.gaitPhase=(p.gaitPhase||0)+traveled/15;
      p.gaitWeight=Math.min(1,(p.gaitWeight||0)+dt*9);
      if(traveled<.3)p.gaitWeight=Math.max(0,p.gaitWeight-dt*13);
    } else {
      p.gaitWeight=Math.max(0,(p.gaitWeight||0)-dt*12);
    }
    // Per-game camera language: precision platformers keep a tighter frame,
    // while speed and exploration games look farther along the travel path.
    // The dead-zone and follow speed remain bounded for phone readability.
    const cameraProfiles=[
      [238,.18,10],[252,.12,11],[250,.13,7],[228,.29,12],[240,.19,9],
      [244,.16,9],[246,.13,8],[252,.09,13],[228,.28,13],[242,.16,9],
      [236,.21,9],[252,.11,12],[236,.17,10],[246,.15,8],[258,.12,8],
      [246,.15,8],[236,.18,10],[250,.13,8],[244,.16,9],[248,.18,8],
      [222,.31,13],[246,.12,9],[250,.13,8],[238,.19,9],[230,.25,11]
    ];
    const [cameraAnchor,lookAhead,followRate]=cameraProfiles[index];
    const directionalLead=Math.max(-78,Math.min(96,p.vx*lookAhead));
    const targetCamera=Math.max(0,Math.min(finish+70,p.x-cameraAnchor+directionalLead));
    camera+=(targetCamera-camera)*Math.min(1,dt*followRate);
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
    const ranged=['volley','sweep','barrage'].includes(guardian.pattern);
    const volleyPhase=guardian.pattern==='volley' ? (boss.health<=1?3:boss.health<=3?2:1) : 0;
    if(ranged && !boss.aim && boss.nextShot-t<.3) boss.aim=Math.sign(p.x-boss.x)||-1;
    if (ranged && t>=boss.nextShot) {
      const aim=boss.aim || Math.sign(p.x-boss.x) || -1;
      boss.aim=0;
      hazards.push({x:boss.x+aim*44,y:boss.y+12,v:aim*(235+volleyPhase*15),life:2.6,parry:volleyPhase>0});
      if(volleyPhase>=2) hazards.push({x:boss.x+aim*44,y:boss.y-42,v:aim*220,life:2.6});
      if (guardian.pattern==='barrage') hazards.push({x:boss.x+aim*44,y:boss.y-55,v:aim*200,life:2.6});
      boss.nextShot=t+(volleyPhase ? 1.14-volleyPhase*.18 : 1.55);
    }
    boss.warning=(['volley','sweep','barrage'].includes(guardian.pattern) && boss.nextShot-t<.3) || (guardian.pattern==='charge' && cycle>.68 && cycle<1);
    const shielded=guardian.pattern==='charge' && cycle>=1 && cycle<2;
    const attack=attacks.find(a=>a.life>0 && close(a,boss,49+(a.radius||0),42));
    const stomp=close(p,boss,47,52) && p.vy>70 && (oldY<boss.y-18 || p.pogo);
    if (!shielded && !boss.grace && (attack || stomp)) {
      boss.health=Math.max(0,boss.health-(attack?.damage||1));
      boss.grace=.65;
      burst(boss.x,boss.y,'#ffd08a',boss.health?12:22);
      if (attack) attack.life=0;
      if (stomp) {p.vy=p.pogo?-510:-375;p.pogo=false;p.on=false;}
      status(boss.health ? guardian.name+' · '+boss.health+' hits left.' : guardian.name+' cleared. Reach the exit.');
    } else if (close(p,boss,44,42)) hit();
  }
  // Keep ground enemies anchored to a real ledge and inside its safe patrol
  // bounds. Airborne enemy patterns intentionally retain their flight paths.
  const flyingFoes=['swoop','school'].includes(enemyPattern);
  for(const foe of enemies){
    if(flyingFoes) continue;
    const supports=platforms.filter(ledge=>
      !['hazard','rail','ceiling','ceilingSpikes','current'].includes(ledge.kind) &&
      foe.x>=ledge.x+12 && foe.x<=ledge.x+ledge.w-12 &&
      Math.abs((ledge.y-23)-foe.y)<28
    ).sort((a,b)=>Math.abs(a.y-23-foe.y)-Math.abs(b.y-23-foe.y));
    const ledge=supports[0];
    if(ledge){
      foe.y=ledge.y-23;
      foe.patrolLeft=ledge.x+17;
      foe.patrolRight=ledge.x+ledge.w-17;
    } else if(Math.abs(foe.y-(ground-23))<35){
      foe.y=ground-23;
      foe.patrolLeft=Math.max(30,foe.x-48);
      foe.patrolRight=Math.min(finish+770,foe.x+48);
    }
  }
  function foePosition(foe) {
    if(foe.bashed && clock<foe.bashed.until){
      const t=.48-(foe.bashed.until-clock);
      return {x:foe.bashed.x+foe.bashed.vx*t,y:foe.bashed.y+foe.bashed.vy*t};
    }
    if (foe.turret) return {x:foe.x,y:foe.y};
    const patrolX=x=>foe.patrolLeft===undefined ? x :
      Math.max(foe.patrolLeft,Math.min(foe.patrolRight,x));
    const t = clock * (2 / cadence) + foe.offset;
    const chase = Math.sign(player.x-foe.x);
    const wave = Math.sin(t*2.1);
    switch (enemyPattern) {
      case 'turret': return {x:foe.x,y:foe.y};
      case 'charge': return {x:patrolX(foe.x+chase*Math.max(0,wave)*96),y:foe.y};
      case 'hopper': return {x:patrolX(foe.x+wave*24),y:foe.y-Math.max(0,Math.sin(t*3.5))*63};
      case 'swoop': return {x:foe.x+wave*78,y:foe.y-50-Math.cos(t*2.1)*42};
      case 'school': return {x:foe.x+wave*55,y:foe.y-33-Math.sin(t*3)*27};
      case 'pursuit': return {x:patrolX(foe.x+chase*(32+wave*36)),y:foe.y-12};
      case 'rhythm': return {x:patrolX(foe.x+Math.round(wave)*34),y:foe.y-Math.max(0,wave)*30};
      default: return {x:patrolX(foe.x+wave*34),y:foe.y};
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
  const terrainCells={floor:0,ice:1,belt:2,shelf:3,hazard:4,spring:5,lift:6,barrel:7,rail:8,pogo:10,drop:11,ceiling:12,current:13};
  const stageSurfaces={
    4:{barrel:2},5:{ice:3},8:{hazard:4},12:{pogo:1},13:{drop:0},
    17:{ice:3},18:{hazard:4},22:{pogo:1,ice:3},23:{floor:5,current:6}
  };
  const guardianCells={0:0,12:1,16:2,19:3,21:4,24:5};
  function castShadow(x,y,radius) {
    let surface=Infinity;
    for(const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if(ledge.switchBridge && !amberSwitch) continue;
      if(ledge.dropAt!==undefined && clock>=ledge.dropAt) continue;
      if(ledge.kind==='hazard'||ledge.kind==='ceilingSpikes'||ledge.kind==='rail'||ledge.kind==='ceiling') continue;
      if(x>=ledge.x && x<=ledge.x+ledge.w && ledge.y>=y) surface=Math.min(surface,ledge.y);
    }
    // No surface below the actor means no floating shadow. Shadows remain
    // on the actual platform top, fading and softening with jump height.
    if(!Number.isFinite(surface))return;
    const distance=Math.max(0,surface-y);
    if(distance>115)return;
    ctx.save();
    const fade=Math.max(0,1-distance/125);
    const spread=radius+distance*.085;
    const thickness=4+distance*.025;
    const centerX=x+distance*.11;
    const centerY=surface-1;
    const shadow=ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,spread);
    shadow.addColorStop(0,'rgba(7,9,22,'+(.43*fade).toFixed(3)+')');
    shadow.addColorStop(.52,'rgba(7,9,22,'+(.22*fade).toFixed(3)+')');
    shadow.addColorStop(1,'rgba(7,9,22,0)');
    ctx.translate(centerX,centerY);
    ctx.scale(1,thickness/spread);
    ctx.fillStyle=shadow;
    ctx.beginPath();
    ctx.arc(0,0,spread,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  const atmosphere = {
    1:['#ffe1a3',-5,-5],3:['#fbdb89',-30,-6],4:['#d2ed94',8,12],
    9:['#ffd3a5',9,-5],10:['#ffe2a5',18,-6],11:['#c9ddff',25,-9],
    14:['#a7c4ff',-6,5],15:['#aafad0',6,-9],18:['#ffd5a0',21,3],
    21:['#c4b4ff',-8,-5],23:['#ffe0b5',12,10],
    0:['#ffc06d',-17,13],2:['#91e9ff',-20,-13],5:['#e4f3ff',11,18],
    6:['#ffd791',8,-12],7:['#d4a0ff',-9,-8],8:['#fd9cff',16,-7],
    12:['#abdfff',23,12],13:['#ffcc87',19,15],16:['#ffbd79',9,-17],
    17:['#e3f0ff',13,19],19:['#92ebff',-13,-14],20:['#fd86de',32,-9],
    22:['#d3ff96',7,-8],24:['#a5d7ff',-11,10]
  }[index];
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const worldLight=ctx.createRadialGradient(236,78,30,236,78,440);
  worldLight.addColorStop(0,atmosphere[0]+'32');
  worldLight.addColorStop(1,atmosphere[0]+'00');
  const sceneHaze=ctx.createLinearGradient(0,0,0,height);
  sceneHaze.addColorStop(0,'#17133712');
  sceneHaze.addColorStop(.67,'#10152a08');
  sceneHaze.addColorStop(1,'#070b1c99');
  function drawAtmosphere(foreground) {
    if(reducedMotion) return;
    const [color, drift, rise]=atmosphere;
    ctx.save();
    ctx.fillStyle=color;
    const count=foreground?9:17;
    for(let i=0;i<count;i++){
      const seed=i+(foreground?19:0);
      const x=((seed*137+clock*drift-camera*(foreground ? .72 : .36))%width+width)%width;
      const y=((seed*73+clock*rise)%height+height)%height;
      const radius=foreground?2+seed%3:1+seed%2;
      ctx.globalAlpha=(foreground ? .18 : .34)*( .65+.35*Math.sin(clock*1.8+seed));
      ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  // Moonlit Library's six chapters use different structural materials.
  const libraryPlatforms = [
    ['#32475b','#182638','#94c6d4','#506e81',52,'rivets'],
    ['#3b6175','#172f4a','#b5f7ff','#6599b9',42,'ice'],
    ['#655640','#302634','#f4ce87','#a77b48',60,'braces'],
    ['#48425e','#221b37','#d6a7ff','#8671ac',46,'conduits'],
    ['#604236','#2d242d','#e9af74','#99674d',38,'sleepers'],
    ['#285457','#142b36','#88ecd7','#4b9e98',58,'grates']
  ];
  function drawLibraryPlatform({x,y,w}) {
    const stage=Math.min(libraryPlatforms.length-1,Math.floor(x/sectionSize));
    const [face,shadow,rim,trim,spacing,detail]=libraryPlatforms[stage];
    const depth=y>=ground?height-y:22;
    const material=ctx.createLinearGradient(0,y,0,y+depth);
    material.addColorStop(0,face);
    material.addColorStop(1,shadow);
    ctx.fillStyle=material;
    ctx.fillRect(x,y,w,depth);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x,y,w,height-y);
    ctx.clip();
    if(y<ground) {
      // Recessed pilings visually join static ledges to the scenery below.
      ctx.fillStyle=shadow;
      for(let post=x+Math.min(12,w/4);post<x+w;post+=Math.max(58,spacing*2)) {
        ctx.fillRect(post,y+depth,11,height-y-depth);
        ctx.fillStyle=trim;
        ctx.fillRect(post,y+depth,2,height-y-depth);
        ctx.fillStyle=shadow;
      }
    }
    ctx.fillStyle=rim;
    ctx.fillRect(x,y,w,2);
    ctx.fillStyle=trim;
    ctx.fillRect(x,y+5,w,2);
    for(let left=x+8;left<x+w;left+=spacing) {
      ctx.fillStyle=shadow;
      ctx.fillRect(left,y+9,spacing-14,10);
      ctx.strokeStyle=trim;
      ctx.fillStyle=rim;
      if(detail==='rivets') {
        ctx.fillRect(left+4,y+12,3,3);
        ctx.fillRect(left+spacing-22,y+12,3,3);
      } else if(detail==='ice' || detail==='braces') {
        ctx.beginPath();
        ctx.moveTo(left+2,y+18);
        ctx.lineTo(left+spacing*.35,y+9);
        ctx.lineTo(left+spacing*.6,y+18);
        ctx.stroke();
      } else if(detail==='conduits') {
        ctx.fillRect(left+4,y+13,spacing-23,2);
      } else {
        for(let bar=left+4;bar<left+spacing-16;bar+=6) {
          ctx.fillRect(bar,y+11,detail==='grates'?1:3,6);
        }
      }
    }
    ctx.restore();
  }
  // Base material, recess, and edge highlight for each catalog entry.
  const courseMaterials = [
    ['#59404a','#21151e','#dda973'], // Ember Foundry
    ['#32475b','#182638','#94c6d4'], // Moonlit Library
    ['#974f68','#302747','#ffbaa8'], // Coral Courier
    ['#846244','#30242c','#f5ce86'], // Clocktower Relay
    ['#686940','#263625','#dce294'], // Seed Garden
    ['#517988','#203c54','#b5eafa'], // Waterfall Climb
    ['#993f52','#442542','#ffd291'], // Lantern Festival
    ['#5d4090','#272144','#dca3ff'], // Crystal Polarity
    ['#703471','#272049','#ff9fdf'], // Stage Beat
    ['#776660','#38343b','#e5bd91'], // Quarry Rescue
    ['#9c6247','#4d3138','#ffca88'], // Sunset Wind Sail
    ['#777eac','#343558','#e4e8ff'], // Cloud City
    ['#465c6c','#232d48','#9fdbeb'], // Thunder Harbor
    ['#95573b','#4e302e','#ffba6d'], // Autumn Trail
    ['#484f82','#242142','#b7c7ff'], // Inverted Observatory
    ['#658155','#303d29','#c5eaa6'], // Bamboo Village
    ['#865a48','#382833','#ffb776'], // Steamworks
    ['#5b7896','#2a3b58','#e2f2ff'], // Snow Village
    ['#a16649','#4f332f','#ffd1a3'], // Canyon Crossing
    ['#356979','#19384b','#91e8df'], // Submarine Dock
    ['#553c79','#201736','#ff8ce1'], // Neon Circuit
    ['#777493','#35334d','#e0cdeb'], // Marble Temple
    ['#526948','#293e38','#c6ec85'], // Swamp Ferry
    ['#a77b43','#4d422b','#ffe3a1'], // Sunflower Flight
    ['#4e6488','#252d46','#b0ddff']  // Starship Cargo
  ];
  // Change the construction pattern as well as the color of the panels.
  const chapterPanels = [
    [44,18,0], [65,23,1], [34,16,2],
    [76,26,3], [52,20,4], [88,30,5]
  ];
  function drawCoursePlatform({x,y,w}) {
    const [face,recess,rim]=courseMaterials[index];
    const stage=Math.min(chapterPanels.length-1,Math.floor(x/sectionSize));
    const [spacing,thickness,pattern]=chapterPanels[stage];
    const depth=y>=ground?height-y:thickness;
    const end=Math.min(x+w,camera+width);
    const first=x+Math.max(0,Math.floor((camera-x)/spacing))*spacing;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x,y,w,height-y);
    ctx.clip();
    if(y<ground) {
      ctx.globalAlpha=.65;
      for(let panel=first;panel<end;panel+=spacing) {
        ctx.fillStyle=recess;
        ctx.fillRect(panel+5,y+depth,10,height-y-depth);
        ctx.fillStyle=face;
        ctx.fillRect(panel+5,y+depth,3,height-y-depth);
      }
      ctx.globalAlpha=1;
    }
    const surface=ctx.createLinearGradient(0,y,0,y+depth);
    surface.addColorStop(0,face);
    surface.addColorStop(1,recess);
    ctx.fillStyle=surface;
    ctx.fillRect(x,y,w,depth);
    ctx.fillStyle=rim;
    ctx.fillRect(x,y,w,2);
    for(let panel=first;panel<end;panel+=spacing) {
      const left=panel+6;
      ctx.fillStyle=recess;
      ctx.fillRect(left,y+6,spacing-12,depth-9);
      ctx.fillStyle=rim;
      ctx.strokeStyle=rim;
      ctx.globalAlpha=.55;
      switch(pattern) {
        case 0:
          ctx.fillRect(left+3,y+9,3,3);
          ctx.fillRect(left+spacing-19,y+9,3,3);
          break;
        case 1:
        case 3:
          ctx.beginPath();
          ctx.moveTo(left+3,y+depth-5);
          ctx.lineTo(left+spacing/2-6,y+8);
          ctx.lineTo(left+spacing-15,y+depth-5);
          if(pattern===3) ctx.closePath();
          ctx.stroke();
          break;
        case 2:
          for(let rib=4;rib<spacing-13;rib+=5) ctx.fillRect(left+rib,y+8,2,depth-13);
          break;
        case 4:
          ctx.fillRect(left+5,y+9,spacing-22,2);
          ctx.fillRect(left+5,y+13,spacing-22,1);
          break;
        case 5:
          ctx.strokeRect(left+6,y+9,spacing-24,depth-15);
          ctx.fillRect(left+spacing/2-7,y+12,3,depth-21);
          break;
      }
      ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  // Choose silhouette families in the same order as the game catalog.
  const sceneryShapes = [
    'works','works','reef','works','grove','ridge','works','ridge','works',
    'ridge','ridge','ridge','works','grove','works','grove','works','ridge',
    'ridge','reef','works','works','grove','grove','works'
  ];
  // Three independent parallax planes, tuned per adventure and chapter.
  // Background scenery never changes collision or platform geometry.
  const sceneryLayers = [
    {speed:.105, baseline:270, spacing:170, scale:.48, opacity:.18},
    {speed:.24, baseline:310, spacing:118, scale:.72, opacity:.32},
    {speed:.49, baseline:372, spacing:150, scale:1, opacity:.64}
  ];
  function stageSceneryLayer(layer, plane) {
    const stage=Math.min(sections-1,Math.max(0,chapter));
    const seed=(index*37+stage*19+plane*11)%17;
    return {
      ...layer,
      spacing:layer.spacing+seed*3,
      baseline:layer.baseline+(seed%5-2)*4,
      scale:layer.scale*(.94+(seed%6)*.025),
      opacity:layer.opacity*(.93+(seed%4)*.035)
    };
  }
  function drawSceneryLayer({speed,baseline,spacing,scale,opacity}) {
    const shift=camera*speed;
    const first=Math.floor(shift/spacing)-1;
    const [face,recess,rim]=courseMaterials[index];
    ctx.save();
    ctx.globalAlpha=opacity;
    const shade=ctx.createLinearGradient(0,baseline-125,0,height);
    shade.addColorStop(0,face);
    shade.addColorStop(.88,recess);
    ctx.fillStyle=shade;
    ctx.strokeStyle=rim;
    ctx.lineWidth=1;
    for(let tile=first;tile<=first+Math.ceil(width/spacing)+2;tile++) {
      const x=tile*spacing-shift;
      const rise=(47+Math.abs((tile*73+index*31)%79))*scale;
      const top=baseline-rise;
      ctx.beginPath();
      ctx.moveTo(x,baseline);
      switch(sceneryShapes[index]) {
        case 'works':
          ctx.lineTo(x+12,top+26);
          ctx.lineTo(x+spacing*.25,top+26);
          ctx.lineTo(x+spacing*.25,top);
          ctx.lineTo(x+spacing*.57,top);
          ctx.lineTo(x+spacing*.57,top+17);
          ctx.lineTo(x+spacing*.82,top+17);
          ctx.lineTo(x+spacing,baseline);
          break;
        case 'grove':
          ctx.bezierCurveTo(x+18,top+65,x-4,top+13,x+spacing*.32,top+9);
          ctx.bezierCurveTo(x+spacing*.57,top-18,x+spacing*.86,top+8,x+spacing*.86,top+33);
          ctx.quadraticCurveTo(x+spacing*.98,top+48,x+spacing,baseline);
          break;
        case 'reef':
          ctx.bezierCurveTo(x+5,top+46,x+spacing*.18,top+16,x+spacing*.32,top+30);
          ctx.bezierCurveTo(x+spacing*.49,top+54,x+spacing*.49,top-24,x+spacing*.72,top+7);
          ctx.quadraticCurveTo(x+spacing*.9,top+18,x+spacing,baseline);
          break;
        default:
          ctx.lineTo(x+spacing*.29,top+25);
          ctx.lineTo(x+spacing*.52,top);
          ctx.lineTo(x+spacing*.79,top+30);
          ctx.lineTo(x+spacing,baseline);
      }
      ctx.fill();
      ctx.globalAlpha=opacity*.34;
      ctx.stroke();
      ctx.globalAlpha=opacity;
    }
    ctx.restore();
  }
  // Small deterministic stage-specific surface accents. Draw-only; no collision changes.
  function drawPlatformAccents({x,y,w,kind}) {
    if(w<34 || kind==='hazard' || kind==='ceilingSpikes') return;
    const stage=Math.min(sections-1,Math.max(0,Math.floor(x/sectionSize)));
    const [face,recess,rim]=courseMaterials[index];
    const motif=(index*7+stage*3)%5;
    const pitch=motif===0?38:motif===1?48:motif===2?57:motif===3?43:65;
    const first=Math.ceil((Math.max(x,camera-15)-x)/pitch);
    const last=Math.min(Math.floor(w/pitch),Math.ceil((camera+width-x)/pitch));
    ctx.save();
    ctx.beginPath();ctx.rect(x,y-8,w,15);ctx.clip();
    ctx.strokeStyle=rim;ctx.fillStyle=face;ctx.lineWidth=1.4;
    for(let k=first;k<=last;k++){
      const px=x+k*pitch+pitch*.38;
      if(px>x+w-9) continue;
      const seed=(k*13+index*17+stage*29)%7;
      if(motif===0){ // carved stone blocks
        ctx.globalAlpha=.48;ctx.strokeRect(px,y-4,14,5);
      } else if(motif===1){ // metal rivets
        ctx.globalAlpha=.68;ctx.beginPath();ctx.arc(px,y-1,1.8,0,Math.PI*2);ctx.fill();
      } else if(motif===2){ // crystal seams
        ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(px,y-5);ctx.lineTo(px+4,y-2);ctx.lineTo(px,y+1);ctx.stroke();
      } else if(motif===3){ // leaf/wood grain
        ctx.globalAlpha=.5;ctx.beginPath();ctx.ellipse(px,y-2,5,1.8,-.25,0,Math.PI*2);ctx.stroke();
      } else { // alternating inset tile caps
        ctx.globalAlpha=.45;ctx.fillRect(px,y-3,7+seed,2);
      }
    }
    ctx.restore();
    // Readable three-dimensional cap: visible upper face, bright near lip,
    // and a dark contact seam. Restrict it to the top 8px so gameplay
    // collision and platform dimensions remain exactly unchanged.
    ctx.save();
    ctx.globalAlpha=.74;
    const cap=ctx.createLinearGradient(0,y-8,0,y+2);
    cap.addColorStop(0,rim);
    cap.addColorStop(.52,face);
    cap.addColorStop(1,recess);
    ctx.fillStyle=cap;
    ctx.beginPath();
    ctx.moveTo(x+5,y-8);
    ctx.lineTo(x+w-5,y-8);
    ctx.lineTo(x+w,y-2);
    ctx.lineTo(x,y-2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha=.85;
    ctx.strokeStyle=rim;
    ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.moveTo(x+5,y-7);
    ctx.lineTo(x+w-5,y-7);
    ctx.stroke();
    ctx.globalAlpha=.45;
    ctx.strokeStyle=recess;
    ctx.beginPath();
    ctx.moveTo(x,y+1);
    ctx.lineTo(x+w,y+1);
    ctx.stroke();
    // Each of the 25 games has a distinct, repeatable top-surface marking.
    // The marking stays inside the platform art, never changing collision.
    const markings=['brick','circuit','coral','speed','wood','cloud','star','gravity','beat','cable','wind','snow','rune','leaf','orbit','glow','gear','mosaic','sand','hazard','chevron','gothic','wave','petal','hull'];
    const marking=markings[index]||'brick';
    const interval=marking==='beat'?22:marking==='speed'?36:marking==='hull'?54:46;
    const start=Math.max(0,Math.floor((camera-x)/interval)-1);
    const end=Math.min(Math.ceil(w/interval),Math.ceil((camera+width-x)/interval)+1);
    ctx.save();
    ctx.beginPath();ctx.rect(x+3,y-7,w-6,5);ctx.clip();
    ctx.strokeStyle=rim;ctx.fillStyle=rim;ctx.lineWidth=1.15;ctx.globalAlpha=.7;
    for(let n=start;n<=end;n++){
      const mx=x+n*interval+interval*.5;
      if(mx<x+8||mx>x+w-8)continue;
      ctx.beginPath();
      if(['circuit','gravity','orbit','hull','gear'].includes(marking)){
        ctx.arc(mx,y-4.5,marking==='orbit'?3:2,0,Math.PI*2);
        ctx.stroke();
        if(marking==='circuit'||marking==='hull'){
          ctx.moveTo(mx+4,y-4.5);ctx.lineTo(mx+12,y-4.5);ctx.stroke();
        }
      }else if(['leaf','petal','coral','wood','wind','wave','cloud','snow'].includes(marking)){
        ctx.ellipse(mx,y-4.5,marking==='petal'?5:7,1.7,n%2?.35:-.35,0,Math.PI*2);
        ctx.stroke();
      }else if(['speed','beat','chevron','hazard','cable'].includes(marking)){
        ctx.moveTo(mx-4,y-6);ctx.lineTo(mx+2,y-3);ctx.lineTo(mx+7,y-6);ctx.stroke();
      }else{
        ctx.moveTo(mx-4,y-6);ctx.lineTo(mx,y-3);ctx.lineTo(mx+4,y-6);ctx.closePath();ctx.stroke();
      }
    }
    ctx.restore();
    // Angled end bevels make the platform's thickness legible while
    // remaining strictly decorative. Keep them within the existing cap.
    ctx.globalAlpha=.7;
    ctx.fillStyle=recess;
    ctx.beginPath();
    ctx.moveTo(x,y-2);
    ctx.lineTo(x+5,y-8);
    ctx.lineTo(x+5,y-2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x+w,y-2);
    ctx.lineTo(x+w-5,y-8);
    ctx.lineTo(x+w-5,y-2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Twenty platform constructions, distributed deterministically across each
  // game's six regions. Decorations are clipped to the solid face and do not
  // modify platform positions, hitboxes, or movement behavior.
  function drawPlatformConstruction(ledge,depth) {
    const {x,y,w,kind}=ledge;
    if(w<22 || depth<10 || kind==='hazard' || kind==='ceilingSpikes') return;
    const stage=Math.min(sections-1,Math.max(0,Math.floor(x/sectionSize)));
    // Reference-inspired construction families (not copied sprites or layouts).
    // Each adventure has its own palette of platform motifs, based on the
    // movement challenges and setting of its named gameplay inspiration.
    const platformFamilies = [
      [0,4,9,12,15,18],   // Mario: masonry, arches, outdoor ledges
      [1,5,6,11,16,19],  // Mega Man X: industrial/technical
      [2,10,12,15,17],   // Ecco: reef, waves, coral/crystal
      [1,5,7,11,16,18],  // Sonic: mechanical ramps and bridges
      [3,5,8,9,15,18],   // DKC: timber, jungle and rope supports
      [2,9,12,15,17],    // Rayman: fantasy platforms
      [4,10,12,14,17],   // Kirby: playful rounded motifs
      [2,11,13,16,19],   // VVVVVV: gravity circuitry
      [1,4,11,16,19],    // Geometry Dash: rhythmic geometric panels
      [0,5,6,13,18],    // Bionic Commando: quarry beams
      [3,9,10,12,15],   // Klonoa: wind and wooden decks
      [2,9,12,15,17],   // Celeste: climbing cliffs
      [0,1,5,13,17],    // Shovel Knight: armored stonework
      [3,8,10,15,18],   // Yoshi: nature and trails
      [1,2,11,16,19],   // Metroid: observatory tech
      [3,8,9,15,17],    // Ori: luminous woodland
      [1,5,7,11,19],    // Cuphead: factory machinery
      [0,3,9,12,18],    // Aladdin: village rooftops
      [0,5,12,13,14],   // Prince of Persia: palace stone
      [1,5,6,11,16],    // Contra: military docks
      [1,4,7,11,19],    // Pizza Tower: frantic arcade machinery
      [0,12,13,14,17],  // Castlevania: temple architecture
      [3,8,10,15,18],   // DuckTales: wooden ferry
      [3,8,9,15,17],    // flower flight: organic platforms
      [1,5,6,11,16,19]  // starship cargo: modular hulls
    ];
    const family=platformFamilies[index] || platformFamilies[0];
    // Individual games have different construction cadence, not merely colors.
    const gamePitch=[113,89,137,73,131,109,127,83,61,149,107,97,101,139,79,151,67,103,157,71,59,163,137,127,73][index];
    const placement=Math.floor(x/gamePitch);
    const kindOffset=({floor:0,drop:1,barrel:2,pogo:3,ice:4,rail:5,shelf:6,spring:7,belt:8,lift:9,current:10,ceiling:11})[kind]||0;
    const model=family[((placement*(index%4+1)+stage*(index%5+2)+kindOffset)%family.length+family.length)%family.length];
    const [face,recess,rim]=courseMaterials[index];
    const faceDepth=Math.min(depth,kind==='floor'?62:29);
    const pitch=24+(model%5)*9;
    const first=Math.max(0,Math.floor((camera-x)/pitch)-1);
    const last=Math.min(Math.ceil(w/pitch),Math.ceil((camera+width-x)/pitch)+1);
    ctx.save();
    ctx.beginPath();ctx.rect(x,y,w,faceDepth);ctx.clip();
    ctx.lineWidth=1.5;
    ctx.strokeStyle=rim;
    ctx.fillStyle=rim;
    ctx.globalAlpha=.46;
    for(let n=first;n<=last;n++){
      const px=x+n*pitch, py=y+5, mid=px+pitch*.5;
      switch(model){
        case 0: ctx.strokeRect(px+2,py,pitch-5,faceDepth-10);break; // masonry
        case 1: ctx.beginPath();ctx.arc(mid,py+7,4,0,7);ctx.stroke();break; // rivets
        case 2: ctx.beginPath();ctx.moveTo(px+2,py+13);ctx.lineTo(mid,py);ctx.lineTo(px+pitch-2,py+13);ctx.stroke();break; // crystals
        case 3: ctx.beginPath();ctx.ellipse(mid,py+7,11,3,-.3,0,7);ctx.stroke();break; // timber
        case 4: ctx.fillRect(px+3,py,pitch-6,3);break; // tiles
        case 5: ctx.beginPath();ctx.moveTo(px,py+18);ctx.lineTo(mid,py+3);ctx.lineTo(px+pitch,py+18);ctx.stroke();break; // truss
        case 6: ctx.strokeRect(px+5,py+4,pitch-10,9);break; // cargo
        case 7: ctx.beginPath();ctx.arc(mid,py+10,7,0,7);ctx.stroke();break; // gear
        case 8: ctx.fillRect(px+5,py+3,3,17);ctx.fillRect(px+13,py+3,3,17);break; // bamboo
        case 9: ctx.beginPath();ctx.moveTo(px+3,py+18);ctx.lineTo(mid,py+1);ctx.lineTo(px+pitch-3,py+18);ctx.closePath();ctx.stroke();break; // peaks
        case 10: ctx.beginPath();ctx.moveTo(px+4,py+5);ctx.lineTo(mid,py+14);ctx.lineTo(px+pitch-4,py+5);ctx.stroke();break; // waves
        case 11: ctx.fillRect(px+3,py+3,pitch-6,2);ctx.fillRect(px+8,py+10,pitch-16,2);break; // circuit
        case 12: ctx.beginPath();ctx.arc(mid,py+9,8,Math.PI,0);ctx.stroke();break; // arches
        case 13: ctx.beginPath();ctx.moveTo(px+4,py+4);ctx.lineTo(px+pitch-4,py+16);ctx.moveTo(px+4,py+16);ctx.lineTo(px+pitch-4,py+4);ctx.stroke();break; // braces
        case 14: ctx.fillRect(mid-2,py,4,18);ctx.fillRect(mid-9,py+7,18,3);break; // carved crosses
        case 15: ctx.beginPath();ctx.moveTo(px+3,py+13);ctx.quadraticCurveTo(mid,py-5,px+pitch-3,py+13);ctx.stroke();break; // vines
        case 16: ctx.strokeRect(px+3,py+3,pitch-6,13);ctx.fillRect(mid-2,py+7,4,4);break; // panels
        case 17: ctx.beginPath();ctx.moveTo(px+3,py+14);ctx.lineTo(mid,py+2);ctx.lineTo(px+pitch-3,py+14);ctx.stroke();ctx.fillRect(mid-2,py+5,4,4);break; // gemstones
        case 18: ctx.fillRect(px+3,py+4,pitch-6,2);ctx.fillRect(px+3,py+12,pitch-6,2);break; // layered beams
        case 19: ctx.beginPath();ctx.arc(mid,py+9,8,0,7);ctx.arc(mid,py+9,3,0,7);ctx.stroke();break; // coils
      }
    }
    ctx.restore();
  }
  function drawLandingEdge({x,y,w}) {
    const rim=courseMaterials[index][2];
    // Two tones keep the landing line visible against both bright and dark scenery.
    ctx.fillStyle='#10101d';
    ctx.fillRect(x-1,y-2,w+2,8);
    // A slim perspective top face makes the landing surface readable without
    // changing the platform collision geometry or obscuring the character.
    const topDepth=Math.min(9,Math.max(3,w*.035));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+Math.min(7,w*.08),y-topDepth);
    ctx.lineTo(x+w-Math.min(7,w*.08),y-topDepth);
    ctx.lineTo(x+w,y);
    ctx.closePath();
    const topLight=ctx.createLinearGradient(0,y-topDepth,0,y+2);
    topLight.addColorStop(0,'rgba(255,255,255,.36)');
    topLight.addColorStop(1,'rgba(255,255,255,.09)');
    ctx.fillStyle=topLight;
    ctx.fill();
    ctx.restore();
    ctx.fillStyle=rim;
    ctx.fillRect(x,y,w,3);
    ctx.fillStyle='#fff6dd';
    ctx.fillRect(x,y,Math.min(7,w),3);
    ctx.fillRect(x+Math.max(0,w-7),y,Math.min(7,w),3);
    drawPlatformAccents({x,y,w,kind:'landing'});
  }
  // Individually authored environmental silhouettes for the first two games.
  // Decorative only: no collision, spawn, or camera changes.
  function drawSignatureBackdrop(){
    if(index<0 || index>24)return;
    const spacing=[230,188,205,178,226,196,218,174,156,232,240,190,214,224,202,228,210,236,246,216,170,226,220,214,206][index];
    const shift=camera*([.22,.16,.19,.27,.14,.24,.18,.29,.31,.17,.20,.13,.26,.15,.12,.18,.23,.14,.21,.17,.32,.12,.16,.20,.27][index]);
    const start=Math.floor(shift/spacing)-1;
    ctx.save();
    for(let n=start;n<start+Math.ceil(width/spacing)+3;n++){
      const x=n*spacing-shift;
      const variation=((n*17+29)%5+5)%5;
      if(index===0){
        // Ember Foundry: layered brick smokestacks and glowing furnace windows.
        const top=114+variation*13;
        const stackWidth=31+variation*3;
        ctx.fillStyle='#291d32';
        ctx.fillRect(x+50,top,stackWidth,270-top);
        ctx.fillStyle='#5b3341';
        ctx.fillRect(x+46,top-8,stackWidth+8,10);
        ctx.fillStyle='#ad5b49';
        for(let row=0;row<4;row++){
          ctx.globalAlpha=.38;
          ctx.fillRect(x+52,top+15+row*21,stackWidth-4,2);
        }
        ctx.globalAlpha=.8;
        ctx.fillStyle='#ffa34d';
        for(let row=0;row<3;row++){
          ctx.fillRect(x+59,210+row*21,8,10);
        }
        ctx.globalAlpha=.18;
        ctx.fillStyle='#f8a35d';
        ctx.beginPath();ctx.ellipse(x+64,245,42,60,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }else if(index===1){
        // Moonlit Library: staggered book towers, arched windows and moonlit spires.
        const top=83+variation*16;
        ctx.fillStyle='#252943';
        ctx.fillRect(x+38,top,83,275-top);
        ctx.fillStyle='#444567';
        ctx.beginPath();
        ctx.moveTo(x+28,top+4);ctx.lineTo(x+79,top-31);
        ctx.lineTo(x+130,top+4);ctx.closePath();ctx.fill();
        for(let row=0;row<3;row++){
          const wy=top+31+row*45;
          ctx.fillStyle='#171e3a';
          ctx.beginPath();ctx.arc(x+79,wy,12,Math.PI,0);
          ctx.lineTo(x+91,wy+21);ctx.lineTo(x+67,wy+21);ctx.closePath();ctx.fill();
          ctx.fillStyle='#b6a4dd';
          ctx.globalAlpha=.55;
          ctx.fillRect(x+77,wy,4,19);
          ctx.globalAlpha=1;
        }
        ctx.fillStyle='#7176a5';
        ctx.fillRect(x+77,top-48,4,18);
      }else if(index===2){
        // Coral Courier: original coral towers, underwater fans and bubbles.
        const seabed=288;
        ctx.fillStyle='#174c65';
        ctx.beginPath();ctx.ellipse(x+94,seabed,73,21,0,Math.PI,0);ctx.fill();
        ctx.strokeStyle=variation%2?'#f1a08c':'#77c9b9';
        ctx.lineWidth=8;ctx.lineCap='round';
        for(let branch=0;branch<4;branch++){
          const bx=x+58+branch*24;
          const rise=58+(variation*11+branch*17)%55;
          ctx.beginPath();
          ctx.moveTo(bx,seabed-5);
          ctx.quadraticCurveTo(bx+10,seabed-rise*.5,bx+(branch%2?15:-12),seabed-rise);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(bx+4,seabed-rise*.5);
          ctx.lineTo(bx+22,seabed-rise*.68);
          ctx.stroke();
        }
        ctx.fillStyle='#9ce9f4';
        ctx.globalAlpha=.4;
        for(let bubble=0;bubble<5;bubble++){
          const by=185+bubble*19+(variation*7)%11;
          ctx.beginPath();ctx.arc(x+32+bubble*26,by,2+bubble%3,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }else if(index===3){
        // Clocktower Relay: original interlocking clock faces and gearwork.
        const cy=169+variation*13;
        const cx=x+86;
        ctx.fillStyle='#27344a';
        ctx.fillRect(x+65,cy,42,120);
        ctx.fillStyle='#485975';
        ctx.beginPath();ctx.arc(cx,cy,37,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#c7b079';ctx.lineWidth=4;
        ctx.beginPath();ctx.arc(cx,cy,30,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle='#e7d9b3';ctx.lineWidth=2;
        for(let tick=0;tick<12;tick++){
          const a=tick*Math.PI/6;
          ctx.beginPath();
          ctx.moveTo(cx+Math.sin(a)*24,cy-Math.cos(a)*24);
          ctx.lineTo(cx+Math.sin(a)*28,cy-Math.cos(a)*28);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx+12,cy-15);
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx-5,cy-20);
        ctx.stroke();
        ctx.fillStyle='#d6b67a';
        ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fill();
      }else if(index===4){
        // Seed Garden: broad trunks, branching boughs, and layered seed pods.
        const trunkX=x+95, crownY=123+variation*10;
        ctx.fillStyle='#38513e';
        ctx.beginPath();ctx.moveTo(trunkX-13,292);ctx.lineTo(trunkX-9,crownY+22);
        ctx.lineTo(trunkX+10,crownY+22);ctx.lineTo(trunkX+17,292);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#476c4b';ctx.lineWidth=9;ctx.lineCap='round';
        for(let b=0;b<3;b++){
          const side=b%2?-1:1;
          ctx.beginPath();ctx.moveTo(trunkX,crownY+78-b*18);
          ctx.quadraticCurveTo(trunkX+side*31,crownY+24-b*12,trunkX+side*(43+b*5),crownY+18-b*11);
          ctx.stroke();
        }
        for(let leaf=0;leaf<8;leaf++){
          const a=leaf*Math.PI*.75;
          const lx=trunkX+Math.cos(a)*(32+leaf%3*8);
          const ly=crownY+Math.sin(a)*24;
          ctx.fillStyle=leaf%2?'#6eac6a':'#8bc279';
          ctx.globalAlpha=.8;
          ctx.beginPath();ctx.ellipse(lx,ly,23,13,a*.4,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
        ctx.fillStyle='#e7bd75';
        for(let seed=0;seed<3;seed++){
          ctx.beginPath();ctx.ellipse(trunkX-23+seed*22,crownY+22+seed%2*9,3,5,.3,0,Math.PI*2);ctx.fill();
        }
      }else if(index===5){
        // Waterfall Climb: terraced stone cliffs and luminous falling water.
        const cliffTop=95+variation*19;
        ctx.fillStyle='#344c64';
        ctx.beginPath();ctx.moveTo(x+17,293);ctx.lineTo(x+17,cliffTop+26);
        ctx.lineTo(x+42,cliffTop+26);ctx.lineTo(x+42,cliffTop);
        ctx.lineTo(x+135,cliffTop);ctx.lineTo(x+135,293);ctx.closePath();ctx.fill();
        ctx.fillStyle='#5a7284';
        for(let ledge=0;ledge<3;ledge++)ctx.fillRect(x+28,cliffTop+21+ledge*37,90,5);
        ctx.fillStyle='#a6e8f3';ctx.globalAlpha=.72;
        const streamX=x+70+variation*4;
        ctx.fillRect(streamX,cliffTop+4,19,289-cliffTop);
        ctx.fillStyle='#e3fcff';ctx.globalAlpha=.65;
        for(let streak=0;streak<5;streak++){
          const sy=cliffTop+17+streak*39;
          ctx.fillRect(streamX+3+(streak%3)*5,sy,2,21);
        }
        ctx.globalAlpha=.45;
        ctx.beginPath();ctx.ellipse(streamX+9,287,29,7,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }else if(index===6){
        // Lantern Festival: suspended lanterns, curved festival roofs, and strings.
        const roofY=194+variation*12;
        ctx.fillStyle='#4c3154';
        ctx.fillRect(x+36,roofY+20,120,96);
        ctx.fillStyle='#ae6382';
        ctx.beginPath();ctx.moveTo(x+22,roofY+25);
        ctx.quadraticCurveTo(x+95,roofY-38,x+168,roofY+25);
        ctx.quadraticCurveTo(x+100,roofY+6,x+22,roofY+25);ctx.fill();
        ctx.strokeStyle='#d8a17d';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(x+4,110+variation*3);
        ctx.quadraticCurveTo(x+105,136,x+212,105+variation*3);ctx.stroke();
        for(let lamp=0;lamp<3;lamp++){
          const lx=x+38+lamp*63,ly=124+variation*3+lamp%2*8;
          ctx.strokeStyle='#e2b997';ctx.beginPath();ctx.moveTo(lx,ly-10);ctx.lineTo(lx,ly);ctx.stroke();
          ctx.fillStyle='#e5a95e';ctx.globalAlpha=.22;
          ctx.beginPath();ctx.arc(lx,ly+10,18,0,Math.PI*2);ctx.fill();
          ctx.globalAlpha=1;ctx.fillStyle=lamp%2?'#f4b961':'#f08d94';
          ctx.beginPath();ctx.ellipse(lx,ly+8,8,12,0,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#ffe4a0';ctx.fillRect(lx-3,ly+3,6,10);
          ctx.fillStyle='#b85465';ctx.fillRect(lx-5,ly+19,10,2);
        }
      }else if(index===7){
        // Crystal Polarity: opposing crystalline spires and electric bridges.
        const cx=x+84,top=89+variation*14;
        ctx.fillStyle='#39335e';
        ctx.beginPath();ctx.moveTo(cx-43,278);ctx.lineTo(cx-32,top+34);
        ctx.lineTo(cx,top);ctx.lineTo(cx+34,top+34);
        ctx.lineTo(cx+44,278);ctx.closePath();ctx.fill();
        ctx.fillStyle='#8e83ce';ctx.globalAlpha=.67;
        ctx.beginPath();ctx.moveTo(cx,top);ctx.lineTo(cx+34,top+34);
        ctx.lineTo(cx+44,278);ctx.lineTo(cx+6,260);ctx.closePath();ctx.fill();
        ctx.globalAlpha=1;
        ctx.strokeStyle='#9de8f4';ctx.lineWidth=2;
        for(let band=0;band<3;band++){
          const by=top+58+band*46;
          ctx.beginPath();ctx.moveTo(cx-32,by);
          ctx.lineTo(cx-10,by-7);ctx.lineTo(cx+12,by+6);
          ctx.lineTo(cx+35,by-2);ctx.stroke();
        }
        ctx.fillStyle='#c6b8f5';ctx.globalAlpha=.7;
        for(let shard=0;shard<4;shard++){
          const sx=x+16+shard*47,sy=208+(shard%2)*30;
          ctx.beginPath();ctx.moveTo(sx,sy-17);ctx.lineTo(sx+8,sy);
          ctx.lineTo(sx,sy+12);ctx.lineTo(sx-7,sy);ctx.closePath();ctx.fill();
        }
        ctx.globalAlpha=1;
      }else if(index===8){
        // Stage Beat: rhythmic light towers, equalizer bars and neon trims.
        const base=281, bx=x+24;
        ctx.fillStyle='#272340';
        ctx.fillRect(bx,135+variation*9,118,base-135-variation*9);
        for(let bar=0;bar<6;bar++){
          const h=28+((bar*23+variation*17)%72)*(reducedMotion?1:(.64+.36*Math.sin(clock*4.5+bar*.85+n*.7)**2));
          ctx.fillStyle=bar%2?'#ef78c6':'#7ce4ef';
          ctx.globalAlpha=.65;
          ctx.fillRect(bx+8+bar*18,base-18-h,10,h);
          ctx.globalAlpha=.22;
          ctx.fillRect(bx+8+bar*18,base-18-h,10,4);
        }
        ctx.globalAlpha=1;
        ctx.strokeStyle='#d98bfa';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(bx,base-12);ctx.lineTo(bx+118,base-12);ctx.stroke();
        ctx.fillStyle='#f4b2ff';
        for(let dot=0;dot<4;dot++){
          ctx.beginPath();ctx.arc(bx+13+dot*31,151+variation*9,3,0,Math.PI*2);ctx.fill();
        }
      }else if(index===9){
        // Quarry Rescue: cut-stone terraces, hoists, and suspended cargo.
        const top=127+variation*11;
        ctx.fillStyle='#514a4c';
        ctx.beginPath();ctx.moveTo(x+16,286);ctx.lineTo(x+16,top+47);
        ctx.lineTo(x+52,top+47);ctx.lineTo(x+52,top+20);
        ctx.lineTo(x+155,top+20);ctx.lineTo(x+155,286);ctx.closePath();ctx.fill();
        ctx.fillStyle='#80726a';
        for(let row=0;row<4;row++){
          const yy=top+38+row*32;
          ctx.fillRect(x+54,yy,95,3);
          ctx.fillRect(x+75+(row%2)*21,yy+3,3,26);
        }
        ctx.strokeStyle='#c5a97b';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(x+176,top-14);ctx.lineTo(x+176,top+104);ctx.stroke();
        ctx.fillStyle='#a68a64';
        ctx.fillRect(x+163,top+104,26,19);
        ctx.fillStyle='#d8c69d';
        ctx.fillRect(x+165,top+106,22,3);
        ctx.strokeStyle='#8f7b65';ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(x+125,top-18);ctx.lineTo(x+201,top-18);ctx.stroke();
      }else if(index===10){
        // Sunset Wind Sail: layered sailboats and wind-driven harbor pennants.
        const mastX=x+110,deckY=245+variation*5;
        ctx.fillStyle='#54425c';
        ctx.beginPath();ctx.moveTo(x+48,deckY);ctx.lineTo(x+175,deckY);
        ctx.lineTo(x+153,deckY+19);ctx.lineTo(x+75,deckY+19);
        ctx.closePath();ctx.fill();
        ctx.strokeStyle='#c4a58b';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(mastX,deckY);ctx.lineTo(mastX,94+variation*8);ctx.stroke();
        const sailTop=105+variation*8;
        const sail=ctx.createLinearGradient(mastX-53,sailTop,mastX+51,deckY);
        sail.addColorStop(0,'#ffe1ae');sail.addColorStop(1,'#eaa17c');
        ctx.fillStyle=sail;
        ctx.beginPath();ctx.moveTo(mastX-5,sailTop);
        ctx.quadraticCurveTo(mastX-63,deckY-76,mastX-54,deckY-13);
        ctx.lineTo(mastX-5,deckY-13);ctx.closePath();ctx.fill();
        ctx.fillStyle='#f5c8a1';
        ctx.beginPath();ctx.moveTo(mastX+5,sailTop+22);
        ctx.quadraticCurveTo(mastX+51,deckY-78,mastX+47,deckY-23);
        ctx.lineTo(mastX+5,deckY-23);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#e8b98b';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(x+18,deckY+26);ctx.quadraticCurveTo(x+110,deckY+18,x+210,deckY+26);ctx.stroke();
      }else if(index===11){
        // Cloud City: floating skyline silhouettes with suspended bridges.
        const towerTop=105+variation*19;
        ctx.fillStyle='#637b9b';
        ctx.fillRect(x+35,towerTop,74,280-towerTop);
        ctx.fillStyle='#a9c6d7';
        ctx.beginPath();ctx.moveTo(x+26,towerTop+6);ctx.lineTo(x+72,towerTop-30);
        ctx.lineTo(x+119,towerTop+6);ctx.closePath();ctx.fill();
        ctx.fillStyle='#daeaf2';ctx.globalAlpha=.75;
        for(let row=0;row<4;row++){
          const wy=towerTop+23+row*29;
          ctx.fillRect(x+49,wy,11,15);
          ctx.fillRect(x+81,wy,11,15);
        }
        ctx.globalAlpha=1;
        ctx.fillStyle='#748daa';
        ctx.fillRect(x+109,towerTop+90,85,9);
        ctx.strokeStyle='#d4e5ed';ctx.lineWidth=2;
        for(let cable=0;cable<3;cable++){
          const cx=x+117+cable*33;
          ctx.beginPath();ctx.moveTo(cx,towerTop+90);
          ctx.lineTo(cx,towerTop+34);ctx.stroke();
        }
        ctx.fillStyle='#e8f6ff';ctx.globalAlpha=.4;
        ctx.beginPath();ctx.ellipse(x+103,276,95,18,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }else if(index===12){
        // Thunder Harbor: stormproof docks, lightning rods, and wet cranes.
        const dockY=259, mastX=x+91;
        ctx.fillStyle='#34455c';
        ctx.fillRect(x+23,dockY-23,155,47);
        ctx.fillStyle='#69829b';
        for(let plank=0;plank<5;plank++)ctx.fillRect(x+28+plank*30,dockY-22,2,46);
        ctx.strokeStyle='#9fb9cb';ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(mastX,dockY-23);ctx.lineTo(mastX,94+variation*9);
        ctx.lineTo(mastX+71,94+variation*9);ctx.stroke();
        ctx.strokeStyle='#d2b78c';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(mastX+58,94+variation*9);ctx.lineTo(mastX+58,208);ctx.stroke();
        ctx.fillStyle='#d4b780';ctx.fillRect(mastX+43,208,31,19);
        ctx.fillStyle='#d4eafa';ctx.globalAlpha=.65;
        for(let bolt=0;bolt<3;bolt++){
          const bx=x+24+bolt*65,by=145+(bolt%2)*24;
          ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+7,by+13);
          ctx.lineTo(bx+2,by+13);ctx.lineTo(bx+13,by+27);ctx.stroke();
        }
        ctx.globalAlpha=1;
      }else if(index===13){
        // Autumn Trail: rolling woodland canopy and scattered golden leaves.
        const trunk=x+103,rootY=291,top=112+variation*10;
        ctx.fillStyle='#655044';ctx.fillRect(trunk-10,top+38,20,rootY-top-38);
        ctx.strokeStyle='#8c634b';ctx.lineWidth=6;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(trunk,top+100);ctx.lineTo(trunk-39,top+42);
        ctx.moveTo(trunk,top+87);ctx.lineTo(trunk+39,top+34);ctx.stroke();
        const canopy=['#d58a49','#e7aa53','#b56a4e','#e0b56a'];
        for(let leaf=0;leaf<7;leaf++){
          const lx=trunk+(leaf-3)*19,ly=top+((leaf*13+variation*7)%35);
          ctx.fillStyle=canopy[(leaf+variation)%canopy.length];
          ctx.beginPath();ctx.arc(lx,ly,23,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle='#f0c37c';ctx.globalAlpha=.8;
        for(let leaf=0;leaf<6;leaf++){
          const lx=x+12+leaf*35+(reducedMotion?0:Math.sin(clock*.85+leaf+n)*10),ly=188+(leaf*19+variation*11+(reducedMotion?0:clock*12))%82;
          ctx.save();ctx.translate(lx,ly);ctx.rotate((leaf-2)*.38);
          ctx.beginPath();ctx.ellipse(0,0,5,2.5,0,0,Math.PI*2);ctx.fill();ctx.restore();
        }
        ctx.globalAlpha=1;
      }else if(index===14){
        // Inverted Observatory: orbital instruments, starglass, and domes.
        const cx=x+101,cy=151+variation*10;
        ctx.fillStyle='#28334d';
        ctx.fillRect(x+46,cy+25,111,116);
        ctx.fillStyle='#465c81';
        ctx.beginPath();ctx.arc(cx,cy+27,55,Math.PI,0);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#a3b5df';ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(cx,cy,62,27,-.42,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.ellipse(cx,cy,46,59,.38,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#d4ddff';
        ctx.beginPath();ctx.arc(cx,cy,8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#8ba6d0';
        for(let p=0;p<4;p++){
          ctx.fillRect(x+55+p*24,cy+65,13,20);
        }
      }else if(index===15){
        // Bamboo Village: clustered bamboo stalks and tiered pavilion roofs.
        const base=286,top=100+variation*12;
        for(let stalk=0;stalk<5;stalk++){
          const bx=x+21+stalk*35;
          ctx.fillStyle=stalk%2?'#537f61':'#6a986a';
          ctx.fillRect(bx,top+(stalk%3)*20,10,base-top);
          ctx.strokeStyle='#a3c88b';ctx.lineWidth=1.5;
          for(let joint=0;joint<5;joint++){
            const jy=top+35+joint*30+(stalk%3)*20;
            ctx.beginPath();ctx.moveTo(bx,jy);ctx.lineTo(bx+10,jy);ctx.stroke();
          }
          ctx.fillStyle='#79ae7b';
          ctx.beginPath();ctx.ellipse(bx-12+(reducedMotion?0:Math.sin(clock*1.1+stalk+n)*5),top+25,21,5,-.3,0,Math.PI*2);ctx.fill();
        }
        const roof=171+variation*9;
        ctx.fillStyle='#544b57';ctx.fillRect(x+65,roof+24,99,93);
        ctx.fillStyle='#9b675e';
        ctx.beginPath();ctx.moveTo(x+50,roof+27);
        ctx.quadraticCurveTo(x+117,roof-25,x+180,roof+27);
        ctx.lineTo(x+165,roof+19);ctx.lineTo(x+66,roof+19);
        ctx.closePath();ctx.fill();
        ctx.fillStyle='#d7bb85';ctx.fillRect(x+105,roof+52,20,65);
      }else if(index===16){
        // Steamworks: piston housings, riveted boilers and exhaust pipes.
        const boilerX=x+79,boilerY=165+variation*9;
        ctx.fillStyle='#364453';
        ctx.fillRect(x+35,boilerY+33,131,107);
        ctx.fillStyle='#647c84';
        ctx.beginPath();ctx.ellipse(boilerX,boilerY+51,38,51,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#c9a47d';ctx.lineWidth=4;
        ctx.beginPath();ctx.ellipse(boilerX,boilerY+51,31,43,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#b7d4cf';
        ctx.beginPath();ctx.arc(boilerX,boilerY+51,10,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#506a77';
        ctx.fillRect(x+129,boilerY-64,17,101);
        ctx.fillRect(x+126,boilerY-68,23,8);
        ctx.strokeStyle='#d6b18d';ctx.lineWidth=2;
        for(let rivet=0;rivet<5;rivet++){
          ctx.beginPath();ctx.arc(x+151,boilerY+43+rivet*17,2,0,Math.PI*2);ctx.stroke();
        }
        ctx.fillStyle='#d8e3df';ctx.globalAlpha=.28;
        for(let puff=0;puff<3;puff++){
          const drift=reducedMotion?0:Math.sin(clock*.8+puff+n)*9;
          const rise=reducedMotion?0:(clock*13+puff*23)%42;
          ctx.beginPath();ctx.arc(x+136+puff*10+drift,boilerY-78-puff*17-rise,13+puff*4,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }else if(index===17){
        // Snow Village: pitched snow roofs, warm windows and frosted pines.
        const roofY=151+variation*11;
        ctx.fillStyle='#52627c';
        ctx.fillRect(x+54,roofY+34,116,121);
        ctx.fillStyle='#e7f2fa';
        ctx.beginPath();ctx.moveTo(x+42,roofY+36);ctx.lineTo(x+112,roofY-22);
        ctx.lineTo(x+181,roofY+36);ctx.closePath();ctx.fill();
        ctx.fillStyle='#a6c3da';
        ctx.beginPath();ctx.moveTo(x+53,roofY+35);ctx.lineTo(x+112,roofY-10);
        ctx.lineTo(x+169,roofY+35);ctx.closePath();ctx.fill();
        ctx.fillStyle='#f8d7a0';
        for(let window=0;window<3;window++){
          ctx.fillRect(x+66+window*31,roofY+62,17,24);
        }
        ctx.fillStyle='#e8f4fc';
        for(let pine=0;pine<2;pine++){
          const px=x+20+pine*180;
          ctx.beginPath();ctx.moveTo(px,roofY-17);ctx.lineTo(px-25,roofY+90);
          ctx.lineTo(px+25,roofY+90);ctx.closePath();ctx.fill();
        }
        ctx.globalAlpha=.75;ctx.fillStyle='#ffffff';
        for(let flake=0;flake<7;flake++){
          const fx=x+12+flake*29+(reducedMotion?0:Math.sin(clock*.9+flake+n)*7);
          const fy=102+((flake*37+variation*19+(reducedMotion?0:clock*17))%135);
          ctx.beginPath();ctx.arc(fx,fy,1.5+flake%2,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }else if(index===18){
        // Canyon Crossing: layered sandstone mesas, bridge cables and arches.
        const mesaTop=126+variation*15;
        ctx.fillStyle='#845a53';
        ctx.beginPath();ctx.moveTo(x+16,286);ctx.lineTo(x+16,mesaTop+43);
        ctx.lineTo(x+40,mesaTop+43);ctx.lineTo(x+40,mesaTop);
        ctx.lineTo(x+155,mesaTop);ctx.lineTo(x+155,mesaTop+56);
        ctx.lineTo(x+183,mesaTop+56);ctx.lineTo(x+183,286);ctx.closePath();ctx.fill();
        ctx.fillStyle='#b88167';
        for(let band=0;band<4;band++)ctx.fillRect(x+42,mesaTop+15+band*28,112,4);
        ctx.fillStyle='#5d4447';
        ctx.beginPath();ctx.moveTo(x+58,286);ctx.lineTo(x+58,mesaTop+106);
        ctx.quadraticCurveTo(x+100,mesaTop+62,x+141,mesaTop+106);
        ctx.lineTo(x+141,286);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#d4aa83';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(x+10,mesaTop+25);
        ctx.quadraticCurveTo(x+113,mesaTop+66,x+230,mesaTop+22);ctx.stroke();
        for(let cable=0;cable<4;cable++){
          const bx=x+35+cable*44;
          ctx.beginPath();ctx.moveTo(bx,mesaTop+35);ctx.lineTo(bx,mesaTop+79);ctx.stroke();
        }
      }else if(index===19){
        // Submarine Dock: pressure hulls, portholes and service piping.
        const hullY=171+variation*11;
        ctx.fillStyle='#314c63';
        ctx.beginPath();ctx.ellipse(x+112,hullY+56,87,53,0,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#7d9ba6';ctx.lineWidth=5;
        ctx.beginPath();ctx.ellipse(x+112,hullY+56,79,46,0,0,Math.PI*2);ctx.stroke();
        for(let port=0;port<3;port++){
          const px=x+62+port*49,py=hullY+52;
          const glass=ctx.createRadialGradient(px-4,py-5,1,px,py,15);
          glass.addColorStop(0,'#e2fbff');glass.addColorStop(.55,'#80cfdd');glass.addColorStop(1,'#315e78');
          ctx.fillStyle=glass;
          ctx.beginPath();ctx.arc(px,py,13,0,Math.PI*2);ctx.fill();
          ctx.strokeStyle='#d4b789';ctx.lineWidth=4;
          ctx.beginPath();ctx.arc(px,py,13,0,Math.PI*2);ctx.stroke();
        }
        ctx.fillStyle='#476879';ctx.fillRect(x+102,hullY-37,23,52);
        ctx.fillRect(x+115,hullY-37,35,11);
        ctx.strokeStyle='#83b9c7';ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(x+12,273);ctx.lineTo(x+203,273);ctx.stroke();
        ctx.fillStyle='#b5e8f2';ctx.globalAlpha=.35;
        for(let bubble=0;bubble<4;bubble++){
          ctx.beginPath();ctx.arc(x+19+bubble*51,119+bubble%2*22,3+bubble%3,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }else if(index===20){
        // Neon Circuit: distinct arcade speedways, neon conduits and terminals.
        const base=280,top=116+variation*12;
        ctx.fillStyle='#272b51';ctx.fillRect(x+28,top,124,base-top);
        ctx.strokeStyle='#7ce7ee';ctx.lineWidth=3;
        ctx.strokeRect(x+35,top+10,110,base-top-21);
        ctx.strokeStyle='#ef79cd';ctx.lineWidth=2;
        for(let track=0;track<4;track++){
          const ty=top+32+track*30;
          ctx.beginPath();ctx.moveTo(x+45,ty);
          ctx.lineTo(x+77,ty);ctx.lineTo(x+88,ty-8);
          ctx.lineTo(x+136,ty-8);ctx.stroke();
        }
        ctx.fillStyle='#ffdf7e';
        for(let node=0;node<4;node++){
          ctx.beginPath();ctx.arc(x+49+node*27,top+21,3,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle='#b0b7f7';ctx.globalAlpha=.7;
        ctx.fillRect(x+82,top-22,16,22);
        ctx.globalAlpha=1;
      }else if(index===21){
        // Marble Temple: stepped colonnades, carved capitals and arches.
        const top=117+variation*12;
        ctx.fillStyle='#59526a';ctx.fillRect(x+25,top+16,179,164);
        ctx.fillStyle='#c7b5bb';
        ctx.fillRect(x+17,top+12,195,11);
        ctx.fillRect(x+28,top+152,172,12);
        for(let column=0;column<4;column++){
          const cx=x+39+column*45;
          ctx.fillStyle='#9c8ca5';ctx.fillRect(cx,top+34,20,117);
          ctx.fillStyle='#e4d2d3';
          ctx.fillRect(cx-4,top+27,28,9);
          ctx.fillRect(cx-4,top+145,28,8);
          ctx.fillStyle='#b6a3b4';
          ctx.fillRect(cx+6,top+36,3,106);
        }
        ctx.strokeStyle='#e8d7db';ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(x+112,top+14,38,Math.PI,0);ctx.stroke();
        ctx.fillStyle='#f2d5a9';ctx.globalAlpha=reducedMotion?.55:(.43+.16*Math.sin(clock*1.8+n));
        ctx.beginPath();ctx.arc(x+112,top+14,9,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }else if(index===22){
        // Swamp Ferry: stilted boat landing, reeds and lantern-lit cabins.
        const waterline=281,cabinY=169+variation*9;
        ctx.fillStyle='#394c4b';
        ctx.fillRect(x+45,cabinY,121,waterline-cabinY);
        ctx.fillStyle='#66594c';
        ctx.beginPath();ctx.moveTo(x+32,cabinY+8);ctx.lineTo(x+102,cabinY-24);
        ctx.lineTo(x+177,cabinY+8);ctx.closePath();ctx.fill();
        ctx.fillStyle='#e8bc7b';ctx.globalAlpha=reducedMotion?.82:(.76+.13*Math.sin(clock*2.1+n*1.7));
        ctx.fillRect(x+78,cabinY+27,23,30);ctx.fillRect(x+124,cabinY+27,23,30);
        ctx.globalAlpha=1;
        ctx.fillStyle='#7b6853';
        ctx.fillRect(x+19,waterline-24,181,10);
        for(let post=0;post<4;post++)ctx.fillRect(x+28+post*50,waterline-14,7,31);
        ctx.strokeStyle='#7a9b6e';ctx.lineWidth=3;
        for(let reed=0;reed<7;reed++){
          const rx=x+12+reed*30;
          ctx.beginPath();ctx.moveTo(rx,waterline+5);
          ctx.quadraticCurveTo(rx-9,waterline-23,rx+((reed%3)-1)*9,waterline-39-reed%3*8);
          ctx.stroke();
        }
      }else if(index===23){
        // Sunflower Flight: giant flower heads, seed spirals and leaf stalks.
        const flowerX=x+110,flowerY=125+variation*12;
        ctx.strokeStyle='#527c51';ctx.lineWidth=11;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(flowerX,286);ctx.quadraticCurveTo(flowerX-16,206,flowerX,flowerY+24);ctx.stroke();
        ctx.fillStyle='#71aa61';
        for(let leaf=0;leaf<3;leaf++){
          const ly=201+leaf*25;
          ctx.beginPath();ctx.ellipse(flowerX+(leaf%2?25:-25)+(reducedMotion?0:Math.sin(clock*.9+leaf+n)*4),ly,30,11,leaf%2?-.35:.35,0,Math.PI*2);ctx.fill();
        }
        ctx.fillStyle='#e8b84f';
        for(let petal=0;petal<12;petal++){
          const a=petal*Math.PI/6;
          ctx.save();ctx.translate(flowerX+Math.cos(a)*28,flowerY+Math.sin(a)*28);
          ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,0,21,10,0,0,Math.PI*2);ctx.fill();ctx.restore();
        }
        ctx.fillStyle='#805641';ctx.beginPath();ctx.arc(flowerX,flowerY,29,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#d7a66c';ctx.globalAlpha=.8;
        for(let seed=0;seed<13;seed++){
          const a=seed*2.4,rad=Math.sqrt(seed)*6;
          ctx.beginPath();ctx.arc(flowerX+Math.cos(a)*rad,flowerY+Math.sin(a)*rad,2,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }else if(index===24){
        // Starship Cargo: stacked freight pods, hull ribs and navigation lights.
        const deckY=276,top=130+variation*10;
        ctx.fillStyle='#34445e';ctx.fillRect(x+20,top+45,181,deckY-top-45);
        ctx.fillStyle='#60748d';
        for(let pod=0;pod<3;pod++){
          const px=x+30+pod*55,py=top+58+(pod%2)*20;
          ctx.fillRect(px,py,47,75);
          ctx.strokeStyle='#a4c6d2';ctx.lineWidth=2;ctx.strokeRect(px+4,py+5,39,65);
          ctx.fillStyle='#9cdded';ctx.fillRect(px+17,py+14,13,7);
          ctx.fillStyle='#60748d';
        }
        ctx.strokeStyle='#a1b8c9';ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(x+14,top+41);ctx.lineTo(x+207,top+41);
        ctx.moveTo(x+14,deckY);ctx.lineTo(x+207,deckY);ctx.stroke();
        for(let light=0;light<4;light++){
          ctx.fillStyle=light%2?'#f5b877':'#8be6df';
          ctx.beginPath();ctx.arc(x+31+light*52,top+40,3,0,Math.PI*2);ctx.fill();
        }
      }
    }
    ctx.restore();
  }
  function draw() {
    ctx.fillStyle='#211332';
    ctx.fillRect(0,0,width,height);
    if (backdrop.naturalWidth) {
      const tile=backdrop.naturalWidth/5;
      const offset=(camera*.11)%width;
      for (let panel=0;panel<2;panel++) {
        ctx.save();
        const flipped=(Math.floor(camera*.11/width)+panel)%2;
        ctx.translate(panel*width-offset+(flipped?width:0),0);
        if(flipped) ctx.scale(-1,1);
        ctx.drawImage(backdrop,index%5*tile,Math.floor(index/5)*tile,tile,tile,0,0,width,height);
        ctx.restore();
      }
    }
    drawSignatureBackdrop();
    drawSceneryLayer(stageSceneryLayer(sceneryLayers[0],0));
    ctx.fillStyle=worldLight;ctx.fillRect(0,0,width,height);
    drawSceneryLayer(stageSceneryLayer(sceneryLayers[1],1));
    drawAtmosphere(false);
    drawSceneryLayer(stageSceneryLayer(sceneryLayers[2],2));
    ctx.fillStyle=sceneHaze;ctx.fillRect(0,0,width,height);
    ctx.save();
    ctx.translate(-camera,0);
    for (const wall of walls) {
      if (wall.x<camera-20 || wall.x>camera+width) continue;
      if(atlasSprite(terrainArt,4,15,wall.x+10,(wall.top+ground)/2,20,ground-wall.top)) continue;
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
      if(ledge.switchBridge && !amberSwitch) continue;
      if (ledge.x+ledge.w<camera || ledge.x>camera+width) continue;
      if(index===1 && ledge.kind==='floor' && !ledge.switchBridge){
        drawLibraryPlatform(ledge);
        drawLandingEdge(ledge);
        continue;
      }
      if(ledge.kind==='floor' && !ledge.switchBridge){
        drawCoursePlatform(ledge);
        drawLandingEdge(ledge);
        continue;
      }
      if(index===3 && Math.floor(ledge.x/sectionSize)===3 && ledge.kind==='spring' &&
         atlasSprite(propArt,4,2,ledge.x+ledge.w/2,ledge.y+14,ledge.w,28,false,2)) {
        drawLandingEdge(ledge);
        continue;
      }
      if(index===9 && ledge.kind==='rail' &&
         atlasSprite(propArt,4,3,ledge.x+ledge.w/2,ledge.y+10,42,39,false,2)) {
        ctx.fillStyle='#aab7c6';ctx.fillRect(ledge.x,ledge.y,ledge.w,4);
        continue;
      }
      if(ledge.dropAt!==undefined && !reducedMotion) {
        ctx.fillStyle='#ffc17f';
        ctx.fillRect(ledge.x,ledge.y-2,ledge.w*Math.max(0,(ledge.dropAt-clock)/.38),2);
      }
      if(ledge.kind==='ceilingSpikes'){
        ctx.save();
        ctx.translate(ledge.x,ledge.y);
        ctx.scale(1,-1);
        ctx.fillStyle='#ff617c';
        for(let i=0;i<5;i++){
          const x=i*ledge.w/5;
          ctx.beginPath();ctx.moveTo(x,36);ctx.lineTo(x+ledge.w/10,0);
          ctx.lineTo(x+ledge.w/5,36);ctx.fill();
        }
        ctx.restore();
        continue;
      }
      const depth=ledge.kind==='floor'?65:ledge.kind==='hazard'?Math.max(16,ground-ledge.y):24;
      const variant=stageSurfaces[index]?.[ledge.kind];
      const stageVariant=stagePropArt.naturalWidth && variant!==undefined;
      if(stageVariant || (terrainArt.naturalWidth && Object.hasOwn(terrainCells,ledge.kind))){
        const image=stageVariant?stagePropArt:terrainArt;
        const cell=stageVariant?variant:terrainCells[ledge.kind];
        const rows=stageVariant?2:4;
        const count=Math.max(1,Math.ceil(ledge.w/(ledge.kind==='hazard'?112:142)));
        const tileWidth=ledge.w/count;
        ctx.fillStyle='#090e1d75';
        ctx.fillRect(ledge.x+3,ledge.y+7,ledge.w,depth);
        for(let part=0;part<count;part++) {
          atlasSprite(image,4,cell,ledge.x+(part+.5)*tileWidth,ledge.y+depth*.5,tileWidth,depth,false,rows);
        }
        if(ledge.kind!=='hazard' && ledge.kind!=='rail' && ledge.kind!=='ceiling') {
          drawPlatformConstruction(ledge,depth);
          if(ledge.dropAt===undefined) drawLandingEdge(ledge);
        }
        continue;
      }
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
      if(ledge.kind!=='rail' && ledge.kind!=='ceiling') {
        drawPlatformConstruction(ledge,depth);
        if(ledge.dropAt===undefined) drawLandingEdge(ledge);
      }
      if (ledge.kind==='belt' || ledge.kind==='spring' || ledge.kind==='lift') {
        ctx.fillStyle='#ffffff4d';
        for(let x=ledge.x+9;x<ledge.x+ledge.w-7;x+=20) ctx.fillRect(x,ledge.y+8,7,3);
      }
    }
    for(let stage=1;stage<sections;stage++){
      const x=stage*sectionSize+100;
      if(x<camera-30 || x>camera+width+30) continue;
      const reached=stage<=chapter;
      ctx.save();
      ctx.globalAlpha=reached?1:.55;
      const lantern=(index===6 || index===21) && atlasSprite(stagePropArt,4,7,x,ground-31,43,62,false,2);
      if(!lantern) atlasSprite(terrainArt,4,9,x,ground-31,43,62);
      ctx.restore();
      ctx.fillStyle=reached?'#95ffe0':'#ddd5ff';
      ctx.font='bold 12px system-ui';
      ctx.textAlign='center';
      ctx.fillText(reached?'✓ '+(stage+1):String(stage+1),x,ground-68);
    }
    for(const prop of landmarks) {
      if(prop.x<camera-85 || prop.x>camera+width+85) continue;
      const pressed=prop.cell===0 && amberSwitch;
      atlasSprite(propArt,4,prop.cell,prop.x,prop.y+(pressed?6:0),prop.w,pressed?prop.h-12:prop.h,false,2);
    }
    function drawRing(x,y){
      if(atlasSprite(combatArt,3,0,x,y,20,24,false,2)) return;
      ctx.strokeStyle='#ffe28a';ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(x,y,7,10,0,0,Math.PI*2);ctx.stroke();
    }
    for(const ring of looseRings) drawRing(ring.x,ring.y);
    for (const c of crystals) if (!c.taken && (!c.reefCache || reefCacheOpen) && c.x>=camera && c.x<camera+width) {
      if(index===3){drawRing(c.x,c.y);continue;}
      if(player.sonar && close(player,c,310,300)){ctx.strokeStyle='#9bf4ff';ctx.strokeRect(c.x-18,c.y-18,36,36);}
      if(c.refill && atlasSprite(propArt,4,1,c.x,c.y,38,44,false,2)) continue;
      if(c.refill){ctx.strokeStyle='#66ffe0';ctx.strokeRect(c.x-15,c.y-15,30,30);}
      if(!sprite(15,c.x,c.y,38,38)){ctx.fillStyle='#ffd967';ctx.fillRect(c.x-5,c.y-5,10,10);}
    }
    for (const foe of enemies) if(!foe.dead && foe.x>=camera-150 && foe.x<camera+width+150) {
      const at=foePosition(foe);
      const airborne=['swoop','school'].includes(enemyPattern);
      // Airborne opponents cast a shadow on the floor, not in mid-air.
      castShadow(at.x,airborne?ground:at.y+20,airborne?16:20);
      const cell=index;
      const faceLeft=player.x<at.x;
      const nearby=Math.abs(player.x-at.x)<250;
      const firing=(foe.turret || enemyPattern==='turret' || index===16) &&
        nearby && Math.abs(player.y-at.y)<105 && foe.shotAt>clock;
      const motion=reducedMotion?0:Math.sin(clock*(airborne?9:6)+foe.offset);
      // Enemy gait follows visible world travel, not elapsed time. Reset on
      // large position changes so teleports and respawns never spin the gait.
      const travel=foe._drawX===undefined?0:Math.abs(at.x-foe._drawX);
      foe._drawX=at.x;
      if(travel>90)foe._gait=0;
      else foe._gait=(foe._gait||0)+Math.min(24,travel)/12;
      const moving=travel>.15 && travel<90;
      const footstep=reducedMotion||airborne||!moving?0:Math.abs(Math.sin(foe._gait))*2.2;
      const enemyLean=reducedMotion?0:(moving?Math.sin(foe._gait)*.045:Math.sin(clock*2+foe.offset)*.012);
      // Travel-based animation gives each enemy type a distinct cadence and
      // grounded compression without changing physics or hitboxes.
      const gaitRate=[.8,1.15,.95,1.35,1.05][index%5];
      const footCycle=Math.sin((foe._gait||0)*gaitRate);
      const movingWeight=reducedMotion||!moving?0:Math.min(1,travel/4);
      const anticipation=!reducedMotion && enemyPattern==='charge' && nearby && !airborne;
      const bodyStretch=movingWeight*(.018+.012*(index%3))*footCycle;
      const chargeCompression=anticipation?.07:0;
      ctx.save();
      // A distinct animation state for patrolling, hopping, flying and firing.
      ctx.translate(at.x,at.y+19);
      if(!airborne && enemyPattern==='charge' && nearby) ctx.rotate((faceLeft?1:-1)*.075);
      if(airborne) ctx.rotate(motion*.065);
      else ctx.rotate(enemyLean);
      ctx.scale((firing?1.09:1+motion*.025)+bodyStretch+chargeCompression,
        (firing?.94:1-motion*.025)-bodyStretch*.7-chargeCompression);
      ctx.translate(-at.x,-at.y-19-footstep);
      if(!atlasSprite(enemyArt,5,cell,at.x,at.y-12,73,73,faceLeft,5)){
        ctx.fillStyle='#bd664e';ctx.fillRect(at.x-18,at.y-17,36,34);
      }
      ctx.restore();
      if(firing){
        ctx.save();
        ctx.strokeStyle='#ffcd7a';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(at.x+(faceLeft?-23:23),at.y-6,7,0,Math.PI*2);ctx.stroke();
        ctx.restore();
      }
    }
    if (boss.health && camera+width>finish) {
      castShadow(boss.x,boss.y+38,36);
      // Keep the boss anchored to its feet while giving each world's guardian
      // a distinct, restrained weight and anticipation cycle.
      ctx.save();
      if(!reducedMotion){
        const families=['heavy','swift','float','mechanical','heavy'];
        const family=families[index%families.length];
        const tempo=family==='heavy'?1.7:family==='swift'?3.1:family==='float'?2.0:2.5;
        const phase=clock*tempo+index*.63;
        const warning=boss.warning?1:0;
        const lean=(family==='mechanical'?.012:.023)*Math.sin(phase)+(warning?.045:0);
        const bob=family==='float'?Math.sin(phase)*2.2:Math.abs(Math.sin(phase))*(family==='heavy'?.55:1.1);
        const compression=warning?.045:family==='heavy'?.012:.023;
        const pivotY=boss.y+39;
        ctx.translate(boss.x,pivotY);
        ctx.rotate(lean);
        ctx.scale(1+compression,1-compression);
        ctx.translate(-boss.x,-pivotY-bob);
      }
      if(!atlasSprite(guardianArt,3,guardianCells[index],boss.x,boss.y-21,138,120,false,2) && !atlasSprite(enemyArt,5,index,boss.x,boss.y,126,126) && !sprite(12,boss.x,boss.y,116,116,true)){ctx.fillStyle='#ad505c';ctx.fillRect(boss.x-34,boss.y-38,68,76);}
      ctx.restore();
      if(boss.warning){
        atlasSprite(propArt,4,6,boss.x,boss.y-78,32,34,false,2);
        ctx.save();
        ctx.strokeStyle='#ffce7199';
        ctx.setLineDash([9,7]);
        const tracks=boss.aim
          ? (guardian.pattern==='barrage'?[boss.y+12,boss.y-55]:guardian.pattern==='volley' && boss.health<=3?[boss.y+12,boss.y-42]:[boss.y+12])
          : [ground-8];
        for(const y of tracks){
          const start=boss.aim ? boss.x+boss.aim*44 : boss.x;
          const end=boss.aim ? boss.aim<0?finish:finish+850 : finish+610;
          ctx.beginPath();ctx.moveTo(start,y);ctx.lineTo(end,y);ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle='#ffce71';ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(boss.x,boss.y-6,59,48,0,0,Math.PI*2);ctx.stroke();
      }
      ctx.fillStyle='#15142c';ctx.fillRect(boss.x-38,boss.y-57,76,10);
      ctx.fillStyle='#f77c8b';
      for(let heart=0;heart<boss.health;heart++) ctx.fillRect(boss.x-35+heart*14,boss.y-54,11,4);
    }
    const exitLocked=Boolean(boss.health) || (finale==='crystals' && taken<3);
    ctx.fillStyle=exitLocked?'#78487c':'#e0bd64';
    const markerY = finale==='summit' ? ground-225 : ground-104;
    ctx.save();
    if(exitLocked) ctx.globalAlpha=.53;
    if(!atlasSprite(terrainArt,4,14,exitX+12,markerY+52,70,104)){
      ctx.fillRect(exitX,markerY,11,104);
      ctx.fillRect(exitX+11,markerY,45,25);
    }
    ctx.restore();
    if(exitX>=camera-80 && exitX<=camera+width+80){
      ctx.save();
      ctx.textAlign='center';
      ctx.font='bold 12px system-ui';
      ctx.fillStyle=exitLocked?'#ffbed0':'#ffe8a8';
      ctx.fillText(exitLocked?'LOCKED':index===20?'RESET':'EXIT',exitX+12,markerY-8);
      ctx.restore();
    }
    for (const a of attacks) {
      const radius=a.radius||9;
      // Keep radial strikes as rings so their full hit area stays readable.
      if(a.v!==0 && atlasSprite(combatArt,3,a.returning?4:(index===24 && a.gravity)?5:movement==='buster'?1:3,
          a.x,a.y,radius*2.9,radius*2,a.v<0,2)) continue;
      ctx.fillStyle='#ffe9a9';ctx.beginPath();ctx.arc(a.x,a.y,a.radius||9,0,Math.PI*2);ctx.fill();
    }
    for(const shot of hazards) {
      if(shot.parry && atlasSprite(combatArt,3,2,shot.x,shot.y,21,21,false,2)) continue;
      ctx.save();
      ctx.translate(shot.x,shot.y);
      if(shot.v<0) ctx.scale(-1,1);
      ctx.fillStyle=shot.parry?'#ff86dc':'#ff8479';
      ctx.strokeStyle='#471723';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(-12,0);ctx.lineTo(-3,-6);ctx.lineTo(7,-6);
      ctx.lineTo(11,0);ctx.lineTo(7,6);ctx.lineTo(-3,6);
      ctx.closePath();ctx.fill();ctx.stroke();
      ctx.restore();
    }
    for(const spark of particles) {
      ctx.globalAlpha=Math.min(1,spark.life/.23);
      ctx.fillStyle=spark.color;
      ctx.fillRect(spark.x,spark.y,3,3);
    }
    ctx.globalAlpha=1;
    const p=player;
    castShadow(p.x,p.y+(p.morphed?12:22),23);
    if(p.sonar && p.sonarOrigin && !reducedMotion){
      const radius=12+(2-p.sonar)*155;
      ctx.save();
      ctx.strokeStyle='#8ceaff';ctx.lineWidth=2;
      ctx.globalAlpha=p.sonar*.29;
      ctx.beginPath();
      ctx.ellipse(p.sonarOrigin.x,p.sonarOrigin.y,radius,radius*.58,0,0,Math.PI*2);
      ctx.stroke();ctx.restore();
    }
    if(movement==='airdash'){
      ctx.save();
      ctx.translate(p.x,p.y-57);
      ctx.rotate(Math.PI/4);
      ctx.lineWidth=2;
      ctx.strokeStyle=p.dashUsed?'#d2b8cc':'#92ffe9';
      if(!p.dashUsed){ctx.fillStyle='#49ccbd';ctx.fillRect(-4,-4,8,8);}
      ctx.strokeRect(-4,-4,8,8);
      ctx.restore();
    }

    if(p.cable){
      ctx.save();
      ctx.beginPath();ctx.moveTo(p.x,p.y-7);ctx.lineTo(p.cable.x,p.cable.y);
      ctx.lineWidth=5;ctx.strokeStyle='#101827';ctx.stroke();
      ctx.lineWidth=2;ctx.strokeStyle='#b4e9ff';ctx.stroke();
      ctx.restore();
    }
    if(index===3 && p.spin){
      const meterX=p.x-24;
      const meterY=p.y-55;
      ctx.fillStyle='#11172e';
      ctx.fillRect(meterX-3,meterY-3,54,12);
      for(let segment=0;segment<5;segment++){
        ctx.fillStyle=segment<p.spin?'#ffd074':'#46516d';
        ctx.fillRect(meterX+segment*10,meterY,8,6);
      }
    }
    if(p.pogo && p.vy>0){
      ctx.save();
      ctx.strokeStyle=index===12?'#b8eeff':'#ffe4a3';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(p.x-11,p.y+20);
      ctx.lineTo(p.x,p.y+33);
      ctx.lineTo(p.x+11,p.y+20);
      ctx.stroke();
      ctx.restore();
    }
    if(p.chargeStart!==null){
      const charge=Math.min(1,(clock-p.chargeStart)/.65);
      const x=p.x+p.facing*22;
      const y=p.y-7;
      const radius=6+charge*10;
      ctx.save();
      ctx.fillStyle=charge===1?'#fff1b5':'#85dcff';
      ctx.shadowColor='#80cbff';ctx.shadowBlur=radius;
      ctx.beginPath();ctx.arc(x,y,radius*.6,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle='#c6f5ff';
      ctx.beginPath();ctx.arc(x,y,radius,-Math.PI/2,-Math.PI/2+charge*Math.PI*2);ctx.stroke();
      ctx.restore();
    }

    if(index===3 && p.power>.22){
      ctx.save();
      ctx.strokeStyle='#ffcf85';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.ellipse(p.x,p.y+3,28,22,0,-Math.PI*.78,Math.PI*.45);
      ctx.stroke();
      ctx.restore();
    }
    if(p.grapple || p.power>.22 && power==='dash'){
      ctx.fillStyle='#9be8ff60';
      for(let i=1;i<=3;i++) ctx.fillRect(p.x-p.facing*(22+i*12),p.y-9+i*4,12,2);
    }
    const light=['Luna','Ivy','Frost','Melody','Spark'].includes(hero);
    const attacking=p.power>.22 && power!=='dash';
    const rolling=(index===3 && (p.spin>0 || p.power>.22)) || (movement==='roll' && p.grapple>0);
    const rushing=p.grapple>0 || (power==='dash' && p.power>.22);
    const braking=p.on && Math.abs(p.vx)>runSpeed*.42 &&
      ((p.vx>0 && held('left')) || (p.vx<0 && held('right')));
    const gliding=power==='glide' && !p.on && held('jump') && p.vy>0;
    const wallSliding=!!p.wall && !p.on && p.vy>0;
    const swimming=power==='swim' && !p.on;
    const pose=rolling ? 3 : attacking ? 2 : braking ? 0 : !p.on ? 3 :
      Math.abs(p.vx)>15 ? 1+Math.floor(clock*(7+Math.min(9,Math.abs(p.vx)/75)))%2 : 0;
    const cell = power==='slide' && held('action') ? 13 :
      light && !p.on && (power==='double' || power==='vine') ? 14 : (light?4:0)+pose;
    const squash=reducedMotion ? 0 : (p.landingPose||0)*1.05;
    // Secondary motion gives existing sprite poses some life without
    // altering collisions or gameplay timing.
    const stride=Math.min(1,Math.abs(p.vx)/Math.max(1,runSpeed));
    const gait=p.gaitPhase||0;
    const breath=reducedMotion?0:Math.sin(clock*2.9)*.012;
    const footBob=reducedMotion||!p.on?0:
      stride>.12 ? Math.abs(Math.sin(gait))*(1.2+stride*2.4)*(p.gaitWeight||0) : Math.sin(clock*2.9)*.55;
    // Five locomotion styles are assigned by game, while the movement state
    // remains driven by actual player velocity and existing collision physics.
    const motionStyle=index%5;
    const strideSway=[.027,.036,.021,.045,.031][motionStyle];
    const bodySway=reducedMotion?0:
      p.on && stride>.12 ? Math.sin(gait)*stride*strideSway : Math.sin(clock*1.8+index*.37)*.008;
    if(p.gravity<0){
      ctx.translate(0,p.y*2);ctx.scale(1,-1);
    }
    const feet=p.y+(p.morphed?12:22);
    if(p.morphed || squash){
      ctx.translate(p.x,feet);
      ctx.scale(1+squash*.65,p.morphed ? .64 : 1-squash);
      ctx.translate(-p.x,-feet);
    }
    if(!reducedMotion){
      ctx.translate(p.x,p.y+22);
      ctx.rotate(bodySway);
      ctx.scale(1-breath,1+breath);
      ctx.translate(-p.x,-p.y-22-footBob);
    }
    // The actual character pose now responds to the performed move, not
    // just a decorative effect drawn over an idle/running sprite.
    // Transform around the feet to keep landing alignment and hitboxes intact.
    if(!reducedMotion){
      const pivotY=p.y+22;
      let tilt=0,scaleX=1,scaleY=1;
      if(rolling){
        tilt=clock*(index===3?17:12)*p.facing;
        scaleX=.84;scaleY=.84;
      } else if(braking){
        tilt=-p.facing*.2;scaleX=.92;scaleY=1.05;
      } else if(gliding){
        tilt=p.facing*.09;scaleX=1.13;scaleY=.93;
      } else if(wallSliding){
        tilt=-p.facing*.14;scaleX=.93;
      } else if(swimming){
        tilt=Math.sin(clock*8)*.1;scaleX=1.08;scaleY=.94;
      } else if(rushing){
        tilt=-p.facing*(movement==='airdash'?.34:.22);
        scaleX=1.12;scaleY=.88;
      } else if(attacking){
        const strike=Math.sin(clock*22);
        tilt=p.facing*(.11+strike*.16);
        scaleX=1.06;scaleY=.96;
      } else if(p.cable && !p.on){
        tilt=Math.max(-.32,Math.min(.32,p.vx/900));
      } else if(!p.on){
        // Rising compresses the silhouette; falling extends it. Cap both
        // responses so fast falls never distort the approved character art.
        const airborneSpeed=Math.min(1,Math.abs(p.vy)/650);
        tilt=p.facing*(p.vy<0?-.065:.07)*(1+airborneSpeed*.65);
        scaleX=p.vy<0?1-.035*airborneSpeed:1+.045*airborneSpeed;
        scaleY=p.vy<0?1+.055*airborneSpeed:1-.035*airborneSpeed;
      } else if(Math.abs(p.vx)>45){
        tilt=p.facing*Math.min(.13,Math.abs(p.vx)/4200);
        // Distinct run silhouette: sprint-forward energy without moving
        // the feet or altering collision dimensions.
        scaleX=1+stride*[.014,.025,.018,.035,.022][motionStyle];
        scaleY=1-stride*[.012,.019,.015,.026,.017][motionStyle];
      }
      if(p.morphed){scaleX*=1.18;scaleY*=.77;}
      ctx.translate(p.x,pivotY);
      ctx.rotate(tilt);
      ctx.scale(scaleX,scaleY);
      ctx.translate(-p.x,-pivotY);
    }
    ctx.globalAlpha=p.grace && Math.floor(clock*12)%2?.55:1;
    const roster = ['Bolt','Ivy','Frost','Melody','Stone','Spark','Shadow'];
    const rosterIndex = roster.indexOf(hero);
    const heroSize=index===0?107:81;
    const heroLift=(heroSize-81)/2;
    const running=p.on && Math.abs(p.vx)>45 && !rolling && !rushing && !attacking && !braking;
    // Blend the existing two running poses continuously instead of snapping
    // abruptly between them. The cadence follows real movement speed.
    const stridePhase=p.gaitPhase||0;
    const blend=reducedMotion?0:(.5-.5*Math.cos(stridePhase))*.7*(p.gaitWeight||0);
    const drawHeroPose=(nextPose,alpha)=>{
      ctx.save();
      ctx.globalAlpha*=alpha;
      const drawn=rosterIndex>=0
        ? atlasSprite(heroArt,8,rosterIndex*4+nextPose,p.x,p.y-17-heroLift,heroSize,heroSize,p.facing<0,4)
        : sprite((light?4:0)+nextPose,p.x,p.y-15-heroLift,heroSize,heroSize,p.facing<0);
      ctx.restore();
      return drawn;
    };
    let heroDrawn=false;
    if(running){
      // Weighted crossfade: total opacity stays at 1, preventing the
      // doubled/ghosted silhouette caused by painting two opaque frames.
      const secondary=blend;
      heroDrawn=drawHeroPose(1,1-secondary);
      if(heroDrawn && secondary>.03)drawHeroPose(2,secondary);
    } else if(rosterIndex>=0){
      heroDrawn=atlasSprite(heroArt,8,rosterIndex*4+pose,p.x,p.y-17-heroLift,heroSize,heroSize,p.facing<0,4);
    } else {
      heroDrawn=sprite(cell,p.x,p.y-15-heroLift,heroSize,heroSize,p.facing<0);
    }
    if(!heroDrawn && poster.naturalWidth) {
      const sw=poster.naturalWidth/2;
      ctx.drawImage(poster,light?sw:0,0,sw,poster.naturalHeight,p.x-24,p.y-35,48,57);
    }
    ctx.restore();
    // Landing compression and takeoff trails are short, grounded cues.
    // They track the player's feet and never affect collision geometry.
    if(!reducedMotion){
      const footY=p.y+(p.morphed?12:22);
      const impact=Math.max(0,Math.min(1,(p.landingPose||0)/.13));
      if(impact>.01){
        ctx.save();
        ctx.globalAlpha=impact*.58;
        ctx.strokeStyle=light?'#c8b7ff':'#ffd39a';
        ctx.lineWidth=2.5;
        ctx.beginPath();
        ctx.ellipse(p.x,footY+2,13+(1-impact)*29,3.5+(1-impact)*3,0,0,Math.PI*2);
        ctx.stroke();
        for(const direction of [-1,1]){
          ctx.beginPath();
          ctx.arc(p.x+direction*(18+(1-impact)*21),footY-2-(1-impact)*9,2.5+impact*2,0,Math.PI*2);
          ctx.fillStyle=light?'#d9c5ff':'#ffe0ac';
          ctx.fill();
        }
        ctx.restore();
      }
      // A small wind trail conveys direction while gliding, without
      // suggesting a character is standing on an invisible platform.
      if(gliding){
        ctx.save();
        ctx.strokeStyle=light?'#b9a7ff99':'#b4e7ff99';
        ctx.lineWidth=1.6;
        for(let trail=0;trail<3;trail++){
          const y=p.y-18+trail*10;
          ctx.beginPath();
          ctx.moveTo(p.x-p.facing*(19+trail*6),y);
          ctx.lineTo(p.x-p.facing*(40+trail*9),y+3);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    // Render the versioned, repository-backed original energy art in gameplay.
    // The first two sections of the SVG are slash arcs; the third is a paw.
    if(energyFxArt.complete && energyFxArt.naturalWidth && !reducedMotion &&
       (attacking || (p.power>.22 && power==='dash'))){
      ctx.save();
      const fxCell=power==='dash'?2:(light?1:0);
      const sx=fxCell===0?0:fxCell===1?174:340;
      const sw=fxCell===2?172:174;
      const extent=fxCell===2?76:104;
      const alpha=attacking ? .82 : Math.min(1,Math.max(0,p.power/.48));
      ctx.globalAlpha=.25+.65*alpha;
      ctx.translate(p.x+p.facing*33,p.y-15);
      if(p.facing<0)ctx.scale(-1,1);
      const flicker=attacking?1+Math.sin(clock*21)*.09:1;
      ctx.scale(flicker,flicker);
      ctx.drawImage(energyFxArt,sx,0,sw,128,-extent*.3,-extent*.5,extent,extent*.8);
      ctx.restore();
    }
    // Move-specific silhouette and effects overlay the existing approved
    // character art; the promotional concept sheet is not a sprite atlas.
    if(!reducedMotion && (rolling || rushing || attacking || p.pogo || p.cable || p.morphed || braking || gliding || wallSliding || swimming)){
      ctx.save();
      const fx=p.x,fy=p.y-7;
      ctx.lineCap='round';
      if(braking){
        ctx.fillStyle='#f6e3c488';
        for(let puff=0;puff<3;puff++){
          ctx.beginPath();ctx.arc(fx-p.facing*(12+puff*9),fy+26,3+puff*2,0,Math.PI*2);ctx.fill();
        }
      } else if(gliding){
        ctx.strokeStyle='#aeeaff';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(fx,fy-9,27,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
      } else if(wallSliding){
        ctx.strokeStyle='#ffe7b4';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(fx+p.facing*15,fy+12);ctx.lineTo(fx+p.facing*22,fy+24);ctx.stroke();
      } else if(swimming){
        ctx.strokeStyle='#9befff';ctx.lineWidth=2;
        for(let bubble=0;bubble<3;bubble++){
          ctx.beginPath();ctx.arc(fx-p.facing*(18+bubble*9),fy+8-bubble*8,3+bubble,0,Math.PI*2);ctx.stroke();
        }
      } else if(rolling){
        ctx.strokeStyle=index===3?'#ffe19b':'#9ff7cb';
        ctx.lineWidth=3;
        for(let arc=0;arc<3;arc++){
          ctx.beginPath();
          ctx.arc(fx,fy,19+arc*5,clock*12+arc*2,clock*12+arc*2+1.9);
          ctx.stroke();
        }
      } else if(rushing){
        ctx.strokeStyle=movement==='airdash'?'#b8a5ff':'#9feeff';
        ctx.lineWidth=3;
        for(let streak=0;streak<4;streak++){
          const yy=fy-15+streak*10;
          ctx.beginPath();
          ctx.moveTo(fx-p.facing*(19+streak*8),yy);
          ctx.lineTo(fx-p.facing*(45+streak*10),yy+2);
          ctx.stroke();
        }
      } else if(attacking){
        const color=movement==='buster'||movement==='shooter'?'#8fdcff':
          movement==='whip'?'#cba0ff':'#ffe09a';
        ctx.strokeStyle=color;ctx.lineWidth=4;
        ctx.beginPath();
        ctx.arc(fx+p.facing*14,fy,23,-1.1,1.1,p.facing<0);
        ctx.stroke();
        ctx.fillStyle=color;
        ctx.beginPath();ctx.arc(fx+p.facing*28,fy-2,4,0,Math.PI*2);ctx.fill();
      }
      if(p.pogo && p.vy>0){
        ctx.strokeStyle='#fff1b3';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(fx-12,fy+27);ctx.lineTo(fx,fy+40);
        ctx.lineTo(fx+12,fy+27);ctx.stroke();
      }
      ctx.restore();
    }
    drawAtmosphere(true);
    if(chapterReveal>0 && phase==='playing') {
      ctx.save();
      ctx.globalAlpha=Math.min(1,chapterReveal*2);
      ctx.fillStyle='#100d24de';ctx.fillRect(210,16,380,44);
      ctx.fillStyle='#ffe4a8';ctx.font='bold 20px system-ui';ctx.textAlign='center';
      ctx.fillText(chapters[chapter],width/2,44,350);
      ctx.restore();
    }
    if (phase==='won') {
      ctx.fillStyle='#100c27c9';ctx.fillRect(0,0,width,height);
      ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 27px system-ui';
      ctx.fillText(ending,width/2,155,740);
      ctx.font='18px system-ui';ctx.fillText(epilogue,width/2,195,740);
      ctx.fillText(taken+(index===3?' course rings collected':' crystals collected'),width/2,232);
      return;
    }
    if (phase!=='playing') {
      ctx.fillStyle='#100c27c9';ctx.fillRect(0,0,width,height);
      ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 32px system-ui';
      ctx.fillText(phase==='paused'?'Paused':name,width/2,165);
      ctx.font='18px system-ui';ctx.fillText(phase==='paused'?'Resume when ready':opening,width/2,206);
    }
  }
  const tick = 1/120;
  let accumulator = 0;
  const foundryStory = [
    ['The silent bell','The morning shift never heard the all-clear. Whisker follows warm air rising through the cooling vents.'],
    ['The amber signal','A maintenance lamp blinks twice. Someone inside is still trying to signal the surface.'],
    ['Tracks in the ash','Boot prints cross the cinder hills. The bell keeper made it this far before the furnace crab broke loose.'],
    ['A bridge above the fire','A voice calls from beyond the suspended bridges. Whisker answers and takes the high route.'],
    ['The cooling banks','Whisker spots the keeper’s dropped wrench beside a cooling channel. The furnace controls are close.'],
    ['Into Furnace Keep','The keeper is trapped behind the bell platform. Whisker braces as the furnace crab blocks the last crossing.'],
    ['The all-clear','The keeper rings the bell again. Across the foundry, the crew answers with a cheer.']
  ];
  let storyDialog, storyFrame;
  const foundryShots=[
    [0,.20,.28,'#ffad65'],[1,.64,.32,'#ffd189'],[2,.35,.58,'#ec8b65'],
    [3,.78,.34,'#ffae73'],[4,.42,.63,'#a9ddd9'],[5,.70,.24,'#ff754b'],[6,.51,.31,'#ffdb8c']
  ];
  function playFoundryShot(scene) {
    const [,focusX,focusY,tint]=foundryShots[scene];
    const started=performance.now();
    function render(now){
      if(!storyDialog.open)return;
      const t=(now-started)/1000;
      const zoom=reducedMotion?1.13:1.10+Math.min(t,8)*.024;
      const w=width*zoom,h=height*zoom;
      draw();
      if(backdrop.naturalWidth){
        const tile=backdrop.naturalWidth/5;
        ctx.drawImage(backdrop,0,0,tile,tile,(width-w)*focusX,(height-h)*focusY,w,h);
      }
      const shade=ctx.createLinearGradient(0,0,0,height);
      shade.addColorStop(0,'#140d1ac9');
      shade.addColorStop(.46,'#20111c20');
      shade.addColorStop(1,'#140d1af2');
      ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
      if(!reducedMotion){
        ctx.save();
        ctx.fillStyle=tint;
        for(let i=0;i<30;i++){
          const x=(i*139+t*(12+i%7))%width;
          const y=height-(i*53+t*(19+i%11))%height;
          ctx.globalAlpha=.2+.18*Math.sin(t*2+i);
          ctx.fillRect(x,y,1+i%3,1+i%3);
        }
        ctx.restore();
      }
      ctx.fillStyle='#100b15';ctx.fillRect(0,0,width,19);ctx.fillRect(0,height-19,width,19);
      if(!reducedMotion)storyFrame=requestAnimationFrame(render);
    }
    storyFrame=requestAnimationFrame(render);
  }
  function showFoundryStory(scene) {
    clearInput();
    if(!storyDialog){
      storyDialog=document.createElement('dialog');
      storyDialog.style.cssText='position:fixed;top:auto;bottom:4vh;width:min(88vw,560px);padding:18px 22px;border:1px solid #edac66;border-radius:14px;background:#241725;color:#fff4e2;box-shadow:0 8px 30px #0009';
      const title=document.createElement('h2');
      title.id='foundry-story-title';
      storyDialog.setAttribute('aria-labelledby',title.id);
      const line=document.createElement('p');
      const advance=document.createElement('button');
      advance.type='button';
      advance.textContent='Continue';
      advance.onclick=()=>storyDialog.close();
      storyDialog.append(title,line,advance);
      byId('side-player').append(storyDialog);
      storyDialog.addEventListener('close',()=>{
        cancelAnimationFrame(storyFrame);
        draw();
        clearInput();
        canvas.focus({preventScroll:true});
        if(phase==='playing'){
          last=performance.now();
          frame=requestAnimationFrame(loop);
        }
      });
    }
    const [title,line]=foundryStory[scene];
    storyDialog.children[0].textContent=title;
    storyDialog.children[1].textContent=line;
    storyDialog.children[2].textContent=scene===6?'Close':'Continue';
    storyDialog.showModal();
    playFoundryShot(scene);
  }
  function loop(now) {
    accumulator += Math.min(.075,Math.max(0,(now-last)/1000));
    while (accumulator >= tick && phase==='playing' && !storyDialog?.open) {
      step(tick);
      accumulator-=tick;
    }
    last=now;
    draw();
    if(phase==='playing' && !storyDialog?.open) frame=requestAnimationFrame(loop);
    if(phase==='won') {pauseButton.disabled=true;playCue(440,880,.3);if(index===0)showFoundryStory(6);}
  }
  function startRun(saved) {
    cancelAnimationFrame(frame);
    clearInput();
    reset();
    syncControllerArt(0);
    if (saved) {
      chapter=saved.stage;
      syncControllerArt(chapter);
      amberSwitch=saved.amberSwitch===true;
      reefCacheOpen=saved.reefCacheOpen===true;
      for(const i of saved.crystals) if(crystals[i]) crystals[i].taken=true;
      for(const i of saved.enemies) if(enemies[i]) enemies[i].dead=true;
      taken=crystals.filter(c=>c.taken).length;
      player=resetPlayer(chapter*sectionSize+100);
      camera=Math.max(0,player.x-238);
      status(chapters[chapter]+' · Checkpoint resumed.');
      hud();
    }
    phase='playing';
    pauseButton.disabled=false;
    pauseButton.textContent='Pause';
    byId('side-start').textContent='Restart';
    canvas.focus({preventScroll:true});
    accumulator=0;
    last=performance.now();
    if(index===0 && !saved){draw();showFoundryStory(0);}
    else frame=requestAnimationFrame(loop);
  }
  byId('side-start').onclick=()=>startRun(null);
  resumeButton.hidden=!readCheckpoint();
  resumeButton.onclick=()=>{const saved=readCheckpoint();if(saved)startRun(saved);};
  const codes={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:power==='swim'||movement==='airdash'||index===15?'up':'jump',KeyW:power==='swim'||movement==='airdash'||index===15?'up':'jump',ArrowDown:'down',KeyS:'down',Space:'jump',KeyX:'action',KeyC:'technique'};
  addEventListener('keydown',event=>{
    if(event.code==='KeyP' && !event.repeat && (phase==='playing'||phase==='paused')) {event.preventDefault();togglePause();return;}
    const control=codes[event.code];
    if(!control || phase!=='playing' || event.target.closest('button,a,input,select')) return;
    event.preventDefault();
    if(event.repeat && !pressedCodes.has(event.code)) return;
    const alreadyHeld=keys.has(control);
    pressedCodes.add(event.code);
    keys.add(control);
    if(!alreadyHeld && !event.repeat) {
      if(control==='jump') jump();
      if(control==='action') action();
      if(control==='technique') useTechnique();
    }
  });
  addEventListener('keyup',event=>{const control=codes[event.code];pressedCodes.delete(event.code);if(!Array.from(pressedCodes).some(code=>codes[code]===control)) keys.delete(control);if(control==='action')releaseAction(true);});
  addEventListener('blur',clearInput);
  const resetStick=bindTouchJoystick(byId('touch-stick'),direction=>{
    for (const axis of ['left','right','up','down']) mobile.delete(axis);
    if(direction) for(const axis of direction.split(' ')) mobile.add(axis);
  },{horizontal:power!=='swim' && index!==3 && movement!=='airdash' && index!==15,diagonal:power==='swim'||movement==='airdash'||index===15});
  document.querySelectorAll('[data-control]').forEach(button=>{
    const control=button.dataset.control;
    const activate=()=>{if(control==='jump')jump();else if(control==='technique')useTechnique();else action();};
    let pointer=null;
    resetActionPointers.push(()=>{
      const previous=pointer;
      pointer=null;
      if(previous!==null && button.hasPointerCapture(previous)) button.releasePointerCapture(previous);
    });
    button.onpointerdown=event=>{
      if(pointer!==null || phase!=='playing') return;
      pointer=event.pointerId;
      event.preventDefault();button.setPointerCapture(event.pointerId);mobile.add(control);activate();
    };
    for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,e=>{if(e.pointerId!==pointer)return;pointer=null;mobile.delete(control);if(control==='action')releaseAction(event==='pointerup');});
    button.onclick=event=>{if(event.detail===0){activate();if(control==='action')releaseAction(true);}};
  });
  for (const image of [sprites,poster,backdrop,enemyArt,heroArt,terrainArt,guardianArt,propArt,stagePropArt,combatArt,energyFxArt]) image.onload=()=>{if(phase!=='playing') draw();};
  reset();
})();
