import React from 'react';
import { storiesOf } from '@storybook/react';

import Textarea from './Textarea';

storiesOf('Form Elements|Textarea', module)
  .add('visible label', () => (
    <>
      <Textarea
        name="comments"
        label="Other Comments"
        placeholder="Other Comments"
        value=""
        onChange={() => {}}
        onBlur={() => {}}
      />

      <Textarea
        name="comments"
        label="Small Variant"
        placeholder="Small Variant"
        value=""
        onChange={() => {}}
        onBlur={() => {}}
        small
      />
    </>
  ))
  .add('hidden label', () => (
    <>
      <Textarea
        name="comments"
        label="Other Comments"
        placeholder="Other Comments"
        value=""
        onChange={() => {}}
        onBlur={() => {}}
        hideLabel
      />

      <Textarea
        name="comments"
        label="Small Variant"
        placeholder="Small Variant"
        value=""
        onChange={() => {}}
        onBlur={() => {}}
        hideLabel
        small
      />
    </>
  ));
