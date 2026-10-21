/* Mixed session: Play serves one round after another from different games, built around one "focus" sound at a time.
   - Focus: the least secure new sound of the current level. It lasts FOCUS_ROUNDS rounds, then the next one.
   - Every REVIEW_EVERY-th round revisits a wobbly sound (2 misses in its last 5 tries) instead.
   - A level opens up only when most of the new sounds of the level before are secure (right 3 times in a row).
     The grown-up "level" is a ceiling and "Mix starts at level" is a floor. So harder words only come after the sounds are secure.
   - Games take their word from the focus set via W.mixNarrow. Next in a game moves to the next game (pace.js calls advance).
   Nothing here talks to the child: no scores, streaks or timers. */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const FOCUS_ROUNDS = 8, REVIEW_EVERY = 4, MAXL = 7, SECURE_SHARE = 0.7;
  const SEQ = {
    start: ['sound', 'detective', 'spell', 'trace', 'silly', 'rhyme', 'match', 'read', 'write', 'caps', 'vocab'],
    reader: ['read', 'spell', 'match', 'read', 'silly', 'rhyme', 'detective', 'sound', 'write', 'parts', 'vocab']
  };
  const GAMES = ['sound', 'detective', 'spell', 'trace', 'silly', 'rhyme', 'match', 'read', 'write', 'caps', 'vocab', 'parts'];
  const keysOf = w => W.wordKeys(w).filter(k => k !== '_' && k.indexOf('word-') !== 0);
  const lvl = w => w.level || 1;
  const words = W.CONTENT.words.filter(w => !w.sight);

  // the new sounds each level brings
  const newKeys = {};
  (function () {
    const known = new Set();
    for (let L = 1; L <= MAXL; L++) {
      const ks = new Set();
      words.filter(w => lvl(w) === L).forEach(w => keysOf(w).forEach(k => { if (!known.has(k)) ks.add(k); }));
      newKeys[L] = Array.from(ks);
      ks.forEach(k => known.add(k));
    }
  })();
  const secure = k => { const e = W.skillOf(k); return !!e && e.s >= 3; };
  const levelDone = L => {
    const ks = newKeys[L] || [];
    return !ks.length || ks.filter(secure).length >= Math.ceil(ks.length * SECURE_SHARE);
  };
  const cap = () => { const l = W.settings.level; return Math.min(MAXL, l === 'all' ? MAXL : (Number(l) || MAXL)); };
  const floor = () => Math.max(1, Math.min(cap(), Number(W.settings.mixStart) || 1));
  function focusLevel() {
    const c = cap();
    for (let L = floor(); L < c; L++) if (!levelDone(L)) return L;
    return c;
  }

  let st = null;
  const active = () => !!(st && st.active);
  const $ = id => document.getElementById(id);

  // pictures: the same emoji as the game's tile in "More games"
  const card = g => document.querySelector('.menu-card[data-go="' + g + '"]');
  const pic = g => { const el = card(g) && card(g).querySelector('.big'); return el ? (el.dataset.pic || el.textContent) : ''; };
  const gname = g => { const el = card(g) && card(g).querySelector('strong'); return el ? el.textContent : g; };
  const seqOf = () => SEQ[(W.activeKid() || {}).order] || SEQ.start;
  // Play opens the same first game for each child; Next shows which game comes after this one
  function showPlay() {
    const g = seqOf()[0], p = $('playNext');
    if (!p) return;
    W.pic(p, pic(g));
    $('playBtn').setAttribute('aria-label', 'Play. It starts with ' + gname(g) + '.');
  }
  const NEXT_IDS = ['nextBtn', 'rNext', 'rhNext', 'dNext', 'spNext', 'syNext', 'mNext', 'tNext'];
  function showNext() {
    NEXT_IDS.forEach(id => {
      const b = $(id);
      if (!b) return;
      let s = b.querySelector('.next-pic');
      if (!s) { s = document.createElement('span'); s.className = 'next-pic'; s.setAttribute('aria-hidden', 'true'); b.appendChild(s); }
      W.pic(s, active() && st.nextGame ? pic(st.nextGame) : '');
    });
  }

  function chooseFocus() {
    const F = focusLevel();
    let pool = (newKeys[F] || []).filter(k => !secure(k));
    if (!pool.length) {                         // everything here is secure: keep the level fresh with any sound up to it
      pool = [];
      for (let L = floor(); L <= F; L++) pool = pool.concat(newKeys[L] || []);
    }
    pool = pool.filter(k => k !== st.focus);
    if (!pool.length) pool = newKeys[F] || [];
    const s = k => { const e = W.skillOf(k); return e ? e.s : -1; };
    const low = Math.min.apply(null, pool.map(s));
    const cands = pool.filter(k => s(k) === low);
    st.level = F;
    st.focus = cands.length ? W.pick(cands) : null;
    st.fr = 0;
  }
  function wordsFor(key, F) {
    const base = words.filter(w => lvl(w) >= floor() && lvl(w) <= F);
    const f = key ? base.filter(w => keysOf(w).indexOf(key) >= 0) : [];
    return f.length >= 3 ? f : base;
  }
  function planRound() {
    let key = st.focus, F = st.level;
    st.review = false;
    const weak = W.skillSummary().weak;
    if (st.rounds % REVIEW_EVERY === REVIEW_EVERY - 1 && weak.length) {
      key = W.pick(weak); st.review = true;
      const f = words.filter(w => lvl(w) <= cap() && keysOf(w).indexOf(key) >= 0);
      st.set = new Set((f.length >= 3 ? f : wordsFor(st.focus, F)).map(w => w.word));
    } else {
      st.set = new Set(wordsFor(key, F).map(w => w.word));
    }
    st.key = key;
  }
  const usable = (g, from) => g !== from && !(g === 'match' && W.matchReady && !W.matchReady());
  function pickGame() {
    const seq = seqOf();
    for (let n = 0; n < seq.length * 2; n++) {
      const g = seq[st.i++ % seq.length];
      if (usable(g, st.last)) return g;
    }
    return seq[0];
  }
  function peekGame(from) {                    // the game that comes after "from", without using it up
    const seq = seqOf();
    let i = st.i;
    for (let n = 0; n < seq.length * 2; n++) {
      const g = seq[i++ % seq.length];
      if (usable(g, from)) return { g, i };
    }
    return { g: seq[0], i };
  }
  function route(first) {
    planRound();
    let g;
    if (!first && st.nextGame && usable(st.nextGame, st.last)) { g = st.nextGame; st.i = st.nextI; }   // the game Next promised
    else g = pickGame();
    const pk = peekGame(g);
    st.nextGame = pk.g; st.nextI = pk.i;
    st.last = g; st.expect = g;
    if (first) W.go(g);
    else { W.render(g); try { history.replaceState({ s: g }, '', '#' + g); } catch (e) {} }
    showNext();
  }
  function start() {
    st = { active: true, i: 0, rounds: 0, fr: 0, focus: null, level: 1, last: null, expect: null, set: null, key: null, review: false };
    chooseFocus();
    route(true);
  }
  function advance() {
    if (!active()) return;
    st.rounds++; st.fr++;
    if (st.fr >= FOCUS_ROUNDS) chooseFocus();
    route(false);
  }

  // leaving the mix: opening any other screen, or a game from "More games", ends it
  GAMES.concat(['home', 'who', 'grown', 'sight', 'letters', 'stories', 'say']).forEach(name => {
    const prev = W.hooks.enter[name];
    W.hooks.enter[name] = () => {
      if (st && st.active) { if (st.expect === name) st.expect = null; else { st.active = false; showNext(); } }
      if (prev) prev();
      if (name === 'home') showPlay();
    };
  });
  W.on('profileChanged', () => { st = null; showNext(); showPlay(); });
  showPlay();

  W.mixSet = () => (active() ? st.set : null);
  W.mixNarrow = (list, wordOf, min) => {
    const set = W.mixSet();
    if (!set) return list;
    const f = list.filter(x => set.has(wordOf(x)));
    return f.length >= (min || 1) ? f : list;
  };
  W.mix = { start, advance, active, upNext: () => (active() ? st.nextGame : null), focus: () => (st ? { key: st.key, level: st.level, review: st.review, rounds: st.rounds } : null), levelNow: focusLevel, newKeys: () => newKeys };
})();
