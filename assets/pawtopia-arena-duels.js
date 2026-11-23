
(() => {
  'use strict';
  const section = document.getElementById('arena-duels');
  const api = window.PawtopiaOnline;
  const save = window.PawtopiaSave;
  const data = window.PawtopiaBattleData;
  const art = window.PawtopiaBattleCharacterArt;
  const engine = window.PawtopiaBattleEngine;
  const unlocks = {swipe:1,guard:3,signature:6,ultimate:10};
  if (!section || !api || !save || !data || !art || !engine) return;

  const element = id => document.getElementById('duel-'+id);
  const invite = element('invite');
  const notice = element('notice');
  const fighter = element('pet');
  const memoryKey = 'pawtopia-arena-duel';
  const legalCode = /^[0-9a-f]{12}$/;
  let duel, pets = [], busy = false, playing = false, animation = 0, refreshTimer;
  let account = '', available = false, rankedAvailable = false, rank, rankTimer;
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
    const old = fighter.value;
    const progress = save.read();
    pets = [progress.companion,...(Array.isArray(progress.otherCompanions) ? progress.otherCompanions : [])]
      .filter(pet => data.breeds.includes(pet?.breed));
    fighter.replaceChildren(...pets.map((pet,index) => new Option(pet.name+' · '+pet.breed+' · Lv. '+engine.level(pet),String(index))));
    if (old && pets[Number(old)]) fighter.value = old;
    element('adopt').hidden = pets.length > 0;
    setControls();
  }
  function setControls() {
    for (const action of ['create','join']) element(action).disabled = !available || busy || !pets.length || Boolean(rank?.queued);
    element('restore').disabled = !available || busy || Boolean(rank?.queued);
    element('rank-start').disabled = busy || (!pets.length && rank?.duel?.phase !== 'active');
    element('rank-cancel').disabled = busy;
    element('leave').disabled = busy;
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
    if (!duel.submitted && duel.phase === 'active') return;
    refreshTimer = setTimeout(() => {
      if (!busy && !playing) refresh(false);
      else scheduleRefresh();
    },15000);
  }
  function draw(side, pose = 'idle', frame = 3, hp = duel?.fighters[side]?.hp) {
    const pet = duel?.fighters[side], body = element('art-'+side);
    if (!pet) { body.replaceChildren(); return; }
    art.paintFighter(body,pet.breed,pose === 'fumble' ? 'recover' : pose,frame);
    const maximum = pet.maxHp || 100;
    element('health-'+side).max = maximum;
    element('health-'+side).value = hp;
    element('hp-'+side).textContent = hp+' / '+maximum+' HP';
  }
  function outcome() {
    return duel.reason === 'cancelled' ? 'Invite cancelled.' :
      duel.winner === null ? 'The duel ended in a draw.' :
      (duel.winner === duel.side ? 'You won!' : 'Your opponent won.') +
      (duel.reason === 'forfeit' ? (duel.winner === duel.side ? ' Your opponent forfeited.' : ' You forfeited.') : '');
  }
  function render() {
    element('ranked').hidden = !account || !rankedAvailable;
    element('rank-score').textContent = rank ? 'Rating '+rank.rating+' · '+rank.wins+' wins · '+rank.losses+' losses · '+rank.draws+' draws' : '';
    element('rank-start').hidden = Boolean(rank?.queued || (duel && duel.phase !== 'finished'));
    element('rank-start').textContent = rank?.duel?.phase === 'active' ? 'Resume ranked battle' : 'Find ranked opponent';
    element('rank-cancel').hidden = !rank?.queued;
    element('rank-message').textContent = rank?.queued ? 'Looking for another player…' : '';
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
      'Round '+duel.round+' of 15 · '+(duel.submitted ? 'Waiting for your opponent’s move.' : 'Choose your move.');
    const latest = duel.history.at(-1);
    element('summary').textContent = latest ? duel.fighters.map((pet,i) =>
      pet.alias+' used '+moveLabel(pet.breed,latest.moves[i])+' ('+latest.damage[i]+' damage)').join(' · ') : '';
    for (const [side,pet] of duel.fighters.entries()) {
      const stats = pet.stats;
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
      button.textContent = moveLabel(own.breed,move)+note;
    }
    setControls();
    scheduleRefresh();
  }
  const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
  async function replay(round) {
    if (!round || !duel || playing) return;
    const token = ++animation;
    playing = true;
    setControls();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      let frameIndex = 0;
      for (const frame of (reduced ? [3] : [0,1,2,3,4,5])) {
        if (token !== animation) return;
        const contact = frame >= 3;
        for (const [side,move] of round.moves.entries()) {
          draw(side,move,frame,contact ? round.hpAfter[side] : round.hpBefore[side]);
          element('actor-'+side).classList.toggle('duel-strike',!reduced && move !== 'guard' && move !== 'fumble' && frame >= 1 && frame <= 3);
          element('actor-'+side).classList.toggle('duel-contact',!reduced && contact && frame < 5 && round.damage[1-side] > 0);
        }
        frameIndex++;
        if (frameIndex < 6 && !reduced) await pause(85);
      }
      if (!reduced) await pause(175);
    } finally {
      if (token === animation) {
        playing = false;
        for (const side of [0,1]) element('actor-'+side).classList.remove('duel-strike','duel-contact');
        render();
      }
    }
  }
  function update(next, animate = true) {
    const shouldReplay = animate && duel?.code === next.code && next.history.length > duel.history.length;
    duel = next;
    if (!next.ranked) remember(next.code);
    if (next.ranked && next.phase === 'finished' && rank?.duel?.phase !== 'finished') refreshRankSummary();
    if (shouldReplay) replay(next.history.at(-1));
    render();
  }
  async function perform(work, quiet = false) {
    if (busy || !available) return;
    const activeAccount = account;
    busy = true;
    setControls();
    try {
      await work(() => api.key() === activeAccount);
      if (!quiet && api.key() === activeAccount) status('');
    } catch (error) {
      if (api.key() === activeAccount) status(error.message || 'The arena is temporarily unavailable.');
    } finally {
      busy = false;
      setControls();
      scheduleRefresh();
      scheduleRankPoll();
    }
  }
  async function refreshRankSummary() {
    const activeAccount = account;
    try {
      const next = await api.call('/arena-ranked');
      if (api.key() === activeAccount) { rank = next; render(); }
    } catch {}
  }
  function applyRank(next, allowMatch = true) {
    rank = next;
    if (allowMatch && next.duel?.phase === 'active') update(next.duel,false);
    else render();
    scheduleRankPoll();
  }
  function rankAction(action, payload) {
    return perform(async current => {
      const next = await api.call('/arena-ranked/'+action,'POST',payload);
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
        if (current()) update(next);
      } catch (error) {
        if (error.status === 404 && current()) {
          duel = null;
          remember(null);
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
    if (next === account && available) { readPets(); return; }
    account = next;
    available = false;
    rankedAvailable = false;
    rank = null;
    clearTimeout(rankTimer);
    animation++;
    playing = false;
    for (const side of [0,1]) element('actor-'+side).classList.remove('duel-strike','duel-contact');
    duel = null;
    clearTimeout(refreshTimer);
    status('');
    render();
    if (!next) return;
    try {
      const capability = await api.call('/arena-duel/status');
      if (!capability.trainedPets) throw Error('Trained pet duels are pending deployment.');
      if (api.key() !== next) return;
      available = true;
      rankedAvailable = Boolean(capability.ranked);
      readPets();
      render();
      const known = readRemembered();
      if (legalCode.test(known || '')) await restore(known,true);
      if (rankedAvailable) {
        const nextRank = await api.call('/arena-ranked');
        if (api.key() === next) applyRank(nextRank,!linkCode);
      }
    } catch {
      if (api.key() === next) status('Player battles are temporarily unavailable. Try refreshing the page.');
    }
  }

  const linkCode = location.hash.match(/^#duel-([0-9a-f]{12})$/)?.[1];
  if (linkCode) { invite.value = linkCode; section.scrollIntoView(); }
  element('account-link').href = linkCode ? 'pawtopia-online.html?duel='+linkCode : 'pawtopia-online.html';
  element('rank-start').addEventListener('click',()=>{
    if (rank?.duel?.phase === 'active') update(rank.duel,false);
    else if (pets.length) rankAction('queue',selectedFighter());
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
    if (!document.hidden && available && duel && duel.phase !== 'finished') refresh(false);
    else scheduleRefresh();
    scheduleRankPoll();
  });
  window.addEventListener('pageshow',init);
  window.addEventListener('storage',event=>{ if (event.key === 'pawtopia-online-key') init(); });
  window.addEventListener('pawtopia-save-changed',readPets);
  init();
})();
