/* The drawn icons for the game menu (same letterpress style as pics.js), applied to the menu cards.
   A card's picture is stored as its token ('svg:ui-sound') in data-pic, which the mixed Play session reads to show "what comes next". */
(function () {
  'use strict';
  const W = window.WordPlay, P = window.WORDPLAY_PICS;
  if (!W || !P) return;
  const L = '#1d2433';
  const s = i => '<svg class="dpic" viewBox="0 0 100 100" aria-hidden="true" focusable="false" stroke="' + L + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">' + i + '</svg>';
  const t = (x, y, ch, size, fill) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Andika,Comic Sans MS,sans-serif" font-weight="700" font-size="' + (size || 30) + '" fill="' + (fill || L) + '" stroke="none">' + ch + '</text>';
  const block = (x, y, w, h, fill) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + (fill || '#d9b07a') + '"/>';
  Object.assign(P, {
    'ui-sound': s(block(6, 36, 28, 36) + block(36, 22, 28, 36, '#e8c796') + block(66, 36, 28, 36) + '<path d="M6 76h88" fill="none" stroke="#8a6a3c" stroke-width="5"/><path d="M44 12l-4-6M50 10V3M56 12l4-6" fill="none" stroke="#ffd23f" stroke-width="3.5"/>' + t(20, 64, 'c') + t(50, 50, 'a') + t(80, 64, 't')),
    'ui-sight': s('<path d="M8 50Q50 12 92 50Q50 88 8 50Z" fill="#fffdf7"/><circle cx="50" cy="50" r="17" fill="#2457d6"/><circle cx="50" cy="50" r="7" fill="' + L + '"/><circle cx="45" cy="44" r="3.5" fill="#fff" stroke="none"/>'),
    'ui-read': s('<path d="M10 24Q30 16 50 26V84Q30 74 10 82Z" fill="#fffdf7"/><path d="M90 24Q70 16 50 26V84Q70 74 90 82Z" fill="#fffdf7"/><path d="M20 38q12-4 22 2M20 50q12-4 22 2M58 40q10-6 22-2M58 52q10-6 22-2" fill="none" stroke-width="3"/>'),
    'ui-letters': s(block(10, 18, 80, 64) + '<path d="M10 76h80" fill="none" stroke="#8a6a3c" stroke-width="6"/>' + t(50, 62, 'Aa', 40)),
    'ui-rhyme': s('<ellipse cx="30" cy="74" rx="13" ry="9" fill="#2457d6" transform="rotate(-20 30 74)"/><ellipse cx="70" cy="66" rx="13" ry="9" fill="#e63b2e" transform="rotate(-20 70 66)"/><path d="M41 71V26L81 17V62" fill="none" stroke-width="5"/><path d="M41 38L81 29" fill="none" stroke-width="9"/>'),
    'ui-match': s('<rect x="8" y="14" width="84" height="72" rx="6" fill="#d9b07a"/><rect x="18" y="24" width="64" height="52" rx="3" fill="#7fb3e6"/><circle cx="64" cy="40" r="9" fill="#ffd23f"/><path d="M18 76V62Q36 46 52 62Q66 52 82 64V76Z" fill="#3fa34d"/>'),
    'ui-detective': s('<path d="M62 62L88 88" fill="none" stroke="#8a5a2b" stroke-width="10"/><circle cx="42" cy="42" r="30" fill="#cfe6ff"/><circle cx="42" cy="42" r="30" fill="none" stroke="#2457d6" stroke-width="6"/>' + t(42, 54, 's', 34)),
    'ui-spell': s(block(6, 34, 26, 32) + block(36, 34, 26, 32) + '<rect x="66" y="34" width="28" height="32" rx="4" fill="none" stroke-dasharray="6 5"/><path d="M6 70h26M36 70h26" fill="none" stroke="#8a6a3c" stroke-width="5"/>' + t(19, 59, 'c', 26) + t(49, 59, 'a', 26) + '<path d="M80 84V74M74 80l6-8l6 8" fill="none" stroke="#e63b2e" stroke-width="3.5"/>'),
    'ui-silly': s('<circle cx="50" cy="50" r="40" fill="#ffd23f"/><circle cx="35" cy="40" r="9" fill="#fff"/><circle cx="66" cy="38" r="12" fill="#fff"/><circle cx="38" cy="43" r="3.5" fill="' + L + '" stroke="none"/><circle cx="63" cy="35" r="4.5" fill="' + L + '" stroke="none"/><path d="M28 66Q50 80 72 62" fill="none" stroke-width="4"/><path d="M52 70q4 18 14 8q4-8-2-14Z" fill="#ff8fb8"/>'),
    'ui-trace': s('<path d="M14 70Q16 30 40 30Q60 30 56 52Q52 74 74 70" fill="none" stroke="#2457d6" stroke-width="4" stroke-dasharray="2 8"/><path d="M60 14L88 42L46 84L18 84L18 56Z" fill="#ffd23f" transform="translate(4 -4)"/><path d="M22 80L22 58L46 82Z" fill="#d9b07a" transform="translate(4 -4)"/><path d="M60 14L88 42" fill="none" stroke="#e63b2e" stroke-width="9" transform="translate(4 -4)"/>'),
    'ui-stories': s('<rect x="14" y="62" width="72" height="22" rx="4" fill="#2457d6"/><rect x="20" y="40" width="64" height="22" rx="4" fill="#e63b2e"/><rect x="12" y="18" width="68" height="22" rx="4" fill="#3fa34d"/><path d="M24 62v22M28 40v22M22 18v22" fill="none" stroke="#fffdf7" stroke-width="3"/>'),
    'ui-vocab': s('<path d="M12 18H88V66H46L26 84V66H12Z" fill="#fffdf7"/><path d="M26 34h48M26 46h32" fill="none" stroke-width="4"/>'),
    'ui-write': s('<rect x="10" y="14" width="80" height="72" rx="4" fill="#fffdf7"/><path d="M20 66h60M20 40h60" fill="none" stroke="#7fb3e6" stroke-width="2.5"/>' + t(36, 62, 'a', 34, '#2457d6') + t(62, 62, 'b', 34, '#2457d6')),
    'ui-parts': s(block(4, 32, 38, 36) + block(58, 32, 38, 36) + '<path d="M50 38v24M38 50h24" fill="none" stroke="#e63b2e" stroke-width="5" transform="translate(0 0) scale(.5) translate(50 50)"/>' + t(23, 58, 'un', 24) + t(77, 58, 'do', 24) + '<path d="M44 50h12M50 44v12" fill="none" stroke="#e63b2e" stroke-width="5"/>'),
    'ui-caps': s(block(6, 14, 46, 72) + block(58, 46, 36, 40) + t(29, 66, 'A', 52) + t(76, 74, 'a', 36))
  });
  const OF = { sound: 'ui-sound', sight: 'ui-sight', read: 'ui-read', letters: 'ui-letters', rhyme: 'ui-rhyme', match: 'ui-match', detective: 'ui-detective', spell: 'ui-spell', silly: 'ui-silly', trace: 'ui-trace', stories: 'ui-stories', vocab: 'ui-vocab', write: 'ui-write', parts: 'ui-parts', caps: 'ui-caps' };
  document.querySelectorAll('.menu-card[data-go]').forEach(c => { const k = OF[c.getAttribute('data-go')], big = c.querySelector('.big'); if (k && big) W.pic(big, 'svg:' + k); });
})();
