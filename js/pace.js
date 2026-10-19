/* Pacing: "Next" waits until the child has tried the round, so tapping it over and over can't skip through games.
   It unlocks when the round shows its praise line, or after a short wait so nobody is ever stuck.
   A locked tap does nothing except show a friendly "Have a go first". */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const $ = id => document.getElementById(id);
  // next button -> [screen, praise element that appears once the round was tried (or null), fallback wait in ms]
  const NEXT = {
    nextBtn: ['sound', 'praise', 7000], rNext: ['read', 'rpraise', 7000], lNext: ['letters', null, 3500],
    rhNext: ['rhyme', 'rhPraise', 7000], dNext: ['detective', 'dPraise', 7000], spNext: ['spell', 'spMsg', 7000],
    syNext: ['silly', 'syPraise', 7000], tNext: ['trace', 'tPraise', 7000]
  };
  const state = {};   // id -> { locked, timer }
  let msgTimer = null;

  function setLocked(id, on) {
    const st = state[id] || (state[id] = {});
    clearTimeout(st.timer);
    st.locked = on;
    const b = $(id);
    b.classList.toggle('pace-locked', on);
    if (on) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    if (on) st.timer = setTimeout(() => setLocked(id, false), NEXT[id][2]);
  }
  function hint() {
    const m = $('paceMsg');
    m.hidden = false;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { m.hidden = true; }, 1600);
  }

  Object.keys(NEXT).forEach(id => {
    const [screen, praiseId] = NEXT[id];
    // capture phase: runs before the game's own click handler, and can stop it
    $(id).addEventListener('click', e => {
      const st = state[id];
      if (st && st.locked) { e.stopImmediatePropagation(); e.preventDefault(); hint(); return; }
      setLocked(id, true);                       // the click goes through; the next round starts locked
    }, true);
    if (praiseId) {
      const el = $(praiseId);
      new MutationObserver(() => { if (el.textContent.trim() && state[id] && state[id].locked) setLocked(id, false); })
        .observe(el, { childList: true, characterData: true, subtree: true });
    }
    const prev = W.hooks.enter[screen];
    W.hooks.enter[screen] = () => { if (prev) prev(); setLocked(id, true); };
  });
  W.pace = { isLocked: id => !!(state[id] && state[id].locked) };
})();
