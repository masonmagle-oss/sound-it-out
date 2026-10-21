// Generates candidate recordings with ElevenLabs (same voice and model as the rest), cleans them with ffmpeg,
// transcribes each take as a sanity check, and builds an audition page. It never touches sounds/.
//   node tools/generate-clips.js --dry                       what it would make and the credit cost (no key needed)
//   node tools/generate-clips.js --kind lines --takes 2      story lines (kinds: lines, questions, prompts, words, all)
// The key is in .env.local (git-ignored, made by `npx @elevenlabs/cli onboard init`); run with: node --env-file=.env.local tools/generate-clips.js ...
// Credits are about 1 per character per take. --max N stops a run that would cost more (default 12000).
// Then open _new-clips/audition.html, pick the best takes, and run: node tools/install-clips.js results.json
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true); };
const kind = arg('kind', 'all'), takes = Number(arg('takes', 2)), max = Number(arg('max', 12000)), dry = !!arg('dry', false), limit = Number(arg('limit', 9999));
const VOICE = 'oClOrzqamOXmtcB8iqTj', MODEL = 'eleven_v4';
global.window = {}; require('../js/content.js'); require('../js/stories-more.js'); require('../js/parts-data.js');
const C = window.WORDPLAY_CONTENT;
const have = new Set(fs.readdirSync(path.join(root, 'sounds')).map(f => f.replace(/\.mp3$/, '')));
const dash = t => t.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/ +/g, '-');
const jobs = [];
const add = (k, key, text) => { if (!have.has(key) && !jobs.some(j => j.key === key) && (kind === 'all' || kind === k)) jobs.push({ kind: k, key, text }); };
C.stories.forEach(s => s.lines.forEach(l => add('lines', 'sentence-' + dash(l), l)));
C.stories.forEach(s => (s.q || []).forEach(x => add('questions', 'question-' + dash(x.ask), x.ask)));
[['animal', 'Which one is an animal?'], ['food', 'Which one is food?'], ['clothes', 'Which one do we wear?'], ['vehicle', 'Which one takes us places?'], ['body', 'Which one is part of the body?'], ['home', 'Which one is in a home?'], ['nature', 'Which one is outside in nature?'], ['opposite', 'What is the opposite?']].forEach(([k, t]) => add('prompts', 'vocab-' + k, t));
// Word parts game: the whole words, their base words, the contractions, and the four ending sounds
const PD = window.WORDPLAY_PARTS;
PD.endings.forEach(e => { add('parts', 'word-' + e.word, e.word + '.'); add('parts', 'word-' + e.base, e.base + '.'); });
PD.contractions.forEach(c => add('parts', 'word-' + c.c.toLowerCase().replace(/[^a-z]/g, ''), c.c + '.'));
Object.entries({ ful: '/fəl/', less: '/ləs/', ly: 'lee', ness: '/nəs/' }).forEach(([k, ipa]) => add('parts', k, ipa + '. ' + ipa + '.'));
// isolated sounds: IPA between slashes, said twice (the second one is the clean one, as in WORKFLOWS); ful less ly ness are held until an endings activity exists
Object.entries({ dle: '/dəl/', tle: '/təl/', le: '/əl/' }).forEach(([k, ipa]) => add('sounds', k, ipa + '. ' + ipa + '.'));
require('./new-words-data.js').forEach(([, , emoji, word]) => { if (emoji && /^[a-z]+$/.test(word)) add('words', 'word-' + word, word + '.'); });   // endings and contractions need their own treatment
// --redo "key=text,key2=text2": make new takes for clips that already exist (a word said wrong); the audition page shows them
const redo = String(arg('redo', '')).split(',').filter(Boolean).map(x => { const i = x.indexOf('='); return { kind: 'redo', key: x.slice(0, i), text: x.slice(i + 1) }; });
if (redo.length) jobs.length = 0, jobs.push(...redo);
const todo = jobs.slice(0, limit);
const chars = todo.reduce((a, j) => a + j.text.length, 0), cost = chars * takes;
console.log(`${todo.length} clips (${kind}), ${takes} take(s) each, about ${cost} credits`);
if (dry) { todo.forEach(j => console.log(' ', j.key, '|', j.text)); process.exit(0); }
if (cost > max) { console.error(`Stopping: ${cost} credits is over --max ${max}. Raise --max or use --limit.`); process.exit(1); }
if (!process.env.ELEVENLABS_API_KEY) { console.error('No key loaded. Run: node --env-file=.env.local tools/generate-clips.js ...'); process.exit(1); }
const out = path.join(root, '_new-clips'), raw = path.join(out, 'raw');
fs.mkdirSync(raw, { recursive: true });
const norm = t => t.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/ +/g, ' ').trim();
const manifestFile = path.join(out, 'manifest.json');
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};
let client;
async function tts(text) {
  const stream = await client.textToSpeech.convert(VOICE, { text, modelId: MODEL, outputFormat: 'mp3_44100_128' });
  const chunks = []; for await (const c of stream) chunks.push(c);   // convert() returns a web ReadableStream
  return Buffer.concat(chunks);
}
async function stt(file) {
  try { return (await client.speechToText.convert({ file: fs.createReadStream(file), modelId: 'scribe_v2' })).text || ''; } catch (e) { return null; }
}
const clean = (src, dst) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,adelay=40|40,apad=pad_dur=0.1,loudnorm=I=-18:TP=-1.5:LRA=11', '-ac', '1', '-ar', '44100', '-b:a', '128k', dst]);
const seconds = f => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());
(async () => {
  const { ElevenLabsClient } = await import('@elevenlabs/elevenlabs-js');
  client = new ElevenLabsClient();
  for (const j of todo) {
    const m = manifest[j.key] = manifest[j.key] || { text: j.text, kind: j.kind, takes: [] };
    for (let n = m.takes.length + 1; n <= takes; n++) {
      const rawf = path.join(raw, `${j.key}-${n}.mp3`), cleanf = path.join(out, `${j.key}-${n}.mp3`);
      fs.writeFileSync(rawf, await tts(j.text)); clean(rawf, cleanf);
      const heard = await stt(cleanf), want = norm(j.text);
      m.takes.push({ file: path.basename(cleanf), secs: Math.round(seconds(cleanf) * 100) / 100, heard, match: heard !== null && norm(heard) === want });
      fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
      console.log(j.key, n, m.takes[m.takes.length - 1].match ? 'ok' : 'CHECK: heard "' + heard + '"');
    }
  }
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = Object.entries(manifest).filter(([k]) => !have.has(k) || redo.some(r => r.key === k)).map(([k, m]) => {
    const good = m.takes.filter(t => t.match), shown = good.length ? good : m.takes;
    return `<section><h3>${esc(m.text)} <small>${esc(k)}${good.length ? '' : ' &mdash; no take passed the transcript check'}</small></h3>` +
      shown.map(t => `<label><audio controls preload="none" src="${t.file}"></audio> <input type="radio" name="${k}" value="${t.file}"> Best <small>${t.secs}s, heard: ${esc(t.heard)}</small></label>`).join('<br>') +
      `<label><input type="radio" name="${k}" value="" checked> None / skip</label></section>`;
  }).join('\n');
  fs.writeFileSync(path.join(out, 'audition.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Audition new clips</title>
<style>body{font:16px system-ui;max-width:42rem;margin:1rem auto;padding:0 1rem}section{border:1px solid #ccd;border-radius:10px;padding:.6rem 1rem;margin:.8rem 0}h3{margin:.2rem 0}label{display:block;margin:.3rem 0}pre{background:#eef;padding:1rem;white-space:pre-wrap}</style>
<h1>Audition new clips</h1><p>Listen to each take and choose the best, or "None". Then tap Show my results and save the text as results.json in the project folder.</p>
${rows}
<button onclick="const r={};document.querySelectorAll('input[type=radio]:checked').forEach(i=>{if(i.value)r[i.name]=i.value});document.getElementById('o').textContent=JSON.stringify(r,null,1)">Show my results</button><pre id="o"></pre>`);
  console.log('Done. Open _new-clips/audition.html');
})().catch(e => { console.error(e.message); process.exit(1); });
