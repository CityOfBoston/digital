import React from 'react';
import { storiesOf } from '@storybook/react';
import Nav from './Nav';

storiesOf('Nav', module).add('request selected', () => (
  <Nav activeSection="request" />
));
