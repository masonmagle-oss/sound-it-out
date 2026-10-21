/* Data for Word parts: endings (base + ending = word) and contractions (two words = one short word).
   Also read by tools/generate-clips.js and tools/missing-clips.js to know which recordings are needed. */
window.WORDPLAY_PARTS = {
  ends: ['ful', 'less', 'ly', 'ness'],
  endings: [
    { word: 'helpful', base: 'help', end: 'ful' }, { word: 'careful', base: 'care', end: 'ful' },
    { word: 'hopeless', base: 'hope', end: 'less' }, { word: 'sleepless', base: 'sleep', end: 'less' },
    { word: 'sadly', base: 'sad', end: 'ly' }, { word: 'quickly', base: 'quick', end: 'ly' }, { word: 'slowly', base: 'slow', end: 'ly' },
    { word: 'kindness', base: 'kind', end: 'ness' }
  ],
  contractions: [
    { c: "don't", a: 'do', b: 'not' }, { c: "can't", a: 'can', b: 'not' }, { c: "isn't", a: 'is', b: 'not' },
    { c: "I'm", a: 'I', b: 'am' }, { c: "it's", a: 'it', b: 'is' }, { c: "they're", a: 'they', b: 'are' }
  ]
};
