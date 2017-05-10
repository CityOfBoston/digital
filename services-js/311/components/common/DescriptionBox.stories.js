// @flow
import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import DescriptionBox from './DescriptionBox';

storiesOf('DescriptionBox', module)
  .addDecorator((next) => (
    <div style={{ width: 800, padding: 80 }}>{next()}</div>
  ))
  .add('Empty', () => (
    <DescriptionBox
      placeholder="How can we help?"
      text=""
      onInput={action('input')}
      minHeight={100}
      maxHeight={300}
      setTextarea={action('setTextarea')}
    />
  ))
  .add('Initial Text', () => (
    <DescriptionBox
      placeholder="How can we help?"
      text="We’re going to beat Galactus on the moon, Tippy. We’re going to punch that big ape on the moon until he goes down, and then I’m going to stand on top of him and take a selfie."
      onInput={action('input')}
      minHeight={100}
      maxHeight={300}
      setTextarea={action('setTextarea')}
    />
  ));
