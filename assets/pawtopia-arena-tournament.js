(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const activeEntrances = new WeakMap();
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const newText = (tag, value) => {
    const node = document.createElement(tag);
    node.textContent = value;
    return node;
  };

  function styleFighter(actor, breed) {
    if (!actor) return;
    const technique = breed && window.PawtopiaBattleCharacterArt?.identityFor?.(breed)?.technique || '';
    actor.dataset.arenaEntrance = /pounce|rush|spring|vault|leap|sprint|pinwheel/.test(technique) ? 'bound' :
      /cast|glide|float|comet|sweep|prism/.test(technique) ? 'glide' : 'stride';
  }

  function soloTheme(stage, foe) {
    const theme = foe.isBoss || foe.rank >= 12 ? 'clockwork' : foe.rank >= 5 ? 'crystal' : 'cottage';
    stage.dataset.arenaTheme = theme;
    byId('arena-stage-name').textContent = {
      cottage:'Cottage Training Ground', crystal:'Crystal Lantern Courtyard', clockwork:'Baron’s Clockwork Ring'
    }[theme];
  }

  function clearFaceoff(stage, panel) {
    if (!panel || !activeEntrances.has(stage)) return;
    activeEntrances.delete(stage);
    panel.hidden = true;
    stage.classList.remove('arena-show-entrance');
  }

  function faceoff(stage, panel, fighters) {
    if (!panel) return;
    clearFaceoff(stage, panel);
    const entrance = {};
    activeEntrances.set(stage, entrance);
    const labels = fighters.map(({name,level,actor,breed}, side) => {
      styleFighter(actor,breed);
      if (actor) actor.dataset.arenaSide = String(side);
      const label = document.createElement('span');
      label.append(newText('strong',name),newText('small','Lv. '+level));
      return label;
    });
    panel.replaceChildren(labels[0],newText('b','VS'),labels[1]);
    panel.hidden = false;
    stage.classList.add('arena-show-entrance');
    // The PvP turn timer and controls keep running during the face-off.
    const duration = reducedMotion() || window.PawtopiaBattleEffects?.low() ? 380 : 760;
    return new Promise(resolve => setTimeout(() => {
      if (activeEntrances.get(stage) === entrance) clearFaceoff(stage,panel);
      resolve();
    },duration));
  }

  function victoryCard(cat, foe, match) {
    const card = byId('arena-victory-card');
    if (!card) return;
    card.hidden = !cat || match?.result !== 'win';
    if (card.hidden) return;
    const recap = match.history?.findLast?.(entry => typeof entry === 'string' && entry.startsWith('Victory! '));
    const rewards = Array.isArray(match.victoryRewards) ? match.victoryRewards :
      recap ? recap.slice('Victory! '.length).split(' · ') : [];
    byId('arena-victory-title').textContent = cat.name+' wins!';
    byId('arena-victory-caption').textContent = 'Defeated '+foe.name+' · Tier '+foe.rank+
      (match.stampRank === foe.rank ? ' · New scrapbook medal' : '');
    byId('arena-victory-rewards').replaceChildren(...rewards.map(reward => newText('li',reward)));
    const portrait = byId('arena-victory-portrait');
    if (portrait.dataset.breed !== cat.breed) {
      window.PawtopiaBattleCharacterArt?.paintFighter(portrait,cat.breed,'victory',5);
      portrait.dataset.breed = cat.breed;
    }
  }

  function scrapbook(cat, profile) {
    const caption = byId('arena-scrapbook-caption'), list = byId('arena-scrapbook-stamps');
    if (!caption || !list) return;
    const stamps = profile?.tierStamps || [];
    caption.textContent = cat ? cat.name+' · '+stamps.length+' of 12 tier medals' : 'Adopt a cat to start an arena scrapbook.';
    if (!cat) { list.replaceChildren(); return; }
    list.replaceChildren(...Array.from({length:12},(_,index) => {
      const rank = index+1, earned = stamps.includes(rank);
      const item = newText('li','Tier '+rank);
      item.className = earned ? 'arena-stamp-earned' : 'arena-stamp-empty';
      item.setAttribute('aria-label','Tier '+rank+(earned ? ' medal earned' : ' medal locked'));
      return item;
    }));
  }

  window.PawtopiaArenaTournament = Object.freeze({styleFighter,soloTheme,faceoff,clearFaceoff,victoryCard,scrapbook});
})();
