(() => {
  const byId = id => document.getElementById(id);
  const field = byId('field'), ctx = field.getContext('2d'), board = byId('board');
  const save = window.PawtopiaSave;
  const games = {
    flame: ['Whisker’s Ember Trail', 'Steer with arrow keys or the direction buttons. Collect embers to grow your trail. Avoid the walls and your own trail.'],
    mystic: ['Luna’s Crystal Cascade', 'Tap a group of at least two matching adjacent crystals. Larger groups score more. Crystals fall and empty columns slide left.'],
    frost: ['Frost’s Icicle Run', 'Drag across the ice or use the arrow keys and direction buttons. Dodge falling icicles and collect blue shields.']
  };
  const dirs = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
  const colors = ['#ff9ba8','#d3a7ff','#81ccff','#9de79c','#ffe493'];
  const symbols = ['◆','●','▲','■','✦'];
  let mode, phase = 'ready', state, score = 0, previous = 0, elapsed = 0;
  const same = (a,b) => a[0] === b[0] && a[1] === b[1];
  function ember() {
    const free = Array.from({length:256},(_,i)=>[i%16,Math.floor(i/16)]).filter(p=>!state.trail.some(q=>same(p,q)));
    return free[Math.floor(Math.random()*free.length)];
  }
  function hud() {
    const progress = save.read();
    byId('hud').textContent = 'Score ' + score + ' · Best ' + (progress.arcadeBests['pawcade-'+mode] || 0) + ' · ' + progress.coins + ' Paw Coins';
  }
  function finish(message) {
    phase = 'ended';
    byId('pause').disabled = true;
    byId('status').textContent = message;
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
    cells.forEach(i => state.cells[i] = -1);
    const columns = Array.from({length:8},(_,x)=>state.cells.filter((v,i)=>i%8===x&&v>=0)).filter(c=>c.length);
    state.cells = Array.from({length:64},(_,i)=> {
      const column = columns[i%8] || [];
      return column[Math.floor(i/8)+column.length-8] ?? -1;
    });
    score += Math.floor(cells.length*cells.length/4);
    byId('status').textContent = cells.length + ' crystals cleared';
    drawBoard(); hud();
    if (!state.cells.some((v,i)=>v>=0&&group(i).length>1)) finish(state.cells.every(v=>v<0) ? 'Board cleared!' : 'No groups left.');
  }
  function drawBoard() {
    for (const [i,b] of [...board.children].entries()) {
      const value = state.cells[i];
      b.disabled = value<0;
      b.textContent = symbols[value] || '';
      b.style.setProperty('--gem',colors[value] || '');
      b.setAttribute('aria-label',(symbols[value] || 'Empty')+' row '+(Math.floor(i/8)+1)+' column '+(i%8+1));
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
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  function draw() {
    ctx.clearRect(0,0,400,400);
    if (mode === 'flame') {
      if(state.ember) orb(state.ember[0]*25+12.5,state.ember[1]*25+12.5,8,'#fff09a');
      state.trail.forEach(([x,y],i)=>orb(x*25+12.5,y*25+12.5,i===0?11:8,i===0?'#fff1c1':'#ff7852'));
    } else if (mode === 'frost') {
      for (const d of state.drops) {
        if (d.shield) { orb(d.x,d.y,10,'#79fbff'); continue; }
        ctx.fillStyle='#b1dbff';ctx.beginPath();ctx.moveTo(d.x-8,d.y-12);ctx.lineTo(d.x+8,d.y-12);ctx.lineTo(d.x,d.y+16);ctx.fill();
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
    const [title,rules]=games[mode];
    byId('title').textContent=title;byId('rules').textContent=rules;
    byId('cover').src='assets/scenes/pawcade-'+mode+'.webp';
    field.style.backgroundImage = 'linear-gradient(#101632b8,#101632bd), url("assets/scenes/' + (mode === 'flame' ? 'red-flame-caves' : 'cyan-frost-caverns') + '.webp")';
    field.style.backgroundPosition = 'center';
    field.style.backgroundSize = 'cover';
    field.hidden=mode==='mystic';board.hidden=mode!=='mystic';byId('directions').hidden=mode==='mystic';
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
      state={cells:Array.from({length:64},()=>Math.floor(Math.random()*5))};
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
  document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>move(b.dataset.dir));
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
