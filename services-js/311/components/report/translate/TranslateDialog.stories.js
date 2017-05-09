// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import TranslateDialog from './TranslateDialog';

storiesOf('TranslateDialog', module)
  .add('loading', () => (
    <TranslateDialog />
  ));
