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
