
(() => {
  'use strict';
  const section = document.getElementById('arena-duels');
  const api = window.PawtopiaOnline;
  const save = window.PawtopiaSave;
  const data = window.PawtopiaBattleData;
  const art = window.PawtopiaBattleCharacterArt;
  const engine = window.PawtopiaBattleEngine;
  const motion = window.PawtopiaBattleMotion;
  const effects = window.PawtopiaBattleEffects;
  const tournament = window.PawtopiaArenaTournament;
  let previousEntrance = '';
  const unlocks = {swipe:1,guard:3,signature:6,ultimate:10};
  if (!section || !api || !save || !data || !art || !engine) return;

  const element = id => document.getElementById('duel-'+id);
  const invite = element('invite');
  const notice = element('notice');
  const fighter = element('pet');
  const initialPet = new URL(location.href).searchParams.get('pet');
  let roster = [];
  const memoryKey = 'pawtopia-arena-duel';
  const legalCode = /^[0-9a-f]{12}$/;
  let duel, pets = [], busy = false, playing = false, animation = 0, refreshTimer;
  let clockTimer, clockDeadline = 0, clockDue = 0;
  let account = '', available = false, initializing = false, session = 0;
  let rankedAvailable = false, rank, rankTimer;
  const moveLabel = (breed, move) => {
    if (move === 'fumble') return 'Missed swipe';
    const kit = data.kitFor(breed);
    return {swipe:'Paw Swipe',guard:'Guard Curl',signature:kit.signature,ultimate:kit.ultimate}[move];
  };
  const status = message => { notice.textContent = message; };
  const readRemembered = () => {
    try { return localStorage.getItem(memoryKey); } catch { return null; }
  };
  function remember(code) {
    try {
      if (code) localStorage.setItem(memoryKey,code);
      else localStorage.removeItem(memoryKey);
    } catch {}
  }
  function selectedFighter() {
    const pet = pets[Number(fighter.value)];
    if (!pet) throw Error('Choose an adopted cat first.');
    return {name:String(pet.name || pet.breed).slice(0,40),breed:pet.breed,
      stats:{level:engine.level(pet),...engine.training(pet)}};
  }
  function readPets() {
    const previous = pets[Number(fighter.value)];
    const progress = save.read();
    roster = [progress.companion,...(Array.isArray(progress.otherCompanions) ? progress.otherCompanions : [])].filter(Boolean).slice(0,6);
    pets = roster.filter(pet => data.breeds.includes(pet.breed));
    fighter.replaceChildren(...pets.map((pet,index) => new Option(pet.name+' · '+pet.breed+' · Lv. '+engine.level(pet),String(index))));
    const retained = previous ? pets.findIndex(pet => previous.battleId
      ? pet.battleId === previous.battleId : pet.name === previous.name && pet.breed === previous.breed) : -1;
    const requested = /^[0-5]$/.test(initialPet || '') ? pets.indexOf(roster[Number(initialPet)]) : -1;
    if (retained >= 0) fighter.value = String(retained);
    else if (requested >= 0) fighter.value = String(requested);
    updateEquipmentLink();
    element('adopt').hidden = pets.length > 0;
    setControls();
  }
  function updateEquipmentLink() {
    const link = element('equipment');
    const slot = roster.indexOf(pets[Number(fighter.value)]);
    link.hidden = slot < 0;
    if (slot >= 0) link.href = 'pawtopia-pet-equipment.html?mode=duel&pet='+slot;
  }
  fighter.addEventListener('change',updateEquipmentLink);
  function setControls() {
    for (const action of ['create','join']) element(action).disabled = !available || busy || playing || !pets.length || Boolean(rank?.queued);
    element('restore').disabled = !available || busy || playing || Boolean(rank?.queued);
    element('rank-start').disabled = busy || playing || (!pets.length && rank?.duel?.phase !== 'active');
    element('rank-cancel').disabled = busy;
    element('leave').disabled = busy || playing;
    element('refresh').disabled = busy || playing;
    element('replay').disabled = busy || playing || !duel?.history.length;
    for (const button of element('moves').querySelectorAll('[data-duel-move]')) {
      const pet = duel?.fighters[duel.side], move = button.dataset.duelMove;
      button.disabled = !pet || duel.phase !== 'active' || duel.submitted || busy || playing ||
        (pet.stats && pet.stats.level < unlocks[move]) ||
        (move === 'signature' && duel.round < pet.readyAt) ||
        (move === 'ultimate' && (duel.round < 4 || pet.ultimateUsed));
    }
  }
  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    if (document.hidden || !duel || duel.phase === 'finished' || !available) return;
    refreshTimer = setTimeout(() => {
      if (!busy && !playing) refresh(false);
      else scheduleRefresh();
    },duel.phase === 'active' && !duel.submitted ? 25000 : 15000);
  }
  function draw(side, pose = 'idle', frame = 3, hp = duel?.fighters[side]?.hp, from) {
    const pet = duel?.fighters[side], body = element('art-'+side);
    if (!pet) { body.replaceChildren(); return; }
    art.paintFighter(body,pet.breed,pose === 'fumble' ? 'recover' : pose,frame,from);
    const maximum = pet.maxHp || 100;
    element('health-'+side).max = maximum;
    element('health-'+side).value = hp;
    element('hp-'+side).textContent = hp+' / '+maximum+' HP';
  }
  function outcome() {
    if (duel.reason==='turn-timeout') return duel.winner===null ? 'Both players ran out of time. The match is a draw.' :
      duel.winner===duel.side ? 'You won. Your opponent ran out of time.' : 'Your turn timed out. Your opponent won.';
    return duel.reason === 'cancelled' ? 'Invite cancelled.' :
      duel.winner === null ? 'The duel ended in a draw.' :
      (duel.winner === duel.side ? 'You won!' : 'Your opponent won.') +
      (duel.reason === 'forfeit' ? (duel.winner === duel.side ? ' Your opponent forfeited.' : ' You forfeited.') : '');
  }
  function renderClock() {
    clearTimeout(clockTimer);
    const clock=element('clock');
    clock.hidden=!duel?.turnDeadline || duel.phase!=='active';
    if(clock.hidden)return;
    const now=Date.now();
    const grace=now>=clockDue;
    const seconds=Math.max(0,Math.ceil(((grace?clockDeadline:clockDue)-now)/1000));
    clock.textContent=seconds ? (grace?'Reconnect grace: ':duel.submitted?'Opponent has ':'Choose a move: ')+seconds+'s' : 'Checking the result…';
    if(document.hidden)return;
    if(!seconds && !busy && !playing) refresh(false);
    clockTimer=setTimeout(renderClock,seconds?1000:2500);
  }
  function render() {
    renderClock();
    element('ranked').hidden = !account || !rankedAvailable;
    element('rank-score').textContent = rank ? 'Rating '+rank.rating+' · '+rank.wins+' wins · '+rank.losses+' losses · '+rank.draws+' draws' : '';
    element('rank-start').hidden = Boolean(rank?.queued || (duel && duel.phase !== 'finished'));
    element('rank-start').textContent = rank?.duel?.phase === 'active' ? 'Resume ranked battle' : 'Find ranked opponent';
    element('rank-cancel').hidden = !rank?.queued;
    element('rank-message').textContent = !rank?.queued ? '' :
      rank.widened ? 'Widening the search for another player…' : 'Looking for a player near your rating and pet strength…';
    element('account').hidden = Boolean(account);
    element('lobby').hidden = !account || !available || Boolean(duel && duel.phase !== 'finished');
    element('match').hidden = !duel;
    if (!duel) { setControls(); return; }
    const waiting = duel.phase === 'waiting';
    element('code-line').hidden = !waiting;
    element('field').hidden = duel.fighters.length !== 2;
    element('leave').hidden = duel.phase === 'finished';
    element('leave').textContent = waiting ? 'Cancel invite' : 'Forfeit duel';
    element('moves').hidden = duel.phase !== 'active';
    element('code').textContent = duel.code;
    const share = new URL(location.href);
    share.hash = 'duel-'+duel.code;
    share.search = '';
    element('share-link').href = share.href;
    element('mode').textContent = duel.bot ? 'Arena Bot · Practice match' : duel.ranked ? 'Ranked player match' : 'Private invite duel';
    element('phase').textContent = waiting ? 'Waiting for a friend to join.' :
      duel.phase === 'finished' ? outcome() :
      'Round '+duel.round+' of 15 · '+(duel.submitted ? 'Move locked in. Waiting for your opponent.' :
        duel.opponentSubmitted ? 'Opponent ready. Choose your move.' : 'Choose your move.');
    const latest = duel.history.at(-1);
    const field=element('field'), faceoff=document.getElementById('arena-duel-faceoff');
    const arrival=duel.phase==='active' && duel.round===1 && !latest && !duel.submitted && duel.fighters.length===2;
    if(arrival && previousEntrance!==duel.code && tournament){
      previousEntrance=duel.code;
      tournament.faceoff(field,faceoff,duel.fighters.map((pet,side)=>({
        name:pet.name || pet.alias || pet.breed, level:pet.stats?.level || 1,
        actor:element('actor-'+side), breed:pet.breed
      })));
    }else if(!arrival || playing) tournament?.clearFaceoff(field,faceoff);
    if(tournament)field.dataset.arenaWinner=duel.phase==='finished' && duel.winner!==null && !playing ? String(duel.winner) : '';

    element('summary').textContent = latest ? duel.fighters.map((pet,i) =>
      latest.moves[i] === 'fumble' ? pet.alias+' missed its swipe' :
        pet.alias+' used '+moveLabel(pet.breed,latest.moves[i])+' ('+latest.damage[i]+' damage)').join(' · ') : '';
    for (const [side,pet] of duel.fighters.entries()) {
      const stats = pet.stats;
      tournament?.styleFighter(element('actor-'+side),pet.breed);
      element('label-'+side).textContent = (pet.name ? pet.name+' · ' : '')+pet.breed+' · '+
        (side === duel.side ? 'You' : pet.alias)+(stats ? ' · Lv. '+stats.level : '');
      element('stats-'+side).textContent = stats
        ? 'STR '+stats.strength+' · DEF '+stats.defence+' · MOV '+stats.movement+
          ' · END '+stats.endurance+' · INT '+stats.intelligence
        : '';
      if (!playing) {
        const pose = duel.phase === 'finished' && duel.winner !== null ? (duel.winner === side ? 'victory' : 'defeat') : 'idle';
        draw(side,pose);
      }
    }
    const own = duel.fighters[duel.side];
    for (const button of element('moves').querySelectorAll('[data-duel-move]')) {
      const move = button.dataset.duelMove;
      const note = own.stats && own.stats.level < unlocks[move] ? ' · Lv. '+unlocks[move] :
        move === 'ultimate' && own.ultimateUsed ? ' · used' :
        move === 'ultimate' && duel.round < 4 ? ' · round 4' :
        move === 'signature' && duel.round < own.readyAt ? ' · round '+own.readyAt : '';
      const preview = duel.movePreview;
      const amount = preview?.attacks[move];
      const estimate = note ? note.slice(3) :
        move === 'guard' && preview ? 'Half damage, then blocks '+preview.guardBlock+' more' :
        amount ? amount.damage+' damage · '+amount.guarded+' if guarded'+
          (move==='signature'?' · every 3 rounds':move==='ultimate'?' · once per duel':'') : '';
      const description = document.createElement('small');
      description.textContent = estimate;
      description.hidden = !estimate;
      button.replaceChildren(moveLabel(own.breed,move),description);
    }
    setControls();
    scheduleRefresh();
  }
  const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
  const lungingStyles = new Set(['rush','pounce','maul','lance','feint','whirl','thunder']);
  const direction = side => side===0 ? 1 : -1;
  function duelEffect(kind,x,y,color,label='') {
    const layer=element('effects');
    const spark=document.createElement('span');
    spark.className='duel-effect';
    spark.dataset.effect=kind;
    spark.style.setProperty('--fx-x',x+'px');
    spark.style.setProperty('--fx-y',y+'px');
    spark.style.setProperty('--fx-color',color);
    spark.textContent=label;
    layer.append(spark);
    setTimeout(()=>spark.remove(),820);
    return spark;
  }
  function playDuelContact(round, actions) {
    const field=element('field');
    const stage=field.getBoundingClientRect();
    for (const [side,action] of actions.entries()) {
      if (!action.attack) continue;
      const target=element('art-'+(1-side)).getBoundingClientRect();
      const x=target.left-stage.left+target.width*(side===0?.32:.68);
      const y=target.top-stage.top+target.height*.55;
      const amount=round.damage[side];
      const guarded=round.moves[1-side]==='guard';
      if(amount>0||guarded) {
        const kind=guarded?'block':action.move==='ultimate'?'ultimate':action.skill?action.family:'hit';
        duelEffect(kind,x,y,guarded?'#8deedf':action.color,amount>0?'−'+amount:'Blocked');
      }
    }
  }
  function resetDuelArt() {
    for (const side of [0,1]) {
      const actor=element('actor-'+side);
      actor.style?.removeProperty('--duel-travel');
      actor.style?.removeProperty('--duel-feet');
      actor.classList.remove('duel-contact');
      if(actor.dataset){actor.dataset.trail='';actor.dataset.shield='';}
      const indicator=element('state-'+side);
      if(indicator)indicator.hidden=true;
    }
    element('field').classList.remove('duel-ult-landed');
  }
  async function replay(round) {
    if (!round || !duel || playing) return;
    const token=++animation;
    playing=true;
    setControls();
    const still=window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !motion || typeof element('field').getBoundingClientRect!=='function';
    try {
      if(still) {
        for(const [side,move] of round.moves.entries()) {
          draw(side,round.damage[1-side]>0 && move!=='guard'?'impact':move,3,round.hpAfter[side]);
        }
        return;
      }
      const bodies=[0,1].map(side=>element('art-'+side).getBoundingClientRect());
      const actions=round.moves.map((move,side)=>{
        const pet=duel.fighters[side], model=art.getArt?.(pet.breed), kit=data.kitFor(pet.breed);
        const skill=move==='signature'||move==='ultimate';
        const attack=move!=='guard'&&move!=='fumble';
        const technique=art.identityFor?.(pet.breed)?.technique;
        const family=skill ? effects?.technique(technique)||'cast' : 'hit';
        const melee=attack&&(!skill||lungingStyles.has(technique));
        const clip=motion.plan({who:'pet',fx:move,damage:round.damage[side]},skill?{skill:move}:null,
          model,null,skill?art.timingFor?.(pet.breed,move):null);
        return {move,skill,attack,melee,clip,family,color:kit.theme?.color||'#ffe09a'};
      });
      const gap=Math.max(0,bodies[1].left+bodies[1].width*.32-(bodies[0].left+bodies[0].width*.68));
      const bothLunge=actions.every(action=>action.melee);
      const reach=actions.map(action=>action.melee ? gap/(bothLunge?2:1) : 0);
      const length=Math.max(...actions.map(action=>action.clip.duration));
      const contact=.58;
      for(const [i,beat] of [0,.10,.20,.31,.43,.52,contact,.64,.72,.82,.91,1].entries()){
        if(token!==animation)return;
        const landed=beat>=contact;
        for(const [side,action] of actions.entries()){
          const actor=element('actor-'+side);
          const incoming=round.damage[1-side];
          const local=landed?action.clip.contact+(1-action.clip.contact)*(beat-contact)/(1-contact):
            action.clip.contact*beat/contact;
          const sample=motion.sample(action.clip,local,reach[side],Math.max(1,Math.min(3,Math.round(reach[side]/45))));
          const lunge=action.skill&&action.melee ? Math.sin(Math.PI/2*(landed?(1-beat)/(1-contact):beat/contact))*reach[side] : sample.x;
          const recoil=landed && actions[1-side].attack && (incoming>0||action.move==='guard') ?
            Math.sin(Math.PI*(beat-contact)/(1-contact))*bodies[side].width*(incoming>0?.12:.035) : 0;
          const receivingHit=incoming>0 && beat>contact && beat<.82 && (action.move!=='guard'||beat>=.72);
          actor.style.setProperty('--duel-travel',direction(side)*(lunge-recoil)+'px');
          actor.style.setProperty('--duel-feet',String(Math.abs(lunge)/Math.max(1,reach[side])));
          actor.classList.toggle('duel-contact',incoming>0 && beat===contact && !effects?.low());
          const guarding=action.move==='guard' && !landed;
          actor.dataset.shield=guarding?'on':'';
          const guardIcon=element('state-'+side);
          if(guardIcon)guardIcon.hidden=!guarding;
          actor.dataset.trail=action.melee&&beat>=.52&&beat<=.64&&!effects?.low()
            ? (action.skill?action.family:'swipe') : '';
          actor.style.setProperty('--arena-trail-color',action.color);
          const pose=receivingHit?'impact':action.move==='fumble'?'fumble':sample.pose;
          const frame=receivingHit?Math.min(5,(beat-contact)*20):action.move==='fumble'?beat*5:sample.frame;
          draw(side,pose,Math.round(frame*2)/2,landed?round.hpAfter[side]:round.hpBefore[side],sample.from);
          if(i===4 && action.attack && !effects?.low()) {
            const stage=element('field').getBoundingClientRect();
            const box=element('art-'+side).getBoundingClientRect();
            if(action.skill&&!action.melee) {
              const spark=duelEffect('trail',box.left-stage.left+box.width*.5,box.top-stage.top+box.height*.55,action.color);
              const end=element('art-'+(1-side)).getBoundingClientRect();
              const startX=box.left+box.width*.5,startY=box.top+box.height*.55;
              spark.style.setProperty('--fx-distance',(end.left+end.width*(side===0?.32:.68)-startX)+'px');
              spark.style.setProperty('--fx-rise',(end.top+end.height*.55-startY)+'px');
              spark.style.setProperty('--fx-duration',(2*length/15)+'ms');
            }else duelEffect('dust',box.left-stage.left+box.width*.5,box.top-stage.top+box.height*.84,'#ddc19f');
          }
        }
        if(beat===contact) {
          playDuelContact(round,actions);
          if(!effects?.low()&&actions.some((action,side)=>action.move==='ultimate'&&round.damage[side]>0&&round.moves[1-side]!=='guard'))
            element('field').classList.add('duel-ult-landed');
        }
        if(beat<1)await pause(length/15+(beat===contact?55:0));
      }
    } finally {
      if(token===animation) {
        playing=false;
        resetDuelArt();
        render();
      }
    }
  }
  function update(next, animate = true) {
    const shouldReplay = animate && duel?.code === next.code && next.history.length > duel.history.length;
    duel = next;
    const now=Date.now();
    clockDue=now+(next.turnDueAt-next.serverNow);
    clockDeadline=now+(next.turnDeadline-next.serverNow);
    if (!next.ranked) remember(next.code);
    if (shouldReplay) replay(next.history.at(-1));
    render();
  }
  async function perform(work, quiet = false) {
    if (busy || playing || !available) return;
    const activeSession = session;
    const activeAccount = account;
    const current = () => session === activeSession && api.key() === activeAccount;
    busy = true;
    setControls();
    try {
      await work(current);
      if (current() && duel?.ranked && duel.phase === 'finished' && rank?.duel?.phase !== 'finished') {
        await refreshRankSummary(current);
      }
      if (!quiet && current()) status('');
    } catch (error) {
      if (current()) status(error.message || 'The arena is temporarily unavailable.');
    } finally {
      if (session === activeSession) {
        busy = false;
        setControls();
        scheduleRefresh();
        scheduleRankPoll();
      }
    }
  }
  async function refreshRankSummary(current) {
    try {
      const next = await api.call('/arena-ranked');
      if (current()) { rank = next; render(); }
    } catch {}
  }
  function applyRank(next, allowMatch = true, restoreResult = false) {
    rank = next;
    const match = next.duel;
    if (allowMatch && match && (match.phase === 'active' || restoreResult)) update(match,false);
    else render();
    scheduleRankPoll();
  }
  function rankAction(action, payload) {
    return perform(async current => {
      const next = await api.call('/arena-ranked/'+action,'POST',action === 'queue' ? selectedFighter() : payload);
      if (current()) applyRank(next);
    },action === 'poll');
  }
  function scheduleRankPoll() {
    clearTimeout(rankTimer);
    if (!rank?.queued || document.hidden) return;
    rankTimer = setTimeout(() => {
      if (busy) scheduleRankPoll();
      else rankAction('poll',{});
    },3000);
  }
  function refresh(manual) {
    return perform(async current => {
      if (!duel) return;
      try {
        const next = await api.call('/arena-duel?code='+duel.code+(duel.ranked ? '&ranked=1' : ''));
        if (current() && (next.phase !== duel.phase || next.round !== duel.round || next.submitted !== duel.submitted || next.opponentSubmitted !== duel.opponentSubmitted)) update(next);
      } catch (error) {
        if (error.status === 404 && current()) {
          if (duel.ranked && rank) rank = {...rank,duel:null};
          else remember(null);
          duel = null;
          render();
        }
        throw error;
      }
    },!manual);
  }
  function restore(code, clearMissing = false) {
    return perform(async current => {
      try {
        const next = await api.call('/arena-duel?code='+code);
        if (current()) update(next,false);
      } catch (error) {
        if (!current()) return;
        if (error.status !== 404 || !clearMissing) throw error;
        remember(null);
      }
    },clearMissing);
  }
  function enter(join) {
    return perform(async current => {
      const selected = selectedFighter();
      const code = invite.value.trim().toLowerCase();
      if (join && !legalCode.test(code)) throw Error('Enter a valid 12-character duel code.');
      const next = await api.call('/arena-duel/'+(join ? 'join' : 'create'),'POST',
        {...selected,...(join ? {code} : {})});
      if (current()) update(next,false);
    });
  }
  async function init() {
    const next = api.key();
    if (next === account && (available || initializing)) { readPets(); return; }
    const activeSession = ++session;
    const current = () => session === activeSession && api.key() === next;
    account = next;
    initializing = Boolean(next);
    busy = false;
    available = false;
    rankedAvailable = false;
    rank = null;
    clearTimeout(rankTimer);
    animation++;
    playing = false;
    resetDuelArt();
    element('effects').replaceChildren();
    duel = null;
    clearTimeout(refreshTimer);
    status('');
    render();
    if (!next) return;
    try {
      const capability = await api.call('/arena-duel/status');
      if (!capability.trainedPets) throw Error('Trained pet duels are pending deployment.');
      if (!current()) return;
      available = true;
      rankedAvailable = Boolean(capability.ranked);
      readPets();
      render();
      const known = readRemembered();
      if (!linkCode && legalCode.test(known || '')) await restore(known,true);
      if (current() && rankedAvailable) {
        const nextRank = await api.call('/arena-ranked');
        if (current()) applyRank(nextRank,!linkCode && (!duel || duel.phase === 'finished'),!nextRank.queued);
      }
    } catch (error) {
      if (current() && error.status === 401) {
        api.disconnect();
        await init();
        status('Sign-in expired. Sign in again to play online.');
      } else if (current()) status('Player battles are temporarily unavailable. Try refreshing the page.');
    } finally {
      if (session === activeSession) initializing = false;
    }
  }

  const linkCode = location.hash.match(/^#duel-([0-9a-f]{12})$/)?.[1];
  if (linkCode) { invite.value = linkCode; section.scrollIntoView(); }
  element('account-link').href = linkCode ? 'pawtopia-online.html?duel='+linkCode : 'pawtopia-online.html';
  element('rank-start').addEventListener('click',()=>{
    if (rank?.duel?.phase === 'active') update(rank.duel,false);
    else if (pets.length) rankAction('queue');
  });
  element('rank-cancel').addEventListener('click',()=>rankAction('cancel',{}));
  element('create').addEventListener('click',()=>enter(false));
  element('join-form').addEventListener('submit',event=>{ event.preventDefault(); enter(true); });
  element('restore').addEventListener('click',()=>perform(async current => {
    const next = await api.call('/arena-duel/hosted');
    if (!next.duel) throw Error('You do not have a hosted duel.');
    if (current()) update(next.duel,false);
  }));
  element('refresh').addEventListener('click',()=>refresh(true));
  element('replay').addEventListener('click',()=>replay(duel?.history.at(-1)));
  element('leave').addEventListener('click',()=>{
    if (!duel || !window.confirm(duel.phase === 'waiting' ? 'Cancel this invite?' : 'Forfeit this duel?')) return;
    perform(async current => {
      const next = await api.call('/arena-duel/leave','POST',{code:duel.code,ranked:duel.ranked});
      if (current()) update(next);
    });
  });
  element('moves').addEventListener('click',event=>{
    const move = event.target.closest('button')?.dataset.duelMove;
    if (!move || !duel || playing) return;
    perform(async current => {
      const request = {code:duel.code,round:duel.round,move,ranked:duel.ranked};
      let next;
      try { next = await api.call('/arena-duel/move','POST',request); }
      catch (error) {
        if (error.status !== 409 || !current()) throw error;
        next = await api.call('/arena-duel/move','POST',request);
      }
      if (current()) update(next);
    });
  });
  document.addEventListener('visibilitychange',()=>{
    renderClock();
    if (!document.hidden && available) {
      readPets();
      if (duel && duel.phase !== 'finished' && !playing) refresh(false);
      else scheduleRefresh();
    } else scheduleRefresh();
    scheduleRankPoll();
  });
  window.addEventListener('pageshow',()=>{
    init();
    if (available && duel?.phase==='active') refresh(false);
  });
  window.addEventListener('online',()=>{
    if (available && duel?.phase==='active') refresh(false);
    else init();
  });
  window.addEventListener('storage',event=>{ if (event.key === 'pawtopia-online-key') init(); });
  window.addEventListener('pawtopia-save-changed',readPets);
  init();
})();
