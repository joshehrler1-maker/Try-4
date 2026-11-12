(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const save = window.PawtopiaSave;
  const types = [
    [3, 'Maze', 'Move to adjacent tiles and find the goal. The dark tiles are walls.', 'Shadow’s Lantern Maze'],
    [5, 'Sorting', 'Send each symbol to its matching crate. Correct sorts score points.', 'Ivy’s Garden Market'],
    [6, 'Reaction', 'Wait for GO, then tap the launch pad. An early tap costs a point.', 'Blaze’s Launch Drill'],
    [8, 'Safe crossing', 'Move one tile at a time. Red patrols shift after each move. Reach the goal without touching them.', 'Shadow’s Patrol Crossing'],
    [9, 'Odd tile', 'Find the one symbol that differs from all the others.', 'Melody’s Missing Note']
  ];
  const legacyArcade = { 0: 'defense', 1: 'crystal', 2: 'forge', 4: 'beacons', 7: 'courier' };
  const art = {
    Ivy: 'green-life-groves', Blaze: 'orange-volcanic-depths',
    Shadow: 'indigo-shadow-tunnels', Melody: 'pink-harmony-grotto'
  };
  const games = types.map(([kind, name, rules, title]) => ({
    title, kind, type: { name, rules }, art: kind === 8 ? 'town-arena' : art[title.split('’')[0]], id: kind + '-0'
  }));
  const directory = Boolean(byId('collection-catalog'));
  const roomGames = [
    ['Lantern Festival','Action','arcade','?game=lantern#game-panel','lantern'],
    ['Crystal Echo','Puzzles','pawcade-mystic','?game=crystal#game-panel','crystal'],
    ['Iron Fang Defense','Action','pawcade-flame','?game=defense#game-panel','defense'],
    ['Town Square Courier','Action','pawtopia','?game=courier#game-panel','courier'],
    ['Pawgrove Forge','Puzzles','green-life-groves','?game=forge#game-panel','forge'],
    ['Catacombs Beacons','Puzzles','catacombs','?game=beacons#game-panel','beacons'],
    ['Crystal Spring','Action','pawcade-mystic','crystal-spring.html','paw-crystal-best'],
    ['Frost’s Snowball Factory','Action','pawcade-frost','frost-snowball-factory.html','pawcade-snowball-factory'],
    ['Whisker’s Plushie Launch','Action','pawcade-flame','whisker-plushie-launch.html','pawcade-plush-launch'],
    ['Bolt’s Toy Workshop','Puzzles','blue-tech-mines','bolt-toy-workshop.html','pawcade-bolt-workshop'],
    ['Crystal Catacombs 3D','Adventure','catacombs','super-paw-3d.html'],
    ['Timekeepers of Pawtopia','Adventure','pawtopia','pawtopia-timekeepers.html'],
    ['Pawgrove: The Lantern Curse','Adventure','green-life-groves','pawgrove.html'],
    ['Hero Choice Challenge','Quiz','pawtopia','index.html#challenge']
  ].map(([title,type,art,href,key]) => ({title,type:{name:type},art,href,key,id:href}));
  const entries = directory ? [...roomGames, ...games] : games;
  const hrefFor = item => item.href || 'pawcade-collection.html?game=' + item.id;
  function scoreFor(item, bests) {
    if (item.href && !item.key) return 0;
    const key = item.key || 'collection-' + item.id;
    try {
      return Math.max(bests[key] || 0, Number(localStorage.getItem(key)) || 0,
        Number(localStorage.getItem('pawtopia-arcade-' + key)) || 0);
    } catch {
      return bests[key] || 0;
    }
  }
  function roomPanels() {
    const progress = save.read();
    const scores = entries.map(item => ({item, score:scoreFor(item, progress.arcadeBests)}))
      .filter(entry => entry.score > 0).sort((a,b) => b.score-a.score || a.item.title.localeCompare(b.item.title));
    const rows = scores.map(({item,score},index) => {
      const row = document.createElement('tr');
      const rank = document.createElement('td');
      const name = document.createElement('td');
      const value = document.createElement('td');
      const link = document.createElement('a');
      link.href = hrefFor(item);
      link.textContent = item.title;
      rank.textContent = index+1;
      value.textContent = score.toLocaleString();
      name.append(link);
      row.append(rank,name,value);
      return row;
    });
    if (!rows.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'Play a scored game to set your first record.';
      row.append(cell);
      rows.push(row);
    }
    byId('room-score-rows').replaceChildren(...rows);
    const favourites = entries.filter(item => (progress.arcadeFavourites || []).includes(item.id));
    const links = favourites.map(item => {
      const line = document.createElement('li');
      const link = document.createElement('a');
      link.href = hrefFor(item);
      link.textContent = item.title;
      line.append(link);
      return line;
    });
    if (!links.length) {
      const line = document.createElement('li');
      line.textContent = 'Use the star on a game card to save it here.';
      links.push(line);
    }
    byId('room-favourites').replaceChildren(...links);
  }
  function catalog() {
    const query=byId(directory ? 'collection-search' : 'search').value.trim().toLowerCase();
    const filter=byId(directory ? 'collection-filter' : 'filter').value;
    const found=entries.filter(item => (!filter || item.type.name===filter) && item.title.toLowerCase().includes(query));
    byId(directory ? 'collection-results' : 'results').textContent=found.length + ' of ' + entries.length + ' games';
    byId(directory ? 'collection-catalog' : 'catalog').replaceChildren(...found.map(item=>{
      const button=document.createElement(directory ? 'a' : 'button');
      if (directory) button.href=hrefFor(item);
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
      if (!directory) {
        button.addEventListener('click',()=>select(item,button));
        return button;
      }
      const card = document.createElement('article');
      card.className = 'room-game';
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'room-star';
      const active = (save.read().arcadeFavourites || []).includes(item.id);
      star.textContent = active ? '★' : '☆';
      star.setAttribute('aria-label', 'Favourite ' + item.title);
      star.setAttribute('aria-pressed', String(active));
      star.addEventListener('click', async () => {
        await save.update(progress => {
          const favourites = new Set(progress.arcadeFavourites || []);
          if (favourites.has(item.id)) favourites.delete(item.id);
          else favourites.add(item.id);
          progress.arcadeFavourites = [...favourites];
          return 'Favourites updated.';
        });
        const selected = (save.read().arcadeFavourites || []).includes(item.id);
        star.textContent = selected ? '★' : '☆';
        star.setAttribute('aria-pressed', String(selected));
        roomPanels();
      });
      card.append(button,star);
      return card;
    }));
  }
  function mountCatalog() {
    for (const name of new Set(entries.map(item => item.type.name))) {
      byId(directory ? 'collection-filter' : 'filter').add(new Option(name,name));
    }
    byId(directory ? 'collection-search' : 'search').addEventListener('input',catalog);
    byId(directory ? 'collection-filter' : 'filter').addEventListener('change',catalog);
    catalog();
  }
  if (directory) {
    mountCatalog();
    roomPanels();
    addEventListener('pageshow',roomPanels);
    addEventListener('storage',roomPanels);
    addEventListener('pawtopia-arcade-score',roomPanels);
    return;
  }
  const marks = ['◆','✦','●','▲','■','✚','♥','☾'];
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
    const width = 5;
    const count = width * width;
    const safe = new Set([...range(width), ...range(width).map(row => row*width+width-1)]);
    Object.assign(state,{ width,count,player:0,walls:new Set(),patrols:null, step:0 });
    if (crossing) {
      state.patrols = range(width-2).map(i => (i+1)*width + pick(width));
    } else {
      state.walls = new Set(shuffle(range(count).filter(i => !safe.has(i))).slice(0, width));
    }
    cells(count,width);
    drawMaze();
  }
  function sortPrompt() {
    state.target = pick(state.count);
    byId('message').textContent = 'Sort ' + marks[state.target] + ' into its crate.';
  }
  function reaction() {
    state.go = false;
    const attempt = ++state.attempt;
    tile(0,'WAIT','danger');
    later(() => { if (attempt === state.attempt) {state.go = true; tile(0,'GO','highlight');} }, 600 + pick(1500));
  }
  function odd() {
    state.target = pick(state.count);
    const symbols = marks;
    const value = pick(symbols.length);
    const different = (value+1+pick(symbols.length-1))%symbols.length;
    range(state.count).forEach(i => tile(i,symbols[i===state.target ? different : value]));
  }
  function start() {
    stop();
    state = { score:0,left:30,running:true };
    byId('message').textContent = '';
    switch (game.kind) {
      case 3: prepareMaze(false); break;
      case 5:
        state.count = 3;
        cells(state.count, state.count);
        range(state.count).forEach(i => tile(i, marks[i]));
        sortPrompt();
        break;
      case 6: state.attempt = 0; cells(1, 1); reaction(); break;
      case 8: prepareMaze(true); break;
      case 9: state.count = 16; cells(state.count, 4); odd(); break;
    }
    update();
    clock=setInterval(() => {
      state.left--;
      update();
      if (!state.left) finish('Time’s up.');
    },1000);
  }
  function play(i) {
    if (!state?.running) return;
    switch (game.kind) {
      case 3:
      case 8:
        if (!adjacent(state.player,state.width,state.count).includes(i) || state.walls.has(i)) break;
        if (state.patrols?.includes(i)) { point(-1); state.player=0; drawMaze();break; }
        state.player=i;
        if (i===state.count-1) {point(state.width*2);finish('Goal reached!');break;}
        if (state.patrols) {
          state.patrols=state.patrols.map(j=>Math.floor(j/state.width)*state.width+(j%state.width+1)%state.width);
          if (state.patrols.includes(i)) {point(-1);state.player=0;}
        }
        drawMaze();
        break;
      case 5: point(i===state.target ? 1 : -1); sortPrompt(); break;
      case 6: point(state.go ? 1 : -1); reaction(); break;
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
    const scene = byId('cabinet-scene');
    scene.src = 'assets/scenes/' + game.art + '.webp';
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
  const requestedId = new URLSearchParams(location.search).get('game');
  const legacy = /^(\d)-[012]$/.exec(requestedId || '');
  const kind = legacy?.[1];
  if (kind !== undefined && Object.hasOwn(legacyArcade, kind)) {
    location.replace('pawtopia-arcade.html?game=' + legacyArcade[kind] + '#game-panel');
  } else {
    const requested = games.find(item => item.id === requestedId || String(item.kind) === kind);
    if (requested) select(requested, byId('catalog').children[games.indexOf(requested)]);
  }
})();
