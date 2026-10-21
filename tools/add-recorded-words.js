// Adds proposed words to js/content.js once their recordings exist (the word clip and every sound clip it uses).
// Words without a picture (endings, contractions) are skipped: they need their own activity. Usage: node tools/add-recorded-words.js [--dry]
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const P = require('./new-words-data.js');
global.window = {}; require('../js/content.js');
const have = new Set(window.WORDPLAY_CONTENT.words.map(w => w.word));
const clips = new Set(fs.readdirSync(path.join(root, 'sounds')).map(f => f.replace(/\.mp3$/, '')));
const key = u => u.indexOf(':') < 0 ? u : u.slice(u.indexOf(':') + 1);
const lines = [], skipped = [];
for (const [, level, emoji, word, units, how] of P) {
  if (have.has(word) || how === 'part') continue;   // 'part' words are only used by the Word parts game
  if (how === 'sight') {
    if (!clips.has('word-' + word)) skipped.push(word + ' (waiting for word-' + word + ')');
    else lines.push(`    { word: '${word}', units: [${word.split('').map(c => "'" + c + "'").join(', ')}], emoji: null, sight: true, level: ${level} },`);
    continue;
  }
  const needs = ['word-' + word].concat(units.map(key).filter(k => k !== '_'));
  const miss = needs.filter(k => !clips.has(k));
  if (!emoji || miss.length) { skipped.push(word + (miss.length ? ' (waiting for ' + miss.join(', ') + ')' : ' (no picture: needs its own activity)')); continue; }
  lines.push(`    { word: '${word}', units: [${units.map(u => "'" + u + "'").join(', ')}], emoji: '${emoji}', sight: false, level: ${level}, anim: 'pop' },`);
}
console.log('adding ' + lines.length + ' words; skipping ' + skipped.length + (skipped.length ? ':\n  ' + skipped.join('\n  ') : ''));
if (lines.length && !process.argv.includes('--dry')) {
  const f = path.join(root, 'js/content.js'); let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
  const marker = '    // ---- sight words';
  if (!s.includes(marker)) throw new Error('marker not found in content.js');
  s = s.replace(marker, lines.join('\n') + '\n\n' + marker);
  fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
  console.log('written; now run node tools/make-precache.js and node tools/test.js');
}
