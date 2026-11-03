(() => {
'use strict';
fetch('./release-policy.json', {cache:'no-store'}).then(r => {if (!r.ok) throw Error(); return r.json();}).then(policy => {
  // A config toggle cannot unlock a release; evidence and implementation are required.
  document.getElementById('gate').textContent = 'BLOCKED — native build and public launch are not verified. Ads, payments and autonomous publishing are disconnected.';
  const list = document.getElementById('blockers');
  for (const reason of policy.blockers || []) { const li = document.createElement('li'); li.textContent = reason; list.append(li); }
}).catch(() => {document.getElementById('gate').textContent = 'BLOCKED — release record unavailable. No release can be verified.';});
document.getElementById('check').addEventListener('click', () => {
  let storage = false, gl;
  try {const key='try4-readiness-probe';localStorage.setItem(key,'1');localStorage.removeItem(key);storage=true;} catch {}
  try {gl=document.createElement('canvas').getContext('webgl');} catch {}
  const lines = ['HTTPS context: '+(window.isSecureContext?'available':'missing'), 'WebGL: '+(gl?'available':'missing'), 'Local saves: '+(storage?'available':'restricted'), 'Service worker support: '+('serviceWorker' in navigator?'available':'missing'), 'Physical gameplay result: NOT TESTED by this check'];
  document.getElementById('device').textContent = lines.join('\n');
  if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
});
})();
