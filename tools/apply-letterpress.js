// One-time retheme of css/style.css to the "letterpress" look (wooden type blocks, paper, ink, a solid ledge under every button).
// Idempotent: it refuses to run twice. After running: node tools/make-precache.js && node tools/test.js
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '..', 'css', 'style.css');
let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
if (s.includes('Letterpress theme')) { console.log('already applied'); process.exit(0); }
const rep = (a, b) => { if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 60)); s = s.split(a).join(b); };

// 1. shared colours: paper, ink, a cobalt accent, wood for type blocks
rep('--bg:#f3f7fb; --ink:#1d2b46; --ink-soft:#44546f; --card:#ffffff;\n    --accent:#2a62c0; --lit:#ffd447; --lit-edge:#7a5a00; --good:#2e7d4f;',
    '--bg:#f3eee2; --ink:#1d2433; --ink-soft:#4a5160; --card:#fffdf7; --line:#d8cfba;\n    --accent:#2457d6; --lit:#ffd23f; --lit-edge:#1d2433; --good:#1f7a4d;\n    --wood:#d9b07a; --wood-lit:#e8c796; --wood-edge:#8a6a3c; --stamp:#e63b2e;\n    --letters:"Andika","Chalkboard SE","Comic Sans MS",ui-rounded,system-ui,sans-serif;');
rep('background:#fff', 'background:var(--card)');
rep('#cfe0f3', 'var(--line)');
rep('#9db4d3', 'var(--line)');

// 2. the letter font (one small bundled file per weight; falls back to a school-style system font)
s = "@font-face{font-family:'Andika'; src:url(../fonts/andika-400.woff2) format('woff2'); font-weight:400; font-style:normal; font-display:swap}\n@font-face{font-family:'Andika'; src:url(../fonts/andika-700.woff2) format('woff2'); font-weight:700; font-style:normal; font-display:swap}\n" + s;

// 3. the letterpress layer (later rules win; size and spacing rules above are left alone)
s += `
  /* ---------- Letterpress theme ---------- */
  body{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .05 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>")}
  .tile,.sightword,.chip,.sword,.wslot,.bigword,.dchoice,.spslot,.lbig,.lword,.rtword,#mWordText,.rcw,.tl,.snum{font-family:var(--letters)}
  .tile,.sightword,.chip,.sword,.dchoice,.spslot,.lbig,.lword,.rtword,.wslot{font-weight:700}
  /* a solid ledge under everything you can press; pressing drops it */
  .btn{border-color:var(--ink); box-shadow:0 5px 0 var(--ink)}
  .btn:active{transform:translateY(4px); box-shadow:0 1px 0 var(--ink)}
  .btn.on{border-color:var(--ink)}
  .menu-card{border-width:3px; border-radius:1.1rem; box-shadow:0 5px 0 var(--ink)}
  .menu-card:active{transform:translateY(4px); box-shadow:0 1px 0 var(--ink)}
  .play-btn,.who-btn{border-radius:1.2rem; box-shadow:0 7px 0 var(--ink)}
  .play-btn:active,.who-btn:active{transform:translateY(5px); box-shadow:0 2px 0 var(--ink)}
  .dchoice,.rchoice,.rtarget,.chip,.spslot,.flash,.lcard,.twrap{border-width:3px; border-radius:.9rem}
  .dchoice,.rchoice,.rtarget,.chip{box-shadow:0 4px 0 var(--ink)}
  .dchoice:active,.rchoice:active{transform:translateY(3px); box-shadow:0 1px 0 var(--ink)}
  .flash,.lcard{box-shadow:0 5px 0 var(--ink)}
  /* Sound it out: wooden type blocks that lift when they speak */
  .tile{border:3px solid var(--ink); border-radius:.6rem; background:var(--wood); color:var(--ink);
        box-shadow:5px 7px 0 var(--wood-edge); text-shadow:-1px -1px 0 rgba(255,255,255,.4), 1px 1px 0 rgba(0,0,0,.18)}
  .tile.lit{background:var(--wood-lit); border-color:var(--ink); transform:translateY(-8px);
            box-shadow:5px 15px 0 var(--wood-edge), 0 0 0 5px var(--lit)}
  .tile.wiggle{animation:none}
  .tiles.blend .tile{border-radius:0; box-shadow:0 7px 0 var(--wood-edge)}
  .tiles.blend .tile + .tile{margin-left:-3px}
  .tiles.blend .tile:first-child{border-top-left-radius:.6rem; border-bottom-left-radius:.6rem}
  .tiles.blend .tile:last-child{border-top-right-radius:.6rem; border-bottom-right-radius:.6rem}
  .tiles.blend .tile:only-child{border-radius:.6rem}
  .chip.lit,.rchoice.right{background:var(--wood-lit); border-color:var(--ink); box-shadow:0 4px 0 var(--ink), 0 0 0 5px var(--lit)}
  .sline.lit{background:var(--wood-lit); border-color:var(--ink)}
  /* the picture stage is a printed page: the word is pressed onto it in two inks, with a stamp */
  .stage{border:3px solid var(--ink); border-radius:.6rem; background:var(--card); box-shadow:0 5px 0 var(--ink)}
  .ground{background:#e6dcc4; border-top:3px solid var(--ink)}
  .stage[data-ground="water"] .ground{background:#9ec9e6}
  .stage.show::after{content:attr(data-word); position:absolute; left:0; right:0; bottom:.25rem; z-index:3; text-align:center;
        font:700 1.6rem var(--letters); letter-spacing:.08em; color:var(--accent); text-shadow:2px 1px 0 rgba(230,59,46,.7);
        animation:pressIn .5s ease both}
  .stage.show::before{content:"\\2713"; position:absolute; top:.5rem; right:.6rem; z-index:3; width:2.2rem; height:2.2rem;
        border:3px solid var(--stamp); border-radius:50%; color:var(--stamp); font:700 1.3rem/1.85rem var(--letters); text-align:center; transform:rotate(-12deg)}
  @keyframes pressIn{from{opacity:0; transform:scale(1.18); letter-spacing:.22em}to{opacity:1; transform:none; letter-spacing:.08em}}
  .done-card{border-color:var(--ink); box-shadow:0 7px 0 var(--ink)}
  .pace-msg{background:var(--ink)}
`;
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
console.log('letterpress theme applied');
