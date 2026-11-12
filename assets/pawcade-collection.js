(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const save = window.PawtopiaSave;
  const types = [
    { name: 'Target hunt', rules: 'Find the glowing target before it moves. Avoid the red decoy.', titles: ['Whisker’s Ember Rescue','Spark’s Firefly Watch','Frost’s Snowflake Catch'] },
    { name: 'Sequence memory', rules: 'Watch the tiles light up, then repeat their order.', titles: ['Luna’s Moon Runes','Melody’s Crystal Chorus','Bolt’s Control Panel'] },
    { name: 'Matching pairs', rules: 'Reveal two tiles at a time and find every matching pair.', titles: ['Ivy’s Seed Vault','Stone’s Fossil Pairs','Luna’s Starlight Cards'] },
    { name: 'Maze', rules: 'Move to adjacent tiles and find the goal. The dark tiles are walls.', titles: ['Shadow’s Lantern Maze','Whisker’s Rooftop Route','Blaze’s Lava Labyrinth'] },
    { name: 'Lights puzzle', rules: 'Tap a tile to flip it and its neighbors. Turn every light off.', titles: ['Bolt’s Power Grid','Melody’s Stage Lights','Spark’s Beacon Switches'] },
    { name: 'Sorting', rules: 'Send each symbol to its matching crate. Correct sorts score points.', titles: ['Ivy’s Garden Market','Stone’s Quarry Sort','Frost’s Ice Parcel Post'] },
    { name: 'Reaction', rules: 'Wait for GO, then tap the launch pad. An early tap costs a point.', titles: ['Blaze’s Launch Drill','Luna’s Moon Dash','Whisker’s Cape Sprint'] },
    { name: 'Number trail', rules: 'Tap the tiles in ascending order. Clear as many boards as you can.', titles: ['Spark’s Trail Markers','Bolt’s Circuit Count','Stone’s Quarry Orders'] },
    { name: 'Safe crossing', rules: 'Move one tile at a time. The red patrols shift after each move. Reach the goal without touching them.', titles: ['Shadow’s Patrol Crossing','Frost’s Thin Ice','Blaze’s Ember Crossing'] },
    { name: 'Odd tile', rules: 'Find the one symbol that differs from all the others.', titles: ['Melody’s Missing Note','Ivy’s Leaf Detective','Shadow’s Decoy Hunt'] }
  ];
  const art = {
    Whisker:'red-flame-caves', Luna:'purple-mystic-halls', Bolt:'blue-tech-mines', Ivy:'green-life-groves',
    Blaze:'orange-volcanic-depths', Frost:'cyan-frost-caverns', Shadow:'indigo-shadow-tunnels',
    Spark:'yellow-light-ruins', Melody:'pink-harmony-grotto', Stone:'brown-earth-quarries'
  };
  const games = types.flatMap((type, kind) => type.titles.map((title, variant) => ({
    title, kind, variant, type, art: art[title.split('’')[0]], id: kind + '-' + variant
  })));
  const directory = Boolean(byId('collection-catalog'));
  function catalog() {
    const query=byId(directory ? 'collection-search' : 'search').value.trim().toLowerCase();
    const filter=byId(directory ? 'collection-filter' : 'filter').value;
    const found=games.filter(item => (!filter || item.type.name===filter) && item.title.toLowerCase().includes(query));
    byId(directory ? 'collection-results' : 'results').textContent=found.length + ' of 30 games';
    byId(directory ? 'collection-catalog' : 'catalog').replaceChildren(...found.map(item=>{
      const button=document.createElement(directory ? 'a' : 'button');
      if (directory) button.href='pawcade-collection.html?game=' + item.id;
      else button.type='button';
      button.className='game-card';
      const img=document.createElement('img');
      img.src='assets/scenes/' + item.art + '.webp';
      img.alt='';
      img.loading='lazy';
      const title=document.createElement('strong');
      title.textContent=item.title;
      const category=document.createElement('small');
      category.textContent=item.type.name;
      button.append(img,title,category);
      if (!directory) button.addEventListener('click',()=>select(item,button));
      return button;
    }));
  }
  function mountCatalog() {
    types.forEach(type=>byId(directory ? 'collection-filter' : 'filter').add(new Option(type.name,type.name)));
    byId(directory ? 'collection-search' : 'search').addEventListener('input',catalog);
    byId(directory ? 'collection-filter' : 'filter').addEventListener('change',catalog);
    catalog();
  }
  if (directory) {
    mountCatalog();
    return;
  }
  const marks = [['◆','✦','●','▲','■','✚','♥','☾'],['☀','☁','❄','☂','⚡','✿','♬','★'],['1','2','3','4','5','6','7','8']];
  const board = byId('board');
  const cabinet = byId('cabinet');
  const pick = n => Math.floor(Math.random() * n);
  let game, state, clock, serial = 0;
  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = pick(i + 1);
      [items[i],items[j]] = [items[j],items[i]];
    }
    return items;
  }
  const range = n => Array.from({length:n}, (_, i) => i);
  function cells(n, width) {
    board.style.setProperty('--columns', width);
    board.classList.toggle('single-pad', n === 1);
    board.replaceChildren(...range(n).map(index => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.dataset.tile = index;
      tile.setAttribute('aria-label', 'Tile ' + (index + 1));
      return tile;
    }));
  }
  function tile(i, label, status = '') {
    const button = board.children[i];
    if (!button) return;
    button.textContent = label;
    button.dataset.state = status;
    button.setAttribute('aria-label', label ? 'Tile ' + (i + 1) + ': ' + label : 'Tile ' + (i + 1));
  }
  function later(fn, ms) {
    const id = serial;
    setTimeout(() => { if (id === serial && state?.running) fn(); }, ms);
  }
  function update() {
    byId('score').textContent = state ? 'Score ' + state.score + ' · ' + state.left + 's' : '';
    const best = save.read().arcadeBests['collection-' + game.id] || 0;
    byId('best').textContent = 'Best ' + best;
  }
  function stop() {
    serial++;
    clearInterval(clock);
    if (state) state.running = false;
  }
  async function finish(message) {
    const id = 'collection-' + game.id;
    const score = state.score;
    const ending = serial + 1;
    stop();
    byId('message').textContent = message + ' Final score: ' + score + '.';
    await save.update(progress => {
      if (score <= (progress.arcadeBests[id] || 0)) return '';
      progress.arcadeBests[id] = score;
      return 'Personal best saved.';
    });
    if (serial === ending) update();
  }
  function point(amount = 1) {
    state.score = Math.max(0, state.score + amount);
    update();
  }
  function adjacent(i, width, count) {
    return [i-width, i+width, i%width ? i-1 : -1, i%width<width-1 ? i+1 : -1].filter(j => j >= 0 && j < count);
  }
  function drawMaze() {
    for (let i=0;i<state.count;i++) {
      if (i===state.player) tile(i,'●','highlight');
      else if (i===state.count-1) tile(i,'★','success');
      else if (state.walls.has(i) || state.patrols?.includes(i)) tile(i,'×','danger');
      else tile(i,'');
    }
  }
  function prepareMaze(crossing) {
    const width = 5 + game.variant;
    const count = width * width;
    const safe = new Set([...range(width), ...range(width).map(row => row*width+width-1)]);
    Object.assign(state,{ width,count,player:0,walls:new Set(),patrols:null, step:0 });
    if (crossing) {
      state.patrols = range(width-2).map(i => (i+1)*width + pick(width));
    } else {
      state.walls = new Set(shuffle(range(count).filter(i => !safe.has(i))).slice(0, width + game.variant*2));
    }
    cells(count,width);
    drawMaze();
  }
  function target() {
    const previous = state.target;
    state.target = pick(state.count-1);
    if (state.target >= previous) state.target++;
    state.decoy = (state.target + 1 + pick(state.count-1)) % state.count;
    range(state.count).forEach(i => tile(i, i===state.target ? '✦' : i===state.decoy ? '×' : '', i===state.target ? 'highlight' : i===state.decoy ? 'danger' : ''));
  }
  function sequence() {
    state.locked = true;
    state.cursor = 0;
    const speed = 530 - game.variant*75;
    state.sequence.forEach((index,i) => {
      later(() => tile(index,'✦','highlight'), i*speed + 120);
      later(() => tile(index,''), i*speed + speed - 30);
    });
    later(() => { state.locked = false; byId('message').textContent = 'Repeat the sequence.'; }, state.sequence.length*speed);
  }
  function flip(i) {
    for (const j of [i,...adjacent(i,state.width,state.count)]) {
      state.lights[j] = !state.lights[j];
      tile(j,state.lights[j] ? '✦' : '',state.lights[j] ? 'highlight' : '');
    }
  }
  function sortPrompt() {
    state.target = pick(state.count);
    byId('message').textContent = 'Sort ' + marks[game.variant][state.target] + ' into its crate.';
  }
  function reaction() {
    state.go = false;
    const attempt = ++state.attempt;
    tile(0,'WAIT','danger');
    later(() => { if (attempt === state.attempt) {state.go = true; tile(0,'GO','highlight');} }, 600 + pick(1500 + game.variant*450));
  }
  function numbers() {
    state.order = shuffle(range(state.count));
    state.cursor = 0;
    state.order.forEach((value,index) => tile(index,String(value+1)));
  }
  function odd() {
    state.target = pick(state.count);
    const symbols = marks[game.variant];
    const value = pick(symbols.length);
    const different = (value+1+pick(symbols.length-1))%symbols.length;
    range(state.count).forEach(i => tile(i,symbols[i===state.target ? different : value]));
  }
  function start() {
    stop();
    state = { score:0,left:30,running:true };
    const v = game.variant;
    byId('message').textContent = '';
    switch (game.kind) {
      case 0:
        state.count = (4+v)**2; state.target = 0; cells(state.count,4+v); target(); break;
      case 1:
        cells(9,3); state.sequence = range(2+v).map(() => pick(9)); sequence(); break;
      case 2: {
        const pairs = 4+v*2;
        state.deck = shuffle([...range(pairs),...range(pairs)]);
        state.matched = new Set(); state.first = null;
        cells(pairs*2,4); break;
      }
      case 3: prepareMaze(false); break;
      case 4:
        state.width=3+v; state.count=state.width**2; state.lights=range(state.count).map(() => false);
        cells(state.count,state.width);
        shuffle(range(state.count)).slice(0,3+v*2).forEach(flip);
        if (!state.lights.some(Boolean)) flip(0);
        break;
      case 5:
        state.count=3+v; cells(state.count,state.count);
        range(state.count).forEach(i=>tile(i,marks[v][i])); sortPrompt(); break;
      case 6: state.attempt=0; cells(1,1); reaction(); break;
      case 7: state.count=9+v*3; cells(state.count,3+v); numbers(); break;
      case 8: prepareMaze(true); break;
      case 9: state.count=(4+v)**2; cells(state.count,4+v); odd(); break;
    }
    update();
    clock=setInterval(() => {
      state.left--;
      update();
      if (!state.left) finish('Time’s up.');
      else if (game.kind===0 && state.left % (3-v)===0) target();
    },1000);
  }
  function play(i) {
    if (!state?.running || state.locked) return;
    const v = game.variant;
    switch (game.kind) {
      case 0:
        if (i===state.target) { point(); target(); }
        else if (i===state.decoy) point(-1);
        break;
      case 1:
        if (i!==state.sequence[state.cursor]) {
          point(-1); byId('message').textContent='Watch the sequence again.'; sequence(); break;
        }
        state.cursor++;
        if (state.cursor===state.sequence.length) {
          point(state.sequence.length); state.sequence.push(pick(9)); sequence();
        }
        break;
      case 2: {
        if (i===state.first || state.matched.has(i)) break;
        const first=state.first;
        tile(i,marks[v][state.deck[i]],'highlight');
        if (first===null) {state.first=i;break;}
        state.first=null;
        if (state.deck[i]===state.deck[first]) {
          for (const index of [first,i]) {state.matched.add(index);tile(index,marks[v][state.deck[index]],'success');}
          point(2);
          if (state.matched.size===state.deck.length) finish('All pairs found!');
        } else {
          state.locked=true;
          later(()=>{tile(first,'');tile(i,'');state.locked=false;},650);
        }
        break;
      }
      case 3:
      case 8:
        if (!adjacent(state.player,state.width,state.count).includes(i) || state.walls.has(i)) break;
        if (state.patrols?.includes(i)) { point(-1); state.player=0; drawMaze();break; }
        state.player=i;
        if (i===state.count-1) {point(state.width*2);finish('Goal reached!');break;}
        if (state.patrols) {
          state.patrols=state.patrols.map(j=>Math.floor(j/state.width)*state.width+(j%state.width+1+v)%state.width);
          if (state.patrols.includes(i)) {point(-1);state.player=0;}
        }
        drawMaze();
        break;
      case 4:
        flip(i);
        if (!state.lights.some(Boolean)) {point(state.count);finish('All lights cleared!');}
        break;
      case 5: point(i===state.target ? 1 : -1);sortPrompt();break;
      case 6: point(state.go ? 1 : -1);reaction();break;
      case 7:
        if (state.order[i]!==state.cursor) {point(-1);break;}
        tile(i,'✓','success');state.cursor++;point();
        if (state.cursor===state.count) numbers();
        break;
      case 9: point(i===state.target ? 1 : -1);odd();break;
    }
  }
  let lastCard;
  function select(selected, card) {
    stop();
    state=null;
    game=selected;
    lastCard=card;
    board.replaceChildren();
    cabinet.style.setProperty('--cabinet-art','url(assets/scenes/' + game.art + '.webp)');
    byId('cabinet-name').textContent=game.title;
    byId('rules').textContent=game.type.rules;
    byId('message').textContent='';
    cabinet.hidden=false;
    update();
    byId('cabinet-name').focus();
  }
  byId('back').addEventListener('click',()=>{stop();cabinet.hidden=true;lastCard?.focus();});
  byId('start').addEventListener('click',start);
  board.addEventListener('click', event => {
    const button=event.target.closest('[data-tile]');
    if (button) play(Number(button.dataset.tile));
  });
  mountCatalog();
  const requested = games.find(item => item.id === new URLSearchParams(location.search).get('game'));
  if (requested) select(requested, byId('catalog').children[games.indexOf(requested)]);
})();
