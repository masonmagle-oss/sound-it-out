// Drawing kit for the letterpress art style. A drawing is a string of SVG shapes on a 100x100 board; the build wraps it in an <svg>
// that sets the ink outline (3.5, round) so every shape only needs a fill. Keep to this palette and to flat colour (no gradients).
const L = '#1d2433';
const K = {
  L, B: '#2457d6', R: '#e63b2e', Y: '#ffd23f', W: '#d9b07a', WD: '#8a6a3c', G: '#3fa34d', GL: '#7fd08a', S: '#7fb3e6', C: '#fffdf7',
  P: '#ff8fb8', O: '#f28c28', Gy: '#aab4c4', GyD: '#6b7587', Br: '#8a5a2b', Pu: '#8e5bd1', T: '#2bb8a5', Sk: '#ffd9a8', Ln: '#bfe3a3', N: 'none'
};
const f = n => (typeof n === 'number' ? +n.toFixed(1) : n);
const c = (x, y, r, fill) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"/>`;
const e = (x, y, rx, ry, fill, rot) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''}/>`;
const r = (x, y, w, h, fill, rx = 4) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="${fill}"/>`;
const p = (d, fill = 'none', extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, w = 3.5, stroke) => `<path d="${d}" fill="none" stroke-width="${w}"${stroke ? ` stroke="${stroke}"` : ''}/>`;
const dot = (x, y, rr = 3.4) => `<circle cx="${f(x)}" cy="${f(y)}" r="${rr}" fill="${L}" stroke="none"/>`;
const eyes = (a, b, y, rr = 3.4) => dot(a, y, rr) + dot(b, y, rr);
const hi = d => `<path d="${d}" fill="none" stroke="#fff" stroke-width="4"/>`;
const g = (inner, t) => `<g transform="${t}">${inner}</g>`;
const txt = (x, y, ch, size = 30, fill = L) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Andika,Comic Sans MS,sans-serif" font-weight="700" font-size="${size}" fill="${fill}" stroke="none">${ch}</text>`;
const wave = (y = 88, col = '#2457d6') => `<path d="M6 ${y}q8-6 16 0t16 0 16 0 16 0 16 0" fill="none" stroke="${col}" stroke-width="3.5"/>`;
const ground = (y = 90) => `<path d="M6 ${y}h88" fill="none" stroke="#8a6a3c" stroke-width="4"/>`;
module.exports = { K, L, c, e, r, p, line, dot, eyes, hi, g, txt, wave, ground };
