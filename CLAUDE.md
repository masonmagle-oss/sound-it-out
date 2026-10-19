# Sound it out ("Word play") — project rules for Claude Code

A vanilla HTML/CSS/JS phonics app (a few plain files, no build step) for a young child (the owner's son). Runs on iPhone Safari.
Live: https://masonmagle-oss.github.io/sound-it-out/  (GitHub Pages, branch `main`, folder `/`)
Repo: https://github.com/masonmagle-oss/sound-it-out

Read `docs/ROADMAP.md` for where we are going and `docs/WORKFLOWS.md` for how to do each kind of job.

## Hard rules (never break)
- No frameworks, no build step, no backend, no accounts, no analytics, no external scripts, fonts or images.
- Everything works offline once loaded. System fonts only.
- Praise is for effort only. No timers, no scores, no streaks, no fail states, no loss framing.
- Never fake phonics with text-to-speech. Sounds are the recorded files in `sounds/`.
- Touch targets 56px or bigger, high contrast, an always-visible Back button, aria labels,
  `prefers-reduced-motion` respected, localStorage optional and wrapped in try/catch, with a Reset.
- Data stays on the device. Speech recognition stays off by default and clearly labelled.
- Engagement design: predictable rewards, surprise in content not in rewards, a clear end to each session.
  No streak guilt, no random-reward loops, no endless autoplay.

## How the app is built
- `index.html` holds the markup only. `css/style.css` is the styling. Scripts load in this order (plain `<script src>`,
  no modules, so it still works from file://): `js/content.js` (the `CONTENT` data: words, sentences, letters, stories,
  praise, exposed as `window.WORDPLAY_CONTENT`), `js/app.js` (core helpers, router, Sound it out, Sight words, grown-ups
  page; defines `window.WordPlay`, alias `W`), `js/speech.js`, `js/read.js`, `js/audio.js` (sound clip lookup),
  `js/letters-rhyme.js` (Letters incl. mouth + ASL art, Rhyme time), `js/games.js` (Sound detective, Spell it, Silly words,
  Trace letters, Stories), `js/session.js` ("All done for today": counts praise lines, shows the ending card). Later files use `W`. Keep this order when adding a file.
- Word entries: `{word, units:['c','a','tch:ch'], emoji, sight, level, anim}`. A unit `text:key` shows `text`
  and plays `sounds/<key>.mp3`; key `_` is silent. `window.WordPlayUnit.key(u)` / `.text(u)` resolve them.
- Router: `TITLES`, `render`, `go`, `hooks.enter/leave`, delegated `[data-go]` clicks.
  Menu cards are `<button class="menu-card" data-go="X">`; screens are `<section id="screen-X" hidden>`.
- Helpers on `W`: `playKey`, `wordKeyOf`, `sentenceKeyOf`, `pick`, `shuffle`, `sleep`, `stageLimit`,
  `track(key, ok)`, `pickAdaptive(list, keysOf)`, `wordKeys`, `skillSummary`.
- Adaptive practice: skills live in memory per visit; saved only when the grown-up turns "Remember" on.
- Reusable CSS: `.dchoices .dchoice` (answer buttons), `.rtarget/.rtemo` (big emoji), `.praise`, `.hint`, `.btn`, `.row`, `.chip`.
- Clip names: `word-<w>.mp3`, `sentence-<dash-words>.mp3`, `letter-<x>.mp3`, `<key>.mp3`.
- Letters screen: `MOUTH` + `mouthSVG()` (drawn mouth shapes) and `ASL` (public-domain hand signs from wpclipart.com
  via Wikimedia Commons).

## Testing and shipping
- Test: `node tools/test.js` (Playwright, 390x844; also checks every word/unit clip exists). `TARGET=dist/sound-it-out-single-file.html node tools/test.js` tests the phone build. Navigate by clicking `[data-go="..."]`; hash routes do not load on file://.
- Audio fetches fail on file://; those console errors are expected. Use `npx http-server` for real audio.
- Before pushing: run the tests, open the changed screen at phone size, check there are no page errors.
- Commit to `main` and push; Pages updates in about a minute.
- Single-file copy for phones: `python3 tools/build-single-file.py` -> `dist/sound-it-out-single-file.html`
  (css, js and sounds inlined/base64-embedded). Rebuild it whenever sounds or code change; stale copies confuse testing.

## About the owner
Mason is a technical architect, not a front-end specialist. Explain choices briefly in plain language.
He cannot be asked to hear every clip; sounds are approved by his ears through audition pages (see WORKFLOWS).
Claude cannot hear audio; use waveform checks only as a sanity test, never as approval.
