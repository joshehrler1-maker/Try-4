(() => {
  const save = window.PawtopiaSave;
  const byId = id => document.getElementById(id);
  const labels = { food: 'Cottage Snack', shards: 'Crystal Shard' };
  const shops = [
    { store: 'Cottage Pantry', item: 'food', price: 2 },
    { store: 'Festival Cart', item: 'food', price: 3 },
    { store: 'Crystal Exchange', item: 'shards', price: 6 },
    ...[
      ['Home Goods', 'Pawprint Rug', 7], ['Health Food', 'Garden Crunch', 3],
      ['Toy Shop', 'Clockwork Mouse', 6], ['Hero Shirts', 'Paw Emblem Tee', 8],
      ['Chocolate Factory', 'Chocolate Paw', 4], ['Fresh Smoothies', 'Moonberry Smoothie', 4],
      ['Defense Gear', 'Crystal Shield', 12], ['Flower Shop', 'Glowbell Bouquet', 5],
      ['Hero Clothing', 'Festival Cape', 10], ['Gifts Galore', 'Ribbon Gift Box', 5],
      ['Garden Supplies', 'Glowbell Seeds', 4], ['Fine Furniture', 'Velvet Cat Bed', 12],
      ['The Bakery', 'Honey Paw Roll', 3], ['Collector Cards', 'Whisker Collector Card', 7]
    ].map(([store, label, price]) => ({ store, label, price }))
  ];
  const moves = { Strike: 'Charge', Guard: 'Strike', Charge: 'Guard' };
  const newMatch = () => ({ player: 0, bot: 0, message: 'Choose your first move.' });
  let match = newMatch();

  function render() {
    const p = save.read();
    const day = save.today();
    byId('wallet').textContent = p.coins + ' Paw Coins';
    byId('balance').textContent = 'Balance: ' + p.bankCoins + ' Paw Coins';
    byId('items').textContent = 'On hand: ' + p.food + ' snacks, ' + p.shards + ' shards' +
      (p.toy ? ', Crystal Toy' : '') + (p.badge ? ', Crystal Badge' : '');
    const collection = Object.entries(p.townCollection).map(([name, count]) => name + ' × ' + count);
    if (collection.length) byId('items').textContent += '. Collection: ' + collection.join(', ');
    byId('box').textContent = 'Stored: ' + p.storageBox.food + ' snacks, ' + p.storageBox.shards + ' shards';
    byId('wish').disabled = p.lastWish === day;
    byId('wish').textContent = p.lastWish === day ? 'Gift collected today' : 'Visit the Wishing Well';
    byId('interest').disabled = p.lastInterest === day || p.bankCoins < 100;
    byId('interest').textContent = p.lastInterest === day ? 'Interest collected today' : 'Collect daily interest';
    byId('trade').disabled = p.shards < 2;
    byId('round').textContent = match.message + ' You ' + match.player + ' · Bot ' + match.bot;
    byId('moves').querySelectorAll('button').forEach(button => {
      button.disabled = match.player >= 2 || match.bot >= 2;
    });
    const query = byId('search').value.trim().toLowerCase();
    const offers = shops.filter(({ store, item, label }) => (store + ' ' + (label || labels[item])).toLowerCase().includes(query));
    const list = byId('offers');
    list.replaceChildren();
    for (const offer of offers) {
      const label = offer.label || labels[offer.item];
      const line = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = 'Buy · ' + offer.price + ' coins';
      button.disabled = p.coins < offer.price;
      button.addEventListener('click', () => act(progress => {
        if (progress.coins < offer.price) return 'You need more Paw Coins.';
        progress.coins -= offer.price;
        if (offer.item) progress[offer.item]++;
        else progress.townCollection[label] = (progress.townCollection[label] || 0) + 1;
        return label + ' added to inventory.';
      }, button));
      line.append(offer.store + ' · ' + label + ' ', button);
      list.append(line);
    }
    if (!offers.length) {
      const line = document.createElement('li');
      line.textContent = 'No matching items.';
      list.append(line);
    }
  }

  async function act(change, shopButton) {
    const shopIndex = Array.from(byId('offers').querySelectorAll('button')).indexOf(shopButton);
    byId('feedback').textContent = await save.update(change);
    render();
    if (shopIndex >= 0) {
      const nextButton = byId('offers').querySelectorAll('button')[shopIndex];
      if (nextButton && !nextButton.disabled) nextButton.focus();
      else byId('search').focus();
    }
  }

  document.querySelectorAll('[data-shop]').forEach(link => {
    link.addEventListener('click', () => {
      byId('search').value = link.dataset.shop;
      render();
    });
  });
  byId('search').addEventListener('input', render);
  byId('bank-form').addEventListener('submit', event => {
    event.preventDefault();
    const amount = byId('amount').valueAsNumber;
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 999999999) return;
    const deposit = event.submitter?.value !== 'withdraw';
    act(p => {
      const source = deposit ? 'coins' : 'bankCoins';
      const target = deposit ? 'bankCoins' : 'coins';
      if (p[source] < amount) return 'There aren’t enough Paw Coins in that balance.';
      p[source] -= amount;
      p[target] += amount;
      return (deposit ? 'Deposited ' : 'Withdrew ') + amount + ' Paw Coins.';
    });
  });
  byId('stock').addEventListener('submit', event => {
    event.preventDefault();
    const item = byId('item').value;
    const quantity = byId('quantity').valueAsNumber;
    if (!Object.hasOwn(labels, item) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999) return;
    const retrieve = event.submitter?.value === 'retrieve';
    act(p => {
      const source = retrieve ? p.storageBox : p;
      const target = retrieve ? p : p.storageBox;
      if (source[item] < quantity) return 'There aren’t enough items to move.';
      source[item] -= quantity;
      target[item] += quantity;
      return (retrieve ? 'Retrieved ' : 'Stored ') + quantity + '.';
    });
  });
  byId('interest').addEventListener('click', () => act(p => {
    const day = save.today();
    if (p.lastInterest === day || p.bankCoins < 100) return 'Interest is unavailable right now.';
    const reward = Math.floor(p.bankCoins / 100);
    p.bankCoins += reward;
    p.lastInterest = day;
    return 'Collected ' + reward + ' Paw Coins in interest.';
  }));
  byId('trade').addEventListener('click', () => act(p => {
    if (p.shards < 2) return 'Bring two Crystal Shards.';
    p.shards -= 2;
    p.food += 3;
    return 'You traded two shards for three snacks.';
  }));
  byId('wish').addEventListener('click', () => act(p => {
    const day = save.today();
    if (p.lastWish === day) return 'Come back tomorrow for another gift.';
    p.lastWish = day;
    p.shards++;
    return 'The Wishing Well gave you a Crystal Shard.';
  }));
  byId('soup').addEventListener('click', () => act(p => {
    if (!p.companion) return 'Adopt a companion at the cottage first.';
    if (p.coins + p.bankCoins >= 10) return 'The kitchen serves households with fewer than 10 Paw Coins.';
    const day = save.today();
    if (p.lastSoup === day) return 'Your companion already had today’s meal.';
    const cat = p.companion;
    const elapsed = Math.max(0, Math.floor((Date.now() - cat.updatedAt) / 86400000));
    const fullness = Math.max(25, cat.fullness - elapsed * 15);
    if (fullness >= 100) return 'Your companion is already full.';
    cat.fullness = Math.min(100, fullness + 35);
    cat.happiness = Math.max(25, cat.happiness - elapsed * 10);
    cat.updatedAt = Date.now();
    p.lastSoup = day;
    return cat.name + ' enjoyed a warm meal.';
  }));
  byId('moves').addEventListener('click', event => {
    const move = event.target.closest('button')?.dataset.move;
    if (!move || match.player >= 2 || match.bot >= 2) return;
    const choices = Object.keys(moves);
    const bot = choices[Math.floor(Math.random() * choices.length)];
    if (moves[move] === bot) match.player++;
    if (moves[bot] === move) match.bot++;
    match.message = 'You chose ' + move + '. Bolt’s bot chose ' + bot + '.';
    if (match.bot === 2) match.message += ' The bot won.';
    if (match.player === 2) {
      match.message += ' You won!';
      act(p => {
        const day = save.today();
        if (p.lastArena === day) return 'Today’s arena prize was already collected.';
        p.lastArena = day;
        p.coins += 8;
        return 'You earned 8 Paw Coins.';
      });
    }
    render();
  });
  byId('reset-match').addEventListener('click', () => {
    match = newMatch();
    render();
  });
  addEventListener('storage', render);
  addEventListener('pageshow', render);
  render();
})();
