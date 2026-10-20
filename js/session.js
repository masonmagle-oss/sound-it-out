/* "All done for today": a clear end to each session.
   A round counts when an activity shows its praise line for a finished round (not for a wrong answer or a shown answer). After the chosen number, a calm ending card
   appears. It never starts another round by itself; a grown-up can choose "a little more" (a few extra rounds). */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const $ = id => document.getElementById(id);
  const LENGTHS = [['15', 'Short (15)'], ['30', 'Medium (30)'], ['45', 'Long (45)']];
  const EXTRA = 6;
  let count = 0, limit = null, timer = null;

  const size = () => { const n = Number(W.settings.sessionRounds); return n === 15 || n === 45 ? n : 30; };
  const isPraise = t => W.CONTENT.praise.some(p => t.indexOf(p) >= 0);   // wrong answers and shown answers carry no praise phrase
  function counting() { return !$('doneOverlay').hidden ? false : ['home', 'grown'].indexOf(W.current ? W.current() : '') < 0; }
  function show() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!counting()) return;
      $('doneOverlay').hidden = false;
      try { $('doneBtn').focus(); } catch (e) {}
    }, 2200);                                  // let the last bit of praise finish first
  }
  function finish() {
    $('doneOverlay').hidden = true; count = 0; limit = null;
    W.render('home');
  }
  function more() { $('doneOverlay').hidden = true; limit = count + EXTRA; }

  const seen = new WeakMap();
  function praised(el) {
    const t = el.textContent.trim();
    const was = seen.get(el) || '';
    seen.set(el, t);
    if (!t || t === was || !counting() || !isPraise(t)) return;
    count++;
    if (count >= (limit || size())) show();
  }
  const mo = new MutationObserver(list => {
    const els = new Set();
    list.forEach(m => { const el = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (el && el.classList.contains('praise')) els.add(el); });
    els.forEach(praised);
  });
  document.querySelectorAll('.praise').forEach(el => mo.observe(el, { childList: true, characterData: true, subtree: true }));

  $('doneBtn').addEventListener('click', finish);
  $('moreBtn').addEventListener('click', more);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('doneOverlay').hidden) finish(); });

  function renderLengths() {
    const box = $('sessionBtns');
    box.innerHTML = '';
    LENGTHS.forEach(([val, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn' + (String(size()) === val ? '' : ' ghost');
      b.textContent = label;
      b.setAttribute('aria-pressed', String(size()) === val ? 'true' : 'false');
      b.addEventListener('click', () => { W.settings.sessionRounds = Number(val); W.saveSettings(); limit = null; renderLengths(); });
      box.appendChild(b);
    });
  }
  W.on('profileChanged', () => { count = 0; limit = null; clearTimeout(timer); $('doneOverlay').hidden = true; });   // a new child starts a fresh session
  const prev = W.hooks.enter.grown;
  W.hooks.enter.grown = () => { if (prev) prev(); renderLengths(); };
  W.session = { count: () => count, size };
})();
