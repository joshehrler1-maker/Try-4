/* Explore Pawtopia - free, offline-friendly play using existing PawtopiaSave. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  if (!el('paw-hub') || !window.PawtopiaSave) return;
  const save = window.PawtopiaSave;
  const breedList = ['Maine Coon', 'Siamese', 'Bengal', 'British Shorthair', 'Ragdoll', 'Sphynx'];
  const otherBreeds = ["Abyssinian", "American Bobtail", "American Curl", "American Shorthair", "American Wirehair", "Balinese", "Birman", "Bombay", "Burmese", "Burmilla", "Chartreux", "Cornish Rex", "Devon Rex", "Egyptian Mau", "European Shorthair", "Exotic Shorthair", "Havana Brown", "Japanese Bobtail", "Khao Manee", "Korat", "LaPerm", "Lykoi", "Manx", "Nebelung", "Norwegian Forest Cat", "Ocicat", "Oriental Shorthair", "Persian", "Peterbald", "Pixiebob", "Ragamuffin", "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Siberian", "Singapura", "Snowshoe", "Somali", "Tonkinese", "Toyger", "Turkish Angora", "Turkish Van", "York Chocolate", "Australian Mist", "Cymric", "Donskoy", "German Rex", "Kurilian Bobtail", "Sokoke"];
  const heroButtons = [...document.querySelectorAll('[data-hub-hero]')];
  const chestButtons = [...document.querySelectorAll('[data-hub-chest]')];
  const face = el('paw-hub-portrait');
  const careDays = cat => {
    const days = Math.max(0, Math.floor((Date.now() - (Number(cat.updatedAt) || Date.now())) / 86400000));
    return { fullness: Math.max(25, Math.min(100, (Number(cat.fullness) || 65) - days * 15)),
      happiness: Math.max(25, Math.min(100, (Number(cat.happiness) || 65) - days * 10)) };
  };
  function paintFace(cat) {
    face.hidden = !cat;
    if (!cat) return;
    const breed = String(cat.breed || 'Maine Coon');
    const original = breedList.indexOf(breed);
    const other = otherBreeds.indexOf(breed);
    if (original >= 0) {
      face.style.background = 'center / cover no-repeat url("assets/scenes/adopt-' + breed.toLowerCase().replaceAll(' ', '-') + '.webp")';
    } else if (other >= 0) {
      const sheet = Math.floor(other / 25) + 1, pos = other % 25;
      const x = pos % 5 * 25, y = Math.floor(pos / 5) * 25;
      face.style.background = x + '% ' + y + '% / 500% 500% no-repeat url("assets/scenes/adopt-catalog-' + sheet + '.webp")';
    } else {
      face.style.background = 'center / cover no-repeat url("assets/scenes/cottage.webp")';
    }
    face.setAttribute('aria-label', breed + ' cat companion portrait');
  }
  function render(message = '') {
    const p = save.read(), day = save.today(), cat = p.companion;
    const coins = Number.isSafeInteger(p.coins) && p.coins >= 0 ? p.coins : 0;
    const cats = (cat ? 1 : 0) + (Array.isArray(p.otherCompanions) ? p.otherCompanions.length : 0);
    const dailyDone = p.lastClaim === day;
    const chestDone = p.lastHubChest === day;
    const steps = [Boolean(p.hero), Boolean(cat), dailyDone, chestDone].filter(Boolean).length;
    el('paw-hub-coins').textContent = String(coins);
    el('paw-hub-cat-count').textContent = String(cats);
    el('paw-hub-hero-name').textContent = p.hero || 'Choose a hero';
    el('paw-hub-welcome').textContent = p.hero
      ? 'Welcome back, ' + p.hero + '! Your next Pawtopia adventure is ready.'
      : 'Choose Whisker or Luna, meet a cat companion, and find something fun to do today.';
    el('paw-hub-steps').value = steps;
    el('paw-hub-steps-label').textContent = steps + ' of 4 welcome activities';
    el('paw-hub-streak').textContent = chestDone ? 'Daily chest opened' : 'Daily treasure available';
    heroButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.hubHero === p.hero)));
    el('paw-hub-daily').disabled = !p.hero || dailyDone;
    el('paw-hub-daily').textContent = dailyDone ? 'Daily coins claimed ✓' : 'Claim 10 daily Paw Coins';
    chestButtons.forEach(button => {
      const active = chestDone && p.lastHubChoice === button.dataset.hubChest;
      button.disabled = chestDone || !p.hero;
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('span').textContent = active ? '✨' : '🎁';
    });
    el('paw-hub-chest-status').textContent = !p.hero ? 'Choose a hero to open a free daily treasure chest.' :
      chestDone ? 'You found 3 Paw Coins today! Another chest arrives tomorrow.' :
      'Pick one chest today. Every chest contains 3 free in-game Paw Coins.';
    el('paw-hub-pet-empty').hidden = Boolean(cat);
    el('paw-hub-pet-care').hidden = !cat;
    paintFace(cat);
    if (cat) {
      const levels = careDays(cat);
      el('paw-hub-pet-name').textContent = String(cat.name || 'Your cat').slice(0,24);
      el('paw-hub-pet-breed').textContent = String(cat.breed || 'Cat');
      el('paw-hub-fullness').value = levels.fullness;
      el('paw-hub-fullness-value').textContent = levels.fullness + '%';
      el('paw-hub-happiness').value = levels.happiness;
      el('paw-hub-happiness-value').textContent = levels.happiness + '%';
      el('paw-hub-food').textContent = 'Snacks: ' + (Number(p.food) || 0);
      el('paw-hub-feed').disabled = !(Number(p.food) > 0) || levels.fullness >= 100;
      el('paw-hub-play').disabled = levels.happiness >= 100;
    }
    if (message) el('paw-hub-feedback').textContent = message;
  }
  async function act(change) {
    const message = await save.update(change);
    render(message);
    /* Existing Town / Hero Headquarters widgets already listen for storage. */
    window.dispatchEvent(new Event('storage'));
  }
  heroButtons.forEach(button => button.addEventListener('click', () => act(p => {
    if (p.hero === button.dataset.hubHero) return 'Your hero is already selected.';
    p.hero = button.dataset.hubHero;
    return p.hero + ' is ready for an adventure!';
  })));
  el('paw-hub-daily').addEventListener('click', () => act(p => {
    if (!p.hero || p.lastClaim === save.today()) return 'Visit again tomorrow for more daily coins.';
    p.lastClaim = save.today();
    p.coins = (Number(p.coins) || 0) + 10;
    return 'You collected 10 Paw Coins! Spend them at Pawtopia shops.';
  }));
  chestButtons.forEach(button => button.addEventListener('click', () => act(p => {
    if (!p.hero || p.lastHubChest === save.today()) return 'Today’s chest has already been opened.';
    p.lastHubChest = save.today();
    p.lastHubChoice = button.dataset.hubChest;
    p.coins = (Number(p.coins) || 0) + 3;
    return 'Treasure found! You earned 3 free Paw Coins. ✨';
  })));
  el('paw-hub-feed').addEventListener('click', () => act(p => {
    if (!p.companion || !Number.isSafeInteger(p.food) || p.food <= 0) return 'Visit the Cottage Shop for a snack first.';
    const levels = careDays(p.companion);
    if (levels.fullness >= 100) return 'Your companion is happily full.';
    p.food -= 1;
    Object.assign(p.companion, levels, { fullness: Math.min(100, levels.fullness + 25), updatedAt: Date.now() });
    return p.companion.name + ' enjoyed a tasty snack!';
  }));
  el('paw-hub-play').addEventListener('click', () => act(p => {
    if (!p.companion) return 'Adopt a cat companion first.';
    const levels = careDays(p.companion);
    if (levels.happiness >= 100) return 'Your companion is already delighted!';
    Object.assign(p.companion, levels, { happiness: Math.min(100, levels.happiness + (p.toy ? 25 : 10)), updatedAt: Date.now() });
    return 'You played with ' + p.companion.name + '! 🐾';
  }));
  window.addEventListener('pawtopia:changed', () => render());
  window.addEventListener('pageshow', () => render());
  window.addEventListener('storage', () => render());
  render();
})();