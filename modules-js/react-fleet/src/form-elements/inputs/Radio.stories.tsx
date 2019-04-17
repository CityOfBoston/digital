import React from 'react';
import { storiesOf } from '@storybook/react';

import Radio, { RadioGroup } from './Radio';

const radioGroup = [
  {
    label: 'Cosmos',
    value: 'cosmos',
  },
  {
    label: 'Foxglove',
    value: 'foxglove',
  },
  {
    label: 'Zinnia',
    value: 'zinnia',
  },
];

const radioGroupAltLabels = [
  {
    label: <h2 className="m-l200">Morning</h2>,
    value: 'morning',
  },
  {
    label: <h2 className="m-l200">Afternoon</h2>,
    value: 'afternoon',
  },
  {
    label: <h2 className="m-l200">Evening</h2>,
    value: 'evening',
  },
];

storiesOf('Form Elements|Inputs/Radio', module)
  .add('Input Element', () => (
    <Radio name="single" value="single" label="Single Option" />
  ))
  .add('Radio Group', () => (
    <RadioGroup
      items={radioGroup}
      name="favorite-flower"
      groupLabel="Favorite Flower"
    />
  ))
  .add('Radio Group, Hidden Group Label', () => (
    <RadioGroup
      items={radioGroup}
      name="favorite-flower"
      groupLabel="Favorite Flower"
      hideLabel
    />
  ))
  .add('Radio Group, Labels as Markup', () => (
    <RadioGroup
      items={radioGroupAltLabels}
      name="time-of-day"
      groupLabel="Time of Day"
    />
  ));
