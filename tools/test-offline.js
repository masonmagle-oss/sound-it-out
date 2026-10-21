// Offline test: serves a temp copy of the app over http, lets the service worker save it, then checks that
// the app reloads with the network off, audio byte ranges work, and an update fetches only the changed file.
// Run by tools/test.js, or alone: node tools/test-offline.js
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wp-offline-'));
for (const f of ['index.html', 'manifest.webmanifest', 'sw.js', 'precache.json', 'css', 'js', 'sounds', 'icons', 'fonts', 'tools/make-precache.js'])
  fs.cpSync(path.join(root, f), path.join(tmp, f), { recursive: true });
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', webmanifest: 'application/manifest+json', png: 'image/png', mp3: 'audio/mpeg' };
const log = [];
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/$/, '/index.html');
  log.push(p.slice(1));
  fs.readFile(path.join(tmp, p), (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[p.split('.').pop()] || 'application/octet-stream', 'Cache-Control': 'max-age=600' });
    res.end(buf);
  });
});
const fail = [];
const check = (ok, what) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) fail.push(what); };
(async () => {
  await new Promise(r => server.listen(0, r));
  const url = 'http://localhost:' + server.address().port + '/';
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__AUTO_KID = 'p1'; });
  await p.goto(url);
  await p.waitForFunction(() => window.WordPlay && window.WordPlay.offlineState === 'ready', null, { timeout: 60000 });
  const total = Object.keys(JSON.parse(fs.readFileSync(path.join(tmp, 'precache.json'))).files).length;
  const saved = await p.evaluate(async () => { const m = await (await caches.match('__meta')).json(); return (await (await caches.open(m.name)).keys()).length; });
  check(saved === total, 'every file saved (' + saved + ' of ' + total + ')');

  await ctx.setOffline(true);
  await p.reload();
  check(await p.locator('#playBtn').isVisible(), 'app opens with the network off');
  const net = await p.evaluate(async () => {
    const part = await fetch('sounds/a.mp3', { headers: { Range: 'bytes=0-9' } });
    const head = await fetch('sounds/a.mp3', { method: 'HEAD' });
    const gone = await fetch('sounds/a.m4a', { method: 'HEAD' });
    return { s: part.status, n: (await part.arrayBuffer()).byteLength, cr: part.headers.get('Content-Range'), h: head.status, g: gone.status };
  });
  check(net.s === 206 && net.n === 10 && /^bytes 0-9\//.test(net.cr), 'audio byte range answered offline');
  check(net.h === 200 && net.g === 404, 'HEAD finds a saved clip and reports a missing one as 404');

  await ctx.setOffline(false);
  fs.appendFileSync(path.join(tmp, 'css/style.css'), '\n/* changed */\n');
  execFileSync('node', [path.join(tmp, 'tools/make-precache.js')]);
  log.length = 0;
  await p.evaluate(() => navigator.serviceWorker.ready.then(r => r.active.postMessage({ type: 'check' })));
  await p.waitForFunction(() => document.getElementById('offlineMsg').textContent.includes('Updated'), null, { timeout: 30000 });
  const got = log.filter(f => f !== 'precache.json');
  check(got.length === 1 && got[0] === 'css/style.css', 'update downloaded only the changed file (' + got.join(', ') + ')');
  check(errs.length === 0, 'no page errors ' + errs.join('; '));
  await b.close(); server.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  if (fail.length) { console.error('OFFLINE FAILURES:', fail); process.exit(1); }
  console.log('offline checks passed');
})().catch(e => { console.error(e); process.exit(1); });
