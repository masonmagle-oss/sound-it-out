// Replace each quoted emoji picture in the content files with its drawn picture (svg:art-NAME).
// Usage: node tools/art/build.js && node tools/apply-art.js
const fs = require('fs');
const names = require('./art/names.out.json');
const files = ['js/content.js', 'js/stories-more.js'];
let total = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  for (const [emoji, name] of Object.entries(names).sort((a, b) => b[0].length - a[0].length)) {
    for (const q of ["'", '"']) {
      const from = q + emoji + q, to = q + 'svg:art-' + name + q;
      const n = s.split(from).length - 1;
      if (n) { s = s.split(from).join(to); total += n; }
    }
  }
  fs.writeFileSync(f, s);
}
console.log('replaced', total);
