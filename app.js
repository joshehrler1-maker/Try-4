(() => {
  'use strict';
  const info = document.getElementById('app-status');
  const show = text => { if (info) info.textContent = text; };
  if ('serviceWorker' in navigator && window.isSecureContext && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').then(() => {
      navigator.serviceWorker.ready.then(() => show('Offline game files saved. Reopen after closing this tab to use them offline.'));
    }).catch(() => show('Offline setup could not complete. Stay online and try again.'));
  } else show('Offline installation needs a hosted HTTPS address and a supported browser.');
  let prompt;
  const button = document.getElementById('install-app');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); prompt = event; if (button) button.hidden = false;
  });
  if (button) button.addEventListener('click', async () => {
    if (!prompt) return;
    button.hidden = true;
    try { await prompt.prompt(); await prompt.userChoice; } finally { prompt = null; }
  });
})();
