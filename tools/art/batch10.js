// Batch 10: the last drawings; plurals reuse earlier art.
const { K, L, c, e, r, p, line, dot, eyes, hi, wave, ground } = require('./kit');
const { B, R, Y, W, WD, G, GL, S, C, P, O, Gy, GyD, Br, Pu, T, Sk } = K;
const all = {};
for (let i = 1; i <= 9; i++) Object.assign(all, require('./batch0' + i + '.js'));
const two = k => `<g transform="translate(-6 18) scale(.58)">${all[k]}</g><g transform="translate(36 34) scale(.58)">${all[k]}</g>`;
const dots = (pts, rr, col) => pts.map(([x, y]) => c(x, y, rr, col)).join('');
module.exports = {
  catch: p('M20 60Q14 20 44 14Q74 12 82 44Q88 70 66 88Q40 98 20 60Z', Br) + p('M44 14Q40 40 56 50Q70 56 82 44', 'none', 'stroke-width="3.5" stroke="#8a6a3c"') + c(56, 62, 12, C) + p('M50 56q6 6 0 12M62 56q-6 6 0 12', 'none', 'stroke-width="2.5" stroke="#e63b2e"'),
  patch: r(10, 30, 80, 40, '#e8c796', 4).replace('<rect', '<rect transform="rotate(-20 50 50)"') + line('M26 64L74 36', 0.1) + '<g transform="rotate(-20 50 50)"><path d="M22 34v32M34 34v32M46 34v32M58 34v32M70 34v32M82 34v32" stroke="#8a6a3c" stroke-width="2.5" fill="none"/></g>',
  stitch: p('M6 40H94V76H6Z', B) + [14, 30, 46, 62, 78].map(x => line(`M${x} 40V76`, 0.1)).join('') + p('M12 58H88', 'none', 'stroke-width="3" stroke="#fffdf7" stroke-dasharray="8 6"') + p('M70 6L52 52', 'none', 'stroke-width="5" stroke="#aab4c4"') + p('M52 52q-4 8 2 12', 'none', 'stroke-width="3" stroke="#e63b2e"'),
  hatch: p('M20 46Q20 12 50 12Q80 12 80 46L88 90H12Z', C) + p('M12 54L26 44L38 58L52 42L66 58L80 44L90 52', 'none', 'stroke-width="3.5"') + c(50, 74, 14, Y) + p('M42 64Q50 38 58 64Z', Y) + dots([[46, 56], [54, 56]], 2.4, L) + p('M46 62l4 4l4-4Z', O),
  pitch: c(50, 50, 36, C) + p('M26 24Q40 50 26 76M74 24Q60 50 74 76', 'none', 'stroke-width="3.5" stroke="#e63b2e"') + [[34, 34], [30, 50], [34, 66], [66, 34], [70, 50], [66, 66]].map(([x, y]) => dot(x, y, 0)).join('') + line('M30 40l-6-2M30 50h-6M30 60l-6 2M70 40l6-2M70 50h6M70 60l6 2', 2.5, R),
  bridge: p('M4 56Q50 6 96 56', 'none', 'stroke-width="9" stroke="#8a6a3c"') + r(4, 54, 92, 10, WD, 2) + [18, 34, 50, 66, 82].map(x => line(`M${x} 56V${[40, 28, 24, 28, 40][[18, 34, 50, 66, 82].indexOf(x)] + 12}`, 3)).join('') + r(10, 64, 10, 26, Gy, 1) + r(80, 64, 10, 26, Gy, 1) + wave(88),
  badge: p('M50 4L62 14L78 12L82 28L96 38L88 52L92 68L76 72L68 88L50 82L32 88L24 72L8 68L12 52L4 38L18 28L22 12L38 14Z', Y) + c(50, 46, 20, R) + p('M50 34l4 8l9 1l-7 6l2 9l-8-5l-8 5l2-9l-7-6l9-1Z', C, 'stroke="none"'),
  fudge: p('M8 40L92 40L92 78L8 78Z', Br) + p('M8 40L22 24H78L92 40Z', '#b8763c') + line('M36 40V78M64 40V78', 3, '#6b3d12') + p('M54 22q4-6 10 0', 'none', 'stroke-width="3" stroke="#6b3d12"') + hi('M14 52h12'),
  judge: c(50, 24, 14, Sk) + p('M30 10Q50 -4 70 10Q74 20 70 28Q70 14 50 14Q30 14 30 28Q26 20 30 10Z', C) + p('M22 94Q22 46 50 44Q78 46 78 94Z', '#2b3042') + p('M44 44L50 62L56 44Z', C) + r(70, 70, 24, 8, Br, 3) + r(66, 78, 32, 8, WD, 3).replace('', ''),
  new: p('M50 6L60 20L78 14L76 34L96 42L80 54L88 74L68 72L62 92L50 78L38 92L32 72L12 74L20 54L4 42L24 34L22 14L40 20Z', Y) + line('M34 52L46 62L68 40', 7, R),
  flew: p('M10 40Q30 6 50 50Q70 6 90 40Q76 30 56 70L50 80L44 70Q24 30 10 40Z', S) + c(50, 56, 8, S) + p('M44 80l6 14l6-14Z', O) + line('M8 90H30M70 86H92', 3.5, Gy),
  screw: p('M30 20H70V32Q64 40 50 40Q36 40 30 32Z', GyD) + line('M42 22L58 30', 4, L) + p('M40 40H60L56 94H44Z', Gy) + [52, 62, 72, 82].map(y => line(`M38 ${y}L62 ${y - 6}`, 3, GyD)).join(''),
  chew: c(50, 50, 40, Y) + line('M26 42Q34 36 42 42M58 42Q66 36 74 42', 4) + p('M28 60Q50 86 72 60Z', R) + p('M34 62h32', 'none', 'stroke-width="3" stroke="#fffdf7"') + p('M62 78Q74 80 82 72', 'none', 'stroke-width="5" stroke="#e63b2e"') + dots([[22, 70]], 0, R),
  news: r(10, 14, 80, 74, C, 4) + r(18, 22, 64, 14, GyD, 2) + r(18, 42, 28, 22, S, 2) + line('M52 46H82M52 56H82M18 72H82M18 80H70', 3.5),
  ear: p('M50 8Q20 8 22 44Q24 66 36 74Q38 90 56 90Q74 88 70 70Q84 56 80 34Q76 8 50 8Z', Sk) + p('M46 28Q30 28 36 48Q40 60 50 56Q56 50 50 44Q46 40 52 36', 'none', 'stroke-width="3.5" stroke="#d99a5b"'),
  year: r(10, 14, 80, 76, C, 5) + r(10, 14, 80, 20, R, 5) + line('M28 8V20M72 8V20', 5) + [[24, 50], [42, 50], [60, 50], [24, 66], [42, 66], [60, 66], [78, 50], [78, 66]].map(([x, y]) => r(x - 5, y - 5, 10, 10, Gy, 2)).join('') + r(37, 61, 10, 10, Y, 2),
  dear: r(10, 24, 80, 56, C, 4) + p('M10 28L50 58L90 28', 'none', 'stroke-width="4"') + p('M50 76q-18-14-14-24q6-8 14 2q8-10 14-2q4 10-14 24Z', R),
  fear: c(50, 50, 40, Y) + p('M24 30Q34 22 42 34M76 30Q66 22 58 34', 'none', 'stroke-width="4"') + e(38, 48, 8, 10, C) + e(62, 48, 8, 10, C) + dots([[38, 50], [62, 50]], 3, L) + p('M40 76Q50 66 60 76', 'none', 'stroke-width="4.5"') + p('M82 20q6 6 2 12q-6-2-2-12Z', S),
  hear: p('M50 8Q20 8 22 44Q24 66 36 74Q38 90 56 90Q74 88 70 70Q84 56 80 34Q76 8 50 8Z', Sk) + p('M92 28Q100 46 92 64M86 36Q92 46 86 56', 'none', 'stroke-width="4" stroke="#2457d6"') + p('M46 28Q30 28 36 48Q40 60 50 56', 'none', 'stroke-width="3.5" stroke="#d99a5b"'),
  chair: r(26, 8, 48, 40, W, 4) + r(22, 48, 56, 12, WD, 3) + r(26, 60, 8, 32, WD, 2) + r(66, 60, 8, 32, WD, 2) + line('M38 16V40M50 16V40M62 16V40', 3, WD),
  fair: c(50, 40, 32, 'none') + c(50, 40, 32, 'none').replace('fill="none"', 'fill="#fffdf7" fill-opacity=".4"') + [0, 60, 120].map(a => `<path d="M50 40L${50 + 32 * Math.cos(a / 57.3)} ${40 + 32 * Math.sin(a / 57.3)}M50 40L${50 - 32 * Math.cos(a / 57.3)} ${40 - 32 * Math.sin(a / 57.3)}" stroke="#1d2433" stroke-width="3" fill="none"/>`).join('') + dots([[50, 8], [82, 40], [50, 72], [18, 40]], 7, R) + line('M50 72L34 94M50 72L66 94M26 94H74', 5),
  square: r(12, 12, 76, 76, B, 4) + r(30, 30, 40, 40, S, 2),
  scare: c(50, 50, 40, Y) + line('M24 32L40 42M76 32L60 42', 4.5) + c(36, 52, 9, C) + c(64, 52, 9, C) + dots([[36, 52], [64, 52]], 3.4, L) + e(50, 78, 12, 9, L) + p('M86 8l-6 12l8-4l-4 14', 'none', 'stroke-width="4" stroke="#e63b2e"'),
  cats: two('cat'),
  hats: two('hat'),
  pigs: two('pig'),
  dogs: two('dog'),
  bugs: two('bug'),
  boxes: two('box'),
  foxes: two('fox'),
  buses: two('bus'),
  'my-dog-can-sit': all.dog,
  'she-has-a-pink-hat': all.hat.split(B).join(P),
  'the-sun-will-rise-in-the': p('M8 70Q50 20 92 70Z', Y) + line('M50 8V22M20 20L30 30M80 20L70 30M8 46H22M78 46H92', 5, O) + r(4, 70, 92, 24, '#7fb3e6', 0) + wave(82),
  shop2: r(10, 40, 80, 50, W, 3) + p('M6 40L16 14H84L94 40Z', R) + [16, 30, 44, 58, 72].map((x, i) => p(`M${x} 40Q${x + 7} 52 ${x + 14} 40Z`, i % 2 ? C : R)).join('') + r(40, 58, 20, 32, '#2b3042', 2) + r(16, 54, 18, 18, S, 2) + r(66, 54, 18, 18, S, 2),
  school: r(10, 40, 80, 50, R, 3) + p('M4 42L50 14L96 42Z', Br) + r(44, 4, 12, 12, C, 2) + p('M50 -2V8', 'none', 'stroke-width="3"') + r(40, 62, 20, 28, '#2b3042', 2) + [[18, 52], [66, 52]].map(([x, y]) => r(x, y, 16, 16, S, 2)).join('') + c(50, 30, 6, Y),
  'cats-on-the-bridge': p('M4 70Q50 34 96 70', 'none', 'stroke-width="9" stroke="#8a6a3c"') + r(4, 68, 92, 10, WD, 2) + '<g transform="translate(18 20) scale(.5)">' + all.cat + '</g><g transform="translate(52 20) scale(.5)">' + all.cat + '</g>' + wave(92),
  iguana: p('M4 70Q20 52 40 56Q60 54 74 44Q82 30 94 36Q98 48 86 56Q78 72 52 76Q30 80 4 70Z', G) + [[30, 52], [44, 50], [58, 46]].map(([x, y]) => p(`M${x - 4} ${y}L${x} ${y - 10}L${x + 4} ${y}Z`, GL)).join('') + dot(86, 40, 2.8) + line('M22 80L14 92M60 78L58 92', 4.5, G) + p('M4 70Q-2 82 8 90', 'none', 'stroke-width="4"'),
  yellow: c(50, 50, 40, Y) + hi('M26 36q6-14 20-18'),
  alphabet: r(8, 14, 84, 72, C, 5) + dots([], 0, R) + '<path d="M14 40L22 18L30 40M17 33H27M40 18V40M40 18H48Q54 18 54 24Q54 29 48 29H40M48 29Q55 29 55 35Q55 40 48 40H40M70 18Q60 18 62 29Q64 40 72 38" fill="none" stroke="#2457d6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' + line('M14 56H86M14 72H70', 3.5, Gy)
};
