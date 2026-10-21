/* Word parts: (1) Word endings: hear a word, see its base and pick the ending that makes it (help + ful).
   (2) Contractions: see two words and pick the short way to say them (do not = don't). Uses recorded clips only. */
(function () {
  'use strict';
  const W = window.WordPlay, D = window.WORDPLAY_PARTS;
  if (!W || !D) return;
  const { $, CONTENT, hooks } = W;
  let seq = 0;
  async function play(keys) {
    if (!W.playKey) return;
    const my = ++seq;
    if (W.stopSound) W.stopSound();
    for (const k of keys) { if (my !== seq) return; await W.playKey(k); }
  }
  const wk = W.wordKeyOf;
  let mode = 'end', item = null, last = null, solved = false, rightBtn = null;
  const box = $('pChoices'), praise = $('pPraise'), wordEl = $('pWord');

  function choice(label, clip, ok) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dchoice'; b.textContent = label; b.setAttribute('aria-label', label);
    b.addEventListener('click', () => {
      if (solved) return;
      if (!ok) { b.classList.add('heard-it'); praise.textContent = 'Listen. Try another one.'; play([clip]); return; }
      solved = true; b.classList.add('right');
      if (mode === 'pre') { wordEl.textContent = item.word; praise.textContent = item.pre + ' + ' + item.base + ' = ' + item.word + '. ' + W.pick(CONTENT.praise); play([item.pre, wk(item.base), wk(item.word)]); }
      else if (mode === 'end') { wordEl.textContent = item.word; praise.textContent = item.base + ' + ' + item.end + ' = ' + item.word + '. ' + W.pick(CONTENT.praise); play([wk(item.base), item.end, wk(item.word)]); }
      else { wordEl.textContent = item.c; praise.textContent = item.a + ' ' + item.b + ' = ' + item.c + '. ' + W.pick(CONTENT.praise); play([wk(item.a), wk(item.b), wk(item.c)]); }
    });
    if (ok) rightBtn = b;
    box.appendChild(b);
  }
  function round() {
    solved = false; rightBtn = null; praise.textContent = ''; box.innerHTML = '';
    const list = mode === 'end' ? D.endings : mode === 'pre' ? D.prefixed : D.contractions;
    let t = 0; item = W.pick(list);
    while (t++ < 8 && list.length > 1 && item === last) item = W.pick(list);
    last = item;
    if (mode === 'pre') {
      $('pPrompt').textContent = 'Listen. Which beginning makes the word?';
      wordEl.textContent = '? + ' + item.base; wordEl.setAttribute('aria-label', 'what plus ' + item.base);
      const others = W.shuffle(D.prefixes.filter(e => e !== item.pre)).slice(0, 2);
      W.shuffle([item.pre].concat(others)).forEach(e => choice(e, e, e === item.pre));
      play([wk(item.word)]);
    } else if (mode === 'end') {
      $('pPrompt').textContent = 'Listen. Which ending makes the word?';
      wordEl.textContent = item.base + ' + ?'; wordEl.setAttribute('aria-label', item.base + ' plus what');
      const others = W.shuffle(D.ends.filter(e => e !== item.end)).slice(0, 2);
      W.shuffle([item.end].concat(others)).forEach(e => choice(e, e, e === item.end));
      play([wk(item.word)]);
    } else {
      $('pPrompt').textContent = 'Which one is the short way to say it?';
      wordEl.textContent = item.a + ' ' + item.b; wordEl.setAttribute('aria-label', item.a + ' ' + item.b);
      const others = W.shuffle(D.contractions.filter(x => x !== item).map(x => x.c)).slice(0, 2);
      W.shuffle([item.c].concat(others)).forEach(c => choice(c, wk(c), c === item.c));
      play([wk(item.a), wk(item.b)]);
    }
  }
  W.reveal = W.reveal || {};
  W.reveal.parts = () => { if (solved || !rightBtn) return; solved = true; rightBtn.classList.add('right'); praise.textContent = 'Look: this one.'; };
  wordEl.addEventListener('click', () => { if (item) play(mode !== 'con' ? [wk(item.word)] : [wk(item.a), wk(item.b)]); });
  $('pNext').addEventListener('click', round);
  Array.prototype.forEach.call(document.querySelectorAll('[data-pmode]'), b => b.addEventListener('click', () => {
    mode = b.getAttribute('data-pmode'); last = null;
    Array.prototype.forEach.call(document.querySelectorAll('[data-pmode]'), x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    round();
  }));
  hooks.enter.parts = round;
  hooks.leave.parts = () => { seq++; if (W.stopSound) W.stopSound(); };
})();
