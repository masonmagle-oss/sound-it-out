// Checks every story: each word must be in the word list at or below the story's level, and each question's
// picture words must have a word clip. Lists the clips (lines, questions) that still need recording.
// Usage: node tools/check-stories.js [--list]    (exit 1 on any problem)
const fs = require('fs'), path = require('path');
global.window = {};
require('../js/content.js'); require('../js/stories-more.js');
const C = window.WORDPLAY_CONTENT;
const sounds = new Set(fs.readdirSync(path.join(__dirname, '..', 'sounds')).map(f => f.replace(/\.mp3$/, '')));
const lvl = {};
C.words.forEach(w => { const k = w.word.toLowerCase(); lvl[k] = Math.min(lvl[k] || 99, w.level || 1); });
const toks = t => t.toLowerCase().replace(/[^a-z' ]/g, '').split(/\s+/).filter(Boolean);
const sentKey = t => 'sentence-' + t.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/ +/g, '-');
const bad = [], missing = [];
const rows = C.stories.map(s => {
  const need = Math.max(...s.lines.flatMap(toks).map(w => (w in lvl ? lvl[w] : 99)));
  const level = s.level || need;
  s.lines.flatMap(toks).forEach(w => { if (!(w in lvl)) bad.push(`${s.title}: "${w}" is not in the word list`); else if (lvl[w] > level) bad.push(`${s.title}: "${w}" is level ${lvl[w]}, story is level ${level}`); });
  if (!s.q || !s.q.length) bad.push(`${s.title}: no comprehension question`);
  (s.q || []).forEach(x => {
    if (x.pics.length < 2 || !x.pics[x.ok]) bad.push(`${s.title}: question needs 2+ pictures and a valid answer`);
    x.pics.forEach(([, w]) => { if (!sounds.has('word-' + w)) bad.push(`${s.title}: picture word "${w}" has no clip`); });
    const k = sentKey(x.ask).replace('sentence-', 'question-'); if (!sounds.has(k)) missing.push(k);
  });
  s.lines.forEach(l => { if (!sounds.has(sentKey(l))) missing.push(sentKey(l)); });
  return [level, s.title];
});
if (process.argv.includes('--list')) { rows.sort((a, b) => a[0] - b[0]).forEach(r => console.log('L' + r[0], r[1])); console.log('\nclips to record (' + missing.length + '):\n' + missing.join('\n')); }
else console.log(C.stories.length + ' stories, ' + missing.length + ' clips still to record (run with --list)');
if (bad.length) { console.error('PROBLEMS:\n' + bad.join('\n')); process.exit(1); }
