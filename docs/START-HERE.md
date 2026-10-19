# Start here (moving this project into Claude Code)

## 1. Open the project
Option A, on your computer: install Claude Code, unzip this folder, open a terminal in it, run `claude`.
Option B, from GitHub: open the repo https://github.com/masonmagle-oss/sound-it-out in Claude Code (web or desktop).
Claude Code reads `CLAUDE.md` automatically; that file holds the rules, structure and how to test and ship.

## 2. First message to paste into Claude Code
> Read CLAUDE.md, docs/ROADMAP.md and docs/WORKFLOWS.md. Run `node tools/test.js` (install playwright first if
> needed) and tell me the state of the project in five lines. Then start Phase 1 of the roadmap: split index.html
> into a few files without breaking offline use or `tools/build-single-file.py`, keep all tests passing, and show
> me what changed before pushing.

## 3. What you need to have ready
- Git push access to the repo (sign in to GitHub in Claude Code, or push from your own machine).
- Node.js (for the tests) and ffmpeg + Python 3 (for the single-file build).
- For new or fixed sounds: the ElevenLabs connection. If Claude Code does not have it, generate the clips in a
  chat that does, and drop the finished mp3 files into `sounds/` (names must match; see CLAUDE.md).
- Your ears: Claude cannot hear. Sound changes always go through an audition page for you to approve.

## 4. Keep chat for
Choosing sounds by ear, planning, and thinking through what your son actually does and enjoys.

## 5. Known loose ends
- Trimmed clips (m, e, n, aw, e_long, word-a, gem, caps on 39 clips) have not been checked by ear.
- The two newest games (Spell it, Silly words) have not been tried with your son.
- Old working files on your Downloads folder (`raw*/`, `g*.zip`, `*.ps1`) can be moved to a `_to_delete` folder.
- ASL fingerspelling is in the Letters page; consider showing it in word games later.
