(() => {
  const save = window.PawtopiaSave;
  const upgrades = window.PawtopiaUpgradePoints;
  const byId = id => document.getElementById(id);
  const controls = {
    feed: byId('feed'), play: byId('play'), food: byId('buy-food'), toy: byId('buy-toy')
  };
  const cape = byId('cottage-cape');
  const bed = byId('cottage-bed');
  const rest = byId('cottage-rest');
  const originalBreeds = ['Maine Coon', 'Siamese', 'Bengal', 'British Shorthair', 'Ragdoll', 'Sphynx'];
  const catalogBreeds = ["Abyssinian", "American Bobtail", "American Curl", "American Shorthair", "American Wirehair", "Balinese", "Birman", "Bombay", "Burmese", "Burmilla", "Chartreux", "Cornish Rex", "Devon Rex", "Egyptian Mau", "European Shorthair", "Exotic Shorthair", "Havana Brown", "Japanese Bobtail", "Khao Manee", "Korat", "LaPerm", "Lykoi", "Manx", "Nebelung", "Norwegian Forest Cat", "Ocicat", "Oriental Shorthair", "Persian", "Peterbald", "Pixiebob", "Ragamuffin", "Russian Blue", "Savannah", "Scottish Fold", "Selkirk Rex", "Siberian", "Singapura", "Snowshoe", "Somali", "Tonkinese", "Toyger", "Turkish Angora", "Turkish Van", "York Chocolate", "Australian Mist", "Cymric", "Donskoy", "German Rex", "Kurilian Bobtail", "Sokoke"];
  const breeds = [...originalBreeds, ...catalogBreeds];
  const stats = save.battleStats();
  const trainingPrice = 5;
  const maxCats = 4;
  const petBond = window.PawtopiaPetBond;
  const scout = window.PawtopiaScout;
  const scoutChoice = byId('cottage-scout-accessory');
  const scoutEquip = byId('cottage-scout-equip');
  const bondPanel = byId('pet-bond-panel');
  const bondButtons = [...document.querySelectorAll('[data-pet-bond]')];
  const active = byId('active-cat');
  const training = byId('training-stat');
  const train = byId('train-cat');
  const trainPoints=byId('train-pet-upgrade');
  function paintPortrait(element, breed) {
    const index = catalogBreeds.indexOf(breed);
    if (index < 0) {
      const file = breed.toLowerCase().replaceAll(' ', '-');
      element.style.background = 'center / cover no-repeat url(assets/scenes/adopt-' + file + '.webp)';
      return;
    }
    const sheet = Math.floor(index / 25) + 1;
    const cell = index % 25;
    const x = cell % 5 * 25;
    const y = Math.floor(cell / 5) * 25;
    element.style.background = x + '% ' + y + '% / 500% 500% no-repeat url(assets/scenes/adopt-catalog-' + sheet + '.webp)';
  }
  function showStats(target, values) {
    const health = save.maxHealth(values);
    target.replaceChildren(...Object.entries({ health: health + ' / ' + health, ...values }).flatMap(([key, value]) => {
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = key[0].toUpperCase() + key.slice(1);
      detail.textContent = value;
      return [term, detail];
    }));
  }
  function previewBreed(breed) {
    byId('breed-selected').textContent = 'Selected: ' + breed;
    showStats(byId('breed-battle-preview'), save.battleStats({ breed }));
  }
  const breedSearch = byId('breed-search');
  const breedChoices = breeds.map((breed, index) => {
    const label = document.createElement('label');
    const option = document.createElement('input');
    option.type = 'radio';
    option.name = 'breed';
    option.value = breed;
    option.checked = index === 0;
    const portrait = document.createElement('span');
    portrait.className = 'breed-portrait';
    portrait.setAttribute('aria-hidden', 'true');
    paintPortrait(portrait, breed);
    label.append(option, portrait, breed);
    byId('breed-options').append(label);
    option.addEventListener('change', () => {
      previewBreed(breed);
    });
    return { breed, label };
  });
  previewBreed(originalBreeds[0]);
  breedSearch.addEventListener('input', () => {
    const query = breedSearch.value.trim().toLowerCase();
    let count = 0;
    for (const { breed, label } of breedChoices) {
      label.hidden = !breed.toLowerCase().includes(query);
      if (!label.hidden) count++;
    }
    byId('breed-count').textContent = count + ' of ' + breeds.length + ' breeds';
  });
  function canTrain(values, stat) {
    if (stat === 'level') return values.level < 200;
    if (!Object.hasOwn(stats, stat)) return false;
    const baseCap = values.level * 2;
    return values[stat] < values.level * (stat === 'endurance' ? 3 : 2) &&
      (stat === 'endurance' || values.endurance <= baseCap) &&
      ['strength', 'defence', 'movement', 'intelligence'].every(key => values[key] <= baseCap);
  }
  const snackPrice = 2;
  const toyPrice = 5;
  const dayMs = 86400000;
  function careLevels(cat) {
    const days = Math.max(0, Math.floor((Date.now() - cat.updatedAt) / dayMs));
    return {
      fullness: Math.max(25, cat.fullness - days * 15),
      happiness: Math.max(25, cat.happiness - days * 10)
    };
  }
  function render(message) {
    const progress=save.read();
    const { companion, coins, food, toy, townCollection, capeEquipped, bedPlaced, lastBedRest, otherCompanions } = progress;
    const wearable = window.PawtopiaItems?.worn(progress,companion,'wearable');
    const marketWearable = byId('market-wearable');
    if (marketWearable) {
      marketWearable.hidden = !wearable;
      marketWearable.textContent = wearable ? wearable.badge + ' ' + wearable.name : '';
      if (marketWearable.style) marketWearable.style.color = Number.isInteger(wearable?.hue) ? 'hsl('+wearable.hue+' 68% 40%)' : '';
    }
    const pointState=upgrades?.state();
    byId('pet-upgrade-balance').textContent=String(pointState?.balance||0);
    byId('pet-upgrade-earned-today').textContent=String(pointState?.daily||0)+' of '+(upgrades?.maxDaily||30);
    trainPoints.disabled = !upgrades?.canSpend(progress,training.value);
    byId('coins').textContent = coins;
    byId('inventory').textContent = 'Inventory · ' + food + (food === 1 ? ' snack' : ' snacks') + (toy ? ' · Crystal toy' : '');
    const allCats = [companion, ...otherCompanions].filter(Boolean).slice(0, maxCats);
    byId('pet-album-count').textContent = allCats.length + ' of ' + maxCats + ' companions adopted';
    const albumCards = allCats.map((cat, index) => {
      const card = document.createElement('article');
      card.className = 'pet-album-card';
      const portrait = document.createElement('div');
      portrait.className = 'pet-album-portrait';
      portrait.setAttribute('role', 'img');
      paintPortrait(portrait, cat.breed || 'Maine Coon');
      portrait.dataset.coat = cat.coatVariant || '';
      const keepsake = scout.accessoryFor(cat);
      portrait.setAttribute('data-scout-icon', keepsake ? keepsake.icon : '');
      portrait.setAttribute('aria-label', (cat.breed || 'Cat') + ' portrait');
      const details = document.createElement('div');
      const heading = document.createElement('h3');
      heading.textContent = (cat.name || 'Your cat').slice(0, 24) + (index === 0 ? ' · Active' : '');
      const breed = document.createElement('p');
      breed.textContent = String(cat.breed || 'Cat');
      const bonding = petBond.read(cat, save.today());
      const friendship = document.createElement('p');
      friendship.textContent = bonding.temperament.name + ' · ' + bonding.title + ' (' + bonding.points + '/100)';
      const memory = document.createElement('p');
      memory.textContent = bonding.memories[0]
        ? 'Last memory: ' + petBond.activities[bonding.memories[0].activity].label
        : 'First memory waiting';
      const scoutInfo = document.createElement('p');
      const stampCount = scout.read({ companion: cat }, save.today()).stamps.length;
      scoutInfo.textContent = stampCount + ' of 4 trail stamps · ' + (keepsake ? keepsake.name : 'Everyday look');
      details.append(heading, breed, friendship, memory, scoutInfo);
      card.append(portrait, details);
      return card;
    });
    if (!albumCards.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Your collection begins when you adopt your first cat above.';
      albumCards.push(empty);
    }
    byId('pet-album-cards').replaceChildren(...albumCards);
    const stamps = scout.read({ companion }, save.today()).stamps;
    byId('cottage-scout-stamps').textContent = stamps.length + ' of 4 trail stamps found by this cat';
    const selectedStyle = scout.accessoryFor(companion);
    byId('cottage-scout-current').textContent = 'Wearing: ' + (selectedStyle ? selectedStyle.icon + ' ' + selectedStyle.name : 'Everyday look');
    scoutEquip.disabled = !companion;
    const styles = [{ id: 'none', name: 'Everyday look' }, ...scout.areas
      .filter(area => stamps.includes(area.id)).map(area => area.accessory)];
    scoutChoice.replaceChildren(...styles.map(style => {
      const option = document.createElement('option');
      option.value = style.id;
      option.textContent = (style.icon ? style.icon + ' ' : '') + style.name;
      return option;
    }));
    scoutChoice.disabled = !companion;
    scoutChoice.value = selectedStyle ? selectedStyle.id : 'none';
    cape.disabled = !companion || !townCollection['Festival Cape'];
    cape.textContent = capeEquipped ? 'Remove Festival Cape' : 'Equip Festival Cape';
    bed.disabled = !townCollection['Velvet Cat Bed'];
    bed.textContent = bedPlaced ? 'Put Velvet Cat Bed away' : 'Place Velvet Cat Bed';
    rest.disabled = !companion || !bedPlaced || lastBedRest === save.today() ||
      (companion && careLevels(companion).happiness >= 100);
    byId('cottage-outfit').textContent = capeEquipped ? 'Outfit: Festival Cape' : 'Outfit: Everyday';
    byId('cottage-furnishing').textContent = bedPlaced ? 'Furniture: Velvet Cat Bed placed' : 'Furniture: No bed placed';
    byId('adopt').hidden = Boolean(companion && otherCompanions.length >= maxCats - 1);
    active.hidden = !companion;
    byId('active-cat-label').hidden = !companion;
    active.replaceChildren(...[companion, ...otherCompanions].filter(Boolean).map((cat, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = cat.name + ' · ' + (cat.breed || 'Domestic Shorthair');
      return option;
    }));
    byId('care').hidden = !companion;
    bondPanel.hidden = !companion;
    controls.food.disabled = !companion || coins < snackPrice;
    controls.toy.disabled = !companion || toy || coins < toyPrice;
    if (companion) {
      const { fullness, happiness } = careLevels(companion);
      byId('cat-label').textContent = companion.name + ' · ' + (companion.breed || 'Domestic Shorthair');
      const image = byId('cat-portrait');
      image.hidden = !companion.breed;
      if (companion.breed) {
        paintPortrait(image, companion.breed);
        image.dataset.coat = companion.coatVariant || '';
        image.setAttribute('aria-label', companion.breed + ' companion portrait');
        const accessory = scout.accessoryFor(companion);
        image.setAttribute('data-scout-icon', accessory ? accessory.icon : '');
      }
      const values = save.battleStats(companion);
      showStats(byId('companion-stats'), values);
      train.disabled = coins < trainingPrice || !canTrain(values, training.value);
      trainPoints.disabled = !upgrades?.canSpend(progress,training.value);
      byId('fullness').value = fullness;
      byId('fullness-label').textContent = fullness + '%';
      byId('happiness').value = happiness;
      byId('happiness-label').textContent = happiness + '%';
      controls.feed.disabled = !food || fullness === 100;
      controls.play.disabled = happiness === 100;
      const bonding = petBond.read(companion, save.today());
      byId('pet-personality').textContent = bonding.temperament.name + ' personality · ' + bonding.temperament.description + ' Favorite: ' + petBond.activities[bonding.temperament.favorite].label.toLowerCase() + '.';
      byId('pet-bond-title').textContent = bonding.title;
      byId('pet-bond-progress').value = bonding.points;
      byId('pet-bond-value').textContent = bonding.points + '/100 friendship';
      byId('pet-bond-badges').textContent = bonding.badges.join(' · ');
      bondButtons.forEach(button => {
        const complete = bonding.done.includes(button.dataset.petBond);
        button.disabled = complete;
        button.setAttribute('aria-label', button.textContent.trim() + (complete ? ' — completed today' : ' — available today'));
        button.setAttribute('aria-pressed', String(complete));
      });
      const memories = bonding.memories.map(entry => {
        const li = document.createElement('li');
        li.textContent = petBond.activities[entry.activity].label + ' · ' + entry.day;
        return li;
      });
      if (!memories.length) {
        const li = document.createElement('li');
        li.textContent = 'Your first friendship memory is waiting.';
        memories.push(li);
      }
      byId('pet-bond-memories').replaceChildren(...memories);
    }
    if (typeof message === 'string') byId('feedback').textContent = message;
  }
  async function act(change) { render(await save.update(change)); }
  byId('adopt').addEventListener('submit', event => {
    event.preventDefault();
    const field = byId('cat-name');
    const name = field.value.trim().slice(0, 24);
    if (!name) {
      render('Enter a name for your cat.');
      field.focus();
      return;
    }
    const breed = new FormData(event.currentTarget).get('breed');
    if (!breeds.includes(breed)) return;
    act(progress => {
      if (progress.companion && progress.otherCompanions.length >= maxCats - 1) return 'The cottage is full.';
      const cat = { name, breed, fullness: 65, happiness: 65, updatedAt: Date.now() };
      if (progress.companion) progress.otherCompanions.push(cat);
      else progress.companion = cat;
      return name + ' has moved into the cottage!';
    });
  });
  active.addEventListener('change', () => {
    const index = Number(active.value) - 1;
    act(progress => {
      const next = progress.otherCompanions[index];
      if (!next || !progress.companion) return '';
      progress.otherCompanions[index] = {
        ...progress.companion, capeEquipped: progress.capeEquipped, lastBedRest: progress.lastBedRest
      };
      progress.companion = next;
      progress.capeEquipped = Boolean(next.capeEquipped);
      progress.lastBedRest = next.lastBedRest || '';
      return next.name + ' is now your active companion.';
    });
  });
  training.addEventListener('change', render);
  trainPoints.addEventListener('click',async()=>{
    const outcome=await upgrades.train(training.value);
    render(outcome.message);
  });
  train.addEventListener('click', () => {
    const stat = training.value;
    act(progress => {
      if (!progress.companion || progress.coins < trainingPrice) return 'You need 5 Paw Coins and an active companion.';
      const values = save.battleStats(progress.companion);
      if (!canTrain(values, stat)) return 'Raise your companion’s level to train that stat further.';
      values[stat]++;
      progress.coins -= trainingPrice;
      progress.companion.stats = values;
      return progress.companion.name + ' gained 1 ' + stat + '.';
    });
  });
  controls.food.addEventListener('click', () => act(progress => {
    if (!progress.companion || progress.coins < snackPrice) return '';
    progress.coins -= snackPrice;
    progress.food++;
    return 'Snack added to your inventory.';
  }));
  controls.toy.addEventListener('click', () => act(progress => {
    if (!progress.companion || progress.toy || progress.coins < toyPrice) return '';
    progress.coins -= toyPrice;
    progress.toy = true;
    return 'Crystal toy added to your inventory.';
  }));
  controls.feed.addEventListener('click', () => act(progress => {
    const cat = progress.companion;
    if (!cat || !progress.food) return '';
    const levels = careLevels(cat);
    if (levels.fullness === 100) return '';
    progress.food--;
    Object.assign(cat, levels, { fullness: Math.min(100, levels.fullness + 25), updatedAt: Date.now() });
    return cat.name + ' enjoyed the snack.';
  }));
  controls.play.addEventListener('click', () => act(progress => {
    const cat = progress.companion;
    if (!cat) return '';
    const levels = careLevels(cat);
    if (levels.happiness === 100) return '';
    Object.assign(cat, levels, { happiness: Math.min(100, levels.happiness + (progress.toy ? 25 : 10)), updatedAt: Date.now() });
    return 'You played with ' + cat.name + '.';
  }));
  bondButtons.forEach(button => button.addEventListener('click', () => act(progress => {
    const result = petBond.perform(progress.companion, button.dataset.petBond, save.today());
    return result.message;
  })));
  scoutEquip.addEventListener('click', () => {
    const chosen = scoutChoice.value;
    act(progress => scout.equip(progress, chosen).message);
  });
  cape.addEventListener('click', () => act(progress => {
    if (!progress.companion || !progress.townCollection['Festival Cape']) return 'Adopt a companion and buy a Festival Cape first.';
    progress.capeEquipped = !progress.capeEquipped;
    return progress.capeEquipped ? 'Festival Cape equipped.' : 'Festival Cape removed.';
  }));
  bed.addEventListener('click', () => act(progress => {
    if (!progress.townCollection['Velvet Cat Bed']) return 'Buy a Velvet Cat Bed first.';
    progress.bedPlaced = !progress.bedPlaced;
    return progress.bedPlaced ? 'Velvet Cat Bed placed.' : 'Velvet Cat Bed put away.';
  }));
  rest.addEventListener('click', () => act(progress => {
    const cat = progress.companion;
    const day = save.today();
    if (!cat || !progress.bedPlaced || progress.lastBedRest === day) return 'Rest is unavailable.';
    const levels = careLevels(cat);
    if (levels.happiness >= 100) return 'Your companion is already happy.';
    Object.assign(cat, levels, { happiness: Math.min(100, levels.happiness + 30), updatedAt: Date.now() });
    progress.lastBedRest = day;
    return cat.name + ' woke up happier.';
  }));
  addEventListener('storage', render);
  addEventListener('pageshow', render);
  render();
})();
