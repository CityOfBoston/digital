import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import DescriptionBox from './DescriptionBox';

storiesOf('DescriptionBox', module)
  .addDecorator(next => (
    <div className="b-c" style={{ background: 'white' }}>
      {next()}
    </div>
  ))
  .add('Empty', () => (
    <DescriptionBox
      placeholder="How can we help?"
      text=""
      onInput={action('input')}
      minHeight={100}
      maxHeight={300}
      setTextarea={() => {}}
    />
  ))
  .add('Initial Text', () => (
    <DescriptionBox
      placeholder="How can we help?"
      text="We’re going to beat Galactus on the moon, Tippy. We’re going to punch that big ape on the moon until he goes down, and then I’m going to stand on top of him and take a selfie."
      onInput={action('input')}
      minHeight={100}
      maxHeight={300}
      setTextarea={() => {}}
    />
  ));
