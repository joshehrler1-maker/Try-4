(() => {
  const key = 'pawtopia-home-progress-v1';
  function read() {
    const defaults = { hero: '', coins: 0, lastClaim: '', badge: false, companion: null, food: 0, toy: false, arcadeBests: {}, townCollection: {}, bankCoins: 0, shards: 0, storageBox: { food: 0, shards: 0 }, lastWish: "", lastSoup: "", lastInterest: "", lastArena: "" };
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
  window.PawtopiaSave = { read, update, today: () => new Date().toDateString() };
})();
