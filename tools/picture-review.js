// Builds _new-clips/pictures.html: every weak picture next to better options (and "no picture"), for you to vote on.
// Save "Show my results" as pictures.json, then run: node tools/apply-pictures.js pictures.json
const fs = require('fs'), path = require('path');
global.window = {}; require('../js/content.js');
const alt = require('./picture-alternatives.js');
const cur = {};
window.WORDPLAY_CONTENT.words.forEach(w => { if (!w.sight && !(w.word in cur)) cur[w.word] = w.emoji || ''; });
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const rows = Object.entries(alt).filter(([w]) => w in cur).map(([w, [why, opts]]) => {
  const all = [cur[w], ...opts.filter(o => o !== cur[w])].filter((o, i, a) => o !== undefined && a.indexOf(o) === i);
  const radio = (v, label, checked) => `<label class="o"><input type="radio" name="${w}" value="${esc(v)}"${checked ? ' checked' : ''}><span class="e">${v || '—'}</span><small>${label}</small></label>`;
  return `<section><h3>${esc(w)} <small>${esc(why)}</small></h3>` +
    (cur[w] ? radio(cur[w], 'keep', true) : '') + all.filter(o => o && o !== cur[w]).map(o => radio(o, 'use this', false)).join('') +
    radio('none', 'no picture', !cur[w]) + '</section>';
}).join('\n');
fs.mkdirSync(path.join(__dirname, '..', '_new-clips'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', '_new-clips', 'pictures.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Picture review</title>
<style>body{font:16px system-ui;max-width:44rem;margin:1rem auto;padding:0 1rem}section{border:1px solid #ccd;border-radius:10px;padding:.5rem 1rem;margin:.7rem 0}h3{margin:.2rem 0}h3 small{font-weight:400;color:#556}.o{display:inline-block;text-align:center;margin:.2rem .6rem .2rem 0;cursor:pointer}.e{display:block;font-size:2.6rem;line-height:1.2}pre{background:#eef;padding:1rem;white-space:pre-wrap}</style>
<h1>Picture review</h1><p>For each word, tap the picture you would want your child to see. "Keep" is the picture it has now. "No picture" leaves the word out of the picture games (text only). Then press Show my results and paste it to Claude.</p>
${rows}
<button onclick="const r={};document.querySelectorAll('input[type=radio]:checked').forEach(i=>{r[i.name]=i.value});document.getElementById('o').textContent=JSON.stringify(r,null,1)">Show my results</button><pre id="o"></pre>`);
console.log(Object.keys(alt).filter(w => w in cur).length + ' words on the page: _new-clips/pictures.html');
