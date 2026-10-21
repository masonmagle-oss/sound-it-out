// Builds candidate fixes for the clips tools/analyze-sounds.js flagged and an audition page to compare them with the originals.
//   node tools/make-variants.js        writes _new-clips/variants/*.mp3 and _new-clips/audition-fixes.html
// Pick on the page, save "Show my results" as results.json, then: node tools/install-clips.js results.json
// (the picks are paths like variants/m-short.mp3; the replaced originals are kept in old-sounds/)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..'), snd = path.join(root, 'sounds'), out = path.join(root, '_new-clips', 'variants');
fs.mkdirSync(out, { recursive: true });
function measure(f) {
  const r = require('child_process').spawnSync('ffmpeg', ['-nostats', '-i', f, '-af', 'astats', '-f', 'null', '-'], { encoding: 'utf8' });
  return Number(/Overall[\s\S]*?RMS level dB: (-?[\d.]+)/.exec(r.stderr)[1]);
}
const enc = (args, dst) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, '-ac', '1', '-ar', '44100', '-b:a', '128k', dst]);
const rows = [];
const add = (key, label, variants) => rows.push({ key, label, variants });
// loudness: gain to a target RMS, with a limiter just under full scale
const level = (key, targets) => {
  const src = path.join(snd, key + '.mp3'), cur = measure(src);
  add(key, key + '  (now ' + cur.toFixed(1) + ' dB RMS)', targets.map(([name, t]) => {
    const f = `${key}-${name}.mp3`; enc(['-i', src, '-af', `volume=${(t - cur).toFixed(1)}dB,alimiter=limit=0.89:level=disabled`], path.join(out, f));
    return [name + ' (' + t + ' dB RMS)', f];
  }));
};
// length: cut a held sound to N seconds with a short fade
const shorten = (key, secs) => {
  const src = path.join(snd, key + '.mp3');
  add(key, key + '  (now longer: shorten the hum)', secs.map(s => {
    const f = `${key}-${Math.round(s * 100)}ms.mp3`; enc(['-i', src, '-af', `atrim=0:${s},afade=t=out:st=${(s - 0.1).toFixed(2)}:d=0.1`], path.join(out, f));
    return [s + ' s', f];
  }));
};
['h', 'th', 'f', 's', 'sh', 'x', 'v', 'c', 'k', 't'].forEach(k => level(k, [['match', -19], ['softer', -23]]));
['a', 'u', 'letter-o'].forEach(k => level(k, [['match', -19]]));
['m', 'n'].forEach(k => shorten(k, [0.45, 0.6]));
shorten('e_long', [0.55]);
['word-ask', 'word-eat', 'word-feet', 'word-hurt', 'word-keep', 'word-kick', 'word-peach', 'word-seat', 'word-she', 'word-sheep', 'word-ship', 'word-skip', 'word-street', 'word-gem', 'word-paw'].forEach(k => level(k, [['match', -20]]));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = rows.map(r => `<section><h3>${esc(r.label)}</h3>` +
  `<label><audio controls preload="none" src="../../sounds/${r.key}.mp3"></audio> <input type="radio" name="${r.key}" value="" checked> Keep original</label><br>` +
  r.variants.map(([n, f]) => `<label><audio controls preload="none" src="variants/${f}"></audio> <input type="radio" name="${r.key}" value="variants/${f}"> ${esc(n)}</label>`).join('<br>') + '</section>').join('\n');
fs.writeFileSync(path.join(root, '_new-clips', 'audition-fixes.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Audition fixes</title>
<style>body{font:16px system-ui;max-width:42rem;margin:1rem auto;padding:0 1rem}section{border:1px solid #ccd;border-radius:10px;padding:.6rem 1rem;margin:.8rem 0}h3{margin:.2rem 0}label{display:block;margin:.3rem 0}pre{background:#eef;padding:1rem;white-space:pre-wrap}</style>
<h1>Audition fixes</h1><p>For each clip, play the original and the versions, then choose one. Quiet sounds: turn your volume up once, then compare. Leave "Keep original" if you prefer it.</p>
${html}
<button onclick="const r={};document.querySelectorAll('input[type=radio]:checked').forEach(i=>{if(i.value)r[i.name]=i.value});document.getElementById('o').textContent=JSON.stringify(r,null,1)">Show my results</button><pre id="o"></pre>`);
console.log(rows.length + ' clips, ' + rows.reduce((a, r) => a + r.variants.length, 0) + ' versions. Open _new-clips/audition-fixes.html');
