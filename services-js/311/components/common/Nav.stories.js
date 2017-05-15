// @flow

import React from 'react';
import { storiesOf } from '@kadira/storybook';
import Nav from './Nav';

storiesOf('Nav', module)
  .add('request selected', () => (
    <Nav activeSection="request" />
  ));
