import React from 'react';
import { storiesOf } from '@storybook/react';
import Checkbox from './Checkbox';

storiesOf('Checkbox', module).add('default', () => (
  <Checkbox
    name="BC"
    type="checkbox"
    title=""
    className="cb-f"
    onChange=""
    onBlur=""
    value=""
  />
));
