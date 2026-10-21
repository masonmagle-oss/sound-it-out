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
  await p.addInitScript(() => { window.__AUTO_KID = 'p1'; });   // the main checks skip the "Who's playing?" picker
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const url = 'file://' + path.resolve(__dirname, '..', process.env.TARGET || 'index.html');
  const screens = ['sound','sight','read','say','letters','rhyme','match','detective','spell','silly','trace','stories','grown'];
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
  // Clap the parts: numeric choices for 1-3 beats, and the right one is praised as "parts"
  await p.goto(url);
  await p.click('#moreGamesBtn'); await p.click('[data-go="detective"]'); await p.click('[data-dmode="parts"]');
  await p.waitForTimeout(300);
  const partLabels = await p.locator('#dChoices .dchoice').allTextContents();
  for (let i = 0; i < partLabels.length; i++) await p.locator('#dChoices .dchoice').nth(i).click({ force: true });
  const partsOk = partLabels.length >= 2 && partLabels.every(t => /^[123]$/.test(t)) && /part/.test(await p.textContent('#dPraise'));
  console.log((partsOk ? 'ok   ' : 'FAIL ') + 'clap the parts offers 1-3 beats and praises as parts'); if (!partsOk) errs.push('parts mode: ' + partLabels.join(',') + ' / ' + await p.textContent('#dPraise'));
  // Stories: listed by level, every story has a question, a wrong picture is not a failure, the right one is praised
  await p.goto(url);
  await p.click('#moreGamesBtn'); await p.click('[data-go="stories"]');
  const books = await p.locator('#sBooks .menu-card').count();
  const levels = (await p.locator('#sBooks .sub').allTextContents()).map(t => Number(t.replace('Level ', '')));
  const sorted = levels.every((v, i) => i === 0 || levels[i - 1] <= v);
  await p.locator('#sBooks .menu-card').first().click();
  await p.click('#sQ');
  const pics = p.locator('#sPics .dchoice');
  let solvedOk = false;
  for (let i = 0; i < await pics.count(); i++) { await pics.nth(i).click({ force: true }); if (await pics.nth(i).evaluate(e => e.classList.contains('right'))) solvedOk = true; }
  const storyOk = books >= 25 && sorted && solvedOk && (await p.textContent('#sQPraise')).length > 0;
  console.log((storyOk ? 'ok   ' : 'FAIL ') + 'stories are listed by level and each has a question (' + books + ' stories)'); if (!storyOk) errs.push('stories: ' + books + ' ' + sorted + ' ' + solvedOk);
  // Word meanings, Write it, Find his level
  await p.goto(url);
  await p.click('#moreGamesBtn'); await p.click('[data-go="vocab"]'); await p.waitForTimeout(300);
  const vLabels = await p.locator('#vChoices .dchoice').allTextContents();
  for (let i = 0; i < vLabels.length; i++) await p.locator('#vChoices .dchoice').nth(i).click({ force: true });
  const vPr = await p.textContent('#vPraise');
  await p.click('[data-vmode="opp"]'); await p.waitForTimeout(300);
  const oppOk = (await p.locator('#vWord').isVisible()) && (await p.locator('#vChoices .dchoice').count()) === 3;
  const vocabOk = vLabels.length === 3 && new Set(vLabels).size === 3 && vPr.length > 0 && oppOk;
  console.log((vocabOk ? 'ok   ' : 'FAIL ') + 'word meanings: three different pictures, opposites with three words'); if (!vocabOk) errs.push('vocab: ' + vLabels.join(',') + ' / ' + vPr + ' / ' + oppOk);
  await p.goto(url);
  await p.click('#moreGamesBtn'); await p.click('[data-go="write"]'); await p.waitForTimeout(300);
  const wlen = await p.locator('#wSlots .wslot').count();
  for (let k = 0; k < wlen; k++) { const tiles = p.locator('#wTray .dchoice'); for (let i = 0; i < await tiles.count(); i++) await tiles.nth(i).click({ force: true }); }
  const wFilled = (await p.locator('#wSlots .wslot').allTextContents()).join('');
  const writeOk = wlen >= 2 && wFilled.length === wlen && (await p.textContent('#wMsg')).indexOf(wFilled) === 0;
  console.log((writeOk ? 'ok   ' : 'FAIL ') + 'write it: wrong letters do not stick, the word completes'); if (!writeOk) errs.push('write: ' + wlen + ' ' + wFilled);
  await p.goto(url);
  await p.click('#moreGamesBtn'); await p.click('#grownBtn'); await p.click('[data-go="place"]'); await p.waitForTimeout(300);
  for (let g = 0; g < 40 && !(await p.locator('#plDone').isVisible()); g++) {
    const wd = await p.textContent('#plWord');
    const em = await p.evaluate(x => WordPlay.CONTENT.words.find(w => w.word === x && !w.sight).emoji, wd);
    await p.locator('#plChoices .dchoice', { hasText: em }).first().click();
  }
  const top = await p.textContent('#plResult');
  await p.click('#plApply');
  const applied = await p.evaluate(() => WordPlay.settings.mixStart);
  await p.click('#plAgain');
  for (let g = 0; g < 3 && !(await p.locator('#plDone').isVisible()); g++) await p.locator('#plChoices .dchoice').first().click({ force: true });   // sometimes a lucky guess: only check it ends
  const placeOk = /level 7/.test(top) && applied === 7;
  console.log((placeOk ? 'ok   ' : 'FAIL ') + 'find his level: reading every word reaches level 7 and sets where Play starts'); if (!placeOk) errs.push('place: ' + top + ' ' + applied);
  // Word parts: endings and contractions each offer 3 choices and finish with praise
  await p.goto(url);
  await p.click('#moreGamesBtn'); await p.click('[data-go="parts"]'); await p.waitForTimeout(300);
  let wpOk = true;
  for (const m of ['end', 'pre', 'con']) {
    if (m !== 'end') { await p.click('[data-pmode="' + m + '"]'); await p.waitForTimeout(300); }
    const pc = p.locator('#pChoices .dchoice');
    const n = await pc.count();
    for (let i = 0; i < n && !/=/.test(await p.textContent('#pPraise')); i++) { await pc.nth(i).click({ force: true }); await p.waitForTimeout(1300); }   // a wrong tap makes the choices rest briefly
    wpOk = wpOk && n === 3 && /=/.test(await p.textContent('#pPraise'));
  }
  console.log((wpOk ? 'ok   ' : 'FAIL ') + 'word parts: endings and contractions'); if (!wpOk) errs.push('word parts');
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
  await p.waitForFunction(() => !WordPlay.pace.isLocked('rhNext'), null, { timeout: 12000 }).catch(() => {});   // real clips (phone build) must finish playing first
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
  const mixOn = await p.evaluate(() => WordPlay.mix.active());
  const okPlay = menuHidden && first === 'sound' && quick === 'home' && second === 'sound' && mixOn;
  console.log((okPlay ? 'ok   ' : 'FAIL ') + 'play button starts a mixed session'); if (!okPlay) errs.push('play: ' + [menuHidden, first, quick, second]);
  // Backup: save a file, wipe, load it back, and reject junk.
  await p.goto(url);
  await p.evaluate(() => { const W = window.WordPlay; W.go('grown'); });
  await p.waitForTimeout(200);
  if (!(await p.locator('#screen-grown').isVisible())) errs.push('grown-ups screen not visible');
  await p.evaluate(() => { WordPlay.track('m', true); WordPlay.track('m', true); WordPlay.track('a', false); });
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#exportBtn')]);
  const file = path.join(require('os').tmpdir(), 'sio-backup-test.json');
  await dl.saveAs(file);
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
  const goodSave = saved.kind === 'sound-it-out-progress' && saved.skills.m.r === 2 && saved.skills.a.m === 1;
  console.log((goodSave ? 'ok   ' : 'FAIL ') + 'backup file contents'); if (!goodSave) errs.push('backup contents wrong');
  await p.click('#resetChildBtn'); await p.click('#resetChildBtn');
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


  // More games is a grid of pictures with short names; Play shows the game it opens first.
  await p.goto(url);
  await p.waitForTimeout(200);
  const playPic = await p.evaluate(() => document.getElementById('playNext').textContent.trim());
  await p.click('#moreGamesBtn');
  const grid = await p.evaluate(() => {
    const cs = [...document.querySelectorAll('.menu-card')].filter(c => c.offsetParent !== null);
    return { n: cs.length, cols: new Set(cs.map(c => Math.round(c.getBoundingClientRect().left))).size, minH: Math.min.apply(null, cs.map(c => c.getBoundingClientRect().height)),
      subHidden: [...document.querySelectorAll('.menu-card .sub')].every(x => getComputedStyle(x).display === 'none'), overflow: document.documentElement.scrollWidth > innerWidth };
  });
  const okGrid = playPic === '\u{1F446}' && grid.cols === 2 && grid.minH >= 56 && grid.subHidden && grid.n >= 10 && !grid.overflow;
  console.log((okGrid ? 'ok   ' : 'FAIL ') + 'more games is a picture grid and Play shows its first game'); if (!okGrid) errs.push('grid: ' + playPic + ' ' + JSON.stringify(grid));
  // Trace letters: strokes must be followed in order and direction; being a little off the line is fine.
  await p.goto(url);
  await p.waitForTimeout(200);
  await p.evaluate(() => WordPlay.go('trace'));
  await p.waitForTimeout(300);
  const box = await p.locator('#tInk').boundingBox();
  const toPx = pt => [box.x + pt[0] * box.width / 100, box.y + pt[1] * box.height / 100];
  const drag = async (pts, wob) => {
    const pp = pts.map(pt => [pt[0] + (wob || 0), pt[1] + (wob || 0)]);
    const a = toPx(pp[0]); await p.mouse.move(a[0], a[1]); await p.mouse.down();
    for (let i = 1; i < pp.length; i += 2) { const q = toPx(pp[i]); await p.mouse.move(q[0], q[1]); }
    const z = toPx(pp[pp.length - 1]); await p.mouse.move(z[0], z[1]); await p.mouse.up();
  };
  const st0 = await p.evaluate(() => ({ letter: WordPlay.trace.letter(), strokes: WordPlay.trace.strokes().map(x => x.P) }));
  // off the dot, wrong direction (from the end of the stroke) and far from the line: nothing moves
  await drag([[80, 20], [85, 25], [90, 30]]);
  await drag(st0.strokes[0].slice().reverse());
  const stuck = await p.evaluate(() => WordPlay.trace.state());
  // the right way, a bit wobbly, in order: capital A (3 strokes), then little a (2 strokes)
  const strokesA = st0.strokes;
  for (const sk of strokesA) await drag(sk, 3);
  await p.waitForTimeout(1200);
  const mid = await p.evaluate(() => WordPlay.trace.state());
  const st1 = await p.evaluate(() => WordPlay.trace.strokes().map(x => x.P));
  for (const sk of st1) await drag(sk, -3);
  await p.waitForTimeout(300);
  const fin = await p.evaluate(() => ({ s: WordPlay.trace.state(), praise: document.getElementById('tPraise').textContent }));
  const okTrace = st0.letter === 'a' && stuck.si === 0 && stuck.idx === 0 && mid.lower === true && st1.length === 2 && fin.s.finished && fin.s.lower && /wrote Aa/.test(fin.praise) && WordPlay_praised(fin.praise);
  function WordPlay_praised(t) { return /(kept going|gave it a try|sounding it out|stuck with it|Nice trying)/.test(t); }
  console.log((okTrace ? 'ok   ' : 'FAIL ') + 'tracing follows stroke order and direction, big then little'); if (!okTrace) errs.push('trace: ' + JSON.stringify({ stuck, mid, fin }));
  // Mixed session: different games in turn, one focus sound, harder words only after the sounds are secure.
  await p.goto(url);
  await p.waitForTimeout(200);
  await p.click('#playBtn');
  const mixRun = await p.evaluate(async () => {
    const W = WordPlay, seen = [], lv = [];
    for (let i = 0; i < 24; i++) { seen.push(W.current()); const set = W.mixSet(); lv.push(set ? Math.max.apply(null, W.CONTENT.words.filter(w => !w.sight && set.has(w.word)).map(w => w.level || 1)) : 99); W.mix.advance(); await new Promise(r => setTimeout(r, 30)); }
    return { seen, lv, active: W.mix.active() };
  });
  const noRepeat = mixRun.seen.every((g, i) => i === 0 || g !== mixRun.seen[i - 1]);
  const variety = new Set(mixRun.seen).size >= 5 && !mixRun.seen.some(g => g === 'letters' || g === 'home');
  const gated = mixRun.lv.every(l => l <= 1);
  const okMix = mixRun.active && noRepeat && variety && gated;
  console.log((okMix ? 'ok   ' : 'FAIL ') + 'mixed session rotates games and stays on the first level'); if (!okMix) errs.push('mix: ' + JSON.stringify(mixRun));
  // The Next button in a game moves the mix on to the next game (after the round is finished or shown).
  await p.goto(url);
  await p.evaluate(() => { window.__PACE_STUCK_MS = 600; });
  await p.waitForTimeout(1700);
  await p.click('#playBtn');
  const promised = await p.evaluate(() => { const g = WordPlay.mix.upNext(), c = document.querySelector('.menu-card[data-go="' + g + '"] .big'); return [g, c ? c.textContent : '', document.querySelector('#nextBtn .next-pic').textContent.trim()]; });
  await p.waitForFunction(() => !WordPlay.pace.isLocked('nextBtn'), null, { timeout: 12000 }).catch(() => {});
  await p.click('#nextBtn');
  const afterNext = await p.evaluate(() => [WordPlay.current(), WordPlay.mix.active()]);
  const okNext = afterNext[0] === 'detective' && afterNext[1] && promised[0] === 'detective' && promised[1] && promised[2] === promised[1];
  console.log((okNext ? 'ok   ' : 'FAIL ') + 'next in a game moves the mix to the next game'); if (!okNext) errs.push('mix next: ' + afterNext + ' ' + promised);
  await p.evaluate(() => { window.__PACE_STUCK_MS = 0; WordPlay.go('home'); });
  const unlock = await p.evaluate(() => {
    const W = WordPlay, before = W.mix.levelNow();
    W.roundStart = 0;
    W.mix.newKeys()[1].forEach(k => { W.track(k, true); W.track(k, true); W.track(k, true); });
    return [before, W.mix.levelNow()];
  });
  const okUnlock = unlock[0] === 1 && unlock[1] === 2;
  console.log((okUnlock ? 'ok   ' : 'FAIL ') + 'next level opens when the sounds are secure'); if (!okUnlock) errs.push('unlock: ' + unlock);
  await p.evaluate(() => WordPlay.go('home'));
  const leftMix = await p.evaluate(() => { WordPlay.go('rhyme'); return WordPlay.mix.active(); });
  console.log((!leftMix ? 'ok   ' : 'FAIL ') + 'opening a game from More games ends the mix'); if (leftMix) errs.push('mix still active');
  // Wrong choices share the first sound, so he cannot pick by the first letter.
  const firstSound = await p.evaluate(async () => {
    const W = WordPlay, U = WordPlayUnit, words = W.CONTENT.words, fk = w => U.key(w.units[0]);
    const byWord = {}; words.forEach(w => { if (!w.sight) byWord[w.word] = w; });
    const sameFirst = (emoji, target) => words.some(x => !x.sight && x.emoji === emoji && fk(x) === fk(target));
    let matchOk = 0, rhymeOk = 0, N = 25;
    W.go('match'); await new Promise(r => setTimeout(r, 50));
    for (let i = 0; i < N; i++) {
      W.hooks.enter.match();
      const target = byWord[document.getElementById('mWordText').textContent];
      const emos = [...document.querySelectorAll('#mChoices .rce')].map(e => e.textContent);
      if (target && emos.length === 3 && new Set(emos).size === 3 && emos.every(e => sameFirst(e, target)) && emos.includes(target.emoji)) matchOk++;
    }
    W.go('rhyme'); await new Promise(r => setTimeout(r, 50));
    for (let i = 0; i < N; i++) {
      W.hooks.enter.rhyme();
      const target = byWord[document.getElementById('rtWord').textContent];
      const names = [...document.querySelectorAll('#rchoices .rchoice')].map(b => byWord[b.getAttribute('aria-label')]);
      const same = names.filter(w => w && fk(w) === fk(target)).length;
      if (target && same >= 2) rhymeOk++;
    }
    return { matchOk, rhymeOk, N };
  });
  const okFirst = firstSound.matchOk === firstSound.N && firstSound.rhymeOk >= firstSound.N * 0.8;
  console.log((okFirst ? 'ok   ' : 'FAIL ') + 'wrong pictures share the first sound'); if (!okFirst) errs.push('first sound: ' + JSON.stringify(firstSound));
  // Children: the picker, separate progress, migration of old saved data, per-child Play order and names.
  const fresh = async init => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const q = await ctx.newPage();
    q.on('pageerror', e => errs.push('profiles: ' + e.message));
    if (init) await q.addInitScript(init);
    await q.goto(url);
    return q;
  };
  const q = await fresh();
  const pickerShown = await q.locator('#screen-who').isVisible() && (await q.locator('.who-btn').count()) === 2 && !(await q.locator('#screen-home').isVisible());
  await q.evaluate(() => WordPlay.go('sound'));
  const stillPicker = await q.locator('#screen-who').isVisible();      // cannot skip the picker by navigating
  await q.click('.who-btn >> nth=1');
  await q.waitForTimeout(100);
  const home2 = await q.locator('#screen-home').isVisible() && /Child 2/.test(await q.textContent('#whoBtn'));
  await q.evaluate(() => { WordPlay.roundStart = 0; WordPlay.track('zz', true); WordPlay.track('zz', true); WordPlay.track('zz', true); });
  const key2 = await q.evaluate(() => localStorage.getItem('wordplay.skills.v1.p2') || '');
  const key1 = await q.evaluate(() => localStorage.getItem('wordplay.skills.v1') || '');
  await q.evaluate(() => { WordPlay.mark('soundedOut', 'sun'); });
  await q.waitForTimeout(1700);
  await q.click('#playBtn');
  const reader = await q.evaluate(() => WordPlay.current());
  await q.evaluate(() => WordPlay.go('home'));
  await q.click('#whoBtn');
  await q.click('.who-btn >> nth=0');
  const sepSkills = await q.evaluate(() => WordPlay.skillSummary().solid.indexOf('zz') < 0);
  await q.waitForTimeout(1700);
  await q.click('#playBtn');
  const starter = await q.evaluate(() => WordPlay.current());
  const okKids = pickerShown && stillPicker && home2 && key2.includes('zz') && !key1.includes('zz') && sepSkills && reader === 'read' && starter === 'sound';
  console.log((okKids ? 'ok   ' : 'FAIL ') + 'two children keep separate progress and Play order');
  if (!okKids) errs.push('kids: ' + JSON.stringify({ pickerShown, stillPicker, home2, key2: key2.slice(0, 30), key1: key1.slice(0, 30), sepSkills, reader, starter }));
  // Names and pictures are editable and saved.
  await q.evaluate(() => WordPlay.go('grown'));
  await q.fill('#kidName-p1', 'Sam'); await q.fill('#kidEmoji-p1', '\u{1F680}'); await q.press('#kidEmoji-p1', 'Tab');
  await q.waitForTimeout(100);
  const savedKids = await q.evaluate(() => JSON.parse(localStorage.getItem('wordplay.profiles.v1')));
  const okNames = savedKids[0].name === 'Sam' && savedKids[0].emoji === '\u{1F680}' && /Sam/.test(await q.textContent('#whoBtn'));
  console.log((okNames ? 'ok   ' : 'FAIL ') + 'names and pictures are saved'); if (!okNames) errs.push('names: ' + JSON.stringify(savedKids));
  // Reset this child leaves the other child alone.
  await q.evaluate(() => { WordPlay.go('home'); });
  await q.click('#whoBtn'); await q.click('.who-btn >> nth=1');
  await q.evaluate(() => WordPlay.go('grown'));
  await q.click('#resetChildBtn'); await q.click('#resetChildBtn');
  const after2 = await q.evaluate(() => localStorage.getItem('wordplay.skills.v1.p2'));
  const wiped2 = !after2 || !after2.includes('zz');
  console.log((wiped2 ? 'ok   ' : 'FAIL ') + 'reset this child erases only that child'); if (!wiped2) errs.push('reset child failed');
  await q.context().close();
  // Anything saved before there were children belongs to the first child, level included.
  const old = await fresh(() => {
    if (!localStorage.getItem('wordplay.settings.v1')) {
      localStorage.setItem('wordplay.settings.v1', JSON.stringify({ remember: true, level: '3', sessionLen: 6 }));
      localStorage.setItem('wordplay.skills.v1', JSON.stringify({ m: { r: 4, m: 0, s: 4 }, qq: { r: 3, m: 0, s: 3 } }));
      localStorage.setItem('wordplay.progress.v1', JSON.stringify({ soundedOut: ['sun'], sightGot: [], sightPractice: [] }));
    }
  });
  await old.click('.who-btn >> nth=0');
  const migrated = await old.evaluate(() => ({ lvl: WordPlay.settings.level, solid: WordPlay.skillSummary().solid.join(',') }));
  const okOld = migrated.lvl === '3' && /qq/.test(migrated.solid);
  console.log((okOld ? 'ok   ' : 'FAIL ') + 'saved data from before children moves to the first child'); if (!okOld) errs.push('migration: ' + JSON.stringify(migrated));
  await old.context().close();
  await b.close();
  if (errs.length) { console.error('ERRORS:', errs); process.exit(1); }
  console.log('all screens opened without page errors');
  if (!process.env.TARGET) {   // the phone build has no service worker
    const run = f => require('child_process').execFileSync('node', [path.join(__dirname, f)].concat(f === 'make-precache.js' ? ['--check'] : []), { stdio: 'inherit' });
    run('make-precache.js');   // fails if precache.json is stale
    run('check-stories.js');   // fails if a story uses a word above its level
    run('test-offline.js');
  }
})();
