# Workflows

## Add or change an activity
1. Add a menu card in the home screen (`<button class="menu-card" data-go="NAME">`), a `TITLES` entry,
   a `<section id="screen-NAME" hidden>`, CSS, and a script block with `hooks.enter.NAME` / `hooks.leave.NAME`.
2. Reuse existing classes and helpers (see CLAUDE.md). Use `W.track(key, ok)` for first-try results and
   `W.pickAdaptive` to choose what to show.
3. Use only words that have a `sounds/word-<w>.mp3` and an emoji; check with a quick script.
4. Run `node tools/test.js`, screenshot at 390x844, commit, push.

## Add words or stories
Add to `CONTENT` in `index.html`. For every new word make `sounds/word-<w>.mp3`; for every new sentence/story line
make `sounds/sentence-<dash-words>.mp3`. Unit keys must already exist in `sounds/` or be recorded too.

## Make or fix sounds (ElevenLabs)
Voice: "Emma - Bright Kids Educator", id `oClOrzqamOXmtcB8iqTj`, model `eleven_v4`.
1. Generate with the ElevenLabs speech tool (never repeat a call that already succeeded; it costs credits).
   Doubled prompts ("X. X.") work best for isolated sounds so the second one is clean.
2. The cloud cannot download the signed result URLs. Download them on the owner's computer (PowerShell
   `Invoke-WebRequest`), zip, and bring the zip back.
3. Cut the take at gaps: 10 ms RMS windows, a gap of 70 ms or more splits, 60 ms fade, `adelay=40`, `apad`,
   `loudnorm I=-18`, 44.1 kHz mono 128 kbps mp3.
4. Never approve by waveform alone. Build an audition page (copy `audition-10.html`) with each candidate, a
   "Best" button per sound and a "Show my results" button; the owner listens and reports picks.
5. Keep the previous file in `old-sounds/` before replacing. Trim with:
   `ffmpeg -i old-sounds/X-before-trim.mp3 -t D -af afade=t=out:st=D-0.08:d=0.08 -ac 1 -ar 44100 -b:a 128k sounds/X.mp3`

## Single-file phone build
`python3 tools/build-single-file.py` (needs ffmpeg). Output `dist/sound-it-out-single-file.html` (about 9 MB).
Send it to the owner to test on a phone; the live site is the source of truth.

## Deploy
Push to `main`. GitHub Pages serves `/` in about a minute.
