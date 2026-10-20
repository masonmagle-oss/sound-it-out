/* Offline support: registers sw.js (which saves the whole app on this device) and shows its state on the grown-ups page. */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const msg = document.getElementById('offlineMsg'), btn = document.getElementById('offlineBtn');
  if (!msg) return;
  const ok = 'serviceWorker' in navigator && /^https?:$/.test(location.protocol);
  const set = t => { msg.textContent = t; };
  if (!ok) { set('Not available here: open the live page in Safari to save it for offline use.'); btn.hidden = true; return; }
  set('Starting…');
  const check = () => navigator.serviceWorker.ready.then(r => (r.active || navigator.serviceWorker.controller).postMessage({ type: 'check' })).catch(() => set('Could not start offline support.'));
  navigator.serviceWorker.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type !== 'state') return;
    W.offlineState = d.state;
    set(d.state === 'ready' ? (d.updated ? 'Ready. Updated just now.' : 'Ready. This works without internet.')
      : d.state === 'saving' ? 'Saving for offline… ' + d.done + ' of ' + d.total + ' files'
      : d.state === 'failed' ? 'Could not save yet. Connect to the internet and tap Check for updates.'
      : 'Not saved yet. Connect to the internet and tap Check for updates.');
  });
  btn.addEventListener('click', () => { set('Checking…'); check(); });
  navigator.serviceWorker.register('sw.js').then(check).catch(() => set('Offline support could not start in this browser.'));
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}   // asks the browser not to clear the saved copy
})();
