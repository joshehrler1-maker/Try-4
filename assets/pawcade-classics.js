(() => {
  const byId = id => document.getElementById(id);
  const field = byId('field'), ctx = field.getContext('2d'), board = byId('board');
  const save = window.PawtopiaSave;
  const games = {
    flame: ['Whisker’s Ember Trail', 'Steer with arrow keys or the direction buttons. Collect embers to grow your trail. Avoid the walls and your own trail.'],
    mystic: ['Luna’s Crystal Cascade', 'Tap touching crystals of the same color. Match a Burst crystal to clear its neighbors or a Prism to clear its color. Special crystals can set each other off.'],
    frost: ['Frost’s Icicle Run', 'Drag across the ice or use the arrow keys and direction buttons. Dodge falling icicles and collect blue shields.']
  };
  const dirs = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const colors = ['#ff9ba8','#d3a7ff','#81ccff','#9de79c','#ffe493'];
  const symbols = ['◆','●','▲','■','✦'];
  const gemNames = ['Rose', 'Amethyst', 'Sapphire', 'Jade', 'Amber'];
  const powers = {
    burst: {name:'Burst', icon:'✷'},
    prism: {name:'Prism', icon:'✧'}
  };
  const relax = document.createElement('button');
  relax.type = 'button';
  relax.textContent = 'Relaxed mode';
  relax.setAttribute('aria-pressed','false');
  byId('start').after(relax);
  let relaxed = false;
  relax.onclick = () => {
    relaxed = !relaxed;
    relax.setAttribute('aria-pressed',String(relaxed));
    start();
  };
  const style = document.createElement('style');
  style.textContent = '#board:not([hidden]){display:grid;gap:clamp(2px,1vw,6px);background:linear-gradient(#120e2ccb,#120e2ccb),url(assets/scenes/purple-mystic-halls.webp) center/cover;padding:clamp(4px,1.5vw,12px);border:1px solid #a17cda;border-radius:14px} #board button{display:grid;place-items:center;position:relative;isolation:isolate;padding:0;min-width:0;min-height:0;aspect-ratio:1;color:#201232;font-weight:900;background:#211740;border-color:#715995;touch-action:manipulation} #board button[data-filled=true]::before{content:"";position:absolute;inset:9%;z-index:-1;clip-path:polygon(49% 0,88% 19%,100% 61%,50% 100%,0 65%,12% 22%);background:conic-gradient(from 17deg at 48% 53%,#fff,var(--gem),#39235e,var(--gem),#fff)} #board button[data-power]:not([data-power=""]){border-color:#fff0b7;box-shadow:inset 0 0 10px #edc2ff} #board button:disabled{opacity:.55} @media(prefers-reduced-motion:no-preference){#board button[data-shift=true]{animation:crystal-settle .22s ease-out}@keyframes crystal-settle{from{transform:translateY(-6px);filter:brightness(1.65)}}}';
  document.head.append(style);
  let mode, phase = 'ready', state, score = 0, previous = 0, elapsed = 0;
  const same = (a,b) => a[0] === b[0] && a[1] === b[1];
  function ember() {
    const free = Array.from({length:256},(_,i)=>[i%16,Math.floor(i/16)]).filter(p=>!state.trail.some(q=>same(p,q)));
    return free[Math.floor(Math.random()*free.length)];
  }
  function hud() {
    const progress = save.read();
    if(mode==='mystic' && relaxed){
      byId('hud').textContent = 'Relaxed mode · ' + score + ' points';
      return;
    }
    byId('hud').textContent = 'Score ' + score + ' · Best ' + (progress.arcadeBests['pawcade-'+mode] || 0) + ' · ' + progress.coins + ' Paw Coins';
  }
  function finish(message) {
    phase = 'ended';
    byId('pause').disabled = true;
    byId('status').textContent = message;
    if(mode==='mystic' && relaxed)return;
    const key = 'pawcade-'+mode, finalScore = score;
    save.update(progress => {
      const record = progress.arcadeBests[key] || 0;
      if (finalScore <= record) return '';
      progress.arcadeBests[key] = finalScore;
      progress.coins += finalScore-record;
      return '+' + (finalScore-record) + ' Paw Coins';
    }).then(result => {
      hud();
      if (result && phase === 'ended' && 'pawcade-'+mode === key) byId('status').textContent = message + ' · ' + result;
    });
  }
  function group(index) {
    const kind = state.cells[index];
    if (kind < 0) return [];
    const seen = new Set([index]), queue = [index];
    for (const i of queue) {
      const neighbors = [i-8,i+8];
      if(i%8) neighbors.push(i-1);
      if(i%8<7) neighbors.push(i+1);
      for (const j of neighbors) if (!seen.has(j) && state.cells[j] === kind) { seen.add(j); queue.push(j); }
    }
    return queue;
  }
  function clear(index) {
    if (phase !== 'playing') return;
    const cells = group(index);
    if (cells.length < 2) { byId('status').textContent = 'Choose two or more touching crystals.'; return; }
    const cleared = new Set(cells);
    let triggered = 0;
    for(const i of cleared){
      const power = state.specials[i];
      if(!power)continue;
      triggered++;
      const x=i%8, y=Math.floor(i/8);
      state.cells.forEach((value,j)=>{
        const nearby=Math.abs(j%8-x)<=1 && Math.abs(Math.floor(j/8)-y)<=1;
        if(value>=0 && (power==='prism'?value===state.cells[i]:nearby))cleared.add(j);
      });
    }
    const before=state.cells.slice(), previousPowers=state.specials;
    const columns=Array.from({length:8},(_,x)=>before
      .map((value,i)=>({value,i}))
      .filter(({value,i})=>i%8===x && value>=0 && !cleared.has(i)))
      .filter(column=>column.length);
    state.cells=Array(64).fill(-1);
    state.specials=Array(64).fill('');
    const shifted=new Set();
    columns.forEach((column,x)=>column.forEach(({value,i},row)=>{
      const dest=(8-column.length+row)*8+x;
      state.cells[dest]=value;
      state.specials[dest]=previousPowers[i];
      if(dest!==i)shifted.add(dest);
    }));
    score += Math.floor(cleared.size*cleared.size/4);
    byId('status').textContent = cleared.size+' crystals cleared'+(triggered?' · '+triggered+' power'+(triggered===1?'':'s')+' triggered':'');
    drawBoard(shifted);hud();
    if(!state.cells.some((v,i)=>v>=0&&group(i).length>1)){
      const message=state.cells.every(v=>v<0)?'Board cleared!':'No groups left.';
      finish(relaxed?message+' Choose New board to keep playing.':message);
    }
  }
  function drawBoard(shifted=new Set()) {
    for (const [i,b] of [...board.children].entries()) {
      const value=state.cells[i], power=powers[state.specials[i]];
      b.disabled=value<0;
      b.textContent=power?.icon || symbols[value] || '';
      b.dataset.power=state.specials[i];
      b.dataset.filled=String(value>=0);
      b.dataset.shift=String(shifted.has(i));
      b.style.setProperty('--gem',colors[value] || '');
      b.setAttribute('aria-label',(gemNames[value] || 'Empty')+(power?' '+power.name:'')+' row '+(Math.floor(i/8)+1)+' column '+(i%8+1));
    }
  }
  function stepFlame() {
    state.direction = state.next;
    const [x,y]=state.trail[0], [dx,dy]=state.direction, next=[x+dx,y+dy];
    const eats = same(next,state.ember);
    if (next.some(v=>v<0||v>=16)||state.trail.slice(0,eats?state.trail.length:-1).some(p=>same(p,next))) { finish('Trail ended.'); return; }
    state.trail.unshift(next);
    if (!eats) state.trail.pop();
    else { score++; state.ember=ember(); hud(); if(!state.ember) finish('Cave cleared!'); }
  }
  function stepFrost(dt) {
    state.seconds += dt;
    state.spawn -= dt;
    if (state.spawn <= 0) {
      state.spawn = Math.max(.23,.85-state.seconds*.012);
      state.drops.push({x:16+Math.random()*368,y:-20,shield:Math.random()<.09});
    }
    for (const drop of state.drops) {
      drop.y += dt*(145+Math.min(170,state.seconds*4));
      if (Math.hypot(drop.x-state.x,drop.y-state.y)<21) {
        drop.y = 450;
        if (drop.shield) state.protected = true;
        else if (state.protected) state.protected = false;
        else { finish('An icicle caught Frost.'); break; }
      }
    }
    state.drops = state.drops.filter(d=>d.y<430);
    const next = Math.floor(state.seconds/3);
    if (next !== score) { score = next; hud(); }
  }
  function orb(x,y,r,color) {
    const surface=ctx.createRadialGradient(x-r*.35,y-r*.4,1,x,y,r);
    surface.addColorStop(0,'#fff7dd');surface.addColorStop(.48,color);surface.addColorStop(1,'#311b50');
    ctx.save();ctx.shadowColor=color;ctx.shadowBlur=r*.7;
    ctx.fillStyle=surface;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,400,400);
    if (mode === 'flame') {
      if(state.ember) orb(state.ember[0]*25+12.5,state.ember[1]*25+12.5,8,'#fff09a');
      state.trail.forEach(([x,y],i)=>orb(x*25+12.5,y*25+12.5,i===0?11:8,i===0?'#fff1c1':'#ff7852'));
    } else if (mode === 'frost') {
      for (const d of state.drops) {
        if (d.shield) { orb(d.x,d.y,10,'#79fbff'); continue; }
        const ice=ctx.createLinearGradient(d.x-9,d.y-11,d.x+10,d.y+12);
        ice.addColorStop(0,'#e4fdff');ice.addColorStop(.45,'#80c9ff');ice.addColorStop(1,'#4252a5');
        ctx.fillStyle=ice;ctx.beginPath();ctx.moveTo(d.x-8,d.y-12);ctx.lineTo(d.x+8,d.y-12);ctx.lineTo(d.x,d.y+16);ctx.fill();
        ctx.fillStyle='#ddfaff99';ctx.beginPath();ctx.moveTo(d.x-3,d.y-12);ctx.lineTo(d.x+2,d.y-12);ctx.lineTo(d.x,d.y+14);ctx.fill();
      }
      orb(state.x,state.y,13,state.protected?'#8afce9':'#ffdf83');
    }
  }
  function frame(time) {
    const dt = Math.min(.05,Math.max(0,(time-previous)/1000));
    previous=time;
    if (phase==='playing' && mode==='flame') {
      elapsed+=dt;
      if(elapsed>=Math.max(.075,.20-score*.004)){elapsed=0;stepFlame();}
    }
    if(phase==='playing' && mode==='frost')stepFrost(dt);
    if(phase==='playing' && mode!=='mystic')draw();
    requestAnimationFrame(frame);
  }
  function select(game) {
    mode=game;phase='ready';score=0;
    relax.hidden=mode!=='mystic';
    byId('start').textContent='Start game';
    byId('pause').textContent='Pause';
    const [title,rules]=games[mode];
    byId('title').textContent=title;byId('rules').textContent=rules;
    byId('cover').src='assets/scenes/pawcade-'+mode+'.webp';
    field.style.backgroundImage = 'linear-gradient(#101632b8,#101632bd), url("assets/scenes/' + (mode === 'flame' ? 'red-flame-caves' : 'cyan-frost-caverns') + '.webp")';
    field.style.backgroundPosition = 'center';
    field.style.backgroundSize = 'cover';
    field.hidden=mode==='mystic';board.hidden=mode!=='mystic';byId('directions').hidden=mode==='mystic';byId('mystic-controls').hidden=mode!=='mystic';
    byId('status').textContent='Ready to play.';byId('pause').disabled=true;
    board.replaceChildren();ctx.clearRect(0,0,400,400);
    document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===mode)));
    hud();
  }
  function start() {
    phase='playing';score=0;elapsed=0;
    byId('pause').disabled=false;byId('pause').textContent='Pause';
    byId('status').textContent='Game started.';
    if(mode==='flame'){state={trail:[[6,8],[5,8],[4,8]],direction:dirs.right,next:dirs.right};state.ember=ember();}
    if(mode==='frost')state={x:200,y:330,drops:[],spawn:.3,seconds:0,protected:false};
    if(mode==='mystic'){
      byId('start').textContent='New board';
      state={cells:Array.from({length:64},()=>Math.floor(Math.random()*5)),specials:Array(64).fill('')};
      const positions=Array.from({length:62},(_,i)=>i+2);
      for(const power of ['burst','prism','burst','prism']){
        const [index]=positions.splice(Math.floor(Math.random()*positions.length),1);
        state.specials[index]=power;
      }
      state.specials[0]='burst';
      state.cells[1]=state.cells[0];board.replaceChildren();
      for(let i=0;i<64;i++){const b=document.createElement('button');b.type='button';b.onclick=()=>clear(i);board.append(b);}
      drawBoard();
    }
    hud();
  }
  function move(dir) {
    if(phase!=='playing'||mode==='mystic')return;
    const [x,y]=dirs[dir];
    if(mode==='flame'){
      if(x!==-state.direction[0]||y!==-state.direction[1])state.next=dirs[dir];
    }else{
      state.x=Math.max(13,Math.min(387,state.x+x*23));state.y=Math.max(13,Math.min(387,state.y+y*23));
    }
  }
  function drag(e) {
    if(mode!=='frost'||phase!=='playing')return;
    const box=field.getBoundingClientRect();
    state.x=Math.max(13,Math.min(387,(e.clientX-box.left)*400/box.width));
    state.y=Math.max(13,Math.min(387,(e.clientY-box.top)*400/box.height));
  }
  field.onpointerdown=e=>{field.setPointerCapture(e.pointerId);drag(e);};
  field.onpointermove=e=>{if(field.hasPointerCapture(e.pointerId))drag(e);};
  addEventListener('keydown',e=>{
    const dir=e.key.startsWith('Arrow')&&e.key.slice(5).toLowerCase();
    if(dirs[dir]&&phase==='playing'&&mode!=='mystic'){e.preventDefault();move(dir);}
  });
  addEventListener('storage',hud);
  document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>select(b.dataset.game));
  bindTileJoystick(byId('mystic-stick'),board,()=>8,byId('select-gem'));
  bindTouchJoystick(byId('touch-stick'), dir => { if (dir) move(dir); }, {repeat: 140});
  byId('start').onclick=start;
  byId('pause').onclick=()=>{
    phase=phase==='paused'?'playing':'paused';
    byId('pause').textContent=phase==='paused'?'Resume':'Pause';
    byId('status').textContent=phase==='paused'?'Paused.':'Resumed.';
  };
  const requested = new URLSearchParams(location.search).get('game');
  select(Object.hasOwn(games, requested) ? requested : 'flame');
  requestAnimationFrame(frame);
})();
