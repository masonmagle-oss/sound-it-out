/* Data for Word parts: endings (base + ending = word) and contractions (two words = one short word).
   Also read by tools/generate-clips.js and tools/missing-clips.js to know which recordings are needed. */
window.WORDPLAY_PARTS = {
  ends: ['ful', 'less', 'ly', 'ness', 'er', 'est', 'ment', 'able'],
  prefixes: ['un', 're', 'dis', 'mis'],
  endings: [
    { word: 'helpful', base: 'help', end: 'ful' }, { word: 'careful', base: 'care', end: 'ful' },
    { word: 'hopeless', base: 'hope', end: 'less' }, { word: 'sleepless', base: 'sleep', end: 'less' },
    { word: 'sadly', base: 'sad', end: 'ly' }, { word: 'quickly', base: 'quick', end: 'ly' }, { word: 'slowly', base: 'slow', end: 'ly' },
    { word: 'kindness', base: 'kind', end: 'ness' },
    { word: 'taller', base: 'tall', end: 'er' }, { word: 'tallest', base: 'tall', end: 'est' }, { word: 'faster', base: 'fast', end: 'er' }, { word: 'fastest', base: 'fast', end: 'est' },
    { word: 'slower', base: 'slow', end: 'er' }, { word: 'colder', base: 'cold', end: 'er' }, { word: 'longest', base: 'long', end: 'est' },
    { word: 'playful', base: 'play', end: 'ful' }, { word: 'joyful', base: 'joy', end: 'ful' }, { word: 'thankful', base: 'thank', end: 'ful' },
    { word: 'helpless', base: 'help', end: 'less' }, { word: 'careless', base: 'care', end: 'less' }, { word: 'homeless', base: 'home', end: 'less' },
    { word: 'sadness', base: 'sad', end: 'ness' }, { word: 'gladly', base: 'glad', end: 'ly' }, { word: 'softly', base: 'soft', end: 'ly' }, { word: 'loudly', base: 'loud', end: 'ly' },
    { word: 'payment', base: 'pay', end: 'ment' }, { word: 'movement', base: 'move', end: 'ment' }, { word: 'washable', base: 'wash', end: 'able' }, { word: 'readable', base: 'read', end: 'able' }
  ],
  prefixed: [
    { word: 'unhappy', pre: 'un', base: 'happy' }, { word: 'unkind', pre: 'un', base: 'kind' }, { word: 'unfair', pre: 'un', base: 'fair' }, { word: 'undo', pre: 'un', base: 'do' },
    { word: 'redo', pre: 're', base: 'do' }, { word: 'replay', pre: 're', base: 'play' }, { word: 'rerun', pre: 're', base: 'run' },
    { word: 'dislike', pre: 'dis', base: 'like' }, { word: 'disagree', pre: 'dis', base: 'agree' }, { word: 'misspell', pre: 'mis', base: 'spell' },
    { word: 'untie', pre: 'un', base: 'tie' }, { word: 'unwrap', pre: 'un', base: 'wrap' }, { word: 'rewrite', pre: 're', base: 'write' }, { word: 'reread', pre: 're', base: 'read' }, { word: 'retell', pre: 're', base: 'tell' }
  ],
  contractions: [
    { c: "don't", a: 'do', b: 'not' }, { c: "can't", a: 'can', b: 'not' }, { c: "isn't", a: 'is', b: 'not' },
    { c: "I'm", a: 'I', b: 'am' }, { c: "it's", a: 'it', b: 'is' }, { c: "they're", a: 'they', b: 'are' }
  ]
};
