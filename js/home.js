/* Home: a big Play button that picks the next game, so a child who can't choose never has to.
   The full list of games stays one tap away under "More games". The order mixes sounding out, listening,
   reading and making, and is the same every time (predictable). */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const $ = id => document.getElementById(id);
  const ORDER = ['sound', 'rhyme', 'sight', 'detective', 'read', 'silly', 'spell', 'stories', 'letters', 'trace'];
  let i = 0;

  function setMore(open) {
    $('menu').hidden = !open;
    $('moreGamesBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    $('moreGamesBtn').textContent = open ? 'Fewer games' : 'More games';
  }
  $('playBtn').addEventListener('click', () => { const next = ORDER[i % ORDER.length]; i++; W.go(next); });
  $('moreGamesBtn').addEventListener('click', () => setMore($('menu').hidden));
  const prev = W.hooks.enter.home;
  W.hooks.enter.home = () => { if (prev) prev(); setMore(false); };
  W.home = { order: ORDER, showAll: () => setMore(true) };
})();
