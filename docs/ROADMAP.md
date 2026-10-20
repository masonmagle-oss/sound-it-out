# Roadmap

Principle: borrow what builds real motivation (adaptive difficulty, visible progress, a character, creating,
doing it together); avoid what manufactures compulsion (streaks, random rewards, endless loops).
Each phase ends with a gate: watch the child use it for ten minutes and note where he stalls or quits.

## Where we are
Working: Sound it out, Sight words, Read a sentence, Say the word, Letters (picture + mouth + ASL hand),
Rhyme time, Sound detective, Spell it, Silly words, Trace letters, Little stories, grown-ups page.
Adaptive practice is in (tracks first-try results per sound, shows wobbly/secure sounds to grown-ups).
Unverified: trimmed clips (never heard by Claude), newest two games with the actual child.

## Phase 1 — Set up   (gate: sounds unchanged, tests pass)
- Keep this CLAUDE.md current.
- DONE: split `index.html` into `css/style.css` and `js/*.js` (content, app, speech, read, audio, letters-rhyme, games);
  single-file build inlines them; behaviour unchanged.
- Smoke test now opens every visible screen and checks clips exist. Backup save/load is tested. Still to do: reach the hidden Say screen.
- DONE: progress backup (Save backup / Load backup on the grown-ups page; a JSON file, merged on load, nothing uploaded).
  DONE: Add to Home Screen note on the grown-ups page.

## Phase 2 — Motivation   (gate: he asks to play and stops happily)
- DONE: Next buttons are paced (locked until the round is finished; stuck rounds show the answer after 15 s) so tapping Next repeatedly can't skip games.
- DONE: spoken how-to-play clips (`sounds/help-<screen>.mp3`), approved by Mason's ears on 2026-10-19.
- DONE: home is one big Play button (he can't choose between 10 games); games rotate in a fixed order; list under "More games".
  Next idea: pick the next game from the adaptive data, and spoken/picture labels for pre-readers.
- Sticker-book / garden progress world filled by effort, not score. Visible, never lost.
- DONE: "All done for today" ending after a short session (15/30/45 finished rounds, grown-up setting; Finish returns to the menu,
  a small "grown-up says: a little more" adds 4 rounds). No autoplay of another round. Needs watching with him.
- Friendlier parent view: sound names with example words and a one-line "try this together" suggestion.
- A character who reacts (optional, only if it stays light).

## Phase 3 — Reading   (gate: he reads a short story on his own)
- More decodable stories using only sounds he has learned; unlock by sounds, not by time.
- Read-together mode: child reads the words he can sound out, parent reads the rest.
- Printable story and word-list pages to take learning off the screen.
- Real-book bridge as prompts only ("find these words in a library book"). Do not reproduce copyrighted books.

## Phase 4 — Polish
- Syllable games, stroke-order tracing.
- Licensing check (ElevenLabs terms for the plan used; credit list; ASL set is public domain).
- Home Screen install polish.

## Barriers to keep in mind
- Audio quality can only be judged by the owner's ears.
- Little testing with real children so far. Most app research is with struggling readers; treat design as a hypothesis.
- One file keeps growing (see Phase 1).
- Safari may clear saved data.
- Engagement tricks that backfire (see Principle).
- Speech recognition sends audio to Apple when on; keep it opt-in.

## Open questions for Mason
- Son's age and current level (sets where adaptive practice starts).
- Family only, or might it be shared (changes licensing and polish needs)?
- Progress only on his device, or movable between devices?
- Sticker-book world first, or more stories first?

## Done recently
- Two children ("Who's playing?"), separate progress/backup/level/session length, Play order per child (2026-10-20).
- Stricter Next, softer miss handling, 15/30/45-round sessions (2026-10-20).
