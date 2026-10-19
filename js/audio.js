(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT } = W;
  const cfg = CONTENT.sounds || {};
  const FOLDER = cfg.folder || 'sounds/';
  const EXTS = (cfg.extensions && cfg.extensions.length) ? cfg.extensions : ['m4a', 'mp3', 'wav'];
  const soundOn = () => W.settings.sound !== false;
  const tileKey = u => window.WordPlayUnit.key(u);
  const wordKey = w => 'word-' + String(w.word).toLowerCase();

  const soundWords = CONTENT.words.filter(w => !w.sight);
  const tileKeys = Array.from(new Set(soundWords.reduce((a, w) => a.concat(w.units.map(tileKey)), []))).filter(k => k !== '_');
  const sightKeys = CONTENT.words.filter(w => w.sight).map(wordKey);
  const sentenceKeys = (CONTENT.sentences || []).concat((CONTENT.stories || []).reduce((a, s) => a.concat(s.lines.map(t => ({ text: t }))), [])).map(x => 'sentence-' + x.text.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/ +/g, '-'));
  const letterList = CONTENT.letters || [];
  const letterKeys = letterList.map(x => 'letter-' + x.l).concat(letterList.map(x => 'word-' + x.word));
  const wordKeys = soundWords.map(wordKey).concat(sightKeys.filter(k => k !== 'word-can'), sentenceKeys, letterKeys);

  /* ---- which files exist? (same-folder HEAD requests; nothing leaves the site) ---- */
  const found = {};        // key -> url, or null once checked and missing
  const pending = {};
  let couldNotCheck = false;
  function resolve(key, force) {
    if (!force && key in found) return Promise.resolve(found[key]);
    if (pending[key]) return pending[key];
    pending[key] = (async () => {
      try {
        for (const ext of EXTS) {
          const url = FOLDER + key + '.' + ext;
          const r = await fetch(url, { method: 'HEAD' });
          if (r.ok) { found[key] = url; return url; }
        }
        found[key] = null;
        return null;
      } catch (e) {
        // Opened as a local file, or can't reach the folder: try the first format when played.
        couldNotCheck = true;
        found[key] = FOLDER + key + '.' + EXTS[0];
        return found[key];
      } finally {
        delete pending[key];
      }
    })();
    return pending[key];
  }

  /* ---- playback: one audio element, clips play one after another (so a slide sounds like s... u... n...) ---- */
  const audio = new Audio();
  audio.preload = 'auto';
  let playing = false, unlocked = false, queue = [], clipId = 0;
  function pump() {
    if (playing) return;
    const url = queue.shift();
    if (!url) return;
    playing = true;
    const my = ++clipId;                      // so a late rejection from an older clip can never disturb this one
    audio.src = url;
    try {
      const p = audio.play();
      if (p && p.catch) p.catch(e => {
        if (my !== clipId) return;
        playing = false;
        if (e && e.name === 'AbortError') { pump(); return; }    // interrupted by us: carry on
        queue.length = 0;                                         // blocked or unsupported: stay quiet
      });
    } catch (e) { playing = false; queue.length = 0; }
  }
  audio.addEventListener('ended', () => { playing = false; pump(); });
  audio.addEventListener('error', () => { playing = false; pump(); });
  function stop() {
    clipId++;
    queue.length = 0;
    playing = false;
    try { audio.pause(); } catch (e) {}
  }
  function enqueue(key) {
    if (key === '_') return;
    const url = found[key];
    if (!url || !soundOn()) return;
    if (queue.length >= 8) return;
    queue.push(url);
    pump();
  }

  // iOS only lets a page play audio after a tap. The first tap anywhere (for example on the Home card)
  // plays a tiny silent clip through the same audio element, which unlocks it for later sounds.
  function silentWav() {
    const n = 400, buf = new Uint8Array(44 + n), dv = new DataView(buf.buffer);
    const tag = (o, s) => { for (let i = 0; i < s.length; i++) buf[o + i] = s.charCodeAt(i); };
    tag(0, 'RIFF'); dv.setUint32(4, 36 + n, true); tag(8, 'WAVE'); tag(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true);
    tag(36, 'data'); dv.setUint32(40, n, true); buf.fill(128, 44);
    let s = ''; for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
    return 'data:audio/wav;base64,' + btoa(s);
  }
  const SILENT = silentWav();
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (playing || queue.length) return;
    try {
      playing = true;
      const my = ++clipId;
      audio.src = SILENT;
      const p = audio.play();
      if (p && p.catch) p.catch(e => {
        if (my !== clipId) return;
        playing = false;
        if (!e || e.name !== 'AbortError') unlocked = false;      // really blocked: try again on the next tap
      });
    } catch (e) { playing = false; unlocked = false; }
  }
  ['pointerup', 'touchend', 'click', 'keydown'].forEach(t => document.addEventListener(t, unlock, true));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);

  /* ---- hook into Sound it out ---- */
  const note = $('soundNote');
  const QUIET = note.textContent;
  let shown = null;
  W.on('wordLoaded', w => {
    stop();
    shown = w;
    note.textContent = QUIET;
    const tiles = w.units.map(tileKey);
    Promise.all(tiles.filter(k => k !== '_').concat(wordKey(w)).map(k => resolve(k))).then(() => {
      if (shown !== w || couldNotCheck) return;
      if (tiles.some(k => found[k])) note.textContent = 'Each sound plays your recording. Say it out loud together!';
    });
  });
  W.on('tileLit', unit => enqueue(tileKey(unit)));
  W.on('wordBlended', w => enqueue(wordKey(w)));
  W.on('leaveSound', stop);
  // for the Read a sentence screen
  W.playKey = key => resolve(key).then(() => enqueue(key));
  W.stopSound = stop;
  W.wordKeyOf = x => 'word-' + String(x).toLowerCase().replace(/[^a-z]/g, '');
  W.sentenceKeyOf = t => 'sentence-' + String(t).toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/ +/g, '-');

  /* ---- grown-ups panel ---- */
  $('needTiles').textContent = tileKeys.length + ' sounds, like ' + tileKeys.slice(0, 12).join(', ') + ' … (each saved like ' + tileKeys[0] + '.' + EXTS[0] + ')';
  $('needWords').textContent = soundWords.length + ' sound words, ' + sightKeys.length + ' sight words, ' + sentenceKeys.length + ' sentences and 26 letters (saved like word-' + soundWords[0].word + '.' + EXTS[0] + ', sentence-i-see-a-red-bug.' + EXTS[0] + ', letter-a.' + EXTS[0] + '). Tap “Check sound files” to see which are missing.';

  async function check() {
    const msg = $('soundCheck'), list = $('soundList');
    list.innerHTML = '';
    msg.textContent = 'Checking…';
    couldNotCheck = false;
    const keys = tileKeys.concat(wordKeys);
    await Promise.all(keys.map(k => resolve(k, true)));
    if (couldNotCheck) {
      msg.textContent = "Can't check from a local file. Once the site is online, this will show which recordings were found.";
      return;
    }
    const have = keys.filter(k => found[k]), miss = keys.filter(k => !found[k]);
    msg.textContent = 'Found ' + have.length + ' of ' + keys.length + '.' +
      (miss.length ? ' Missing: ' + miss.join(', ') + '.' : ' Everything is in place.');
    have.forEach(k => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ghost';
      b.textContent = '▶ ' + (k.indexOf('word-') === 0 ? 'word: ' + k.slice(5) : k);
      b.setAttribute('aria-label', 'Play ' + b.textContent.slice(2));
      b.addEventListener('click', () => { stop(); queue.push(found[k]); pump(); });   // plays even when the switch is Off, for checking
      list.appendChild(b);
    });
  }
  $('checkSoundsBtn').addEventListener('click', check);

  const sw = $('swSound');
  function refresh() {
    const on = soundOn();
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    sw.classList.toggle('on', on);
    sw.querySelector('.state').textContent = on ? 'On' : 'Off';
  }
  sw.addEventListener('click', () => {
    W.settings.sound = !soundOn();
    if (!W.settings.sound) stop();
    W.saveSettings();
    refresh();
  });
  const prevGrown = W.hooks.enter.grown;
  W.hooks.enter.grown = () => { if (prevGrown) prevGrown(); refresh(); };
  const prevReset = W.onReset;
  W.onReset = () => { if (prevReset) prevReset(); stop(); refresh(); };
  refresh();
})();
