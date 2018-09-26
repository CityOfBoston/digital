import React from 'react';
import { storiesOf } from '@storybook/react';

import Radio, { RadioGroup } from './Radio';

const radioGroup = [
  {
    labelText: 'Cosmos',
    value: 'cosmos'
  },
  {
    labelText: 'Foxglove',
    value: 'foxglove'
  },
  {
    labelText: 'Zinnia',
    value: 'zinnia'
  }
];

storiesOf('Form Elements/Inputs/Radio', module)
  .add('Input Element', () => (
    <Radio
      name="single"
      labelText="Single Option"
    />
  ))
  .add('Radio Group', () => (
    <RadioGroup
      items={radioGroup}
      name="favorite-flower"
      handleChange={() => {}}
    />
  ));
