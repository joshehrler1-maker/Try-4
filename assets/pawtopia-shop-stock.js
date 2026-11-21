
(() => {
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
      ['The Bakery', 'Honey Paw Roll', 3], ['Collector Cards', 'Whisker Collector Card', 7],
      ['Collector Cards', 'Luna Collector Card', 7], ['Collector Cards', 'Bolt Collector Card', 7]
    ].map(([store, label, price]) => ({ store, label, price }))
  ];
  const purchase = (progress,offer) => {
    const label = offer.label || labels[offer.item];
    if (progress.coins < offer.price) return 'You need more Paw Coins.';
    progress.coins -= offer.price;
    if (offer.item) progress[offer.item]++;
    else progress.townCollection[label] = (progress.townCollection[label] || 0) + 1;
    return label + ' added to inventory.';
  };
  const locations = {
  "Cottage Pantry": "pawtopia-shop-companion-supplies.html",
  "Home Goods": "pawtopia-shop-home-goods.html",
  "Health Food": "pawtopia-shop-health-food.html",
  "Toy Shop": "pawtopia-shop-toy-shop.html",
  "Hero Shirts": "pawtopia-shop-hero-shirts.html",
  "Chocolate Factory": "pawtopia-shop-chocolate-factory.html",
  "Crystal Exchange": "pawtopia-shop-wizard-shop.html",
  "Festival Cart": "pawtopia-shop-snack-stand.html",
  "Fresh Smoothies": "pawtopia-shop-fresh-smoothies.html",
  "Defense Gear": "pawtopia-shop-defense-gear.html",
  "Flower Shop": "pawtopia-shop-flower-shop.html",
  "Hero Clothing": "pawtopia-shop-hero-clothing.html",
  "Gifts Galore": "pawtopia-shop-gifts-galore.html",
  "Garden Supplies": "pawtopia-shop-garden-supplies.html",
  "Fine Furniture": "pawtopia-shop-fine-furniture.html",
  "The Bakery": "pawtopia-shop-the-bakery.html",
  "Collector Cards": "pawtopia-shop-collector-cards.html"
};
  function shopFor(item) {
    if (!item.price) return null;
    const name = item.name.toLowerCase();
    switch (item.category) {
      case 'Food':
        if (/milk|broth cup/.test(name)) return 'fresh-smoothies';
        if (/roll|crisp|roasted bites/.test(name)) return 'the-bakery';
        if (/picnic|parcel|snack|bites/.test(name)) return 'snack-stand';
        if (/meadow|plate|terrine|platter/.test(name)) return 'health-food';
        return 'companion-supplies';
      case 'Toy': return 'toy-shop';
      case 'Remedy':
        if (/tea|infusion|vapor|draught/.test(name)) return 'fresh-smoothies';
        if (/balm|ointment|compress|salve|patch|rub|wrap|liniment/.test(name)) return 'grooming-cottage';
        return 'health-food';
      case 'Book': return /sparring|courage|balance|strategy|bracing|footwork/.test(name) ? 'battle-academy':'main-shops';
      case 'Weapon': case 'Armor': return 'defense-gear';
      case 'Relic': return 'wizard-shop';
      case 'Battle Gear': return item.slot==='relic' ? 'wizard-shop':'defense-gear';
      case 'Material':
        if (/fiber|timber|leaf|dowel/.test(name)) return 'garden-supplies';
        if (/glass|quartz|crystal/.test(name)) return 'wizard-shop';
        return 'market-place';
      case 'Furnishing':
        if (/porch|willow|breeze|sunroom/.test(name)) return 'garden-supplies';
        if (/bench|nook|lounger|chair|shelf|bed/.test(name)) return 'fine-furniture';
        return 'home-goods';
      case 'Wearable':
        if (/moonflower|thistlebrook|mossglass|honeybrook/.test(name)) return 'flower-shop';
        if (/collar|kerchief|bow/.test(name)) return 'grooming-cottage';
        if (/sash|cuff|harness|badge|shirt/.test(name)) return 'hero-shirts';
        return 'hero-clothing';
      case 'Collectible':
        if (/album|postcard|portrait|print|lithograph/.test(name)) return 'collector-cards';
        if (/cameo|festival plate|enamel token/.test(name)) return 'chocolate-factory';
        if (/thistlebrook|mossglass|honeybrook/.test(name)) return 'flower-shop';
        return 'gifts-galore';
      default: return 'main-shops';
    }
  }
  window.PawtopiaShopStock = Object.freeze({labels,shops,purchase,shopFor,locations});
})();
