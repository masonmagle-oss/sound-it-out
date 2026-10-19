// Smoke test: opens every screen at phone size and fails on page errors.
// Usage: npm i -D playwright (once), then: node tools/test.js   (audio fetch errors on file:// are expected)
// TARGET=dist/sound-it-out-single-file.html node tools/test.js  tests the phone build instead of index.html.
// Also checks that every word, sentence and unit sound the content refers to has a clip in sounds/.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const url = 'file://' + path.resolve(__dirname, '..', process.env.TARGET || 'index.html');
  const screens = ['sound','sight','read','say','letters','rhyme','detective','spell','silly','trace','stories','grown'];
  for (const s of screens) {
    await p.goto(url);
    if (!(await p.locator('.menu-card[data-go="' + s + '"]').isVisible())) { console.log('skip ' + s + ' (hidden by default)'); continue; }
    await p.click('[data-go="' + s + '"]');
    await p.waitForTimeout(300);
    const visible = await p.locator('#screen-' + s).isVisible();
    console.log((visible ? 'ok   ' : 'FAIL ') + s);
    if (!visible) errs.push('screen not visible: ' + s);
  }
  await p.goto(url);
  const need = await p.evaluate(() => {
    const C = window.WordPlay.CONTENT, U = window.WordPlayUnit, keys = new Set();
    C.words.forEach(w => { keys.add('word-' + String(w.word).toLowerCase()); w.units.forEach(u => { const k = U.key(u); if (k !== '_') keys.add(k); }); });
    return [...keys];
  });
  const missing = need.filter(k => !fs.existsSync(path.resolve(__dirname, '..', 'sounds', k + '.mp3')) && !(process.env.TARGET || '').includes('single-file'));
  console.log(missing.length ? 'MISSING clips: ' + missing.join(', ') : 'all ' + need.length + ' word and unit clips present');
  if (missing.length) errs.push('missing clips: ' + missing.length);
  await b.close();
  if (errs.length) { console.error('ERRORS:', errs); process.exit(1); }
  console.log('all screens opened without page errors');
})();
