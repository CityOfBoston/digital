import initStoryshots, {
  snapshotWithOptions,
} from '@storybook/addon-storyshots';

require('babel-plugin-require-context-hook/register')();

function createNodeMock(element) {
  return document.createElement(element.type);
}

initStoryshots({
  configPath: __dirname,
  test: snapshotWithOptions({
    createNodeMock,
  }),
});
