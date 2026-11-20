/* Guest games belong to their publishers; this page only embeds approved remote hosts.
   Local curated fallback uses 100 GameZipper titles from its official embed listing (Nov. 2026).
   Dynamic feeds are allowed under the publishers' partner programs, with no paid API keys. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  if (!byId('cards')) return;
  const sourceGroups = {
    Arcade: 'snake|Classic Snake;2048|2048 Galaxy;tetris|Tetris;pong|Pong;slope|Slope;brick-breaker|Brick Breaker;t-rex|T-Rex Dino Runner;flappy-wings|Cyberpunk Flappy;slice-master|Slice Master;jewel-crush|Jewel Crush;mo-yu-fayu|SlackOff Defense;whack-a-mole|Steam Whacker;reaction-time|Reaction Time;bubble-shooter|Bubble Shooter;block-blast|Block Blast;block-blast-bingo|Block Blast Bingo;parking-jam|Parking Jam;bounce-bot|Bounce Bot;tangle-master|Tangle Master',
    Puzzle: 'sudoku|Classic Sudoku;crossword|Crossword Puzzle;nonogram|Nonogram Puzzle;minesweeper|Classic Minesweeper;jigsaw-puzzle|Jigsaw Puzzle;number-match|Number Match;unblock-me|Unblock Me;liquid-connect|Liquid Connect;flow-connect|Flow Connect;word-connections|Word Connections;letter-boxed|Letter Boxed;circuit-logic|Circuit Logic;fulcrum-balance|Fulcrum Balance;wordle|Wordle;wordscapes|Wordscapes;chess|Chess;little-alchemy|Little Alchemy;impossible-quiz|The Impossible Quiz',
    Board: 'checkers|Checkers;go|Go;solitaire|Solitaire;reversi|Reversi;dots-and-boxes|Dots and Boxes;queens|Queens Puzzle;black|Black;sliding-puzzle|Sliding Puzzle;one-line-puzzle|One Line Puzzle;tic-tac-toe|Tic Tac Toe;trivia-crack|Trivia Crack;brain-out|Brain Out;cut-the-rope|Cut the Rope;tangram|Tangram Puzzle;hex-block|Hex Block Puzzle',
    Action: 'neon-dash|Neon Dash;drive-fury|Drive Fury;level-devil|Level Devil;kitchen-rush|Kitchen Rush;escape-manor|Escape Manor;aqua-digger|Aqua Digger;physics-draw-puzzle|Physics Draw Puzzle;sand-balls|Sand Balls;tap-away|Tap Away;abyss-chef|Abyss Chef;glyph-quest|Glyph Quest;tower-stacker-3d|Tower Stacker 3D;samurai-sudoku|Samurai Sudoku;memory-match|Memory Master;typing-speed|Typing Speed Test;basketball-shoot|Basketball Shoot;labyrinth|Labyrinth Maze;sum-swipe|Sum Swipe',
    Casual: 'color-by-number|Color by Number;phantom-blade|Phantom Blade;cookie-clicker|Cookie Clicker;cloud-sheep|Cloud & Sheep;magic-sort|Magic Sort;tile-dynasty|Tile Dynasty;watermelon-merge|Watermelon Merge;tile-master|Tile Master;fill-fridge|Fill The Fridge;marble-run|Marble Run;pull-the-pin|Pull the Pin;soliten|SoliTen;bolt-jam-3d|Bolt Jam 3D;pin-master|Pin Master;tangled-yarn|Twisted Tangle;wood-block-puzzle|Wood Block Puzzle;bridge-builder|Bridge Builder;jewel-coloring|Jewel Coloring;bus-traffic-fever|Bus Traffic Fever;antistress|Antistress;barns|Barns;str8ts|Str8ts;sukima|Sukima;color-switch|Color Switch;star-loom|Star Loom;ripple-effect|Ripple Effect;stacklands|Stacklands;codewords|Codewords;matchstick-puzzle|Matchstick Puzzle;pocket-sort|Pocket Sort'
  };
  const icons = {Arcade:'🕹️',Puzzle:'🧩',Board:'♟️',Action:'⚡',Casual:'🎨',Sports:'🏀',Racing:'🏎️',Word:'🔤',Other:'🎮'};
  const colorPairs = {Arcade:['#b6eaf3','#b5cbef'],Puzzle:['#f4d9a4','#dce8c3'],Board:['#c6e8ce','#d9cfef'],Action:['#ffcfc5','#f2d4a7'],Casual:['#e4c9ef','#b9ead5'],Other:['#d4d5ff','#d9f0e3']};
  const blocked = /\b(?:casino|gambling|poker|slot machine|real money|porn|adult only|sex game|bloodbath|murder|massacre|shooting massacre)\b/i;
  const local = Object.entries(sourceGroups).flatMap(([category, csv]) =>
    csv.split(';').map(entry => {
      const [slug,name] = entry.split('|');
      return {id:'GameZipper:'+slug,slug,name,category,publisher:'GameZipper',url:'https://gamezipper.com/'+slug+'/',featured:true,description:'A free '+category.toLowerCase()+' game from GameZipper.',orientation:'landscape'};
    })
  );
  let games = local;
  let visible = 24;
  let active = null;
  let dynamicProviders = new Set();
  let snapshotLoaded = false;
  let snapshotDate = '';
  const expectedHosts = {GameZipper:'gamezipper.com',PlayKovo:'playkovo.com'};
  function safeLink(provider, value) {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.hostname !== expectedHosts[provider] || url.username || url.password) return null;
      if (provider === 'GameZipper' && !/^\/[a-z0-9-]+\/$/.test(url.pathname)) return null;
      if (provider === 'PlayKovo' && !/^\/embed\/[a-z0-9-]+\/?$/.test(url.pathname)) return null;
      return url.toString();
    } catch { return null; }
  }
  function normCategory(value) {
    const tag = String(Array.isArray(value) ? value[0] || '' : value || '').toLowerCase();
    if (/arcade|classic/.test(tag)) return 'Arcade';
    if (/puzzle|brain|logic|math/.test(tag)) return 'Puzzle';
    if (/board|card|chess|strategy/.test(tag)) return 'Board';
    if (/action|reflex|platform|adventure|runner/.test(tag)) return 'Action';
    if (/casual|creative|idle|simulation|dress|color|relax/.test(tag)) return 'Casual';
    if (/sport/.test(tag)) return 'Sports';
    if (/race|driv/.test(tag)) return 'Racing';
    if (/word|typing|quiz/.test(tag)) return 'Word';
    return 'Other';
  }
  function normalize(provider, row) {
    if (!row || typeof row !== 'object') return null;
    const name = String(row.title || row.name || row.gameName || '').trim().slice(0,85);
    const slug = String(row.slug || '').trim();
    if (!name || !/^[a-z0-9-]{2,100}$/.test(slug) || blocked.test(name)) return null;
    const url = safeLink(provider, row.embedUrl || (provider === 'GameZipper' ? 'https://gamezipper.com/'+slug+'/' : 'https://playkovo.com/embed/'+slug));
    if (!url) return null;
    return {
      id:provider+':'+slug,slug,name,publisher:provider,url,
      category:normCategory(row.categories || row.category || row.tags || 'Other'),
      orientation:row.screenOrientation === 'portrait' ? 'portrait' : 'landscape',
      featured:false,
      description:String(row.shortDescription || row.description || '').slice(0,140)
    };
  }
  function mergeResults(provider, rows, isLive = true) {
    if (!Array.isArray(rows)) return;
    const normalized = rows.slice(0,1600).map(row=>normalize(provider,row)).filter(Boolean);
    if (!normalized.length) return;
    const map = new Map(games.map(game=>[game.id,game]));
    for (const row of normalized) {
      if (map.has(row.id)) {
        const old = map.get(row.id);
        map.set(row.id,{...row,name:old.featured?old.name:row.name,featured:old.featured,category:old.featured?old.category:row.category});
      } else map.set(row.id,row);
    }
    games = [...map.values()];
    if (isLive) dynamicProviders.add(provider);
    update();
  }
  const fmtProvider = p => p === 'GameZipper' ? 'GameZipper' : 'PlayKovo';
  function matches(game) {
    const q = byId('search').value.trim().toLowerCase();
    return (!q || (game.name+' '+game.category+' '+game.description).toLowerCase().includes(q)) &&
      (!byId('category').value || game.category===byId('category').value) &&
      (!byId('publisher').value || game.publisher===byId('publisher').value);
  }
  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function createCard(game) {
    const card = make('article','game-card');
    const art = make('div','art',icons[game.category] || '🎮');
    const [start,end] = colorPairs[game.category] || colorPairs.Other;
    art.style.setProperty('--start',start); art.style.setProperty('--end',end);
    const title = make('h3','',game.name);
    const desc = make('p','',game.description || 'Play free in your browser.');
    const detail = make('small','',game.category+' · From '+fmtProvider(game.publisher));
    const button = make('button','play','▶ Play Free');
    button.type='button';
    button.setAttribute('aria-label','Play '+game.name+' by '+game.publisher);
    button.addEventListener('click',()=>openGame(game));
    card.append(art,title,desc,detail,button);
    return card;
  }
  function updateCategories() {
    const select=byId('category'),prev=select.value;
    const kinds=[...new Set(games.map(g=>g.category))].sort();
    select.replaceChildren(new Option('All categories',''),...kinds.map(k=>new Option(k,k)));
    if(kinds.includes(prev))select.value=prev;
  }
  function update() {
    updateCategories();
    const filtered=games.filter(matches);
    const sort=byId('sort').value;
    filtered.sort((a,b)=>{
      if(sort==='featured' && a.featured!==b.featured)return a.featured?-1:1;
      const diff=a.name.localeCompare(b.name);
      return sort==='za'?-diff:diff;
    });
    const show=filtered.slice(0,visible);
    byId('cards').replaceChildren(...show.map(createCard));
    byId('more').hidden=filtered.length<=visible;
    const source=(snapshotLoaded ? 'Catalog snapshot checked '+snapshotDate+'. ' : 'Built-in starter games available. ') + (dynamicProviders.size ? 'Live feed updates: '+[...dynamicProviders].join(' and ')+'.' : 'Live feed updates not confirmed on this browser.');
    byId('count').textContent=filtered.length+' matching games · '+games.length+' currently available. '+source;
    if(!show.length)byId('cards').append(make('p','empty','No games match. Try another search or category.'));
  }
  function openGame(game) {
    const link=safeLink(game.publisher,game.url);
    if(!link)return;
    closeGame();
    active=game;
    const page=byId('player'),frame=byId('frame-wrap');
    frame.classList.toggle('portrait',game.orientation==='portrait');
    const iframe=make('iframe','');
    iframe.title=game.name+' from '+game.publisher;
    iframe.allow='fullscreen; autoplay; gamepad; pointer-lock';
    iframe.allowFullscreen=true;
    iframe.loading='eager';
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    const url=new URL(link);
    if(game.publisher==='GameZipper'){
      url.searchParams.set('utm_source','superpawheroes');
      url.searchParams.set('utm_medium','embed');
    }
    iframe.src=url.toString();
    frame.replaceChildren(iframe);
    byId('player-title').textContent=game.name;
    byId('game-publisher').textContent='Hosted by '+game.publisher+'. This game is not created by Super Paw Heroes.';
    byId('open-provider').href=link;
    page.hidden=false;
    page.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function closeGame() {
    byId('frame-wrap').replaceChildren();
    byId('player').hidden=true;
    active=null;
  }
  byId('close').addEventListener('click',closeGame);
  byId('fullscreen').addEventListener('click',()=>{
    if(active && byId('frame-wrap').requestFullscreen) byId('frame-wrap').requestFullscreen().catch(()=>{});
  });
  for(const id of ['search','category','publisher','sort'])byId(id).addEventListener(id==='search'?'input':'change',()=>{
    visible=24;update();
  });
  byId('more').addEventListener('click',()=>{visible+=24;update();});
  update();
  async function loadProvider(provider,url) {
    /* A failed cross-origin request is not proof that a game is gone. Keep the static fallback. */
    const key='paw-guest-feed-'+provider;
    try {
      const stored=JSON.parse(sessionStorage.getItem(key)||'null');
      if(stored && Date.now()-stored.at<6*60*60*1000 && Array.isArray(stored.games)){
        mergeResults(provider,stored.games);return;
      }
    }catch{}
    const controller=new AbortController();
    const stop=setTimeout(()=>controller.abort(),9000);
    try{
      const response=await fetch(url,{mode:'cors',credentials:'omit',signal:controller.signal,cache:'default'});
      if(!response.ok)throw Error('Remote catalog not available');
      const data=await response.json();
      const rows=Array.isArray(data)?data:Array.isArray(data.games)?data.games:[];
      if(!rows.length)throw Error('Empty feed');
      mergeResults(provider,rows);
      try{sessionStorage.setItem(key,JSON.stringify({at:Date.now(),games:rows.slice(0,1600)}));}catch{}
    }catch{
      /* CORS, offline, feed unavailable: retain valid starter catalog and never invent game counts. */
    }finally{clearTimeout(stop);}
  }
  async function loadLocalCatalog() {
    try{
      const response=await fetch('assets/guest-arcade-catalog.json',{credentials:'same-origin',cache:'default'});
      if(!response.ok)return;
      const data=await response.json();
      if(!Array.isArray(data.games)||data.games.length<100)return;
      snapshotLoaded=true;
      snapshotDate=String(data.generatedAt||'').slice(0,10);
      mergeResults('GameZipper',data.games.filter(row=>row.publisher==='GameZipper'),false);
      mergeResults('PlayKovo',data.games.filter(row=>row.publisher==='PlayKovo'),false);
    }catch{ /* Offline or snapshot unavailable: keep the 100 original verified entries. */ }
  }
  loadLocalCatalog();
  /* GameZipper allows browser catalog requests (CORS: *). PlayKovo does not.
     PlayKovo's approved feed metadata is kept in the static, dated snapshot above. */
  loadProvider('GameZipper','https://gamezipper.com/api/games.json');
})();