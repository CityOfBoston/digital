import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withKnobs, array, boolean, text } from '@storybook/addon-knobs';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import SelectDropdown from './SelectDropdown';

storiesOf('Form Elements|SelectDropdown', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .addDecorator(withKnobs)
  .add('default', () => (
    <SelectDropdown
      label={text('Label text', 'Default Dropdown')}
      options={array('Options', ['Apples', 'Oranges', 'Pears'])}
      onChange={action('Item selected')}
      hideBlankOption={boolean('Hide blank option', false)}
      required={boolean('Required', false)}
      disabled={boolean('Disabled', false)}
      error={boolean('Error', false)}
    />
  ));

storiesOf('Form Elements|SelectDropdown', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)

  .add('variants', () => (
    <>
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

      <br />

      <SelectDropdown
        small
        hideBlankOption
        label="Small Dropdown"
        options={['Ash', 'Maple', 'Willow']}
      />
    </>
  ));
