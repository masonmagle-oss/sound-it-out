/* Which picture is this word? He reads a written word (no sound plays first) and picks its picture. The wrong pictures
   start with the same sound as the right one, so guessing from the first letter does not work: he has to read the whole word.
   Touch the word to hear its sounds one by one (help, not the answer). After the right picture, the word is spoken. */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT, hooks } = W;
  const U = window.WordPlayUnit;
  W.reveal = W.reveal || {};
  let seq = 0;
  async function playSeq(keys) {
    if (!W.playKey) return;
    const my = ++seq;
    if (W.stopSound) W.stopSound();
    for (const k of keys) { if (my !== seq) return; await W.playKey(k); }
  }
  const stopSeq = () => { seq++; if (W.stopSound) W.stopSound(); };
  const firstKey = w => U.key(w.units[0]);
  // arrows, symbols and signs make poor pictures for a reading game (for example "top" or "turn")
  const symbolic = e => /[\u2190-\u21ff\u2b00-\u2bff\u{1f500}-\u{1f53f}\u{1f170}-\u{1f1ff}]/u.test(e);
  const okWord = w => !w.sight && w.emoji && !symbolic(w.emoji) && w.units.length >= 2 && w.units.length <= 5 &&
    w.units.every(u => { const k = U.key(u); return k !== '_' && k.indexOf('word-') !== 0; });

  // words that have at least two other words starting with the same sound and showing a different picture
  function targets() {
    const lim = Math.min(W.stageLimit(), 6);
    const pool = CONTENT.words.filter(w => okWord(w) && (w.level || 1) <= lim);
    const by = {};
    pool.forEach(w => { (by[firstKey(w)] = by[firstKey(w)] || []).push(w); });
    const withPals = w => new Set(by[firstKey(w)].filter(x => x.emoji !== w.emoji).map(x => x.emoji)).size >= 2;
    const all = pool.filter(withPals);
    return { by, all, narrowed: W.mixNarrow(all, w => w.word, 3) };
  }
  W.matchReady = () => targets().narrowed.length > 0;

  const mWord = $('mWordText'), mChoices = $('mChoices'), mPraise = $('mPraise');
  let mTarget = null, mSolved = false, mTried = false, mLast = null, mRight = null;

  function mRound() {
    stopSeq(); mSolved = false; mTried = false; mPraise.textContent = ''; mChoices.innerHTML = '';
    const t = targets();
    if (!t.narrowed.length) { mWord.textContent = ''; mPraise.textContent = 'Not enough words yet.'; return; }
    let w = W.pickAdaptive(t.narrowed, W.wordKeys), n = 0;
    while (n++ < 8 && w.word === mLast) w = W.pickAdaptive(t.narrowed, W.wordKeys);
    mLast = w.word; mTarget = w;
    // wrong pictures: same first sound, a different picture each, and a different second sound when possible
    const seen = { [w.emoji]: true }, pals = [];
    W.shuffle(t.by[firstKey(w)].filter(x => x.word !== w.word)).sort((a, b) => (U.key(a.units[1]) === U.key(w.units[1])) - (U.key(b.units[1]) === U.key(w.units[1])))
      .forEach(x => { if (!seen[x.emoji] && pals.length < 2) { seen[x.emoji] = true; pals.push(x); } });
    mWord.textContent = w.word;
    W.shuffle([w].concat(pals)).forEach(x => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'rchoice';
      b.setAttribute('aria-label', 'picture ' + (mChoices.children.length + 1));
      const e = document.createElement('span'); e.className = 'rce'; e.textContent = x.emoji; e.setAttribute('aria-hidden', 'true');
      b.appendChild(e);
      b.addEventListener('click', () => choose(b, x));
      if (x === w) mRight = b;
      mChoices.appendChild(b);
    });
  }
  function choose(b, x) {
    if (mSolved) return;
    const w = mTarget;
    if (!mTried) {
      mTried = true;
      if (x === w) w.units.forEach(u => W.track(U.key(u), true));
      else { const i = w.units.findIndex((u, k) => !x.units[k] || U.key(u) !== U.key(x.units[k])); W.track(U.key(w.units[Math.max(0, i)]), false); }
    }
    if (x === w) {
      mSolved = true; b.classList.add('right');
      mPraise.textContent = w.word + '! ' + W.pick(CONTENT.praise);
      playSeq(['word-' + w.word]);
    } else {
      b.classList.add('heard-it');
      mPraise.textContent = 'Look at every letter. Try another picture.';
      playSeq(['word-' + x.word]);
    }
  }
  W.reveal.match = () => {
    if (mSolved || !mTarget || !mRight) return;
    mSolved = true; mRight.classList.add('right');
    mPraise.textContent = 'This one is ' + mTarget.word + '.';
    playSeq(mTarget.units.map(U.key).concat('word-' + mTarget.word));
  };
  $('mWord').addEventListener('click', () => { if (mTarget) playSeq(mTarget.units.map(U.key)); });
  $('mNext').addEventListener('click', mRound);
  hooks.enter.match = mRound;
  hooks.leave.match = stopSeq;
})();
