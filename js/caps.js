/* Big and little letters: match a big letter to its little one, or the other way round. Look-alikes (b d p q, m n) are the
   wrong choices on purpose. Plays the letter's own clip (letter-<x>.mp3). */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT, hooks } = W;
  const ALIKE = { b: 'dpq', d: 'bpq', p: 'qbd', q: 'pgd', m: 'nwh', n: 'mhr', u: 'nvy', v: 'uwy', w: 'mvu', i: 'jlt', j: 'ilg', l: 'itk', t: 'fli', f: 'tlk', h: 'nbk', k: 'hxl', g: 'qyj', y: 'gvu', s: 'zce', z: 'sxn', c: 'eos', e: 'ocs', o: 'cea', a: 'eod', r: 'nhm', x: 'kzv' };
  const letters = (CONTENT.letters || []).map(x => x.l);
  let seq = 0;
  async function play(keys) {
    if (!W.playKey) return;
    const my = ++seq;
    if (W.stopSound) W.stopSound();
    for (const k of keys) { if (my !== seq) return; await W.playKey(k); }
  }
  let mode = 'lower', target = null, right = null, solved = false, last = null;
  const box = $('cChoices'), praise = $('cPraise'), big = $('cBig');
  const show = (c, up) => up ? c.toUpperCase() : c;

  function round() {
    solved = false; right = null; praise.textContent = ''; box.innerHTML = '';
    let t = 0; target = W.pick(letters);
    while (t++ < 8 && target === last) target = W.pick(letters);
    last = target;
    const askUp = mode === 'lower';                    // mode 'lower': see the big letter, pick the little one
    big.textContent = show(target, askUp); big.setAttribute('aria-label', 'the letter ' + target);
    $('cPrompt').textContent = askUp ? 'Which little letter matches the big one?' : 'Which big letter matches the little one?';
    const others = (ALIKE[target] || '').split('').filter(c => letters.indexOf(c) >= 0).concat(W.shuffle(letters.filter(c => c !== target))).filter((c, i, a) => c !== target && a.indexOf(c) === i).slice(0, 2);
    W.shuffle([target].concat(others)).forEach(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'dchoice bigletter'; b.textContent = show(c, !askUp); b.setAttribute('aria-label', 'the letter ' + c);
      b.addEventListener('click', () => {
        if (solved) return;
        if (c === target) { solved = true; b.classList.add('right'); praise.textContent = target.toUpperCase() + ' and ' + target + ' are the same letter. ' + W.pick(CONTENT.praise); }
        else { b.classList.add('heard-it'); praise.textContent = 'Listen. Try another one.'; }
        play(['letter-' + c]);
      });
      if (c === target) right = b;
      box.appendChild(b);
    });
    play(['vocab-' + (askUp ? 'caps-lower' : 'caps-upper'), 'letter-' + target]);
  }
  W.reveal = W.reveal || {};
  W.reveal.caps = () => { if (solved || !right) return; solved = true; right.classList.add('right'); praise.textContent = 'Look: this one.'; };
  big.addEventListener('click', () => { if (target) play(['letter-' + target]); });
  $('cNext').addEventListener('click', round);
  Array.prototype.forEach.call(document.querySelectorAll('[data-cmode]'), b => b.addEventListener('click', () => {
    mode = b.getAttribute('data-cmode'); last = null;
    Array.prototype.forEach.call(document.querySelectorAll('[data-cmode]'), x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    round();
  }));
  hooks.enter.caps = round;
  hooks.leave.caps = () => { seq++; if (W.stopSound) W.stopSound(); };
})();
