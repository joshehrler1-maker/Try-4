/* An independent 3D guest-game directory.
   Loads metadata from this site only; an external publisher iframe is created only after an explicit second click.
   Does not write to Pawtopia currency, accounts, purchases or the existing Game Room. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  if (!byId('games')) return;
  const allowedUrl = /^https:\/\/html5\.gamemonetize\.co\/[a-z0-9-]{8,}\/?$/;
  const favoritesKey = 'pawtopia-3d-favorites-v1';
  const colorThemes = {
    Racing:['#f8deb9','#a9d8ef','🏎️'],
    '3D Puzzles':['#d7e8fc','#b2e5b6','🧩'],
    'Obstacles & Runners':['#e8d2fe','#a0d9ef','🏃'],
    'Worlds & Simulators':['#c7edd8','#f8e7b1','🏡'],
    '3D Sports':['#fce1af','#bde9d4','🏀'],
    'Arcade & More':['#d6d2f6','#aed8e4','🎮']
  };
  let all=[],shown=24,selected=null,filtered=[];
  let favorites;
  try{
    const v=JSON.parse(localStorage.getItem(favoritesKey)||'[]');
    favorites=new Set(Array.isArray(v)?v.filter(x=>/^\d{1,10}$/.test(x)).slice(0,100):[]);
  }catch{favorites=new Set();}
  const featured=new Set(['Pet island','Kitten Hide And Seek game','Hamster Village','Pet Land 3d Game','Buildy Island 3d Game','Village Builder game','Farming Missions 2023','HARVESTORIA: Tractor Farming','Real Pool 3D','Offroad Buggy Racing','Obby Tower','Harbor Master Container Tycoon','ValetPro: Parking Rush']);
  function cleanUrl(url){
    return typeof url==='string' && allowedUrl.test(url) ? url : null;
  }
  function category(g){
    const title=(g.title||'').toLowerCase();
    if(/puzzle|sort|stack|color|merge|jigsaw|water flow|ball paint|brick|block|cut|woodturn|cube|rotate|bridge|number|jelly dye|marbellous|maze and tourist|roll|connect|plant extract|pressure washer/.test(title))return '3D Puzzles';
    if(/football|basket|billiard|pool|rowing|horse jumping|kick|sport/.test(title))return '3D Sports';
    if(/farm|tycoon|simulat|builder|village|pet |kitten|hamster|shop|renovation|island|station|garden|airport|aquarium|wonderful|mermaid|food|pancake|cooking|fashion|designer/.test(title))return 'Worlds & Simulators';
    if(/car|truck|driv|racing|race|drift|traffic|bike|moto|stunt|parking|bus|road|valet|taxi|transport|rider|climb|rally|motor|fuel/.test(title))return 'Racing';
    if(/run|obby|parkour|jump|fall|race on ice|stairs|tower|staire|ladder|surfer|helix|hula|track|park|obstacle|race|roll/.test(title))return 'Obstacles & Runners';
    return 'Arcade & More';
  }
  const create=(tag,className,txt)=>{
    const n=document.createElement(tag);
    if(className)n.className=className;
    if(txt!==undefined)n.textContent=txt;
    return n;
  };
  function remember(){
    try{localStorage.setItem(favoritesKey,JSON.stringify([...favorites].slice(0,100)))}catch{}
  }
  function card(g){
    const cat=category(g),[a,b,emoji]=colorThemes[cat];
    const el=create('article','game-card');
    const cover=create('div','cover'),mark=create('span','mark',emoji);
    mark.setAttribute('aria-hidden','true');cover.append(mark);
    cover.style.setProperty('--a',a);cover.style.setProperty('--b',b);
    const title=create('h3','',g.title);
    const desc=create('p','',g.description||'An independent browser game classified as 3D by the publisher.');
    const tag=create('small','card-tag',cat+' · GameMonetize · '+(g.touchMentioned?'Touch controls mentioned':'Check controls'));
    const play=create('button','','▶ Choose game');
    play.type='button';play.setAttribute('aria-label','Choose '+g.title+' from GameMonetize');
    play.addEventListener('click',()=>choose(g));
    const favorite=create('button','favorite',favorites.has(g.id)?'★ Saved':'☆ Favorite');
    favorite.type='button';favorite.setAttribute('aria-pressed',String(favorites.has(g.id)));
    favorite.setAttribute('aria-label',(favorites.has(g.id)?'Remove':'Save')+' '+g.title+' as favorite');
    favorite.addEventListener('click',()=>{
      if(favorites.has(g.id))favorites.delete(g.id);
      else if(favorites.size<100)favorites.add(g.id);
      remember();
      favorite.textContent=favorites.has(g.id)?'★ Saved':'☆ Favorite';
      favorite.setAttribute('aria-pressed',String(favorites.has(g.id)));
      if(byId('sort').value==='favorites')render();
    });
    el.append(cover,title,desc,tag,play,favorite);
    return el;
  }
  function render(){
    const q=byId('search').value.trim().toLowerCase(),type=byId('genre').value,sort=byId('sort').value;
    filtered=all.filter(g=>(!q||[g.title,g.description,category(g)].join(' ').toLowerCase().includes(q))&&(!type||category(g)===type));
    filtered.sort((a,b)=>{
      if(sort==='favorites'){
        if(favorites.has(a.id)!==favorites.has(b.id))return favorites.has(a.id)?-1:1;
      }
      if(sort==='featured'){
        if(featured.has(a.title)!==featured.has(b.title))return featured.has(a.title)?-1:1;
      }
      return sort==='za'?b.title.localeCompare(a.title):a.title.localeCompare(b.title);
    });
    byId('games').replaceChildren(...filtered.slice(0,shown).map(card));
    if(!filtered.length)byId('games').append(create('p','intro','No games match this search. Try another activity.'));
    byId('more').hidden=filtered.length<=shown;
    byId('count').textContent=filtered.length+' matching publisher-listed games · '+all.length+' available in this checked catalog.';
    byId('total').textContent=all.length.toLocaleString();
  }
  function choose(g){
    closeFrame();
    selected=g;
    byId('player').hidden=false;
    byId('player-title').textContent=g.title;
    byId('player-info').textContent='GameMonetize 3D category · '+category(g)+'. '+(g.touchMentioned?'Touch is mentioned in the game instructions.':'Game controls and phone compatibility have not been verified.')+' '+(g.instructions||'');
    byId('publisher').href=g.url;
    byId('notice').hidden=false;
    byId('load').hidden=false;
    byId('fullscreen').hidden=true;
    byId('player-status').textContent='Ready to load after you read the publisher disclosure.';
    byId('player').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function closeFrame(){
    byId('frame').replaceChildren();
    byId('frame').classList.add('empty');
    byId('notice').hidden=false;
    byId('load').hidden=false;
    byId('fullscreen').hidden=true;
    byId('player-status').textContent='';
  }
  byId('load').addEventListener('click',()=>{
    if(!selected)return;
    const url=cleanUrl(selected.url);
    if(!url)return;
    const iframe=create('iframe','');
    iframe.src=url;
    iframe.title=selected.title+' — third-party GameMonetize game';
    iframe.allow='fullscreen; autoplay; gamepad; pointer-lock';
    iframe.allowFullscreen=true;
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    /* No popup permission. Browser policy might affect some provider games.
       The publisher link remains available as a fallback. */
    iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-pointer-lock');
    byId('frame').replaceChildren(iframe);
    // An iframe launch is verifiable; the third-party win state is not.
    const id=String(selected.id||selected.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
    if(id)void window.PawtopiaUpgradePoints?.claim('guest3d-launch',id,'launch');
    byId('frame').classList.remove('empty');
    byId('notice').hidden=true;
    byId('load').hidden=true;
    byId('fullscreen').hidden=false;
    byId('player-status').textContent='Loading '+selected.title+'. If this game does not start, use Open on publisher.';
  });
  byId('fullscreen').addEventListener('click',()=>{
    const target=byId('frame');
    if(target.requestFullscreen)target.requestFullscreen().catch(()=>{});
  });
  byId('close').addEventListener('click',()=>{
    closeFrame();selected=null;byId('player').hidden=true;
  });
  for(const id of ['search','genre','sort']){
    byId(id).addEventListener(id==='search'?'input':'change',()=>{shown=24;render();});
  }
  byId('more').addEventListener('click',()=>{shown+=24;render();});
  async function load(){
    try{
      const res=await fetch('assets/guest-3d-catalog.json',{credentials:'same-origin'});
      if(!res.ok)throw Error('Catalog unavailable');
      const data=await res.json();
      if(!Array.isArray(data.games))throw Error('Invalid catalog');
      const ids=new Set();
      all=data.games.filter(g=>{
        if(!g||typeof g.title!=='string'||!/^\d{1,10}$/.test(g.id)||!cleanUrl(g.url)||ids.has(g.id))return false;
        ids.add(g.id);return true;
      });
      if(!all.length)throw Error('No verified games');
      const options=['3D Puzzles','3D Sports','Worlds & Simulators','Racing','Obstacles & Runners','Arcade & More'];
      for(const label of options)if(all.some(g=>category(g)===label)){
        const option=create('option','',label);option.value=label;byId('genre').append(option);
      }
      const favOption=create('option','','Favorites first');favOption.value='favorites';byId('sort').append(favOption);
      render();
    }catch{
      byId('count').textContent='3D guest catalog is temporarily unavailable. Try the original Super Paw Heroes games instead.';
      byId('games').replaceChildren();
      const a=create('a','','Play original 3D games');a.href='3d-games.html';byId('games').append(a);
      byId('total').textContent='—';
    }
  }
  load();
})();