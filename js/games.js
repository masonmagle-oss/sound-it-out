(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT, hooks } = W;
  const U = window.WordPlayUnit;
  let seq = 0;
  async function playSeq(keys) {
    if (!W.playKey) return;
    const my = ++seq;
    if (W.stopSound) W.stopSound();
    for (const k of keys) { if (my !== seq) return; await W.playKey(k); }
  }
  const stopSeq = () => { seq++; if (W.stopSound) W.stopSound(); };
  const sounding = w => w.units.filter(u => U.key(u) !== '_');

  /* ================= SOUND DETECTIVE ================= */
  W.reveal = W.reveal || {};   // pace.js calls these when a round has been stuck for a while: show the answer, never praise it
  let mode = 'begin', dWord = null, dSolved = false, dLast = null, dRight = null;
  const dChoices = $('dChoices'), dPraise = $('dPraise');
  const plain = w => w.units.some(u => U.key(u).indexOf('word-') === 0);
  function dPool() {
    const lim = Math.min(W.stageLimit(), 6);
    const p = CONTENT.words.filter(w => !w.sight && w.emoji && (w.level || 1) <= lim && sounding(w).length >= 2 && !plain(w));
    return p.length >= 6 ? p : CONTENT.words.filter(w => !w.sight && w.emoji && sounding(w).length >= 2 && (w.level || 1) <= 3 && !plain(w));
  }
  const target = w => { const s = sounding(w); return mode === 'end' ? s[s.length - 1] : s[0]; };
  function dRound() {
    stopSeq(); dSolved = false; dPraise.textContent = '';
    const pool = dPool();
    const dk = x => mode === 'count' ? ['count'] : [U.key(target(x))];
    let w = W.pickAdaptive(pool, dk), t = 0;
    while (t++ < 8 && w.word === dLast) w = W.pickAdaptive(pool, dk);
    dWord = w; dLast = w.word; dTried = false;
    $('dEmo').textContent = w.emoji;
    $('dPrompt').textContent = mode === 'begin' ? 'What sound does it start with?' : mode === 'end' ? 'What sound does it end with?' : 'How many sounds do you hear?';
    dChoices.innerHTML = '';
    let opts = [];
    if (mode === 'count') {
      const n = sounding(w).length;
      const vals = [n];
      [n - 1, n + 1, n + 2, n - 2].forEach(v => { if (v >= 2 && v <= 6 && vals.length < 3 && vals.indexOf(v) < 0) vals.push(v); });
      opts = W.shuffle(vals).map(v => ({ label: String(v), correct: v === n, key: null }));
    } else {
      const tu = target(w), tk = U.key(tu);
      const seen = { [tk]: true }, others = [];
      W.shuffle(pool).forEach(x => {
        const u = target(x), k = U.key(u);
        if (!seen[k] && others.length < 2) { seen[k] = true; others.push(u); }
      });
      opts = W.shuffle([tu].concat(others)).map(u => ({ label: U.text(u), correct: U.key(u) === tk, key: U.key(u) }));
    }
    opts.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'dchoice'; b.textContent = o.label;
      b.setAttribute('aria-label', mode === 'count' ? o.label + ' sounds' : 'the sound ' + o.label);
      b.addEventListener('click', () => dChoose(b, o));
      if (o.correct) dRight = { b, o };
      dChoices.appendChild(b);
    });
    playSeq(['word-' + w.word]);
  }
  let dTried = false;
  function dChoose(b, o) {
    if (dSolved) return;
    if (!dTried && mode !== 'count') { dTried = true; W.track(U.key(target(dWord)), !!o.correct); }
    const w = dWord, units = sounding(w).map(U.key);
    if (o.correct) {
      dSolved = true; b.classList.add('right');
      dPraise.textContent = mode === 'count'
        ? w.word + ' has ' + o.label + ' sounds! ' + W.pick(CONTENT.praise)
        : w.word + ' ' + (mode === 'begin' ? 'starts' : 'ends') + ' with ' + o.label + '. ' + W.pick(CONTENT.praise);
      playSeq(mode === 'count' ? units.concat('word-' + w.word) : [o.key, 'word-' + w.word]);
    } else {
      b.classList.add('heard-it');
      dPraise.textContent = mode === 'count' ? "Let's count the sounds together." : 'Listen to the word again. Try another one.';
      playSeq(mode === 'count' ? units : [o.key, 'word-' + w.word]);
    }
  }
  W.reveal.detective = () => {
    if (dSolved || !dRight) return;
    dSolved = true; dRight.b.classList.add('right');
    const w = dWord, o = dRight.o, units = sounding(w).map(U.key);
    dPraise.textContent = mode === 'count' ? 'Let us count together: ' + w.word + ' has ' + o.label + ' sounds.'
      : 'Listen: ' + w.word + ' ' + (mode === 'begin' ? 'starts' : 'ends') + ' with ' + o.label + '.';
    playSeq(mode === 'count' ? units.concat('word-' + w.word) : [o.key, 'word-' + w.word]);
  };
  $('dPic').addEventListener('click', () => { if (dWord) playSeq(['word-' + dWord.word]); });
  $('dNext').addEventListener('click', dRound);
  Array.prototype.forEach.call(document.querySelectorAll('[data-dmode]'), b => b.addEventListener('click', () => {
    mode = b.getAttribute('data-dmode');
    Array.prototype.forEach.call(document.querySelectorAll('[data-dmode]'), x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    dLast = null; dRound();
  }));
  hooks.enter.detective = dRound;
  hooks.leave.detective = stopSeq;

  /* ================= SPELL IT ================= */
  const spSlots = $('spSlots'), spTray = $('spTray'), spMsg = $('spMsg');
  let spWord = null, spLast = null, spFill = [], spTiles = [], spDone = false;
  function spPool() {
    const lim = Math.min(W.stageLimit(), 6);
    const ok = w => !w.sight && w.emoji && w.units.length >= 2 && w.units.length <= 5 && w.units.every(u => { const k = U.key(u); return k !== '_' && k.indexOf('word-') !== 0; });
    const p = CONTENT.words.filter(w => ok(w) && (w.level || 1) <= lim);
    return p.length >= 6 ? p : CONTENT.words.filter(w => ok(w) && (w.level || 1) <= 3);
  }
  function spRender() {
    spSlots.innerHTML = '';
    spWord.units.forEach((u, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      const t = spFill[i];
      b.className = 'spslot' + (t ? ' full' : '');
      b.textContent = t ? U.text(t.u) : '';
      b.setAttribute('aria-label', t ? 'sound ' + (i + 1) + ': ' + U.text(t.u) + '. Tap to take it out.' : 'sound ' + (i + 1) + ': empty');
      b.addEventListener('click', () => spTake(i));
      spSlots.appendChild(b);
    });
    Array.prototype.forEach.call(spTray.children, (b, i) => { b.classList.toggle('used', spTiles[i].used); b.disabled = false; });
    $('spCheck').disabled = spDone || spFill.some(x => !x);
  }
  function spRound(same) {
    stopSeq(); spDone = false; spMsg.textContent = '';
    if (!same || !spWord) {
      const pool = spPool();
      let w = W.pickAdaptive(pool, W.wordKeys), t = 0;
      while (t++ < 8 && w.word === spLast) w = W.pickAdaptive(pool, W.wordKeys);
      spWord = w; spLast = w.word;
    }
    const w = spWord;
    $('spEmo').textContent = w.emoji;
    spFill = w.units.map(() => null);
    const have = {}; w.units.forEach(u => { have[U.key(u)] = true; });
    const extra = [];
    W.shuffle(spPool()).forEach(x => x.units.forEach(u => { const k = U.key(u); if (!have[k] && extra.length < 3 && !extra.some(e => U.key(e) === k || U.text(e) === U.text(u))) extra.push(u); }));
    spTiles = W.shuffle(w.units.concat(extra.slice(0, Math.max(2, 7 - w.units.length > 3 ? 3 : 2)))).map(u => ({ u: u, used: false }));
    spTray.innerHTML = '';
    spTiles.forEach((t, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'dchoice'; b.textContent = U.text(t.u);
      b.setAttribute('aria-label', 'the sound ' + U.text(t.u));
      b.addEventListener('click', () => spPut(i));
      spTray.appendChild(b);
    });
    spRender();
    playSeq(['word-' + w.word]);
  }
  function spPut(i) {
    if (spDone) return;
    const t = spTiles[i];
    playSeq([U.key(t.u)]);
    if (t.used) return;
    const slot = spFill.findIndex(x => !x);
    if (slot < 0) return;
    spFill[slot] = { u: t.u, tile: i }; t.used = true;
    spRender();
  }
  function spTake(i) {
    if (spDone || !spFill[i]) return;
    spTiles[spFill[i].tile].used = false; spFill[i] = null;
    spRender();
  }
  function spShow() {
    if (spDone || spFill.some(x => !x)) return;
    spDone = true;
    const w = spWord;
    let all = true;
    Array.prototype.forEach.call(spSlots.children, (b, i) => {
      const ok = U.key(spFill[i].u) === U.key(w.units[i]);
      W.track(U.key(w.units[i]), ok);
      if (!ok) all = false;
      b.classList.add(ok ? 'match' : 'near');
      if (!ok) { b.textContent = U.text(w.units[i]); b.setAttribute('aria-label', 'sound ' + (i + 1) + ' is really ' + U.text(w.units[i])); }
    });
    spMsg.textContent = all ? 'You spelled ' + w.word + '! ' + W.pick(CONTENT.praise)
      : 'Good try! Here is how ' + w.word + ' is really spelled. The yellow ones changed. ' + W.pick(CONTENT.praise);
    $('spCheck').disabled = true;
    playSeq(w.units.map(U.key).concat('word-' + w.word));
  }
  W.reveal.spell = () => {
    if (spDone || !spWord) return;
    spDone = true;
    const w = spWord;
    Array.prototype.forEach.call(spSlots.children, (b, i) => {
      b.classList.add('near'); b.textContent = U.text(w.units[i]);
      b.setAttribute('aria-label', 'sound ' + (i + 1) + ' is ' + U.text(w.units[i]));
    });
    spMsg.textContent = 'Here is how ' + w.word + ' is spelled.';
    $('spCheck').disabled = true;
    playSeq(w.units.map(U.key).concat('word-' + w.word));
  };
  $('spPic').addEventListener('click', () => { if (spWord) playSeq(['word-' + spWord.word]); });
  $('spCheck').addEventListener('click', spShow);
  $('spAgain').addEventListener('click', () => spRound(true));
  $('spNext').addEventListener('click', () => spRound(false));
  hooks.enter.spell = () => spRound(false);
  hooks.leave.spell = stopSeq;

  /* ================= SILLY WORDS ================= */
  let smode = 'mix', syTarget = null, sySilly = null, syShown = null, syDone = false, syLast = null;
  const syChoices = $('syChoices'), syPraise = $('syPraise');
  function syGroups() {
    const lim = Math.min(W.stageLimit(), 6);
    const ok = w => !w.sight && w.emoji && w.units.length === 3 && w.units.every(u => { const k = U.key(u); return k !== '_' && k.indexOf('word-') !== 0; }) && U.text(w.units[0]).length === 1;
    const g = {};
    CONTENT.words.filter(w => ok(w) && (w.level || 1) <= lim).forEach(w => {
      const r = w.units.slice(1).map(U.key).join('+');
      (g[r] = g[r] || []).push(w);
    });
    return Object.keys(g).map(k => g[k]).filter(a => new Set(a.map(w => U.key(w.units[0]))).size >= 3);
  }
  function syWordRow(w, blank) {
    const row = $('syWord'); row.innerHTML = '';
    w.units.forEach((u, i) => {
      const s = document.createElement('span'); s.className = 'chip' + (i === 0 && blank ? ' blank' : '');
      s.textContent = i === 0 && blank ? '?' : U.text(u);
      row.appendChild(s);
    });
  }
  function syRound() {
    stopSeq(); syDone = false; syPraise.textContent = ''; syChoices.innerHTML = '';
    const groups = syGroups();
    if (!groups.length) { $('syPrompt').textContent = 'Not enough words yet.'; return; }
    let grp = W.pick(groups), t = 0, w = W.pickAdaptive(grp, x => [U.key(x.units[0])]);
    while (t++ < 8 && w.word === syLast) { grp = W.pick(groups); w = W.pick(grp); }
    syLast = w.word; syTarget = w; syTried = false;
    const others = W.shuffle(grp.filter(x => U.key(x.units[0]) !== U.key(w.units[0])));
    const seenOn = {}; const pickOthers = [];
    others.forEach(x => { const k = U.key(x.units[0]); if (!seenOn[k] && pickOthers.length < 2) { seenOn[k] = true; pickOthers.push(x); } });
    sySilly = pickOthers;
    const em = $('syEmo'); em.classList.remove('silly', 'popit'); em.textContent = w.emoji;
    if (smode === 'mix') {
      const silly = Math.random() < 0.5;
      syShown = silly ? pickOthers[0] : w;
      $('syPrompt').textContent = 'Listen. Does the word match the picture?';
      syWordRow(syShown, false);
      [{ label: '✓ Yes', yes: true }, { label: '🤪 Silly!', yes: false }].forEach(o => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'dchoice'; b.style.fontSize = '1.7rem'; b.textContent = o.label;
        b.setAttribute('aria-label', o.yes ? 'Yes, it matches' : 'Silly, it does not match');
        b.addEventListener('click', () => syMix(b, o.yes));
        syChoices.appendChild(b);
      });
      playSeq(['word-' + syShown.word]);
    } else {
      syShown = w;
      $('syPrompt').textContent = 'Which letter finishes the word for this picture?';
      syWordRow(w, true);
      W.shuffle([w].concat(pickOthers)).forEach(x => {
        const u = x.units[0];
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'dchoice'; b.textContent = U.text(u);
        b.setAttribute('aria-label', 'the letter ' + U.text(u));
        b.addEventListener('click', () => syFix(b, x));
        syChoices.appendChild(b);
      });
      playSeq(['word-' + w.word]);
    }
  }
  function syMix(b, yes) {
    if (syDone) return;
    const isMatch = syShown === syTarget, em = $('syEmo');
    if (yes === isMatch) {
      syDone = true; b.classList.add('right');
      if (isMatch) { em.classList.remove('popit'); void em.offsetWidth; em.classList.add('popit'); syPraise.textContent = 'Yes, ' + syTarget.word + '! ' + W.pick(CONTENT.praise); }
      else { em.textContent = syShown.emoji; em.classList.remove('silly'); void em.offsetWidth; em.classList.add('silly'); syPraise.textContent = 'Ha! It said ' + syShown.word + ', but that picture is a ' + syTarget.word + '. You spotted it! ' + W.pick(CONTENT.praise); }
      playSeq(['word-' + (isMatch ? syTarget.word : syShown.word), 'word-' + syTarget.word]);
    } else {
      b.classList.add('heard-it');
      syPraise.textContent = 'Listen again. Look at the picture. Try the other one.';
      playSeq(['word-' + syShown.word]);
    }
  }
  let syTried = false;
  function syFix(b, x) {
    if (!syTried) { syTried = true; W.track(U.key(syTarget.units[0]), x === syTarget); }
    const em = $('syEmo');
    syWordRow(x, false);
    const right = x === syTarget;
    em.textContent = x.emoji; em.classList.remove('silly', 'popit'); void em.offsetWidth; em.classList.add(right ? 'popit' : 'silly');
    if (right) {
      syDone = true; b.classList.add('right');
      syPraise.textContent = x.word + '! ' + W.pick(CONTENT.praise);
    } else {
      b.classList.add('heard-it');
      syPraise.textContent = 'Ha! That makes ' + x.word + '. That is not our ' + syTarget.word + '. Try another letter!';
    }
    playSeq([U.key(x.units[0]), 'word-' + x.word]);
  }
  W.reveal.silly = () => {
    if (syDone || !syTarget) return;
    syDone = true;
    syWordRow(syTarget, false);
    const em = $('syEmo'); em.textContent = syTarget.emoji;
    syPraise.textContent = 'This is ' + syTarget.word + '.';
    playSeq(['word-' + syTarget.word]);
  };
  $('syPic').addEventListener('click', () => { if (syShown) playSeq(['word-' + syShown.word]); });
  $('syNext').addEventListener('click', syRound);
  Array.prototype.forEach.call(document.querySelectorAll('[data-smode]'), b => b.addEventListener('click', () => {
    smode = b.getAttribute('data-smode');
    Array.prototype.forEach.call(document.querySelectorAll('[data-smode]'), x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    syLast = null; syRound();
  }));
  hooks.enter.silly = syRound;
  hooks.leave.silly = stopSeq;

  /* ================= TRACE LETTERS ================= */
  const letters = CONTENT.letters || [];
  const guide = $('tGuide'), ink = $('tInk');
  const gctx = guide.getContext('2d'), ictx = ink.getContext('2d');
  let ti = 0, upper = true, drawing = false, lastPt = null, drew = false, S = 300;
  const accent = (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#2a62c0').trim();
  function tSize() {
    const wrap = $('tWrap');
    S = Math.max(200, wrap.clientWidth - 8);
    const dpr = window.devicePixelRatio || 1;
    [guide, ink].forEach(c => { c.width = Math.round(S * dpr); c.height = Math.round(S * dpr); });
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0); ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGuide();
  }
  function drawGuide() {
    gctx.clearRect(0, 0, S, S);
    const L = letters[ti]; if (!L) return;
    const ch = upper ? L.l.toUpperCase() : L.l;
    gctx.strokeStyle = '#8791b8'; gctx.lineWidth = 2; gctx.setLineDash([6, 6]);
    [0.30, 0.55, 0.78].forEach(f => { gctx.beginPath(); gctx.moveTo(10, S * f); gctx.lineTo(S - 10, S * f); gctx.stroke(); });
    gctx.setLineDash([]);
    gctx.font = '800 ' + Math.round(S * 0.8) + 'px system-ui, -apple-system, "Segoe UI", sans-serif';
    gctx.textAlign = 'center'; gctx.textBaseline = 'alphabetic';
    gctx.fillStyle = '#dfe4f6'; gctx.strokeStyle = '#7c87b6'; gctx.lineWidth = 3;
    gctx.fillText(ch, S / 2, S * 0.78); gctx.strokeText(ch, S / 2, S * 0.78);
  }
  function tClear() { ictx.clearRect(0, 0, S, S); drew = false; $('tPraise').textContent = ''; }
  function tShow(i, say) {
    ti = (i + letters.length) % letters.length;
    tClear(); drawGuide();
    if (say) playSeq(['letter-' + letters[ti].l, letters[ti].l]);
  }
  const pt = e => { const r = ink.getBoundingClientRect(); return { x: (e.clientX - r.left) * (S / r.width), y: (e.clientY - r.top) * (S / r.height) }; };
  ink.addEventListener('pointerdown', e => {
    e.preventDefault(); drawing = true; drew = true; lastPt = pt(e);
    try { ink.setPointerCapture(e.pointerId); } catch (x) {}
    ictx.fillStyle = accent; ictx.beginPath(); ictx.arc(lastPt.x, lastPt.y, 9, 0, 6.283); ictx.fill();
  });
  ink.addEventListener('pointermove', e => {
    if (!drawing) return; e.preventDefault();
    const p = pt(e);
    ictx.strokeStyle = accent; ictx.lineWidth = 18; ictx.lineCap = 'round'; ictx.lineJoin = 'round';
    ictx.beginPath(); ictx.moveTo(lastPt.x, lastPt.y); ictx.lineTo(p.x, p.y); ictx.stroke();
    lastPt = p;
  });
  const endDraw = () => { if (drawing && drew) $('tPraise').textContent = 'You traced it! ' + W.pick(CONTENT.praise); drawing = false; };
  ink.addEventListener('pointerup', endDraw);
  ink.addEventListener('pointercancel', () => { drawing = false; });
  $('tClear').addEventListener('click', tClear);
  $('tCase').addEventListener('click', () => { upper = !upper; $('tCase').textContent = upper ? 'Aa' : 'aA'; tClear(); drawGuide(); });
  $('tHear').addEventListener('click', () => playSeq(['letter-' + letters[ti].l, letters[ti].l, 'word-' + letters[ti].word]));
  $('tNext').addEventListener('click', () => tShow(ti + 1, true));
  $('tPrev').addEventListener('click', () => tShow(ti - 1, true));
  hooks.enter.trace = () => { tSize(); tShow(ti, false); };
  hooks.leave.trace = () => { drawing = false; stopSeq(); };
  window.addEventListener('resize', () => { if ($('screen-trace') && !$('screen-trace').hidden) { tSize(); } });

  /* ================= LITTLE STORIES ================= */
  const stories = CONTENT.stories || [];
  let cur = null, stoken = 0;
  stories.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'menu-card';
    b.setAttribute('aria-label', 'Story: ' + s.title);
    b.innerHTML = '<span class="big" aria-hidden="true"></span><span><strong></strong></span>';
    b.querySelector('.big').textContent = s.emoji;
    b.querySelector('strong').textContent = s.title;
    b.addEventListener('click', () => openStory(i));
    $('sBooks').appendChild(b);
  });
  function openStory(i) {
    stoken++; stopSeq(); cur = stories[i];
    $('sList').hidden = true; $('sRead').hidden = false;
    $('sTitle').textContent = cur.emoji + ' ' + cur.title;
    const box = $('sLines'); box.innerHTML = '';
    cur.lines.forEach((t, n) => {
      const row = document.createElement('div'); row.className = 'sline';
      const num = document.createElement('button');
      num.type = 'button'; num.className = 'snum'; num.textContent = String(n + 1);
      num.setAttribute('aria-label', 'Hear line ' + (n + 1));
      num.addEventListener('click', () => { stoken++; litLine(n); playSeq([W.sentenceKeyOf(t)]); });
      row.appendChild(num);
      t.split(' ').forEach(tok => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'sword'; b.textContent = tok;
        b.addEventListener('click', () => { stoken++; playSeq([W.wordKeyOf(tok)]); });
        row.appendChild(b);
      });
      box.appendChild(row);
    });
    window.scrollTo(0, 0);
  }
  function litLine(n) { Array.prototype.forEach.call($('sLines').children, (r, j) => r.classList.toggle('lit', j === n)); }
  $('sPlay').addEventListener('click', async () => {
    if (!cur) return;
    const my = ++stoken;
    for (let n = 0; n < cur.lines.length; n++) {
      if (my !== stoken) return;
      litLine(n);
      await playSeq([W.sentenceKeyOf(cur.lines[n])]);
      await W.sleep(250);
    }
    if (my === stoken) litLine(-1);
  });
  $('sAll').addEventListener('click', () => { stoken++; stopSeq(); litLine(-1); $('sRead').hidden = true; $('sList').hidden = false; window.scrollTo(0, 0); });
  hooks.enter.stories = () => { $('sRead').hidden = true; $('sList').hidden = false; };
  hooks.leave.stories = () => { stoken++; stopSeq(); };
})();
