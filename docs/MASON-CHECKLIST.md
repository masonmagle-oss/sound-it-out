# Checklist for Mason (what is still open)

Updated 2026-10-20 at the end of the big sweep. Most of the earlier list is done. What is left needs a person.

## 1. Verify (your ears and eyes)
- [ ] **New sounds** `ment` ("payment") and `able` ("washable"), plus the words `loudly`, `washable`, `alphabet`: open `_new-clips/verify.html` (rebuild with `node tools/make-verify.js ment able word-loudly word-washable word-alphabet`). `ment` is only 0.26 s long and the transcript heard nothing, so it is the most likely to be wrong.
- [ ] **The ten drawn pictures** (chip, cot, jug, mop, gum, lid, rug, whip, tail, chin; `js/pics.js`). Do they say the word to your children? Say which to redraw. Words with no good picture (try, much, thin, food) stay text-only on purpose.
- [ ] **Short vowels `u` and `a`** (0.11 s and 0.15 s): fine, or regenerate?
- [ ] **On the iPhone:** open once with internet, wait for "Ready" under For grown-ups, then airplane mode. Watch one session with him (Clap the parts, Word parts, Big and little letters, Write it).

## 2. Decisions
- [ ] **His age and level** (still unknown). Decides what to build next.
- [ ] **Which reference list to follow** (UK Letters and Sounds, UFLI, US Common Core). The audit uses Claude's own list.
- [ ] **Sight words are self-rated** ("Got it"): want a grown-up check mode?

## 3. Still thin or missing (needs recordings, then one command each)
- ie (7 words), ph (4), ey (4): only a handful each; oe has 2 (shoe, canoe).
- Grade 3: -ous, -ive, -ible, -sion, roots: only the Word parts game touches morphology.
- No comprehension questions beyond one per story; no vocabulary beyond categories and opposites.
- Phoneme deletion and swapping ("say cat without /k/"), syllable splitting, dictation of whole sentences.
- More stories per level (each story = 4 lines + 1 question to record; `node tools/check-stories.js`).
- Add new words: put them in `tools/new-words-more2.js`-style rows, `node tools/generate-clips.js`, listen, `node tools/install-clips.js results.json`, `node tools/add-recorded-words.js`, `node tools/make-precache.js`, `node tools/test.js`.

## 4. Done (for reference)
- Offline support; audit and research comparison ([CURRICULUM-AUDIT.md](CURRICULUM-AUDIT.md)); 29 stories with questions; Word meanings; Write it; Find his level; Clap the parts; Word parts (endings, beginnings, contractions); Big and little letters.
- 488+ sound-it-out words and 253 sight words; every story word is in the list.
- Sounds levelled, `m` and `n` shortened, and the doubled-take bug fixed ([SOUND-ANALYSIS.md](SOUND-ANALYSIS.md), [CLIP-TRANSCRIPT-CHECK.md](CLIP-TRANSCRIPT-CHECK.md)).
- Picture review done; 47 pictures changed, ten drawn pictures added.
- New games are part of the mixed Play session.

## 5. Tools (all local; the ElevenLabs key lives in `.env.local`, never in git)
`generate-clips.js` (make takes), `make-verify.js` / `make-variants.js` / `picture-review.js` (vote pages), `install-clips.js`, `apply-pictures.js`, `add-recorded-words.js`, `analyze-sounds.js`, `check-clips-stt.js`, `check-stories.js`, `audit-curriculum.js`, `make-precache.js`.
