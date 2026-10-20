/* Find his level: a short reading check (no sound). He reads a word and picks its picture; three words per level, starting at
   level 1. A level is passed with 2 of 3. It stops at the first level not passed. The grown-up can then use the result as the
   Play start level. The child sees only encouragement; the result is shown under "Grown-up". */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT, hooks } = W;
  const PER = 3, MAXL = 7;
  const ok = w => !w.sight && w.emoji && !/[ ]/.test(w.word);
  const byLevel = L => CONTENT.words.filter(w => ok(w) && (w.level || 1) === L);
  let L, n, right, passed, picked, resultLevel, used;
  const box = $('plChoices'), word = $('plWord');

  function start() {
    L = 1; n = 0; right = 0; passed = 0; used = new Set();
    $('plPlay').hidden = false; $('plDone').hidden = true;
    ask();
  }
  function ask() {
    const pool = byLevel(L).filter(w => !used.has(w.word));
    if (!pool.length) return finish();
    const w = W.pick(pool); used.add(w.word); picked = w;
    word.textContent = w.word; word.setAttribute('aria-label', 'Read this word');
    box.innerHTML = '';
    const emos = { [w.emoji]: true }, others = [];
    W.shuffle(CONTENT.words.filter(x => ok(x) && (x.level || 1) <= Math.max(2, L))).forEach(x => { if (others.length < 2 && !emos[x.emoji]) { emos[x.emoji] = true; others.push(x); } });
    W.shuffle([w].concat(others)).forEach(x => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'dchoice'; b.setAttribute('aria-label', 'a picture');
      b.innerHTML = '<span class="rtemo" aria-hidden="true"></span>'; b.firstChild.textContent = x.emoji;
      b.addEventListener('click', () => answer(x === w));
      box.appendChild(b);
    });
  }
  function answer(correct) {
    if (correct) right++;
    n++;
    if (n < PER) return ask();
    if (right >= 2) { passed = L; if (L >= MAXL) return finish(); L++; n = 0; right = 0; ask(); }
    else finish();
  }
  function finish() {
    resultLevel = Math.max(1, passed);
    $('plPlay').hidden = true; $('plDone').hidden = false;
    $('plResult').textContent = 'Suggested start: level ' + resultLevel + (passed >= MAXL ? ' (he read through every level).' : passed ? ' (he read level ' + passed + ' words well).' : ' (start at the beginning).');
    $('plApply').textContent = 'Use level ' + resultLevel + ' to start Play';
    $('plApplied').textContent = '';
  }
  $('plApply').addEventListener('click', () => {
    W.settings.mixStart = resultLevel; W.saveSettings();
    $('plApplied').textContent = 'Saved. Play now starts at level ' + resultLevel + '.';
  });
  $('plAgain').addEventListener('click', start);
  hooks.enter.place = start;
})();
