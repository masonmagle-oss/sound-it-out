/* Short spoken "how to play" for each game, in the same recorded voice (clips named help-<screen>.mp3 in sounds/).
   Plays once per visit when a game opens, and a button replays it. If a clip is missing, nothing shows or plays. */
(function () {
  'use strict';
  const W = window.WordPlay;
  if (!W || !W.playKey || !W.hasKey) return;
  const $ = id => document.getElementById(id);
  const SCREENS = ['sound', 'sight', 'read', 'letters', 'rhyme', 'detective', 'spell', 'silly', 'trace', 'stories'];
  const heard = {};

  SCREENS.forEach(s => {
    const key = 'help-' + s;
    const sec = $('screen-' + s);
    if (!sec) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn ghost help-btn'; btn.hidden = true;
    btn.textContent = '🔊';   // an icon in the header corner: saves a whole row on a short phone
    btn.setAttribute('aria-label', 'Hear how to play this game');
    btn.addEventListener('click', () => { if (W.stopSound) W.stopSound(); W.playKey(key); });
    sec.insertBefore(btn, sec.firstChild);
    const prev = W.hooks.enter[s];
    W.hooks.enter[s] = () => {
      if (prev) prev();
      W.hasKey(key).then(has => {
        btn.hidden = !has;
        if (has && !heard[s] && W.settings.sound !== false) {
          heard[s] = true;
          setTimeout(() => { if (W.current() === s) W.playKey(key); }, 300);   // after the game's own setup
        }
      });
    };
  });
})();
