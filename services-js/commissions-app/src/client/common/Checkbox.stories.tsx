import React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from './Checkbox';

storiesOf('Checkbox', module).add('default', () => (
  <Checkbox name="checkbox" title="" value="checkbox" onChange="" onBlur="" />
));
