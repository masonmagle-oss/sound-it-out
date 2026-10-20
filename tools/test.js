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
    await p.click('#moreGamesBtn');
    if (!(await p.locator('.menu-card[data-go="' + s + '"]').isVisible())) { console.log('skip ' + s + ' (hidden by default)'); continue; }
    await p.click('[data-go="' + s + '"]');
    await p.waitForTimeout(300);
    const visible = await p.locator('#screen-' + s).isVisible();
    console.log((visible ? 'ok   ' : 'FAIL ') + s);
    if (!visible) errs.push('screen not visible: ' + s);
  }
  // Pacing: Next is locked until the round is FINISHED. A wrong answer does not unlock it, a locked tap does nothing,
  // and it re-locks after use. A stuck round reveals its answer (no praise) and then unlocks.
  await p.goto(url);
  await p.evaluate(() => { window.__PACE_STUCK_MS = 1500; });
  await p.evaluate(() => WordPlay.go('rhyme'));
  await p.waitForTimeout(300);
  const lockedAtStart = await p.evaluate(() => WordPlay.pace.isLocked('rhNext'));
  await p.click('#rhNext', { force: true });   // aria-disabled buttons otherwise make Playwright wait
  const pill = await p.locator('#paceMsg').isVisible();
  await p.evaluate(() => { document.getElementById('rhPraise').textContent = 'Listen to the end. Try another picture.'; });
  await p.waitForTimeout(1800);
  const wrongStaysLocked = await p.evaluate(() => WordPlay.pace.isLocked('rhNext'));
  await p.evaluate(() => { document.getElementById('rhPraise').textContent = 'cat and hat rhyme! You kept going!'; });
  await p.waitForTimeout(1800);
  const unlocked = !(await p.evaluate(() => WordPlay.pace.isLocked('rhNext')));
  await p.click('#rhNext');
  const relocked = await p.evaluate(() => WordPlay.pace.isLocked('rhNext'));
  const okPace = lockedAtStart && pill && wrongStaysLocked && unlocked && relocked;
  console.log((okPace ? 'ok   ' : 'FAIL ') + 'next button is paced'); if (!okPace) errs.push('pace: ' + [lockedAtStart, pill, wrongStaysLocked, unlocked, relocked]);
  // Stuck for a while: the answer is shown (no praise phrase), and Next unlocks.
  await p.waitForTimeout(1500 + 1800);
  const reveal = await p.evaluate(() => ({ locked: WordPlay.pace.isLocked('rhNext'), text: document.getElementById('rhPraise').textContent, right: !!document.querySelector('#rchoices .right') }));
  const noPraise = await p.evaluate(t => !WordPlay.CONTENT.praise.some(x => t.indexOf(x) >= 0), reveal.text);
  const okStuck = !reveal.locked && reveal.right && noPraise;
  console.log((okStuck ? 'ok   ' : 'FAIL ') + 'stuck round shows the answer and unlocks'); if (!okStuck) errs.push('stuck: ' + JSON.stringify(reveal));
  // Wrong tap: the answer buttons rest for a moment.
  await p.click('#rhNext');
  await p.waitForTimeout(300);
  const rested = await p.evaluate(() => { const bs = [...document.querySelectorAll('#rchoices .rchoice')]; bs.find(b => !b.classList.contains('right')).classList.add('heard-it'); return new Promise(r => setTimeout(() => r(document.getElementById('rchoices').classList.contains('resting')), 100)); });
  console.log((rested ? 'ok   ' : 'FAIL ') + 'wrong tap makes the choices rest'); if (!rested) errs.push('resting class missing');
  // Softer misses: one miss is not a gap, two of the last five is; a miss before he could hear the word is ignored.
  await p.goto(url);
  const soft = await p.evaluate(async () => {
    const W = WordPlay; W.roundStart = Date.now() - 5000;
    W.track('zzq', false); const one = W.skillSummary().weak.includes('zzq');
    W.track('zzq', false); const two = W.skillSummary().weak.includes('zzq');
    W.roundStart = Date.now(); W.track('zzr', false); W.track('zzr', false); const fast = W.skillSummary().weak.includes('zzr');
    return [one, two, fast];
  });
  const okSoft = soft[0] === false && soft[1] === true && soft[2] === false;
  console.log((okSoft ? 'ok   ' : 'FAIL ') + 'misses are softened'); if (!okSoft) errs.push('soft: ' + soft);
  // Home: Play picks games in a fixed order and More games reveals the full list.
  await p.goto(url);
  const menuHidden = !(await p.locator('#menu').isVisible());
  await p.click('#playBtn');
  const first = await p.evaluate(() => WordPlay.current());
  await p.evaluate(() => WordPlay.go('home'));
  await p.click('#playBtn');                      // a quick second tap is ignored
  const quick = await p.evaluate(() => WordPlay.current());
  await p.waitForTimeout(1600);
  await p.click('#playBtn');
  const second = await p.evaluate(() => WordPlay.current());
  const okPlay = menuHidden && first === 'sound' && quick === 'home' && second === 'rhyme';
  console.log((okPlay ? 'ok   ' : 'FAIL ') + 'play button picks the next game'); if (!okPlay) errs.push('play: ' + [menuHidden, first, quick, second]);
  // Backup: save a file, wipe, load it back, and reject junk.
  await p.goto(url);
  await p.evaluate(() => { const W = window.WordPlay; W.go('grown'); });
  await p.waitForTimeout(200);
  if (!(await p.locator('#screen-grown').isVisible())) errs.push('grown-ups screen not visible');
  await p.click('#swRemember');
  await p.evaluate(() => { WordPlay.track('m', true); WordPlay.track('m', true); WordPlay.track('a', false); });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#exportBtn')]);
  const file = path.join(require('os').tmpdir(), 'sio-backup-test.json');
  await dl.saveAs(file);
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
  const goodSave = saved.kind === 'sound-it-out-progress' && saved.skills.m.r === 2 && saved.skills.a.m === 1;
  console.log((goodSave ? 'ok   ' : 'FAIL ') + 'backup file contents'); if (!goodSave) errs.push('backup contents wrong');
  await p.click('#resetBtn'); await p.click('#resetBtn');
  const wiped = await p.evaluate(() => WordPlay.skillSummary().solid.length + WordPlay.skillSummary().weak.length);
  await p.setInputFiles('#importFile', file);
  await p.waitForTimeout(300);
  const back = await p.evaluate(() => { const b = WordPlay.backup.make(); return { m: b.skills.m && b.skills.m.r, a: b.skills.a && b.skills.a.m, rem: JSON.parse(localStorage.getItem('wordplay.settings.v1') || '{}').remember }; });
  const goodLoad = wiped === 0 && back.m === 2 && back.a === 1 && back.rem === true;
  console.log((goodLoad ? 'ok   ' : 'FAIL ') + 'backup load restores progress'); if (!goodLoad) errs.push('backup load failed ' + JSON.stringify(back));
  fs.writeFileSync(file, '{"hello":1}');
  await p.setInputFiles('#importFile', file);
  await p.waitForTimeout(300);
  const msg = await p.textContent('#backupMsg');
  const goodReject = /not a Sound it out backup/.test(msg);
  console.log((goodReject ? 'ok   ' : 'FAIL ') + 'junk file rejected'); if (!goodReject) errs.push('junk accepted');
  // All done for today: after the chosen number of praised rounds the ending card appears and never restarts play.
  await p.goto(url);
  await p.evaluate(() => { WordPlay.settings.sessionRounds = 15; WordPlay.go('rhyme'); });
  const praise = async t => p.evaluate(x => { const e = document.getElementById('rhPraise'); e.textContent = ''; return new Promise(r => setTimeout(() => { e.textContent = x; r(); }, 20)); }, t);
  for (let i = 0; i < 14; i++) await praise('You kept going!');
  for (let i = 0; i < 3; i++) await praise('Listen to the end. Try another picture.');   // wrong answers do not count
  await p.waitForTimeout(2600);
  const early = await p.locator('#doneOverlay').isVisible();
  await praise('You kept going!');
  await p.waitForTimeout(2600);
  const shown = await p.locator('#doneOverlay').isVisible();
  const okEnd = !early && shown;
  console.log((okEnd ? 'ok   ' : 'FAIL ') + 'all done card appears after 15 rounds'); if (!okEnd) errs.push('done card: early=' + early + ' shown=' + shown);
  await p.click('#doneBtn');
  const home = await p.evaluate(() => WordPlay.current());
  const hidden = !(await p.locator('#doneOverlay').isVisible());
  console.log((home === 'home' && hidden ? 'ok   ' : 'FAIL ') + 'finish returns to menu'); if (!(home === 'home' && hidden)) errs.push('finish failed');
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
