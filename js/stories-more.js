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
    'The Red Hen': q('Who came to the nest?', 0, ['svg:art-fox', 'fox'], ['svg:art-dog', 'dog'], ['svg:art-pig', 'pig']),
    'Pig in the Mud': q('What did the pig get in?', 0, ['svg:art-tub', 'tub'], ['svg:art-bus', 'bus'], ['svg:art-bed', 'bed']),
    'The Big Bus': q('What is red?', 0, ['svg:art-bus', 'bus'], ['svg:art-dog', 'dog'], ['svg:art-cave', 'hill']),
    'Cat and Dog': q('Who ran up the tree?', 0, ['svg:art-cat', 'cat'], ['svg:art-dog', 'dog'], ['svg:art-pig', 'pig']),
    'The Frog': q('Who can swim?', 0, ['svg:art-frog', 'frog'], ['svg:art-cat', 'cat'], ['svg:art-bus', 'bus']),
    'A Day at the Park': q('Where did we go?', 0, ['svg:art-park', 'park'], ['svg:art-farm', 'farm'], ['svg:art-shop2', 'shop']),
    'The Sun and Rain': q('What did we see?', 0, ['svg:art-rainbow', 'rainbow'], ['svg:art-bus', 'bus'], ['svg:art-dog', 'dog']),
    'The Fish': q('Where does the fish swim?', 0, ['svg:art-sea', 'sea'], ['svg:art-bed', 'bed'], ['svg:art-tree', 'tree']),
    'At the Farm': q('What do the sheep eat?', 0, ['svg:art-seed', 'grass'], ['svg:art-fish', 'fish'], ['svg:art-milk', 'milk']),
    'Bedtime': q('What is up?', 0, ['svg:art-moon', 'moon'], ['svg:art-sun', 'sun'], ['svg:art-bus', 'bus']),
    'The Little Bug': q('What flew away?', 0, ['svg:art-bug', 'bug'], ['svg:art-fish', 'fish'], ['svg:art-frog', 'frog']),
    'My Dog Max': q('Who can run and jump?', 0, ['svg:art-dog', 'dog'], ['svg:art-fish', 'fish'], ['svg:art-cat', 'cat'])
  };
  C.stories.forEach(s => { if (asks[s.title]) s.q = [asks[s.title]]; });

  // ---- new stories ----
  add(1, 'svg:art-my-dog-can-sit', 'Max in the Mud', ['Max is a big dog.', 'Max can run and jump.', 'Max sat in the mud.', 'Mom said, come here, Max.'], q('Who sat in the mud?', 0, ['svg:art-dog', 'dog'], ['svg:art-pig', 'pig'], ['svg:art-hen', 'hen']));
  add(1, 'svg:art-hen', 'Hen and Pig', ['The hen is in the pen.', 'The pig is in the mud.', 'The pig can see the hen.', 'Run, hen, run!'], q('Who is in the pen?', 0, ['svg:art-hen', 'hen'], ['svg:art-pig', 'pig'], ['svg:art-dog', 'dog']));
  add(1, 'svg:art-bus', 'The Red Bus', ['A big red bus can go.', 'The bus can go up.', 'I can see you in the bus.', 'Go, bus, go!'], q('What can go up?', 0, ['svg:art-bus', 'bus'], ['svg:art-bed', 'bed'], ['svg:art-hat', 'hat']));
  add(2, 'svg:art-duck', 'Duck and Frog', ['A duck sat in a pond.', 'A frog came to the pond.', 'The frog said, can I swim?', 'They swim and splash!'], q('Who came to the pond?', 0, ['svg:art-frog', 'frog'], ['svg:art-duck', 'duck'], ['svg:art-fish', 'fish']));
  add(2, 'svg:art-shop2', 'At the Shop', ['Mom and I went to the shop.', 'We want milk.', 'Mom said yes.', 'We get milk and ran back.'], q('What did they want?', 0, ['svg:art-milk', 'milk'], ['svg:art-fish', 'fish'], ['svg:art-hat', 'hat']));
  add(3, 'svg:art-goat', 'The Goat on the Boat', ['A goat went on a boat.', 'The boat went up and down.', 'The goat did not like it.', 'The goat said, I want to go home.'], q('Where did the goat want to go?', 0, ['svg:art-house', 'home'], ['svg:art-sail', 'boat'], ['svg:art-tree', 'tree']));
  add(3, 'svg:art-snow', 'Snow Day', ['The snow came down.', 'Mom and I went out in the snow.', 'We can slide on the hill.', 'I like the snow.'], q('What came down?', 0, ['svg:art-snow', 'snow'], ['svg:art-rain', 'rain'], ['svg:art-sun', 'sun']));
  add(3, 'svg:art-kite', 'The Kite', ['I have a kite.', 'The kite can go up.', 'The wind blew the kite.', 'The kite is in the tree.'], q('Where is the kite?', 0, ['svg:art-tree', 'tree'], ['svg:art-bed', 'bed'], ['svg:art-cave', 'hill']));
  add(4, 'svg:art-storm', 'The Farm Storm', ['The cow is on the farm.', 'A storm came to the farm.', 'The cow ran to the barn.', 'The cow is not wet.'], q('What came to the farm?', 0, ['svg:art-storm', 'storm'], ['svg:art-sun', 'sun'], ['svg:art-bus', 'bus']));
  add(4, 'svg:art-horse', 'The Horse', ['A boy and a girl went to the farm.', 'They saw a brown horse.', 'The horse can run fast.', 'The girl gave the horse corn.'], q('What did the girl give the horse?', 0, ['svg:art-corn', 'corn'], ['svg:art-fish', 'fish'], ['svg:art-milk', 'milk']));
  add(4, 'svg:art-owl', 'The Owl', ['The owl sat in the tree.', 'The moon was up.', 'The owl saw a mouse.', 'The mouse ran to the house.'], q('What did the owl see?', 0, ['svg:art-mouse', 'mouse'], ['svg:art-bird', 'bird'], ['svg:art-fish', 'fish']));
  add(5, 'svg:art-beach', 'Night at the Beach', ['We went to the beach in the day.', 'We sat in the sun.', 'We ate a peach.', 'At night the moon was bright.'], q('What did we eat?', 0, ['svg:art-peach', 'peach'], ['svg:art-rice', 'rice'], ['svg:art-toast', 'toast']));
  add(5, 'svg:art-dog', 'The Happy Puppy', ['A puppy was in the street.', 'It was a happy puppy.', 'The puppy ran to a girl.', 'The girl gave the puppy food.'], q('Who ran to the girl?', 0, ['svg:art-dog', 'puppy'], ['svg:art-cat', 'cat'], ['svg:art-sheep', 'sheep']));
  add(6, 'svg:art-rainbow', 'The Rainbow', ['The rain and the sunshine came.', 'We were looking up.', 'Then we saw a rainbow.', 'I like the rainbow.'], q('What did we see?', 0, ['svg:art-rainbow', 'rainbow'], ['svg:art-snowman', 'snowman'], ['svg:art-jet', 'airplane']));
  add(6, 'svg:art-slide', 'The Playground', ['We went to the playground.', 'My brother is playing in the sandbox.', 'I am jumping on the slide.', 'Mom is helping us.'], q('Where did we go?', 0, ['svg:art-slide', 'playground'], ['svg:art-school', 'school'], ['svg:art-farm', 'farm']));
  add(7, 'svg:art-cats-on-the-bridge', 'Cats on the Bridge', ['Two cats came to a bridge.', 'The cats jumped on the bridge.', 'The air was cold.', 'The cats ran home to the chair.'], q('Where did the cats jump?', 0, ['svg:art-bridge', 'bridge'], ['svg:art-chair', 'chair'], ['svg:art-box', 'box']));
  add(7, 'svg:art-paint', 'The Painted Chair', ['Mom painted a chair.', 'It was a new chair.', 'The cats sat on the chair.', 'Mom said, share the chair!'], q('What did Mom paint?', 0, ['svg:art-chair', 'chair'], ['svg:art-box', 'box'], ['svg:art-bus', 'bus']));
})();
