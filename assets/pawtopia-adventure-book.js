
(() => {
  const save = window.PawtopiaSave;
  const byId = id => document.getElementById(id);
  const coats = {
    sunleaf: 'Sunleaf', moonstone: 'Moonstone', copper: 'Copper',
    frostlight: 'Frostlight', blossom: 'Blossom', sunwake: 'Sunwake', ember: 'Ember'
  };
  const goals = [
    ['first-cat', 'Welcome home', 1, p => Number(Boolean(p.companion))],
    ['care', 'Cottage companion', 12, p => p.adventureTotals?.care, 'sunleaf'],
    ['scout', 'Trail finder', 8, p => p.adventureTotals?.scout, 'moonstone'],
    ['battle', 'Arena challenger', 12, p => p.adventureTotals?.battle, 'copper'],
    ['game', 'Games Room regular', 12, p => p.adventureTotals?.game],
    ['town', 'Town helper', 6, p => p.adventureTotals?.town],
    ['cards', 'Hero card collector', 3, p => ['Whisker','Luna','Bolt'].filter(name =>
      p.townCollection?.[name + ' Collector Card']).length]
  ];
  const festivals = [
    ['Frostbell Lantern Festival','frostlight','Luna finds a frosted lantern on the trail.','Whisker follows the glow to a snowbound cottage.','Your cat helps light the path home.'],
    ['Glowbell Garden Festival','blossom','Ivy discovers a packet of glowbell seeds.','Your cat follows a trail of petals to the garden.','Pawtopia gathers to see the glowbells open.'],
    ['Sunwake Trail Festival','sunwake','Luna finds a sunbeam map near the creek.','Whisker follows the map to a hidden lookout.','Your cat leads the parade back to Town Square.'],
    ['Emberleaf Festival','ember','A clockwork lantern goes missing from the square.','Your cat follows the trail through the amber leaves.','Whisker and Luna light the recovered lantern together.']
  ];
  function season(now = new Date()) {
    const year = now.getUTCFullYear();
    const quarter = Math.floor(now.getUTCMonth() / 3);
    return {id: year + '-' + (quarter + 1), data: festivals[quarter],
      ends: new Date(Date.UTC(year, (quarter + 1) * 3, 1))};
  }
  function unlock(progress, coat) {
    progress.coatCollection = {...progress.coatCollection, [coat]: true};
  }
  function card(parent, title, details, action, handle) {
    const article = document.createElement('article');
    const heading = document.createElement('h3');
    heading.textContent = title;
    const description = document.createElement('p');
    description.textContent = details;
    article.append(heading, description);
    if (action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action;
      button.addEventListener('click', handle);
      article.append(button);
    }
    parent.append(article);
  }
  function renderBook() {
    const list = byId('achievement-list');
    if (!list) return;
    const progress = save.read();
    list.replaceChildren();
    for (const [id, title, target, metric, coat] of goals) {
      const current = Math.max(0, Number(metric(progress)) || 0);
      const claimed = progress.achievementClaims?.[id];
      card(list, title, claimed ? 'Badge earned' : Math.min(current, target) + ' / ' + target +
        (coat ? ' · ' + coats[coat] + ' coat' : ''), !claimed && current >= target && 'Claim badge',
        async () => {
          await save.update(p => {
            if (p.achievementClaims?.[id] || (metric(p) || 0) < target) return;
            p.achievementClaims = {...p.achievementClaims, [id]: true};
            if (coat) unlock(p, coat);
            return 'Badge earned.';
          }, {track:false});
          renderBook();
        });
    }
    const currentSeason = season();
    const [name, coat, ...chapters] = currentSeason.data;
    const points = progress.festival?.season === currentSeason.id ? progress.festival.points : 0;
    byId('festival-title').textContent = name;
    byId('festival-dates').textContent = 'Ends ' + currentSeason.ends.toISOString().slice(0,10) +
      ' at 00:00 UTC. Earn points by caring for your cat, scouting, battling, playing original games and delivering town quests.';
    byId('festival-points').textContent = points + ' festival points';
    const chapterList = byId('festival-chapters');
    chapterList.replaceChildren();
    chapters.forEach((story, index) => {
      const target = [0, 5, 12][index];
      const visible = points >= target;
      const canClaim = index === 2 && visible && !progress.coatCollection?.[coat];
      card(chapterList, 'Chapter ' + (index + 1), visible ? story : 'Unlocks at ' + target + ' festival points',
        canClaim && 'Claim ' + coats[coat] + ' coat', async () => {
          await save.update(p => {
            if (season().id !== currentSeason.id || p.festival?.season !== currentSeason.id ||
                p.festival.points < target || p.coatCollection?.[coat]) return;
            unlock(p, coat);
            return 'Festival coat collected.';
          }, {track:false});
          renderBook();
        });
    });
  }
  const picker = byId('cat-coat');
  function renderCoats() {
    if (!picker) return;
    const progress = save.read();
    picker.replaceChildren(new Option('Original coat', ''));
    for (const [id, name] of Object.entries(coats)) {
      if (progress.coatCollection?.[id]) picker.add(new Option(name, id));
    }
    picker.value = progress.companion?.coatVariant || '';
    picker.disabled = byId('cat-coat-equip').disabled = !progress.companion;
  }
  byId('cat-coat-equip')?.addEventListener('click', async () => {
    const choice = picker.value;
    const message = await save.update(p => {
      if (!p.companion || (choice && !p.coatCollection?.[choice])) return 'This coat is unavailable.';
      p.companion.coatVariant = choice;
      return 'Equipped ' + (coats[choice] || 'original coat') + '.';
    }, {track:false});
    byId('coat-status').textContent = message || '';
    window.dispatchEvent(new Event('storage'));
  });
  const refresh = () => { renderBook(); renderCoats(); };
  addEventListener('storage', refresh);
  addEventListener('pawtopia-save-changed', refresh);
  addEventListener('pageshow', refresh);
  refresh();
})();
