(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, hooks, CONTENT, pick, shuffle } = W;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = typeof SR === 'function';

  // Speech recognition hears "eye" for "I", etc. Add more here if you see misses. Matching is forgiving, not a grade.
  const ALIASES = { a: ['a', 'uh', 'ah', 'eh'], i: ['i', 'eye', 'aye'], see: ['see', 'sea', 'c'], we: ['we', 'wee'],
                    you: ['you', 'u'], the: ['the', 'thee'], and: ['and', 'n'] };

  const speechOn = () => supported && W.settings.speech === true;

  const chipsEl = $('chips'), heardEl = $('heard'), statusEl = $('sayStatus'), listenBtn = $('listenBtn');
  let phrases = [], pi = -1, target = [], litN = 0, rec = null, listening = false;

  /* ---- text matching: lights words in order; skips anything that isn't the next word ---- */
  const tokens = s => String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const same = (heard, want) => { const t = want.toLowerCase(); return heard === t || (ALIASES[t] || []).indexOf(heard) >= 0; };
  function matchCount(heard, words) {
    let idx = 0;
    for (const h of heard) if (idx < words.length && same(h, words[idx])) idx++;
    return idx;
  }

  function say(msg) { statusEl.textContent = msg; }
  function setListening(on) {
    listening = on;
    listenBtn.classList.toggle('on', on);
    listenBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      listenBtn.innerHTML = '<span class="dot" aria-hidden="true"></span>Listening… tap to stop';
      listenBtn.setAttribute('aria-label', 'Listening. Tap to stop.');
    } else {
      listenBtn.textContent = '🎤 Listen';
      listenBtn.setAttribute('aria-label', 'Listen. Then read the words out loud.');
    }
  }
  function stopRec() {
    const r = rec;
    rec = null;
    if (r) {
      r.__quiet = true;                       // we stopped it on purpose, so no "try again" message
      try { r.abort(); } catch (e) { try { r.stop(); } catch (e2) {} }
    }
    setListening(false);
  }

  /* ---- words on screen ---- */
  function renderChips() {
    chipsEl.innerHTML = '';
    target.forEach((w, i) => {
      const c = document.createElement('span');
      c.className = 'chip'; c.setAttribute('role', 'listitem'); c.textContent = w;
      chipsEl.appendChild(c);
    });
  }
  function lightChip(i) {
    const c = chipsEl.children[i];
    if (!c || c.classList.contains('lit')) return;
    c.classList.add('lit', 'wiggle');
    c.addEventListener('animationend', () => c.classList.remove('wiggle'), { once: true });
    const s = document.createElement('span'); s.className = 'sr'; s.textContent = ' (heard)';
    c.appendChild(s);
  }
  function updateLit(n) {
    n = Math.min(n, target.length);
    for (let i = litN; i < n; i++) lightChip(i);
    if (n > litN) litN = n;
    if (litN >= target.length) { stopRec(); say(pick(CONTENT.praise)); }
  }
  function setPhrase(next) {
    stopRec();
    if (next || !phrases.length) {
      if (!phrases.length || pi >= phrases.length - 1) { phrases = shuffle(CONTENT.phrases || []); pi = -1; }
      pi++;
    }
    target = (phrases[pi] || '').split(' ').filter(Boolean);
    litN = 0;
    renderChips();
    heardEl.textContent = '';
    say('');
  }

  /* ---- listening ---- */
  const MESSAGES = {
    'not-allowed': 'The microphone is blocked. A grown-up can allow it in Safari (the “aA” menu, then Website Settings, then Microphone). Or tap “We read it”.',
    'service-not-allowed': 'Speech needs Dictation turned on. A grown-up can check Settings, then General, then Keyboard, then Enable Dictation. Or tap “We read it”.',
    'no-speech': "I didn't catch that, try again.",
    'audio-capture': "I can't find a microphone. Tap “We read it” to keep going.",
    'network': 'Speech needs the internet right now. Try again, or tap “We read it”.',
    'language-not-supported': "Speech isn't working here. Tap “We read it” to keep going."
  };
  function start() {
    if (!speechOn()) return;
    if (listening) { stopRec(); say('Stopped. Press Listen to keep going.'); return; }
    if (litN >= target.length) setPhrase(false);       // finished one already: start it fresh
    stopRec();
    let r;
    try { r = new SR(); } catch (e) { say("Speech isn't available. Tap “We read it” to keep going."); return; }
    rec = r;
    const base = litN;                                  // keep words that are already lit
    let heardAny = false, errored = false;
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onstart = () => { if (rec === r) { setListening(true); say('Listening… read the words out loud.'); } };
    r.onresult = e => {
      if (rec !== r) return;
      heardAny = true;
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += ' ' + e.results[i][0].transcript;
      heardEl.textContent = 'I heard: ' + text.trim();              // shown on screen only, never saved
      updateLit(base + matchCount(tokens(text), target.slice(base)));
    };
    r.onerror = e => {
      if (r.__quiet) return;
      errored = true;
      const code = e && e.error;
      if (code === 'aborted') return;                               // we or Safari stopped it, nothing to say
      say(MESSAGES[code] || "Speech isn't working right now. Tap “We read it” to keep going.");
    };
    r.onend = () => {
      if (rec === r) { rec = null; setListening(false); }
      if (r.__quiet || errored || litN >= target.length) return;
      say(heardAny ? 'That stopped on its own. Press Listen to keep going.' : "I didn't catch that, try again.");
    };
    setListening(true);
    say('Getting ready…');
    try { r.start(); }
    catch (e) { rec = null; setListening(false); say("I couldn't start listening. Try again, or tap “We read it”."); }
  }

  listenBtn.addEventListener('click', start);
  $('restartBtn').addEventListener('click', () => setPhrase(false));
  $('nextPhraseBtn').addEventListener('click', () => setPhrase(true));
  $('weReadBtn').addEventListener('click', () => {            // grown-up override: always available
    stopRec();
    for (let i = 0; i < target.length; i++) lightChip(i);
    litN = target.length;
    heardEl.textContent = '';
    say(pick(CONTENT.praise));
  });

  hooks.enter.say = () => {
    if (!speechOn()) { W.render('home'); return; }      // speech off means this screen is closed
    setPhrase(true);
  };
  hooks.leave.say = () => { stopRec(); heardEl.textContent = ''; };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopRec(); });
  window.addEventListener('pagehide', stopRec);

  /* ---- grown-up switch + home card ---- */
  const sw = $('swSpeech');
  function refresh() {
    const on = W.settings.speech === true;
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    sw.classList.toggle('on', on);
    sw.querySelector('.state').textContent = on ? 'On' : 'Off';
    sw.disabled = !supported;
    $('speechSupport').textContent = supported
      ? 'This browser offers speech recognition.'
      : 'This browser does not offer speech recognition, so this activity stays hidden.';
    $('sayCard').hidden = !speechOn();
  }
  sw.addEventListener('click', () => {
    if (!supported) return;
    W.settings.speech = !W.settings.speech;
    if (!W.settings.speech) stopRec();
    W.saveSettings();
    refresh();
  });
  const prevGrown = hooks.enter.grown;
  hooks.enter.grown = () => { if (prevGrown) prevGrown(); refresh(); };
  W.onReset = () => { stopRec(); refresh(); };
  refresh();
})();
