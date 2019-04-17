import React from 'react';
import { storiesOf } from '@storybook/react';

import SelectDropdown from './SelectDropdown';

storiesOf('Form Elements|SelectDropdown', module)
  .add('default', () => (
    <>
      <SelectDropdown
        label="Default Dropdown"
        options={['Apples', 'Oranges', 'Pears']}
      />

      <SelectDropdown
        label="Required Dropdown"
        required
        options={['Finch', 'Nuthatch', 'Sparrow']}
      />

      <SelectDropdown
        label="Dropdown With Error"
        required
        error={true}
        defaultValue="Pac-Man"
        options={['Pac-Man', 'Q-Bert', 'Tetris']}
      />
    </>
  ))
  .add('small', () => (
    <SelectDropdown
      small
      hideBlankOption
      label="Small Dropdown"
      options={['Ash', 'Maple', 'Willow']}
    />
  ));
