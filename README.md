# Sound it out

A tiny offline phonics app for one child. Open `index.html` (use a local server for audio) or visit
https://masonmagle-oss.github.io/sound-it-out/ .

Tests: `npm install`, then `node tools/test.js`. Before committing app, sound or icon changes run `node tools/make-precache.js` and commit `precache.json` (the offline file list).
Test-only switches in the code: `window.__AUTO_KID` skips the "Who's playing?" picker, `window.__PACE_STUCK_MS` shortens the 15 s stuck wait.

For anyone (or any Claude) continuing the work, start with `CLAUDE.md`, then `docs/ROADMAP.md` and `docs/WORKFLOWS.md`.
Sound clips are made with ElevenLabs; hand signs are public domain (wpclipart.com via Wikimedia Commons).
