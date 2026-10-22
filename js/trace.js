/* Trace letters, in handwriting order. Each letter is written twice: the big letter, then the little one.
   He starts at the green dot and follows the arrow; the ink only follows the real stroke, in the right order and direction.
   Being a little off the line is fine. Nothing is ever "wrong": if the finger is somewhere else the dot pulses, and after a
   few tries it shows the stroke again. Praise comes once both letters are written (effort only, no scores).
   Stroke paths are in js/strokes.js. */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W || !window.WordPlayStrokes) return;
  const { $, CONTENT, hooks } = W;
  W.reveal = W.reveal || {};
  let seq = 0;
  async function playSeq(keys) {
    if (!W.playKey) return;
    const my = ++seq;
    if (W.stopSound) W.stopSound();
    for (const k of keys) { if (my !== seq) return; await W.playKey(k); }
  }
  const stopSeq = () => { seq++; if (W.stopSound) W.stopSound(); };

  const letters = CONTENT.letters || [];
  const guide = $('tGuide'), ink = $('tInk');
  const gctx = guide.getContext('2d'), ictx = ink.getContext('2d');
  const accent = (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#2a62c0').trim();
  const GREEN = '#1f9d55', PALE = '#dfe4f6', EDGE = '#8791b8';
  const TOL = 11, START_TOL = 14, LOOK = 28, DONE_AT = 0.92;      // in writing-square units (100 across)

  // turn a stroke into evenly spaced points, one per unit of length
  function prep(stroke) {
    const P = [stroke[0].slice()];
    for (let i = 1; i < stroke.length; i++) {
      const a = stroke[i - 1], b = stroke[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(d));
      for (let k = 1; k <= n; k++) P.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return { P, last: P.length - 1 };
  }
  const prepared = {};
  function strokesOf(ch, lower) {
    const key = (lower ? 'l' : 'u') + ch;
    if (!prepared[key]) prepared[key] = (window.WordPlayStrokes[lower ? 'lower' : 'upper'][lower ? ch : ch.toUpperCase()] || []).map(prep);
    return prepared[key];
  }

  let ti = 0, lower = false, strokes = [], si = 0, idx = 0, drag = false, misses = 0;
  let S = 300, k = 3, demo = null, raf = 0, shownLetter = false, finished = false, lastAct = 0;
  const unit = v => v * k;
  const reducedMotion = () => !!(W.reduced && W.reduced.matches);

  function tSize() {
    const wrap = $('tWrap');
    S = Math.max(200, wrap.clientWidth - 8);
    k = S / 100;
    const dpr = window.devicePixelRatio || 1;
    [guide, ink].forEach(c => { c.width = Math.round(S * dpr); c.height = Math.round(S * dpr); });
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0); ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGuide(); render(0);
  }
  function pathTo(ctx, P, upto) {
    ctx.beginPath();
    ctx.moveTo(unit(P[0][0]), unit(P[0][1]));
    for (let i = 1; i <= upto; i++) ctx.lineTo(unit(P[i][0]), unit(P[i][1]));
  }
  function arrowAt(ctx, P, i, color) {
    const a = P[Math.max(0, i - 3)], b = P[Math.min(P.length - 1, i + 3)];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), x = unit(P[i][0]), y = unit(P[i][1]), s = unit(3.6);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * s, y + Math.sin(ang) * s);
    ctx.lineTo(x + Math.cos(ang + 2.5) * s, y + Math.sin(ang + 2.5) * s);
    ctx.lineTo(x + Math.cos(ang - 2.5) * s, y + Math.sin(ang - 2.5) * s);
    ctx.closePath(); ctx.fill();
  }
  // static layer: writing lines, the pale letter, a small number and an arrow on every stroke
  function drawGuide() {
    gctx.clearRect(0, 0, S, S);
    gctx.lineWidth = 2;
    [[15, '#b9c1de', [6, 6]], [40, '#d3d9ee', [6, 6]], [75, EDGE, []], [95, '#d3d9ee', [2, 6]]].forEach(([y, col, dash]) => {
      gctx.strokeStyle = col; gctx.setLineDash(dash);
      gctx.beginPath(); gctx.moveTo(unit(8), unit(y)); gctx.lineTo(unit(92), unit(y)); gctx.stroke();
    });
    gctx.setLineDash([]);
    gctx.lineCap = 'round'; gctx.lineJoin = 'round';
    strokes.forEach(st => {
      gctx.strokeStyle = PALE; gctx.lineWidth = unit(12);
      if (st.last === 0) { gctx.fillStyle = PALE; gctx.beginPath(); gctx.arc(unit(st.P[0][0]), unit(st.P[0][1]), unit(6), 0, 6.283); gctx.fill(); }
      else { pathTo(gctx, st.P, st.last); gctx.stroke(); }
    });
    strokes.forEach((st, i) => {
      if (st.last > 6) arrowAt(gctx, st.P, Math.min(st.last - 3, Math.max(4, Math.round(st.last * 0.35))), EDGE);
      gctx.fillStyle = '#8f98bf'; gctx.beginPath(); gctx.arc(unit(st.P[0][0]), unit(st.P[0][1]), unit(4.2), 0, 6.283); gctx.fill();
      gctx.fillStyle = '#fff'; gctx.font = '800 ' + Math.round(unit(5.2)) + 'px system-ui, sans-serif'; gctx.textAlign = 'center'; gctx.textBaseline = 'middle';
      gctx.fillText(String(i + 1), unit(st.P[0][0]), unit(st.P[0][1]) + 1);
    });
  }
  // moving layer: finished ink, the stroke in progress, the green start dot, the demo dot
  function render(t) {
    ictx.clearRect(0, 0, S, S);
    ictx.lineCap = 'round'; ictx.lineJoin = 'round';
    strokes.forEach((st, i) => {
      const upto = finished || i < si ? st.last : (i === si ? idx : 0);
      if (st.last === 0) { if (finished || i < si) { ictx.fillStyle = accent; ictx.beginPath(); ictx.arc(unit(st.P[0][0]), unit(st.P[0][1]), unit(6), 0, 6.283); ictx.fill(); } return; }
      if (upto > 0) { ictx.strokeStyle = accent; ictx.lineWidth = unit(12); pathTo(ictx, st.P, upto); ictx.stroke(); }
    });
    if (demo) {
      const st = strokes[demo.i], p = Math.min(st.last, Math.round(demo.p * st.last));
      ictx.strokeStyle = GREEN; ictx.globalAlpha = 0.55; ictx.lineWidth = unit(9);
      if (st.last > 0) { pathTo(ictx, st.P, p); ictx.stroke(); }
      ictx.globalAlpha = 1; ictx.fillStyle = GREEN; ictx.beginPath(); ictx.arc(unit(st.P[p][0]), unit(st.P[p][1]), unit(6.5), 0, 6.283); ictx.fill();
    } else if (!finished && strokes[si]) {
      const st = strokes[si], p = st.P[idx], pulse = reducedMotion() ? 1 : 1 + 0.18 * Math.sin(t / 260);
      ictx.fillStyle = GREEN; ictx.beginPath(); ictx.arc(unit(p[0]), unit(p[1]), unit(6.5) * pulse, 0, 6.283); ictx.fill();
      ictx.strokeStyle = '#fff'; ictx.lineWidth = 3; ictx.stroke();
      ictx.fillStyle = '#fff'; ictx.font = '800 ' + Math.round(unit(6)) + 'px system-ui, sans-serif'; ictx.textAlign = 'center'; ictx.textBaseline = 'middle';
      ictx.fillText(String(si + 1), unit(p[0]), unit(p[1]) + 1);
      if (idx === 0 && st.last > 6) arrowAt(ictx, st.P, Math.min(st.last - 3, 10), GREEN);
    }
  }
  function frame(t) {
    raf = 0;
    if ($('screen-trace').hidden) return;
    if (demo) {
      const st = strokes[demo.i], dur = Math.max(700, st.last * 16);
      demo.p = Math.min(1, (t - demo.t0) / dur);
      if (demo.p >= 1 && t - demo.t0 > dur + 250) { demo.i++; demo.t0 = t; demo.p = 0; if (demo.i >= strokes.length) { demo = null; } }
    }
    render(t);
    if (demo || (!reducedMotion() && t - lastAct < 6000)) raf = requestAnimationFrame(frame);     // pulses for a few seconds, then rests
  }
  const kick = () => { lastAct = performance.now(); if (!raf) raf = requestAnimationFrame(frame); };

  function setCase(low) {
    lower = low;
    const L = letters[ti];
    strokes = strokesOf(L.l, lower);
    si = 0; idx = 0; finished = false; misses = 0; demo = null;
    $('tUp').classList.toggle('on', !lower); $('tLow').classList.toggle('on', lower);
    $('tUp').classList.toggle('done', lower);
    drawGuide(); render(0); kick();
  }
  function tShow(i, say) {
    ti = (i + letters.length) % letters.length;
    const L = letters[ti];
    $('tUp').textContent = L.l.toUpperCase(); $('tLow').textContent = L.l;
    $('tPraise').textContent = ''; shownLetter = true;
    setCase(false);
    $('tIn').textContent = 'Write the big ' + L.l.toUpperCase() + '. Start at the green dot.';
    if (say) playSeq(['letter-' + L.l, L.l]);
  }
  function watch() {
    if (!strokes.length) return;
    if (reducedMotion()) { demo = null; return; }
    demo = { i: Math.min(si, strokes.length - 1), p: 0, t0: performance.now() }; kick();
  }
  function strokeDone() {
    si++; idx = 0; misses = 0;
    if (si < strokes.length) { render(0); return; }
    finished = true; render(0);
    const L = letters[ti];
    if (!lower) {
      $('tIn').textContent = 'Now the little ' + L.l + '.';
      setTimeout(() => { if (finished && !lower && !$('screen-trace').hidden) { setCase(true); } }, reducedMotion() ? 200 : 700);
    } else {
      $('tPraise').textContent = 'You wrote ' + L.l.toUpperCase() + L.l + '! ' + W.pick(CONTENT.praise);
      $('tIn').textContent = '';
      playSeq(['letter-' + L.l, L.l]);
    }
  }

  const pt = e => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * (100 / r.width), (e.clientY - r.top) * (100 / r.height)]; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  ink.addEventListener('pointerdown', e => {
    e.preventDefault(); kick();
    if (demo || finished || !strokes[si]) return;
    const st = strokes[si], p = pt(e);
    if (st.last === 0) {                       // a dot: just tap it
      if (dist(p, st.P[0]) <= START_TOL + 4) strokeDone(); else if (++misses >= 3) watch();
      return;
    }
    if (dist(p, st.P[idx]) > START_TOL + (idx ? 6 : 0)) { if (++misses >= 3) { misses = 0; watch(); } return; }   // not at the dot: it keeps pulsing
    drag = true;
    try { ink.setPointerCapture(e.pointerId); } catch (x) {}
  });
  ink.addEventListener('pointermove', e => {
    if (!drag || demo || finished) return;
    e.preventDefault();
    const st = strokes[si], p = pt(e);
    let best = -1;
    for (let j = idx; j <= Math.min(st.last, idx + LOOK); j++) if (dist(p, st.P[j]) <= TOL) best = j;      // as far along the stroke as the finger reaches
    if (best > idx) { idx = best; render(performance.now()); if (idx >= st.last * DONE_AT) { drag = false; strokeDone(); } }
  });
  const up = () => { drag = false; };
  ink.addEventListener('pointerup', up);
  ink.addEventListener('pointercancel', up);

  $('tClear').addEventListener('click', () => { $('tPraise').textContent = ''; setCase(lower); });
  $('tWatch').addEventListener('click', watch);
  $('tHear').addEventListener('click', () => playSeq(['letter-' + letters[ti].l, letters[ti].l, 'word-' + letters[ti].word]));
  $('tNext').addEventListener('click', () => tShow(ti + 1, true));
  $('tPrev').addEventListener('click', () => tShow(ti - 1, true));
  // stuck for a while: show how it is written, with no praise
  W.reveal.trace = () => {
    if (!strokes.length || finished || demo) return;
    $('tIn').textContent = 'Watch how it is written.';
    demo = { i: si, p: 0, t0: performance.now() }; kick();
  };
  hooks.enter.trace = () => {
    tSize();
    let i = ti;
    const f = W.mix && W.mix.active() && W.mix.focus();
    if (f && f.key && /^[a-z]/.test(f.key)) { const j = letters.findIndex(x => x.l === f.key.charAt(0)); if (j >= 0) i = j; }
    else if (shownLetter && W.mix && W.mix.active()) i = ti + 1;
    tShow(i, false);
  };
  hooks.leave.trace = () => { drag = false; demo = null; stopSeq(); };
  window.addEventListener('resize', () => { if (!$('screen-trace').hidden) tSize(); });
  W.trace = { strokes: () => strokes, state: () => ({ si, idx, finished, lower, ti }), letter: () => letters[ti] && letters[ti].l };
})();
