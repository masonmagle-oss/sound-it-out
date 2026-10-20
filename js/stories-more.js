/* More decodable stories (one or two per level) and a comprehension question for every story.
   Loads right after content.js. A story's level is worked out from its words (see W.storyLevel in games.js),
   and `node tools/check-stories.js` fails if a story uses a word above its declared level.
   A question is { ask, pics: [[emoji, word], ...], ok: index of the right picture }. The question is read from
   sounds/question-<ask-words-with-dashes>.mp3 when that clip exists; the pictures play their word clips. */
(function () {
  'use strict';
  const C = window.WORDPLAY_CONTENT;
  if (!C) return;
  const q = (ask, ok, ...pics) => ({ ask, ok, pics });
  const add = (level, emoji, title, lines, question) => C.stories.push({ level, emoji, title, lines, q: [question] });

  // ---- questions for the stories that were already there ----
  const asks = {
    'The Red Hen': q('Who came to the nest?', 0, ['🦊', 'fox'], ['🐶', 'dog'], ['🐷', 'pig']),
    'Pig in the Mud': q('What did the pig get in?', 0, ['🛁', 'tub'], ['🚌', 'bus'], ['🛏️', 'bed']),
    'The Big Bus': q('What is red?', 0, ['🚌', 'bus'], ['🐶', 'dog'], ['⛰️', 'hill']),
    'Cat and Dog': q('Who ran up the tree?', 0, ['🐱', 'cat'], ['🐶', 'dog'], ['🐷', 'pig']),
    'The Frog': q('Who can swim?', 0, ['🐸', 'frog'], ['🐱', 'cat'], ['🚌', 'bus']),
    'A Day at the Park': q('Where did we go?', 0, ['🏞️', 'park'], ['🚜', 'farm'], ['🛒', 'shop']),
    'The Sun and Rain': q('What did we see?', 0, ['🌈', 'rainbow'], ['🚌', 'bus'], ['🐶', 'dog']),
    'The Fish': q('Where does the fish swim?', 0, ['🌊', 'sea'], ['🛏️', 'bed'], ['🌳', 'tree']),
    'At the Farm': q('What do the sheep eat?', 0, ['🌱', 'grass'], ['🐟', 'fish'], ['🥛', 'milk']),
    'Bedtime': q('What is up?', 0, ['🌙', 'moon'], ['☀️', 'sun'], ['🚌', 'bus']),
    'The Little Bug': q('What flew away?', 0, ['🐛', 'bug'], ['🐟', 'fish'], ['🐸', 'frog']),
    'My Dog Max': q('Who can run and jump?', 0, ['🐶', 'dog'], ['🐟', 'fish'], ['🐱', 'cat'])
  };
  C.stories.forEach(s => { if (asks[s.title]) s.q = [asks[s.title]]; });

  // ---- new stories ----
  add(1, '🐕', 'Max in the Mud', ['Max is a big dog.', 'Max can run and jump.', 'Max sat in the mud.', 'Mom said, come here, Max.'], q('Who sat in the mud?', 0, ['🐶', 'dog'], ['🐷', 'pig'], ['🐔', 'hen']));
  add(1, '🐔', 'Hen and Pig', ['The hen is in the pen.', 'The pig is in the mud.', 'The pig can see the hen.', 'Run, hen, run!'], q('Who is in the pen?', 0, ['🐔', 'hen'], ['🐷', 'pig'], ['🐶', 'dog']));
  add(1, '🚌', 'The Red Bus', ['A big red bus can go.', 'The bus can go up.', 'I can see you in the bus.', 'Go, bus, go!'], q('What can go up?', 0, ['🚌', 'bus'], ['🛏️', 'bed'], ['🎩', 'hat']));
  add(2, '🦆', 'Duck and Frog', ['A duck sat in a pond.', 'A frog came to the pond.', 'The frog said, can I swim?', 'They swim and splash!'], q('Who came to the pond?', 0, ['🐸', 'frog'], ['🦆', 'duck'], ['🐟', 'fish']));
  add(2, '🛒', 'At the Shop', ['Mom and I went to the shop.', 'We want milk.', 'Mom said yes.', 'We get milk and ran back.'], q('What did they want?', 0, ['🥛', 'milk'], ['🐟', 'fish'], ['🎩', 'hat']));
  add(3, '🐐', 'The Goat on the Boat', ['A goat went on a boat.', 'The boat went up and down.', 'The goat did not like it.', 'The goat said, I want to go home.'], q('Where did the goat want to go?', 0, ['🏠', 'home'], ['⛵', 'boat'], ['🌳', 'tree']));
  add(3, '❄️', 'Snow Day', ['The snow came down.', 'Mom and I went out in the snow.', 'We can slide on the hill.', 'I like the snow.'], q('What came down?', 0, ['❄️', 'snow'], ['🌧️', 'rain'], ['☀️', 'sun']));
  add(3, '🪁', 'The Kite', ['I have a kite.', 'The kite can go up.', 'The wind blew the kite.', 'The kite is in the tree.'], q('Where is the kite?', 0, ['🌳', 'tree'], ['🛏️', 'bed'], ['⛰️', 'hill']));
  add(4, '⛈️', 'The Farm Storm', ['The cow is on the farm.', 'A storm came to the farm.', 'The cow ran to the barn.', 'The cow is not wet.'], q('What came to the farm?', 0, ['⛈️', 'storm'], ['☀️', 'sun'], ['🚌', 'bus']));
  add(4, '🐴', 'The Horse', ['A boy and a girl went to the farm.', 'They saw a brown horse.', 'The horse can run fast.', 'The girl gave the horse corn.'], q('What did the girl give the horse?', 0, ['🌽', 'corn'], ['🐟', 'fish'], ['🥛', 'milk']));
  add(4, '🦉', 'The Owl', ['The owl sat in the tree.', 'The moon was up.', 'The owl saw a mouse.', 'The mouse ran to the house.'], q('What did the owl see?', 0, ['🐭', 'mouse'], ['🐦', 'bird'], ['🐟', 'fish']));
  add(5, '🏖️', 'Night at the Beach', ['We went to the beach in the day.', 'We sat in the sun.', 'We ate a peach.', 'At night the moon was bright.'], q('What did we eat?', 0, ['🍑', 'peach'], ['🍚', 'rice'], ['🍞', 'toast']));
  add(5, '🐶', 'The Happy Puppy', ['A puppy was in the street.', 'It was a happy puppy.', 'The puppy ran to a girl.', 'The girl gave the puppy food.'], q('Who ran to the girl?', 0, ['🐶', 'puppy'], ['🐱', 'cat'], ['🐑', 'sheep']));
  add(6, '🌈', 'The Rainbow', ['The rain and the sunshine came.', 'We were looking up.', 'Then we saw a rainbow.', 'I like the rainbow.'], q('What did we see?', 0, ['🌈', 'rainbow'], ['⛄', 'snowman'], ['✈️', 'airplane']));
  add(6, '🛝', 'The Playground', ['We went to the playground.', 'My brother is playing in the sandbox.', 'I am jumping on the slide.', 'Mom is helping us.'], q('Where did we go?', 0, ['🛝', 'playground'], ['🏫', 'school'], ['🚜', 'farm']));
  add(7, '🐈', 'Cats on the Bridge', ['Two cats came to a bridge.', 'The cats jumped on the bridge.', 'The air was cold.', 'The cats ran home to the chair.'], q('Where did the cats jump?', 0, ['🌉', 'bridge'], ['🪑', 'chair'], ['📦', 'box']));
  add(7, '🎨', 'The Painted Chair', ['Mom painted a chair.', 'It was a new chair.', 'The cats sat on the chair.', 'Mom said, share the chair!'], q('What did Mom paint?', 0, ['🪑', 'chair'], ['📦', 'box'], ['🚌', 'bus']));
})();
