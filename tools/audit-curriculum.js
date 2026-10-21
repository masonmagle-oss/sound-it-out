// Curriculum audit: measures CONTENT against a Pre-K..grade 3 reference (heuristic, spelling-based). Usage: node tools/audit-curriculum.js
global.window = {}; require('../js/content.js');
const C = window.WORDPLAY_CONTENT;
const dec = C.words.filter(w => !w.sight).map(w => w.word.toLowerCase());
const sight = new Set(C.words.filter(w => w.sight).map(w => w.word.toLowerCase()));
const known = new Set(dec.concat([...sight]));
// [band, label, regex on spelling]. Count = decodable words matching; examples shown. 0-2 words = not really taught.
const R = [
 ['K','floss rule ff/ss/zz (+ll)',/(ff|ss|zz|ll)$/],['K','final -nk',/nk$/],['K','final blends nd nt mp st sk lt lk ft lp',/(nd|nt|mp|st|sk|lt|lk|ft|lp)$/],
 ['K','initial 2-letter blends',/^(bl|cl|fl|gl|pl|sl|br|cr|dr|fr|gr|pr|tr|sc|sk|sm|sn|sp|st|sw)/],['K','initial 3-letter blends str spr spl scr thr shr',/^(str|spr|spl|scr|thr|shr)/],
 ['K','silent-e a_e i_e o_e u_e',/^[^aeiou]*[aeiou][^aeiou]e$/],['K','plural -s',/[^s]s$/],
 ['G1','ai/ay',/(ai|ay)/],['G1','ee/ea',/(ee|ea)/],['G1','oa / ow(long)',/(oa|ow)/],['G1','oo',/oo/],['G1','igh',/igh/],['G1','ie (pie, field)',/ie/],['G1','y as long i/e (fly, happy)',/[^aeiou]y$/],
 ['G1','ar',/ar/],['G1','or',/or/],['G1','er/ir/ur',/(er|ir|ur)/],['G1','ou/ow (out, cow)',/(ou|ow)/],['G1','oi/oy',/(oi|oy)/],['G1','aw / au',/(aw|au)/],
 ['G1','soft c / soft g (city, gem)',/(c[eiy]|g[eiy])/],['G1','tch / dge',/(tch|dge)/],['G1','kn wr gn mb silent letters',/(^kn|^wr|^gn|mb$)/],['G1','ph',/ph/],['G1','-ed endings',/ed$/],['G1','-ing',/ing$/],['G1','compound words',null],
 ['G2','ew/ue/ui',/(ew|ue|ui)/],['G2','ey (key, monkey)',/ey$/],['G2','oe / toe',/oe/],['G2','ough/augh',/(ough|augh)/],['G2','ore/are/ear/eer/ure r-extended',/(ore|are|ear|eer|ure)/],
 ['G2','-le syllable (table, little)',/[^aeiou]le$/],['G2','-er/-est',/(er|est)$/],['G2','-ly',/ly$/],['G2','-ful / -less',/(ful|less)$/],['G2','-ness / -ment',/(ness|ment)$/],
 ['G2','un- / re- / pre-',/^(un|re|pre)/],['G2','doubling (running, hopped)',/([^aeiou])\1(ed|ing|er)$/],['G2','-es / -ies plurals',/(es|ies)$/],['G2','-y suffix (sunny, rainy)',/[^aeiou]y$/],
 ['G3','dis- mis- non- over- sub-',/^(dis|mis|non|over|sub)/],['G3','-tion / -sion / -ture / -cian',/(tion|sion|ture|cian)$/],['G3','-able / -ible',/(able|ible)$/],['G3','-ous / -al / -ive',/(ous|al|ive)$/],
];
const syl = w => (w.replace(/e$/, '').match(/[aeiouy]+/g) || []).length;
const by = {};
for (const [b, label, re] of R) {
  const m = re ? dec.filter(w => re.test(w)) : dec.filter(w => syl(w) >= 2 && C.words.find(x => x.word.toLowerCase() === w && x.level === 6));
  (by[b] = by[b] || []).push(`${m.length < 3 ? 'GAP ' : m.length < 8 ? 'thin' : 'ok  '} ${String(m.length).padStart(3)}  ${label}  e.g. ${m.slice(0, 5).join(' ')}`);
}
for (const b of Object.keys(by)) { console.log('\n== ' + b); by[b].forEach(l => console.log(l)); }
console.log('\n== word-length / syllables (decodable words)');
const sc = {}; dec.forEach(w => { const n = Math.min(syl(w), 4); sc[n] = (sc[n] || 0) + 1; }); console.log(sc);
require('../js/parts-data.js'); const PD = window.WORDPLAY_PARTS;
console.log('Word parts game: ' + PD.endings.length + ' ending words (' + PD.ends.map(e => e + ' ' + PD.endings.filter(x => x.end === e).length).join(', ') + '), ' + PD.prefixed.length + ' prefix words (' + PD.prefixes.map(e => e + ' ' + PD.prefixed.filter(x => x.pre === e).length).join(', ') + '), ' + PD.contractions.length + ' contractions');
console.log('contractions in words/sentences:', C.words.filter(w => /'/.test(w.word)).length, '/', C.sentences.filter(s => /'/.test(s.text)).length);
console.log('\n== reading material decodability (words not in the word list)');
const uns = {};
const texts = C.stories.map(s => [s.title, s.lines.join(' ')]).concat([['sentences', C.sentences.map(s => s.text).join(' ')]]);
for (const [t, x] of texts) { const w = x.toLowerCase().replace(/[^a-z' ]/g, '').split(/\s+/).filter(Boolean); const u = [...new Set(w.filter(v => !known.has(v)))]; console.log(t.padEnd(16), w.length, 'words,', u.length, 'unlisted:', u.join(' ')); }
console.log('\nsentence lengths:', [...new Set(C.sentences.map(s => s.text.split(' ').length))].sort((a,b)=>a-b).join(','), '| story line length avg', Math.round(C.stories.flatMap(s=>s.lines).join(' ').split(' ').length / C.stories.flatMap(s=>s.lines).length * 10) / 10);
