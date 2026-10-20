// Writes precache.json: every file the app needs offline, with a short content hash.
// The service worker downloads only the files whose hash changed. Run before every commit that touches
// index.html, css/, js/, sounds/, icons/ or manifest.webmanifest. `node tools/make-precache.js --check` fails if stale.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const files = ['index.html', 'manifest.webmanifest'];
for (const d of ['css', 'js', 'sounds', 'icons']) for (const f of fs.readdirSync(path.join(root, d)).sort()) files.push(d + '/' + f);
const text = /\.(html|css|js|webmanifest)$/;
const hash = f => {
  let b = fs.readFileSync(path.join(root, f));
  if (text.test(f)) b = Buffer.from(b.toString('utf8').replace(/\r\n/g, '\n'));   // same hash on Windows and on the server
  return crypto.createHash('sha1').update(b).digest('hex').slice(0, 10);
};
const map = {};
for (const f of files) map[f] = hash(f);
const version = crypto.createHash('sha1').update(JSON.stringify(map)).digest('hex').slice(0, 10);
const out = JSON.stringify({ version, files: map }, null, 1) + '\n';
const target = path.join(root, 'precache.json');
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(target) ? fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') : '';
  if (cur !== out) { console.error('precache.json is out of date: run node tools/make-precache.js'); process.exit(1); }
  console.log('precache.json is up to date');
} else { fs.writeFileSync(target, out); console.log('wrote precache.json,', files.length, 'files, version', version); }
