# Curriculum audit (Pre-K to grade 3)

Measured with `node tools/audit-curriculum.js` against a reference I wrote from general knowledge of Letters and Sounds, UFLI and Common Core RF.K-3. It is not an official list, and the counts are spelling-based heuristics (for example "plural -s" also counts bus and this). Use it to find gaps, not to prove coverage. Date: 2026-10-20.

## Scope
Phonics decoding is mostly finished by the end of grade 2. Grade 3 is morphology (prefixes, suffixes, roots), vocabulary and comprehension. So Pre-K to grade 3 is the right span; going higher would be a different app.

## What is in
- 411 decodable words in 7 levels, 219 sight words, 26 letters, 70 sentences, 12 stories (4 lines each), 12 games, 842 clips.
- Sight words: Dolch pre-primer and primer 100%; grades 1-3 about 99% (missing "giving", "don't").
- Pre-K / K: letter names and sounds, CVC, digraphs, floss words, ending blends, initial blends, silent e, first/last sound, rhyme, blending, tracing.
- Grade 1: vowel teams (ai ay ee ea oa ow oo igh), r-controlled (ar or er ir ur), diphthongs (ou ow oi oy), aw, soft c/g, tch, dge, silent letters, -ed, -ing, compounds.

## Gaps, ranked
1. **Stories are not fully decodable.** Words not in any word list: sat, mat, hill, pond, splash, mom, sits, bench, grass, fun, swims, wind, blew, bye, max (stories); brother, note, took, school, friend, time, rise, morning (sentences). Fix first: either teach those words or rewrite the lines. This breaks the app's own promise ("sounds he knows").
2. **No syllable work.** 333 of 411 decodable words are one syllable, 73 two, 5 three. No VC/CV, open/closed, or -le words (table, little). Grade 2 needs this.
3. **Grade 2 morphology is missing:** -ful, -less, -ness, -ment, -ly (only fly-type words), doubling rule (running, hopped), -es/-ies (3 words), -er/-est (thin).
4. **Missing or near-empty spellings:** ie, ey, oe, ough/augh, ph (2 words), -ure, -eer, ore, gn. Floss rule (ff/ss/zz) only 5 words, all compounds. -nk 6 words.
5. **Level balance:** L3 has 17 words and L4 has 10, then L5 has 184. Splitting L5 into 4-5 steps would make progress smoother.
6. **Grade 3 morphology:** dis-, mis-, non-, -able, -ible, -ous, -ive, -sion, roots. None yet.
7. **Contractions:** none in words or sentences (don't, I'm, it's).
8. **Skills the games do not train:** phoneme deletion/substitution (say "cat" without /k/), syllable counting and splitting, comprehension questions after a story, dictation, uppercase/lowercase matching, fluency (re-reading, word-per-minute-free), vocabulary meanings.

## Suggested order
1. Fix story decodability (small, fixes a promise).
2. Rebalance and expand L3, L4, then split L5 (words plus clips).
3. Add syllable games and -le / 2-3 syllable words.
4. Add morphology (suffixes, then prefixes) as its own level.
5. Add comprehension questions to stories; add a few new longer stories per level.
6. Placement check so each child starts at the right level.

Every new word needs a clip (see WORKFLOWS, "Make or fix sounds"), approved by ear.

## Caveats
- The reference list is mine, so a teacher or the UFLI / Letters and Sounds documents should be checked before spending recording credits.
- Counts are by spelling, so words that sound different (ow in cow vs snow) are not separated.
- No child testing has been done; his real gaps may differ.

## Compared with the research (what the app follows and where it differs)
Sources: Ehri et al. 2001 (National Reading Panel meta-analysis), Rehfeld et al. 2022 (phonemic awareness meta-analysis), Verhoeven et al. 2020 (computer-supported early literacy meta-analysis), and the picture-with-word studies (Solman 1992, Harzem 1976, Kennedy 2023 review). Found with one literature search each; not a full review. Bowers 2018 argues the phonics evidence is weaker than claimed, but the rebuttals (Buckingham 2020, Fletcher 2020) still support explicit phonics inside a broader programme.

Following:
- Systematic, explicit phonics in a set order, started early (the strongest effects were before grade 1).
- Blending and segmenting with the letters shown (graphemes in phonemic-awareness work).
- Real recorded phonemes, not text-to-speech letter names.
- Nonsense words, spelling (encoding) and letter tracing alongside reading.
- Short sessions, effort-only praise, and the next round never starting by itself.

Different, or open questions:
- **Picture and word together.** The picture-text studies mostly (about 65% of 37 experiments in the Kennedy review) found that a picture shown with a word can slow word learning, because children use the picture instead of the letters. The app mostly avoids this: Sound it out shows the picture only after the word is blended, and Which picture? gives no word audio until he answers. Silly words shows the picture, the written word and the spoken word together, so watch that one. Evidence is mixed, so treat it as a flag, not a fault.
- **Sight words are self-rated** ("Got it" / "Needs practice"), not tested. A grown-up or a quick check would be more reliable.
- **Little phoneme manipulation** (deleting or swapping sounds) and no syllable work.
- **No comprehension or vocabulary**; the research treats these as part of a full programme, not just phonics.
- **Apps alone** gave only a small average gain in the preschool/kindergarten meta-analysis (g about 0.28), and did better when part of a wider classroom programme. Co-play with a grown-up is the better use of this app.
- **Not found:** a search on app rewards and gamification hit a rate limit, so the "no streaks, scores or timers" stance rests on the project rules, not on evidence I checked.
