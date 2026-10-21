/* Drawn pictures for words that have no good emoji. A word whose emoji is 'svg:name' shows WORDPLAY_PICS[name].
   Original flat drawings (inline SVG, so they work offline and need no files). Load right after content.js. */
(function () {
  'use strict';
  const L = '#24304a';                       // outline colour: the app's ink
  const s = inner => '<svg class="dpic" viewBox="0 0 100 100" aria-hidden="true" focusable="false" stroke="' + L + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">' + inner + '</svg>';
  window.WORDPLAY_PICS = {
    chip: s('<path d="M10 56C8 30 38 14 62 19C86 25 94 50 81 69C68 88 34 91 19 77C13 71 10 64 10 56Z" fill="#f3c548"/><path d="M22 52Q36 40 50 52T78 50" fill="none"/><circle cx="34" cy="68" r="3" fill="#b8801b" stroke="none"/><circle cx="62" cy="34" r="3" fill="#b8801b" stroke="none"/><circle cx="68" cy="66" r="3" fill="#b8801b" stroke="none"/><circle cx="44" cy="30" r="2.5" fill="#b8801b" stroke="none"/>'),
    cot: s('<rect x="8" y="42" width="84" height="14" rx="6" fill="#7fb3e6"/><rect x="10" y="33" width="24" height="10" rx="5" fill="#fff"/><path d="M20 56L34 84M34 56L20 84M66 56L80 84M80 56L66 84" fill="none"/>'),
    jug: s('<path d="M32 30V22Q50 12 68 22V30Q84 40 84 62Q84 90 50 90Q16 90 16 62Q16 40 32 30Z" fill="#6ea8e0"/><path d="M84 44Q99 46 96 64Q93 78 80 76" fill="none"/><rect x="34" y="14" width="32" height="8" rx="4" fill="#4a7fb8"/><path d="M30 56Q30 72 42 78" fill="none" stroke="#fff" stroke-width="4"/>'),
    mop: s('<path d="M62 4L50 50" fill="none" stroke="#8a5a2b" stroke-width="6"/><rect x="30" y="46" width="40" height="9" rx="4" fill="#8793a6"/><path d="M33 55Q30 72 34 92M41 55Q40 74 42 94M50 55Q50 76 50 96M59 55Q60 74 58 94M67 55Q70 72 66 92" fill="none" stroke="#c9bd9a" stroke-width="5"/>'),
    gum: s('<circle cx="50" cy="36" r="26" fill="#ff8fb8"/><path d="M34 24Q39 17 48 16" fill="none" stroke="#fff" stroke-width="5"/><path d="M26 66Q50 54 74 66Q62 84 50 84Q38 84 26 66Z" fill="#e0453a"/><path d="M28 66Q50 70 72 66" fill="none"/>'),
    lid: s('<path d="M12 64Q12 34 50 34Q88 34 88 64Z" fill="#aab4c4"/><rect x="42" y="22" width="16" height="12" rx="4" fill="#5b6577"/><rect x="8" y="64" width="84" height="9" rx="4.5" fill="#8793a6"/><path d="M26 54Q30 44 40 42" fill="none" stroke="#fff" stroke-width="4"/>'),
    rug: s('<rect x="14" y="30" width="72" height="44" rx="5" fill="#e0735a"/><rect x="22" y="38" width="56" height="28" rx="3" fill="#f3b27a"/><path d="M50 42L62 52L50 62L38 52Z" fill="#e0453a"/><path d="M14 38H6M14 46H6M14 54H6M14 62H6M14 70H6M86 38H94M86 46H94M86 54H94M86 62H94M86 70H94" fill="none"/>'),
    whip: s('<path d="M14 84L34 62" fill="none" stroke="#8a5a2b" stroke-width="9"/><path d="M34 62Q74 8 90 46Q96 64 80 64Q70 64 74 54" fill="none" stroke="#3b2b1f" stroke-width="4"/>'),
    tail: s('<path d="M12 60Q10 40 28 38H62Q78 38 78 56V78H66V66H30V78H18V70Q12 68 12 60Z" fill="#d9a066"/><circle cx="24" cy="34" r="13" fill="#d9a066"/><path d="M14 24Q8 34 14 44" fill="#a56a35"/><circle cx="28" cy="32" r="2.5" fill="#24304a" stroke="none"/><path d="M78 50Q94 44 90 20" fill="none" stroke="#b8531f" stroke-width="10"/><path d="M96 26Q99 33 96 40M86 12Q94 6 98 12" fill="none" stroke-width="3"/>'),
    chin: s('<circle cx="50" cy="44" r="34" fill="#ffd9a8"/><circle cx="38" cy="38" r="3.5" fill="' + L + '" stroke="none"/><circle cx="62" cy="38" r="3.5" fill="' + L + '" stroke="none"/><path d="M38 54Q50 62 62 54" fill="none"/><path d="M28 66Q50 90 72 66" fill="none" stroke="#e0453a" stroke-width="7"/><path d="M50 98V84M42 90L50 82L58 90" fill="none" stroke="#e0453a" stroke-width="4"/>')
  };
})();
