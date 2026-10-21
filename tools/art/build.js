// Builds the art: names every emoji in the content (the drawing it will be replaced by), writes js/art.js from tools/art/batch*.js,
// and writes a contact sheet per batch to docs/design/art/. Usage: node tools/art/build.js
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..', '..');
global.window = {}; require(path.join(root, 'js/content.js')); require(path.join(root, 'js/stories-more.js'));
const C = window.WORDPLAY_CONTENT;
// 1. every distinct emoji and the words, sentences and stories that use it (in the order the app meets them)
const used = new Map();
const add = (e, label) => { if (!e || typeof e !== 'string' || e.indexOf('svg:') === 0) return; if (!used.has(e)) used.set(e, []); if (!used.get(e).includes(label)) used.get(e).push(label); };
C.words.forEach(w => add(w.emoji, w.word)); C.sentences.forEach(s => add(s.emoji, 'S:' + s.text));
C.stories.forEach(s => { add(s.emoji, 'T:' + s.title); (s.q || []).forEach(q => q.pics.forEach(x => add(x[0], x[1]))); }); C.letters.forEach(l => add(l.emoji, 'L:' + l.word));
// 2. a drawing name for each emoji: the first plain word that uses it (or a name given in tools/art/names.json)
const given = fs.existsSync(path.join(__dirname, 'names.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'names.json'), 'utf8')) : {};
const slug = t => t.toLowerCase().replace(/^[stl]:/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
const names = {}; const taken = new Set();
for (const [e, labels] of used) {
  let n = given[e] || (labels.find(l => !/^[STL]:/.test(l)) || slug(labels[0]));
  n = slug(n); let k = n, i = 2; while (taken.has(k) && !given[e]) k = n + (i++); taken.add(k); names[e] = k;
}
fs.writeFileSync(path.join(__dirname, 'names.out.json'), JSON.stringify(names, null, 1));
// 3. the drawings
const batches = fs.readdirSync(__dirname).filter(f => /^batch\d+\.js$/.test(f)).sort();
const all = {}; batches.forEach(b => Object.assign(all, require('./' + b)));
const wrap = inner => '<svg class="dpic" viewBox="0 0 100 100" aria-hidden="true" focusable="false" stroke="#1d2433" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">' + inner + '</svg>';
const out = ['/* Drawn pictures for words, sentences and stories (built by tools/art/build.js from tools/art/batch*.js: edit those, not this file). */', '(function () {', "  'use strict';", '  const P = window.WORDPLAY_PICS = window.WORDPLAY_PICS || {};', '  const s = i => \'' + wrap('\' + i + \'') + '\';', '  Object.assign(P, {'];
Object.entries(all).forEach(([k, v], i, a) => out.push('    ' + JSON.stringify('art-' + k) + ': s(' + JSON.stringify(v) + ')' + (i < a.length - 1 ? ',' : '')));
out.push('  });', '})();', '');
fs.writeFileSync(path.join(root, 'js', 'art.js'), out.join('\n'));
// 4. contact sheets (one per batch), with the Apple emoji beside each drawing for comparison
const byName = {}; for (const [e, n] of Object.entries(names)) byName[n] = e;
fs.mkdirSync(path.join(root, 'docs', 'design', 'art'), { recursive: true });
batches.forEach(b => {
  const d = require('./' + b);
  const cards = Object.entries(d).map(([k, v]) => `<div class="c"><div class="row">${wrap(v)}<span class="e">${byName[k] || ''}</span></div><b>${k}</b></div>`).join('');
  fs.writeFileSync(path.join(root, 'docs', 'design', 'art', b.replace('.js', '.html')), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${b}</title><style>body{margin:0;padding:18px 10px 40px;background:#f3eee2;font:15px system-ui,sans-serif;color:#1d2433}h1{font-size:18px;text-align:center}.g{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:60rem;margin:0 auto}.c{width:128px;text-align:center;background:#fffdf7;border:3px solid #1d2433;border-radius:12px;box-shadow:0 4px 0 #1d2433;padding:8px 4px 6px}.row{display:flex;align-items:center;justify-content:center;gap:6px}svg{width:72px;height:72px}.e{font-size:30px;opacity:.55}b{display:block;font-size:13px;margin-top:3px}</style><h1>${b.replace('.js', '')}: ${Object.keys(d).length} drawings (left: ours, right: Apple's emoji today)</h1><div class="g">${cards}</div>`);
});
console.log(Object.keys(all).length + ' drawings of ' + used.size + ' needed; batches: ' + batches.join(', '));
const missing = Object.values(names).filter(n => !(n in all)); console.log('still to draw: ' + missing.length);
