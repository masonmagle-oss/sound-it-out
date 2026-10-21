// Builds _new-clips/verify.html: the clips nobody has listened to, each with its current take, any other takes, and "Say it again" for a redo.
// Save "Show my results" as results.json (picks are take files, "keep" or "redo"), then: node tools/install-clips.js results.json
// (install-clips ignores "keep" and "redo"; Claude regenerates the "redo" ones)
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), nc = path.join(root, '_new-clips');
const manifest = JSON.parse(fs.readFileSync(path.join(nc, 'manifest.json'), 'utf8'));
// --redo "ful=ful+ful-b,less=less+less-b": a page where each sound has takes from several prompts (the prompt is shown), for sounds that were rejected
const ri = process.argv.indexOf('--redo');
if (ri > 0) {
  const e2 = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const take = (k, g, t) => '<label><audio controls preload="none" src="' + t.file + '"></audio> <input type="radio" name="' + k + '" value="' + t.file + '"> said as: ' + e2(manifest[g].text) + '</label>';
  const sec = x => { const [k, v] = x.split('='); return '<section><h3>' + e2(k) + '</h3>' + v.split('+').map(g => manifest[g].takes.map(t => take(k, g, t)).join('')).join('') + '</section>'; };
  const head = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pick the new sounds</title><style>body{font:16px system-ui;max-width:42rem;margin:1rem auto;padding:0 1rem}section{border:1px solid #ccd;border-radius:10px;padding:.5rem 1rem;margin:.7rem 0}label{display:block;margin:.3rem 0}pre{background:#eef;padding:1rem;white-space:pre-wrap}</style><h1>Pick the new sounds</h1><p>Each sound was tried several ways. Pick the take that says the sound as it is at the end of the word (leave blank if none is right).</p>';
  const foot = `<button onclick="show()">Show my results</button><pre id="o"></pre><script>function show(){const r={};document.querySelectorAll('input[type=radio]:checked').forEach(i=>{r[i.name]=i.value});document.getElementById('o').textContent=JSON.stringify(r,null,1)}</script>`;
  fs.writeFileSync(path.join(nc, 'verify-redo.html'), head + process.argv[ri + 1].split(',').map(sec).join('\n') + foot);
  console.log('wrote _new-clips/verify-redo.html'); process.exit(0);
}
const sounds = 'ful less ly ness dle tle le est dis mis cher zhun'.split(' ');
const words = 'theyre gnat deer daughter big fin mat pen pin pitch drew flew chew took hill stew knee chick'.split(' ').map(w => 'word-' + w);
const args = process.argv.slice(2).filter(x => !x.startsWith('--'));
const keys = args.length ? args : sounds.concat(words, ['sentence-the-cats-sat-on-the-chair']);   // node tools/make-verify.js ment able  = just those clips
const say = { ful: '"-ful" as in helpful', less: '"-less" as in hopeless', ly: '"-ly" as in sadly', ness: '"-ness" as in kindness', dle: '"-dle" as in candle', tle: '"-tle" as in turtle', le: '"-le" as in puzzle', est: '"-est" as in tallest', dis: '"dis-" as in dislike', mis: '"mis-" as in misspell', ment: '"-ment" as in payment', able: '"-able" as in washable', cher: '"-ture" as in picture', zhun: '"-sion" as in television' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const same = (a, b) => fs.existsSync(a) && fs.existsSync(b) && Buffer.compare(fs.readFileSync(a), fs.readFileSync(b)) === 0;
const rows = keys.map(k => {
  const cur = path.join(root, 'sounds', k + '.mp3'), m = manifest[k];
  const alts = (m ? m.takes : []).filter(t => fs.existsSync(path.join(nc, t.file)) && !same(cur, path.join(nc, t.file)));
  // the seven early sounds only have uncut doubled takes (about 2 s): never offer those as alternatives
  const ok = alts.filter(t => t.secs < 1.6 || !/^(ful|less|ly|ness|dle|tle|le)$/.test(k));
  const label = say[k] ? say[k] : (m ? m.text : k.replace(/^(word|sentence)-/, '').replace(/-/g, ' '));
  const radio = (v, text, checked) => `<label><input type="radio" name="${k}" value="${v}"${checked ? ' checked' : ''}> ${text}</label>`;
  return `<section><h3>${esc(label)} <small>${esc(k)}</small></h3>` +
    `<label><audio controls preload="none" src="../sounds/${k}.mp3"></audio> ${radio('keep', 'Sounds right (keep)', true)}</label>` +
    ok.map((t, i) => `<label><audio controls preload="none" src="${t.file}"></audio> ${radio(t.file, 'Use this one instead', false)}</label>`).join('') +
    radio('redo', 'Not right: say it again', false) + '</section>';
}).join('\n');
fs.writeFileSync(path.join(nc, 'verify.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify sounds</title>
<style>body{font:16px system-ui;max-width:42rem;margin:1rem auto;padding:0 1rem}section{border:1px solid #ccd;border-radius:10px;padding:.5rem 1rem;margin:.7rem 0}h3{margin:.2rem 0}h3 small{font-weight:400;color:#889}label{display:block;margin:.3rem 0}pre{background:#eef;padding:1rem;white-space:pre-wrap}</style>
<h1>Verify sounds</h1><p>Nobody has listened to these yet. Play the current one: if it is right, leave it. If another take is better, pick it. If none is right, pick "say it again" and Claude will make new ones. For single sounds, listen for the sound the letters make in that word, not the letter name.</p>
${rows}
<button onclick="const r={};document.querySelectorAll('input[type=radio]:checked').forEach(i=>{if(i.value!=='keep')r[i.name]=i.value});document.getElementById('o').textContent=JSON.stringify(r,null,1)">Show my results</button><pre id="o"></pre>`);
console.log(keys.length + ' clips on _new-clips/verify.html');
