# Checklist for Mason (what still needs you)

Written 2026-10-20 at the end of the audit session. Everything Claude could finish without new recordings, new pictures or your ears is done and tested. Everything below needs a person.

## 1. Decisions
- [ ] **Merge to `main`?** The local branch `release` holds the offline support, the audit work, the story-word fix, the L3/L4 rebalance and the new "Clap the parts" game, all tested together. Nothing is pushed. Say "merge" and Claude pushes it (Pages updates in about a minute).
- [ ] **His age and current level** (still unknown). It decides what to build first: under about 5, the current content is already a lot; 6 to 7, the grade-2 work in section 5 matters most.
- [ ] **Which reference to follow:** UK Letters and Sounds, UFLI, or US Common Core. The audit reference is Claude's own list.
- [ ] **Which new-word groups to record** (section 2). Suggested order: floss words, then -nk, then silent-e, then ie/ey, then the rest.
- [ ] **Level split:** the 124 words left in L5 could become 2-3 levels. It means renumbering levels 6-7 and migrating saved child levels. Worth doing only if L5 feels too big when you watch him.

## 2. Sounds to record (your ears approve each)
Full table with pictures and exact file names: [NEW-WORDS-TO-RECORD.md](NEW-WORDS-TO-RECORD.md) (regenerate with `node tools/new-words.js`).
- [ ] **101 clips for the new stories, questions and Word meanings prompts** (exact words to say): [CLIPS-TO-RECORD.md](CLIPS-TO-RECORD.md). Until they exist the text still shows and the pictures still play their word clips; only the story line and question audio is silent. The 4 clips of each new story matter most (he reads along and taps lines to hear them).
- [ ] 37 new word clips, in 8 groups: ie/ey (5), floss ff/ss/zz (7), -nk and blends (3), silent-e (4), -le words (5), doubling (4), endings -ful/-less/-ly/-ness (5), contractions (5).
- [ ] 7 new sound clips: dle, tle, le, ful, less, ly, ness.
- [ ] Word clips for the parts of the ending words that do not exist yet: care, hope, sad, and the contraction clips (don't, can't, I'm, it's, isn't).
- [ ] Optional later: rewrite the 4 sentences that use words he has not learned by sound (brother, school, friend, morning). Each rewritten sentence or story line needs its own new clip (clips are named after the exact words).

- [ ] **Listen to the machine-chosen clips** (chosen by length, not by ear): the sounds `dle`, `tle`, `le`, `ful`, `less`, `ly`, `ness` (the sound clips are the riskiest: the transcript heard Dell, Tell, Fall, Los, Nurse), and `word-theyre` (heard as "there", which sounds the same). Tell Claude which to regenerate.

## 3. Pictures
Pictures are emoji in `js/content.js`, so they need no files, only your OK.
- [ ] **Existing words with no picture** (so they are skipped in the picture games): gum, lid, rug, much, thin, whip. Suggest 🍬 (gum), a lid, a rug, and so on; some have no good emoji, in which case leave them for Sound it out only.
- [ ] **23 words added this session have no picture** and are sight-type entries: sat, mat, fun, max, sits, mom, hill, pond, bench, wind, grass, swims, blew, bye, took, note, time, rise, splash, brother, school, friend, morning. The simple ones (sat, mat, hill, pond, bench, wind, grass, swims, sits, fun, max, splash) should become real sound words with pictures when you pick pictures for them.
- [ ] **Pictures shared by different words** can confuse the picture games. Most worth fixing: big/trunk (🐘), fox/tail (🦊), sit/chair (🪑), cot/resting (🛌), thumb/good (👍), sock/pair (🧦), sheep/lamb (🐑), snake/long (🐍), arm/try (💪), tight/short (🤏), smile/nice (😊), out/gate (🚪), leg/knee, log/wood, mop/broom, lip/mouth, day/sunshine, tray/food, coin/cent/penny. (Same-word families like jump/jumped/jumper are fine.)
- [ ] **Pictures proposed for the 37 new words** are in the NEW-WORDS file; approve or change them. The ending words and contractions have no pictures by design.

## 4. Things only your ears and eyes can check
- [ ] The **trimmed clips** noted in `docs/ROADMAP.md` as never heard by Claude.
- [ ] **Offline on a real iPhone:** open the live page once with internet, wait for "Ready" on the For grown-ups page (about 25 MB), then airplane mode, open from the Home Screen. Sounds must play. Safari may clear the saved copy when storage is low.
- [ ] **Watch him for ten minutes** on the newest parts: Clap the parts (is 1 to 3 the right range, is it fun?), Silly words, and Trace letters. Note where he stalls or quits.
- [ ] **Silly words** shows the picture, the written word and the spoken word together. The research says pictures beside words can pull attention from the letters. Watch whether he reads the word or just looks at the picture.
- [ ] **Sight words** are self-rated ("Got it" / "Needs practice"). A grown-up should check a few by asking him to read them.

## 5. Code work Claude can do once the above exists
- [ ] **After the new-word clips are in `sounds/`:** run `node tools/add-recorded-words.js` (adds every word whose clips exist to the word list), then `node tools/make-precache.js` and `node tools/test.js`. Words with no picture (endings, contractions) are skipped by that tool.
- [ ] Display for two-syllable words and -le endings (needs the recordings above).
- [ ] Split L5 into levels and migrate saved levels (decision in section 1).
- [ ] Sound-manipulation game (say "cat" without /k/): needs new recordings.
- [ ] More stories per level (each new story = 4 lines + 1 question to record; `node tools/check-stories.js` checks the words).
- [ ] Uppercase/lowercase matching.
- [ ] Put Word meanings and Write it into the mixed Play session (they are in More games for now).
- [ ] Re-run `node tools/audit-curriculum.js` after each change and `node tools/make-precache.js` before each commit.

## 6. Done this session
- Offline support (service worker, delta updates, Home Screen icon, grown-ups status panel) with tests.
- Curriculum audit and research comparison: [CURRICULUM-AUDIT.md](CURRICULUM-AUDIT.md).
- Every story and sentence word is now in the word list (23 words added, no new recordings).
- 60 words moved to better levels: L3 17 to 37 words, L4 10 to 50 words, L5 184 to 124 (new sounds per level unchanged).
- New game mode "Clap the parts" in Sound detective (1 to 3 beats, uses existing word clips).
- 37-word recording proposal with pictures and exact clips needed.

- 17 new decodable stories (levels 1 to 7) and a picture question after every story (29 stories); stories are listed by level and follow the grown-up's level; `node tools/check-stories.js` fails on any word above a story's level.
- Word meanings (Which one is an animal? / Opposites), Write it (dictation from the word clips) and a Find his level reading check on the grown-ups page, all tested.
- `tools/add-recorded-words.js`: finishing the phonics gaps is one command once the recordings are in.

- Word parts game (endings -ful/-less/-ly/-ness and contractions), 20 new clips generated and installed with ElevenLabs; 21+6 new words, the -le words and 66+27+8 story, question and prompt clips installed from your picks.

## 7. Branches (all local, nothing pushed)
- `main`: what is live now.
- `offline`: offline support only.
- `audit`: audit, word fixes, rebalance, Clap the parts (built off `main`, so it lacks offline).
- `release`: `offline` + `audit` merged and tested (full suite, offline checks, phone build).
- `finish`: `release` plus the stories, questions, Word meanings, Write it, Find his level and recording tools. **This is the one to merge.**
