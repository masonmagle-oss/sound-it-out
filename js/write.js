/* Write it (dictation): hear a word, see its picture, and tap the letters to write it. A wrong letter just doesn't stick.
   Uses the existing word clips. Words come from the grown-up's level (W.stageLimit). */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT, hooks } = W;
  const plain = w => !w.sight && w.emoji && /^[a-z]{2,6}$/.test(w.word) && !w.units.some(u => u.indexOf(':word-') > 0);
  let seq = 0;
  async function play(keys) {
    if (!W.playKey) return;
    const my = ++seq;
    if (W.stopSound) W.stopSound();
    for (const k of keys) { if (my !== seq) return; await W.playKey(k); }
  }
  let word = null, at = 0, done = false, last = null, misses = 0;
  const slots = $('wSlots'), tray = $('wTray'), msg = $('wMsg');

  function round() {
    done = false; at = 0; misses = 0; msg.textContent = '';
    const lim = Math.min(W.stageLimit(), 5);
    const pool = CONTENT.words.filter(w => plain(w) && (w.level || 1) <= lim);
    const list = W.mixNarrow ? W.mixNarrow(pool, w => w.word, 3) : pool;
    word = W.pick(list); let t = 0;
    while (t++ < 8 && word.word === last && list.length > 1) word = W.pick(list);
    last = word.word;
    W.pic($('wEmo'), word.emoji);
    slots.innerHTML = ''; tray.innerHTML = '';
    for (let i = 0; i < word.word.length; i++) { const s = document.createElement('span'); s.className = 'wslot'; s.setAttribute('aria-label', 'letter ' + (i + 1) + ' empty'); slots.appendChild(s); }
    const extra = W.shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => word.word.indexOf(c) < 0)).slice(0, 3);
    W.shuffle(word.word.split('').concat(extra)).forEach(c => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'dchoice'; b.textContent = c; b.setAttribute('aria-label', 'the letter ' + c);
      b.addEventListener('click', () => put(b, c));
      tray.appendChild(b);
    });
    play(['word-' + word.word]);
  }
  function put(b, c) {
    if (done) return;
    if (c === word.word[at]) {
      slots.children[at].textContent = c; slots.children[at].setAttribute('aria-label', 'letter ' + (at + 1) + ' ' + c);
      b.classList.add('used'); b.classList.remove('hint'); b.disabled = true; at++; misses = 0;
      if (at === word.word.length) { done = true; msg.textContent = word.word + '! ' + W.pick(CONTENT.praise); play(['word-' + word.word]); }
    } else {
      b.classList.add('heard-it'); setTimeout(() => b.classList.remove('heard-it'), 600); msg.textContent = 'Listen to the word. Try another letter.'; play(['word-' + word.word]);
      misses++;                                   // never stuck: after two misses the right letter glows, after four it drops in by itself
      const right = Array.prototype.find.call(tray.children, x => !x.disabled && x.textContent === word.word[at]);
      if (right && misses >= 2) right.classList.add('hint');
      if (right && misses >= 4) { msg.textContent = 'Here it is.'; put(right, word.word[at]); }
    }
  }
  W.reveal = W.reveal || {};
  W.reveal.write = () => {
    if (done || !word) return;
    done = true;
    Array.prototype.forEach.call(slots.children, (s, i) => { s.textContent = word.word[i]; });
    msg.textContent = 'This is how to write ' + word.word + '.';
    play(['word-' + word.word]);
  };
  $('wPic').addEventListener('click', () => { if (word) play(['word-' + word.word]); });
  $('wNext').addEventListener('click', round);
  hooks.enter.write = round;
  hooks.leave.write = () => { seq++; if (W.stopSound) W.stopSound(); };
})();
