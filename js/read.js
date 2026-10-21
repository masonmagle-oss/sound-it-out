(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const { $, CONTENT, hooks } = W;
  const sentences = CONTENT.sentences || [];
  const box = $('rwords'), stage = $('rstage'), emo = $('remo'), praise = $('rpraise'), sr = $('rsr');
  let order = [], oi = -1, cur = null, lit = new Set(), token = 0;
  // a sentence's stage is the highest stage among its words
  const stageOfWord = {};
  CONTENT.words.forEach(w => { const k = String(w.word).toLowerCase(); stageOfWord[k] = Math.min(stageOfWord[k] || 99, w.level || 1); });
  const sentenceStage = sn => sn.text.toLowerCase().replace(/[^a-z ]/g, '').split(' ').filter(Boolean).reduce((m, w) => Math.max(m, stageOfWord[w] || 1), 1);
  function sentencesForStage() {
    const lim = W.stageLimit();
    const list = sentences.filter(sn => sentenceStage(sn) <= lim);
    const all = list.length ? list : sentences, set = W.mixSet();
    if (set) {                                 // mixed session: sentences that use a focus word
      const f = all.filter(sn => sn.text.toLowerCase().replace(/[^a-z ]/g, '').split(' ').some(w => set.has(w)));
      if (f.length >= 2) return f;
    }
    return all;
  }

  function load(sn) {
    token++;
    cur = sn; lit = new Set();
    box.innerHTML = '';
    sn.text.split(' ').forEach((w, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = w; b.dataset.i = i;
      b.setAttribute('aria-label', 'word ' + w);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => tap(i, b, w));
      box.appendChild(b);
    });
    stage.classList.remove('show');
    emo.className = 'emo'; emo.textContent = '';
    praise.textContent = ''; sr.textContent = '';
  }
  async function tap(i, b, w) {
    if (!cur) return;
    b.classList.add('lit'); b.setAttribute('aria-pressed', 'true');
    b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle');
    W.emit('readWord', w);
    if (W.playKey) W.playKey(W.wordKeyOf(w));
    lit.add(i);
    if (lit.size === cur.text.split(' ').length) {
      const my = token, sn = cur;
      await W.sleep(900);
      if (my !== token) return;
      sr.textContent = 'The sentence is: ' + sn.text + '.';
      W.pic(emo, sn.emoji || '');
      emo.className = 'emo anim-pop'; void emo.offsetWidth;
      stage.classList.add('show');
      praise.textContent = W.pick(CONTENT.praise);
      if (W.playKey) W.playKey(W.sentenceKeyOf(sn.text));
    }
  }
  function next() {
    if (!sentences.length) return;
    if (!order.length || oi >= order.length - 1) {
      order = W.shuffle(sentencesForStage());
      if (cur && order.length > 1 && order[0] === cur) { const t = order[0]; order[0] = order[1]; order[1] = t; }
      oi = -1;
    }
    oi++;
    load(order[oi]);
  }
  $('rAgain').addEventListener('click', () => { if (W.stopSound) W.stopSound(); if (cur) load(cur); });
  $('rNext').addEventListener('click', () => { if (W.stopSound) W.stopSound(); next(); });
  hooks.enter.read = () => { if (W.mixSet()) order = []; next(); };
  hooks.leave.read = () => { token++; if (W.stopSound) W.stopSound(); };
})();
