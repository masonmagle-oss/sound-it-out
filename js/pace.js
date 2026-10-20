/* Pacing: "Next" waits until the child has finished the round, so tapping it over and over can't skip through games.
   It unlocks once the round shows its praise line (only a finished round writes one; a wrong answer does not)
   and the sound has finished playing. If a round is stuck for STUCK_MS the game shows the answer itself (no praise,
   not counted toward "All done for today") and Next unlocks, so nobody is ever stuck. Nothing counts down on screen.
   A locked tap does nothing except show a friendly "Have a go first". After a wrong tap the answer buttons rest briefly. */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const $ = id => document.getElementById(id);
  const STUCK_MS = 15000, LETTER_MS = 4500, GRACE_MS = 1200, REST_MS = 1200;
  const isPraise = t => W.CONTENT.praise.some(p => t.indexOf(p) >= 0);
  // next button -> [screen, praise element that appears once the round is finished (null = timed only)]
  const NEXT = {
    nextBtn: ['sound', 'praise'], rNext: ['read', 'rpraise'], lNext: ['letters', null],
    rhNext: ['rhyme', 'rhPraise'], dNext: ['detective', 'dPraise'], spNext: ['spell', 'spMsg'],
    syNext: ['silly', 'syPraise'], tNext: ['trace', 'tPraise']
  };
  const state = {};   // id -> { locked, stuck, idle }
  let msgTimer = null;

  function clear(st) { clearTimeout(st.stuck); clearTimeout(st.idle); }
  // unlock after a short grace, once no sound is playing
  function unlockWhenQuiet(id) {
    const st = state[id];
    clearTimeout(st.idle);
    const t0 = Date.now();
    const poll = () => {
      if (!st.locked) return;
      if ((W.audioBusy && W.audioBusy() && Date.now() - t0 < 8000)) { st.idle = setTimeout(poll, 150); return; }
      setLocked(id, false);
    };
    st.idle = setTimeout(poll, GRACE_MS);
  }
  function setLocked(id, on) {
    const st = state[id] || (state[id] = {});
    clear(st);
    st.locked = on;
    if (on) W.roundStart = Date.now();            // lets track() tell a real answer from a joke tap
    const b = $(id);
    b.classList.toggle('pace-locked', on);
    if (on) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    if (!on) return;
    const [screen, praiseId] = NEXT[id];
    if (!praiseId) { st.stuck = setTimeout(() => setLocked(id, false), LETTER_MS); return; }
    st.stuck = setTimeout(() => {
      const reveal = W.reveal && W.reveal[screen];
      if (reveal) reveal();
      unlockWhenQuiet(id);
    }, window.__PACE_STUCK_MS || STUCK_MS);   // (the override is a test hook)
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
      new MutationObserver(() => {
        const st = state[id];
        if (st && st.locked && isPraise(el.textContent)) { clearTimeout(st.stuck); unlockWhenQuiet(id); }
      }).observe(el, { childList: true, characterData: true, subtree: true });
    }
    const prev = W.hooks.enter[screen];
    W.hooks.enter[screen] = () => { if (prev) prev(); setLocked(id, true); };
  });

  // A wrong tap makes the answer buttons rest for a moment, so tapping every choice at random takes real time.
  ['dChoices', 'rchoices', 'syChoices'].forEach(cid => {
    const box = $(cid);
    new MutationObserver(list => {
      for (const m of list) {
        if (m.type === 'attributes' && m.target.classList.contains('heard-it') && !m.oldValue.includes('heard-it')) {
          box.classList.add('resting');
          clearTimeout(box._rest);
          box._rest = setTimeout(() => box.classList.remove('resting'), REST_MS);
          return;
        }
      }
    }).observe(box, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
  });

  W.pace = { isLocked: id => !!(state[id] && state[id].locked), STUCK_MS };
})();
