/* Word meanings: "Which one is an animal?" (pictures) and Opposites (words). Uses only existing word clips;
   the category prompts play sounds/vocab-<category>.mp3 when those clips exist (silent otherwise; the text is always shown). */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT, hooks } = W;
  const CATS = {
    animal: ['Which one is an animal?', 'cat dog pig fish duck fox hen frog crab bee goat cow sheep mouse owl horse snake shark whale bunny snail goose'],
    food: ['Which one is food?', 'milk cake jam nut peach corn toast rice candy bean'],
    clothes: ['Which one do we wear?', 'hat cap sock coat shirt boot'],
    vehicle: ['Which one takes us places?', 'bus van jet ship truck boat car train jeep bike plane'],
    body: ['Which one is part of the body?', 'leg lip hand chin neck thumb nose feet tooth arm ear hair knee'],
    home: ['Which one is in a home?', 'bed tub broom mop chair room roof'],
    nature: ['Which one is outside in nature?', 'sun moon star rain snow tree cloud sea leaf storm']
  };
  const OPP = [['big', 'little'], ['up', 'down'], ['wet', 'dry'], ['go', 'stop'], ['hot', 'cold'], ['fast', 'slow'], ['day', 'night'], ['old', 'new'], ['black', 'white'], ['in', 'out']];
  const pic = {};
  CONTENT.words.filter(w => !w.sight && w.emoji).forEach(w => { if (!pic[w.word]) pic[w.word] = w.emoji; });
  const cats = Object.keys(CATS).map(k => ({ key: k, ask: CATS[k][0], words: CATS[k][1].split(' ').filter(w => pic[w]) }));
  let seq = 0;
  async function play(keys) {
    if (!W.playKey) return;
    const my = ++seq;
    if (W.stopSound) W.stopSound();
    for (const k of keys) { if (my !== seq) return; await W.playKey(k); }
  }
  let mode = 'cat', right = null, solved = false, last = null;
  const box = $('vChoices'), praise = $('vPraise');

  function choice(label, emoji, word, ok) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dchoice'; b.setAttribute('aria-label', word);
    b.innerHTML = (emoji ? '<span class="rtemo" aria-hidden="true"></span>' : '') + '<span class="sub"></span>';
    if (emoji) W.pic(b.querySelector('.rtemo'), emoji);
    b.querySelector('.sub').textContent = label;
    b.addEventListener('click', () => {
      if (solved) return;
      if (ok) {
        solved = true; b.classList.add('right');
        praise.textContent = (mode === 'opp' ? $('vWord').dataset.word + ' and ' + word + ' are opposites. ' : '') + W.pick(CONTENT.praise);
      } else { b.classList.add('heard-it'); praise.textContent = 'Listen. Try another one.'; }
      play([W.wordKeyOf(word)]);
    });
    if (ok) right = b;
    box.appendChild(b);
  }

  function round() {
    play([]); solved = false; right = null; praise.textContent = ''; box.innerHTML = '';
    $('vWord').hidden = mode !== 'opp';
    if (mode === 'cat') {
      let c = W.pick(cats), t = 0;
      while (t++ < 6 && c.key === last) c = W.pick(cats);
      last = c.key;
      const target = W.pick(c.words), used = { [pic[target]]: true }, others = [];
      W.shuffle(cats.filter(x => x !== c).flatMap(x => x.words)).forEach(w => { if (others.length < 2 && !used[pic[w]]) { used[pic[w]] = true; others.push(w); } });
      $('vPrompt').textContent = c.ask;
      W.shuffle([target].concat(others)).forEach(w => choice(w, pic[w], w, w === target));
      play(['vocab-' + c.key]);
    } else {
      let p = W.pick(OPP), t = 0;
      while (t++ < 6 && p[0] === last) p = W.pick(OPP);
      const flip = Math.random() < 0.5, a = flip ? p[1] : p[0], b = flip ? p[0] : p[1];
      last = p[0];
      $('vPrompt').textContent = 'What is the opposite?';
      $('vWord').textContent = a; $('vWord').dataset.word = a; $('vWord').setAttribute('aria-label', 'Hear the word ' + a);
      const others = W.shuffle(OPP.filter(x => x !== p).flat()).slice(0, 2);
      W.shuffle([b].concat(others)).forEach(w => choice(w, null, w, w === b));
      play(['vocab-opposite', W.wordKeyOf(a)]);
    }
  }
  W.reveal = W.reveal || {};
  W.reveal.vocab = () => { if (solved || !right) return; solved = true; right.classList.add('right'); praise.textContent = 'Look: this one.'; };
  $('vWord').addEventListener('click', () => play([W.wordKeyOf($('vWord').dataset.word)]));
  $('vNext').addEventListener('click', round);
  Array.prototype.forEach.call(document.querySelectorAll('[data-vmode]'), b => b.addEventListener('click', () => {
    mode = b.getAttribute('data-vmode'); last = null;
    Array.prototype.forEach.call(document.querySelectorAll('[data-vmode]'), x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    round();
  }));
  hooks.enter.vocab = round;
  hooks.leave.vocab = () => { seq++; if (W.stopSound) W.stopSound(); };
})();
