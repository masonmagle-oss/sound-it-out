(function () {
  'use strict';
  const CONTENT = window.WORDPLAY_CONTENT;

  const $ = id => document.getElementById(id);
  const reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  // No countdowns anywhere for the child; this is only animation pacing. Shortened when motion is reduced.
  const sleep = ms => new Promise(r => setTimeout(r, reduced.matches ? Math.min(ms, 120) : ms));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }

  /* ---------------- on-device storage (safe if blocked) ---------------- */
  const SETTINGS_KEY = 'wordplay.settings.v1';
  const PROGRESS_KEY = 'wordplay.progress.v1';
  const mem = {};
  const store = {
    read(k, fallback) {
      let raw = null;
      try { raw = window.localStorage.getItem(k); } catch (e) {}
      if (raw != null) { try { return JSON.parse(raw); } catch (e) {} }
      return (k in mem) ? mem[k] : fallback;
    },
    write(k, v) {
      mem[k] = v;
      try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    },
    clear(k) {
      delete mem[k];
      try { window.localStorage.removeItem(k); } catch (e) {}
    }
  };
  const strList = v => Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
  function normProgress(p) {
    p = (p && typeof p === 'object') ? p : {};
    return { soundedOut: strList(p.soundedOut), sightGot: strList(p.sightGot), sightPractice: strList(p.sightPractice) };
  }
  let settings = Object.assign({ remember: false, level: 'all' }, store.read(SETTINGS_KEY, {}));
  settings.remember = settings.remember === true;
  settings.speech = settings.speech === true;          // speech is OFF until a grown-up turns it on
  settings.sound = settings.sound !== false;           // playing your recordings is ON (silent anyway if no files)
  let progress = normProgress(store.read(PROGRESS_KEY, null));

  function saveSettings() { store.write(SETTINGS_KEY, settings); }
  function mark(list, word) {
    if (!settings.remember) return;       // nothing is kept unless a grown-up turns this on
    if (list === 'sightGot') progress.sightPractice = progress.sightPractice.filter(w => w !== word);
    if (list === 'sightPractice') progress.sightGot = progress.sightGot.filter(w => w !== word);
    if (progress[list].indexOf(word) < 0) progress[list].push(word);
    store.write(PROGRESS_KEY, progress);
  }

  /* ---------------- sound skills (adaptive practice) ----------------
     Kept in memory for this visit. Saved on this device only when a grown-up turns "Remember" on. */
  const SKILLS_KEY = 'wordplay.skills.v1';
  let skills = {};
  (function () { const s = settings.remember ? store.read(SKILLS_KEY, {}) : {}; if (s && typeof s === 'object') skills = s; })();
  function track(key, ok) {
    if (!key || key === '_' || String(key).indexOf('word-') === 0) return;
    const e = skills[key] || (skills[key] = { r: 0, m: 0, s: 0 });
    if (ok) { e.r++; e.s++; } else { e.m++; e.s = 0; }
    if (settings.remember) store.write(SKILLS_KEY, skills);
  }
  function need(key) {                       // how much a sound should show up
    const e = skills[key];
    if (!e) return 2;                        // new: introduce it
    if (e.s >= 3) return 0.4;                // secure: keep it rare
    return e.m > 0 && e.s < 2 ? 4 : 1;       // wobbly: bring it back soon
  }
  function pickAdaptive(list, keysOf) {
    const wts = list.map(x => Math.max.apply(null, keysOf(x).map(need).concat(0.4)));
    let t = Math.random() * wts.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) { t -= wts[i]; if (t <= 0) return list[i]; }
    return list[list.length - 1];
  }
  const wordKeys = w => w.units.map(u => String(u).split(':').length > 1 ? String(u).split(':')[1].toLowerCase() : String(u).toLowerCase());
  function skillSummary() {
    const weak = [], solid = [];
    Object.keys(skills).forEach(k => { const e = skills[k]; if (e.s >= 3) solid.push(k); else if (e.m > 0 && e.s < 2) weak.push(k); });
    return { weak, solid };
  }
  function clearSkills() { skills = {}; store.clear(SKILLS_KEY); }

  /* ---------------- navigation ---------------- */
  const TITLES = { home: 'Word play', sound: 'Sound it out', sight: 'Sight words', read: 'Read a sentence', say: 'Say the word', letters: 'Letters', rhyme: 'Rhyme time', detective: 'Sound detective', spell: 'Spell it', silly: 'Silly words', trace: 'Trace letters', stories: 'Little stories', grown: 'For grown-ups' };
  const hooks = { enter: {}, leave: {} };
  let current = 'home';

  function render(name) {
    const old = current;
    if (hooks.leave[old]) hooks.leave[old]();
    current = name;
    Object.keys(TITLES).forEach(k => { const el = $('screen-' + k); if (el) el.hidden = (k !== name); });
    $('backBtn').hidden = (name === 'home');
    $('title').textContent = TITLES[name] || 'Word play';
    window.scrollTo(0, 0);
    if (hooks.enter[name]) hooks.enter[name]();
    try { $('title').focus({ preventScroll: true }); } catch (e) {}
  }
  function go(name) {
    if (name === current) return;
    try { history.pushState({ s: name }, '', '#' + name); } catch (e) {}
    render(name);
  }
  window.addEventListener('popstate', e => render((e.state && e.state.s) || 'home'));
  try { history.replaceState({ s: 'home' }, '', location.pathname + location.search); } catch (e) {}
  $('backBtn').addEventListener('click', () => {
    if (history.state && history.state.s && history.state.s !== 'home') { try { history.back(); return; } catch (e) {} }
    render('home');
  });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-go]');
    if (b) go(b.getAttribute('data-go'));
  });
  // tiny event bus so the optional sound / speech blocks never touch the activity code
  const listeners = {};
  function on(name, fn) { (listeners[name] = listeners[name] || []).push(fn); }
  function emit(name) {
    const args = Array.prototype.slice.call(arguments, 1);
    (listeners[name] || []).forEach(fn => { try { fn.apply(null, args); } catch (e) {} });
  }
  window.WordPlay = { track, pickAdaptive, wordKeys, skillSummary, stageLimit, go, render, hooks, on, emit, CONTENT, store, get settings() { return settings; }, saveSettings, sleep, reduced, pick, shuffle, mark, $ };

  /* =====================================================================
     ACTIVITY 1: Sound it out
     ===================================================================== */
  const tilesEl = $('tiles'), stageEl = $('stage'), emoEl = $('emo'), praiseEl = $('praise'), srWordEl = $('srWord');
  const soundWords = CONTENT.words.filter(w => !w.sight);
  let order = [], oi = -1, cur = null, run = 0, finished = false;
  const lit = new Set();

  // A unit is 'text' or 'text:key'. text is what the tile shows; key picks the sound file
  // (for example 'a:a_long' shows a but plays a_long.mp3; key '_' is a silent letter).
  function unitText(u) { return String(u).split(':')[0]; }
  function unitKey(u) { const p = String(u).split(':'); return (p.length > 1 ? p[1] : p[0]).toLowerCase(); }
  window.WordPlayUnit = { text: unitText, key: unitKey };
  const LEVELS = [['all', 'All'], ['1', '1 · short vowels'], ['2', '2 · blends, sh ch th ck'], ['3', '3 · long vowels'], ['4', '4 · ar er or ou oi'], ['5', '5 · vowel teams, word families'], ['6', '6 · compound words'], ['7', '7 · more spelling patterns']];
  function stageLimit() { return settings.level === 'all' ? 99 : Number(settings.level) || 99; }
  function sightByStage() {
    const lim = stageLimit();
    const list = sightAll.filter(w => (w.level || 1) <= lim);
    return list.length ? list : sightAll;
  }
  function levelWords() {
    const L = settings.level;
    const list = L === 'all' ? soundWords : soundWords.filter(w => (w.level || 1) <= Number(L));
    return list.length ? list : soundWords;
  }

  function nextWord() {
    if (!order.length || oi >= order.length - 1) {
      order = shuffle(levelWords());
      if (cur && order.length > 1 && order[0] === cur) { const t = order[0]; order[0] = order[1]; order[1] = t; }
      oi = -1;
    }
    oi++;
    loadWord(order[oi]);
  }

  function loadWord(w) {
    run++;                       // cancels any blend still in progress
    cur = w; finished = false; lit.clear();
    tilesEl.className = 'tiles';
    tilesEl.innerHTML = '';
    w.units.forEach((u, i) => {
      const b = document.createElement('button');
      const ut = unitText(u);
      b.type = 'button'; b.className = 'tile'; b.textContent = ut; b.dataset.i = i;
      b.setAttribute('aria-label', unitKey(u) === '_' ? 'silent ' + ut : 'sound ' + ut);
      b.setAttribute('aria-pressed', 'false');
      tilesEl.appendChild(b);
    });
    stageEl.classList.remove('show');
    stageEl.removeAttribute('data-ground');
    emoEl.className = 'emo'; emoEl.textContent = '';
    praiseEl.textContent = ''; srWordEl.textContent = '';
    emit('wordLoaded', w);
  }

  function light(i) {
    if (finished || lit.has(i)) return;
    const el = tilesEl.children[i];
    if (!el) return;
    lit.add(i);
    emit('tileLit', cur.units[i], cur);              // runs inside the touch handler, which iOS needs for audio
    el.classList.add('lit', 'wiggle');
    el.setAttribute('aria-pressed', 'true');
    el.addEventListener('animationend', () => el.classList.remove('wiggle'), { once: true });
    if (lit.size === cur.units.length) blend();
  }

  async function blend() {
    finished = true;
    const my = run, w = cur;
    await sleep(500);                      if (my !== run) return;
    tilesEl.classList.add('blend');        // tiles slide together
    await sleep(800);                      if (my !== run) return;
    srWordEl.textContent = 'The word is ' + w.word + '.';
    showPicture(w);
    emit('wordBlended', w);
    mark('soundedOut', w.word);
  }

  function showPicture(w) {
    if (w.ground) stageEl.setAttribute('data-ground', w.ground);
    emoEl.textContent = w.emoji || '';
    emoEl.className = 'emo anim-' + (w.anim || 'pop');
    void emoEl.offsetWidth;                // restart animation
    stageEl.classList.add('show');
    praiseEl.textContent = pick(CONTENT.praise);
  }

  /* --- touch / mouse: taps AND slides, sampled along the path so fast or tiny moves never skip a tile --- */
  let dragging = false, last = null, rects = [];
  function cacheRects() { rects = Array.prototype.map.call(tilesEl.children, el => el.getBoundingClientRect()); }
  function hit(x, y) {
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    // forgiving margin so a slightly wobbly finger still counts
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 16 && y <= r.bottom + 16) return i;
    }
    return -1;
  }
  function sweep(x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 6));
    for (let s = 0; s <= steps; s++) {
      const i = hit(x0 + dx * s / steps, y0 + dy * s / steps);
      if (i >= 0) light(i);
    }
  }
  tilesEl.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    cacheRects();
    last = { x: e.clientX, y: e.clientY };
    sweep(last.x, last.y, last.x, last.y);
    try { tilesEl.setPointerCapture(e.pointerId); } catch (err) {}
  });
  tilesEl.addEventListener('pointermove', e => {
    if (!dragging) return;
    const evs = (typeof e.getCoalescedEvents === 'function' && e.getCoalescedEvents().length) ? e.getCoalescedEvents() : [e];
    for (const ev of evs) {
      sweep(last.x, last.y, ev.clientX, ev.clientY);
      last = { x: ev.clientX, y: ev.clientY };
    }
  });
  const endDrag = () => { dragging = false; last = null; };   // lit tiles stay lit
  tilesEl.addEventListener('pointerup', endDrag);
  tilesEl.addEventListener('pointercancel', endDrag);
  tilesEl.addEventListener('lostpointercapture', endDrag);
  // keyboard / VoiceOver activation
  tilesEl.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.tile');
    if (b) light(Number(b.dataset.i));
  });
  tilesEl.addEventListener('contextmenu', e => e.preventDefault());

  $('againBtn').addEventListener('click', () => { if (cur) loadWord(cur); });
  $('nextBtn').addEventListener('click', nextWord);
  hooks.enter.sound = nextWord;
  hooks.leave.sound = () => { run++; endDrag(); emit('leaveSound'); };

  /* =====================================================================
     ACTIVITY 2: Sight words
     ===================================================================== */
  const sightWordEl = $('sightWord');
  const sightAll = CONTENT.words.filter(w => w.sight);
  let deck = [], card = null;

  function buildDeck() {
    let d = shuffle(sightByStage());
    if (settings.remember) {
      const p = new Set(progress.sightPractice), g = new Set(progress.sightGot);
      const rank = w => p.has(w.word) ? 0 : g.has(w.word) ? 2 : 1;
      d = d.map((w, i) => ({ w, i })).sort((a, b) => rank(a.w) - rank(b.w) || a.i - b.i).map(x => x.w);
    }
    return d;
  }
  function showCard() {
    card = deck[0] || null;
    const done = !card;
    $('sightPlay').hidden = done;
    $('sightDone').hidden = !done;
    if (!card) return;
    revealCard();
  }
  function revealCard() {
    sightWordEl.innerHTML = '';
    const sr = document.createElement('span');
    sr.className = 'sr'; sr.textContent = card.word;
    sightWordEl.appendChild(sr);
    card.units.forEach((u, i) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.textContent = unitText(u); s.style.setProperty('--i', i);
      s.setAttribute('aria-hidden', 'true');
      sightWordEl.appendChild(s);
    });
  }
  function startDeck() { deck = buildDeck(); showCard(); }
  $('replayBtn').addEventListener('click', () => { if (card) revealCard(); });
  $('gotBtn').addEventListener('click', () => {
    if (!card) return;
    mark('sightGot', card.word);
    deck.shift(); showCard();
  });
  $('practiceBtn').addEventListener('click', () => {
    if (!card) return;
    mark('sightPractice', card.word);
    const w = deck.shift();
    deck.splice(Math.min(3, deck.length), 0, w);   // comes back a few cards later
    showCard();
  });
  $('sightAgainBtn').addEventListener('click', startDeck);
  hooks.enter.sight = startDeck;

  /* =====================================================================
     Grown-ups
     ===================================================================== */
  function setSwitch(btn, on) {
    btn.setAttribute('aria-checked', on ? 'true' : 'false');
    btn.classList.toggle('on', on);
    const st = btn.querySelector('.state'); if (st) st.textContent = on ? 'On' : 'Off';
  }
  function renderProgress() {
    const box = $('progressList');
    box.innerHTML = '';
    const add = (label, list) => {
      const p = document.createElement('p');
      p.textContent = label + ': ' + (list.length ? list.join(', ') : 'none yet');
      box.appendChild(p);
    };
    if (!settings.remember) {
      const p = document.createElement('p'); p.className = 'small';
      p.textContent = 'Not saving anything right now. The practice games still adapt during this visit.';
      box.appendChild(p);
      add('Sounds going well (this visit)', skillSummary().solid);
      add('Sounds to practice more (this visit)', skillSummary().weak);
      return;
    }
    const ss = skillSummary();
    add('Sounds going well', ss.solid);
    add('Sounds to practice more', ss.weak);
    add('Words sounded out', progress.soundedOut);
    add('Marked “Got it”', progress.sightGot);
    add('Marked “Practice more”', progress.sightPractice);
  }
  function renderLevels() {
    const box = $('levelBtns');
    box.innerHTML = '';
    LEVELS.forEach(([val, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn' + (settings.level === val ? '' : ' ghost');
      b.textContent = label;
      b.setAttribute('aria-pressed', settings.level === val ? 'true' : 'false');
      b.addEventListener('click', () => {
        settings.level = val; saveSettings(); order = []; renderLevels();
      });
      box.appendChild(b);
    });
  }
  function renderGrown() {
    renderLevels();
    setSwitch($('swRemember'), settings.remember);
    renderProgress();
    disarmReset();
  }
  $('swRemember').addEventListener('click', () => {
    settings.remember = !settings.remember;
    if (settings.remember) store.write(SKILLS_KEY, skills);
    if (!settings.remember) { progress = normProgress(null); store.clear(PROGRESS_KEY); store.clear(SKILLS_KEY); }
    saveSettings();
    renderGrown();
  });
  let armed = false, armTimer = null;
  function disarmReset() { armed = false; clearTimeout(armTimer); $('resetBtn').textContent = 'Reset'; }
  $('resetBtn').addEventListener('click', () => {
    const msg = $('resetMsg');
    if (!armed) {
      armed = true; msg.textContent = '';
      $('resetBtn').textContent = 'Tap again to erase everything';
      armTimer = setTimeout(disarmReset, 6000);
      return;
    }
    store.clear(PROGRESS_KEY); store.clear(SETTINGS_KEY);
    clearSkills(); progress = normProgress(null); settings = { remember: false, speech: false, sound: true, level: 'all' };
    if (window.WordPlay.onReset) window.WordPlay.onReset();
    renderGrown();
    msg.textContent = 'Erased. Nothing is saved on this device now.';
  });
  hooks.enter.grown = () => { $('resetMsg').textContent = ''; $('backupMsg').textContent = ''; renderGrown(); };
  /* ---------------- backup: save to a file, load from a file ---------------- */
  const BACKUP_KIND = 'sound-it-out-progress';
  function say(msg) { $('backupMsg').textContent = msg; }
  function makeBackup() {
    return { kind: BACKUP_KIND, version: 1, saved: new Date().toISOString().slice(0, 10), level: settings.level, progress: normProgress(progress), skills: skills };
  }
  function mergeBackup(b) {                  // adds to what is here; never removes anything
    if (!b || b.kind !== BACKUP_KIND || !b.progress) return false;
    const inc = normProgress(b.progress);
    ['soundedOut', 'sightGot', 'sightPractice'].forEach(k => inc[k].forEach(w => { if (progress[k].indexOf(w) < 0) progress[k].push(w); }));
    progress.sightPractice = progress.sightPractice.filter(w => progress.sightGot.indexOf(w) < 0);
    const n = v => (typeof v === 'number' && isFinite(v) && v >= 0) ? Math.floor(v) : 0;
    Object.keys(b.skills && typeof b.skills === 'object' ? b.skills : {}).forEach(k => {
      const e = b.skills[k] || {}, mine = skills[k];
      const inEntry = { r: n(e.r), m: n(e.m), s: n(e.s) };
      if (!mine || inEntry.r + inEntry.m > mine.r + mine.m) skills[k] = inEntry;   // keep the one with more practice
    });
    if (b.level === 'all' || LEVELS.some(l => l[0] === String(b.level))) settings.level = String(b.level);
    settings.remember = true;                // restored progress is only kept if saving is on
    store.write(PROGRESS_KEY, progress); store.write(SKILLS_KEY, skills); saveSettings();
    return true;
  }
  $('exportBtn').addEventListener('click', () => {
    try {
      const b = makeBackup();
      const blob = new Blob([JSON.stringify(b, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'sound-it-out-backup-' + b.saved + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      say('Backup saved. Look in your Downloads or Files app.');
    } catch (e) { say('Could not save a backup on this browser.'); }
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let ok = false;
      try { ok = mergeBackup(JSON.parse(String(r.result))); } catch (err) {}
      renderGrown();
      say(ok ? 'Backup loaded. Saving is now on.' : 'That file is not a Sound it out backup. Nothing changed.');
    };
    r.onerror = () => say('Could not read that file. Nothing changed.');
    r.readAsText(f);
  });
  window.WordPlay.backup = { make: makeBackup, merge: mergeBackup };


  render('home');
})();
