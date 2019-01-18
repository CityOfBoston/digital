import path from 'path';
import initStoryshots from '@storybook/addon-storyshots';

require('babel-plugin-require-context-hook/register')();

initStoryshots({ configPath: path.resolve(__dirname, '../.storybook') });
