import React from 'react';

import { storiesOf } from '@storybook/react';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';

import { NarrowWrapper } from '@cityofboston/storybook-common';

import TextInput from './TextInput';

storiesOf('Form Elements|Inputs/TextInput', module)
  .addDecorator(withKnobs)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .add('default', () => (
    <TextInput
      label={text('Label text', 'Standard text input')}
      placeholder={text('Placeholder text', '')}
      small={boolean('Small variant', false)}
      required={boolean('Required', false)}
      disabled={boolean('Disabled', false)}
      error={boolean('Error', false)}
    />
  ));

storiesOf('Form Elements|Inputs/TextInput', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .add('variations', () => (
    <>
      <TextInput label="Required Input" required />

      <TextInput label="Placeholder text" placeholder="Placeholder Text" />

      <form>
        <TextInput
          label="Password"
          type="password"
          value="password"
          onChange={() => {}}
        />
      </form>

      <TextInput
        label={
          <>
            <span style={{ whiteSpace: 'nowrap', marginRight: '0.5em' }}>
              React node passed in as “label”
            </span>
            <wbr />
            <span style={{ fontSize: '80%', whiteSpace: 'nowrap' }}>
              instead of a string
            </span>
          </>
        }
      />

      <TextInput small label="Small Variant" placeholder="Placeholder Text" />
    </>
  ));

storiesOf('Form Elements|Inputs/TextInput', module)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .add('error', () => (
    <>
      <TextInput label="String error" error="Value is not correct" />

      <TextInput label="Boolean error" error />
    </>
  ));

storiesOf('Form Elements|Inputs/TextInput', module)
  .addDecorator(withKnobs)
  .addDecorator(story => <NarrowWrapper>{story()}</NarrowWrapper>)
  .add('w/Tool Tip: Short & Long', () => {
    return (
      <>
        <TextInput
          label={text('Label text', 'Standard text input')}
          placeholder={text('Placeholder text', '')}
          small={boolean('Small variant', false)}
          required={boolean('Required', false)}
          disabled={boolean('Disabled', false)}
          error={boolean('Error', false)}
          softRequired={true}
          toolTip={{
            icon: '?',
            msg: 'This information is collected.',
          }}
          // labelBelowInput={true}
          // optionalDescription={`Optional Description`}
        />

        <TextInput
          label={text('Label text', 'Standard text input')}
          placeholder={text('Placeholder text', '')}
          small={boolean('Small variant', false)}
          required={boolean('Required', false)}
          disabled={boolean('Disabled', false)}
          error={boolean('Error', false)}
          softRequired={true}
          toolTip={{
            icon: '?',
            msg:
              'Examples: Use your future spouse’s last name, use a two-part last name, or create a new last name.',
          }}
          labelBelowInput={true}
          // optionalDescription={`Optional Description`}
        />

        <TextInput
          label={text('Label text', 'Standard text input')}
          placeholder={text('Placeholder text', '')}
          small={boolean('Small variant', false)}
          required={boolean('Required', true)}
          disabled={boolean('Disabled', false)}
          error={boolean('Error', false)}
          toolTip={{
            icon: '?',
            msg:
              'Examples: Use your future spouse’s last name, use a two-part last name, or create a new last name.',
          }}
          // optionalDescription={`Optional Description`}
        />
      </>
    );
  })
  .add('interactive states', () => {
    return (
      <>
        <TextInput
          label={text(
            'Label text',
            'Default (non-active, unvalidated or required'
          )}
          placeholder={text('Placeholder text', '')}
          small={boolean('Small variant', false)}
          required={boolean('Required', false)}
          disabled={boolean('Disabled', false)}
          error={boolean('Error', false)}
        />

        <TextInput
          label={text('Label text', 'State - Focus - Click into field')}
          placeholder={text('Placeholder text', '')}
          small={boolean('Small variant', false)}
          required={boolean('Required', false)}
          disabled={boolean('Disabled', false)}
          error={boolean('Error', false)}
          focused={true}
        />

        <TextInput
          label={text('Label text', 'State - Required')}
          placeholder={text('Placeholder text', '')}
          small={boolean('Small variant', false)}
          required={boolean('Required', true)}
          disabled={boolean('Disabled', false)}
          error={boolean('Error', false)}
        />

        <TextInput
          label={text('Label text', 'State - Error')}
          placeholder={text('Placeholder text', '')}
          small={boolean('Small variant', false)}
          required={boolean('Required', true)}
          disabled={boolean('Disabled', false)}
          error={`Error Message ...`}
        />
      </>
    );
  });
