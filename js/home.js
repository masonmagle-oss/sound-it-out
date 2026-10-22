/* Home: a big Play button that starts the mixed session (js/mix.js), so a child who can't choose never has to.
   The full list of games stays one tap away under "More games". */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W) return;
  const $ = id => document.getElementById(id);
  function setMore(open) {
    $('menu').hidden = !open;
    $('screen-home').classList.toggle('more', open);   // the open list takes the whole screen
    $('whoBtn').closest('.row').hidden = open;
    $('moreGamesBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    $('moreGamesBtn').textContent = open ? 'Fewer games' : 'More games';
  }
  let lastPlay = 0;
  $('playBtn').addEventListener('click', () => {
    if (Date.now() - lastPlay < 1500) return;      // a second quick tap does nothing
    lastPlay = Date.now();
    W.mix.start();                                 // a mixed session built around one sound at a time
  });
  $('moreGamesBtn').addEventListener('click', () => setMore($('menu').hidden));
  const prev = W.hooks.enter.home;
  W.hooks.enter.home = () => { if (prev) prev(); setMore(false); };
  W.home = { showAll: () => setMore(true) };
})();
