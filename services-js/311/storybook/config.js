import { configure } from '@kadira/storybook';

const storiesContext = require.context('../components', true, /.stories.js$/);

function loadStories() {
  storiesContext.keys().forEach((filename) => storiesContext(filename));
}

configure(loadStories, module);
