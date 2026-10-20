/* Home: a big Play button that picks the next game, so a child who can't choose never has to.
   The full list of games stays one tap away under "More games". The order mixes sounding out, listening,
   reading and making, and is the same every time (predictable). */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const $ = id => document.getElementById(id);
  // Each child has a Play order (set on the grown-ups page). Same every time: predictable.
  const ORDERS = {
    start: ['sound', 'rhyme', 'sight', 'detective', 'read', 'silly', 'spell', 'stories', 'letters', 'trace'],
    reader: ['read', 'stories', 'spell', 'silly', 'rhyme', 'detective', 'sight', 'sound', 'letters', 'trace']
  };
  let ORDER = ORDERS.start;
  let i = 0;
  W.on('profileChanged', k => { ORDER = ORDERS[k && k.order] || ORDERS.start; i = 0; W.home.order = ORDER; });

  function setMore(open) {
    $('menu').hidden = !open;
    $('moreGamesBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    $('moreGamesBtn').textContent = open ? 'Fewer games' : 'More games';
  }
  let lastPlay = 0;
  $('playBtn').addEventListener('click', () => {
    if (Date.now() - lastPlay < 1500) return;      // a second quick tap does nothing
    lastPlay = Date.now();
    if (W.mix) { W.mix.start(); return; }          // a mixed session built around one sound at a time
    const next = ORDER[i % ORDER.length]; i++; W.go(next);
  });
  $('moreGamesBtn').addEventListener('click', () => setMore($('menu').hidden));
  const prev = W.hooks.enter.home;
  W.hooks.enter.home = () => { if (prev) prev(); setMore(false); };
  W.home = { order: ORDER, showAll: () => setMore(true) };
})();
