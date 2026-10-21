// Applies picture choices from tools/picture-review.js to js/content.js. Usage: node tools/apply-pictures.js pictures.json
// { "chip": "🍪", "gum": "none", ... }  "none" removes the picture (the word is left out of the picture games).
// A word's picture is changed on every entry of that word; sight words are never touched.
const fs = require('fs'), path = require('path');
const picks = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const f = path.join(__dirname, '..', 'js', 'content.js');
let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
let n = 0;
for (const [word, pic] of Object.entries(picks)) {
  const re = new RegExp("(\\{ word: '" + word + "',[^\\n]*?emoji: )(?:'[^']*'|null)([^\\n]*?sight: false)", 'g');
  s = s.replace(re, (m, a, b) => { n++; return a + (pic === 'none' ? 'null' : "'" + pic + "'") + b; });
}
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('changed ' + n + ' entries');
