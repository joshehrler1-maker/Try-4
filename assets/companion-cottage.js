(() => {
  const save = window.PawtopiaSave;
  const byId = id => document.getElementById(id);
  const controls = {
    feed: byId('feed'), play: byId('play'), food: byId('buy-food'), toy: byId('buy-toy')
  };
  const cape = byId('cottage-cape');
  const bed = byId('cottage-bed');
  const rest = byId('cottage-rest');
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
    const { companion, coins, food, toy, townCollection, capeEquipped, bedPlaced, lastBedRest } = save.read();
    byId('coins').textContent = coins;
    byId('inventory').textContent = 'Inventory · ' + food + (food === 1 ? ' snack' : ' snacks') + (toy ? ' · Crystal toy' : '');
    cape.disabled = !companion || !townCollection['Festival Cape'];
    cape.textContent = capeEquipped ? 'Remove Festival Cape' : 'Equip Festival Cape';
    bed.disabled = !townCollection['Velvet Cat Bed'];
    bed.textContent = bedPlaced ? 'Put Velvet Cat Bed away' : 'Place Velvet Cat Bed';
    rest.disabled = !companion || !bedPlaced || lastBedRest === save.today() ||
      (companion && careLevels(companion).happiness >= 100);
    byId('cottage-outfit').textContent = capeEquipped ? 'Outfit: Festival Cape' : 'Outfit: Everyday';
    byId('cottage-furnishing').textContent = bedPlaced ? 'Furniture: Velvet Cat Bed placed' : 'Furniture: No bed placed';
    byId('adopt').hidden = Boolean(companion);
    byId('care').hidden = !companion;
    controls.food.disabled = !companion || coins < snackPrice;
    controls.toy.disabled = !companion || toy || coins < toyPrice;
    if (companion) {
      const { fullness, happiness } = careLevels(companion);
      byId('cat-label').textContent = companion.name;
      byId('fullness').value = fullness;
      byId('fullness-label').textContent = fullness + '%';
      byId('happiness').value = happiness;
      byId('happiness-label').textContent = happiness + '%';
      controls.feed.disabled = !food || fullness === 100;
      controls.play.disabled = happiness === 100;
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
    act(progress => {
      if (progress.companion) return '';
      progress.companion = { name, fullness: 65, happiness: 65, updatedAt: Date.now() };
      return name + ' has moved into the cottage!';
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
