import React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from './Checkbox';

storiesOf('Elements/Inputs', module).add('Checkbox', () => (
  <Checkbox
    name="checkbox"
    title="Community Preservation Committee"
    value="checkbox"
    onChange={() => {}}
    onBlur={() => {}}
    checked={true}
  />
));
