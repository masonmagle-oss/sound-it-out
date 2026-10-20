// Copies the takes you picked on _new-clips/audition.html into sounds/. Usage: node tools/install-clips.js results.json
// results.json is { "<clip key>": "<take file>" }. Existing clips are kept in old-sounds/ first. Then run:
// node tools/add-recorded-words.js (new words), node tools/make-precache.js, node tools/test.js
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const file = process.argv[2];
if (!file) { console.error('usage: node tools/install-clips.js results.json'); process.exit(1); }
const picks = JSON.parse(fs.readFileSync(file, 'utf8'));
fs.mkdirSync(path.join(root, 'old-sounds'), { recursive: true });
let n = 0;
for (const [key, take] of Object.entries(picks)) {
  const src = path.join(root, '_new-clips', take), dst = path.join(root, 'sounds', key + '.mp3');
  if (!/^[a-z0-9-]+$/.test(key) || !fs.existsSync(src)) { console.error('skipped', key, take); continue; }
  if (fs.existsSync(dst)) fs.copyFileSync(dst, path.join(root, 'old-sounds', key + '-before-new.mp3'));
  fs.copyFileSync(src, dst); n++;
}
console.log('installed ' + n + ' clips into sounds/');
