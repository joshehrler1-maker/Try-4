(() => {
  const key = 'pawtopia-home-progress-v1';
  function read() {
    const defaults = { hero: '', coins: 0, lastClaim: '', badge: false, companion: null, otherCompanions: [], food: 0, toy: false, arcadeBests: {}, townCollection: {}, bankCoins: 0, shards: 0, storageBox: { food: 0, shards: 0 }, lastWish: "", lastSoup: "", lastInterest: "", lastArena: "" };
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!saved || typeof saved !== 'object') return defaults;
      const progress = { ...defaults, ...saved };
      progress.arcadeBests = { ...saved.arcadeBests };
      progress.townCollection = { ...saved.townCollection };
      progress.storageBox = { ...defaults.storageBox, ...saved.storageBox };
      return progress;
    } catch {
      return defaults;
    }
  }
  async function update(change) {
    function write() {
      const progress = read();
      const message = change(progress);
      if (message) localStorage.setItem(key, JSON.stringify(progress));
      return message;
    }
    try {
      return navigator.locks ? await navigator.locks.request(key, write) : write();
    } catch {
      return 'Progress could not be saved in this browser.';
    }
  }
  const baseStats = { level: 1, strength: 1, defence: 1, movement: 1, endurance: 2, intelligence: 1 };
  const aptitudes = {
    strength: ['Maine Coon', 'American Bobtail', 'Norwegian Forest Cat', 'Pixiebob', 'Siberian', 'Toyger'],
    defence: ['British Shorthair', 'Chartreux', 'Manx', 'Persian', 'Scottish Fold', 'Cymric'],
    movement: ['Bengal', 'Abyssinian', 'Egyptian Mau', 'Ocicat', 'Savannah', 'Sokoke'],
    endurance: ['Ragdoll', 'Birman', 'Ragamuffin', 'Turkish Van', 'Kurilian Bobtail'],
    intelligence: ['Siamese', 'Sphynx', 'Oriental Shorthair', 'Cornish Rex', 'Balinese', 'Devon Rex']
  };
  function battleStats(cat) {
    const values = { ...baseStats };
    for (const [stat, breeds] of Object.entries(aptitudes)) {
      if (breeds.includes(cat?.breed)) values[stat]++;
    }
    return { ...values, ...cat?.stats };
  }
  function maxHealth(stats) {
    return 8 + stats.endurance * 2;
  }
  window.PawtopiaSave = { read, update, battleStats, maxHealth, today: () => new Date().toDateString() };
})();
