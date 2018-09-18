import React from 'react';
import { storiesOf } from '@storybook/react';

import Textarea from './Textarea';

storiesOf('Elements/Inputs/Textarea', module)
  .add('visible label', () => (
    <React.Fragment>
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
        variant="small"
      />
    </React.Fragment>
  ))
  .add('hidden label', () => (
    <React.Fragment>
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
        variant="small"
      />
    </React.Fragment>
  ));
