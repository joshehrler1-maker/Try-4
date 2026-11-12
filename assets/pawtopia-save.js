(() => {
  const key = 'pawtopia-home-progress-v1';
  function read() {
    const defaults = { hero: '', coins: 0, lastClaim: '', badge: false, companion: null, food: 0, toy: false, arcadeBests: {} };
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (!saved || typeof saved !== 'object') return defaults;
      const progress = { ...defaults, ...saved };
      progress.arcadeBests = { ...saved.arcadeBests };
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
