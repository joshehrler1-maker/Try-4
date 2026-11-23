
(() => {
  const config = window.PawtopiaOnlineConfig;
  if (!config?.endpoint) return;
  const save = window.PawtopiaSave;
  const authKey = 'pawtopia-online-key';
  const syncKey = 'pawtopia-online-sync';
  const consentKey = 'pawtopia-cloud-sync-opt-in';
  const syncEnabled = () => config.cloudSaves === true && localStorage.getItem(consentKey) === 'yes';
  const progressKey = 'pawtopia-home-progress-v1';
  let busy = false, timer, conflict;
  function status(message) {
    const output = document.getElementById('cloud-status');
    if (output) output.textContent = message;
  }
  function key() { return localStorage.getItem(authKey) || ''; }
  async function call(path, method = 'GET', data, account = key()) {
    const headers = {};
    if (account) headers.Authorization = 'Bearer ' + account;
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    const response = await fetch(config.endpoint.replace(/\/$/,'') + path, {
      method, headers, body:data === undefined ? undefined : JSON.stringify(data), signal:AbortSignal.timeout(12000)
    });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.error || 'Online service unavailable.'),{status:response.status});
    return result;
  }
  async function fingerprint(data) {
    const bytes = new TextEncoder().encode(data);
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),
      b => b.toString(16).padStart(2,'0')).join('');
  }
  function readMarker() {
    try { return JSON.parse(localStorage.getItem(syncKey)); } catch { return null; }
  }
  function controls() {
    const banner = document.getElementById('cloud-conflict');
    if (banner) banner.hidden = !conflict;
  }
  function schedule() {
    clearTimeout(timer);
    if (syncEnabled() && key() && !conflict) timer = setTimeout(() => sync(), 1400);
  }
  async function sync(prefer) {
    const account = key();
    if (!syncEnabled() || !account || busy || (conflict && !prefer)) return;
    busy = true;
    try {
      const backup = save.exportBackup();
      const local = JSON.stringify(backup.progress);
      const digest = await fingerprint(local);
      const marker = readMarker();
      const remote = await call('/save','GET',undefined,account);
      if (key() !== account || !syncEnabled()) return;
      const remoteChanged = remote.revision !== marker?.revision;
      const localChanged = digest !== marker?.digest;
      if (!prefer && remote.payload && remoteChanged && localChanged && localStorage.getItem(progressKey)) {
        const incoming = JSON.parse(remote.payload);
        if (JSON.stringify(incoming.progress) === local) {
          localStorage.setItem(syncKey,JSON.stringify({revision:remote.revision,digest}));
          status('Progress synced.');
          return;
        }
        conflict = true;
        status('Both devices have progress. Download a backup before choosing which save to keep.');
        controls();
        return;
      }
      if (remote.payload && (prefer === 'cloud' || (remoteChanged && prefer !== 'local'))) {
        const incoming = JSON.parse(remote.payload);
        const applied = await save.applyCloudBackup(incoming, local, () => key() === account && syncEnabled());
        if (!applied) {
          schedule();
          return;
        }
        const current = JSON.stringify(save.read());
        localStorage.setItem(syncKey,JSON.stringify({revision:remote.revision,digest:await fingerprint(current)}));
        conflict = false;
        controls();
        location.reload();
        return;
      }
      if (prefer === 'local' || localChanged || !remote.payload) {
        const result = await call('/save','PUT',{revision:remote.revision,payload:JSON.stringify(backup)},account);
        if (key() !== account || !syncEnabled()) return;
        localStorage.setItem(syncKey,JSON.stringify({revision:result.revision,digest}));
      }
      conflict = false;
      controls();
      status('Progress synced.');
    } catch (error) {
      if (error.status === 409) {
        conflict = false;
        schedule();
      } else {
        status(error.status === 401 ? error.message : 'Sync paused. Your progress is saved on this device.');
      }
    } finally {
      busy = false;
    }
  }
  async function connect(account, replaces = '') {
    const prior = key();
    if (!/^[0-9a-f]{64}$/.test(account)) throw Error('Enter the complete Pawtopia account key.');
    if (prior && prior !== account && prior !== replaces) throw Error('Sign out before switching accounts.');
    await call('/session','GET',undefined,account);
    if (key() !== prior) throw Error('Sign-in changed in another tab. Sign in again.');
    if (prior !== account && !replaces) {
      localStorage.removeItem(syncKey);
      localStorage.removeItem(consentKey);
    }
    localStorage.setItem(authKey,account);
    conflict = false;
    await sync();
  }
  function setSyncEnabled(enabled) {
    if (enabled && config.cloudSaves === true && key()) {
      localStorage.setItem(consentKey,'yes');
      schedule();
      return;
    }
    localStorage.removeItem(consentKey);
    clearTimeout(timer);
    conflict = false;
    controls();
    status('Cloud sync is off on this browser.');
  }
  function disconnect() {
    localStorage.removeItem(consentKey);
    localStorage.removeItem(authKey);
    localStorage.removeItem(syncKey);
    clearTimeout(timer);
    conflict = false;
    controls();
  }
  window.PawtopiaOnline = {call, key, connect, disconnect, sync, syncEnabled, setSyncEnabled};
  addEventListener('pawtopia-save-changed',schedule);
  addEventListener('storage',event => {
    if (event.key === progressKey || event.key === authKey || event.key === consentKey) schedule();
  });
  addEventListener('online',schedule);
  addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',() => { if (!document.hidden) schedule(); });
  setInterval(() => { if (!document.hidden && navigator.onLine && syncEnabled() && key() && !conflict) sync(); },60000);
  schedule();
})();
