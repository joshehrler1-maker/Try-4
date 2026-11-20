/* Pawtopia Adventure Journal. Read-only achievements and goals; favorite stops use existing local save. */
(() => {
  'use strict';
  if (!document.getElementById('paw-journal') || !window.PawtopiaSave) return;
  const save = window.PawtopiaSave;
  const byId = id => document.getElementById(id);
  const destinations = [
    { key: 'cottage', label: 'Companion Cottage', href: 'pawtopia-companions.html', emoji: '🐈' },
    { key: 'arcade', label: 'Festival Arcade', href: 'pawtopia-arcade.html', emoji: '🎮' },
    { key: 'town', label: 'Town Square', href: 'pawtopia-town.html#shops', emoji: '🏡' },
    { key: 'quests', label: 'Quest Board', href: 'pawtopia-town.html#quests', emoji: '📜' },
    { key: 'collect', label: 'Card Album', href: 'pawtopia-town.html#card-album', emoji: '⭐' },
    { key: 'regions', label: 'Crystal Regions', href: 'index.html#crystal-regions', emoji: '💎' }
  ];
  const breeds = ['Maine Coon', 'Siamese', 'Bengal', 'British Shorthair', 'Ragdoll', 'Sphynx'];
  const catalogBreeds = ["Abyssinian", "American Bobtail", "American Curl", "American Shorthair", "American Wirehair", "Balinese", "Birman", "Bombay", "Burmese", "Burmilla", "Chartreux", "Cornish Rex", "Devon Rex", "Egyptian Mau", "European Shorthair", "Exotic Shorthair", "Havana Brown", "Japanese Bobtail", "Khao Manee", "Korat", "LaPerm", "Lykoi", "Manx", "Nebelung", "Norwegian Forest Cat", "Ocicat", "Oriental Shorthair", "Persian", "Peterbald", "Pixiebob", "Ragamuffin", "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Siberian", "Singapura", "Snowshoe", "Somali", "Tonkinese", "Toyger", "Turkish Angora", "Turkish Van", "York Chocolate", "Australian Mist", "Cymric", "Donskoy", "German Rex", "Kurilian Bobtail", "Sokoke"];
  const make = (tag, className, text) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text != null) item.textContent = text;
    return item;
  };
  const validFavorites = p => [...new Set(Array.isArray(p.journalFavorites) ? p.journalFavorites : [])]
    .filter(key => destinations.some(d => d.key === key)).slice(0, 3);
  function dailyTasks(p, day) {
    return [
      { icon:'🪙', title:'Claim your daily Paw Coins', detail:'Get your free game-only allowance', href:'#paw-hub-daily', done:p.lastClaim === day },
      { icon:'🎁', title:'Open a treasure chest', detail:'Choose one free chest each day', href:'#paw-hub-chest-status', done:p.lastHubChest === day },
      { icon:'📜', title:'Help a Pawtopia friend', detail:'Finish today’s Town Square quest', href:'pawtopia-town.html#quests', done:p.questDelivered === day },
      { icon:'🌠', title:'Visit the Wishing Well', detail:'Collect a town daily activity', href:'pawtopia-town.html#dailies', done:p.lastWish === day }
    ];
  }
  function stickers(p) {
    const cats = [p.companion, ...(Array.isArray(p.otherCompanions) ? p.otherCompanions : [])].filter(Boolean);
    const collection = p.townCollection && typeof p.townCollection === 'object' ? p.townCollection : {};
    const scores = p.arcadeBests && typeof p.arcadeBests === 'object' ? p.arcadeBests : {};
    return [
      { emoji:'🦸', label:'Hero Starter', hint:'Choose Whisker or Luna', done:!!p.hero },
      { emoji:'🐈', label:'Cat Companion', hint:'Adopt your first feline friend', done:cats.length > 0 },
      { emoji:'🎮', label:'Arcade Star', hint:'Set a positive arcade best score', done:Object.values(scores).some(score => Number(score) > 0) },
      { emoji:'💎', label:'Crystal Keeper', hint:'Collect a Crystal Badge', done:!!p.badge },
      { emoji:'🐾', label:'Cat Collector', hint:'Adopt three cats', done:cats.length >= 3 },
      { emoji:'🌟', label:'Town Collector', hint:'Collect three unique town items', done:Object.entries(collection).filter(([,count]) => Number(count) > 0).length >= 3 }
    ];
  }
  function paintPortrait(target, breed) {
    const base = breeds.indexOf(breed);
    if (base >= 0) {
      target.style.background = 'center / cover no-repeat url("assets/scenes/adopt-' + breed.toLowerCase().replaceAll(' ', '-') + '.webp")';
      return;
    }
    const index = catalogBreeds.indexOf(breed);
    if (index >= 0) {
      const sheet = Math.floor(index / 25) + 1;
      const cell = index % 25;
      target.style.background = (cell % 5 * 25) + '% ' + (Math.floor(cell / 5) * 25) + '% / 500% 500% no-repeat url("assets/scenes/adopt-catalog-' + sheet + '.webp")';
    } else {
      target.style.background = 'center / cover no-repeat url("assets/scenes/cottage.webp")';
    }
  }
  function drawDailies(p, day) {
    const tasks = dailyTasks(p, day);
    const completed = tasks.filter(task => task.done).length;
    byId('paw-journal-daily-progress').value = completed;
    byId('paw-journal-daily-count').textContent = completed + ' / ' + tasks.length + ' complete';
    byId('paw-journal-daily').replaceChildren(...tasks.map(task => {
      const li = make('li', task.done ? 'paw-journal-task is-done' : 'paw-journal-task');
      const icon = make('span','paw-journal-task-icon', task.done ? '✓' : task.icon);
      icon.setAttribute('aria-hidden','true');
      const content = make('span','paw-journal-task-copy');
      const title = make('strong','',task.title);
      const description = make('small','',task.done ? 'Completed today!' : task.detail);
      content.append(title,description);
      const a = make('a','paw-journal-task-go',task.done ? 'Done' : 'Go');
      a.href = task.href;
      if (task.done) {
        a.classList.add('is-complete');
        a.setAttribute('aria-label',task.title + ', completed today');
      }
      li.append(icon,content,a);
      return li;
    }));
  }
  function drawStickers(p) {
    const awards = stickers(p);
    const earned = awards.filter(item => item.done).length;
    byId('paw-journal-sticker-count').textContent = earned + ' / ' + awards.length + ' earned';
    byId('paw-journal-stickers').replaceChildren(...awards.map(item => {
      const sticker = make('div',item.done ? 'paw-journal-sticker earned' : 'paw-journal-sticker locked');
      sticker.setAttribute('aria-label',item.label + (item.done ? ', unlocked' : ', locked. ' + item.hint));
      const emoji = make('span','paw-journal-sticker-art',item.done ? item.emoji : '🔒');
      emoji.setAttribute('aria-hidden','true');
      sticker.append(emoji,make('strong','',item.label),make('small','',item.done ? 'Unlocked!' : item.hint));
      return sticker;
    }));
  }
  function drawCats(p) {
    const cats = [p.companion, ...(Array.isArray(p.otherCompanions) ? p.otherCompanions : [])].filter(Boolean);
    const count = cats.length;
    byId('paw-journal-cat-count').textContent = count + ' / 4 cats';
    const area = byId('paw-journal-cats');
    if (!count) {
      const a = make('a','paw-journal-empty','Your cat family starts at Companion Cottage. Adopt a feline friend.');
      a.href = 'pawtopia-companions.html';
      area.replaceChildren(a);
      return;
    }
    area.replaceChildren(...cats.map((cat,index) => {
      const row = make('div','paw-journal-cat');
      const portrait = make('span','paw-journal-cat-art');
      const breed = String(cat.breed || 'Cat');
      paintPortrait(portrait,breed);
      portrait.setAttribute('role','img');
      portrait.setAttribute('aria-label',breed+' cat portrait');
      const details = make('span','paw-journal-cat-copy');
      details.append(make('strong','',String(cat.name || 'Unnamed cat').slice(0,24)),make('small','',breed + (index === 0 ? ' · Active' : '')));
      row.append(portrait,details);
      return row;
    }));
  }
  async function toggleFavorite(key) {
    if (!destinations.some(place => place.key === key)) return;
    const message = await save.update(p => {
      const favorites = validFavorites(p);
      if (favorites.includes(key)) {
        p.journalFavorites = favorites.filter(item => item !== key);
        return 'Favorite removed';
      }
      if (favorites.length >= 3) return 'You can choose up to three favorite places.';
      p.journalFavorites = [...favorites,key];
      return 'Favorite saved';
    });
    byId('paw-journal-feedback').textContent = message;
    render();
    window.dispatchEvent(new Event('pawtopia:changed'));
  }
  function drawFavorites(p) {
    const favorites = validFavorites(p);
    byId('paw-journal-favorite-count').textContent = favorites.length + ' / 3 saved';
    const links = byId('paw-journal-saved-favorites');
    if (!favorites.length) {
      links.replaceChildren(make('p','paw-journal-empty','Choose up to three favorite places for quick access.'));
    } else {
      links.replaceChildren(...favorites.map(key => {
        const place = destinations.find(item => item.key === key);
        const a = make('a','paw-journal-quick-link',place.emoji + ' ' + place.label);
        a.href=place.href;
        return a;
      }));
    }
    byId('paw-journal-favorite-choices').replaceChildren(...destinations.map(place => {
      const selected = favorites.includes(place.key);
      const button = make('button','paw-journal-favorite-button',place.emoji + ' ' + place.label);
      button.type='button';
      button.setAttribute('aria-pressed',String(selected));
      button.setAttribute('aria-label',(selected ? 'Remove ' : 'Save ') + place.label + ' favorite');
      button.disabled=!selected && favorites.length>=3;
      button.addEventListener('click',()=>toggleFavorite(place.key));
      return button;
    }));
  }
  function render() {
    const progress = save.read();
    drawDailies(progress, save.today());
    drawStickers(progress);
    drawCats(progress);
    drawFavorites(progress);
  }
  window.addEventListener('pageshow',render);
  window.addEventListener('storage',render);
  window.addEventListener('pawtopia:changed',render);
  render();
})();