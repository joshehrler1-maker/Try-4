(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const scenery = 'assets/scenes/platform-levels.webp';
  const courses = window.pawtopiaCourses;
  const catalog = byId('side-catalog');
  if (!catalog) return;
  const gameData = [courses, window.pawtopiaStyles, window.pawtopiaVariants,
    window.pawtopiaTechniques, window.pawtopiaChapters, window.pawtopiaRoomPlans, window.pawtopiaSetPieces];
  if (!gameData.every(Array.isArray)) {
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
  const index = Number(selection);
  if (!/^\d+$/.test(selection) || !gameData.slice(0,5).every(table=>Array.isArray(table[index])) ||
      !gameData.slice(5).every(table=>typeof table[index]==='string')) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'alert');
    notice.textContent = 'This game is unavailable. Choose another adventure below.';
    catalog.before(notice);
    return;
  }
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
    stomp:index===0?'Land on enemies to bounce. Hold Jump for a higher rebound.':'Bounce off enemies', slide:'Hold Action to slide under low shelves', swim:'Steer in four directions to swim. Charge into enemies from the front. Surface or visit a bubbling vent for air',
    dash:'Press Action to dash', vine:'Press Action to climb into a high route', glide:'Hold Jump to glide',
    throw:index===13?'Throw a crystal with Action. Hold the joystick up or use W/Up to arc the throw':index===19?'Press Action to fire. Hold the joystick up or use W/Up to aim diagonally. Switch weapons for spread fire.':'Press Action to throw a crystal', flip:index===7?'Press Flip (X or Space on keyboard) while on the floor or ceiling to reverse gravity. Floor and ceiling spikes send you back to the chapter checkpoint':'Press Action to reverse gravity',
    pulse:'Press Action to release a shockwave', grapple:'Press Action below an overhead rail to attach. Steer to swing. In Quarry Rescue, steer up to reel in or down to extend the cable. Press Release Cable to let go',
    double:'Jump again in midair', shield:'Hold Action to deflect hazards',
    photo:'Press Action to stun enemies with a flash', bubble:'Hold Action to float'
  };
  const movementGuide = {
    buster:'Tap Fire to shoot, or hold and release to charge. Jump again while sliding against a wall to kick off.', roll:'Roll through enemies with Action. Press Jump during a roll to leap after leaving a ledge.',
    float:index===6?'Hold Float (X on keyboard) to rise. Release it to descend.':'Hold Action to float.', beat:'You run automatically. Jump over the beat barriers and press Pulse (X on keyboard) when the beat meter reads PULSE NOW.',
    airdash:'Press Dash in midair. Steer up or down to aim it, and jump against walls to kick off. Collect a mint crystal or exit a dream prism to chain another dash.',
    pogo:'Hold Jump while stomping to bounce higher.',
    precision:'Jump from ledge edges to clear wider gaps.',
    whip:'Press Action to strike nearby enemies with your whip.',
    momentum:index===3?'Hold down and tap Jump to charge a spin dash. Release down to roll.':'Hold a direction to build speed. Press Action to burst forward.'
  };
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'alert');
    notice.textContent = 'This browser could not start the playfield.';
    catalog.before(notice);
    return;
  }
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
  const baronArt=new Image();
  baronArt.src='data:image/webp;base64,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';
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
    [1, 0.74, 1.48, 1.12],
    [1.03, 0.94, 1.24, 1.17],
    [0.85, 0.82, 1, 0.78],
    [1.04, 0.91, 1.16, 1.09],
    [0.98, 0.87, 1.29, 1.23],
    [1.06, 0.64, 1.24, 0.86],
    [0.98, 0.58, 1.19, 0.8],
    [1, 0.95, 1.05, 1],
    [1, 1, 1, 1.02],
    [1.03, 0.9, 1.12, 1.07],
    [1.08, 0.72, 1.22, 0.9],
    [1.03, 0.88, 1.14, 1.16],
    [1, 0.91, 1.19, 1.13],
    [1.02, 0.66, 1.3, 1.03],
    [1.02, 0.88, 1.21, 1.04],
    [1.06, 0.69, 1.23, 0.88],
    [1.01, 0.91, 1.23, 1.12],
    [1, 0.78, 1.25, 1.05],
    [1.01, 0.96, 1.07, 1.18],
    [0.9, 0.82, 1, 0.8],
    [1.03, 0.86, 1.24, 1.12],
    [1, 0.94, 1.12, 1.14],
    [0.98, 0.68, 1.24, 0.92],
    [1.06, 0.62, 1.21, 0.82],
    [1.01, 0.93, 1.18, 1.12]
  ];
  const [jumpFactor,holdGravity,releaseGravity,fallGravity]=jumpProfiles[index];
  const sections = chapters.length;
  const sectionSize = index===0 || index===16 ? 3020 : 2200;
  // Steamworks alternates compact shooting galleries with longer factory runs.
  const stageWidths=index===0 && sections===18 ? [3170,2390,3300,3110,3075,2520,3420,3160,3310,3100,3030,3500,3205,3140,2980,3310,3680,3250] : index===16 ? [3020,3270,3020,3460,3220,3020] : Array(sections).fill(sectionSize);
  const stageStarts=[0];
  for(const width of stageWidths) stageStarts.push(stageStarts.at(-1)+width);
  const finish=stageStarts[sections];
  function stageAt(x){
    let low=0,high=sections-1;
    while(low<high){
      const mid=Math.ceil((low+high)/2);
      if(x>=stageStarts[mid]) low=mid;
      else high=mid-1;
    }
    return low;
  }
  const finale = ['guardian','sprint','switch','crystals','summit'][goalType];
  const guardian = {
    0:{name:'Furnace Crab',pattern:'hop',hint:'Jump over Baron and land a stomp.'},
    12:{name:'Storm Claw',pattern:'charge',hint:'Use Shovel Drop when it stops charging.'},
    16:{name:'Boiler Breaker',pattern:'volley',hint:'Fire between volleys. Parry a pink shot to bounce away.'},
    19:{name:'Dock Sentinel',pattern:'sweep',hint:'Switch weapons to cover its low and high positions.'},
    21:{name:'Moon Gargoyle',pattern:'dive',hint:'Use the whip or returning cross when it dives.'},
    24:{name:'Cargo Turret',pattern:'barrage',hint:'Jump over low shots and lob grenades from a distance.'}
  }[index] ?? {pattern:'charge',hint:'Jump over Baron’s charge and strike during recovery.'};
  const finaleExitHint = ({
    switch:'Reach the marker and press Jump or Action.',
    crystals:'Collect three crystals, then reach the exit.',
    sprint:'Cross the finish at full speed.',
    summit:'Climb the ledges to reach the exit.'
  })[finale] || 'Reach the exit.';
  const exitX = finish+720;
  const ground = 326;
  const status = message => { byId('side-status').textContent = message; };
  const powerButton = document.querySelector('[data-control="action"]');
  if (movement==='buster') powerButton.textContent='Fire';
  if (movement==='airdash') powerButton.textContent='Dash';
  const techniqueButton = document.querySelector('[data-control=technique]');
  if (techniqueButton) techniqueButton.textContent = techniqueName;
  if(index===8 && movement==='beat') powerButton.textContent='Pulse';
  if(index===2) powerButton.textContent='Charge';
  if(index===7 && power==='flip') powerButton.textContent='Flip';
  if(index===6 && power==='bubble') powerButton.textContent='Float';
  powerButton.hidden = index===3 || power === 'stomp' || power === 'double' || (power === 'swim' && index!==2) || power === 'glide';
  byId('side-player').hidden = false;
  if (power==='swim') byId('touch-stick').setAttribute('aria-label','Drag in four directions to swim');
  byId('side-title').textContent = hero + ' · ' + name;
  const fourWayStick = power==='swim' || movement==='airdash' || [3,9,13,15,18,19].includes(index);
  if(index===19) byId('touch-stick').setAttribute('aria-label','Move left or right. Hold up while firing to aim diagonally.');
  if(index===9) byId('touch-stick').setAttribute('aria-label','Move left or right. While attached, drag up to reel in or down to extend the cable.');
  const controlsGuide = [
    movement==='beat' ? 'Auto-run. Press Space to jump.' :
      power==='swim' ? 'Keyboard: W/A/S/D or arrow keys to swim.' :
      index===9 ? 'Keyboard: A/D to move, Space to jump, and W/S or Up/Down to adjust the attached cable.' :
      index===3 ? 'Keyboard: A/D or Left/Right to run. Hold S or Down and tap Space to charge your spin dash.' :
      movement==='airdash' ? 'Keyboard: A/D or Left/Right to move, Space to jump, W/S or Up/Down to aim your dash.' :
      'Keyboard: A/D or Left/Right to move, Space for '+(power==='flip'?'Flip':'Jump')+'.',
    powerButton.hidden || index===3 ? '' : powerButton.textContent+' uses X.',
    index===18 ? 'Grab a ledge while airborne. Press Up or Jump to climb, or Down to drop.' :
      index===11 ? 'Hold Climb (C) against a wall and steer up or down. Landing restores stamina.' :
      index===16 ? 'Press Jump again near a pink shot while airborne to parry. The Parry button also works.' :
      techniqueButton && !techniqueButton.hidden ? techniqueName+' uses C.' : '',
    'On touch, use the joystick and the labeled buttons.'
  ].filter(Boolean).join(' ');
  const rules=byId('side-rules');
  rules.textContent=(movementGuide[movement] || descriptions[power]+'.')+' '+prologue;
  const controlHelp=document.createElement('p');
  controlHelp.textContent=controlsGuide;
  rules.after(controlHelp);
  const platforms = [];
  const enemies = [];
  const crystals = [];
  const landmarks=[];
  let player, boss, phase, camera, frame, last, clock, chapter, taken, attacks, hazards, escape;
  let escapeRetries = 0;
  let escapeCrystals = 0;
  // Color, silhouette, reach and duration for each adventure's signature move.
  // Technique pose by game: lean, horizontal scale, vertical scale.
  const techniquePoses = [
    [0.12, 1.12, 0.88],
    [0.12, 0.98, 1.05],
    [-0.09, 1.12, 0.94],
    [0.19, 0.9, 1.03],
    [0.21, 1.07, 0.87],
    [0.06, 1.16, 0.91],
    [-0.12, 1.09, 1.03],
    [-0.14, 0.92, 1.08],
    [0.13, 1.1, 0.93],
    [-0.17, 0.96, 1.11],
    [-0.08, 1.07, 1.02],
    [0.19, 1.12, 0.91],
    [0.03, 0.91, 1.16],
    [0.15, 1.06, 0.95],
    [-0.05, 1.07, 0.92],
    [0.19, 1.13, 0.9],
    [-0.16, 1.04, 0.97],
    [0.19, 1.08, 0.93],
    [-0.12, 0.94, 1.12],
    [-0.1, 0.99, 1.08],
    [0.24, 1.14, 0.88],
    [0.2, 1.11, 0.92],
    [0.04, 0.9, 1.18],
    [0.03, 1.16, 0.91],
    [-0.19, 1.02, 1.07]
  ];
  const signatureEffects=[
    ['#ffbe69','arc',82,.32], // Cape sweep
    ['#6ceaff','trail',114,.27], // Dash exhaust
    ['#71f8ed','wave',132,.64], // Sonar pulses
    ['#ffdc68','spiral',52,.36], // Spin streak
    ['#ffd17c','launch',96,.39], // Barrel recoil
    ['#82eaff','impact',73,.29], // Air punch
    ['#ef91fe','pull',92,.48], // Inhale stream
    ['#ba9bff','flip',70,.38], // Gravity reversal
    ['#7bf6ff','tiles',65,.31], // Beat reset
    ['#ffcf85','cable',88,.32], // Cable recoil
    ['#a0ffe0','wave',76,.37], // Wind ring
    ['#ff86b8','climb',70,.33], // Wall climb
    ['#81c7ff','drop',93,.28], // Shovel descent
    ['#ffc183','lob',100,.42], // Lob arc
    ['#97e6ff','spiral',42,.31], // Morph shell
    ['#acffcd','impact',94,.32], // Bash directions
    ['#ff86dc','impact',61,.26], // Parry star
    ['#ffe3a4','arc',94,.27], // Sword stroke
    ['#ffd6a4','climb',50,.29], // Ledge contact
    ['#91ffe8','fan',83,.28], // Weapon spread
    ['#e5ff75','tiles',111,.38], // Taunt burst
    ['#ded3ff','cross',61,.37], // Returning cross
    ['#fff092','drop',65,.30], // Cane bounce
    ['#f89ce4','pull',78,.44], // Yarn draw
    ['#ff9f72','lob',121,.48] // Grenade trail
  ];
  // Peak timing and counter-motion for each hero's technique.
  const techniqueTiming={
    3:[0.21,0.18],
    14:[0.34,0.12],
    19:[0.27,0.16],
    22:[0.13,0.33],
    23:[0.46,0.19],
    1:[0.19,0.34],
    6:[0.55,0.09],
    8:[0.12,0.08],
    10:[0.28,0.18,1.6],
    11:[0.39,0.1],
    12:[0.16,0.28],
    13:[0.4,0.27],
    15:[0.14,0.2],
    16:[0.17,0.32,2.7],
    18:[0.23,0.16],
    0:[.32,.22], // Whisker's cape sweep
    2:[.45,.12], // Luna's sonar pulse
    4:[.24,.36,2.8], // Ivy's barrel launch
    5:[.29,.30], // Frost's air punch
    7:[.18,.12], // Bolt's reversal
    9:[.24,.25], // Stone's cable release
    17:[.31,.39,1.55], // Frost's sword stroke
    20:[.49,.14], // Shadow's taunt
    21:[.26,.41,1.45], // Luna's returning cross
    24:[.37,.32] // Whisker's grenade throw
  };
  function techniqueWeight(progress, timing){
    if(!timing) return Math.sin(progress*Math.PI)*(1-progress*.35);
    const [peak, counter, recoveryCurve=2]=timing;
    if(progress<peak) return Math.sin(progress/peak*Math.PI/2);
    const recovery=(progress-peak)/(1-peak);
    return (1-recovery)**recoveryCurve-counter*Math.sin(Math.PI*recovery)**2;
  }
  let signatureEffect, landingEffect;
  const particles=[];
  let rings=0;
  let amberSwitch=false;
  let reefCacheOpen=false;
  const airCapacity=18;
  const looseRings=[];
  let chapterReveal=0;
  const saveKey='pawcade-platform-checkpoint-'+(index===0 || index===16?'v2-':'v1-')+index;
  const resumeButton=byId('side-resume');
  function readCheckpoint() {
    try {
      const data=JSON.parse(localStorage.getItem(saveKey));
      if (!data || !Number.isInteger(data.stage) || data.stage<1 || data.stage>=sections ||
          !Array.isArray(data.crystals) || !Array.isArray(data.enemies)) return null;
      if (![data.crystals, data.enemies].every(list => list.every(id => Number.isSafeInteger(id) && id >= 0))) return null;
      return data;
    } catch {return null;}
  }
  function saveCheckpoint() {
    try {
      localStorage.setItem(saveKey,JSON.stringify({
        stage:chapter,amberSwitch,reefCacheOpen,rings,
        crystals:crystals.flatMap((c,i)=>c.taken?[i]:[]),
        enemies:enemies.flatMap((e,i)=>e.dead?[i]:[])
      }));
    } catch { return false; }
    resumeButton.hidden=false;
    return true;
  }
  const plan = window.pawtopiaRoomPlans[index].split(' ');
  const setPieces = window.pawtopiaSetPieces[index].split(' ');
  // Optional routes in catalog order. Coordinates are local to the chapter.
  const optionalRoutes = [
    [[1345,269,116],[1498,225,108],[1646,186,106]],
    [[1210,274,132],[1430,215,115],[1640,157,121]],
    [[1190,202,172],[1430,117,132],[1650,172,158]],
    [[1185,277,215],[1420,237,190],[1640,203,160]],
    [[1240,255,108],[1440,192,95],[1650,151,114]],
    [[1210,180,125],[1410,221,130],[1630,268,140]],
    [[1200,254,140],[1400,173,150],[1650,112,130]],
    null,
    null,
    [[1200,270,130],[1370,128,164],[1580,232,160]],
    [[1190,265,116],[1370,208,100],[1555,154,120]],
    [[1230,266,104],[1430,204,100],[1640,140,110]],
    [[1200,279,102],[1400,217,116],[1590,178,126]],
    [[1190,267,138],[1400,214,105],[1610,247,142]],
    null,
    [[1200,276,104],[1390,221,112],[1580,154,135]],
    null,
    [[1215,279,166],[1420,230,119],[1610,187,158]],
    null,
    [[1190,257,175],[1405,224,145],[1600,255,180]],
    null,
    [[1200,277,138],[1370,236,125],[1540,194,135]],
    [[1180,271,116],[1370,217,120],[1565,170,124]],
    [[1190,196,145],[1410,228,155],[1630,264,155]],
    [[1200,274,178],[1430,239,156],[1635,210,148]]
  ];
  for (const [stage, room] of plan.entries()) {
    const start = stageStarts[stage];
    if(index===16){
      // Keep a continuous lower route. The catwalks offer cover and higher firing lanes.
      platforms.push({x:start,y:ground,w:stageWidths[stage],kind:'floor',steamDeck:-1});
      const catwalks=[[[340,275,185],[585,247,230],[885,270,205],[1430,272,225],[1720,212,185],[2010,256,220],[2530,273,250]],
        [[265,267,230],[575,223,155],[830,169,220],[1215,251,220],[1610,225,265],[2110,271,175],[2440,216,280]],
        [[410,260,145],[635,204,145],[875,151,195],[1340,272,270],[1740,221,238],[2150,193,180],[2560,264,255]],
        [[270,275,160],[540,220,195],[855,265,290],[1320,273,140],[1525,223,192],[1850,160,220],[2360,250,310]],
        [[370,264,185],[650,216,195],[990,185,175],[1360,264,225],[1650,232,205],[1950,169,170],[2390,252,330]],
        [[350,269,165],[615,236,245],[990,263,150],[1285,218,210],[1590,185,220],[2100,260,205],[2500,232,260]]];
      catwalks[stage].forEach(([x,y,w],slot)=>{
        platforms.push({x:start+x,y,w,kind:'floor',steamDeck:(stage+slot)%3});
        crystals.push({x:start+x+w*.52,y:y-35});
        if(slot%2===1) enemies.push({
          x:start+x+w*.68,y:y-23,offset:stage+slot,turret:true
        });
      });
      if(stageWidths[stage]>sectionSize){
        const x=start+2860;
        const y=stage===3?224:266;
        platforms.push({x,y,w:stageWidths[stage]-2930,kind:'floor',steamDeck:stage%3});
        crystals.push({x:x+65,y:y-35});
        enemies.push({x:x+100,y:y-23,offset:stage,turret:true});
      }
      for(const x of [950,1490,2150,2720]){
        enemies.push({x:start+x,y:ground-23,offset:stage+x/100,
          patrolLeft:start+x-70,patrolRight:start+x+70});
      }
      continue;
    }
    let libraryEnemyPlaced=false;
    let reefEnemyPlaced=false;
    let clockEnemyPlaced=false;
    const pieces = window.pawtopiaRooms[room];
    for (const [slot, [x, y, w, kind = 'floor']] of pieces.entries()) {
      platforms.push({x:start+x,y,w,kind});
      // Decorative, dangerous, temporary and overhead surfaces are not
      // safe enemy spawn locations. Keep encounters on stable walkable ledges.
      if (['hazard','rail','ceiling','ceilingSpikes','current','drop','spring','lift','pogo'].includes(kind) || w<65) continue;
      if (x>150 || w>850) {
        // Stage-specific encounter density: later chapters add one
        // opponent only on sufficiently broad, walkable platforms.
        // Keep early chapters sparse and avoid overcrowding narrow ledges.
        const baseCount=Math.max(1,Math.floor(w/(room==='arena'?420:540)));
        // Encounter density follows each course's traversal identity:
        // fast courses keep wider reaction gaps, while combat-oriented
        // courses use more sustained pressure on safe, wide platforms.
        // Individual enemy spacing in each world, based on its traversal
        // demands: speed routes need longer reaction time, while
        // precision and combat courses can support closer encounters.
        const worldEncounterMargins=[
          22,15,26,34,18,24,20,12,32,18,23,19,16,21,14,25,13,18,11,16,36,14,20,23,17
        ];
        // Individual minimum reaction distances before each encounter.
        // Long acceleration corridors need more breathing room than
        // deliberate combat, precision and exploration passages.
        const worldReactionDistances=[
          140,125,160,220,145,175,145,180,230,160,180,220,150,155,170,165,145,160,195,175,240,160,155,200,175
        ];
        const fastCourse=[3,7,8,11,20,23].includes(index);
        const combatCourse=[1,12,16,19,21,24].includes(index);
        const extraEncounter=stage>=3 && w>=720 &&
          slot%3===stage%3 && !fastCourse ? 1:0;
        const combatEncounter=combatCourse && stage>=2 &&
          w>=880 && slot%4===stage%4 ? 1:0;
        // Keep simultaneous enemy counts bounded on mobile while still
        // giving later chapters denser encounters on large platforms.
        // Every adventure has its own six-chapter encounter budget.
        // Early precision and speed stages stay readable; combat stages
        // can sustain more opponents as their mechanics are introduced.
        const worldEncounterCaps=[
          [2,3,3,4,4,5],
          [2,2,3,3,4,5],
          [1,2,2,3,3,4],
          [1,1,2,2,3,3],
          [1,2,2,3,4,4],
          [1,2,2,3,3,5],
          [1,2,3,3,4,4],
          [1,1,2,2,2,3],
          [0,1,1,2,2,3],
          [1,2,2,3,4,4],
          [1,1,2,2,3,3],
          [1,1,2,2,3,4],
          [2,2,3,3,4,5],
          [1,2,2,3,3,4],
          [1,2,2,3,4,4],
          [1,2,2,3,3,4],
          [2,2,3,4,4,5],
          [1,2,2,3,3,5],
          [1,1,2,2,3,3],
          [2,2,3,3,4,5],
          [1,1,2,2,3,3],
          [2,2,3,3,4,5],
          [1,2,2,3,3,4],
          [1,1,2,2,3,4],
          [2,2,3,4,4,5]
        ];
        const chapterCap=worldEncounterCaps[index][Math.min(stage,5)];
        const count=Math.min(chapterCap,baseCount+extraEncounter+combatEncounter);
        for(let encounter=0;encounter<count;encounter++) {
          // Alternate staggered encounter positions without changing the
          // underlying level geometry or pushing foes off a platform.
          // Speed courses need more room to accelerate; combat courses
          // can use tighter encounter spacing without changing platforms.
          const spacing=worldEncounterMargins[index];
          // Waterfall–Quarry: unique reaction spacing for this group.
          // Sunset–Observatory: unique reaction spacing for this group.
          // Bamboo–Submarine: unique reaction spacing for this group.
          // Neon–Starship: unique reaction spacing for this group.
          const stagger=((index*11+stage*7+slot*3)%5-2)*spacing;
          // Reserve a full body-width at each edge so foes do not spawn
          // with their feet hanging over narrow or staggered ledges.
          const edgeMargin=Math.min(38,Math.max(16,w*.2));
          const offset=Math.max(edgeMargin,Math.min(w-edgeMargin,
            Math.round(w*(encounter+1)/(count+1))+stagger));
          // Deterministic encounter archetypes: different patrol rhythms
          // within each stage, without randomizing checkpoint resumes.
          // A later chapter deliberately introduces more raiders and
          // skirmishers while retaining a mix of scouts and sentries.
          const archetype=stage>=4 && (slot+encounter)%3===0 ? 3 :
            stage>=2 && (slot+encounter)%4===0 ? 2 :
            (stage*3+slot+encounter+index)%4;
          // Keep the start of each chapter clear for checkpoint respawns.
          // Do not remove foes elsewhere: the authored combat lanes remain.
          // Respect each adventure's approach corridor so players have
          // room to see and respond to the first enemy after a transition.
          if(x+offset<worldReactionDistances[index]) continue;
          const foe={x:start+x+offset,y:y-23,offset:slot+stage+encounter,
            archetype,spawnChapter:stage};
          if(index===1 && !libraryEnemyPlaced && x>=250 && w>=100){
            foe.libraryEnemy=stage;
            foe.patrolLeft=start+x+22;
            foe.patrolRight=start+x+w-22;
            libraryEnemyPlaced=true;
          }
          if(index===2 && !reefEnemyPlaced && w>=100){
            foe.reefEnemy=stage;
            // Keep authored swimmers within their source platform's span.
            foe.x=start+x+Math.min(w-30,Math.max(30,w*.5));
            foe.y=[198,154,204,124,181,148][stage];
            reefEnemyPlaced=true;
          }
          if(index===3 && !clockEnemyPlaced && x>=250 && w>=120){
            foe.clockEnemy=stage;
            foe.patrolLeft=start+x+26;
            foe.patrolRight=start+x+w-26;
            clockEnemyPlaced=true;
          }
          // Keep staggered enemies from spawning on top of one another.
          // Compare only foes on the same walking surface; swimmers use
          // their own authored vertical movement and must remain exempt.
          const minimumGap=Math.min(60,Math.max(28,w/(count+1)*.45));
          if(!foe.reefEnemy && enemies.some(other=>
            !other.reefEnemy && Math.abs(other.y-foe.y)<8 &&
            Math.abs(other.x-foe.x)<minimumGap)) continue;
          enemies.push(foe);
        }
      }
      if(x>0) crystals.push({x:start+x+w*.58,y:y-35});
    }
    // Optional elevated routes above long, safe ground runs. Each game uses
    // its own width, cadence and elevation profile, inspired by its traversal
    // identity rather than copied level geometry. These are real collidable
    // platforms, not decorative overlays; keep the original main path intact.
    const routeWidths=[125,165,190,220,135,155,145,110,95,180,165,115,150,140,175,125,185,155,120,200,235,145,130,150,195];
    const routeHeights=[76,100,92,68,88,108,85,115,62,110,94,122,83,90,112,118,78,95,108,102,65,105,87,100,90];
    const longGround=pieces.filter(([rx,ry,rw,rk='floor'])=>
      rk==='floor' && ry>=310 && rw>=560);
    for(const [rx,ry,rw] of longGround){
      const fastRoute=[3,8,20].includes(index);
      const aerialRoute=[5,6,10,11,15,23].includes(index);
      const precisionRoute=[7,9,14,18,21].includes(index);
      const aquaticRoute=[2,19].includes(index);
      // Counterpart-inspired pacing: fast runners get fewer, longer
      // platforms; climbers and aerial adventures get denser steps.
      const routeCount=fastRoute?(rw>=1250?2:1):
        (aerialRoute||precisionRoute)?(rw>=1250?4:rw>=850?3:1):
        rw>=1250?3:rw>=850?2:1;
      for(let route=0;route<routeCount;route++){
        // Speed courses use broad landing decks; aerial courses use
        // alternating stepping stones; precision courses use narrower,
        // higher ledges. Swimming routes stay open for free movement.
        const widthFactor=fastRoute?1.38:precisionRoute?.72:
          aerialRoute?.82:aquaticRoute?.88:1;
        const routeW=Math.max(70,Math.round((routeWidths[index]+
          ((stage+route)%3-1)*12)*widthFactor));
        const routeDrift=aerialRoute?(route%2?48:-34):
          precisionRoute?(route%2?-25:25):0;
        const localX=rx+Math.round(rw*(route+1)/(routeCount+1)-
          routeW*.5+routeDrift);
        const routeRise=routeHeights[index]+
          (precisionRoute?12:aerialRoute?9:fastRoute?-12:0);
        const routeY=ry-routeRise-((stage+route)%3)*17;
        if(localX<rx+185 || localX+routeW>rx+rw-95 ||
           routeY<100) continue;
        const worldX=start+localX;
        // Avoid intersecting any existing geometry, including hazards
        // and overhead structures, not only similarly elevated ledges.
        const overlaps=platforms.some(ledge=>
          ledge.x<worldX+routeW+18 && ledge.x+ledge.w>worldX-18 &&
          Math.abs(ledge.y-routeY)<65);
        if(!overlaps && worldX+routeW<=start+stageWidths[stage]-55){
          // Give each world's upper path a traversal identity instead of
          // repeating plain floors. Only use established platform kinds.
          const upperRouteKinds=[
            ['floor','spring','floor'],['shelf','floor','shelf'],
            ['current','floor','current'],['belt','floor','belt'],
            ['barrel','floor','barrel'],['lift','floor','lift'],
            ['spring','floor','spring'],['floor','shelf','floor'],
            ['spring','floor','spring'],['floor','lift','floor'],
            ['floor','lift','floor'],['lift','floor','lift'],
            ['pogo','floor','pogo'],['floor','spring','floor'],
            ['shelf','floor','shelf'],['lift','floor','lift'],
            ['shelf','floor','shelf'],['ice','floor','ice'],
            ['shelf','floor','shelf'],['current','floor','current'],
            ['belt','floor','belt'],['shelf','floor','shelf'],
            ['pogo','floor','pogo'],['spring','floor','spring'],
            ['shelf','floor','shelf']
          ];
          const upperKind=upperRouteKinds[index][(stage+route)%3];
          platforms.push({x:worldX,y:routeY,w:routeW,kind:upperKind,
            optionalRoute:true});
          crystals.push({x:worldX+routeW*.5,y:routeY-35});
        }
      }
    }
    if(index===0){
      const remaining=stageWidths[stage]-2170;
      const gap=stage%3===0?52:64;
      const span=Math.floor((remaining-2*gap)/3);
      const rise=[36,0,54,46,25,0,55,42,55,18,38,52,53,45,39,30,55,48][stage] ?? 36;
      const middle=start+2170+span+gap;
      platforms.push({x:start+2170,y:326,w:span,kind:'floor'});
      platforms.push({x:middle,y:326-rise,w:span,kind:'floor'});
      platforms.push({x:middle+span+gap,y:326,w:remaining-2*(span+gap),kind:'floor'});
      platforms.push({x:middle,y:220-stage%3*10,w:Math.min(span,105),kind:'floor'});
      crystals.push({x:middle+span*.3,y:286-rise});
      enemies.push({x:middle+span*.7,y:303-rise,offset:stage+8,
        foundryEnemy:stage<18?stage:undefined, patrolLeft:middle+12, patrolRight:middle+span-12});
    }
    const feature=setPieces[stage];
    const anchor=start+1050;
    // The same set-piece category now has chapter-specific platform
    // geometry. Variation stays within the authored encounter corridor.
    const setpieceShift=((stage*7+index*3)%5-2)*13;
    const setpieceRise=((stage+index)%3-1)*12;
    const add=(x,y,w,kind)=>platforms.push({
      x:anchor+x+setpieceShift,
      y:Math.max(85,y+setpieceRise),
      w:Math.max(48,w+((stage+index)%3-1)*14),
      kind
    });
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
        for(let n=0;n<4;n++){
          const rise=index===15 ? [0,33,76,125][n] : n*37;
          const width=index===15 ? [134,116,118,100][n] : 118;
          add(40+n*152,277-rise,width,n===2?'lift':'floor');
        }
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
    // Keep supplemental landings clear of authored terrain and hazards.
    const addOptionalLanding = (x,y,w,kind) => {
      const clear=platforms.every(ledge =>
        x+w+12<=ledge.x || x>=ledge.x+ledge.w+12 ||
        Math.abs(y-ledge.y)>=64
      );
      if(!clear) return false;
      platforms.push({x,y,w,kind});
      return true;
    };
    const clearLane=[7,8,14,18,20].includes(index);
    if(index!==7 && index!==14) {
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
      const courseRoute=optionalRoutes[index];
      for(let branch=0;branch<3;branch++){
        const [x,y,bw]=courseRoute?.[branch] ?? [1330+branch*155,230,92];
        // Vary the branch profile by chapter, while preserving each
        // adventure's distinct traversal mechanic and authored baseline.
        const branchWidth=Math.max(68,bw+((stage+branch)%3-1)*14);
        const bx=start+x+(stage%3)*12+(branch===1?stage%2*18:0);
        const by=y+(stage%2)*5+((stage+branch)%3-1)*10;
        // Only reward reachable, actually placed bonus platforms. Previous
        // logic could leave a crystal floating where placement was rejected.
        if(!clearLane && addOptionalLanding(bx,by,branchWidth,route[branch]))
          crystals.push({x:bx+branchWidth/2,y:by-35});
      }
    }
    // Individually paced challenge pockets for all six chapters. These
    // supplement, rather than replace, the existing authored room geometry.
    const challengeSeed=(index*23+stage*17)%7;
    const challengeX=start+Math.max(160,Math.min(stageWidths[stage]-570,450+challengeSeed*36));
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
    // Give action-heavy adventures their own interactive challenge surfaces,
    // not just generic ledges. Reuse existing collision/physics behaviors.
    const gameChallengeKinds={
      0:['floor','spring','floor'], 1:['shelf','lift','shelf'],
      2:['current','current','current'], 3:['belt','spring','belt'],
      4:['barrel','spring','barrel'], 5:['lift','floor','lift'],
      6:['spring','floor','spring'], 7:['floor','shelf','floor'],
      8:['spring','floor','spring'], 9:['rail','lift','rail'],
      10:['current','lift','current'], 11:['lift','floor','lift'],
      12:['pogo','floor','pogo'], 13:['shelf','spring','shelf'],
      14:['shelf','lift','shelf'], 15:['lift','spring','lift'],
      16:['shelf','belt','shelf'], 17:['ice','shelf','ice'],
      18:['shelf','floor','shelf'], 19:['current','lift','current'],
      20:['belt','spring','belt'], 21:['shelf','floor','shelf'],
      22:['pogo','spring','pogo'], 23:['spring','lift','spring'],
      24:['shelf','lift','shelf']
    };
    const challengeKinds=gameChallengeKinds[index]||
      challengeTypes[movement]||['floor','shelf','floor'];
    const challengeHeights=[277,249,223,258,234,267];
    // Platform rhythm is based on the counterpart's movement vocabulary:
    // rapid runways, staggered aerial landings, tight climbing steps,
    // underwater current lanes and deliberate precision jumps.
    const rhythmFamilies=[
      'steps','precision','water','run','steps','aerial','aerial',
      'precision','run','climb','aerial','climb','steps','steps',
      'precision','aerial','run','steps','precision','water',
      'run','precision','steps','aerial','run'
    ];
    const rhythm=rhythmFamilies[index];
    const rhythmProfiles={
      run:{spacing:164,width:132,rises:[0,-12,0]},
      aerial:{spacing:148,width:96,rises:[16,-32,9]},
      climb:{spacing:132,width:102,rises:[18,-17,-45]},
      precision:{spacing:146,width:78,rises:[12,-25,17]},
      water:{spacing:160,width:130,rises:[-25,22,-8]},
      steps:{spacing:138,width:108,rises:[13,-18,-35]}
    };
    const profile=rhythmProfiles[rhythm];
    for(let part=0;part<3;part++){
      const cx=challengeX+part*profile.spacing;
      const cy=Math.max(110,challengeHeights[(stage+index)%6]+
        profile.rises[part]+((stage%3)-1)*8);
      const cw=profile.width+(part===1?12:0);
      if(!clearLane && addOptionalLanding(cx,cy,cw,challengeKinds[part]) &&
         part===1) crystals.push({x:cx+cw/2,y:cy-45});
    }
    // Individually authored traversal signatures, one per adventure.
    // These are optional, collision-tested ledges; the authored main route
    // remains intact. Chapter rotation varies the sequence without copying
    // counterpart maps or using the same layout across different games.
    const signatureRoutes=[
      [[0,286,170,'floor'],[198,238,96,'spring'],[348,210,142,'floor']],
      [[0,278,182,'shelf'],[225,209,112,'lift'],[393,252,168,'shelf']],
      [[0,224,220,'current'],[270,275,190,'current'],[516,205,142,'floor']],
      [[0,285,298,'belt'],[337,233,133,'spring'],[516,278,256,'belt']],
      [[0,281,155,'barrel'],[192,233,127,'floor'],[370,199,150,'barrel']],
      [[0,284,134,'floor'],[180,224,120,'lift'],[352,174,123,'floor']],
      [[0,283,132,'spring'],[181,246,150,'floor'],[381,202,122,'spring']],
      [[0,274,114,'floor'],[160,210,90,'shelf'],[305,263,114,'floor']],
      [[0,284,168,'floor'],[213,240,125,'spring'],[385,284,166,'floor']],
      [[0,285,154,'floor'],[205,206,114,'rail'],[377,173,135,'lift']],
      [[0,280,175,'floor'],[226,222,133,'lift'],[409,191,160,'floor']],
      [[0,280,114,'lift'],[165,215,115,'floor'],[335,164,114,'lift']],
      [[0,283,146,'pogo'],[203,236,155,'floor'],[404,207,146,'pogo']],
      [[0,281,145,'floor'],[193,234,115,'spring'],[350,201,150,'shelf']],
      [[0,275,147,'shelf'],[206,214,126,'floor'],[385,175,149,'shelf']],
      [[0,283,150,'lift'],[197,228,118,'spring'],[365,186,151,'lift']],
      [[0,279,215,'shelf'],[260,237,164,'belt'],[466,281,183,'shelf']],
      [[0,285,172,'ice'],[220,242,125,'shelf'],[398,207,172,'ice']],
      [[0,284,112,'shelf'],[169,235,99,'floor'],[331,197,110,'shelf']],
      [[0,237,204,'current'],[252,273,161,'lift'],[464,213,179,'current']],
      [[0,283,284,'belt'],[329,233,147,'spring'],[524,283,269,'belt']],
      [[0,283,138,'shelf'],[189,232,124,'floor'],[361,196,138,'shelf']],
      [[0,283,141,'pogo'],[193,241,116,'spring'],[359,212,142,'pogo']],
      [[0,283,137,'spring'],[181,228,123,'lift'],[350,195,137,'spring']],
      [[0,283,194,'shelf'],[246,229,165,'lift'],[464,273,200,'shelf']]
    ];
    if(!clearLane){
      const signature=signatureRoutes[index];
      const signatureSpan=Math.max(...signature.map(([dx,,sw])=>dx+sw))+28;
      const signatureX=start+Math.max(220,Math.min(
        stageWidths[stage]-signatureSpan-100,
        1510+stage%3*47));
      const signatureFits=stageWidths[stage]>=signatureSpan+320;
      // Five original challenge beats per adventure: teach the movement,
      // practice it, introduce a safe variation, combine, then reward.
      // Each world gets a distinct stage rhythm, rather than a generic
      // difficulty multiplier applied to every platformer.
      const worldBeatOrders=[
        [0,1,2,3,4],[0,2,1,3,4],[1,0,2,4,3],[0,1,3,2,4],[1,2,0,3,4],
        [0,2,3,1,4],[1,0,3,2,4],[2,0,1,4,3],[0,3,1,2,4],[1,3,0,2,4],
        [2,1,0,3,4],[0,2,1,4,3],[1,0,2,4,3],[2,0,3,1,4],[0,3,2,1,4],
        [1,2,3,0,4],[0,1,3,4,2],[2,1,3,0,4],[1,3,2,0,4],[0,2,4,1,3],
        [0,3,1,4,2],[1,0,4,2,3],[2,1,0,4,3],[0,2,3,4,1],[1,3,0,4,2]
      ];
      // Original, individually authored mechanical palettes for all 25
      // adventures. Chapter beats select an interaction rather than merely
      // changing geometry, preserving each world's distinct movement rules.
      const worldMechanicPalettes=[
        ['floor','spring','shelf','floor','spring'],
        ['shelf','floor','lift','shelf','lift'],
        ['current','current','floor','current','current'],
        ['belt','belt','spring','belt','floor'],
        ['barrel','spring','floor','barrel','barrel'],
        ['lift','floor','lift','spring','floor'],
        ['spring','lift','floor','spring','spring'],
        ['shelf','floor','shelf','floor','floor'],
        ['spring','floor','spring','floor','spring'],
        ['floor','lift','rail','floor','rail'],
        ['current','floor','lift','current','floor'],
        ['lift','spring','floor','lift','lift'],
        ['pogo','spring','floor','pogo','pogo'],
        ['floor','shelf','spring','floor','spring'],
        ['shelf','lift','floor','shelf','floor'],
        ['lift','floor','spring','lift','lift'],
        ['shelf','belt','floor','belt','shelf'],
        ['ice','floor','shelf','ice','ice'],
        ['floor','shelf','floor','shelf','shelf'],
        ['current','floor','lift','current','current'],
        ['belt','spring','floor','belt','spring'],
        ['shelf','floor','shelf','shelf','floor'],
        ['pogo','floor','spring','pogo','pogo'],
        ['spring','floor','lift','spring','spring'],
        ['shelf','belt','lift','floor','shelf']
      ];
      const beatOrder=worldBeatOrders[index];
      const chapterBeat=beatOrder[stage%beatOrder.length];
      for(const [slot,[dx,sy,sw,kind]] of (signatureFits?signature:[]).entries()){
        const sx=signatureX+dx;
        const height=sy+((stage+slot)%3-1)*8+
          (chapterBeat===2?-12:chapterBeat===4?8:0);
        const width=Math.max(80,sw+((stage+slot)%2)*10+
          (chapterBeat===0?18:chapterBeat===3?-8:0));
        // Underwater worlds use current-assisted stepping routes; retain
        // the existing water physics and leave ample swim-through space.
        const selectedKind=worldMechanicPalettes[index][
          (chapterBeat+slot)%worldMechanicPalettes[index].length];
        const swimKind=(index===2||index===19) && selectedKind==='lift'
          ? 'current':selectedKind;
        // Do not append a ledge past the chapter's right boundary.
        if(sx+width>start+stageWidths[stage]-75) continue;
        if(addOptionalLanding(sx,height,width,swimKind)){
          // Exploration-focused worlds place optional rewards on alternate
          // landings; speed worlds mark the center of a flowing route.
          const exploration=[2,4,6,13,15,17,22,23].includes(index);
          const speed=[3,8,20].includes(index);
          const rewardSlot=exploration?2:speed?0:1;
          if(slot===rewardSlot)
            crystals.push({x:sx+width/2,y:height-37});
        }
      }
    }
    // A guarded optional reward on the alternate route. Existing enemy AI
    // handles this encounter, so no new combat controls are required.
    if(index!==7 && index!==14){
      const guardX=challengeX+290;
      // A guard needs an actual solid floor beneath it; otherwise the
      // procedural encounter may spawn over a pit or an elevated hazard.
      const guardFloor=platforms.filter(ledge=>
        ['floor','ice','belt','barrel','pogo','shelf'].includes(ledge.kind) &&
        ledge.x<=guardX-18 && ledge.x+ledge.w>=guardX+18 &&
        ledge.y>=225 && ledge.y<=ground+8
      ).sort((a,b)=>b.y-a.y)[0];
      if(guardFloor){
        enemies.push({x:guardX,y:guardFloor.y-23,
          offset:stage+index+31,
          patrolLeft:Math.max(guardFloor.x+20,guardX-50),
          patrolRight:Math.max(guardX,
            Math.min(guardFloor.x+guardFloor.w-20,guardX+50)),
          turret:movement==='shooter'||movement==='buster'});
        crystals.push({x:guardX+42,y:guardFloor.y-44});
      }
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
    const trailBase=start+Math.max(120,Math.min(stageWidths[stage]-490,630+((index*29+stage*41)%6)*44));
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
    if(!clearLane && movement!=='swim'){
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
      // Author a different island rhythm for each traversal family.
      // Narrow stepping stones serve precision games; wider decks support
      // speed and combat; staggered heights reward aerial and climbing play.
      const islandFamilies=[
        'steps','combat','water','speed','steps','aerial','aerial',
        'precision','speed','climb','aerial','climb','combat','steps',
        'precision','aerial','combat','precision','precision','water',
        'speed','combat','steps','aerial','combat'
      ];
      const islandProfiles={
        steps:{width:100,gap:132,heights:[282,249,219]},
        combat:{width:142,gap:174,heights:[277,251,228]},
        water:{width:155,gap:188,heights:[244,264,232]},
        speed:{width:170,gap:194,heights:[286,275,283]},
        aerial:{width:94,gap:146,heights:[282,235,206]},
        precision:{width:76,gap:126,heights:[275,238,218]},
        climb:{width:102,gap:140,heights:[287,244,197]}
      };
      const islandProfile=islandProfiles[islandFamilies[index]];
      const islandSpan=islandProfile.gap*2+islandProfile.width+12;
      const islandX=start+Math.max(180,Math.min(
        stageWidths[stage]-islandSpan-95,
        780+((index*11+stage*19)%5)*38));
      for(let island=0;island<3;island++){
        const iw=islandProfile.width+(island===1?12:0);
        const ix=islandX+island*islandProfile.gap;
        const iy=islandProfile.heights[island]+((stage%3)-1)*9;
        // Reject platforms that visually intersect existing terrain, block
        // hazards, or leave an unusably narrow vertical clearance. The prior
        // exact-Y test missed almost every near-overlap.
        const islandClear=platforms.every(ledge=>{
          const horizontalOverlap=ix<ledge.x+ledge.w+12 && ix+iw+12>ledge.x;
          if(!horizontalOverlap)return true;
          const verticalDistance=Math.abs(iy-ledge.y);
          if(['hazard','ceilingSpikes','ceiling','rail'].includes(ledge.kind))
            return verticalDistance>=58;
          return verticalDistance>=52;
        });
        if(islandClear && ix+iw<=start+stageWidths[stage]-65){
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
  if(power==='flip' && index!==7){
    for(let stage=0;stage<sections;stage++){
      const x=stageStarts[stage];
      platforms.push({x,y:32,w:stageWidths[stage],kind:'ceiling'});
      for(const offset of [315,1010,1785]){
        platforms.push({x:x+offset+stage*11,y:68,w:50+stage*5,kind:'ceilingSpikes'});
      }
    }
  }
  platforms.push({x:finish,y:ground,w:850,kind:'floor'});
  if(power==='flip') platforms.push({x:finish,y:32,w:850,kind:'ceiling'});
  const returnFloor={x:0,y:ground,w:finish,kind:'floor'};
  if (finale === 'summit') {
    for (let i=0;i<4;i++) platforms.push({x:finish+310+i*110,y:ground-38-i*31,w:119,kind:'lift'});
  }
  if (finale === 'crystals') {
    for(let i=0;i<3;i++) crystals.push({x:finish+140+i*160,y:ground-24});
  }
  const walls = wallMoves ? plan.map((room,stage)=>({
    x:stageStarts[stage]+(movement==='buster'?700:800),top:movement==='buster'?200:163
  })) : [];
  for(const wall of walls) {
    platforms.push({x:wall.x,y:wall.top,w:20,kind:'floor'});
    platforms.push({x:wall.x-225,y:wall.top+126,w:105,kind:'floor'});
    platforms.push({x:wall.x-160,y:wall.top+62,w:145,kind:'floor'});
    platforms.push({x:wall.x+24,y:wall.top+49,w:106,kind:'floor'});
  }
  const observatoryTunnelWidths = [86, 114, 158, 104, 172, 126];
  const tunnels = index===14 ? plan.map((_,stage)=>({
    x:stageStarts[stage]+480,w:observatoryTunnelWidths[stage],y:ground-33
  })) : [];
  const resetPlayer = (x = 100) => ({
    x,y:ground-22,air:airCapacity,vx:0,vy:0,facing:1,on:false,jumps:0,gravity:1,health:3,grace:0,power:0,spin:0,dashUsed:false,chargeStart:null,climbStamina:1.8,jumpBuffer:0,coyote:0,jumpCut:false
  });
  function reset() {
    amberSwitch=false;
    reefCacheOpen=false;
    player = resetPlayer();
    boss = {x:finish+465,y:ground-41,health:finale==='guardian'?5:0,grace:0,time:0,nextShot:1};
    enemies.forEach(e => {e.dead = false;e.shotAt=0;e.lastShotAt=undefined;e.shotsFired=0;e.bashed=null;e._drawX=undefined;e._gait=0;e.gaitWeight=0;e.gaitTime=undefined;e.faceLeft=undefined;e._attackPose=0;e._previousDrawY=undefined;e._lastVerticalSpeed=0;e._landingPose=0;e._bodyVelocity=0;});
    platforms.forEach(ledge=>{ledge.dropAt=undefined;});
    crystals.forEach(c => {c.taken = false;});
    camera = chapter = taken = clock = 0;
    escape = null;
    escapeRetries = 0;
    escapeCrystals = 0;
    particles.length=0;
    signatureEffect=null;
    landingEffect=null;
    looseRings.length=0;
    rings=0;
    amberSwitch=false;
    chapterReveal=0;
    attacks = [];
    hazards = [];
    phase = 'ready';
    status(resetStick ? opening + '. Gameplay reference: ' + reference + '.' : 'The touch joystick could not load. Refresh to retry.');
    hud();
    draw();
  }
  function hud() {
    byId('side-progress').textContent = 'Stage ' + Math.min(sections,chapter+1) + ' / ' + sections + ' · ' + chapters[chapter] + ' · Hearts ' + player.health + (index===3 ? ' · Rings '+rings : ' · Crystals '+taken) + (index===2?' · Air '+Math.ceil(player.air)+'s':'');
  }
  function jump(buffer = true) {
    if (phase !== 'playing') return;
    if (power==='flip') {if(buffer) action();return;}
    if (player.ledgeGrip) {climbFromLedge(player);return;}
    if (buffer && index===16 && !player.on && player.techCooldown<=0 && hazards.some(h=>h.parry && h.life>0 && close(player,h,55,55))) {
      useTechnique();
      return;
    }
    // Use the selected course's input forgiveness window on the initial
    // button press, not only after the simulation starts counting it down.
    if (buffer) player.jumpBuffer=[.115,.095,.11,.075,.11,.12,.13,.075,.05,.095,
      .12,.14,.09,.115,.105,.13,.085,.11,.085,.1,.065,.085,.12,.13,.09][index];
    if (index===3 && held('down') && player.on) {player.spin=Math.min(5,player.spin+1);player.jumpBuffer=0;return;}
    if (buffer && index===10 && player.carry && !player.on) {
      player.windRelease={x:player.x,y:player.y-44,time:clock};
      player.carry=false;player.vy=-jumpSpeed;player.jumpBuffer=0;
      player.coyote=0;
      player.jumpCut=false;player.jumpAge=0;
      return;
    }
    if(player.cable){
      player.cable=null;
      player.grapple=.18;
      player.jumpBuffer=0;
      player.coyote=0;
      player.jumpCut=false;
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
    const rollJump=index===4 && movement==='roll' && player.power>.22 && player.jumps===0;
    if (player.on || rollJump || player.coyote>0 || power === 'swim' || (power === 'double' && player.jumps < 2)) {
      if(index===3 && player.power>.22) player.spinJump=true;
      player.vy = -jumpSpeed * jumpFactor * player.gravity;
      player.on = false;
      player.jumps++;
      playCue(220,390,.09);
      player.coyote=0;
      player.jumpBuffer=0;
      player.jumpCut=power!=='swim' && movement!=='beat';
      player.jumpAge=0;
    }
  }
  function findGrappleAnchor(p) {
    const steer=Number(held('right'))-Number(held('left'));
    return platforms.reduce((nearest, ledge) => {
      if(ledge.kind!=='rail') return nearest;
      const x=ledge.x+ledge.w/2;
      const y=ledge.y+8;
      const dx=x-p.x;
      if(p.y<=y+16 || Math.abs(dx)>=230) return nearest;
      const distance=Math.hypot(dx,p.y-y);
      // Downstream rails take priority while steering. Let go of the
      // joystick to select the nearest anchor in either direction.
      const behind=index===9 && steer!==0 && dx*steer< -8;
      const score=distance+(behind?400:0);
      return nearest && score>=nearest.score ? nearest : {x,y,distance,score};
    },null);
  }
  function action() {
    if (phase==='playing' && movement==='buster') {player.chargeStart ??= clock;return;}
    if (index===3) return;
    if (index===2 && phase==='playing' && player.power<=0) {
      player.facing=(Number(held('right'))-Number(held('left')))||player.facing;
      player.vx=player.facing*530;player.grapple=.25;player.power=.4;
      player.grace=Math.max(player.grace,.25);
      return;
    }
    if (movement==='airdash' && player.dashUsed) return;
    if (phase !== 'playing' || (player.power > 0 && movement!=='airdash') || (movement==='airdash' && player.on)) return;
    if (power==='flip' && !player.on) return;
    const anchor=power==='grapple' && !player.cable ? findGrappleAnchor(player) : null;
    if(power==='grapple' && !anchor) return;
    player.power = movement==='buster' || movement==='shooter' ? .24 : .48;
    if (power === 'dash') {
      player.vx = player.facing * (movement==='roll'?460:660);
      if (movement==='airdash') {
        player.dashUsed=true;
        player.wallLock=0;
        player.jumpBuffer=0;
        player.jumpCut=false;
        player.coyote=0;
        const dx=Number(held('right'))-Number(held('left'));
        const dy=Number(held('down'))-Number(held('up'));
        const length=Math.hypot(dx,dy)||1;
        player.vx=(dx || (dy ? 0 : player.facing))*660/length;
        player.vy=dy*660/length;
      }
    }
    if (power === 'flip' && player.on) {
      player.gravity *= -1;
      player.on = false;
      player.flipTime=clock;
      player.coyote=0;
      player.jumpBuffer=0;
      player.jumpCut=false;
    }
    if (power === 'vine') {
      player.vy = -590;
      player.on=false;
      player.coyote=0;
      player.jumpBuffer=0;
      player.jumpCut=false;
      if (index === 4 && !reducedMotion) {
        burst(player.x,player.y+17,'#a7f08b',8);
      }
    }
    if (anchor) {
          player.cable={x:anchor.x,y:anchor.y,length:anchor.distance,maxLength:Math.max(240,anchor.distance)};
          player.vx+=Math.sign(anchor.x-player.x)*130;
          playCue(180,620,.14);
    }
    if (power === 'throw' || power === 'pulse' || power === 'photo') {
      const onBeat = isOnBeat(clock % beatPeriod);
      const speed = movement==='whip' ? 240 : power==='throw' ? 700 : 400;
      const life = movement==='whip' ? .24 : movement==='beat' && onBeat ? .72 : power==='throw' ? .8 : .36;
      const aim=Number(held('right'))-Number(held('left'));
      const facing=aim||player.facing;
      const projectile={x:player.x,y:player.y,v:facing*speed,life};
      if(index===8) projectile.accent=onBeat;
      if(index===19 && held('up')){
        projectile.v=facing*speed*.7;
        projectile.vy=-speed*.7;
      }
      if(index===21 && movement==='whip'){
        projectile.whip=true;
        projectile.originX=player.x;
        projectile.originY=player.y;
      }
      if(index===13 && power==='throw') projectile.motionTrail='lob';
      if(index===17 && power==='throw'){
        projectile.v=facing*490;
        projectile.vy=-140;
        projectile.gravity=380;
      }
      if(index===13 && power==='throw' && held('up')){
        projectile.v=facing*460;
        projectile.vy=-285;
        projectile.gravity=570;
      }
      if(index===19 || index===24){
        const facing=Math.sign(projectile.v)||player.facing;
        player.shotPose={time:clock,facing,angle:Math.atan2(projectile.vy||0,Math.abs(projectile.v))};
      }
      if(index===13 || index===17){
        player.throwPose={time:clock,facing,angle:Math.atan2(projectile.vy||0,Math.abs(projectile.v))};
      }
      attacks.push(projectile);
      playCue(470,180,.085);
      if(player.altWeapon) for(const offset of [-105,105]) {
        attacks.push({x:player.x,y:player.y,v:projectile.v,vy:(projectile.vy||0)+offset,life});
      }
    }
  }
  const fullChargeTime = .65;
  function releaseAction(fire) {
    if (movement!=='buster' || player.chargeStart===null || held('action')) return;
    const charged=clock-player.chargeStart>=fullChargeTime;
    player.chargeStart=null;
    if (fire && phase==='playing') {
      playCue(charged?610:420,charged?160:245,charged?.21:.09);
      const facing=(Number(held('right'))-Number(held('left')))||player.facing;
      player.blasterRecoil={time:clock,facing,charged};
      attacks.push({
      x:player.x,y:player.y,v:facing*(charged?850:680),life:.85,radius:charged?22:8,damage:charged?2:1,blasterShot:true
      });
    }
  }
  function closestTarget(player, candidates, position, eligible, reachX, reachY) {
    let nearest=null;
    let distance=Infinity;
    for(const candidate of candidates){
      const at=position(candidate);
      if(!eligible(candidate,at)) continue;
      if(!close(player,at,reachX,reachY)) continue;
      const gap=Math.hypot(player.x-at.x,player.y-at.y);
      if(gap<distance){
        nearest=candidate;
        distance=gap;
      }
    }
    return nearest;
  }
  function bashTarget(p) {
    return closestTarget(p,enemies,foePosition,foe=>!foe.dead,125,65);
  }
  function useTechnique() {
    if (phase!=='playing' || player.techCooldown>0) return;
    const p=player;
    p.techCooldown=.32;
    const facing=(Number(held('right'))-Number(held('left')))||p.facing;
    const before=[p.x,p.y,p.vx,p.vy,p.gravity,p.cable,p.carry,p.morphed,p.altWeapon,p.sonar,p.ledgeGrip,p.pogo,attacks.length];
    let activated=false;
    const nearby=range=>closestTarget(p,enemies,foePosition,
      (foe,at)=>!foe.dead && (index!==10 || (at.x-p.x)*facing>=0),range,65);
    const shot=extra=>attacks.push({x:p.x,y:p.y,v:facing*330,life:.55,...extra});
    switch(technique) {
      case 'sweep': shot({v:0,radius:strength-20,life:.13}); break;
      case 'burst':
      case 'roll': p.vx=facing*strength;p.grapple=.25;p.grace=Math.max(p.grace,.25);break;
      case 'reveal':
        p.sonar=2;p.sonarOrigin={x:p.x,y:p.y};
        if(!reefCacheOpen && landmarks.some(prop=>prop.cell===4 && Math.hypot(p.x-prop.x,p.y-prop.y)<=160)){
          reefCacheOpen=true;
          burst(p.x,p.y,'#82ffe6',12);
          status('Sonar revealed a hidden crystal trail. Follow it upward.');
        }
        break;
      case 'launch': if(p.on){p.vy=-strength;p.vx=facing*350;p.grapple=.26;p.on=false;p.coyote=0;p.jumpBuffer=0;p.jumpCut=false;}break;
      case 'pull':
      case 'capture': {
        if(p.carry){shot({v:facing*550,damage:2});p.carry=false;break;}
        const foe=nearby(strength);
        if(foe){foe.dead=true;p.carry=true;status(index===10?'Enemy caught. Jump in midair for a boost, or use '+techniqueName+' again to throw.':'Enemy caught. Press '+techniqueName+' again to throw.');}
        break;
      }
      case 'flip': action();break;
      case 'retry': respawn();activated=true;break;
      case 'release':
        if(p.cable){
          p.cable=null;
          p.grapple=.18;
          p.jumpBuffer=0;
          p.coyote=0;
          p.jumpCut=false;
        }
        break;
      case 'climb': break; // Held climb is resolved against the wall each tick.
      case 'drop': if(!p.on && !p.pogo){p.vy=strength;p.pogo=true;p.coyote=0;p.jumpBuffer=0;p.jumpCut=false;}break;
      case 'lob':
        shot({v:facing*strength,vy:-260,gravity:700,life:.9,radius:13,damage:2,motionTrail:'lob'});
        if(index===13) p.throwPose={time:clock,facing,angle:Math.atan2(-260,strength)};
        break;
      case 'morph': {
        const nextBody=p.morphed?22:12;
        if(nextBody===22 && tunnels.some(t=>p.x>t.x-12 && p.x<t.x+t.w+12)){
          if(index===14) status('Stay morphed until Shadow clears the tunnel.');
          break;
        }
        if(p.on) p.y+=p.morphed?-10:10;
        p.morphed=!p.morphed;
        if(p.morphed) p.morphAngle=0;
        break;
      }
      case 'bash': {
        const target=bashTarget(p);
        if(!target) break;
        const dx=Number(held('right'))-Number(held('left'));
        const dy=Number(held('down'))-Number(held('up'));
        const length=Math.hypot(dx,dy)||1;
        const position=foePosition(target);
        p.vx=(dx || (dy ? 0 : p.facing*.65))*strength/length;
        p.vy=(dy || (dx ? 0 : -1))*strength/length;
        p.grapple=.27;
        p.on=false;
        p.coyote=0;
        p.jumpBuffer=0;
        p.jumpCut=false;
        p.bashPose={time:clock,angle:Math.atan2(p.vy,p.vx)};
        target.bashed={x:position.x,y:position.y,vx:-p.vx*.75,vy:-p.vy*.75,until:clock+.48};
        burst(position.x,position.y,'#a8ffd9',12);
        break;
      }
      case 'parry': {
        const target=closestTarget(p,hazards,h=>h,h=>h.parry && h.life>0,55,55);
        if(target && !p.on){
          target.life=0;
          p.parryFlash={x:target.x,y:target.y,time:clock};
          activated=true;
          p.vy=-470;
          p.jumpBuffer=0;
          p.coyote=0;
          p.jumpCut=false;
          p.grace=Math.max(p.grace,.35);
          if(!reducedMotion) burst(target.x,target.y,'#ff86dc',10);
        }
        break;
      }
      case 'grab': {
        if(p.on || p.ledgeGrip) break;
        const edge=platforms.find(l=>
          ['floor','shelf'].includes(l.kind) && (!l.switchBridge || amberSwitch) &&
          p.y>l.y && p.y<l.y+48 &&
          ((p.x<=l.x && l.x-p.x<31) || (p.x>=l.x+l.w && p.x-l.x-l.w<31))
        );
        if(edge){
          const left=p.x<=edge.x;
          p.ledgeGrip={edge,left};
          p.coyote=0;
          p.jumpCut=false;
          p.x=left?edge.x-12:edge.x+edge.w+12;
          p.y=edge.y+19;
          p.vx=p.vy=0;
          p.jumpBuffer=0;
        }
        break;
      }
      case 'swap': p.altWeapon=!p.altWeapon;status(p.altWeapon?'Spread fire equipped. Hold Up to aim high.':'Straight fire equipped. Hold Up to aim high.');break;
      case 'taunt': if(p.crystalCombo>=3){shot({v:0,radius:strength,life:.2,damage:2});p.crystalCombo=0;}break;
      case 'return': shot({v:facing*strength,returning:true,life:1.1,damage:2,motionTrail:'cross'});break;
    }
    const after=[p.x,p.y,p.vx,p.vy,p.gravity,p.cable,p.carry,p.morphed,p.altWeapon,p.sonar,p.ledgeGrip,p.pogo,attacks.length];
    if(activated || technique==='reveal' || after.some((value,i)=>value!==before[i])){
      signatureEffect={x:player.x,y:player.y,facing,at:clock};
      if(technique==='parry' || technique==='reveal') playCue(520,1020,.16);
      else if(technique==='drop' || technique==='retry') playCue(325,96,.17);
      else playCue(240,510,.13);
    } else {
      p.techCooldown=0;
    }
  }
  const pauseButton=byId('side-pause');
  const soundButton=byId('side-sound');
  const soundPreference='pawcade-side-scroll-sound';
  let audio, masterGain, sound=false;
  try {sound=localStorage.getItem(soundPreference)==='on';} catch {}
  const Audio=window.AudioContext || window.webkitAudioContext;
  function syncSoundButton() {
    soundButton.disabled=!Audio;
    soundButton.setAttribute('aria-pressed',String(sound && Boolean(Audio)));
    soundButton.textContent=Audio?(sound?'Sound on':'Sound off'):'Sound unavailable';
  }
  function unlockAudio() {
    if(!Audio) return Promise.resolve();
    try {
      if(!audio){
        audio=new Audio();
        masterGain=audio.createGain();
        masterGain.gain.value=Number(sound);
        masterGain.connect(audio.destination);
      }
      return audio.resume().catch(()=>{});
    } catch {return Promise.resolve();}
  }
  syncSoundButton();
  soundButton.onclick=()=>{
    sound=!sound;
    try {localStorage.setItem(soundPreference,sound?'on':'off');} catch {}
    syncSoundButton();
    if(masterGain) masterGain.gain.setTargetAtTime(Number(sound),audio.currentTime,.008);
    if(sound) unlockAudio().then(()=>playCue(440,660));
    else stopMusic();
  };
  // Original synthesized voices in catalog order. Each voice sets a wave,
  // pitch multiplier and overtone ratio for the course's event cues.
  const soundProfiles=[
    ['square',1.10,2], ['sawtooth',.92,2], ['sine',.72,1.5],
    ['triangle',1.25,2], ['triangle',.60,1.5], ['sine',1.16,2],
    ['triangle',1.30,1.5], ['square',.78,2], ['square',1.48,2],
    ['sawtooth',.67,1.5], ['sine',.98,2], ['sine',1.42,1.5],
    ['triangle',.68,2], ['sine',1.26,2], ['triangle',.54,1.5],
    ['sine',.87,3], ['triangle',1.12,3], ['triangle',.88,2],
    ['sine',.56,2], ['square',.66,1.5], ['sawtooth',1.24,2],
    ['triangle',.77,3], ['square',1.32,1.5], ['sine',1.10,3],
    ['sawtooth',.50,2]
  ];
  let nextCueAt=0, lastCueAt=-Infinity;
  function playCue(from,to,length=.12) {
    if(!sound || audio?.state!=='running') return;
    const now=audio.currentTime;
    if(now<nextCueAt) return;
    nextCueAt=now+.025;
    const [wave,pitch,harmonic]=soundProfiles[index];
    const volume=audio.createGain();
    volume.gain.setValueAtTime(.001,now);
    volume.gain.exponentialRampToValueAtTime(.035,now+.008);
    volume.gain.exponentialRampToValueAtTime(.001,now+length);
    volume.connect(masterGain);
    lastCueAt=now;
    if(musicBus){
      musicBus.gain.setTargetAtTime(.28,now,.012);
      musicDucked=true;
    }
    for(const [type,ratio] of [[wave,1],['sine',harmonic]]){
      const tone=audio.createOscillator();
      tone.type=type;
      tone.frequency.setValueAtTime(from*pitch*ratio,now);
      tone.frequency.exponentialRampToValueAtTime(to*pitch*ratio,now+length);
      const layer=audio.createGain();
      layer.gain.value=ratio===1?.78:.22;
      tone.connect(layer);
      layer.connect(volume);
      tone.start(now);
      tone.stop(now+length);
      tone.onended=()=>{
        layer.disconnect();
        if(ratio===harmonic) volume.disconnect();
      };
    }
  }
  // BPM, tonic (MIDI), melody offsets. A dash marks a rest.
  const musicScores=[
    [124,55,'0 4 7 12 7 4 2 -'],[138,52,'0 0 7 3 10 7 5 -'],
    [72,48,'0 - 7 - 10 14 - 12'],[154,57,'0 7 12 9 5 4 2 7'],
    [108,50,'0 7 3 7 10 - 5 3'],[112,53,'0 4 9 7 12 9 - 7'],
    [116,60,'0 4 7 11 12 - 7 4'],[132,51,'0 12 3 15 7 19 5 17'],
    [142,54,'0 0 7 7 12 10 5 3'],[92,45,'0 - 7 3 0 - 10 5'],
    [96,55,'0 2 7 - 9 12 7 -'],[104,56,'0 - 4 7 11 - 14 12'],
    [126,49,'0 7 10 12 10 5 3 7'],[114,58,'0 4 2 7 9 7 4 -'],
    [88,47,'0 - 1 7 8 - 5 3'],[84,52,'0 7 12 - 14 11 9 -'],
    [146,55,'0 4 7 9 10 9 7 4'],[128,50,'0 1 4 7 8 7 4 1'],
    [98,46,'0 - 3 7 6 5 - 3'],[152,48,'0 0 3 7 0 10 7 5'],
    [160,53,'0 4 7 10 12 7 9 3'],[122,47,'0 7 12 15 14 12 10 7'],
    [118,57,'0 4 7 - 9 7 2 4'],[90,59,'0 2 4 - 7 9 7 -'],
    [136,46,'0 7 3 0 10 7 5 3']
  ];
  const [musicTempo,musicRoot,musicPattern]=musicScores[index];
  const musicNotes=musicPattern.split(' ');
  const musicInterval=30/musicTempo;
  let musicBus, musicDucked=false, nextMusicAt=0, musicStep=0;

  function stopMusic() {
    if(!musicBus) return;
    const fadingBus=musicBus;
    const now=audio.currentTime;
    fadingBus.gain.setTargetAtTime(0,now,.012);
    setTimeout(()=>fadingBus.disconnect(),90);
    musicBus=null;
    musicDucked=false;
    nextMusicAt=0;
  }

  function musicNote(note,at,length,level,type,output=musicBus) {
    const voice=audio.createOscillator(), gain=audio.createGain();
    voice.type=type;
    voice.frequency.value=440*2**((note-69)/12);
    gain.gain.setValueAtTime(.0001,at);
    gain.gain.exponentialRampToValueAtTime(level,at+.014);
    gain.gain.exponentialRampToValueAtTime(.0001,at+length);
    voice.connect(gain);
    const filter=audio.createBiquadFilter();
    filter.type='lowpass';
    filter.frequency.value=Math.min(4800,Math.max(1200,voice.frequency.value*5));
    filter.Q.value=.1;
    gain.connect(filter);
    filter.connect(output);
    voice.onended=()=>filter.disconnect();
    voice.start(at);
    voice.stop(at+length);
  }

  function playVictory() {
    if(!sound || audio?.state!=='running') return;
    const now=audio.currentTime;
    for(const [beat,offset] of [0,4,7,12].entries()){
      musicNote(musicRoot+offset,now+beat*.105,beat===3?.32:.15,.035,'triangle',masterGain);
    }
  }

  function playPickup() {
    if(!sound || audio?.state!=='running' || audio.currentTime<nextCueAt) return;
    playCue(570,760,.09);
    musicNote(musicRoot+19,audio.currentTime+.053,.14,.025,'sine',masterGain);
  }

  function playImpact() {
    if(!sound || audio?.state!=='running' || audio.currentTime<nextCueAt) return;
    playCue(135,48,.17);
    musicNote(43,audio.currentTime,.075,.022,'triangle',masterGain);
  }

  function playSpring() {
    if(!sound || audio?.state!=='running' || audio.currentTime<nextCueAt) return;
    playCue(160,570,.17);
    musicNote(musicRoot+12,audio.currentTime+.075,.13,.022,'triangle',masterGain);
  }

  function updateMusic() {
    if(!sound || document.hidden || audio?.state!=='running' || phase!=='playing' || storyDialog?.open) return;
    const now=audio.currentTime;
    if(!musicBus){
      musicBus=audio.createGain();
      musicBus.gain.value=.55;
      musicBus.connect(masterGain);
    }
    if(now-lastCueAt>=.18 && musicDucked){
      musicBus.gain.setTargetAtTime(.55,now,.08);
      musicDucked=false;
    }
    if(nextMusicAt<now) nextMusicAt=now+.02;
    const bossFight=player.x>finish && boss.health>0;
    const interval=musicInterval*(bossFight?.82:1);
    while(nextMusicAt<now+.09){
      const chordShift=(bossFight?[0,1,6,5]:[0,5,3,7])[Math.floor(musicStep/8)%4];
      const note=musicNotes[musicStep%8];
      if(note!=='-') musicNote(musicRoot+chordShift+Number(note),nextMusicAt,interval*.86,.025,soundProfiles[index][0]);
      if(musicStep%4===0) musicNote(musicRoot+chordShift-12,nextMusicAt,interval*2.6,.032,'triangle');
      if(musicStep%4===2) musicNote(musicRoot+chordShift+7,nextMusicAt,interval*1.2,.012,'sine');
      musicStep++;
      if(bossFight && musicStep%2===0) musicNote(musicRoot-24,nextMusicAt,.08,.026,'sine');
      nextMusicAt+=interval;
    }
  }
  const resetActionPointers=[];
  function clearInput() {
    keys.clear();
    pressedCodes.clear();
    mobile.clear();
    player.jumpBuffer=0;
    player.spin=0;
    resetStick?.();
    for(const resetPointer of resetActionPointers) resetPointer();
    releaseAction(false);
  }
  function togglePause() {
    if (phase==='playing') {
      phase='paused';
      stopMusic();
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
      if (!storyDialog?.open) frame=requestAnimationFrame(loop);
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
    playImpact();
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
    player.ledgeGrip=null;
    player.health--;
    player.grace = 1.25;
    if (player.health <= 0) {respawn();return true;}
    hud();
  }
  function respawn() {
    clearInput();
    signatureEffect=null;
    landingEffect=null;
    for(const ledge of platforms) if(ledge.kind==='drop') ledge.dropAt=undefined;
    if(index===11){
      const start=stageStarts[chapter];
      for(const crystal of crystals){
        if(crystal.refill && crystal.taken && crystal.x>=start && crystal.x<stageStarts[chapter+1]){
          crystal.taken=false;
          taken--;
        }
      }
    }
    player = resetPlayer(escape!==null ? finish+635 : stageStarts[chapter] + 100);
    if (escape!==null) {
      escapeRetries++;
      escape=95;
    }
    player.grace = 1.1;
    attacks = [];
    hazards = [];
    looseRings.length=0;
    rings=0;
    camera=Math.max(0,Math.min(finish+70,player.x-238));
    status(escape!==null ? 'Back at the reset switch. Race to the entrance!' : 'Back at the stage checkpoint.');
    hud();
  }
  const close = (a,b,x,y) => Math.abs(a.x-b.x)<x && Math.abs(a.y-b.y)<y;
  const floatHasLift = p => power==='bubble' && held('action') && p.y>55;
  function wallBlocksShot(fromX, toX, y) {
    if (y >= ground) return false;
    const left = Math.min(fromX, toX);
    const right = Math.max(fromX, toX);
    return walls.some(wall => y >= wall.top && left <= wall.x+20 && right >= wall.x);
  }
  function climbFromLedge(p) {
    const {edge,left}=p.ledgeGrip;
    p.x=left?edge.x+13:edge.x+edge.w-13;
    p.y=edge.y-22;
    p.vx=p.vy=0;
    p.on=true;
    p.jumps=0;
    p.ledgeGrip=null;
  }
  function step(dt) {
    clock += dt;
    chapterReveal=Math.max(0,chapterReveal-dt);
    for(let i=particles.length-1;i>=0;i--){
      const spark=particles[i];
      spark.life-=dt;
      if(spark.life<=0){particles.splice(i,1);continue;}
      spark.x+=spark.vx*dt;spark.y+=spark.vy*dt;spark.vy+=160*dt;
    }
    if (escape!==null) {
      escape-=dt;
      if (escape<=0) {respawn();return;}
      if (player.x<115) {
        const rank = escapeRetries === 0 && escape >= 55 && escapeCrystals >= 3 ? 'S' :
          escapeRetries === 0 && escape >= 40 ? 'A' : escape >= 25 ? 'B' : 'C';
        phase='won';
        status(ending+'! · Rank '+rank+' · '+escapeCrystals+' crystals at reset · '+
          Math.ceil(escape)+'s left · '+escapeRetries+' retries');
        return;
      }
      if (Math.floor(escape)!==Math.floor(escape+dt)) status('Escape back to the entrance · '+Math.ceil(escape)+'s');
    }
    const p = player;
    if(p.ledgeGrip){
      if(held('up')) climbFromLedge(p);
      else if(held('down')) p.ledgeGrip=null;
    }
    // Precision platformers allow forgiving edge jumps; momentum and
    // action games retain more committed takeoff timing.
    const edgeGrace=[.095,.085,.11,.075,.095,.11,.115,.065,.045,.085,
      .105,.125,.075,.11,.095,.12,.075,.095,.075,.085,.06,.07,.105,.12,.075][index];
    const inputBuffer=[.115,.095,.11,.075,.11,.12,.13,.075,.05,.095,
      .12,.14,.09,.115,.105,.13,.085,.11,.085,.1,.065,.085,.12,.13,.09][index];
    p.coyote=p.on ? edgeGrace : Math.max(0,p.coyote-dt);
    p.jumpBuffer=Math.min(inputBuffer,Math.max(0,p.jumpBuffer-dt));
    // Preserve a freshly buffered jump through landing; the existing
    // pre-movement jump check handles coyote jumps, while the post-
    // collision check below handles a button press just before contact.
    if (p.jumpBuffer && (p.on || p.coyote>0 || (index===4 && movement==='roll' && p.power>.22 && p.jumps===0))) jump(false);
    p.jumpAge=(p.jumpAge||0)+dt;
    if (p.jumpCut && !held('jump') && p.jumpAge>=.035) {
      // Variable jump-height control is stronger in precision games,
      // gentler in floaty and momentum-based adventures.
      const releaseScale=[.43,.48,.62,.65,.5,.6,.58,.42,.72,.52,
        .64,.36,.58,.54,.5,.55,.55,.5,.6,.62,.68,.55,.52,.62,.58][index];
      if (p.vy*p.gravity < -jumpSpeed*releaseScale)
        p.vy=-jumpSpeed*releaseScale*p.gravity;
      p.jumpCut=false;
    }
    p.techCooldown=Math.max(0,(p.techCooldown||0)-dt);
    p.sonar=Math.max(0,(p.sonar||0)-dt);
    p.grace = Math.max(0,p.grace-dt);
    p.power = Math.max(0,p.power-dt);
    const steer = movement==='beat' ? 1 : Number(held('right')) - Number(held('left'));
    const vertical = Number(held('down'))-Number(held('up') || held('jump'));
    if (steer) p.facing = steer;
    // High-speed courses reward momentum but do not permit unlimited
    // speed accumulation after springs, slopes or scripted launches.
    const horizontalLimit=[1.3,1.2,1.15,2.25,1.5,1.25,1.2,1.15,1.25,
      1.35,1.3,1.4,1.2,1.25,1.2,1.35,1.2,1.3,1.2,1.3,2.1,1.2,1.3,1.2,1.3][index];
    const maxHorizontal=runSpeed*speedFactor*horizontalLimit;
    if(Math.abs(p.vx)>maxHorizontal) p.vx=Math.sign(p.vx)*maxHorizontal;
    const speedRun=index===20 && p.on && steer && steer*p.vx>0;
    const topSpeed = runSpeed * speedFactor * (speedRun ? 1.32 : 1);
    const reversing = steer && Math.sign(p.vx) !== steer;
    const acceleration = (p.onIce ? handling*.28 : steer
      ? handling * (p.on ? (reversing ? 1.35 : 1) : .72)
      : Math.max(1.6,handling*(p.on ? .95 : .45))) * controlFactor * (p.on ? 1 : airFactor);
    if (index===3 && p.spin) {
      if (!p.on) p.spin=0;
      else if (held('down')) p.vx=0;
      else {
        p.facing=steer||p.facing;
        p.vx=p.facing*(520+p.spin*50);
        p.power=.65;
        p.grapple=.18;
        p.spin=0;
      }
    }
    p.wallLock=Math.max(0,(p.wallLock||0)-dt);
    const oldX=p.x;
    const surfaceDrift=p.on ? p.surfaceDrift||0 : 0;
    p.grapple=Math.max(0,(p.grapple||0)-dt);
    if (!(power === 'dash' && p.power > .22) && !p.grapple && !p.wallLock && !(index===3 && p.spin)) {
      if(index===3){
        // Clocktower Relay's Sonic-inspired identity: momentum is earned,
        // braking is deliberate, and airborne steering has less authority.
        // Spin launches remain governed by the existing spin logic above.
        const current=Math.abs(p.vx);
        const sameDirection=steer && Math.sign(p.vx)===steer;
        const sonicTarget=steer*topSpeed*(sameDirection && current>topSpeed*.72?1.12:1);
        if(p.spinJump && sameDirection && current>Math.abs(sonicTarget)){
          // Holding forward during a spin jump should not brake the roll.
          p.vx*=Math.max(0,1-dt*.12);
        }else{
        const traction=p.on?(steer?(sameDirection?3.3:7.6):1.75)
          :(steer?1.8:.12);
        p.vx+=(sonicTarget-p.vx)*Math.min(1,dt*traction*controlFactor);
        }
      }else if(index===0){
        // Ember Foundry: responsive precision platforming, with strong
        // grounded reversals and predictable aerial correction.
        const precision=steer?(p.on?1.32:1.08):1.55;
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*precision);
      }else if(index===1){
        // Moonlit Library: combat-platformer handling, fast grounded starts
        // and slightly constrained airborne reversals for wall-jump control.
        const combatHandling=p.on?1.22:(reversing?.68:.88);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*combatHandling);
      }else if(index===2){
        // Coral Courier: underwater movement carries momentum; direction
        // changes and releasing the stick do not stop swimming instantly.
        const swimmingTraction=steer?(reversing?2.5:3.6):1.35;
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*swimmingTraction*controlFactor);
      }else if(index===4){
        // Seed Garden: brisk canopy traversal with a committed rolling burst.
        const rolling=movement==='roll' && p.power>.22;
        const target=rolling ? p.facing*Math.max(topSpeed,topSpeed*1.24) : steer*topSpeed;
        const grip=rolling?2.5:(p.on?1.2:.8);
        p.vx+=(target-p.vx)*Math.min(1,dt*acceleration*grip);
      }else if(index===11){
        // Cloud City: immediate precision starts and high-air-control
        // reversals for short, technical platform sequences.
        const precisionGrip=p.on?1.65:(reversing?1.3:1.42);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*precisionGrip);
      }else if(index===6){
        // Lantern Festival: float-friendly, gentle aerial turns while
        // preserving the separate inhale and launch abilities.
        const floatGrip=p.on?1.06:(reversing?.82:1.08);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*floatGrip);
      }else if(index===7){
        // Crystal Polarity: deliberate gravity-puzzle steering, with
        // predictable reversals on both floors and ceilings.
        const gravityGrip=steer?(reversing?1.35:1.16):1.32;
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*gravityGrip);
      }else if(index===8){
        // Stage Beat: continuous forward motion with tightly bounded
        // velocity changes to preserve rhythmic obstacle timing.
        const beatTarget=Math.max(topSpeed*.85,topSpeed);
        p.vx+=(beatTarget-p.vx)*Math.min(1,dt*acceleration*1.35);
      }else if(index===9){
        // Quarry Rescue: grounded cable-platformer with intentional
        // takeoff and restrained air steering while grappling.
        const cableGrip=p.grapple?0.38:(p.on?1.2:.67);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*cableGrip);
      }else if(index===10){
        // Sunset Wind Sail: floaty wind-assisted platforming, retaining
        // horizontal drift between airborne course corrections.
        const sailGrip=p.on?1.08:(steer?.64:.3);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*sailGrip);
      }else if(index===12){
        // Thunder Harbor: committed, weighty action-platforming movement
        // and less forgiving mid-jump direction changes.
        const harborGrip=p.on?(reversing?1.12:1.2):(reversing?.54:.76);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*harborGrip);
      }else if(index===13){
        // Autumn Trail: gentle, accurate airborne steering for careful
        // platform landings while the separate egg-aim mechanic stays intact.
        const trailGrip=p.on?1.18:(reversing?1.08:1.22);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*trailGrip);
      }else if(index===14){
        // Inverted Observatory: measured exploration movement and
        // predictable braking in either gravity orientation.
        const explorerGrip=p.on?(reversing?1.18:1.02):.82;
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*explorerGrip);
      }else if(index===15){
        // Bamboo Village: nimble, flowing traversal and agile aerial
        // reversals, keeping bash and vine actions separately controlled.
        const forestGrip=p.on?1.35:(reversing?1.22:1.15);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*forestGrip);
      }else if(index===16){
        // Steamworks: deliberate run-and-gun footwork with quick grounded
        // stopping, and limited midair reversals for telegraphed dodges.
        const factoryGrip=p.on?(steer?1.28:1.65):(reversing?.56:.79);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*factoryGrip);
      }else if(index===17){
        // Snow Village: crisp ground starts, slippery momentum on ice,
        // and a slightly softer airborne course correction.
        const snowGrip=p.onIce?.58:(p.on?1.18:.88);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*snowGrip);
      }else if(index===18){
        // Canyon Crossing: grounded, committed parkour movement with
        // low aerial authority, complementing the ledge-grab mechanic.
        const canyonGrip=p.on?(reversing?1.5:1.05):(steer?.55:.36);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*canyonGrip);
      }else if(index===19){
        // Submarine Dock: decisive run-and-gun positioning and quick
        // stops on deck; swimming remains governed by the swim system.
        const dockGrip=p.on?(steer?1.5:1.75):(reversing?.78:.9);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*dockGrip);
      }else if(index===20){
        // Neon Circuit: preserve sprint momentum and fast direction
        // recovery for chaining high-speed obstacle routes.
        const neonGrip=p.on?(reversing?1.3:.82):(steer?.6:.32);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*neonGrip);
      }else if(index===21){
        // Marble Temple: deliberate classic action-platforming steps,
        // committed aerial arcs and responsive grounded braking.
        const templeGrip=p.on?(steer?1.04:1.35):(reversing?.5:.7);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*templeGrip);
      }else if(index===22){
        // Swamp Ferry: pogo-assisted precision with steady horizontal
        // control and restrained steering during springy rebounds.
        const marshGrip=p.on?1.26:(reversing?.76:.94);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*marshGrip);
      }else if(index===23){
        // Sunflower Flight: gentle, textile-like floating movement
        // that preserves momentum between short airborne corrections.
        const blossomGrip=p.on?1.12:(steer?.72:.38);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*blossomGrip);
      }else if(index===24){
        // Starship Cargo: crisp combat movement on deck with more
        // committed airborne jumps under enemy fire.
        const cargoGrip=p.on?(steer?1.35:1.5):(reversing?.6:.82);
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*cargoGrip);
      }else if(index===5){
        // Waterfall Climb: responsive ground movement paired with
        // gentle aerial corrections for gliding between icy ledges.
        // Ice friction and glide gravity remain in their own systems.
        const waterfallGrip=p.onIce?.72:(p.on?1.18:(held('jump')?.62:.92));
        p.vx+=(steer*topSpeed-p.vx)*Math.min(1,dt*acceleration*waterfallGrip);
      }else{
        p.vx += (steer * topSpeed - p.vx) * Math.min(1,dt*acceleration);
      }
    }
    p.x = Math.max(30,Math.min(finish+770,p.x+(p.vx+surfaceDrift)*dt));
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
      if(index===11 && held('technique') && !p.wall){
        if(Math.abs(p.x-(wall.x-14))<.01) p.wall=1;
        else if(Math.abs(p.x-(wall.x+34))<.01) p.wall=-1;
      }
      if (p.wall) {p.vx=0;p.vy=Math.min(78,p.vy);break;}
    }
    const body = p.morphed || (power === 'slide' && held('action')) ? 12 : 22;

    if(index===11 && wasGrounded) p.climbStamina=1.8;
    const climbing=index===11 && p.wall && !wasGrounded && held('technique') && p.climbStamina>0 && p.power<=.22;
    const floating = power === 'glide' && held('jump');
    if (climbing) {
      const climbDirection=Number(held('down'))-Number(held('up'));
      p.vy=climbDirection*118;
      if(!signatureEffect || clock-signatureEffect.at>.33){
        signatureEffect={x:p.x,y:p.y,facing:p.wall,at:clock};
      }
      p.climbStamina=Math.max(0,p.climbStamina-dt*(climbDirection<0?1:.45));
    } else if (power==='swim') {
      // Swimming near a reef current pulls the hero along its channel,
      // including while floating above the current's surface.
      const inCurrent=index===2 && platforms.some(ledge=>ledge.kind==='current' &&
        p.x>=ledge.x && p.x<=ledge.x+ledge.w && p.y>=ledge.y-88 && p.y<=ledge.y);
      if(inCurrent) p.x=Math.max(30,p.x-105*dt);
      p.vy += (vertical*230-p.vy)*Math.min(1,dt*5);
    }
    else if (floatHasLift(p)) p.vy += (-160-p.vy)*Math.min(1,dt*5);
    else if (floating && p.vy>0) {
      const glideSpeed=index===5 ? 44 : index===23 ? 96 : 72;
      p.vy=Math.min(glideSpeed,p.vy+dt*90);
    }
    else if (!(movement==='airdash' && p.power>.22)) {
      const arcFactor=p.vy*p.gravity<0
        ? (held('jump') ? holdGravity : releaseGravity)
        : fallGravity;
      // Cloud City: precision-platformer apex hang time, inspired by
      // Celeste's reduced gravity near the peak while Jump is held.
      // Keep the existing gravity system in every other adventure.
      const apexAssist=index===11 && held('jump') &&
        Math.abs(p.vy)<jumpSpeed*.16 ? .58 : 1;
      p.vy+=dt*(movement==='precision'?1210:1050)*gravityFactor*
        arcFactor*apexAssist*p.gravity;
    }
    // Terminal speeds are tuned by gameplay family. Keep high-speed
    // descents readable and collision-safe on the fixed 60 Hz step.
    const terminalFall=[720,760,390,820,720,560,480,700,880,730,
      530,690,790,610,720,620,780,690,740,450,850,750,650,500,800][index];
    const terminalRise=[780,820,410,850,760,620,540,750,920,770,
      610,790,830,680,770,700,840,760,780,480,880,810,710,560,860][index];
    // Cloud City's precision descent: holding down accelerates toward a
    // higher fall-speed cap, allowing deliberate fast-fall landings.
    // Unlike a teleport or instant speed change, this ramps smoothly.
    if(index===11 && p.gravity>0 && !p.on && held('down') &&
       p.vy>0 && !(movement==='airdash' && p.power>.22)){
      p.fastFallBoost=Math.min(145,(p.fastFallBoost||0)+310*dt);
    }else{
      p.fastFallBoost=Math.max(0,(p.fastFallBoost||0)-390*dt);
    }
    const adjustedFall=terminalFall+(index===11?(p.fastFallBoost||0):0);
    p.vy=Math.max(-terminalRise,Math.min(adjustedFall,p.vy));
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
        status('Dash recharged.');
        burst(p.x,p.y,'#82ffe6',10);
        playCue(550,880);
      }
    }

    if(p.cable){
      if(index===9){
        const reel=Number(held('down'))-Number(held('up'));
        p.cable.length=Math.max(42,Math.min(p.cable.maxLength,p.cable.length+reel*(reel<0?185:150)*dt));
      }
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
    p.surfaceDrift=0;
    if (((p.gravity < 0 && power!=='flip') || power==='swim') && p.y < 48) {p.y=48;p.vy=0;p.on=true;p.jumps=0;}
    if(p.ledgeGrip){
      const {edge,left}=p.ledgeGrip;
      p.x=left?edge.x-12:edge.x+edge.w+12;
      p.y=edge.y+19;
      p.vx=p.vy=0;
    }
    let landingSurface=null;
    let upperContact=null;
    for (const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if(ledge.switchBridge && !amberSwitch) continue;
      if (p.x < ledge.x-8 || p.x > ledge.x+ledge.w+8) continue;
      if(ledge.kind==='ceilingSpikes'){
        if(p.y-body<ledge.y){respawn();return;}
        continue;
      }
      if (ledge.kind==='hazard') {
        if (p.y+body>ledge.y && p.y-body<ground) {
          if(movement==='beat' || index===7){respawn();return;}
          if (hit()) return;
        }
        continue;
      }
      if (p.ledgeGrip || ledge.kind==='rail' || (ledge.dropAt!==undefined && clock>=ledge.dropAt)) continue;
      const ceiling=ledge.kind==='ceiling';
      if(ceiling || ledge.kind==='shelf'){
        const underside=ledge.y+(ceiling?0:20);
        if((!ceiling || p.gravity<0) && p.vy<0 &&
           oldY-body>=underside && p.y-body<=underside &&
           (!upperContact || underside>upperContact.y ||
            (underside===upperContact.y && ceiling))){
          upperContact={y:underside,ceiling};
        }
        if(ceiling) continue;
      }
      if (p.vy>=0 && oldY+body<=ledge.y && p.y+body>=ledge.y &&
          (!landingSurface || ledge.y<landingSurface.y ||
           (ledge.y===landingSurface.y && landingSurface.kind==='floor' && ledge.kind!=='floor'))){
        landingSurface=ledge;
      }
    }
    if(upperContact){
      p.y=upperContact.y+body;
      p.vy=0;
      p.jumpCut=false;
      if(upperContact.ceiling){
        p.on=true;
        p.coyote=0;
        p.jumpBuffer=0;
        p.jumps=0;
        p.dashUsed=false;
      }
    }
    if(landingSurface){
      p.spinJump=false;
      const ledge=landingSurface;
      if(!wasGrounded && p.vy>190) {
        p.landingPose=.13;
        landingEffect={x:p.x,y:ledge.y,at:clock,speed:p.vy,kind:ledge.kind};
      }
      p.y = ledge.y-body;p.vy = 0;p.on = true;p.jumps = 0;p.dashUsed=false;
      // Consume the buffered jump on the landing tick instead of
      // requiring the player to wait until the next simulation frame.
      p.jumpCut=false;
      const barrelLaunch=!p.pogo && ledge.kind==='barrel' && held('technique');
      const pogoLaunch=!p.pogo && ledge.kind==='pogo' && (held('technique') || held('jump'));
      const liftLaunch=!p.pogo && ledge.kind==='lift' && held('jump');
      const springLaunch=ledge.kind==='spring';
      if (springLaunch || p.pogo || barrelLaunch || pogoLaunch || liftLaunch) {
        if (barrelLaunch) {
          p.vx=p.facing*440;
          p.grapple=.35;
        }
        if((index===12 || index===22) && (p.pogo || pogoLaunch)) p.pogoRebound=clock;
        if (springLaunch) {
          p.vy=-565;
          playSpring();
        } else if (p.pogo) {
          p.vy=index===22 && held('technique') ? -530 : -410;
        } else {
          p.vy=barrelLaunch ? -610 : pogoLaunch ? -590 : -560;
        }
        p.pogo=false;
        p.on=false;
        p.jumpBuffer=0;
        p.coyote=0;
      } else if (p.jumpBuffer>0) {
        jump(false);
      }
      if(ledge.kind==='drop') ledge.dropAt ??= clock+.38;
      p.onIce=p.on && ledge.kind==='ice';
      if (p.on && ledge.kind === 'belt') p.surfaceDrift=index===3 ? 120 : index===20 ? 95 : 75;
      if (p.on && ledge.kind === 'current' && index!==2) p.surfaceDrift=-65;
    }
    if (power==='bubble' && p.y<48) {p.y=48;p.vy=0;}
    if (p.y > height+65 || (p.gravity<0 && p.y < -65)) {respawn();return;}
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
    if(index===5 || index===23){
      const gliding=!p.on && held('jump') && p.vy>0;
      p.canopyOpen=Math.max(0,Math.min(1,(p.canopyOpen??0)+dt*(index===23?(gliding?8:-12):(gliding?12:-9))));
    }
    if(index===6){
      const lifting=!p.on && floatHasLift(p);
      p.floatPose=Math.max(0,Math.min(1,(p.floatPose??0)+dt*(lifting?10:-7)));
    }
    const stage = stageAt(p.x);
    if (oldY <= height && p.x>=finish && oldX<finish) {
      status(boss.health ? 'Baron Brasswhirl · '+guardian.hint : finaleExitHint);
    }
    if (stage > chapter && (p.on || (power==='swim' && p.x>=stageStarts[stage]+100))) {
      chapter=stage;
      syncControllerArt(chapter);
      chapterReveal=2;
      const checkpointSaved=saveCheckpoint();
      if(checkpointSaved) playCue(375,750,.19);
      const nextBeat=stage===sections-1 ? ending : (stage%2===0 ? epilogue : prologue);
      status(chapters[stage] + ' · ' + nextBeat + (checkpointSaved ? ' · Checkpoint saved.' : ' · Could not save this checkpoint.'));
      hud();
      if(index===0 && stage<foundryStory.length-1 && showFoundryStory(stage)) return;
    }
    for (const c of crystals) {
      if (!c.taken && (!c.reefCache || reefCacheOpen) && close(p,c,24,29)) {if(c.refill){
          if(p.dashUsed) status('Dash recharged.');
          p.dashUsed=false;
        }c.taken=true;burst(c.x,c.y,c.refill?'#82ffe6':'#ffdb80',9);playPickup();taken++;if(index===3)rings++;p.crystalCombo=(p.crystalCombo||0)+1;hud();}
    }
    for(let i=looseRings.length-1;i>=0;i--){
      const ring=looseRings[i];
      ring.age+=dt;
      ring.x+=ring.vx*dt;
      const previousRingY=ring.y;
      ring.y+=ring.vy*dt;
      ring.vy+=660*dt;
      if(ring.vy>0){
        let landing=Infinity;
        for(const ledge of platforms){
          if(ledge.kind==='hazard' || ledge.kind==='rail' || ledge.kind==='ceiling' ||
             ledge.kind==='ceilingSpikes' || (ledge.switchBridge && !amberSwitch) ||
             (ledge.dropAt!==undefined && clock>=ledge.dropAt)) continue;
          if(ring.x>=ledge.x && ring.x<=ledge.x+ledge.w &&
             previousRingY<=ledge.y-8 && ring.y>=ledge.y-8) landing=Math.min(landing,ledge.y-8);
        }
        if(landing!==Infinity){ring.y=landing;ring.vy*=-.55;}
      }
      if(ring.age>3.2) looseRings.splice(i,1);
      else if(ring.age>.45 && close(p,ring,21,25)){
        looseRings.splice(i,1);rings++;playPickup();hud();
      }
    }
    for (const attack of attacks) {
      if(attack.motionTrail && !reducedMotion){
        attack.trail ??= [];
        if(!attack.trail.length || clock-attack.trail.at(-1).at>=.025){
          attack.trail.push({x:attack.x,y:attack.y,at:clock});
          if(attack.trail.length>9) attack.trail.shift();
        }
      }
      if(attack.returning && attack.life<.55){
        const dx=p.x-attack.x;
        const dy=p.y-attack.y;
        const distance=Math.hypot(dx,dy)||1;
        attack.v=dx*Math.min(420/distance,8);
        attack.vy=dy*Math.min(420/distance,8);
        if(close(p,attack,16,18)){attack.life=0;continue;}
      }
      attack.x+=attack.v*dt;
      if(attack.vy!==undefined){attack.y+=attack.vy*dt;attack.vy+=(attack.gravity||0)*dt;}
      attack.life-=dt;
    }
    attacks = attacks.filter(a => a.life>0);
    for (const shot of hazards) {
      const nextX=shot.x+shot.v*dt;
      if(wallBlocksShot(shot.x,nextX,shot.y)){shot.life=0;continue;}
      shot.x=nextX;
      shot.life-=dt;
      if (shot.life>0 && close(p,shot,18,22)) {shot.life=0;if (hit()) return;}
    }
    // Discard projectiles well beyond the playable view, freeing the
    // shared projectile budget for enemies the player can actually see.
    hazards = hazards.filter(shot=>shot.life>0 &&
      shot.x>camera-240 && shot.x<camera+width+240);
    for (const foe of enemies) {
      if (foe.dead) continue;
      const position = foePosition(foe);
      if (Math.abs(position.x-p.x)>360 && !attacks.length) continue;
      const impact=attacks.find(a => a.life>0 && close(a,position,20+(a.radius||8),20+(a.radius||8)));
      if (impact) {
        foe.dead=true;
        if (index===1 && impact.blasterShot && impact.damage===1) impact.life=0;
        continue;
      }
      if (Math.abs(position.x-p.x)>360) continue;
      // Fire from the visible enemy position, not its original spawn point.
      // Do not shoot through walls or across different vertical lanes.
      const inLane=Math.abs(p.y-position.y)<105;
      const inRange=Math.abs(p.x-position.x)<320;
      const direction=Math.sign(p.x-position.x);
      const canFire=(foe.turret || foe.clockEnemy>=3 || enemyPattern==='turret' || index===16) &&
        clock>=foe.shotAt && inLane && inRange && direction;
      const shotBlocked=canFire && (wallBlocksShot(position.x,p.x,position.y) || platforms.some(ledge=>
        ['floor','shelf','ceiling'].includes(ledge.kind) &&
        ledge.x<Math.max(position.x,p.x) &&
        ledge.x+ledge.w>Math.min(position.x,p.x) &&
        ledge.y<Math.max(position.y,p.y)-6 &&
        ledge.y+17>Math.min(position.y,p.y)+6
      ));
      if (canFire && !shotBlocked) {
        // Count all enemy shots consistently; the Steamworks parry cycle
        // continues to mark every third shot as parryable.
        // Only advance the firing cycle when an actual shot is emitted.
        // Under the mobile projectile cap, defer instead of skipping the
        // enemy's remaining collision and combat updates.
        if(hazards.length>=28){
          foe.shotAt=clock+Math.max(.45,cadence/enemyTempo);
        }else{
        const firedCount=foe.shotsFired++;
        const parryable=index===16 && firedCount%3===0;
        const primaryShot=enemyRound(position,direction,parryable);
        // Prevent runaway projectile accumulation during busy mobile
        // encounters. A full screen of active shots should not grow forever.
        // Scouts fire quick tracers, sentries slower heavy-looking shots,
        // and raiders faster bolts. Preserve Steamworks parry behavior.
        const projectileTempo=[1.12,.82,1.02,1.22][foe.archetype??0];
        primaryShot.v*=projectileTempo;
        // The sentry's heavier pulse stays visible longer; scout darts
        // expire sooner. No new physics or projectile hitbox is required.
        primaryShot.life*=[.8,1.2,1,.9][foe.archetype??0];
        hazards.push(primaryShot);
        // Veteran skirmishers alternate between the standard and a higher
        // firing lane. Only one projectile is spawned per attack cycle.
        if(foe.archetype===2 && (foe.spawnChapter??chapter)>=2 &&
           firedCount%2===0){
          primaryShot.y-=24;
        }
        // Late-stage raiders introduce a readable high/low lane choice.
        // Keep existing Clocktower double-shot behavior separate.
        if(foe.archetype===3 && (foe.spawnChapter??chapter)>=3 &&
           foe.clockEnemy!==5 && hazards.length<16){
          const upperShot=enemyRound({x:position.x,y:position.y-34},direction,false);
          upperShot.v*=.82;
          upperShot.life=1.5;
          hazards.push(upperShot);
        }
        if(foe.clockEnemy===5 && hazards.length<28){
          const highShot=enemyRound({x:position.x,y:position.y-44},direction,false);
          hazards.push(highShot);
        }
        foe.lastShotAt=clock;
        const shotDelay=foe.clockEnemy>=3 ? [1.65,1.35,1.15][foe.clockEnemy-3] :
          index===16 ? (foe.turret ? 1.35 : 2.25) : 1;
        // Escalate ranged threats chapter by chapter, capped to keep
        // dodge windows readable on touchscreen and avoid bullet spam.
        // Use the enemy's authored home stage for stable encounter pacing
        // even when the player crosses the boundary during a firefight.
        const attackChapter=foe.spawnChapter??chapter;
        const rangedPressure=1+Math.min(5,Math.max(0,attackChapter))*0.075;
        // Distinct ranged archetypes: sentries shoot more deliberately,
        // raiders press harder, while the existing chapter cap applies.
        const attackRhythm=[1,1.22,.92,.83][foe.archetype??0];
        // Keep each counterpart-inspired shooter distinct: Moonlit Library
        // favors deliberate Mega Man-style lane reading, Submarine Dock
        // favors sustained Contra-style pressure, and Starship Cargo uses
        // short, readable Metal Slug-style volleys. Steamworks retains its
        // own parry cadence above.
        const courseFirePace=index===1?1.18:index===19?.84:index===24?.96:1;
        foe.shotAt=clock+cadence/enemyTempo*shotDelay*
          attackRhythm*courseFirePace/rangedPressure;
        } // end available-projectile-budget branch
      }
      if (!(foe.bashed && clock<foe.bashed.until) && close(p,position,29,34)) {
        if(index===2 && p.grapple>0 && (position.x-p.x)*p.facing>=0){
          foe.dead=true;
          if(!reducedMotion) burst(position.x,position.y,'#82ffe6',6);
          continue;
        }
        if ((p.vy>65 && oldY<position.y-17) || (power==='dash' && p.power>.22)) {
          foe.dead=true;
          if(index===12 && p.pogo && !reducedMotion){
            burst(position.x,position.y-12,'#b8eeff',8);
          }
          if((index===12 || index===22) && p.pogo) p.pogoRebound=clock;
          if(index===0) p.stompImpact={x:p.x,y:p.y+22,time:clock};
          p.vy=p.pogo || (movement==='pogo' && held('jump')) ? -560 :
            index===0 && held('jump') ? -440 : -320;
          p.pogo=false;p.on=false;
          p.jumpCut=false;
          p.coyote=0;
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
          escapeCrystals=taken;
          playCue(700,185,.25);
          status('Reset triggered. Race back to the entrance! Finish with 55s left, 3 crystals at reset, and no retries for S rank.');
        } else if (index!==20) {phase='won';status(ending+'!');}
      }
    }
    // Distance-driven footfalls avoid the skating effect when movement is
    // blocked by a wall or platform. Update after collision resolution.
    if(index===3 && (p.spin || p.power>.22 || p.spinJump)){
      const rotation=p.spin ? p.facing*(12+p.spin*3)*dt : (p.x-oldX)/15;
      p.spinAngle=((p.spinAngle||0)+rotation)%(Math.PI*2);
    }
    if(p.morphed) p.morphAngle=((p.morphAngle||0)+(p.x-oldX)/11)%(Math.PI*2);
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
  function baronChargeOffset(cycle) {
    if(cycle<1) return -100;
    if(cycle<2) return -100+(cycle-1)*245;
    return 145-(cycle-2)/1.2*245;
  }
  const baronShielded = cycle => guardian.pattern==='charge' && cycle>=1 && cycle<2;
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
        boss.x+=baronChargeOffset(cycle);
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
    // Respect the same mobile projectile budget as ordinary enemies.
    // Delay a volley rather than flooding the screen during the finale.
    if (ranged && t>=boss.nextShot && hazards.length>=25) {
      boss.nextShot=t+.35;
      boss.aim=0;
    }
    if (ranged && t>=boss.nextShot) {
      const aim=boss.aim || Math.sign(p.x-boss.x) || -1;
      boss.aim=0;
      hazards.push({x:boss.x+aim*44,y:boss.y+12,v:aim*(235+volleyPhase*15),life:2.6,parry:volleyPhase>0});
      if(volleyPhase>=2 && hazards.length<28) hazards.push({x:boss.x+aim*44,y:boss.y-42,v:aim*220,life:2.6});
      if (guardian.pattern==='barrage' && hazards.length<28) hazards.push({x:boss.x+aim*44,y:boss.y-55,v:aim*200,life:2.6});
      boss.nextShot=t+(volleyPhase ? 1.14-volleyPhase*.18 : 1.55);
    }
    boss.warning=(['volley','sweep','barrage'].includes(guardian.pattern) && boss.nextShot-t<.3) || (guardian.pattern==='charge' && cycle>.68 && cycle<1);
    const shielded=baronShielded(cycle);
    const attack=attacks.find(a=>a.life>0 && close(a,boss,49+(a.radius||0),42));
    const stomp=close(p,boss,47,52) && p.vy>70 && (oldY<boss.y-18 || p.pogo);
    const rush = close(p,boss,47,52) &&
      ((power==='dash' && p.power>.22) ||
       (index===2 && p.grapple>0 && (boss.x-p.x)*p.facing>=0));
    if (!shielded && !boss.grace && (attack || stomp || rush)) {
      boss.health=Math.max(0,boss.health-(attack?.damage||1));
      boss.grace=.65;
      playCue(boss.health?180:330,boss.health?65:740,.19);
      burst(boss.x,boss.y,'#ffd08a',boss.health?12:22);
      if (attack) attack.life=0;
      if (stomp) {
        if((index===12 || index===22) && p.pogo) p.pogoRebound=clock;
        p.vy=p.pogo?-510:-375;
        p.pogo=false;
        p.on=false;
        p.jumpCut=false;
        p.coyote=0;
      }
      if(rush) p.grace=Math.max(p.grace,.35);
      status(boss.health ? 'Baron Brasswhirl · '+boss.health+' hits left.' : 'Baron Brasswhirl defeated. '+finaleExitHint);
    } else if (close(p,boss,44,42)) hit();
  }
  // Keep ground enemies anchored to a real ledge and inside its safe patrol
  // bounds. Airborne enemy patterns intentionally retain their flight paths.
  const flyingFoes=['swoop','school'].includes(enemyPattern);
  const solidSupports=platforms.filter(ledge=>
    !['hazard','rail','ceiling','ceilingSpikes','current','drop','spring','lift','pogo'].includes(ledge.kind) &&
    ledge.w>=42
  );
  for(const foe of enemies){
    foe.spawnChapter ??= stageAt(foe.x);
    // Authored swimmers and flying enemies keep their intended airborne paths.
    if(flyingFoes || foe.reefEnemy!==undefined ||
       (foe.foundryEnemy!==undefined && [3,7,8,11,14].includes(foe.foundryEnemy))) continue;
    let ledge=solidSupports.filter(surface=>
      foe.x>=surface.x+12 && foe.x<=surface.x+surface.w-12 &&
      Math.abs(surface.y-23-foe.y)<28
    ).sort((a,b)=>Math.abs(a.y-23-foe.y)-Math.abs(b.y-23-foe.y))[0];
    const start=stageStarts[foe.spawnChapter];
    const end=start+stageWidths[foe.spawnChapter];
    const spawnOn=surface=>Math.max(surface.x+17,Math.min(surface.x+surface.w-17,foe.x));
    if(!ledge){
      ledge=solidSupports.filter(surface=>spawnOn(surface)>=start+100 && spawnOn(surface)<end)
        .sort((a,b)=>
          Math.hypot(spawnOn(a)-foe.x,a.y-23-foe.y)-
          Math.hypot(spawnOn(b)-foe.x,b.y-23-foe.y))[0];
    }
    if(ledge){
      foe.x=spawnOn(ledge);
      foe.y=ledge.y-23;
      foe.patrolLeft=ledge.x+17;
      foe.patrolRight=ledge.x+ledge.w-17;
    }
  }
  // Enemy tempo, horizontal reach, and vertical travel in course order.
  const enemyProfiles = [
    [0.88, 32, 0], // 1 · Foundry: readable stomping patrols
    [1.08, 0, 0], // 2 · Library: deliberate stationary sentries
    [0.82, 82, 20], // 3 · Coral: wider swimming schools
    [1.22, 120, 0], // 4 · Clocktower: faster charging hazards
    [0.9, 34, 54], // 5 · Garden: more expressive canopy hops
    [0.86, 105, 38], // 6 · Waterfall: broad aerial swoops
    [1.04, 22, 48], // 7 · Lantern: playful short hops
    [1.12, 38, 0], // 8 · Polarity: measured gravity patrols
    [1.04, 30, 24], // 9 · Stage Beat: tighter rhythmic motion
    [1.24, 0, 0], // 10 · Quarry: stationary firing threats
    [1.02, 68, 28], // 11 · Wind Sail: wider swoops
    [1.2, 66, 10], // 12 · Cloud City: persistent pursuers
    [0.86, 85, 0], // 13 · Harbor: committed charges
    [0.76, 36, 45], // 14 · Autumn: springing woodland enemies
    [0.9, 53, 12], // 15 · Observatory: tracking hunters
    [1.1, 74, 42], // 16 · Bamboo: arcing forest swoops
    [1.18, 27, 19], // 17 · Steamworks: readable dodge beats
    [1.38, 0, 0], // 18 · Snow: deliberate frost sentries
    [0.7, 26, 0], // 19 · Canyon: precise grounded guards
    [1.26, 52, 25], // 20 · Submarine: coordinated swimming threats
    [1.4, 78, 18], // 21 · Neon: aggressive sprint pursuers
    [0.72, 88, 0], // 22 · Temple: measured rush attacks
    [1.14, 24, 53], // 23 · Ferry: distinct springy hoppers
    [0.68, 65, 24], // 24 · Sunflower: gentle airborne sweeps
    [0.96, 0, 0], // 25 · Starship: fixed-position combat sentries
  ];
  const [enemyTempo, enemyReach, enemyRise] = enemyProfiles[index];
  const enemyRoundArt = {
    1:new Path2D('M-13 0L-5-3 2-7 12 0 2 7-5 3Z'),
    9:new Path2D('M-10-5H4Q12-5 12 0Q12 5 4 5H-10L-6 0Z'),
    17:new Path2D('M0-8L3-3 9-5 7 0 9 5 3 3 0 8-3 3-9 5-7 0-9-5-3-3Z'),
    24:new Path2D('M-14-3H5L13 0 5 3H-14L-9 0Z')
  };
  const enemyRounds = {
    1:[215,'#86daff'], // Moonlit Library sentry bolt
    9:[150,'#ffc178'], // Quarry Rescue warning shot
    16:[195,'#ffc562'], // Steamworks pressure pellet
    17:[165,'#dbf7ff'], // Snow Village frost pellet
    19:[255,'#ffad83'], // Submarine Dock: fast Contra-inspired tracer
    21:[175,'#d6b3ff'], // Marble Temple: deliberate temple projectile
    24:[245,'#ffe28e'] // Starship Cargo tracer
  };
  function enemyRound(position,direction,parryable) {
    const [speed,color]=enemyRounds[index] || [180,'#ff8479'];
    return {x:position.x+direction*12,y:position.y,v:direction*speed,life:2,parry:parryable,color};
  }
  function drawSteamworksEnemy(at,foe,faceLeft,firing) {
    ctx.save();
    ctx.translate(at.x,at.y);
    if(faceLeft) ctx.scale(-1,1);
    ctx.fillStyle='#302731';
    ctx.fillRect(-18,8,36,14);
    ctx.fillStyle=foe.turret?'#54817e':'#ba714b';
    ctx.fillRect(-15,-16,29,28);
    ctx.strokeStyle='#f1cb8a';
    ctx.lineWidth=2;
    ctx.strokeRect(-15,-16,29,28);
    ctx.fillStyle='#392d34';
    if(foe.turret){
      ctx.fillRect(7,-12,24,12);
      ctx.fillRect(-9,-23,12,7);
    }else{
      for(const x of [-11,10]){
        ctx.beginPath();
        ctx.arc(x,16,7,0,Math.PI*2);
        ctx.fill();
      }
      ctx.fillRect(-16,-23,6,9);
    }
    ctx.fillStyle=firing?'#fff1a5':'#e79651';
    ctx.fillRect(0,-10,8,5);
    ctx.restore();
  }
  const foundryLateEnemies=[["#b8d8a3","#385539","M-25 9L-20-9 -11-6 -8-21 0-12 9-20 13-7 23-3 18 11Z",0,28],["#ffac62","#7d3724","M-24 9Q-27-9-12-13L-6-25 3-12 15-13 24 4 13 12Z",24,20],["#cfe6f2","#405a70","M-26 1L-15-12 -5-8 0-22 8-9 24-8 19 9 -11 12Z",12,38],["#fbe0a0","#906036","M-22 12L-24-7 -11-19 12-19 23-9 19 13 9 9 -9 9Z",51,4],["#dcc3f1","#533c73","M-23 10Q-24-10-12-13L-7-25 -1-14 8-24 15-8 24 0 15 13Z",31,18],["#84e8f5","#305870","M-27 2L-18-9 -6-9 4-19 15-9 26-4 18 8 -7 10 -25 14Z",43,14],["#f0d779","#746036","M-24 12L-17-1 -19-15 -8-20 0-10 9-18 19-12 25 4 15 13Z",20,49],["#f1a8bf","#703349","M-26 7L-18-11 -7-4 1-22 10-8 22-14 26 4 14 13 -13 13Z",37,24],["#ffdf96","#95462e","M-25 12L-18-9 -12-6 -8-23 0-13 9-24 15-7 23-10 25 12Z",57,10]].map(([light,dark,shape,reach,rise])=>({
    colors:[light,dark], shape:new Path2D(shape), reach,rise
  }));
  const foundryEnemyDetails=["M-18 8l-5 10m13-9-3 12m20-12 5 10m-8-24 4-4 4 4","M-15 8q-9 11 5 12h23q10-4 4-12m-9-15h8","M-24 4l12-4-5 11m23-18 11 3-11 3","M-16 8v11h-7m36-11v13h8m-29-27h14v5h-14z","M-18 9l-10 7m18-6-5 12m26-13 11 5m-9-19h6","M-23 3l-9-8v16zM-5 8l9 10 8-11m4-12h6","M-16 7q-17 8-9 14m26-13q-3 11 10 10m-1-25h8","M-17 9l-5 10m12-10v14m15-15 12 11m-10-27 9 5","M-18 9v12h9m21-12 9 9h7m-23-26h12l-4 6z"].map(shape=>new Path2D(shape));
  const foundryEarlyDetails=[["M-15 8l-6 8 5 2m8-8-1 9m10-9 5 8m5-9 8 5","M-13-3q8-8 16-4m9 4h4"],["M-14 8q-11 4-9 10h13l7-7m10 0 6 9h10","M-2-17v12m6-10v12m6-8v8m3 3h5"],["M-17 7q-9 12 4 13q9 0 7-10m14 0q0 13 10 9q7-3 2-12","M4-8l13 4m-28-2h9"],["M-20 4q-9 0-11-9m10 15 7 7m14-8 7 5","M1-3q5-4 9 0m-22 3 6-5"],["M-15 8l-10 9h9m6-6 7 7m11-9 11 9","M-6 0l6-5 7 5m8-4 3 4"],["M-16 7l-9 5 1 7m10-8 3 10m22-11 9 4 4 6","M-11-9l8-3 6 3m5-3 8 4-5 4"],["M-14 7l-6 11h8m18-8 2 8h8","M13-16l5-7 2 12m-8 8 6 2"],["M-24 4q-7 9-12 4m23 3 11 5m10-7 10 4","M-11-6q9-5 20-2m4 3 4 2"],["M-12 0l-13-13m40 13 12-12m-27 22-8 6m12-6 7 6","M-4-8l3 3m7-3-2 3"]].map(paths=>paths.map(path=>new Path2D(path)));
  function drawFoundryEnemy(at,kind,faceLeft,offset,attackPose=0,recoil=0,gait=0,landing=0,hit=0) {
    const design=foundryLateEnemies[kind-9];
    const colors=design?.colors ?? [['#ffac68','#8b3b32'],['#ffe495','#805036'],['#c4a7e1','#493851'],['#9fe3e1','#305968'],['#ffcd8d','#823724'],['#e8b3e1','#55294c'],['#f0a271','#754021'],['#acf0dc','#285b6b'],['#e8d1ff','#583e83']][kind];
    ctx.save();
    ctx.translate(at.x,at.y);
    if(faceLeft) ctx.scale(-1,1);
    const phase=reducedMotion?0:clock*13+offset;
    if(!design){
      ctx.save();
      ctx.translate(0,Math.sin(phase)*(kind===8?3:1.8));
      ctx.strokeStyle=colors[1];
      ctx.lineWidth=4;
      ctx.lineJoin='round';
      ctx.lineCap='round';
      ctx.stroke(foundryEarlyDetails[kind][0]);
      ctx.restore();
    }
    const shell=ctx.createRadialGradient(-8,-11,2,0,0,23);
    shell.addColorStop(0,colors[0]);shell.addColorStop(1,colors[1]);
    ctx.fillStyle=shell;
    ctx.beginPath();
    if(design){
      ctx.fill(design.shape);
    }else if(kind===0){
      ctx.ellipse(-3,2,20,14,0,0,Math.PI*2);
    }else if(kind===1){
      ctx.moveTo(-18,11);ctx.quadraticCurveTo(-22,-11,-7,-19);
      ctx.quadraticCurveTo(5,-26,15,-8);ctx.lineTo(20,11);
    }else if(kind===3){
      ctx.ellipse(-2,4,23,9,-.2,0,Math.PI*2);
      ctx.ellipse(-8,-6,12,5,-.55,0,Math.PI*2);
    }else if(kind===4){
      ctx.moveTo(-22,12);ctx.lineTo(-13,-15);ctx.lineTo(-3,-8);ctx.lineTo(7,-21);ctx.lineTo(21,12);
    }else if(kind===6){ // Switchback ram
      ctx.moveTo(-20,12);ctx.lineTo(-18,-8);ctx.lineTo(-9,-17);
      ctx.lineTo(6,-17);ctx.lineTo(15,-29);ctx.lineTo(15,-10);
      ctx.lineTo(24,-3);ctx.lineTo(17,12);
    }else if(kind===7){ // Floodgate skimmer
      ctx.moveTo(-26,1);ctx.quadraticCurveTo(-14,-18,8,-13);
      ctx.quadraticCurveTo(18,-12,23,-3);ctx.lineTo(13,10);
      ctx.lineTo(-16,12);ctx.lineTo(-10,5);
    }else if(kind===8){ // Kiln canopy flier
      const wing=reducedMotion?0:Math.sin(phase)*7;
      ctx.moveTo(-4,7);ctx.lineTo(-25,-9-wing);ctx.lineTo(-11,-11);
      ctx.lineTo(-4,-22);ctx.lineTo(8,-13);ctx.lineTo(25,-8-wing);
      ctx.lineTo(15,8);ctx.lineTo(5,14);
    }else if(kind===5){
      ctx.moveTo(-21,12);ctx.quadraticCurveTo(-17,-17,1,-17);ctx.lineTo(20,-7);ctx.lineTo(14,12);
    }else{
      ctx.moveTo(-22,12);ctx.lineTo(-15,-9);ctx.lineTo(0,-17);
      ctx.lineTo(19,-8);ctx.lineTo(23,12);
    }
    ctx.closePath();ctx.fill();
    // Foundry enemy: articulated mechanical pincers and layered chest plating.
    // Both limbs use pivoted transforms and move with the existing animation
    // clock. All geometry is visual-only, with no collision changes.
    if(kind===0){
      const swing=reducedMotion?0:Math.sin(phase*.58)*.22+Math.sin(gait)*.14;
      const stagger=reducedMotion?0:Math.max(0,Math.min(1,hit));
      const strike=reducedMotion?0:Math.max(0,Math.min(1,attackPose));
      const impact=reducedMotion?0:Math.max(0,Math.min(1,recoil));
      for(const side of [-1,1]){
        ctx.save();
        ctx.translate(side*13,-3);
        ctx.rotate(side*(.15+swing-strike*.46+stagger*.24));
        const arm=ctx.createLinearGradient(0,-3,side*24,-18);
        arm.addColorStop(0,'#7a3541');arm.addColorStop(.48,'#ffca82');arm.addColorStop(1,'#8c4052');
        ctx.fillStyle=arm;ctx.strokeStyle='#4a293e';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(side*16,-12);
        ctx.lineTo(side*24,-9);ctx.lineTo(side*9,4);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.translate(side*23,-10);
        ctx.rotate(side*(.18+Math.sin(phase*.85+side)*.13+strike*.55-stagger*.2));
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(side*11,-11);
        ctx.lineTo(side*16,-12);ctx.lineTo(side*13,-3);
        ctx.lineTo(side*6,5);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.restore();
      }
      const chest=ctx.createLinearGradient(-12,-7,12,10);
      chest.addColorStop(0,'#fff1bc');chest.addColorStop(.5,'#c66e53');
      chest.addColorStop(1,'#673a45');
      ctx.fillStyle=chest;ctx.strokeStyle='#ffe1a0';ctx.lineWidth=1.3;
      ctx.beginPath();ctx.moveTo(-9,-5);ctx.lineTo(8,-5);
      ctx.lineTo(11,5);ctx.lineTo(0,10);ctx.lineTo(-10,5);
      ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=stagger>.05?'#ffedfb':'#fff6c6';ctx.beginPath();ctx.arc(0,1,2.7+impact*1.8+stagger,0,Math.PI*2);ctx.fill();
      if(landing>.002){
        ctx.save();ctx.globalAlpha=Math.min(.7,landing*8);ctx.strokeStyle='#ffc78c';ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(0,16,16+landing*100,3,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      if(impact>.04){
        ctx.save();ctx.globalAlpha=impact*.85;ctx.strokeStyle='#ffeaa4';ctx.lineWidth=2;
        for(const side of [-1,1]){
          ctx.beginPath();ctx.arc(side*31,-14,8+impact*10,-1.1,1.1);ctx.stroke();
          ctx.beginPath();ctx.moveTo(side*33,-24);ctx.lineTo(side*(36+impact*9),-28);ctx.stroke();
        }
        ctx.restore();
      }
    }
    if(design){
      ctx.strokeStyle=colors[0];
      ctx.lineWidth=2.5;
      ctx.lineJoin='round';
      ctx.stroke(foundryEnemyDetails[kind-9]);
      ctx.restore();
      return;
    }
    ctx.strokeStyle='#fff2c4';
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.stroke(foundryEarlyDetails[kind][1]);
    ctx.restore();
  }
  const libraryEnemyArt=[["#9af1ff","#284576","M-25 11H22L17-8 7-8 4-21H-12L-16-8H-23Z","M-18 13h35m-29-18h17m6 4h11",36,0],["#ecf7ff","#365986","M-25 1L-15-15 -6-9 4-24 10-9 24-9 22 10 -7 16Z","M-17 2l11-6m10-7 9 9m-5 8h14",0,46],["#ddc7ff","#524283","M-28-6L-14-15 -2-8 7-19 17-12 29-3 12 1 3 13 -9 9Z","M-23-5l14 5 6 10m11-20 9 5",36,27],["#ffe495","#664835","M-20 14V-3L-11-10 -11-22 8-22 14-10 20-9 25 4 15 14Z","M-11-3h22m-17-13h12m8 9h11",0,0],["#f9a78e","#76394c","M-27 5L-22-10 -15-10 -7-19 5-16 10-8 25-6 27 9 -22 15Z","M-22 10h40m-26-19 11 3m12 0h10",54,0],["#b7ffda","#24646b","M-25 2Q-20-19-5-16L3-24 12-15Q29-11 24 7L12 14 -14 13Z","M-18 4q10 7 28 3m-14-20h13m4 6 8 4",30,20]].map(([light,dark,body,details,reach,rise])=>({
    light,dark,body:new Path2D(body),details:new Path2D(details),reach,rise
  }));
  function drawLibraryEnemy(at,foe,faceLeft,firing,attackPose=0){
    const kind=foe.libraryEnemy;
    const design=libraryEnemyArt[kind];
    const phase=clock*2.5+foe.offset;
    const wave=Math.sin(phase);
    const hop=kind===1 ? Math.max(0,wave) : 0;
    const compression=kind===1 ? Math.max(0,-wave)**4*.13 : 0;
    const stretch=hop*Math.abs(Math.cos(phase))*.18;

    ctx.save();
    ctx.translate(at.x,at.y);
    if(faceLeft) ctx.scale(-1,1);
    if(!reducedMotion){
      ctx.translate(0,16);
      ctx.rotate(kind===1 ? -hop*Math.cos(phase)*.16 :
        design.reach ? Math.cos(phase)*.10 : 0);
      ctx.scale(1+compression-stretch*.5,1-compression+stretch);
      ctx.translate(0,-16);
    }
    const shade=ctx.createRadialGradient(-9,-12,1,0,0,29);
    shade.addColorStop(0,design.light);shade.addColorStop(1,design.dark);
    ctx.fillStyle=shade;
    ctx.fill(design.body);
    ctx.strokeStyle=firing?'#fff8c2':design.light;
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.stroke(design.details);
    // Moonlit Library: hinged illuminated pages and a closing book strike.
    const fold=reducedMotion?0:Math.max(0,Math.min(1,attackPose));
    const pageWave=reducedMotion?0:Math.sin(phase*2)*.12;
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*12,-9);
      ctx.rotate(side*(.3+pageWave-fold*.8));
      const paper=ctx.createLinearGradient(0,-13,side*19,6);
      paper.addColorStop(0,'#f5f0ff');paper.addColorStop(1,design.dark);
      ctx.fillStyle=paper;ctx.strokeStyle=design.light;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(0,-9);ctx.quadraticCurveTo(side*14,-16,side*22,-7);
      ctx.lineTo(side*21,8);ctx.quadraticCurveTo(side*10,2,0,8);
      ctx.closePath();ctx.fill();ctx.stroke();
      ctx.strokeStyle='#fdf2c6';ctx.lineWidth=.8;
      for(let row=-3;row<=4;row+=3){ctx.beginPath();ctx.moveTo(side*7,row);ctx.lineTo(side*16,row+1);ctx.stroke();}
      ctx.restore();
    }
    ctx.restore();
  }
  const reefBodies=["M-26 0Q-8-23 18-10L26 0 15 8Q-9 15-26 0Z","M-21 6Q-17-20 1-21Q23-18 21 6L12 10 4 6-4 11-12 6Z","M-27 0L-8-9 0-24 10-8 28 0 10 6 0 16-10 7Z","M-25 7L-18-8-9-7-6-19 2-10 12-18 15-7 25 0 14 11Z","M-28-4Q-12-15 3-8Q22-17 27-1Q20 12 4 7Q-14 13-28-4Z","M-23 9Q-27-6-9-13L1-11 8-24 13-13 22-12 28 3 10 13Z"].map(shape=>new Path2D(shape));
  const reefMotion=[[54,18,2],[19,28,1.7],[75,26,1.4],[35,12,2.8],[64,17,2.4],[43,37,1.3]];
  function drawReefEnemy(at,foe,faceLeft,attackPose=0){
    const kind=foe.reefEnemy;
    const phase=clock*reefMotion[kind][2]+foe.offset;
    ctx.save();
    ctx.translate(at.x,at.y);
    if(faceLeft) ctx.scale(-1,1);
    if(!reducedMotion) ctx.rotate(Math.cos(phase)*.13);
    const flex=reducedMotion?0:Math.sin(phase*3)*(4+kind%3);
    ctx.fillStyle=['#eb8a63','#a683c9','#5aa9ba','#d4a659','#87b869','#e17f9d'][kind];
    ctx.beginPath();
    if(kind===1){
      for(const x of [-15,-5,5,15]){
        ctx.moveTo(x,6);ctx.quadraticCurveTo(x+flex,17,x-3,24);
        ctx.lineTo(x+2,24);ctx.quadraticCurveTo(x+flex+5,17,x+4,6);
      }
    }else{
      ctx.moveTo(-15,0);ctx.lineTo(-30,-10+flex);
      ctx.lineTo(-35+kind,1);ctx.lineTo(-30,11-flex);
    }
    ctx.fill();
    const shade=ctx.createRadialGradient(-8,-12,1,0,0,29);
    shade.addColorStop(0,['#ffd5a0','#edcfff','#b2f1ed','#fff0a2','#e4f99b','#ffe0d3'][kind]);
    shade.addColorStop(1,['#80434e','#533267','#246078','#735143','#426752','#783451'][kind]);
    ctx.fillStyle=shade;ctx.fill(reefBodies[kind]);
    ctx.fillStyle='#fff2cf';ctx.beginPath();
    ctx.ellipse(kind===1?4:12,kind===2?0:-4,3,2.5,0,0,Math.PI*2);ctx.fill();
    // Coral Courier: flexible fin strokes and a forward water-jet attack.
    const thrust=reducedMotion?0:Math.max(0,Math.min(1,attackPose));
    const finBeat=reducedMotion?0:Math.sin(phase*2.4)*7;
    ctx.fillStyle=['#f5b78b','#c7b5f2','#85e4e5','#f6df98','#b3e6a6','#f6acc8'][kind];
    ctx.strokeStyle='#e7ffff';ctx.lineWidth=1.3;
    for(const side of [-1,1]){
      ctx.beginPath();ctx.moveTo(side*7,4);
      ctx.quadraticCurveTo(side*(20+thrust*7),13+finBeat,side*(26+thrust*9),17);
      ctx.quadraticCurveTo(side*12,11,side*7,4);ctx.fill();ctx.stroke();
    }
    if(thrust>.03){
      ctx.save();ctx.globalAlpha=thrust*.7;ctx.strokeStyle='#bdfbff';ctx.lineWidth=2;
      for(let jet=0;jet<3;jet++){
        ctx.beginPath();ctx.moveTo(-26-jet*5,-7+jet*6);
        ctx.quadraticCurveTo(-35-jet*6,-9+jet*6,-46-jet*7,-7+jet*6);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }
  const clockBodies=["M-22 9L-13-12H10L24 4V14H-22Z","M-24 3L-14-15 8-18 23-7 16 12H-17Z","M-19 12V-13L0-23 20-12V12Z","M-26 0L-10-8 0-20 11-8 26 0 11 9 0 15Z","M-24 12L-18-6 -8-6 -3-22 15-16 24 12Z","M-25 8L-21-13 -10-8 0-24 12-7 23-13 26 11Z"].map(shape=>new Path2D(shape));
  const clockTravel=[34,53,23,58,31,46];
  const clockRise=[0,17,40,26,0,19];
  function drawClockEnemy(at,foe,faceLeft,attackPose=0){
    const kind=foe.clockEnemy;
    const phase=clock*(2+kind*.16)+foe.offset;
    ctx.save();
    ctx.translate(at.x,at.y);
    if(faceLeft)ctx.scale(-1,1);
    if(!reducedMotion)ctx.rotate(Math.cos(phase)*.12);
    const shade=ctx.createRadialGradient(-8,-10,2,0,0,28);
    shade.addColorStop(0,['#ffe1a0','#b4e8f2','#f7c789','#c4d2ff','#ffd4b3','#f6b276'][kind]);
    shade.addColorStop(1,'#443243');
    ctx.fillStyle=shade;ctx.fill(clockBodies[kind]);
    ctx.strokeStyle='#fff3cb';ctx.lineWidth=2;
    if(!reducedMotion)ctx.rotate(phase*(kind%2?-1:1));
    ctx.beginPath();
    ctx.arc(0,0,4+kind,0,Math.PI*2);
    ctx.moveTo(-7-kind,0);ctx.lineTo(7+kind,0);
    ctx.stroke();
    // Clocktower Relay: ratcheting clock hands accelerate into a strike.
    const strike=reducedMotion?0:Math.max(0,Math.min(1,attackPose));
    ctx.rotate(strike*(kind%2?-1:1)*.95);
    ctx.strokeStyle='#ffce71';ctx.lineWidth=3;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-17-kind);ctx.stroke();
    ctx.fillStyle='#fff1bc';ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function foePosition(foe) {
    if(foe.bashed && clock<foe.bashed.until){
      const t=.48-(foe.bashed.until-clock);
      return {x:foe.bashed.x+foe.bashed.vx*t,y:foe.bashed.y+foe.bashed.vy*t};
    }
    const homeDifficulty=Math.min(5,foe.spawnChapter ?? stageAt(foe.x));
    if(foe.reefEnemy!==undefined){
      const [reach,rise,tempo]=reefMotion[foe.reefEnemy];
      // Reef swimmers gain tempo as the courier reaches deeper chapters.
      const reefPressure=1+homeDifficulty*.045;
      const phase=clock*tempo*reefPressure+foe.offset;
      return {x:foe.x+Math.sin(phase)*reach,y:foe.y+Math.cos(phase*(foe.reefEnemy%2?2:1))*rise};
    }
    if (foe.turret) return {x:foe.x,y:foe.y};
    const patrolX=x=>foe.patrolLeft===undefined ? x :
      Math.max(foe.patrolLeft,Math.min(foe.patrolRight,x));
    // Later chapters accelerate ordinary patrol cycles without changing
    // each game's unique enemy motion family or the boss encounter.
    const chapterPressure=1+homeDifficulty*0.065;
    // Each archetype changes actual movement timing, not just its colors.
    // Unique authored foundry/library/reef/clock motion remains prioritized.
    const archetypeTempo=[1,.82,1.18,1.06][foe.archetype??0];
    const t = clock * (2 * enemyTempo / cadence) * chapterPressure *
      archetypeTempo + foe.offset;
    const chase = Math.sign(player.x-foe.x);
    // Different encounter archetypes get distinct movement envelopes:
    // scout = narrow, sentry = measured, skirmisher = wide, raider = sharp.
    const patrolSpan=[.75,.9,1.15,1][foe.archetype??0];
    // Raiders lunge then recover, while skirmishers move on a smooth arc.
    // This changes position and dodge timing, not merely visual effects.
    const baseWave=Math.sin(t*2.1);
    const wave=(foe.archetype===3 ?
      Math.sign(baseWave)*Math.pow(Math.abs(baseWave),3) : baseWave)*patrolSpan;
    if(foe.foundryEnemy!==undefined){
      // Foundry enemies have authored hop/charge cycles; scale the entire
      // cycle rather than replacing their distinct attack motion.
      const foundryPressure=1+homeDifficulty*.05;
      const cycle=(clock*foundryPressure+foe.offset)%2.4;
      const hop=Math.max(0,1-Math.abs(cycle-1.65)/.42);
      const surge=Math.sin(Math.PI*Math.min(1,Math.max(0,(cycle-.65)/1.35)));
      if(foe.foundryEnemy===3) return {x:patrolX(foe.x+wave*34),y:foe.y-14*(1+Math.cos(cycle*Math.PI/1.2))};
      if(foe.foundryEnemy===4) return {x:patrolX(foe.x+wave*12),y:foe.y-34*hop**2};
      if(foe.foundryEnemy===5) return {x:patrolX(foe.x+chase*surge**3*60),y:foe.y-12*surge};
      if(foe.foundryEnemy===6) return {x:patrolX(foe.x+Math.sin(cycle*Math.PI/1.2)**3*39),y:foe.y};
      if(foe.foundryEnemy===7) return {x:patrolX(foe.x+Math.sin(cycle*Math.PI/1.2)*38),y:foe.y-8-6*Math.cos(cycle*Math.PI/1.2)};
      if(foe.foundryEnemy===8) return {x:patrolX(foe.x+Math.sin(cycle*Math.PI/1.2)*30),y:foe.y-26-13*Math.cos(cycle*Math.PI/1.2)};
      const design=foundryLateEnemies[foe.foundryEnemy-9];
      if(design){
        const airborne=foe.foundryEnemy===11 || foe.foundryEnemy===14;
        const dx=airborne ? Math.sin(cycle*Math.PI/1.2)*design.reach :
          chase*surge**2*design.reach;
        const lift=airborne ? (.65+.35*Math.cos(cycle*Math.PI/1.2))*design.rise :
          hop*(2-hop)*design.rise;
        return {x:patrolX(foe.x+dx),y:foe.y-lift};
      }
      const shift=foe.foundryEnemy===1?0:foe.foundryEnemy===2?chase*surge**2*46:wave*24;
      return {x:patrolX(foe.x+shift),y:foe.y-(foe.foundryEnemy===1?hop*(2-hop)*49:0)};
    }
    if(foe.libraryEnemy!==undefined){
      const design=libraryEnemyArt[foe.libraryEnemy];
      const phase=clock*2.5+foe.offset;
      const travel=foe.libraryEnemy===4?chase*Math.max(0,Math.sin(phase))**3:Math.sin(phase);
      const lift=foe.libraryEnemy===1?Math.max(0,Math.sin(phase))**2:(1+Math.cos(phase))/2;
      return {x:patrolX(foe.x+travel*design.reach),y:foe.y-lift*design.rise};
    }
    if(foe.clockEnemy!==undefined){
      const kind=foe.clockEnemy;
      const phase=clock*(2+kind*.16)+foe.offset;
      const wave=Math.sin(phase);
      const travel=kind>=4?chase*Math.max(0,wave)**(kind===4?3:2):wave;
      const lift=kind===3?(1+Math.cos(phase))/2:Math.max(0,wave)**2;
      return {x:patrolX(foe.x+travel*clockTravel[kind]),y:foe.y-lift*clockRise[kind]};
    }
    if(index===3 && foe.clockEnemy===undefined){ // Clocktower Relay: accelerating patrol arcs
      const burst=Math.sin(t*1.4);
      return {x:patrolX(foe.x+Math.sign(burst)*Math.abs(burst)**.6*enemyReach),y:foe.y};
    }
    // Ground-based ordinary enemies must not inherit decorative vertical
    // motion. Only explicit flyers, swimmers, gravity actors, or jumpers
    // are permitted to leave their platform's contact height.
    if([0,3,16,19].includes(index) &&
       foe.foundryEnemy===undefined && foe.clockEnemy===undefined &&
       foe.reefEnemy===undefined && foe.libraryEnemy===undefined){
      return {x:patrolX(foe.x+wave*enemyReach),y:foe.y};
    }
    // Original encounter movement tuned to each counterpart's gameplay feel.
    // These only affect ordinary foes, after the authored special-enemy cases.
    if(index===4){ // Seed Garden: canopy beetles leap between branches
      const leap=Math.max(0,Math.sin(t*2.3));
      return {x:patrolX(foe.x+wave*enemyReach*.8),y:foe.y-leap*leap*enemyRise*1.3};
    }
    if(index===7){ // Crystal Polarity: inverted gravity sentries
      const polarity=Math.sin(t*.75)>0?1:-1;
      return {x:patrolX(foe.x+wave*enemyReach*.65),
        y:foe.y-polarity*enemyRise*.65};
    }
    if(index===9){ // Quarry Rescue: guarding a fixed grapple lane
      const sweep=Math.sin(t*.85);
      return {x:patrolX(foe.x+sweep*enemyReach*.5),
        y:foe.y};
    }
    if(index===12){ // Thunder Harbor: measured armored charge and recovery
      const surge=Math.max(0,Math.sin(t*1.2));
      return {x:patrolX(foe.x+chase*enemyReach*surge*surge),
        y:foe.y};
    }
    if(index===13){ // Autumn Trail: springing woodland enemies land between hops
      const hop=Math.max(0,Math.sin(t*2.4));
      return {x:patrolX(foe.x+wave*enemyReach*.9),
        y:foe.y-hop*hop*enemyRise};
    }
    if(index===14){ // Inverted Observatory: alternating gravity orbit
      const gravity=Math.sin(t*.95);
      return {x:patrolX(foe.x+Math.cos(t*1.2)*enemyReach*.6),
        y:foe.y-gravity*enemyRise*.9};
    }
    if(index===17){ // Snow Village: short icy slides with recovery
      const slide=Math.sin(t*.8);
      return {x:patrolX(foe.x+Math.sign(slide)*Math.abs(slide)**2*enemyReach),
        y:foe.y};
    }
    if(index===18){ // Canyon Crossing: patrol at rope-bridge crossings
      const patrol=Math.sin(t*.9);
      return {x:patrolX(foe.x+patrol*enemyReach*.75),
        y:foe.y};
    }
    if(index===20){ // Neon Circuit: burst sprint then braking phase
      const sprint=Math.sin(t*1.55);
      return {x:patrolX(foe.x+Math.sign(sprint)*Math.abs(sprint)**.55*enemyReach),
        y:foe.y};
    }
    if(index===22){ // Swamp Ferry: hopping between reeds
      const hop=Math.max(0,Math.sin(t*2.4));
      return {x:patrolX(foe.x+wave*enemyReach*.65),
        y:foe.y-hop*enemyRise*.95};
    }
    if(index===5){ // Waterfall Climb: descending mist swoops with a recovery climb
      const dive=Math.max(0,Math.sin(t*1.35));
      const glide=Math.sin(t*.72);
      return {x:patrolX(foe.x+glide*enemyReach*.85),
        y:foe.y-enemyRise*(.3+.7*(1-dive*dive))};
    }
    if(index===8){ // Stage Beat: enemies move on predictable musical counts
      const beat=t*1.45;
      const step=Math.round(Math.sin(beat)*3)/3;
      const pulse=Math.max(0,Math.sin(beat*2));
      return {x:patrolX(foe.x+step*enemyReach*.65),
        y:foe.y-pulse*pulse*enemyRise*.55};
    }
    if(index===11){ // Cloud City: pursue then pause to allow precision dodges
      const chaseWindow=Math.max(0,Math.sin(t*.92));
      const dash=chaseWindow*chaseWindow;
      return {x:patrolX(foe.x+chase*dash*enemyReach*.85),
        y:foe.y-Math.max(0,Math.sin(t*1.4))*enemyRise*.65};
    }
    if(index===23){ // Sunflower Flight: drifting pollen guardians rise and settle
      const drift=Math.sin(t*.64);
      const float=Math.sin(t*1.15+.7);
      return {x:patrolX(foe.x+drift*enemyReach*.7),
        y:foe.y-enemyRise*(.45+.35*float)};
    }
    if(index===1 && foe.libraryEnemy===undefined){ // Moonlit Library: deliberate sentry pauses
      const aim=Math.sin(t*.8);
      return {x:patrolX(foe.x+Math.sign(aim)*Math.max(0,Math.abs(aim)-.3)*enemyReach*.65),y:foe.y};
    }
    if(index===2 && foe.reefEnemy===undefined){ // Coral Courier: reef schools swim in waves
      return {x:patrolX(foe.x+Math.sin(t*.9)*enemyReach*.75),
        y:foe.y+Math.sin(t*1.3+foe.offset)*enemyRise*.55};
    }
    // More course-specific enemy traversal, inspired by each game's
    // pacing rather than copying any counterpart's character or map.
    if(index===6){ // Lantern Festival: grounded hoppers return to their platforms
      const hop=Math.max(0,Math.sin(t*1.4));
      return {x:patrolX(foe.x+Math.sin(t*.9)*enemyReach*.6),
        y:foe.y-hop*hop*enemyRise};
    }
    if(index===10){ // Sunset Wind Sail: enemies ride updrafts
      const gust=Math.sin(t*.85);
      return {x:patrolX(foe.x+gust*enemyReach*.8),
        y:foe.y-22-(.5+.5*Math.sin(t*1.7))*enemyRise};
    }
    if(index===15){ // Bamboo Village: ambush, then retreat
      const cycle=(t*.65)%2;
      const rush=cycle<.55?cycle/.55:cycle<1.1?1:Math.max(0,1-(cycle-1.1)/.9);
      return {x:patrolX(foe.x+chase*rush*enemyReach*.7),
        y:foe.y};
    }
    if(index===21){ // Marble Temple: guarded pendulum sweeps
      const swing=Math.sin(t*.9);
      return {x:patrolX(foe.x+swing*enemyReach*.65),
        y:foe.y};
    }
    if(index===24){ // Starship Cargo: grounded deck guards; turrets remain stationary above
      const drift=Math.sin(t*1.25);
      return {x:patrolX(foe.x+drift*enemyReach*.7),y:foe.y};
    }
    switch (enemyPattern) {
      case 'turret': return {x:foe.x,y:foe.y};
      case 'charge': return {x:patrolX(foe.x+chase*Math.max(0,wave)*enemyReach),y:foe.y};
      case 'hopper': { // Distinct jumping arcs with a grounded landing phase
        const hop=Math.max(0,Math.sin(t*3.5));
        return {x:patrolX(foe.x+wave*enemyReach),y:foe.y-hop*hop*enemyRise};
      }
      case 'swoop': { // Rayman / Klonoa / Ori: readable aerial swoops
        // The dive is steepest at the center of the flight arc, with a
        // distinct climb afterward rather than a flat sine-wave patrol.
        const flight=Math.sin(t*1.6);
        const dive=Math.max(0,1-Math.abs(flight));
        return {x:patrolX(foe.x+flight*enemyReach),
          y:foe.y-50-Math.cos(t*1.6)*enemyRise+dive*enemyRise*.35};
      }
      case 'school': { // Coral and submarine routes: looping swim paths
        const swim=Math.sin(t*1.35);
        return {x:patrolX(foe.x+swim*enemyReach),
          y:foe.y-33-Math.sin(t*2.7+foe.offset*.3)*enemyRise*.8};
      }
      case 'pursuit': { // Celeste-inspired chase: approach, pause, retreat
        const cycle=(t*.42)%3;
        const advance=cycle<1 ? cycle : cycle<1.7 ? 1 :
          Math.max(.3,1-(cycle-1.7)*.5);
        // Chasers on ordinary platforms stay grounded; only explicitly
        // airborne course enemies use vertical flight paths.
        return {x:patrolX(foe.x+chase*enemyReach*advance),y:foe.y};
      }
      case 'rhythm': { // Geometry Dash-inspired predictable beat timing
        const beat=Math.floor(t*1.5);
        const beatPhase=(t*1.5)%1;
        // A brief planted beat makes the next jump readable on touchscreens.
        const jumpPhase=Math.max(0,(beatPhase-.18)/.82);
        const bounce=Math.sin(jumpPhase*Math.PI);
        const direction=beat%2===0?1:-1;
        return {x:patrolX(foe.x+direction*enemyReach*.72),
          y:foe.y-Math.max(0,bounce)**2*enemyRise};
      }
      default: return {x:patrolX(foe.x+wave*enemyReach),y:foe.y};
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
  function castShadow(x,y,radius) {
    // Avoid scanning terrain or allocating gradients for off-screen actors.
    if(x<camera-radius-130 || x>camera+width+radius+130)return;
    let surface=Infinity;
    // Keep the existing floor separate to avoid allocating a new array for
    // every hero, enemy and guardian shadow on every animation frame.
    if(escape && x>=returnFloor.x && x<=returnFloor.x+returnFloor.w && returnFloor.y>=y)
      surface=returnFloor.y;
    for(const ledge of platforms) {
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
    // Transform before constructing the gradient so its center follows
    // the same local coordinate space as the flattened contact ellipse.
    ctx.translate(centerX,centerY);
    ctx.scale(1,thickness/spread);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,spread);
    shadow.addColorStop(0,'rgba(7,9,22,'+(.43*fade).toFixed(3)+')');
    shadow.addColorStop(.52,'rgba(7,9,22,'+(.22*fade).toFixed(3)+')');
    shadow.addColorStop(1,'rgba(7,9,22,0)');
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
    const stage=Math.min(libraryPlatforms.length-1,stageAt(x));
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
  const platformInlays = [
    new Path2D('M-8 3 L-4 -2 L0 3 L4 -2 L8 3'), // Ember Foundry
    new Path2D('M-8 4 L-8 0 L-4 -4 L0 0 L4 -4 L8 0 L8 4'), // Moonlit Library
    new Path2D('M-7 3 L0 -4 L7 3 M0 -4 L0 4'), // Coral Courier
    new Path2D('M-8 3 L-8 -3 L8 -3 L8 3 M-3 -3 L-3 3 M3 -3 L3 3'), // Clocktower Relay
    new Path2D('M-8 3 L0 -4 L8 3 L0 1 L-8 3'), // Seed Garden
    new Path2D('M-8 -3 L0 4 L8 -3 M-4 -3 L0 0 L4 -3'), // Waterfall Climb
    new Path2D('M-8 0 L0 -4 L8 0 L0 4 Z M0 -4 L0 4'), // Lantern Festival
    new Path2D('M-8 0 L-4 -4 L4 -4 L8 0 L4 4 L-4 4 Z'), // Crystal Polarity
    new Path2D('M-8 2 L-5 2 L-5 -2 L-1 -2 L-1 4 L3 4 L3 -4 L7 -4'), // Stage Beat
    new Path2D('M-8 3 L-4 -4 L0 1 L4 -2 L8 3'), // Quarry Rescue
    new Path2D('M-8 4 L0 -4 L8 4 Z M0 -4 L0 4'), // Sunset Wind Sail
    new Path2D('M-8 2 L-4 -1 L0 2 L4 -1 L8 2 M-4 -1 L-2 -4 L2 -4 L4 -1'), // Cloud City
    new Path2D('M-8 -3 L1 -3 L-2 1 L8 1 L1 4'), // Thunder Harbor
    new Path2D('M-8 -3 L0 -1 L8 4 M0 -1 L3 -4 M0 -1 L-3 3'), // Autumn Trail
    new Path2D('M-8 0 L8 0 M0 -4 L0 4 M-4 -3 L4 3'), // Inverted Observatory
    new Path2D('M-8 -4 L-8 4 M0 -4 L0 4 M8 -4 L8 4 M-8 0 L8 0'), // Bamboo Village
    new Path2D('M-8 4 L-3 -4 L3 -4 L8 4 M-5 0 L5 0'), // Steamworks
    new Path2D('M-8 -3 L0 3 L8 -3 M-8 3 L0 -3 L8 3'), // Snow Village
    new Path2D('M-8 4 L-8 1 L-3 1 L-3 -2 L2 -2 L2 -4 L8 -4'), // Canyon Crossing
    new Path2D('M-8 -4 L8 -4 L8 4 L-8 4 Z M-4 0 L4 0'), // Submarine Dock
    new Path2D('M-8 3 L-4 3 L-4 -3 L4 -3 L4 3 L8 3'), // Neon Circuit
    new Path2D('M-8 4 L-8 -4 L8 -4 L8 4 M-4 4 L-4 0 L4 0 L4 4'), // Marble Temple
    new Path2D('M-8 2 L-3 -1 L1 1 L8 -3 M-3 -1 L-1 -4'), // Swamp Ferry
    new Path2D('M-8 0 L0 -4 L8 0 L0 4 Z M-5 0 L5 0'), // Sunflower Flight
    new Path2D('M-8 -4 L-4 0 L-8 4 M8 -4 L4 0 L8 4 M-2 0 L2 0')  // Starship Cargo
  ];
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
  // Each course has its own deck cross section and surface markings.
  const platformProfiles = [
    [49,29,new Path2D('M0 0H48L43 18 28 26 9 21Z'),new Path2D('M6 7H39M12 14H32')],
    [54,18,new Path2D('M0 0H54V12H46V18H8V12H0Z'),new Path2D('M6 5H46M15 11H39')],
    [63,37,new Path2D('M0 0H63L55 12 59 21 46 23 40 34 26 29 17 37 10 22Z'),new Path2D('M9 9Q26 21 43 8M26 14L31 24')],
    [48,22,new Path2D('M0 0H48L39 22H10Z'),new Path2D('M0 0H24V10H0ZM24 10H42V20H24Z')],
    [62,32,new Path2D('M0 0H62V11L53 19 49 32 38 14 22 14 10 29 9 11H0Z'),new Path2D('M4 6H58M14 10L42 8')],
    [60,36,new Path2D('M0 0H60L49 16 43 13 32 35 18 24 10 26Z'),new Path2D('M6 5L24 9 37 5 51 8')],
    [52,27,new Path2D('M0 0H52Q46 25 27 27Q8 24 0 0Z'),new Path2D('M10 8H42M21 9L26 22 31 9')],
    [58,24,new Path2D('M0 0H58L45 24H14Z'),new Path2D('M13 8H45L37 17H22Z')],
    [42,20,new Path2D('M0 0H42V20H0Z'),new Path2D('M5 4H37V16H5Z')],
    [64,27,new Path2D('M0 0H64V7L35 27H27L0 7Z'),new Path2D('M6 5L30 20 56 5')],
    [55,30,new Path2D('M0 0H55Q50 13 37 16L29 30 19 16Q5 13 0 0Z'),new Path2D('M12 6Q28 22 43 6')],
    [46,38,new Path2D('M0 0H46L42 11 30 15 22 38 11 20 5 21Z'),new Path2D('M6 5L16 13 29 7 40 8')],
    [59,30,new Path2D('M0 0H59V19H51V30H10V21H0Z'),new Path2D('M5 10H54M17 10V28M40 10V28')],
    [53,25,new Path2D('M0 0H53Q47 25 26 25Q9 24 0 0Z'),new Path2D('M5 8Q16 1 25 9T47 9')],
    [62,26,new Path2D('M0 0H62V13H52L44 26H18L9 13H0Z'),new Path2D('M8 5H54M20 12H42V20H20Z')],
    [64,42,new Path2D('M0 0H64Q56 13 46 15L32 40 34 18 19 25 23 12Q7 11 0 0Z'),new Path2D('M5 5Q30 19 57 5')],
    [56,23,new Path2D('M0 0H56V12H48L41 23H15L8 12H0Z'),new Path2D('M6 6H50M16 14H40')],
    [59,33,new Path2D('M0 0H59V9H54Q49 33 29 33Q10 32 5 9H0Z'),new Path2D('M6 7H53M17 13Q29 28 42 13')],
    [57,25,new Path2D('M0 0H57V11H48V17H40V25H17V17H8V11H0Z'),new Path2D('M8 6H49M17 14H40')],
    [55,22,new Path2D('M0 0H55V16H44V22H11V16H0Z'),new Path2D('M4 5H51M13 7L19 15M26 7L32 15M39 7L45 15')],
    [65,26,new Path2D('M0 0H65V22L53 26 42 20 23 26 12 21 0 23Z'),new Path2D('M0 8H65M8 15H56')],
    [64,35,new Path2D('M0 0H64V35H49Q48 16 32 12Q16 16 15 35H0Z'),new Path2D('M6 7H58M9 12V28M55 12V28')],
    [60,29,new Path2D('M0 0H60L52 15 42 29H18L8 15Z'),new Path2D('M11 6L49 18M49 6L11 18')],
    [51,23,new Path2D('M0 0H51V14Q43 29 34 17Q26 30 17 17Q8 29 0 14Z'),new Path2D('M3 7H49M7 8v5m9-5v5m9-5v5m9-5v5m9-5v5')],
    [68,30,new Path2D('M0 0H68V12H60L54 28H14L8 12H0Z'),new Path2D('M4 6H64M15 12H53M22 17H46V23H22Z')]
  ];
  const platformBodies = [
    [0,0,100,0,100,26,81,39,64,33,48,52,22,43,0,28 ],
    [0,0,100,0,100,9,84,9,72,27,28,27,16,9,0,9 ],
    [0,0,100,0,93,15,81,12,66,45,51,33,38,56,21,31,8,35 ],
    [0,0,100,0,97,13,76,13,63,23,29,23,12,15 ],
    [0,0,100,0,100,8,87,11,80,44,73,43,68,12,34,12,24,36,17,35,15,12,0,9 ],
    [0,0,100,0,84,24,69,20,57,53,41,45,25,69,9,25 ],
    [0,0,100,0,96,15,85,25,71,32,50,36,29,32,14,25,4,15 ],
    [0,0,100,0,84,8,77,32,61,8,39,8,23,32,16,8 ],
    [0,0,100,0,100,22,73,22,73,34,27,34,27,22,0,22 ],
    [0,0,100,0,100,10,56,52,44,52,0,10 ],
    [0,0,100,0,88,15,68,14,50,58,32,14,12,15 ],
    [0,0,100,0,94,18,76,31,71,49,53,64,43,47,24,58,16,31,4,19 ],
    [0,0,100,0,100,16,86,16,86,35,66,35,66,24,34,24,34,35,14,35,14,16,0,16 ],
    [0,0,100,0,96,13,79,22,60,26,39,29,20,22,7,15 ],
    [0,0,100,0,100,9,91,9,83,24,74,24,67,15,33,15,26,24,17,24,9,9,0,9 ],
    [0,0,100,0,91,12,61,15,67,47,48,28,38,66,29,64,34,17,11,14 ],
    [0,0,100,0,100,10,92,10,92,30,85,30,85,10,15,10,15,30,8,30,8,10,0,10 ],
    [0,0,100,0,97,17,80,31,69,40,50,48,31,40,20,31,3,17 ],
    [0,0,100,0,100,13,83,13,83,24,65,24,65,35,35,35,35,24,17,24,17,13,0,13 ],
    [0,0,100,0,100,16,82,29,64,29,64,35,24,35,24,27,0,19 ],
    [0,0,100,0,100,14,92,14,87,38,79,37,74,14,52,14,48,27,38,25,31,14,0,14 ],
    [0,0,100,0,100,56,81,56,81,33,74,23,64,16,50,13,36,16,26,23,19,33,19,56,0,56 ],
    [0,0,100,0,91,22,73,33,57,48,41,38,26,41,10,18 ],
    [0,0,100,0,100,16,91,25,81,16,71,25,61,16,51,25,41,16,31,25,21,16,11,25,0,16 ],
    [0,0,100,0,100,12,89,12,79,33,21,33,11,12,0,12 ]
  ];
  function drawCoursePlatform({x,y,w}) {
    const [face,recess,rim]=courseMaterials[index];
    const [spacing,, ,marking]=platformProfiles[index];
    const body=platformBodies[index];
    const end=Math.min(x+w,camera+width);
    const first=x+Math.max(0,Math.floor((camera-x)/spacing))*spacing;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x,y,w,height-y);
    ctx.clip();
    if(y>=ground){
      ctx.fillStyle=recess;
      ctx.fillRect(x,y+12,w,height-y);
    }
    ctx.beginPath();
    ctx.moveTo(x,y);
    for(let point=2;point<body.length;point+=2){
      ctx.lineTo(x+body[point]*w/100,y+body[point+1]);
    }
    ctx.closePath();
    const surface=ctx.createLinearGradient(0,y,0,y+58);
    surface.addColorStop(0,face);
    surface.addColorStop(1,recess);
    ctx.fillStyle=surface;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle=rim;
    ctx.globalAlpha=.72;
    for(let panel=first;panel<end;panel+=spacing){
      ctx.save();
      ctx.translate(panel,y);
      ctx.stroke(marking);
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle=rim;
    ctx.fillRect(x,y,w,2);
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
      // Each chapter shifts the composition of all three parallax planes:
      // broad foreground shapes, distant smaller silhouettes, and different
      // sightlines. Keep the closest plane slow enough for mobile readability.
      speed:layer.speed*(.92+(seed%5)*.035),
      spacing:layer.spacing+seed*3+(stage%3-1)*12,
      baseline:layer.baseline+(seed%5-2)*4+(stage%4-1.5)*5,
      scale:layer.scale*(.94+(seed%6)*.025)*(1+(stage%3-1)*.045),
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
      // Mix three terrain-height rhythms instead of repeating the same
      // silhouette every few tiles. Each world has its own profile.
      const broad=Math.sin(tile*.63+index*.71)*21;
      const detail=Math.sin(tile*1.73+index*.39)*11;
      const chapterPulse=Math.sin((tile+index*7)*.19)*17;
      const rise=Math.max(36,(82+broad+detail+chapterPulse)*scale);
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
      // Directional rim lighting: the ridge follows the same silhouette
      // rather than drawing a disconnected line over the backdrop.
      ctx.save();
      ctx.clip();
      const reflected=ctx.createLinearGradient(x,top,x+spacing,baseline);
      reflected.addColorStop(0,'rgba(255,247,213,.17)');
      reflected.addColorStop(.5,'rgba(255,247,213,.025)');
      reflected.addColorStop(1,'rgba(8,13,30,.12)');
      ctx.fillStyle=reflected;
      ctx.fillRect(x,top,spacing,baseline-top);
      ctx.restore();
      ctx.globalAlpha=opacity*.34;
      ctx.stroke();
      ctx.globalAlpha=opacity;
      // Secondary silhouettes add readable depth to the actual scrolling
      // stages. World-specific motifs are deterministic and screen-cullable;
      // no sprites, collisions, or copyrighted reference artwork are reused.
      const motif=(tile+index*3)%4;
      const cx=x+spacing*(.32+motif*.09);
      ctx.save();
      ctx.globalAlpha=opacity*.58;
      ctx.strokeStyle=rim;
      ctx.lineWidth=Math.max(1,scale*2);
      ctx.beginPath();
      if(sceneryShapes[index]==='works'){
        // Foundries, observatories, factories and starships: vents and braces.
        const towerY=top+32+motif*6;
        ctx.moveTo(cx,towerY);ctx.lineTo(cx,baseline-10);
        ctx.moveTo(cx-12,towerY+8);ctx.lineTo(cx+12,towerY+8);
        ctx.moveTo(cx-9,towerY+8);ctx.lineTo(cx+9,towerY+22);
        ctx.moveTo(cx+9,towerY+8);ctx.lineTo(cx-9,towerY+22);
      }else if(sceneryShapes[index]==='grove'){
        // Forest and garden courses: layered branch canopies.
        const stem=top+35+motif*4;
        ctx.moveTo(cx,baseline);ctx.lineTo(cx,stem);
        ctx.moveTo(cx,stem+24);ctx.quadraticCurveTo(cx-23,stem-9,cx-35,stem+12);
        ctx.moveTo(cx,stem+17);ctx.quadraticCurveTo(cx+22,stem-15,cx+35,stem+5);
      }else if(sceneryShapes[index]==='reef'){
        // Underwater courses: branching reef fans and seagrass.
        ctx.moveTo(cx,baseline);ctx.quadraticCurveTo(cx-15,top+48,cx-5,top+30);
        ctx.moveTo(cx-8,baseline-29);ctx.quadraticCurveTo(cx-32,top+54,cx-24,top+37);
        ctx.moveTo(cx-8,baseline-42);ctx.quadraticCurveTo(cx+18,top+47,cx+20,top+27);
      }else{
        // Mountain, castle and canyon courses: distant carved ridges.
        ctx.moveTo(cx-28,baseline-12);
        ctx.lineTo(cx-7,top+44);ctx.lineTo(cx+5,top+55);
        ctx.lineTo(cx+19,top+30);ctx.lineTo(cx+34,baseline-12);
      }
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // Small deterministic stage-specific surface accents. Draw-only; no collision changes.
  // Original platform silhouettes for three distinct reference-inspired
  // worlds. All decorative elements remain outside the collision system.
  function drawSignaturePlatformArt(x,y,w,stage){
    if(index>24 || w<70)return;
    const interval=[90,115,130,105,112,124,120,108,88,102,132,116,106,122,118,104,110,126,116,94,100,112,108,118,96][index];
    const first=Math.max(0,Math.floor((camera-x)/interval)-1);
    const last=Math.min(Math.ceil(w/interval),Math.ceil((camera+width-x)/interval)+1);
    ctx.save();ctx.lineJoin='round';
    for(let n=first;n<=last;n++){
      const px=x+interval*n+interval*.48;
      if(px>x+w-15||px<x+14)continue;
      if(index===0){
        // Ember Foundry: heat-shield rivets, hanging furnace braces.
        ctx.fillStyle='#4b2b36';ctx.strokeStyle='#e7a86a';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-16,y+4);ctx.lineTo(px+16,y+4);
        ctx.lineTo(px+10,y+22);ctx.lineTo(px-10,y+22);
        ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#ffd68c';
        for(const dx of [-9,9]){ctx.beginPath();ctx.arc(px+dx,y+10,2.5,0,Math.PI*2);ctx.fill();}
        ctx.strokeStyle='#f47f4f';ctx.beginPath();ctx.moveTo(px-6,y+17);
        ctx.lineTo(px,y+12+stage%3);ctx.lineTo(px+6,y+17);ctx.stroke();
      }else if(index===1){
        // Moonlit Library: gilded book spines under carved shelf brackets.
        const palette=['#634b87','#376783','#8c5268','#546c64'];
        for(let k=0;k<4;k++){
          ctx.fillStyle=palette[(n+k+stage)%palette.length];
          ctx.fillRect(px-24+k*12,y+3,10,21-(k%2)*4);
          ctx.strokeStyle='#e5c48a';ctx.lineWidth=1;
          ctx.strokeRect(px-24+k*12,y+3,10,21-(k%2)*4);
          ctx.fillStyle='#ffe4aa';ctx.fillRect(px-21+k*12,y+7,4,2);
        }
        ctx.strokeStyle='#e6cf9d';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(px-30,y+3);ctx.lineTo(px+30,y+3);ctx.stroke();
      }else if(index===3){
        // Clocktower Relay: speedway trusses and rotating mechanical cogs.
        ctx.strokeStyle='#d4ad6e';ctx.lineWidth=3;ctx.fillStyle='#48536a';
        ctx.beginPath();ctx.moveTo(px-28,y+4);ctx.lineTo(px+28,y+4);
        ctx.lineTo(px+16,y+23);ctx.lineTo(px-16,y+23);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.save();ctx.translate(px,y+14);
        if(!reducedMotion)ctx.rotate(clock*.45);
        for(let tooth=0;tooth<8;tooth++){
          ctx.rotate(Math.PI/4);ctx.fillStyle='#e0bf8d';
          ctx.fillRect(-2,-14,4,6);
        }
        ctx.strokeStyle='#f4d39c';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(0,0,9,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#32475e';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }else if(index===4){
        // Seed Garden: living root buttresses and climbing leaflets.
        ctx.strokeStyle='#7b573c';ctx.lineWidth=5;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(px,y+4);
        ctx.bezierCurveTo(px-8,y+14,px-20,y+13,px-22,y+29);
        ctx.moveTo(px,y+4);ctx.bezierCurveTo(px+8,y+14,px+20,y+13,px+22,y+29);
        ctx.stroke();
        for(const side of [-1,1]){
          ctx.fillStyle=side<0?'#80bc64':'#b8df72';ctx.strokeStyle='#4d8451';ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(px+side*10,y+16);
          ctx.quadraticCurveTo(px+side*23,y+3,px+side*29,y+12);
          ctx.quadraticCurveTo(px+side*23,y+23,px+side*10,y+16);
          ctx.fill();ctx.stroke();
        }
      }else if(index===5){
        // Waterfall Climb: translucent ice columns with a cascading rim.
        const ice=ctx.createLinearGradient(px-20,y,px+20,y+30);
        ice.addColorStop(0,'#b8eff9');ice.addColorStop(.5,'#458da9');
        ice.addColorStop(1,'#d8faff');
        ctx.fillStyle=ice;ctx.strokeStyle='#d5fbff';ctx.lineWidth=1.8;
        ctx.beginPath();ctx.moveTo(px-19,y+3);ctx.lineTo(px+19,y+3);
        ctx.lineTo(px+13,y+28);ctx.lineTo(px+2,y+22);
        ctx.lineTo(px-11,y+31);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.strokeStyle='#f1ffff';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-10,y+6);ctx.lineTo(px-8,y+23);
        ctx.moveTo(px+6,y+5);ctx.lineTo(px+3,y+19);ctx.stroke();
      }else if(index===6){
        // Lantern Festival: parade pennants and suspended lantern fixtures.
        ctx.strokeStyle='#d9b67c';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(px-28,y+3);ctx.lineTo(px+28,y+3);ctx.stroke();
        for(const side of [-1,1]){
          const lx=px+side*18;
          ctx.beginPath();ctx.moveTo(lx,y+3);ctx.lineTo(lx,y+12);ctx.stroke();
          ctx.fillStyle=side<0?'#ed849f':'#ffc96e';
          ctx.beginPath();ctx.moveTo(lx-7,y+12);ctx.lineTo(lx+7,y+12);
          ctx.lineTo(lx+9,y+23);ctx.lineTo(lx,y+28);
          ctx.lineTo(lx-9,y+23);ctx.closePath();ctx.fill();
          ctx.fillStyle='#fff0bd';ctx.fillRect(lx-2,y+16,4,6);
        }
      }else if(index===7){
        // Crystal Polarity: opposing crystal poles and magnetic rail braces.
        ctx.fillStyle='#303d6c';ctx.strokeStyle='#c7b7f5';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-25,y+3);ctx.lineTo(px+25,y+3);
        ctx.lineTo(px+17,y+22);ctx.lineTo(px-17,y+22);ctx.closePath();
        ctx.fill();ctx.stroke();
        for(const side of [-1,1]){
          ctx.fillStyle=side<0?'#8ce9ff':'#f7a3e5';
          ctx.beginPath();ctx.moveTo(px+side*14,y+6);
          ctx.lineTo(px+side*22,y+12);
          ctx.lineTo(px+side*14,y+22);
          ctx.lineTo(px+side*7,y+12);ctx.closePath();ctx.fill();
        }
      }else if(index===8){
        // Stage Beat: independent equalizer towers and beat marker rails.
        const pulse=reducedMotion?0:Math.sin(clock*5+n)*3;
        ctx.fillStyle='#2c285e';ctx.strokeStyle='#bfa6ff';ctx.lineWidth=2;
        ctx.fillRect(px-27,y+3,54,24);ctx.strokeRect(px-27,y+3,54,24);
        for(let k=0;k<5;k++){
          const h=7+((k*7+n*3+stage*5)%13)+pulse;
          ctx.fillStyle=k%2?'#ff8cd6':'#77e7ff';
          ctx.fillRect(px-21+k*10,y+25-h,6,h);
        }
        ctx.strokeStyle='#fff1b3';ctx.beginPath();
        ctx.moveTo(px-26,y+4);ctx.lineTo(px+26,y+4);ctx.stroke();
      }else if(index===9){
        // Quarry Rescue: cable anchor, pulley and braced mine gantry.
        ctx.strokeStyle='#bfa58b';ctx.lineWidth=3;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(px-24,y+4);ctx.lineTo(px+24,y+4);
        ctx.moveTo(px-21,y+5);ctx.lineTo(px-10,y+27);
        ctx.moveTo(px+21,y+5);ctx.lineTo(px+10,y+27);ctx.stroke();
        ctx.fillStyle='#665b60';ctx.strokeStyle='#e2c79e';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(px,y+14,9,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.fillStyle='#e6d4aa';ctx.beginPath();ctx.arc(px,y+14,3,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#e6d4aa';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-8,y+14);ctx.lineTo(px-8,y+28);
        ctx.moveTo(px+8,y+14);ctx.lineTo(px+8,y+28);ctx.stroke();
      }else if(index===10){
        // Sunset Wind Sail: curved sail ribs, wind vane and taut canvas.
        const flutter=reducedMotion?0:Math.sin(clock*2.6+n)*2.5;
        ctx.strokeStyle='#e9bc7e';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(px-22,y+3);ctx.lineTo(px+22,y+3);
        ctx.moveTo(px,y+3);ctx.lineTo(px,y+29);ctx.stroke();
        ctx.fillStyle='#f2d2a0';ctx.strokeStyle='#b97c70';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(px+1,y+6);
        ctx.quadraticCurveTo(px+23+flutter,y+13,px+20+flutter,y+25);
        ctx.lineTo(px+1,y+24);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.strokeStyle='#fff0c7';ctx.beginPath();
        ctx.moveTo(px+3,y+9);ctx.lineTo(px+14+flutter,y+22);ctx.stroke();
      }else if(index===11){
        // Cloud City: layered floating-stone arches and wind crystal lamps.
        ctx.fillStyle='#7798b8';ctx.strokeStyle='#d8ecff';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-27,y+4);ctx.lineTo(px+27,y+4);
        ctx.lineTo(px+20,y+12);ctx.lineTo(px+13,y+12);
        ctx.quadraticCurveTo(px,y+32,px-13,y+12);
        ctx.lineTo(px-20,y+12);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#b4eaff';ctx.beginPath();ctx.moveTo(px,y+7);
        ctx.lineTo(px+7,y+15);ctx.lineTo(px,y+24);
        ctx.lineTo(px-7,y+15);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#f4faff';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(px-15,y+9);ctx.lineTo(px-10,y+9);
        ctx.moveTo(px+10,y+9);ctx.lineTo(px+15,y+9);ctx.stroke();
      }else if(index===12){
        // Thunder Harbor: lightning-grounded mooring plates and copper coils.
        ctx.fillStyle='#344c65';ctx.strokeStyle='#f0c879';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(px-27,y+4);ctx.lineTo(px+27,y+4);
        ctx.lineTo(px+19,y+25);ctx.lineTo(px-19,y+25);ctx.closePath();
        ctx.fill();ctx.stroke();
        for(const side of [-1,1]){
          ctx.strokeStyle='#d3a16b';ctx.lineWidth=3;
          ctx.beginPath();ctx.moveTo(px+side*16,y+7);
          ctx.lineTo(px+side*16,y+22);ctx.stroke();
          ctx.fillStyle='#ffe9a4';ctx.beginPath();
          ctx.arc(px+side*16,y+10,3,0,Math.PI*2);ctx.fill();
        }
        ctx.strokeStyle='#aeeaff';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-5,y+7);ctx.lineTo(px+3,y+12);
        ctx.lineTo(px-3,y+17);ctx.lineTo(px+6,y+22);ctx.stroke();
      }else if(index===13){
        // Autumn Trail: layered timber beams, acorn bolts and fall leaves.
        ctx.strokeStyle='#7d4b34';ctx.lineWidth=5;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(px-25,y+5);ctx.lineTo(px+25,y+5);
        ctx.moveTo(px-18,y+6);ctx.lineTo(px-11,y+26);
        ctx.moveTo(px+18,y+6);ctx.lineTo(px+11,y+26);ctx.stroke();
        for(const side of [-1,1]){
          ctx.fillStyle='#d6a25b';ctx.beginPath();
          ctx.ellipse(px+side*17,y+8,4,5,0,0,Math.PI*2);ctx.fill();
          ctx.fillStyle=side<0?'#f5a44b':'#d96848';
          ctx.beginPath();ctx.moveTo(px+side*9,y+15);
          ctx.quadraticCurveTo(px+side*27,y+8,px+side*24,y+25);
          ctx.quadraticCurveTo(px+side*11,y+26,px+side*9,y+15);
          ctx.fill();
        }
      }else if(index===14){
        // Inverted Observatory: mirrored gravity pylons and orbital rings.
        ctx.fillStyle='#393956';ctx.strokeStyle='#a5c5ff';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-24,y+4);ctx.lineTo(px+24,y+4);
        ctx.lineTo(px+15,y+27);ctx.lineTo(px-15,y+27);
        ctx.closePath();ctx.fill();ctx.stroke();
        ctx.strokeStyle='#e0d4ff';ctx.lineWidth=1.6;
        ctx.beginPath();ctx.ellipse(px,y+15,16,7,-.25,0,Math.PI*2);ctx.stroke();
        ctx.beginPath();ctx.ellipse(px,y+15,16,7,.25,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#9af2ed';ctx.beginPath();ctx.arc(px,y+15,4,0,Math.PI*2);ctx.fill();
      }else if(index===15){
        // Bamboo Village: split cane beams, woven ties and new shoots.
        for(const side of [-1,1]){
          const bx=px+side*13;
          ctx.fillStyle=side<0?'#689b65':'#8cba70';
          ctx.strokeStyle='#c4e8a0';ctx.lineWidth=1.5;
          ctx.fillRect(bx-6,y+4,12,26);ctx.strokeRect(bx-6,y+4,12,26);
          ctx.strokeStyle='#436d45';ctx.beginPath();
          ctx.moveTo(bx-6,y+13);ctx.lineTo(bx+6,y+13);
          ctx.moveTo(bx-6,y+23);ctx.lineTo(bx+6,y+23);ctx.stroke();
        }
        ctx.strokeStyle='#e7cc91';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(px-26,y+8);ctx.lineTo(px+26,y+8);ctx.stroke();
        ctx.fillStyle='#b2db79';ctx.beginPath();ctx.moveTo(px,y+10);
        ctx.quadraticCurveTo(px+19,y+11,px+23,y+2);
        ctx.quadraticCurveTo(px+9,y-1,px,y+10);ctx.fill();
      }else if(index===16){
        // Steamworks: pressure pistons and a readable brass gauge.
        ctx.fillStyle='#515a65';ctx.strokeStyle='#d4ad76';ctx.lineWidth=2;
        ctx.fillRect(px-26,y+4,52,10);ctx.strokeRect(px-26,y+4,52,10);
        for(const side of [-1,1]){
          ctx.fillStyle='#7a8d9b';ctx.fillRect(px+side*17-5,y+14,10,16);
          ctx.fillStyle='#c7d5d6';ctx.fillRect(px+side*17-3,y+16,6,9);
        }
        ctx.fillStyle='#e4cf9c';ctx.beginPath();ctx.arc(px,y+16,10,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#694f49';ctx.lineWidth=2;ctx.stroke();
        ctx.beginPath();ctx.moveTo(px,y+16);
        ctx.lineTo(px+5,y+11);ctx.stroke();
        ctx.fillStyle='#6c3e3e';ctx.beginPath();ctx.arc(px,y+16,2,0,Math.PI*2);ctx.fill();
      }else if(index===17){
        // Snow Village: timber lodge brackets, ice trim and snow drifts.
        ctx.fillStyle='#73546a';ctx.strokeStyle='#e5bda1';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-24,y+5);ctx.lineTo(px+24,y+5);
        ctx.lineTo(px+15,y+25);ctx.lineTo(px-15,y+25);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.strokeStyle='#b7e8ff';ctx.lineWidth=4;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(px-25,y+4);
        ctx.quadraticCurveTo(px-12,y+9,px,y+4);
        ctx.quadraticCurveTo(px+12,y+9,px+25,y+4);ctx.stroke();
        ctx.fillStyle='#e5f8ff';
        for(const side of [-1,1]){
          ctx.beginPath();ctx.moveTo(px+side*16,y+5);
          ctx.lineTo(px+side*16-3,y+16);
          ctx.lineTo(px+side*16+3,y+5);ctx.fill();
        }
      }else if(index===18){
        // Canyon Crossing: carved sandstone ledge blocks and climbing grips.
        ctx.fillStyle='#a76c4d';ctx.strokeStyle='#f1bd86';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-25,y+4);ctx.lineTo(px+25,y+4);
        ctx.lineTo(px+20,y+25);ctx.lineTo(px-18,y+25);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.strokeStyle='#724b42';ctx.lineWidth=2;
        for(let k=-1;k<=1;k++){
          ctx.beginPath();ctx.moveTo(px+k*13-5,y+13);
          ctx.lineTo(px+k*13+4,y+13);ctx.stroke();
        }
        ctx.fillStyle='#f4d09e';
        ctx.fillRect(px-4,y+17,8,3);
      }else if(index===19){
        // Submarine Dock: pressure-sealed metal braces and porthole lamps.
        ctx.fillStyle='#34556b';ctx.strokeStyle='#86cfda';ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(px-27,y+4);ctx.lineTo(px+27,y+4);
        ctx.lineTo(px+21,y+26);ctx.lineTo(px-21,y+26);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.fillStyle='#a7e9eb';ctx.beginPath();
        ctx.arc(px,y+15,8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#1f7188';ctx.beginPath();
        ctx.arc(px,y+15,5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#d7e8b2';
        for(const side of [-1,1])ctx.fillRect(px+side*19-2,y+9,4,4);
      }else if(index===20){
        // Neon Circuit: angled speedway struts and pulsing circuit nodes.
        ctx.fillStyle='#35365d';ctx.strokeStyle='#f48bc8';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-26,y+4);ctx.lineTo(px+26,y+4);
        ctx.lineTo(px+16,y+24);ctx.lineTo(px-16,y+24);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.strokeStyle='#8ff5eb';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-17,y+10);ctx.lineTo(px-5,y+17);
        ctx.lineTo(px+6,y+11);ctx.lineTo(px+17,y+19);ctx.stroke();
        ctx.fillStyle='#ffe7a2';
        for(const side of [-1,1]){
          ctx.beginPath();ctx.arc(px+side*17,y+19,3,0,Math.PI*2);ctx.fill();
        }
      }else if(index===21){
        // Marble Temple: gothic stone corbels and stained-glass inlays.
        ctx.fillStyle='#58506a';ctx.strokeStyle='#c6a7b4';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-27,y+4);ctx.lineTo(px+27,y+4);
        ctx.lineTo(px+19,y+14);ctx.lineTo(px+12,y+14);
        ctx.lineTo(px+8,y+27);ctx.lineTo(px-8,y+27);
        ctx.lineTo(px-12,y+14);ctx.lineTo(px-19,y+14);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.fillStyle='#8ac6d8';ctx.beginPath();ctx.moveTo(px,y+7);
        ctx.lineTo(px+7,y+15);ctx.lineTo(px,y+23);
        ctx.lineTo(px-7,y+15);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#f0d49a';ctx.beginPath();
        ctx.moveTo(px,y+7);ctx.lineTo(px,y+23);
        ctx.moveTo(px-7,y+15);ctx.lineTo(px+7,y+15);ctx.stroke();
      }else if(index===22){
        // Swamp Ferry: lashed timber supports with luminous marsh reeds.
        ctx.fillStyle='#665b46';ctx.strokeStyle='#b7a877';ctx.lineWidth=3;
        ctx.beginPath();ctx.moveTo(px-26,y+5);ctx.lineTo(px+26,y+5);
        ctx.lineTo(px+18,y+23);ctx.lineTo(px-18,y+23);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.strokeStyle='#d8bb7a';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-18,y+7);ctx.lineTo(px+18,y+22);
        ctx.moveTo(px+18,y+7);ctx.lineTo(px-18,y+22);ctx.stroke();
        ctx.strokeStyle='#8bd9a3';ctx.lineWidth=2;
        for(const side of [-1,1]){
          ctx.beginPath();ctx.moveTo(px+side*23,y+22);
          ctx.quadraticCurveTo(px+side*28,y+13,px+side*24,y+8);ctx.stroke();
        }
      }else if(index===23){
        // Sunflower Flight: stitched fabric beams and dangling yarn tassels.
        ctx.fillStyle='#c17f9f';ctx.strokeStyle='#ffe0ad';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-26,y+5);ctx.lineTo(px+26,y+5);
        ctx.quadraticCurveTo(px+18,y+25,px,y+24);
        ctx.quadraticCurveTo(px-18,y+25,px-26,y+5);ctx.fill();ctx.stroke();
        ctx.setLineDash([3,4]);ctx.strokeStyle='#fff2d5';
        ctx.beginPath();ctx.moveTo(px-19,y+10);
        ctx.quadraticCurveTo(px,y+27,px+19,y+10);ctx.stroke();
        ctx.setLineDash([]);
        for(const side of [-1,1]){
          ctx.strokeStyle='#e6c9ed';ctx.lineWidth=3;
          ctx.beginPath();ctx.moveTo(px+side*12,y+22);
          ctx.lineTo(px+side*12,y+31);ctx.stroke();
          ctx.fillStyle='#f6c6e0';ctx.beginPath();
          ctx.arc(px+side*12,y+32,3,0,Math.PI*2);ctx.fill();
        }
      }else if(index===24){
        // Starship Cargo: armored cargo clamps and hazard-light rails.
        ctx.fillStyle='#47515c';ctx.strokeStyle='#b7d0cf';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-27,y+4);ctx.lineTo(px+27,y+4);
        ctx.lineTo(px+19,y+24);ctx.lineTo(px-19,y+24);ctx.closePath();
        ctx.fill();ctx.stroke();
        ctx.fillStyle='#f3ba64';
        for(let k=-2;k<=2;k++){
          ctx.beginPath();ctx.moveTo(px+k*9-3,y+8);
          ctx.lineTo(px+k*9+2,y+8);ctx.lineTo(px+k*9-2,y+17);
          ctx.lineTo(px+k*9-7,y+17);ctx.closePath();ctx.fill();
        }
        ctx.fillStyle='#a9ecdf';
        for(const side of [-1,1]){
          ctx.beginPath();ctx.arc(px+side*20,y+20,3,0,Math.PI*2);ctx.fill();
        }
      }else{
        // Coral Courier: fan-shaped reef ledges and layered shell supports.
        ctx.fillStyle='#3c8794';ctx.strokeStyle='#a7e9d9';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(px-23,y+4);
        ctx.quadraticCurveTo(px-22,y+26,px,y+30);
        ctx.quadraticCurveTo(px+22,y+26,px+23,y+4);
        ctx.closePath();ctx.fill();ctx.stroke();
        for(let k=-2;k<=2;k++){
          ctx.beginPath();ctx.moveTo(px,y+27);
          ctx.lineTo(px+k*9,y+7);ctx.stroke();
        }
        ctx.fillStyle='#ffd6a4';ctx.beginPath();
        ctx.arc(px,y+8,3,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();
  }
  function drawPlatformAccents({x,y,w,kind}) {
    if(w<34 || kind==='hazard' || kind==='ceilingSpikes') return;
    const stage=Math.min(sections-1,Math.max(0,stageAt(x)));
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
    drawSignaturePlatformArt(x,y,w,stage);
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
    const stage=Math.min(sections-1,Math.max(0,stageAt(x)));
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
    // Vary construction between nearby ledges of different lengths and
    // elevations. Keep choices deterministic for replay/checkpoint parity.
    const ledgeSignature=Math.floor(w/71)+Math.floor(y/29);
    const familySlot=((placement*(index%4+1)+stage*(index%5+2)+
      kindOffset+ledgeSignature)%family.length+family.length)%family.length;
    const model=family[familySlot];
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
      // Longer platforms alternate compatible construction details in
      // distinct sections instead of repeating one motif for their full run.
      const section=Math.floor((n*pitch)/Math.max(140,gamePitch*2));
      const sectionModel=family[(familySlot+Math.max(0,section))%family.length];
      switch(sectionModel){
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
    // Silhouette construction on the visible face gives platforms distinct
    // physical profiles without changing their collision tops. Supports
    // are clipped to the existing solid face so none float below a ledge.
    if(faceDepth>=18 && w>=78){
      const structure=['buttress','girder','rib','arch','panel'][
        (index+stage+kindOffset+Math.floor(w/100))%5];
      const beamCount=Math.min(9,Math.max(1,Math.floor(w/115)));
      const beamGap=w/(beamCount+1);
      ctx.save();
      ctx.beginPath();ctx.rect(x+2,y+3,w-4,faceDepth-4);ctx.clip();
      ctx.strokeStyle=rim;ctx.lineWidth=2;
      ctx.globalAlpha=.36;
      for(let beam=1;beam<=beamCount;beam++){
        const bx=x+beam*beamGap;
        ctx.beginPath();
        if(structure==='buttress'){
          ctx.moveTo(bx-17,y+faceDepth);ctx.lineTo(bx,y+5);
          ctx.lineTo(bx+17,y+faceDepth);
        }else if(structure==='girder'){
          ctx.moveTo(bx-20,y+5);ctx.lineTo(bx+20,y+faceDepth);
          ctx.moveTo(bx+20,y+5);ctx.lineTo(bx-20,y+faceDepth);
        }else if(structure==='rib'){
          ctx.moveTo(bx-10,y+4);ctx.lineTo(bx-10,y+faceDepth);
          ctx.moveTo(bx+10,y+4);ctx.lineTo(bx+10,y+faceDepth);
        }else if(structure==='arch'){
          ctx.moveTo(bx-25,y+faceDepth);
          ctx.quadraticCurveTo(bx,y+3,bx+25,y+faceDepth);
        }else{
          ctx.rect(bx-20,y+6,40,Math.max(7,faceDepth-12));
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  function drawDropWarning({x,y,w,dropAt}) {
    if(dropAt===undefined) return;
    const remaining=Math.max(0,Math.min(1,(dropAt-clock)/.38));
    ctx.fillStyle='#211521';
    ctx.fillRect(x,y-6,w,3);
    ctx.fillStyle='#ffc17f';
    ctx.fillRect(x,y-6,w*(reducedMotion?1:remaining),3);
  }
  const platformFaceArt = [
    new Path2D('M-7 5V-1L0-6 7-1V5ZM-3 5V1L0-2 3 1V5'), // furnace
    new Path2D('M-7 5V-4H-3V5M-1 5V-5H3V5M5 5L4-3 7-4 9 4'), // books
    new Path2D('M-8 3Q-8-6 0-6Q8-6 8 3L0 5ZM0 4L-5-3M0 4V-5M0 4L5-3'), // shell
    new Path2D('M-6 0A6 6 0 1 0 6 0A6 6 0 1 0-6 0M0-4V0L3 2'), // clock
    new Path2D('M-8 4Q-4-7 7-5Q8 4-8 4ZM-8 4L4-3'), // seed
    new Path2D('M-8-5H-2V4H3V0H8M-8-2H-5V6'), // cascade
    new Path2D('M-5-4H5L7 0 5 4H-5L-7 0ZM0-6V-4M0 4V6'), // lantern
    new Path2D('M0-6L7 0 0 6-7 0ZM0-6L3 0 0 6-3 0Z'), // crystal
    new Path2D('M-8-5H8V5H-8ZM-4 0A2 2 0 1 0 0 0A2 2 0 1 0-4 0M3-2H6M3 2H6'), // speaker
    new Path2D('M-8 5L-4-5H4L8 5ZM-5 0H5'), // stone braces
    new Path2D('M0-6V5M0-5L8 3H0M-8 5H8'), // sail
    new Path2D('M-8 4Q-11 0-5-1Q-4-7 2-4Q7-5 7 0Q11 4 5 4Z'), // cloud
    new Path2D('M0-5V5M-4-2H4M-8 0Q-5 7 0 5Q5 7 8 0'), // anchor
    new Path2D('M-8 4Q-4-6 7-5Q5 5-8 4ZM-8 4L5-4M0-1L-2-4'), // leaf
    new Path2D('M-8 2Q-5-5 7-4Q12 0 1 4Q-8 7-8 2ZM0-5V5'), // orbit
    new Path2D('M-8 5L-5-5M-2 5L1-5M4 5L7-5M-8 1H8'), // bamboo
    new Path2D('M-8 5H8M-6 2Q-9 0-6-4M0 2Q-3 0 0-4M6 2Q3 0 6-4'), // steam vents
    new Path2D('M0-6V6M-6-3L6 3M-6 3L6-3'), // snowflake
    new Path2D('M-8-4L-3-5 2-3 8-4M-8 0L-1 2 8-1M-8 4L-1 5 8 3'), // strata
    new Path2D('M-6 0A6 6 0 1 0 6 0A6 6 0 1 0-6 0M-8 0H-6M6 0H8M-3 2L2-3'), // porthole
    new Path2D('M-8 4H-3V-3H3V3H8M-8-3H-5M5-3H8'), // circuit
    new Path2D('M-8-5H8M-8 5H8M-5-5V5M0-5V5M5-5V5'), // temple columns
    new Path2D('M-7 5L-4-5M0 5V-4M7 5L4-5M-8 3Q0 0 8 3'), // reeds
    new Path2D('M0-5V5M-5 0H5M-4-4L4 4M-4 4L4-4M-8 5H8'), // sunflower
    new Path2D('M-8-5H8V5H-8ZM-3-5V5M3-5V5M-3 0H3'), // cargo latch
  ];
  const platformPlaqueFrames = [
    new Path2D('M-13-7H13V7H-13Z'),
    new Path2D('M-15 0L-11-7H11L15 0 11 7H-11Z'),
    new Path2D('M-14 7V-2Q-14-8 0-8Q14-8 14-2V7Z'),
    new Path2D('M-15-5H-10V-8H10V-5H15V5H10V8H-10V5H-15Z'),
    new Path2D('M-14-7H14L11 7H-11Z'),
    new Path2D('M0-9L15-5V5L0 9-15 5V-5Z'),
  ];
  const platformEndProfiles = [
    new Path2D('M0 0H14L9 8H0Z'),
    new Path2D('M0 0H14V4H9V9H0Z'),
    new Path2D('M0 0H14Q12 9 0 9Z'),
    new Path2D('M0 0H14L11 4H6L4 9H0Z'),
    new Path2D('M0 0H14Q8 8 0 9Z'),
    new Path2D('M0 0H14L10 3L7 9H0Z'),
    new Path2D('M0 0H14L10 5L12 8H0Z'),
    new Path2D('M0 0H14L7 9H0Z'),
    new Path2D('M0 0H14V3H10V6H5V9H0Z'),
    new Path2D('M0 0H14L12 5L8 9H0Z'),
    new Path2D('M0 0H14L12 2L5 9H0Z'),
    new Path2D('M0 0H14Q13 5 8 5Q6 9 0 8Z'),
    new Path2D('M0 0H14V5L8 9H0Z'),
    new Path2D('M0 0H14L9 4Q5 9 0 8Z'),
    new Path2D('M0 0H14L8 4L10 9H0Z'),
    new Path2D('M0 0H14L12 3H9L7 9H0Z'),
    new Path2D('M0 0H14V5H11V9H0Z'),
    new Path2D('M0 0H14L10 5L5 4L3 9H0Z'),
    new Path2D('M0 0H14L11 4L10 7L5 6L3 9H0Z'),
    new Path2D('M0 0H14Q14 6 8 9H0Z'),
    new Path2D('M0 0H14V2H8V7H3V9H0Z'),
    new Path2D('M0 0H14V3H11V6H7V9H0Z'),
    new Path2D('M0 0H14Q8 3 6 8L0 9Z'),
    new Path2D('M0 0H14L10 7L7 5L4 9H0Z'),
    new Path2D('M0 0H14L11 3V7L8 9H0Z'),
  ];
  function drawLandingEdge({x,y,w,kind}) {
    const rim=courseMaterials[index][2];
    // Two tones keep the landing line visible against both bright and dark scenery.
    ctx.fillStyle='#10101d';
    ctx.fillRect(x-1,y-2,w+2,8);
    // A slim perspective top face makes the landing surface readable without
    // changing the platform collision geometry or obscuring the character.
    const topDepth=Math.min(13,Math.max(4,w*.045));
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+Math.min(7,w*.08),y-topDepth);
    ctx.lineTo(x+w-Math.min(7,w*.08),y-topDepth);
    ctx.lineTo(x+w,y);
    ctx.closePath();
    const topLight=ctx.createLinearGradient(0,y-topDepth,0,y+2);
    topLight.addColorStop(0,rim);
    topLight.addColorStop(1,'#252037');
    ctx.fillStyle=topLight;
    ctx.fill();
    if(index===17 && kind==='shelf'){
      ctx.clip();
      ctx.fillStyle='#d5eff8';
      ctx.fillRect(x,y-topDepth,w,3);
      ctx.fillStyle='#8eb9d2';
      for(let seam=14;seam<w;seam+=18){
        ctx.fillRect(x+seam,y-topDepth+3,2,topDepth);
      }
    }
    ctx.restore();
    // Subtle moving specular highlights give polished materials a sense
    // of volume while keeping the landing line stable and easy to read.
    // Organic/stone surfaces stay matte; ice, metal and crystal respond.
    const highlightType=[2,0,1,0,0,1,2,2,2,0,0,1,0,0,2,0,0,1,0,1,2,2,0,0,1][index];
    if(highlightType && !reducedMotion){
      const bandWidth=highlightType===1?30:18;
      const cycle=1400+index*37;
      const progress=((clock*(highlightType===1?38:24)+x*.08+index*59)%cycle)/cycle;
      const hx=x-60+progress*(w+120);
      if(hx+bandWidth>x && hx<x+w){
        ctx.save();
        ctx.beginPath();ctx.rect(x+2,y-topDepth,Math.max(0,w-4),topDepth);ctx.clip();
        const gleam=ctx.createLinearGradient(hx,y,hx+bandWidth,y);
        gleam.addColorStop(0,'rgba(255,255,255,0)');
        gleam.addColorStop(.5,highlightType===1?'rgba(255,255,255,.19)':'rgba(255,255,255,.12)');
        gleam.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=gleam;ctx.fillRect(hx,y-topDepth,bandWidth,topDepth);
        ctx.restore();
      }
    }
    ctx.fillStyle=rim;
    ctx.fillRect(x,y,w,3);
    // Original Super Paw Heroes stage construction: readable, game-specific
    // landing seams and inset panels. These decorate the rendered top only;
    // physics, collisions, and authored platform positions stay unchanged.
    if(w>=92 && kind!=='hazard' && kind!=='ceilingSpikes'){
      const seamPitch=[84,68,110,76,96,105,118,64,58,94,102,78,86,112,72,120,66,98,88,70,62,92,108,114,74][index];
      const startSeam=Math.max(1,Math.ceil((camera-x-8)/seamPitch));
      const endSeam=Math.min(Math.floor((w-12)/seamPitch),Math.ceil((camera+width-x)/seamPitch));
      ctx.save();
      ctx.lineWidth=1.3;
      ctx.strokeStyle='rgba(9,14,31,.38)';
      ctx.fillStyle='rgba(255,242,205,.42)';
      for(let seam=startSeam;seam<=endSeam;seam++){
        const sx=x+seam*seamPitch;
        // Slight perspective notches make the upper surface visibly 3D.
        ctx.beginPath();
        ctx.moveTo(sx-5,y-1);
        ctx.lineTo(sx-2,y-topDepth*.58);
        ctx.stroke();
        if([1,3,7,8,9,14,16,19,20,24].includes(index)){
          ctx.fillRect(sx+4,y-4,3,2); // machine fastening
        }else if([2,5,6,13,15,22,23].includes(index)){
          ctx.beginPath();ctx.arc(sx+5,y-4,2,0,Math.PI*2);ctx.fill();
        }else{
          ctx.fillRect(sx+4,y-4,5,1.5); // masonry joint
        }
      }
      ctx.restore();
    }
    if(kind==='belt' || kind==='current'){
      const direction=kind==='belt'?1:-1;
      const start=Math.max(0,Math.floor((camera-x)/28));
      const end=Math.min(Math.floor((w-12)/28),Math.ceil((camera+width-x)/28));
      ctx.save();
      ctx.strokeStyle='#fff2ce';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let mark=start;mark<=end;mark++){
        const center=x+8+mark*28;
        ctx.moveTo(center-3*direction,y-7);
        ctx.lineTo(center+3*direction,y-4);
        ctx.lineTo(center-3*direction,y-1);
      }
      ctx.stroke();
      ctx.restore();
    }
    // World-specific top-surface detailing makes the playable platform
    // visibly different from its side wall. Five material families combine
    // with each world's palette and six chapter construction patterns.
    // Keep accents inset so the collision edge remains visually unambiguous.
    if(kind!=='belt' && kind!=='current' && kind!=='drop' && topDepth>=7){
      const segment=28;
      const left=Math.max(0,Math.floor((camera-x)/segment));
      const right=Math.min(Math.floor(w/segment),Math.ceil((camera+width-x)/segment));
      ctx.save();
      ctx.strokeStyle=rim;
      ctx.globalAlpha=.78;
      ctx.lineWidth=.85;
      for(let tile=left;tile<right;tile++){
        ctx.save();
        ctx.translate(x+(tile+.5)*segment,y-topDepth*.5);
        ctx.scale(1,(topDepth-3)/8);
        ctx.stroke(platformInlays[index]);
        ctx.restore();
      }
      ctx.restore();
    }
    // A narrow bevel and inset underside add a readable 2.5D profile
    // without painting over the actual collision surface. Limit drawing
    // to the viewport to keep long levels inexpensive on Android.
    if(w>=48 && (kind==='floor')){
      const spacing=64;
      const first=Math.max(0,Math.floor((camera-x)/spacing));
      const last=Math.min(Math.floor((w-48)/spacing),Math.floor((camera+width-x)/spacing));
      ctx.save();
      ctx.strokeStyle=rim;
      ctx.lineWidth=1;
      for(let panel=first;panel<=last;panel++){
        const center=x+24+panel*spacing;
        ctx.save();
        ctx.translate(center,y+19);
        const stage=Math.min(platformPlaqueFrames.length-1,stageAt(center));
        const frame=platformPlaqueFrames[stage];
        ctx.fillStyle='#161423';
        ctx.fill(frame);
        ctx.globalAlpha=.48;
        ctx.stroke(frame);
        ctx.globalAlpha=1;
        ctx.stroke(platformFaceArt[index]);
        ctx.restore();
      }
      ctx.restore();
    }
    const bevelDepth=Math.min(12,Math.max(5,topDepth+3));
    const bevelStart=Math.max(x,camera-8);
    const bevelEnd=Math.min(x+w,camera+width+8);
    if(bevelEnd>bevelStart){
      const edgeShade=ctx.createLinearGradient(0,y+3,0,y+bevelDepth);
      edgeShade.addColorStop(0,'rgba(0,0,0,.08)');
      edgeShade.addColorStop(.5,'rgba(0,0,0,.32)');
      edgeShade.addColorStop(1,'rgba(0,0,0,.48)');
      ctx.fillStyle=edgeShade;
      ctx.fillRect(bevelStart,y+3,bevelEnd-bevelStart,bevelDepth-3);
      ctx.save();
      ctx.globalAlpha=.46;
      ctx.strokeStyle=rim;ctx.lineWidth=1;
      const seamSpacing=44+(index%5)*7;
      const firstSeam=Math.max(1,Math.ceil((bevelStart-x)/seamSpacing));
      const lastSeam=Math.min(Math.ceil(w/seamSpacing)-1,Math.floor((bevelEnd-x)/seamSpacing));
      for(let seam=firstSeam;seam<=lastSeam;seam++){
        const sx=x+seam*seamSpacing;
        ctx.beginPath();ctx.moveTo(sx,y+4);ctx.lineTo(sx,y+bevelDepth-1);ctx.stroke();
      }
      ctx.restore();
    }
    ctx.fillStyle='#fff6dd';
    ctx.fillRect(x,y,Math.min(7,w),3);
    ctx.fillRect(x+Math.max(0,w-7),y,Math.min(7,w),3);
    if(kind==='floor' && w>=28){
      ctx.save();
      ctx.fillStyle=rim;
      ctx.globalAlpha=.82;
      for(const direction of [1,-1]){
        const edge=direction===1?x:x+w;
        if(edge<camera-14 || edge>camera+width+14) continue;
        ctx.save();
        ctx.translate(edge,y+3);
        ctx.scale(direction,1);
        ctx.fill(platformEndProfiles[index]);
        ctx.restore();
      }
      ctx.restore();
    }
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

        // Each chapter has its own factory machinery and silhouette.
        const chapterIndex=Math.min(sections-1,Math.max(0,stageAt((camera+width/2))));
        const machineX=x+190;
        const machineY=262+variation*5;
        ctx.save();
        ctx.translate(machineX,machineY);
        ctx.strokeStyle='#543b3c';
        ctx.fillStyle='#bd8054';
        ctx.lineWidth=5;
        switch(chapterIndex){
          case 0: // Intake valve
            ctx.fillRect(-20,0,40,56);
            ctx.beginPath();ctx.arc(0,-12,23,0,Math.PI*2);ctx.stroke();
            ctx.beginPath();ctx.moveTo(-20,-12);ctx.lineTo(20,-12);
            ctx.moveTo(0,-32);ctx.lineTo(0,8);ctx.stroke();
            break;
          case 1: // Cooling radiator
            for(let fin=-2;fin<=2;fin++) ctx.fillRect(fin*10-3,-34,7,80);
            ctx.strokeRect(-28,-38,56,87);
            break;
          case 2: // Crank assembly
            ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();ctx.stroke();
            ctx.beginPath();ctx.moveTo(-9,-9);ctx.lineTo(18,28);ctx.lineTo(29,48);ctx.stroke();
            break;
          case 3: // Hydraulic press
            ctx.strokeRect(-27,-44,54,94);
            ctx.fillRect(-7,-42,14,44);
            ctx.fillRect(-21,0,42,10);
            break;
          case 4: // Condensate tank
            ctx.beginPath();ctx.ellipse(0,3,27,36,0,0,Math.PI*2);ctx.fill();ctx.stroke();
            ctx.fillStyle='#b7d4cf';ctx.fillRect(-7,-15,14,34);
            break;
          case 5: // Main pressure gauge
            ctx.beginPath();ctx.arc(0,-5,27,0,Math.PI*2);ctx.fill();ctx.stroke();
            ctx.fillStyle='#ead2a3';
            ctx.beginPath();ctx.arc(0,-5,20,0,Math.PI*2);ctx.fill();
            ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(11,-16);ctx.stroke();
            break;
        }
        ctx.restore();
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
  const beatPeriod = .65;
  const isOnBeat = position => position < .2 || position > .52;
  function drawWindSailCarry() {
    if(index!==10 || phase!=='playing' || !player.carry) return;
    ctx.save();
    ctx.fillStyle='#302036';
    ctx.fillRect(13,12,288,25);
    // Wind-wrapped cargo icon stays in the HUD during the jump.
    ctx.strokeStyle='#8df5ed';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.ellipse(27,24,9,6,-.45,0,Math.PI*2);
    ctx.stroke();
    ctx.fillStyle='#ffbb77';
    ctx.beginPath();
    ctx.arc(27,24,3.5,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#ffe0a5';
    ctx.font='bold 11px system-ui';
    ctx.textAlign='left';
    ctx.fillText('Carrying enemy · Jump in midair or use '+techniqueName+' to throw',43,28,250);
    ctx.restore();
  }
  function drawGravityStatus() {
    if(index!==7 || power!=='flip' || phase!=='playing') return;
    const ready=player.on && player.power<=0;
    ctx.save();
    ctx.fillStyle='#211832';
    ctx.fillRect(13,12,148,25);
    ctx.fillStyle=ready?'#f0cdff':'#e1d8ec';
    ctx.font='bold 11px system-ui';
    ctx.textAlign='left';
    ctx.fillText((player.gravity<0?'↑':'↓')+' Gravity · '+(ready?'Flip ready':'Flip unavailable'),20,28);
    ctx.restore();
  }
  function drawBeatMeter() {
    if(index!==8 || movement!=='beat' || phase!=='playing') return;
    const position=clock%beatPeriod;
    const x=20,y=27,w=110;
    ctx.save();
    ctx.fillStyle='#211332';
    ctx.fillRect(x-7,y-19,w+14,37);
    ctx.font='bold 11px system-ui';
    ctx.fillStyle=isOnBeat(position)?'#ffe3a0':'#fff';
    ctx.fillText(isOnBeat(position)?'PULSE NOW':'FIND THE BEAT',x,y-4);
    ctx.fillStyle='#634164';
    ctx.fillRect(x,y,w,8);
    ctx.fillStyle='#ffc779';
    ctx.fillRect(x,y,w*.2/beatPeriod,8);
    ctx.fillRect(x+w*.52/beatPeriod,y,w*(beatPeriod-.52)/beatPeriod,8);
    ctx.fillStyle='#fff';
    const markerPosition=reducedMotion ? Math.floor(position/beatPeriod*8)/8 : position/beatPeriod;
    ctx.fillRect(x+w*markerPosition-1,y-2,2,12);
    ctx.restore();
  }
  const enemyCueColors = ["#ffc282","#80dffe","#81ffe1","#ffd66d","#c8ed85","#c4f4ff","#ffe29a","#deb0ff","#ff91dd","#ffd18b","#ffbf98","#e6e2ff","#8aeaff","#ffbb76","#adbfff","#b9ff96","#ff9d62","#ddf4ff","#ffd1a2","#7affdc","#ff8ce1","#e0c5ff","#d1fb87","#ffeaa1","#a9d7ff"];
  // Game-specific visual insignias: rendered in the existing enemy pass, without
  // changing hitboxes, physics, damage, spawn tables, or the canonical sprite art.
  const enemyInsignias=['clamp','book','wave','clock','seed','mist','lantern','magnet','beat','quarry','wind','cloud','bolt','leaf','orbit','bamboo','steam','snow','canyon','sonar','neon','marble','bog','flower','cargo'];
  // Secondary motion accents are tied to each enemy's actual gait and combat
  // state. They never change hitboxes or interfere with touch controls.
  // Distinctive dimensional armor accents are attached to each enemy sprite.
  // Lightweight canvas geometry keeps the existing Android renderer intact.
  const enemyArmorStyles=[
    [3,16,5],[4,12,9],[2,21,4],[5,10,7],[6,15,5],
    [3,20,8],[4,17,6],[5,13,10],[6,11,8],[3,22,5],
    [4,19,7],[5,14,8],[6,16,6],[3,18,9],[4,23,4],
    [5,15,7],[6,12,9],[3,21,5],[4,16,8],[5,20,6],
    [6,13,9],[3,18,5],[4,22,7],[5,17,8],[6,14,6]
  ];
  // Seed Garden and Waterfall Climb have separate organic motion languages,
  // rather than borrowing the mechanical armor or aquatic fins of other games.
  function drawWorldSpecificEnemyMotion(at,foe,faceLeft,attackPose){
    if(![4,5,6,7,8].includes(index))return;
    const strike=reducedMotion?0:Math.max(0,Math.min(1,attackPose));
    const phase=reducedMotion?0:clock*([2.7,4.3,3.1,5.2,3.7][index-4])+(foe.offset||0);
    ctx.save();ctx.translate(at.x,at.y-15);ctx.scale(faceLeft?-1:1,1);
    ctx.lineCap='round';ctx.lineJoin='round';
    if(index===4){
      // Seed Garden: living leaf-blades unfurl before a pollen burst.
      for(const side of [-1,1]){
        const open=Math.sin(phase+side)*.18+strike*.65;
        ctx.save();ctx.translate(side*11,-7);ctx.rotate(side*(.25+open));
        ctx.fillStyle=side<0?'#8bdb6b':'#c6ef85';ctx.strokeStyle='#427e4d';ctx.lineWidth=1.6;
        ctx.beginPath();ctx.moveTo(0,6);ctx.quadraticCurveTo(side*13,-14,side*6,-27);
        ctx.quadraticCurveTo(side*24,-12,0,6);ctx.fill();ctx.stroke();
        ctx.strokeStyle='#f0ffb4';ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(side*7,-20);ctx.stroke();
        ctx.restore();
      }
      if(strike>.05){
        ctx.globalAlpha=strike*.75;ctx.fillStyle='#f8ec91';
        for(let i=0;i<5;i++){const a=i*1.256+phase*.2;ctx.beginPath();
          ctx.arc(19+Math.cos(a)*(12+strike*8),Math.sin(a)*(12+strike*8),1.7,0,Math.PI*2);ctx.fill();}
      }
    }else if(index===6){
      // Lantern Trail: hanging lantern pendulums and a growing light cone.
      const sway=reducedMotion?0:Math.sin(phase)*.23;
      ctx.save();ctx.rotate(sway);
      ctx.strokeStyle='#d7a85e';ctx.lineWidth=2;ctx.beginPath();
      ctx.moveTo(0,-28);ctx.lineTo(0,-15);ctx.stroke();
      ctx.fillStyle='#684469';ctx.strokeStyle='#ffd68b';
      ctx.beginPath();ctx.moveTo(-9,-15);ctx.lineTo(9,-15);
      ctx.lineTo(12,2);ctx.lineTo(0,10);ctx.lineTo(-12,2);ctx.closePath();
      ctx.fill();ctx.stroke();
      ctx.globalAlpha=.35+strike*.5;ctx.fillStyle='#fff0a0';
      ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(19+strike*22,18);
      ctx.lineTo(-19-strike*22,18);ctx.closePath();ctx.fill();ctx.restore();
    }else if(index===7){
      // Magnet Junction: opposed pole arms pivot and spark at attack peak.
      for(const side of [-1,1]){
        ctx.save();ctx.translate(side*11,-5);
        ctx.rotate(side*(Math.sin(phase)*.15-strike*.6));
        ctx.strokeStyle=side<0?'#7edaff':'#ff9f98';ctx.lineWidth=5;
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(side*12,-12);
        ctx.lineTo(side*20,-12);ctx.stroke();
        ctx.strokeStyle='#f8eaff';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(side*17,-17);ctx.lineTo(side*20,-12);
        ctx.lineTo(side*17,-7);ctx.stroke();ctx.restore();
      }
      if(strike>.08){ctx.globalAlpha=strike;ctx.strokeStyle='#e4faff';
        ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-29,-12);
        ctx.lineTo(-13,-20);ctx.lineTo(0,-8);ctx.lineTo(14,-20);
        ctx.lineTo(29,-12);ctx.stroke();}
    }else if(index===8){
      // Rhythm Run: independently beating drum plates and radial sound pulses.
      const beat=reducedMotion?0:Math.sin(phase*2)*.14;
      for(const side of [-1,1]){
        ctx.save();ctx.translate(side*14,-5);
        ctx.rotate(side*(beat+strike*.35));
        ctx.fillStyle=side<0?'#ed8fd5':'#89d5ff';
        ctx.strokeStyle='#fff0cf';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.ellipse(0,0,8+strike*3,12,side*.3,0,Math.PI*2);
        ctx.fill();ctx.stroke();ctx.restore();
      }
      if(strike>.05){ctx.globalAlpha=strike*.6;ctx.strokeStyle='#f8b8ff';
        ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,22+strike*18,
        17+strike*12,0,0,Math.PI*2);ctx.stroke();}
    }else{
      // Waterfall Climb: cascading droplets gather into a diving arc.
      ctx.strokeStyle='#b1f7ff';ctx.lineWidth=2.5;
      for(let i=0;i<3;i++){
        const x=-12+i*12;const flow=Math.sin(phase+i*1.8)*5;
        ctx.beginPath();ctx.moveTo(x,-20);ctx.quadraticCurveTo(x+flow,-5,x+flow+strike*13,14);
        ctx.stroke();
      }
      ctx.fillStyle='#d7ffff';ctx.globalAlpha=.65+strike*.3;
      for(let i=0;i<4;i++){const fall=(phase*7+i*13)%34;ctx.beginPath();
        ctx.ellipse(-16+i*11,-18+fall,1.8,3.2,0,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }
  function drawEnemyArmorAccent(at,foe,faceLeft,airborne){
    if(foe.dead) return;
    const [basePlates,radius,depth]=enemyArmorStyles[index];
    // Encounter archetypes alter silhouettes as well as patrol behavior.
    const variantPlate=[0,1,0,2][foe.archetype??0];
    // Use the foe's home chapter, so a camera crossing a stage boundary
    // never changes an existing enemy's armor in the middle of combat.
    const armorChapter=foe.spawnChapter??chapter;
    // Later chapters introduce an extra armor segment, with a different
    // arrangement for each world; this is visual, not extra hit points.
    const plates=basePlates+variantPlate+(armorChapter>=3?1:0);
    ctx.save();
    ctx.translate(at.x,at.y-17);
    ctx.scale(faceLeft?-1:1,1);
    ctx.lineJoin='round';
    ctx.lineWidth=1.2;
    ctx.strokeStyle=enemyCueColors[index];
    ctx.fillStyle='#15233bc9';
    // Four silhouettes: scout fins, sentry crest, skirmisher antennae,
    // raider horns. Colors remain unique to each world.
    const archetype=foe.archetype??0;
    // Veteran silhouettes acquire a rear stabilizer or winglet in the
    // final chapters, distinct from the rank emblem and front armor.
    if(armorChapter>=4){
      ctx.beginPath();
      const spread=12+(index%4)*3;
      ctx.moveTo(-18,-4);ctx.lineTo(-spread-14,-14);
      ctx.lineTo(-spread-10,-22);
      ctx.moveTo(18,-4);ctx.lineTo(spread+14,-14);
      ctx.lineTo(spread+10,-22);
      ctx.stroke();
    }
    ctx.beginPath();
    if(archetype===0){
      ctx.moveTo(-17,-9);ctx.lineTo(-28,-17);ctx.lineTo(-18,-3);
    }else if(archetype===1){
      ctx.moveTo(-10,-22);ctx.lineTo(0,-32);ctx.lineTo(10,-22);
    }else if(archetype===2){
      ctx.moveTo(-13,-19);ctx.lineTo(-19,-32);
      ctx.moveTo(13,-19);ctx.lineTo(19,-32);
    }else{
      ctx.moveTo(-16,-14);ctx.lineTo(-24,-29);ctx.lineTo(-5,-19);
      ctx.moveTo(16,-14);ctx.lineTo(24,-29);ctx.lineTo(5,-19);
    }
    ctx.stroke();
    // World-specific silhouette hardware: the outline is different in
    // each of the 25 games, with no image download or extra draw calls.
    const motif=index%5;
    ctx.beginPath();
    if(motif===0){ // foundry / volcanic: vent stacks
      ctx.rect(-14,-27,6,11);ctx.rect(8,-30,6,14);
    }else if(motif===1){ // library / mechanical: attached sensor fins
      ctx.moveTo(-10,-17);ctx.lineTo(-10,-26);ctx.lineTo(-5,-30);
      ctx.moveTo(10,-17);ctx.lineTo(10,-26);ctx.lineTo(5,-30);
    }else if(motif===2){ // reef / wind: curved fins
      ctx.moveTo(-16,-8);ctx.quadraticCurveTo(-29,-24,-24,-33);
      ctx.moveTo(16,-8);ctx.quadraticCurveTo(29,-24,24,-33);
    }else if(motif===3){ // clock / geometry: forked prongs
      ctx.moveTo(-13,-20);ctx.lineTo(-13,-34);ctx.lineTo(-19,-38);
      ctx.moveTo(13,-20);ctx.lineTo(13,-34);ctx.lineTo(19,-38);
    }else{ // garden / cargo: shield ridges
      ctx.moveTo(-18,-12);ctx.lineTo(-24,-22);ctx.lineTo(-17,-29);
      ctx.moveTo(18,-12);ctx.lineTo(24,-22);ctx.lineTo(17,-29);
    }
    ctx.stroke();
    // Deterministic stage emblems: enemy units gain a different etched
    // geometric crest in every chapter of their own course.
    const rank=foe.spawnChapter??chapter;
    ctx.save();
    ctx.translate(0,-10);
    ctx.rotate((index*7+rank*3)*Math.PI/18);
    ctx.beginPath();
    const points=3+(rank%4);
    for(let n=0;n<points;n++){
      const angle=-Math.PI/2+n*2*Math.PI/points;
      const x=Math.cos(angle)*7,y=Math.sin(angle)*7;
      if(n===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.stroke();
    ctx.restore();
    // Each world has its own arrangement of layered, shaded armor panels.
    for(let n=0;n<plates;n++){
      const angle=Math.PI*(1.07+n*.86/Math.max(1,plates-1));
      const px=Math.cos(angle)*radius;
      const py=Math.sin(angle)*radius-4;
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.lineTo(px+depth*.6,py-depth*.65);
      ctx.lineTo(px+depth+2,py+depth*.15);
      ctx.lineTo(px+depth*.35,py+depth*.85);
      ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(px+1,py+1);ctx.lineTo(px+depth*.6,py-depth*.45);
      ctx.stroke();
    }
    if(airborne){
      ctx.globalAlpha=.65;
      ctx.beginPath();ctx.ellipse(0,0,radius+6,4,0,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }
  // Original procedural limb art, attached to the sprite's body pivot.
  // Unlike detached motion badges, paws and arms remain connected to the foe.
  function drawEnemyArticulatedLimbs(at,foe,airborne,faceLeft,stride,attackPose){
    const dir=faceLeft?-1:1;
    const phase=(foe._gait||0)*(0.8+(index%5)*.11);
    // Clamp the animation speed when the simulation skips frames. This
    // protects Android browsers from a huge limb snap after tab switching.
    const gaitBlend=Math.min(1,Math.max(0,stride||0));
    // Animation pose stays stable when paused or reduced motion is enabled.
    const animTime=reducedMotion?0:clock;
    // Separate stance and swing phases so planted feet do not lift together.
    const swing=reducedMotion?0:Math.sin(phase)*gaitBlend;
    const gaitContact=reducedMotion?0:Math.cos(phase)*gaitBlend;
    const reach=reducedMotion?0:attackPose;
    // Individual game families get different windup and recoil timing.
    // Keep the pose attached to the existing foe sprite, not a floating cue.
    const attackRhythm=[1.0,.75,1.3,1.2,.85,1.1,.7,1.4,1.25,.9,1.15,.8,
      1.35,.95,1.05,.65,1.3,1.1,.8,1.25,.95,1.4,.75,1.15,1.05][index];
    const strikePhase=Math.min(1,Math.max(0,reach*attackRhythm));
    // Distinct reference-inspired action types: shield foes brace rather than
    // punch, precision foes aim, and momentum foes strike in passing.
    const defensiveWorld=[1,7,9,14,17,22].includes(index);
    const precisionWorld=[4,11,13,16,21].includes(index);
    // Brief body-level recoil for confirmed bash states; no overhead markers.
    // A hit reaction must decay; a persistent bashed flag must not make
    // an enemy jitter forever. Advance only while the enemy is rendered.
    const reactionDt=Math.min(.05,Math.max(0,clock-(foe._rigFrameAt??clock)));
    foe._rigFrameAt=clock;
    const hitEdge=Boolean(foe.bashed)&&!foe._rigWasBashed;
    foe._rigWasBashed=Boolean(foe.bashed);
    if(hitEdge)foe._rigHitReaction=1;
    foe._rigHitReaction=(foe._rigHitReaction||0)*Math.exp(-10*reactionDt);
    const hitRecoil=Math.sin(animTime*18+foe.offset)*.12*(foe._rigHitReaction||0);
    // Each counterpart-inspired adventure gets its own animation silhouette:
    // stride length, arm follow-through, knee bend and body mass. These are
    // original Super Paw Heroes motions, not copied reference-game assets.
    const enemyRigProfiles=[
      [1.0,1.0,1.0,1.0],[.75,1.25,.9,.85],[.45,1.5,.55,.8],
      [1.55,.7,.7,.75],[.8,1.4,1.15,1.25],[1.15,.8,1.3,1.0],
      [.6,1.5,.7,.75],[.95,.55,1.4,1.1],[1.7,.65,.6,.8],
      [.7,1.25,1.5,.9],[.85,1.4,.85,.75],[1.2,.75,1.2,1.0],
      [.8,.65,1.1,1.4],[1.0,1.3,1.0,.9],[.65,.85,1.55,.8],
      [1.25,1.0,.85,1.2],[.8,.7,1.2,1.5],[.65,1.5,.8,.75],
      [.95,1.15,1.3,.85],[.4,1.6,.65,.85],[1.6,.75,.65,1.1],
      [1.0,1.2,1.0,1.2],[.75,1.45,.85,.85],[1.15,.9,1.25,1.0],
      [.9,.8,1.4,1.35]
    ];
    const [strideScale,armScale,kneeScale,massScale]=enemyRigProfiles[index];
    // Stage-specific silhouettes progress without reusing the same cadence
    // throughout six chapters of any individual adventure.
    const chapterRigScale=1+Math.min(5,Math.max(0,chapter))*.035;
    const foePhase=((foe.offset||0)%6.283+6.283)%6.283;
    const enemyStrideVariant=.88+foePhase/6.283*.24;
    // Per-adventure enemy stance varies with the actual configured movement
    // mechanic rather than relying solely on a shared animation template.
    const movementRig={
      stomp:[1.1,.9],buster:[.75,1.35],swim:[.55,1.55],
      momentum:[1.55,.8],roll:[1.3,.75],glide:[.65,1.2],
      float:[.5,1.35],flip:[.85,.9],beat:[1.25,1.1],
      grapple:[.8,1.35],airlift:[.7,1.25],airdash:[1.15,1.1],
      pogo:[.95,.85],throw:[.85,1.4],blaster:[.8,1.3],
      shooter:[.75,1.4],precision:[.9,.8],whip:[1.0,1.5]
    }[movement]||[1,1];
    // Reference-inspired animation families: fast ground threats emphasize
    // acceleration, shooters brace their arms, underwater foes paddle, and
    // aerial foes tuck their legs. All remain original game artwork.
    const speedWorld=[3,8,20].includes(index);
    const waterWorld=[2,19].includes(index);
    const aerialWorld=[5,6,10,15,23].includes(index);
    const combatWorld=[0,4,12,16,21,24].includes(index);
    const chapterWeight=1+Math.min(5,foe.spawnChapter)*.045;
    const poseStride=strideScale*movementRig[0]*chapterRigScale*enemyStrideVariant*(speedWorld?1.22:waterWorld?.55:1);
    const poseArm=armScale*movementRig[1]*(combatWorld?1.22:waterWorld?1.4:1);
    const poseKnee=kneeScale*(aerialWorld?.55:1);
    const mechanical=[4,12,16,20,24].includes(index);
    const swimmer=[2,19].includes(index);
    const radius=(mechanical?5.4:4.3)*massScale;
    const outline=mechanical?'#344052':'#3d3454';
    const armor=mechanical?'#9aaec8':swimmer?'#72c8ce':'#9476b4';
    const paw=mechanical?'#d9bd75':swimmer?'#9fe9d4':'#d8b9a0';
    ctx.save();
    ctx.lineCap='round';ctx.lineJoin='round';
    // Articulated limbs draw BEHIND existing artwork, preserving each game's
    // distinct enemy face, armor, silhouette, and hitbox.
    for(const side of [-1,1]){
      const hip=at.x+side*13,shoulder=at.x+side*20;
      const flightCycle=Math.sin(animTime*(4.2+index%5*.55)+foe.offset+side);
      const legSwing=airborne?flightCycle*(aerialWorld?7:5):
        swing*side*9*poseStride*chapterWeight;
      const kneeX=hip+legSwing*.65;
      const kneeY=at.y+4+(airborne?-5:Math.abs(swing)*2*poseKnee);
      const footX=kneeX+legSwing*.45+dir*3-
        (!airborne && Math.max(0,-side*swing)>.25?legSwing*.2:0);
      // Plant the support foot while the opposite paw lifts; preserve a
      // steady contact point rather than making both feet skate together.
      const support=Math.max(0,side*gaitContact);
      const footY=at.y+18-(airborne?7+Math.max(0,flightCycle)*3:support*5*poseKnee);
      ctx.strokeStyle=outline;ctx.lineWidth=radius+3;
      ctx.beginPath();ctx.moveTo(hip,at.y-6);ctx.lineTo(kneeX,kneeY);ctx.lineTo(footX,footY);ctx.stroke();
      ctx.strokeStyle=armor;ctx.lineWidth=radius;
      ctx.beginPath();ctx.moveTo(hip,at.y-6);ctx.lineTo(kneeX,kneeY);ctx.lineTo(footX,footY);ctx.stroke();
      ctx.fillStyle=paw;ctx.beginPath();ctx.ellipse(footX+dir*2,footY,6,3.3,0,0,Math.PI*2);ctx.fill();
      // Per-game combat pose: ranged threats brace both arms, rushers
      // alternate strikes, swimmers paddle, and flying foes bank their arms.
      const shooterWorld=[4,11,12,13,16,21,24].includes(index);
      const rushWorld=[0,3,8,15,20].includes(index);
      const strike=defensiveWorld?strikePhase*(side===dir?.35:.7):
        precisionWorld?strikePhase*(side===dir?1.1:.35):
        shooterWorld?strikePhase*(side===dir?1:.55):
        rushWorld?strikePhase*(side===dir?1:.25):strikePhase;
      const armSwing=airborne?Math.sin(animTime*6+side)*7:
        waterWorld?Math.sin(animTime*3.6+side*Math.PI)*6*poseArm:
        -side*swing*8*poseArm*chapterWeight;
      const elbowX=shoulder+armSwing*.6+dir*strike*7-dir*hitRecoil*10;
      const elbowY=at.y-18+Math.abs(armSwing)*.3-strike*4;
      const handX=elbowX+armSwing*.5+dir*strike*13-dir*hitRecoil*14;
      const handY=at.y-6-strike*13;
      ctx.strokeStyle=outline;ctx.lineWidth=radius+3;
      ctx.beginPath();ctx.moveTo(shoulder,at.y-28);ctx.lineTo(elbowX,elbowY);ctx.lineTo(handX,handY);ctx.stroke();
      ctx.strokeStyle=armor;ctx.lineWidth=radius;
      ctx.beginPath();ctx.moveTo(shoulder,at.y-28);ctx.lineTo(elbowX,elbowY);ctx.lineTo(handX,handY);ctx.stroke();
      ctx.fillStyle=paw;ctx.beginPath();ctx.arc(handX,handY,radius*.9,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawEnemySecondaryMotion(at,foe,airborne,firing,movingWeight,footCycle,faceLeft){
    if(reducedMotion || foe.dead) return;
    // Distinct chapter animation timing prevents late-stage enemies from
    // repeating the exact same motion rhythm as opening-stage foes.
    const family=index%5;
    const animationPressure=1+Math.min(5,Math.max(0,chapter))*.035;
    const phase=clock*(2.1+index%4*.33)*animationPressure+foe.offset;
    const stride=Math.min(1,Math.max(0,movingWeight||0));
    const direction=faceLeft?-1:1;
    ctx.save();ctx.translate(at.x,at.y);
    ctx.globalAlpha=.25+stride*.26;
    // Late chapters add a restrained trailing motion accent during travel.
    // Skip it when reduced-motion accessibility is enabled (guard above).
    if(chapter>=3 && stride>.25 && !airborne){
      const wake=9+Math.min(5,chapter)*2;
      ctx.strokeStyle=enemyCueColors[index];ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(-direction*23,-12);
      ctx.quadraticCurveTo(-direction*(23+wake*.5),-15+Math.sin(phase)*3,
        -direction*(23+wake),-12);
      ctx.stroke();
    }
    ctx.lineCap='round';
    ctx.strokeStyle=enemyCueColors[index];
    ctx.fillStyle=enemyCueColors[index];
    ctx.lineWidth=1.7;
    if(airborne){
      // Wingbeats, propeller trails and air displacement for aerial threats.
      for(let n=0;n<3;n++){
        const side=direction*(23+n*8);
        ctx.beginPath();ctx.moveTo(-side,-28+n*9);
        ctx.quadraticCurveTo(-side-direction*11,-33+n*9+Math.sin(phase+n)*4,
          -side-direction*(19+n*3),-28+n*9);ctx.stroke();
      }
    }else if(firing){
      // Attack follow-through: bright, short-lived recoil arcs.
      for(let n=0;n<2;n++){
        ctx.beginPath();ctx.arc(direction*22,-13,11+n*7,
          -.9+Math.sin(phase)*.15,.9+Math.sin(phase)*.15);ctx.stroke();
      }
    }else if(stride>.12){
      // Contact marks follow the actual distance-based gait.
      const offset=Math.sin(foe._gait||0)*5;
      for(let n=0;n<2;n++){
        ctx.beginPath();
        ctx.ellipse(-direction*(9+n*9),16+Math.abs(offset)*.2,
          4+stride*4,1.2,0,0,Math.PI*2);ctx.fill();
      }
    }
    // No detached overhead circles, arches or U-shaped motion ornaments.
    // All new limb art is anchored directly to the enemy body.
    ctx.restore();
  }
  function drawEnemyCue(at,foe,faceLeft,nearby,airborne,firing){
    const recoveringShot=firing;
    const diving=airborne && at.y>foe.y-(enemyPattern==='school'?33:50);
    const hopping=enemyPattern==='hopper' && foe.y-at.y>enemyRise*.7;
    const charging=enemyPattern==='charge' && Math.abs(at.x-foe.x)>enemyReach*.45;
    const pursuing=enemyPattern==='pursuit' && nearby;
    const rhythmic=enemyPattern==='rhythm' && foe.y-at.y>enemyRise*.55;
    const lateRaider=foe.archetype===3 &&
      (foe.spawnChapter??chapter)>=3 && nearby && !recoveringShot;
    const turning=enemyPattern==='patrol' && foe.patrolLeft!==undefined &&
      Math.min(at.x-foe.patrolLeft,foe.patrolRight-at.x)<5;
    if(!(recoveringShot || diving || hopping || charging || pursuing || rhythmic || turning || lateRaider)) return;
    const facing=faceLeft?-1:1;
    ctx.save();
    ctx.translate(at.x,at.y);
    ctx.scale(facing,1);
    ctx.strokeStyle=enemyCueColors[index];
    ctx.lineWidth=2;
    ctx.beginPath();
    if(recoveringShot){
      ctx.arc(24,-6,6,0,Math.PI*2);
    }else if(diving || hopping){
      const direction=diving?1:-1;
      ctx.moveTo(-9,-36-direction*4);ctx.lineTo(0,-36+direction*2);ctx.lineTo(9,-36-direction*4);
    }else if(rhythmic){
      ctx.moveTo(-10,-37);ctx.lineTo(-4,-37);ctx.lineTo(0,-44);ctx.lineTo(4,-34);ctx.lineTo(10,-34);
    }else{
      ctx.moveTo(20,-16);ctx.lineTo(28,-10);ctx.lineTo(20,-4);
      if(charging || lateRaider){ctx.moveTo(27,-16);ctx.lineTo(35,-10);ctx.lineTo(27,-4);}
    }
    ctx.stroke();
    ctx.restore();
  }
  function exitMarkerLabel(bossHealth,finale,taken,index) {
    if(bossHealth) return 'DEFEAT BARON';
    if(finale==='crystals' && taken<3) return 'CRYSTALS '+taken+'/3';
    if(finale==='switch') return index===20?'ACTIVATE RESET':'ACTIVATE SWITCH';
    if(finale==='sprint') return 'RUN THROUGH';
    if(finale==='summit') return 'UPPER EXIT';
    return index===20?'RESET':'EXIT';
  }
  function drawLandingEffect() {
    if(!landingEffect) return;
    const {x,y,at,speed,kind}=landingEffect;
    const t=(clock-at)/.27;
    if(t>=1) return;
    const [color,shape,reach]=signatureEffects[index];
    const distance=reducedMotion ? .25 : t;
    const radius=(8+distance*(13+reach*.16))*Math.min(1.4,speed/280);
    ctx.save();
    ctx.translate(x,y-2);
    ctx.globalAlpha=(1-t)*.65;
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.lineWidth=2;
    ctx.beginPath();
    if(kind==='current' || shape==='wave' || shape==='spiral'){
      ctx.ellipse(0,0,radius,radius*.21,0,Math.PI,2*Math.PI);
      ctx.moveTo(radius*.72,0);
      ctx.ellipse(0,0,radius*.72,radius*.13,0,0,Math.PI);
      ctx.stroke();
    } else {
      const height=kind==='spring' ? 24 : shape==='drop' ? 16 : 9;
      for(const side of [-1,1]){
        for(let k=0;k<4;k++){
          const px=side*radius*(.45+k*.28);
          const py=-Math.sin(Math.PI*distance)*height*(1-k*.17);
          if(shape==='tiles' || kind==='ice') ctx.rect(px-1.5,py-1.5,3,3);
          else {
            ctx.moveTo(px,py);
            ctx.lineTo(px+side*(3+k),py-3);
          }
        }
      }
      if(shape==='tiles' || kind==='ice') ctx.fill();
      else ctx.stroke();
    }
    ctx.restore();
  }
  function drawTechniqueTrails() {
    for(const attack of attacks){
      if(!attack.trail?.length) continue;
      ctx.save();
      ctx.strokeStyle=signatureEffects[index][0];
      ctx.lineCap='round';
      let x=attack.x,y=attack.y;
      for(let i=attack.trail.length-1;i>=0;i--){
        const point=attack.trail[i];
        const strength=Math.max(0,1-(clock-point.at)/.26);
        ctx.globalAlpha=strength*.72;
        ctx.lineWidth=1+strength*(attack.motionTrail==='cross'?3:6);
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(point.x,point.y);
        ctx.stroke();
        x=point.x;y=point.y;
      }
      ctx.restore();
    }
  }
  function drawSignatureEffect() {
    if(!signatureEffect) return;
    const [color,shape,reach,duration]=signatureEffects[index];
    const progress=(clock-signatureEffect.at)/duration;
    if(progress>=1) return;
    const t=reducedMotion ? .3 : progress;
    const radius=reach*(.3+t*.7);
    ctx.save();
    ctx.translate(signatureEffect.x,signatureEffect.y);
    ctx.scale(signatureEffect.facing,1);
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.globalAlpha=(1-progress)*.83;
    ctx.lineWidth=2.5;
    ctx.lineCap='round';
    ctx.beginPath();
    if(shape==='wave' || shape==='spiral' || shape==='arc'){
      for(let k=0;k<3;k++){
        const r=radius*(1-k*.19);
        const turn=shape==='spiral' ? t*7+k*.7 : 0;
        ctx.moveTo(Math.cos(turn-1)*r,Math.sin(turn-1)*r*.62);
        ctx.ellipse(0,0,r,r*.62,0,turn-1,turn+(shape==='wave'?Math.PI*2-1:1));
      }
    } else if(shape==='cross' || shape==='impact' || shape==='tiles'){
      const count=shape==='cross'?4:8;
      for(let k=0;k<count;k++){
        const angle=k*Math.PI*2/count+(shape==='cross'?t*6:0);
        const x=Math.cos(angle)*radius;
        const y=Math.sin(angle)*radius*.65;
        if(shape==='tiles') ctx.rect(x-3,y-3,6,6);
        else {
          ctx.moveTo(x*.45,y*.45);
          ctx.lineTo(x,y);
        }
      }
    } else {
      for(let k=0;k<6;k++){
        const f=k/5;
        const spread=(k-2.5)*6;
        let x=radius*(.4+f*.6),y=spread;
        switch(shape){
          case 'trail': x=-x; break;
          case 'launch': x=-x;y+=radius*.45;break;
          case 'pull': x*=1-t;y*=1-t;break;
          case 'flip': y=x*(player.gravity<0?-1:1);x=spread;break;
          case 'cable': y=-x*.75;break;
          case 'climb': y=-x;x=spread;break;
          case 'drop': y=x;x=spread;break;
          case 'lob': y=-Math.sin(f*Math.PI)*radius*.55;break;
          case 'fan': y*=1+f;break;
        }
        ctx.moveTo(x-4,y+3);
        ctx.lineTo(x,y);
        ctx.lineTo(x+4,y-3);
      }
    }
    ctx.stroke();
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
      // Long levels can contain off-screen tunnels; don't issue draw calls
      // for geometry the player cannot see.
      if(t.x+t.w<camera-24 || t.x>camera+width+24)continue;
      ctx.fillStyle='#26334d';
      ctx.fillRect(t.x,t.y,t.w,ground-t.y);
      ctx.fillStyle='#526d91';
      ctx.fillRect(t.x,t.y-13,t.w,13);
      ctx.fillStyle='#a0e8f1';
      ctx.fillRect(t.x,t.y-2,t.w,2);
      for(let inset=12;inset<t.w-8;inset+=24){
        ctx.fillStyle='#354a68';
        ctx.fillRect(t.x+inset,t.y-11,13,6);
      }
      ctx.fillStyle='#ffc478';
      ctx.fillRect(t.x,t.y-12,4,10);
      ctx.fillRect(t.x+t.w-4,t.y-12,4,10);
    }
    for (const ledge of escape ? [...platforms,returnFloor] : platforms) {
      if (ledge.dropAt!==undefined && clock>=ledge.dropAt) continue;
      if(ledge.switchBridge && !amberSwitch) continue;
      if (ledge.x+ledge.w<camera || ledge.x>camera+width) continue;
      const foundryStage=index===0 ? stageAt(ledge.x) : -1;
      if(foundryStage>=6 && foundryStage<=17 && ['floor','lift','spring','belt','current'].includes(ledge.kind)){
        const {x,y,w,kind}=ledge;
        const floodgate=foundryStage===7;
        const depth=y>=ground?height-y:23;
        const colors={
          6:['#673b35','#e9a065'],7:['#28515c','#85c9bf'],
          8:['#57354e','#e9a1ad'],9:['#344541','#dfc267'],
          10:['#714034','#ffbe82'],11:['#573f35','#ddbb8e'],
          12:['#693846','#ffa787'],13:['#515366','#c3c9de'],
          14:['#54383d','#d2918c'],15:['#295457','#9ddbcc'],
          16:['#553d53','#eac4d7'],17:['#62382e','#ffcf82']
        }[foundryStage];
        ctx.fillStyle=colors[0];
        ctx.fillRect(x,y,w,depth);
        ctx.fillStyle=colors[1];
        ctx.fillRect(x,y,w,5);
        const spacing=floodgate?42:31;
        const first=Math.max(0,Math.floor((camera-x)/spacing))*spacing+10;
        for(let offset=first;offset<w-12 && x+offset<camera+width+spacing;offset+=spacing){
          ctx.fillStyle=floodgate?'#376975':'#442b30';
          ctx.fillRect(x+offset,y+8,floodgate?18:9,Math.min(13,depth-8));
          ctx.fillStyle=floodgate?'#b8d9b9':'#f5bf7d';
          ctx.fillRect(x+offset+3,y+11,3,3);
          if(['lift','spring','belt'].includes(kind)) ctx.fillRect(x+offset,y+18,13,3);
        }
        drawLandingEdge(ledge);
        continue;
      }
      if(ledge.steamDeck!==undefined){
        const {x,y,w,steamDeck}=ledge;
        const [top,body,trim]=[
          ['#efb67b','#7b4637','#422d36'],
          ['#9ac8bb','#42646a','#253c4a'],
          ['#e3c487','#80613e','#453340']
        ][steamDeck<0?1:steamDeck];
        ctx.fillStyle=body;
        ctx.fillRect(x,y,w,steamDeck<0?36:19);
        ctx.fillStyle=top;
        ctx.fillRect(x,y,w,5);
        ctx.fillStyle=trim;
        for(let bolt=Math.max(12,Math.floor((camera-x)/26)*26+12);bolt<w-7 && x+bolt<camera+width+12;bolt+=26){
          ctx.fillRect(x+bolt,y+9,4,4);
          if(steamDeck===1) ctx.fillRect(x+bolt-5,y+18,14,7);
          if(steamDeck===2) ctx.fillRect(x+bolt-4,y+15,11,4);
        }
        drawLandingEdge(ledge);
        continue;
      }
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
      if(index===3 && stageAt(ledge.x)===3 && ledge.kind==='spring' &&
         atlasSprite(propArt,4,2,ledge.x+ledge.w/2,ledge.y+14,ledge.w,28,false,2)) {
        drawLandingEdge(ledge);
        continue;
      }
      if(index===9 && ledge.kind==='rail'){
        const {x,y,w}=ledge;
        ctx.save();
        ctx.fillStyle='#2b2020';
        ctx.fillRect(x,y,w,10);
        ctx.fillStyle='#ffcc71';
        ctx.fillRect(x,y,w,3);
        ctx.beginPath();
        ctx.rect(x,y+3,w,7);
        ctx.clip();
        ctx.strokeStyle='#b68655';
        ctx.lineWidth=3;
        for(let offset=-6;offset<w;offset+=14){
          ctx.beginPath();
          ctx.moveTo(x+offset,y+10);
          ctx.lineTo(x+offset+7,y+3);
          ctx.stroke();
        }
        ctx.restore();
        atlasSprite(propArt,4,3,x+w/2,y+10,42,39,false,2);
        continue;
      }
      if(index===7 && (ledge.kind==='hazard' || ledge.kind==='ceilingSpikes')){
        // Use the same crystal silhouette on both gravity surfaces.
        const ceiling = ledge.kind==='ceilingSpikes';
        const base = ceiling ? 32 : ground;
        const height = Math.abs(ledge.y-base);
        const count = Math.max(1, Math.round(ledge.w/17));
        const spacing = ledge.w/count;
        ctx.save();
        ctx.translate(ledge.x,base);
        ctx.scale(1,ceiling ? 1 : -1);
        ctx.fillStyle='#451a58';
        ctx.fillRect(0,0,ledge.w,5);
        ctx.strokeStyle='#ffe4f5';
        ctx.lineWidth=1.2;
        for(let tooth=0;tooth<count;tooth++){
          const x=tooth*spacing;
          ctx.beginPath();
          ctx.moveTo(x,0);
          ctx.lineTo(x+spacing*.5,height);
          ctx.lineTo(x+spacing,0);
          ctx.closePath();
          ctx.fillStyle='#cf376f';
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x,0);
          ctx.lineTo(x+spacing*.5,height);
          ctx.lineTo(x+spacing*.48,0);
          ctx.fillStyle='#ff9bd0';
          ctx.fill();
        }
        ctx.restore();
        continue;
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
      if(ledge.kind==='ceiling'){
        ctx.save();
        ctx.translate(0,ledge.y*2);
        ctx.scale(1,-1);
        drawCoursePlatform(ledge);
        ctx.restore();
        continue;
      }
      if(ledge.kind==='rail'){
        const [,recess,rim]=courseMaterials[index];
        ctx.fillStyle=recess;
        ctx.fillRect(ledge.x,ledge.y,ledge.w,7);
        ctx.fillStyle=rim;
        ctx.fillRect(ledge.x,ledge.y,ledge.w,2);
        continue;
      }
      if(ledge.kind!=='hazard'){
        drawCoursePlatform(ledge);
        drawPlatformAccents(ledge);
        drawLandingEdge(ledge);
        drawDropWarning(ledge);
        continue;
      }
      if (ledge.kind==='hazard') {
        if(index===18){
          const {x,y,w}=ledge;
          const teeth=Math.max(1,Math.round(w/14));
          const step=w/teeth;
          ctx.fillStyle='#684434';
          ctx.fillRect(x,ground-5,w,5);
          for(let tooth=0;tooth<teeth;tooth++){
            const base=x+tooth*step;
            ctx.fillStyle='#e1d7c0';
            ctx.beginPath();
            ctx.moveTo(base,ground-4);
            ctx.lineTo(base+step*.5,y);
            ctx.lineTo(base+step,ground-4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle='#8a747a';
            ctx.beginPath();
            ctx.moveTo(base+step*.5,y);
            ctx.lineTo(base+step,ground-4);
            ctx.lineTo(base+step*.53,ground-4);
            ctx.closePath();
            ctx.fill();
          }
          continue;
        }
        const rhythmBarrier=index===8;
        if(rhythmBarrier) ctx.save();
        const count=Math.max(1,Math.round(ledge.w/16));
        const spacing=ledge.w/count;
        ctx.fillStyle=rhythmBarrier?'#ad297f':'#ff617c';
        ctx.beginPath();
        for(let i=0;i<count;i++){
          const x=ledge.x+i*spacing;
          ctx.moveTo(x,ground);ctx.lineTo(x+spacing*.5,ledge.y);ctx.lineTo(x+spacing,ground);
          if(rhythmBarrier) ctx.closePath();
        }
        ctx.fill();
        if(rhythmBarrier){
          ctx.strokeStyle='#fff0ff';
          ctx.lineWidth=2;
          ctx.stroke();
          ctx.fillStyle='#ff73bf';
          ctx.fillRect(ledge.x,ground-3,ledge.w,3);
          ctx.restore();
        }
        continue;
      }
    }
    for(let stage=1;stage<sections;stage++){
      const x=stageStarts[stage]+100;
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
      if(c.refill){
        ctx.save();
        ctx.translate(c.x,c.y);
        ctx.fillStyle='#10364b';
        ctx.strokeStyle='#bafff2';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(0,-17);
        ctx.lineTo(13,0);
        ctx.lineTo(0,17);
        ctx.lineTo(-13,0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle='#58f3d7';
        ctx.beginPath();
        ctx.moveTo(-6,1);
        ctx.lineTo(0,-5);
        ctx.lineTo(6,1);
        ctx.moveTo(-6,7);
        ctx.lineTo(0,1);
        ctx.lineTo(6,7);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if(!sprite(15,c.x,c.y,38,38)){ctx.fillStyle='#ffd967';ctx.fillRect(c.x-5,c.y-5,10,10);}
    }
    const bashReady=index===15 && technique==='bash' && phase==='playing' && player.techCooldown<=0 ? bashTarget(player) : null;
    for (const foe of enemies) if(!foe.dead && foe.x>=camera-150 && foe.x<camera+width+150) {
      const at=foePosition(foe);
      const airborne=['swoop','school'].includes(enemyPattern);
      // Airborne opponents cast a shadow on the floor, not in mid-air.
      castShadow(at.x,airborne?ground:at.y+20,airborne?16:20);
      const cell=index;
      const nearby=Math.abs(player.x-at.x)<250;
      const recoil=Math.max(0,1-(clock-(foe.lastShotAt??-Infinity))/.16);
      const firing=recoil>0;
      const motion=reducedMotion?0:Math.sin(clock*(airborne?9:6)+foe.offset);
      // Enemy gait follows visible world travel, not elapsed time. Reset on
      // large position changes so teleports and respawns never spin the gait.
      const displacement=at.x-(foe._drawX??at.x);
      const travel=Math.abs(displacement);
      const faceLeft=foe.turret || firing || (nearby && ['turret','charge','pursuit'].includes(enemyPattern))
        ? player.x<at.x
        : travel>.15 && travel<90 ? displacement<0 : (foe.faceLeft??player.x<at.x);
      foe.faceLeft=faceLeft;
      foe._drawX=at.x;
      const elapsed=Math.max(0,clock-(foe.gaitTime??clock));
      foe.gaitTime=clock;
      const speed=elapsed>0 && travel<90 ? travel/elapsed : 0;
      if(travel>=90)foe._gait=0;
      else foe._gait=(foe._gait||0)+travel/12;
      if(elapsed>0){
        const target=Math.min(1,speed/115);
        foe.gaitWeight=(foe.gaitWeight||0)+(target-(foe.gaitWeight||0))*(1-Math.exp(-14*elapsed));
      }
      const movingWeight=reducedMotion||travel>=90?0:foe.gaitWeight||0;
      // Twenty-five authored movement profiles: individual cadence, foot lift,
      // body lean, idle breathing and gait phase per adventure.
      const cadence=[.82,1.04,.94,1.27,.76,1.12,.88,1.31,1.08,.71,1.18,.9,1.34,.79,1.02,.86,1.25,.73,1.14,.97,1.42,.84,1.06,1.2,.92][index];
      const lift=[2.4,1.2,2.8,1.5,3.4,2.1,1.8,2.5,3.2,1.1,2.9,1.7,2.4,3.1,1.5,2.6,1.3,2.8,3.5,1.6,2.2,1.9,3,2.7,1.4][index];
      const sway=[.038,.021,.045,.016,.06,.03,.025,.018,.048,.014,.04,.022,.027,.052,.019,.041,.017,.033,.055,.02,.023,.029,.05,.044,.018][index];
      const footCycle=Math.sin((foe._gait||0)*cadence+(foe.offset||0)*.12);
      // Smooth the velocity and facing transitions so a patrol reversal
      // transfers body weight rather than snapping from one lean to another.
      // Visual-only springs: collision, enemy speed and attack AI are intact.
      const motionDt=Math.min(.05,Math.max(0,elapsed));
      const signedVelocity=elapsed>0 && travel<90?displacement/elapsed:0;
      const velocityTarget=reducedMotion?0:Math.max(-1,Math.min(1,signedVelocity/135));
      foe._bodyVelocity=(foe._bodyVelocity||0)+
        (velocityTarget-(foe._bodyVelocity||0))*(1-Math.exp(-7*motionDt));
      const velocityLean=(foe._bodyVelocity||0)*(.035+sway*.65);
      const footstep=airborne?0:Math.abs(footCycle)*lift*movingWeight;
      // The stride's support phase compresses the torso, while idle breathing
      // fades out as the foe starts moving. Never animate a walking foe in place.
      const strideCompression=airborne?0:
        Math.max(0,footCycle)*.018*movingWeight;
      const breathing=Math.sin(clock*(1.6+index%4*.23)+foe.offset)*.012*(1-movingWeight);
      const enemyLean=reducedMotion?0:
        footCycle*sway*movingWeight+velocityLean+breathing;
      const anticipation=!reducedMotion && enemyPattern==='charge' && nearby && !airborne;
      const bodyStretch=movingWeight*(.018+.012*(index%3))*footCycle;
      const chargeCompression=anticipation?.07:0;
      // Critically damped pose layers smooth attack anticipation and recovery.
      // Visual-only; enemy AI, hitboxes, timing and damage remain untouched.
      const blendDt=Math.min(.05,Math.max(0,elapsed));
      const poseTarget=firing?1:anticipation?.55:0;
      // Attack pose profiles vary by world: quick jabs, heavy windups,
      // spring-loaded strikes and slow mechanical recoveries.
      const attackProfiles=[
        [13,5],[9,7],[18,10],[7,4],[15,8],
        [19,9],[11,6],[8,5],[16,11],[6,4],
        [17,8],[12,7],[10,5],[14,9],[8,6],
        [16,8],[7,4],[11,6],[19,10],[9,5],
        [20,12],[6,4],[13,7],[17,9],[8,5]
      ];
      const poseRate=poseTarget>(foe._attackPose||0)?
        attackProfiles[index][0]:attackProfiles[index][1];
      foe._attackPose=(foe._attackPose||0)+(poseTarget-(foe._attackPose||0))*
        (1-Math.exp(-poseRate*blendDt));
      const attackPose=reducedMotion?0:foe._attackPose;
      const squash=attackPose*.045;
      const attackStyle=[.04,.025,.07,.018,.09,.05,.065,.03,.085,.02,.075,.045,.06,.055,.035,.08,.022,.04,.095,.028,.07,.025,.065,.09,.032][index];
      const attackTilt=(faceLeft?-1:1)*attackPose*attackStyle;
      // Height-following spring adds a soft touchdown and recovery to jumping
      // foes; the pose is cosmetic and cannot alter their collision geometry.
      const previousY=foe._previousDrawY;
      const verticalSpeed=previousY===undefined||blendDt<=0?0:
        Math.max(-650,Math.min(650,(at.y-previousY)/Math.max(.008,blendDt)));
      foe._previousDrawY=at.y;
      const touchingDown=!airborne && verticalSpeed>55 &&
        (foe._lastVerticalSpeed||0)<=0;
      foe._lastVerticalSpeed=verticalSpeed;
      if(touchingDown) foe._landingPose=Math.max(foe._landingPose||0,Math.min(.085,verticalSpeed/4800));
      foe._landingPose=(foe._landingPose||0)*Math.exp(-9*blendDt);
      const landingPose=reducedMotion?0:foe._landingPose;
      const verticalLean=reducedMotion?0:Math.max(-.045,Math.min(.045,verticalSpeed/9000));
      ctx.save();
      // A distinct animation state for patrolling, hopping, flying and firing.
      ctx.translate(at.x,at.y+19);
      if(!airborne && enemyPattern==='charge' && nearby) ctx.rotate((faceLeft?1:-1)*.075);
      if(airborne) ctx.rotate(motion*.065);
      else ctx.rotate(enemyLean+attackTilt+verticalLean);
      ctx.scale((1+recoil*.09+motion*.025)+bodyStretch+chargeCompression+squash+landingPose+strideCompression*.5,
        (1-recoil*.06-motion*.025)-bodyStretch*.7-chargeCompression-squash-landingPose-strideCompression);
      ctx.translate(-at.x,-at.y-19-footstep);
      drawEnemyArticulatedLimbs(at,foe,airborne,faceLeft,movingWeight,attackPose);
      if(foe.foundryEnemy!==undefined) drawFoundryEnemy(at,foe.foundryEnemy,faceLeft,foe.offset,attackPose,recoil,foe._gait||0,landingPose,foe.bashed?1:0);
      else if(foe.libraryEnemy!==undefined) drawLibraryEnemy(at,foe,faceLeft,firing,attackPose);
      else if(foe.reefEnemy!==undefined) drawReefEnemy(at,foe,faceLeft,attackPose);
      else if(foe.clockEnemy!==undefined) drawClockEnemy(at,foe,faceLeft,attackPose);
      else if(index===16) drawSteamworksEnemy(at,foe,faceLeft,firing);
      else if(!atlasSprite(enemyArt,5,cell,at.x,at.y-12,73,73,faceLeft,5)){
        ctx.fillStyle='#bd664e';ctx.fillRect(at.x-18,at.y-17,36,34);
      }
      ctx.restore();
      drawWorldSpecificEnemyMotion(at,foe,faceLeft,attackPose);
      // No detached armor outlines or U-shaped halo above enemies.
      // Render the enemy's own sprite and grounded motion effects only.
      drawEnemySecondaryMotion(at,foe,airborne,firing,movingWeight,footCycle,faceLeft);
      // Keep the space above enemies clear: no floating rank badges,
      // insignias, arrows or attack symbols. Enemy art and motion remain.
      if(foe===bashReady){
        ctx.save();
        ctx.strokeStyle='#a8ffd9';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.arc(at.x,at.y-12,37,0,Math.PI*2);
        for(const side of [-1,1]){
          const x=at.x+side*37;
          const y=at.y-12;
          ctx.moveTo(x-side*5,y-5);
          ctx.lineTo(x,y);
          ctx.lineTo(x-side*5,y+5);
        }
        ctx.stroke();
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
      if(!atlasSprite(baronArt,1,0,boss.x,boss.y-19,88,116,false,1)){
        ctx.fillStyle=courseMaterials[index][1];
        ctx.fillRect(boss.x-34,boss.y-38,68,76);
        ctx.fillStyle=courseMaterials[index][2];
        ctx.fillRect(boss.x-23,boss.y-22,46,6);
      }
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
      if(baronShielded(boss.time%3.2)){
        ctx.save();
        ctx.font='bold 11px system-ui';
        ctx.textAlign='center';
        ctx.fillStyle='#21152a';
        ctx.fillRect(boss.x-36,boss.y-91,72,18);
        ctx.fillStyle='#ffe199';
        ctx.fillText('GUARDED',boss.x,boss.y-78);
        ctx.restore();
      }
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
      ctx.fillText(exitMarkerLabel(boss.health,finale,taken,index),exitX+12,markerY-8);
      ctx.restore();
    }
    for (const a of attacks) {
      if(index===21 && a.whip){
        ctx.save();
        ctx.lineWidth=3;
        ctx.strokeStyle='#e4be8f';
        ctx.beginPath();
        const recovery=Math.max(0,Math.min(1,(.12-a.life)/.12));
        const tipX=a.x+(a.originX-a.x)*recovery*.6;
        const tipY=a.y-recovery*7;
        ctx.moveTo(a.originX,a.originY);
        ctx.quadraticCurveTo((a.originX+tipX)/2,a.y-12+recovery*20,tipX,tipY);
        ctx.stroke();
        ctx.fillStyle='#fff0cb';
        ctx.fillRect(tipX-3,tipY-2,6,4);
        ctx.restore();
        continue;
      }
      if(index===8){
        ctx.save();
        ctx.translate(a.x,a.y);
        ctx.scale(a.v<0?-1:1,1);
        ctx.strokeStyle=a.accent?'#ffe39b':'#a8eaff';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(-13,3);
        ctx.lineTo(-6,3);
        ctx.lineTo(-2,-8);
        ctx.lineTo(3,9);
        ctx.lineTo(7,-3);
        ctx.lineTo(13,-3);
        ctx.stroke();
        ctx.restore();
        continue;
      }
      const radius=a.radius||9;
      if(index===13 && a.motionTrail==='lob'){
        ctx.save();
        ctx.translate(a.x,a.y);
        ctx.fillStyle='#fff1b9';
        ctx.strokeStyle='#522746';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(0,-radius);
        ctx.lineTo(radius*.8,-radius*.25);
        ctx.lineTo(radius*.6,radius*.55);
        ctx.lineTo(0,radius);
        ctx.lineTo(-radius*.7,radius*.45);
        ctx.lineTo(-radius*.8,-radius*.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle='#f28754';
        ctx.beginPath();
        ctx.moveTo(0,-radius*.75);
        ctx.lineTo(radius*.58,-radius*.22);
        ctx.lineTo(0,radius*.65);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        continue;
      }
      // Keep radial strikes as rings so their full hit area stays readable.
      if(a.v!==0 && atlasSprite(combatArt,3,a.returning?4:(index===24 && a.gravity)?5:movement==='buster'?1:3,
          a.x,a.y,radius*2.9,radius*2,a.v<0,2)) continue;
      ctx.fillStyle='#ffe9a9';ctx.beginPath();ctx.arc(a.x,a.y,a.radius||9,0,Math.PI*2);ctx.fill();
    }
    for(const shot of hazards) {
      if(index===16 && shot.parry){
        ctx.save();
        ctx.translate(shot.x,shot.y);
        ctx.fillStyle='#ff78d3';
        ctx.strokeStyle='#592245';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.arc(0,0,11,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle='#fff4fc';
        ctx.beginPath();
        ctx.moveTo(0,-7);
        ctx.lineTo(2,-2);
        ctx.lineTo(7,0);
        ctx.lineTo(2,2);
        ctx.lineTo(0,7);
        ctx.lineTo(-2,2);
        ctx.lineTo(-7,0);
        ctx.lineTo(-2,-2);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        continue;
      }
      if(shot.parry && atlasSprite(combatArt,3,2,shot.x,shot.y,21,21,false,2)) continue;
      ctx.save();
      ctx.translate(shot.x,shot.y);
      if(shot.v<0) ctx.scale(-1,1);
      ctx.fillStyle=shot.parry?'#ff86dc':(shot.color || '#ff8479');
      ctx.strokeStyle='#471723';
      ctx.lineWidth=2;
      const silhouette=shot.color && enemyRoundArt[index];
      if(silhouette){
        ctx.fill(silhouette);
        ctx.stroke(silhouette);
      }else{
        ctx.beginPath();
        ctx.moveTo(-12,0);ctx.lineTo(-3,-6);ctx.lineTo(7,-6);
        ctx.lineTo(11,0);ctx.lineTo(7,6);ctx.lineTo(-3,6);
        ctx.closePath();ctx.fill();ctx.stroke();
      }
      ctx.restore();
    }
    drawLandingEffect();
    drawTechniqueTrails();
    drawSignatureEffect();
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

    if(index===9 && phase==='playing' && !p.cable && p.power<=0){
      const anchor=findGrappleAnchor(p);
      if(anchor){
        ctx.save();
        // Preview the same anchor the Action button will attach to.
        ctx.strokeStyle='#ffe0a1';
        ctx.lineWidth=2;
        ctx.globalAlpha=.8;
        ctx.setLineDash([6,5]);
        ctx.beginPath();
        ctx.moveTo(p.x,p.y-7);
        ctx.lineTo(anchor.x,anchor.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha=1;
        ctx.beginPath();
        ctx.arc(anchor.x,anchor.y,10,0,Math.PI*2);
        ctx.stroke();
        ctx.restore();
      }
    }
    if(p.cable){
      ctx.save();
      const shoulderX=p.x;
      const shoulderY=p.y-7;
      const reach=Math.atan2(p.cable.y-shoulderY,p.cable.x-shoulderX);
      const handX=shoulderX+(index===9 ? Math.cos(reach)*19 : 0);
      const handY=shoulderY+(index===9 ? Math.sin(reach)*19 : 0);
      ctx.beginPath();ctx.moveTo(handX,handY);ctx.lineTo(p.cable.x,p.cable.y);
      ctx.lineWidth=5;ctx.strokeStyle='#101827';ctx.stroke();
      ctx.lineWidth=2;ctx.strokeStyle='#b4e9ff';ctx.stroke();
      if(index===9){
        ctx.translate(handX,handY);
        ctx.rotate(reach);
        ctx.fillStyle='#79523b';
        ctx.fillRect(-13,-4,14,8);
        ctx.fillStyle='#ffcc71';
        ctx.fillRect(-5,-5,10,10);
      }
      ctx.restore();
    }
    if(index===2 && p.air<airCapacity){
      const meterX=p.x-18;
      const meterY=p.y<52 ? p.y+28 : p.y-42;
      const airFraction=p.air/airCapacity;
      ctx.fillStyle='#101e35';
      ctx.fillRect(meterX-2,meterY-2,40,9);
      ctx.fillStyle='#3f5871';
      ctx.fillRect(meterX,meterY,36,5);
      ctx.fillStyle=p.air<=5 ? '#ffbc76' : '#8deafa';
      ctx.fillRect(meterX,meterY,36*airFraction,5);
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
    if(index===1 && (p.chargeStart!==null || blasterFiring || p.power>.13)){
      ctx.save();
      ctx.translate(p.x,p.y-7);
      ctx.scale(p.facing,1);
      ctx.fillStyle='#392851';
      ctx.fillRect(13,-6,18,12);
      ctx.fillStyle='#95ddff';
      ctx.fillRect(19,-4,12,3);
      ctx.fillStyle='#e3f9ff';
      ctx.fillRect(28,-6,3,12);
      ctx.restore();
    }
    if(p.chargeStart!==null){
      const charge=Math.min(1,(clock-p.chargeStart)/fullChargeTime);
      const facing=(Number(held('right'))-Number(held('left')))||p.facing;
      const x=p.x+facing*22;
      const y=p.y-7;
      const radius=6+charge*10;
      ctx.save();
      ctx.fillStyle=charge===1?'#fff1b5':'#85dcff';
      ctx.shadowColor='#80cbff';ctx.shadowBlur=radius;
      ctx.beginPath();ctx.arc(x,y,radius*.6,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle='#c6f5ff';
      ctx.beginPath();ctx.arc(x,y,radius,-Math.PI/2,-Math.PI/2+charge*Math.PI*2);ctx.stroke();
      if(index===1){
        const meterX=p.x-16;
        const meterY=p.y-40;
        ctx.fillStyle='#12182c';
        ctx.fillRect(meterX-2,meterY-2,36,9);
        ctx.fillStyle='#40536e';
        ctx.fillRect(meterX,meterY,32,5);
        ctx.fillStyle=charge===1?'#fff1b5':'#85dcff';
        ctx.fillRect(meterX,meterY,32*charge,5);
      }
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
    const blasterAge=clock-(p.blasterRecoil?.time??-Infinity);
    const blasterFiring=index===1 && blasterAge>=0 && blasterAge<.24;
    const shotAge=clock-(p.shotPose?.time??-Infinity);
    const firing=(index===19 || index===24) && shotAge>=0 && shotAge<.22;
    const attacking=firing || blasterFiring || (p.power>.22 && power!=='dash');
    const rolling=(index===3 && (p.spin>0 || p.power>.22 || p.spinJump)) || (movement==='roll' && p.power>.22);
    const rushing=p.grapple>0 || (power==='dash' && p.power>.22);
    const braking=p.on && Math.abs(p.vx)>runSpeed*.42 &&
      ((p.vx>0 && held('left')) || (p.vx<0 && held('right')));
    const gliding=power==='glide' && !p.on && held('jump') && p.vy>0;
    if(index===5 && gliding && !reducedMotion){
      ctx.save();
      ctx.strokeStyle='#bdf5ff';
      ctx.lineCap='round';
      ctx.lineWidth=1.5;
      for(let strand=0;strand<3;strand++){
        const direction=Math.abs(p.vx)>12?Math.sign(p.vx):p.facing;
        const x=p.x-direction*(19+strand*6);
        const y=p.y-8+strand*9;
        ctx.globalAlpha=.64-strand*.14;
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.quadraticCurveTo(x-direction*13,y+1,x-direction*27,y+9);
        ctx.stroke();
      }
      ctx.restore();
    }
    if(index===6 && !p.on && floatHasLift(p)){
      ctx.save();
      ctx.strokeStyle='#ffda94';
      ctx.lineWidth=1.4;
      ctx.globalAlpha=.75;
      ctx.beginPath();
      ctx.ellipse(p.x,p.y+17,19,6,0,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
    const wallSliding=!!p.wall && !p.on && p.vy>0;
    const swimming=power==='swim' && !p.on;
    const pose=rolling ? 3 : attacking ? 2 : braking ? 0 : !p.on ? 3 :
      Math.abs(p.vx)>15 ? 1+Math.floor(clock*(7+Math.min(9,Math.abs(p.vx)/75)))%2 : 0;
    const cell = power==='slide' && held('action') ? 13 :
      light && !p.on && (power==='double' || power==='vine') ? 14 : (light?4:0)+pose;
    const squash=reducedMotion ? 0 : (p.landingPose||0)**2*8;
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
    if(index===6 && (reducedMotion ? !p.on && floatHasLift(p) : p.floatPose>0)){
      const puff=reducedMotion?1:p.floatPose*(2-p.floatPose);
      ctx.translate(p.x,p.y);
      ctx.scale(1+.19*puff,1-.06*puff);
      ctx.translate(-p.x,-p.y);
    }
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
        const charge=index===2 ? Math.max(0,Math.min(1,p.power/.4)) : 0;
        const swimPitch=Math.atan2(p.vy,Math.max(120,Math.abs(p.vx)));
        tilt=p.facing*swimPitch*.28+Math.sin(clock*8)*.1*(1-charge);
        scaleX=1.08+.12*charge;
        scaleY=.94-.07*charge;
      } else if(rushing){
        tilt=movement==='airdash'
          ? p.facing*Math.atan2(p.vy,Math.abs(p.vx))*.34
          : -p.facing*.22;
        scaleX=1.12;scaleY=.88;
      } else if(firing){
        const recoil=(1-shotAge/.22)**2;
        const {facing,angle}=p.shotPose;
        tilt=-facing*Math.cos(angle)*recoil*(index===24?.22:.13);
        scaleY=1-recoil*(index===24?.09:.05);
      } else if(blasterFiring){
        const recoil=(1-blasterAge/.24)**2;
        tilt=-p.blasterRecoil.facing*recoil*(p.blasterRecoil.charged?.23:.12);
        scaleY=1-recoil*.08;
      } else if((index===12 || index===22) && p.pogo){
        tilt=p.facing*.06;
        scaleX=.91;
        scaleY=1.16;
      } else if(clock-(p.pogoRebound??-Infinity)<.18){
        const rebound=Math.max(0,1-(clock-p.pogoRebound)/.18);
        scaleX=1+.13*rebound;
        scaleY=1-.16*rebound;
      } else if(index===18 && p.ledgeGrip){
        tilt=(p.ledgeGrip.left?1:-1)*.16;
        scaleX=.94;
        scaleY=1.1;
      } else if(index===16 && clock-(p.parryFlash?.time??-Infinity)<.2){
        const lift=1-(clock-p.parryFlash.time)/.2;
        tilt=-p.facing*.18*lift;
        scaleX=1-.08*lift;
        scaleY=1+.13*lift;
      } else if(index===0 && clock-(p.stompImpact?.time??-Infinity)<.24){
        const rebound=(clock-p.stompImpact.time)/.24;
        const compression=Math.max(0,1-rebound*5);
        const extension=Math.sin(Math.PI*rebound)*rebound;
        scaleX=1+.14*compression-.09*extension;
        scaleY=1-.13*compression+.18*extension;
      } else if(p.throwPose && clock-p.throwPose.time<.17){
        const release=1-(clock-p.throwPose.time)/.17;
        tilt=p.throwPose.facing*.22*release;
        scaleX=1+.09*release;
      } else if(index===10 && p.carry){
        tilt=-p.facing*.08;
        scaleY=1.08;
        scaleX=.96;
      } else if(index===15 && p.bashPose && clock-p.bashPose.time<.27){
        const launch=1-(clock-p.bashPose.time)/.27;
        tilt=Math.cos(p.bashPose.angle)*.23*launch;
        scaleX=1+.12*launch;
        scaleY=1-.07*launch;
      } else if(attacking){
        const strike=Math.sin(clock*22);
        tilt=p.facing*(.11+strike*.16);
        scaleX=1.06;scaleY=.96;
      } else if(p.cable && !p.on){
        const cableAngle=Math.atan2(p.x-p.cable.x,Math.max(1,p.y-p.cable.y));
        tilt=-Math.max(-.4,Math.min(.4,cableAngle*.6));
        scaleY=1.06;
      } else if(index===13 && !p.on && held('jump') && p.jumpCut && p.vy<0){
        const flutter=Math.sin((p.jumpAge||0)*42);
        tilt=p.facing*(.08+flutter*.035);
        scaleX=1+.035*flutter;
        scaleY=1+.06*Math.abs(flutter);
      } else if(!p.on){
        // Rising compresses the silhouette; falling extends it. Cap both
        // responses so fast falls never distort the approved character art.
        const airborneSpeed=Math.min(1,Math.abs(p.vy)/650);
        tilt=p.facing*Math.max(-.105,Math.min(.115,p.vy/3700));
        scaleX=1+(p.vy<0?-.035:.045)*airborneSpeed;
        scaleY=p.vy<0?1+.055*airborneSpeed:1-.035*airborneSpeed;
      } else if(Math.abs(p.vx)>45){
        tilt=Math.max(-.13,Math.min(.13,p.vx/4200));
        // Distinct run silhouette: sprint-forward energy without moving
        // the feet or altering collision dimensions.
        scaleX=1+stride*[.014,.025,.018,.035,.022][motionStyle];
        scaleY=1-stride*[.012,.019,.015,.026,.017][motionStyle];
      }
      if(signatureEffect && !rolling && !p.morphed){
        const duration=signatureEffects[index][3];
        const progress=(clock-signatureEffect.at)/duration;
        if(progress>=0 && progress<1){
          const weight=techniqueWeight(progress,techniqueTiming[index]);
          const [lean,widthScale,heightScale]=techniquePoses[index];
          tilt+=lean*signatureEffect.facing*weight;
          scaleX*=1+(widthScale-1)*weight;
          scaleY*=1+(heightScale-1)*weight;
        }
      }
      if(p.morphed){scaleX*=1.18;scaleY*=.77;}
      const elapsed=Math.max(0,clock-(p.poseTime??clock));
      const blend=1-Math.exp(-22*elapsed);
      const previous=p.bodyPose;
      const ease=previous && !rolling && !previous.rolling;
      p.bodyPose={
        tilt:ease?previous.tilt+(tilt-previous.tilt)*blend:tilt,
        x:ease?previous.x+(scaleX-previous.x)*blend:scaleX,
        y:ease?previous.y+(scaleY-previous.y)*blend:scaleY,
        rolling
      };
      p.poseTime=clock;
      ctx.translate(p.x,pivotY);
      ctx.rotate(p.bodyPose.tilt);
      ctx.scale(p.bodyPose.x,p.bodyPose.y);
      ctx.translate(-p.x,-pivotY);
    }
    ctx.globalAlpha=p.grace && Math.floor(clock*12)%2?.55:1;
    const roster = ['Bolt','Ivy','Frost','Melody','Stone','Spark','Shadow'];
    const rosterIndex = roster.indexOf(hero);
    const heroSize=index===0?107:81;
    const heroLift=(heroSize-81)/2;
    const running=p.on && Math.abs(p.vx)>45 && !rolling && !rushing && !attacking && !braking;
    // Draw one opaque pose so the hero keeps a clear silhouette in motion.
    const strideFrame=!reducedMotion && Math.cos(p.gaitPhase||0)<0 ? 2 : 1;
    const visiblePose=running ? strideFrame : pose;
    let heroDrawn=false;
    if(index===3 && rolling){
      ctx.restore();
      ctx.save();
      ctx.translate(p.x,p.y+7);
      if(!reducedMotion) ctx.rotate(p.spinAngle||0);
      ctx.fillStyle='#324775';
      ctx.strokeStyle='#a3eaff';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(0,0,15,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle='#ffd374';
      ctx.beginPath();
      ctx.arc(0,0,9,-1,2.8);
      ctx.stroke();
      heroDrawn=true;
    }
    if(index===14 && p.morphed){
      ctx.restore();
      ctx.save();
      ctx.translate(p.x,p.y);
      if(!reducedMotion) ctx.rotate(p.morphAngle||0);
      ctx.fillStyle='#392655';
      ctx.strokeStyle='#cbaaff';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.arc(0,0,11,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle='#8af0ec';
      ctx.beginPath();
      ctx.moveTo(-7,-5);
      ctx.lineTo(0,2);
      ctx.lineTo(7,-5);
      ctx.stroke();
      heroDrawn=true;
    }
    if(!heroDrawn) heroDrawn=rosterIndex>=0
      ? atlasSprite(heroArt,8,rosterIndex*4+visiblePose,p.x,p.y-17-heroLift,heroSize,heroSize,p.facing<0,4)
      : sprite((light?4:0)+visiblePose,p.x,p.y-15-heroLift,heroSize,heroSize,p.facing<0);
    if(!heroDrawn && poster.naturalWidth) {
      const sw=poster.naturalWidth/2;
      ctx.drawImage(poster,light?sw:0,0,sw,poster.naturalHeight,p.x-24,p.y-35,48,57);
    }
    ctx.restore();
    if(index===4 && rolling){
      ctx.save();
      ctx.translate(p.x,p.y+8);
      ctx.scale(p.facing,1);
      ctx.strokeStyle='#c6ed77';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.ellipse(0,0,23,17,-.32,.15,Math.PI*1.6);
      ctx.stroke();
      ctx.fillStyle='#a4d86b';
      ctx.beginPath();
      ctx.ellipse(-17,-12,8,3,-.65,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    if(index===5 && (reducedMotion?gliding:(p.canopyOpen??0)>0)){
      const opening=reducedMotion?1:p.canopyOpen;
      const rotor=reducedMotion?1:.76+.24*Math.cos(clock*48);
      ctx.save();
      ctx.translate(p.x,p.y-28);
      ctx.scale(rotor*(.25+.75*opening),.45+.55*opening);
      ctx.globalAlpha*=opening;
      ctx.strokeStyle='#e1f9ff';
      ctx.lineWidth=2;
      ctx.fillStyle='#73afd6';
      ctx.beginPath();
      ctx.moveTo(0,1);
      ctx.quadraticCurveTo(-19,-14,-29,-2);
      ctx.quadraticCurveTo(-11,-2,0,8);
      ctx.quadraticCurveTo(11,-2,29,-2);
      ctx.quadraticCurveTo(19,-14,0,1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if(index===23 && (reducedMotion?gliding:(p.canopyOpen??0)>0)){
      const opening=reducedMotion?1:p.canopyOpen;
      const bloom=opening*(2-opening);
      ctx.save();
      ctx.translate(p.x,p.y-25+7*(1-bloom));
      ctx.scale(.18+.82*bloom,.55+.45*bloom);
      ctx.globalAlpha*=opening;
      ctx.strokeStyle='#674460';
      ctx.fillStyle='#ffe08a';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(-29,1);
      ctx.quadraticCurveTo(-19,-16,0,-6);
      ctx.quadraticCurveTo(19,-16,29,1);
      ctx.quadraticCurveTo(15,9,0,3);
      ctx.quadraticCurveTo(-15,9,-29,1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if(index===10 && p.carry){
      const cargoY=p.y-44;
      ctx.save();
      ctx.fillStyle='#ffba73';
      ctx.strokeStyle='#442853';
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.ellipse(p.x,cargoY,13,10,0,0,Math.PI*2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle='#a8fff1';
      ctx.beginPath();
      ctx.ellipse(p.x,cargoY,18,7,-.38,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
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
    if(index===22 && p.pogo && p.vy>0){
      ctx.save();
      ctx.translate(p.x+p.facing*12,p.y+5);
      ctx.strokeStyle='#ffd485';
      ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(-7,0);
      ctx.lineTo(0,0);
      ctx.lineTo(0,25);
      ctx.lineTo(5,25);
      ctx.stroke();
      ctx.restore();
    }
    if(index===12 && p.pogo && p.vy>0){
      // Keep the attack silhouette visible with reduced motion enabled.
      ctx.save();
      ctx.translate(p.x+p.facing*13,p.y+8);
      ctx.fillStyle='#81593a';
      ctx.fillRect(-2,-8,4,19);
      ctx.fillStyle='#83d9ff';
      ctx.strokeStyle='#edfbff';
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(-8,9);
      ctx.lineTo(8,9);
      ctx.lineTo(7,18);
      ctx.lineTo(0,23);
      ctx.lineTo(-7,18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    const swimRush=index===2 && swimming && p.power>.22;
    const skyDash=index===11 && rushing && !p.on;
    if(!reducedMotion && (swimRush || skyDash)){
      const angle=Math.atan2(p.vy,p.vx);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(angle);
      ctx.strokeStyle=swimRush?'#b5fff1':'#b8dcff';
      ctx.lineWidth=2;
      for(let trail=-1;trail<=1;trail++){
        ctx.beginPath();
        ctx.moveTo(-24,trail*8);
        ctx.quadraticCurveTo(-42,trail*10,-58+Math.abs(trail)*9,trail*13);
        ctx.stroke();
      }
      ctx.restore();
    }
    if(index===7 && !reducedMotion && clock-(p.flipTime??-Infinity)<.2){
      ctx.save();
      ctx.translate(p.x,p.y+p.gravity*31);
      ctx.scale(1,-p.gravity);
      ctx.globalAlpha=1-(clock-p.flipTime)/.2;
      ctx.strokeStyle='#e7beff';
      ctx.lineWidth=2;
      for(const y of [-6,2]){
        ctx.beginPath();
        ctx.moveTo(-7,y+4);
        ctx.lineTo(0,y-2);
        ctx.lineTo(7,y+4);
        ctx.stroke();
      }
      ctx.restore();
    }
    if(index===16 && !reducedMotion && p.parryFlash){
      const age=clock-p.parryFlash.time;
      if(age<.2){
        ctx.save();
        ctx.globalAlpha=1-age/.2;
        ctx.strokeStyle='#fff0fa';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.arc(p.parryFlash.x,p.parryFlash.y,8+age*90,0,Math.PI*2);
        ctx.stroke();
        ctx.restore();
      }
    }
    if(index===18 && p.ledgeGrip){
      const {edge,left}=p.ledgeGrip;
      const handX=left?edge.x:edge.x+edge.w;
      ctx.save();
      ctx.strokeStyle='#a96b45';
      ctx.lineWidth=5;
      ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(p.x,p.y-13);
      ctx.lineTo(handX,edge.y+2);
      ctx.stroke();
      ctx.fillStyle='#f4cc94';
      ctx.fillRect(handX-5,edge.y-2,10,6);
      ctx.restore();
    }
    if(index===20 && p.on && Math.abs(p.vx)>runSpeed*.83 && !reducedMotion){
      ctx.save();
      ctx.translate(p.x,p.y+17);
      ctx.scale(Math.sign(p.vx),1);
      ctx.strokeStyle='#ffd87a';
      ctx.lineWidth=2;
      for(let streak=0;streak<3;streak++){
        ctx.beginPath();
        ctx.moveTo(-19,streak*4-8);
        ctx.lineTo(-40-streak*6,streak*4-6);
        ctx.stroke();
      }
      ctx.restore();
    }
    if(index===15 && p.bashPose && !reducedMotion){
      const progress=(clock-p.bashPose.time)/.27;
      if(progress>=0 && progress<1){
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.bashPose.angle);
        ctx.globalAlpha=1-progress;
        ctx.strokeStyle='#a8ffd9';
        ctx.lineWidth=2.5;
        const tail=18+progress*38;
        ctx.beginPath();
        ctx.moveTo(-tail,-10);
        ctx.quadraticCurveTo(-8,-20,18,-7);
        ctx.moveTo(-tail,10);
        ctx.quadraticCurveTo(-8,20,18,7);
        ctx.stroke();
        ctx.restore();
      }
    }
    if(index===0 && p.stompImpact && !reducedMotion){
      const {x,y,time}=p.stompImpact;
      const progress=(clock-time)/.24;
      if(progress>=0 && progress<1){
        ctx.save();
        ctx.globalAlpha=1-progress;
        ctx.strokeStyle='#ffd085';
        ctx.lineWidth=3-progress*2;
        for(const side of [-1,1]){
          ctx.beginPath();
          ctx.moveTo(x+side*(5+progress*22),y-1);
          ctx.lineTo(x+side*(13+progress*32),y-4-progress*7);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    if((index===19 || index===24) && p.shotPose){
      const age=clock-p.shotPose.time;
      if(age>=0 && age<.22){
        const dock=index===19;
        const recoil=reducedMotion ? 0 : Math.max(0,1-age/.11)*(dock?4:7);
        ctx.save();
        ctx.translate(p.x,p.y-9);
        ctx.scale(p.shotPose.facing,1);
        ctx.rotate(p.shotPose.angle);
        ctx.translate(-recoil,0);
        ctx.fillStyle=dock?'#235564':'#65463f';
        ctx.fillRect(10,-5,dock?23:19,10);
        ctx.fillStyle=dock?'#aef2ed':'#ffcb86';
        ctx.fillRect(dock?28:24,-6,5,12);
        if(age<.07 && !reducedMotion){
          ctx.beginPath();
          ctx.moveTo(31,-4);
          ctx.lineTo(dock?46:50,0);
          ctx.lineTo(31,4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }
    if((index===13 || index===17) && p.throwPose && !reducedMotion){
      const progress=(clock-p.throwPose.time)/.17;
      if(progress>=0 && progress<1){
        ctx.save();
        ctx.translate(p.x,p.y-5);
        ctx.scale(p.throwPose.facing,1);
        ctx.rotate(p.throwPose.angle);
        ctx.globalAlpha=1-progress;
        ctx.strokeStyle=index===13?'#ffe2a5':'#ff9c68';
        ctx.lineWidth=3;
        ctx.beginPath();
        ctx.arc(8,0,13+progress*9,-1.25,.65);
        ctx.stroke();
        ctx.restore();
      }
    }
    if(index===10 && p.windRelease && !reducedMotion){
      const {x,y,time}=p.windRelease;
      const progress=(clock-time)/.24;
      if(progress>=0 && progress<1){
        ctx.save();
        ctx.translate(x,y+progress*51);
        ctx.globalAlpha=1-progress;
        ctx.strokeStyle='#a8fff1';
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.ellipse(0,0,18+progress*10,7,-.38,0,Math.PI*2);
        ctx.stroke();
        ctx.fillStyle='#ffba73';
        ctx.beginPath();
        ctx.ellipse(0,0,13-progress*6,10-progress*4,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
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
    drawWindSailCarry();
    drawGravityStatus();
    drawBeatMeter();
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
    if(typeof window.HTMLDialogElement?.prototype.showModal!=='function') return false;
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
          accumulator=0;
          last=performance.now();
          frame=requestAnimationFrame(loop);
        }
      });
    }
    const [title,line]=foundryStory[scene];
    storyDialog.children[0].textContent=title;
    storyDialog.children[1].textContent=line;
    storyDialog.children[2].textContent=scene===6?'Close':'Continue';
    stopMusic();
    storyDialog.showModal();
    playFoundryShot(scene);
    return true;
  }
  function loop(now) {
    updateMusic();
    accumulator += Math.min(.075,Math.max(0,(now-last)/1000));
    while (accumulator >= tick && phase==='playing' && !storyDialog?.open) {
      step(tick);
      accumulator-=tick;
    }
    last=now;
    draw();
    if(phase==='playing' && !storyDialog?.open) frame=requestAnimationFrame(loop);
    if(phase==='won') {stopMusic();clearInput();pauseButton.disabled=true;playVictory();if(index===0)showFoundryStory(6);}
  }
  function startRun(saved) {
    if(sound) unlockAudio();
    stopMusic();
    musicStep=0;
    cancelAnimationFrame(frame);
    clearInput();
    reset();
    syncControllerArt(0);
    if (saved) {
      chapter=saved.stage;
      if(index===3 && Number.isSafeInteger(saved.rings) && saved.rings>=0) rings=saved.rings;
      syncControllerArt(chapter);
      amberSwitch=saved.amberSwitch===true;
      reefCacheOpen=saved.reefCacheOpen===true;
      for(const i of saved.crystals){
        const crystal=crystals[i];
        if(!crystal) continue;
        // Resume at the chapter start with its traversal refills available.
        if(crystal.refill && crystal.x>=stageStarts[chapter] && crystal.x<stageStarts[chapter+1]) continue;
        crystal.taken=true;
      }
      for(const i of saved.enemies) if(enemies[i]) enemies[i].dead=true;
      taken=crystals.filter(c=>c.taken).length;
      player=resetPlayer(stageStarts[chapter]+100);
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
    if(index===0 && !saved && typeof window.HTMLDialogElement?.prototype.showModal==='function'){draw();showFoundryStory(0);}
    else frame=requestAnimationFrame(loop);
  }
  byId('side-start').onclick=()=>startRun(null);
  resumeButton.hidden=!readCheckpoint();
  resumeButton.onclick=()=>{
    const saved=readCheckpoint();
    if(saved) startRun(saved);
    else {
      resumeButton.hidden=true;
      byId('side-start').focus({preventScroll:true});
      status('This checkpoint is no longer available.');
    }
  };
  const codes={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:fourWayStick && index!==3?'up':'jump',KeyW:fourWayStick && index!==3?'up':'jump',ArrowDown:'down',KeyS:'down',Space:'jump',KeyX:'action',KeyC:'technique'};
  addEventListener('keydown',event=>{
    if(storyDialog?.open || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey ||
       event.target?.closest?.('input,select,textarea,[contenteditable]')) return;
    if(event.code==='KeyP' && !event.repeat && (phase==='playing'||phase==='paused')) {event.preventDefault();togglePause();return;}
    const control=codes[event.code];
    if(!control || phase!=='playing') return;
    if(event.code==='Space' && event.target?.closest?.('button,a')) return;
    event.preventDefault();
    if(event.repeat || pressedCodes.has(event.code)) return;
    const alreadyHeld=held(control);
    pressedCodes.add(event.code);
    keys.add(control);
    if(!alreadyHeld) {
      if(control==='jump') jump();
      if(control==='action') action();
      if(control==='technique') useTechnique();
    }
  });
  addEventListener('keyup',event=>{
    if (!pressedCodes.delete(event.code)) return;
    const control=codes[event.code];
    if (!Array.from(pressedCodes).some(code=>codes[code]===control)) keys.delete(control);
    if(control==='action') releaseAction(!event.defaultPrevented);
  });
  document.addEventListener('fullscreenchange',clearInput);
  const resetStick=window.bindTouchJoystick?.(byId('touch-stick'),direction=>{
    for (const axis of ['left','right','up','down']) mobile.delete(axis);
    if(direction) for(const axis of direction.split(' ')) mobile.add(axis);
  },{horizontal:!fourWayStick,diagonal:fourWayStick,deadZone:5,cacheBounds:true});
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
      if(pointer!==null || phase!=='playing' || event.button!==0) return;
      const alreadyHeld=held(control);
      try {button.setPointerCapture(event.pointerId);} catch {return;}
      pointer=event.pointerId;
      event.preventDefault();
      mobile.add(control);
      if(!alreadyHeld) activate();
    };
    for(const event of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(event,e=>{
      if(e.pointerId!==pointer) return;
      pointer=null;
      mobile.delete(control);
      if(control==='action') releaseAction(event==='pointerup' && !e.defaultPrevented);
    });
    button.onclick=event=>{if(event.detail===0 && phase==='playing' && !held(control)){activate();if(control==='action')releaseAction(true);}};
  });
  for (const image of [sprites,poster,backdrop,enemyArt,heroArt,terrainArt,baronArt,propArt,stagePropArt,combatArt,energyFxArt]) image.onload=()=>{if(phase!=='playing') draw();};
  reset();
})();
